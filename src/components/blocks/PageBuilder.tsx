'use client';

import { useState, useEffect } from 'react';
import { Block, PageBlocks } from '@/types/blocks';
import BlockRenderer from './BlockRenderer';

interface PageBuilderProps {
  pageId: string;
  siteId: string;
  pageType: 'home' | 'about' | 'article' | 'custom';
  isEditing?: boolean;
  onSave?: (blocks: Block[]) => void;
}

export default function PageBuilder({
  pageId,
  siteId,
  pageType,
  isEditing = false,
  onSave
}: PageBuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load blocks from API
  useEffect(() => {
    async function loadBlocks() {
      try {
        const response = await fetch(`/api/blocks?pageId=${pageId}&siteId=${siteId}`);
        if (response.ok) {
          const data = await response.json();
          setBlocks(data.blocks || []);
        }
      } catch (error) {
        console.error('Error loading blocks:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBlocks();
  }, [pageId, siteId]);

  const handleBlockEdit = (updatedBlock: Block) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
  };

  const handleBlockDelete = (blockId: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
  };

  const handleBlockMove = (blockId: string, direction: 'up' | 'down') => {
    setBlocks(prevBlocks => {
      const currentIndex = prevBlocks.findIndex(block => block.id === blockId);
      if (currentIndex === -1) return prevBlocks;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prevBlocks.length) return prevBlocks;

      const newBlocks = [...prevBlocks];
      const [movedBlock] = newBlocks.splice(currentIndex, 1);
      newBlocks.splice(newIndex, 0, movedBlock);

      // Update positions
      return newBlocks.map((block, index) => ({
        ...block,
        position: index
      }));
    });
  };

  const handleAddBlock = (blockType: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: blockType,
      position: blocks.length,
      visible: true,
      settings: getDefaultSettings(blockType)
    } as Block;

    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(blocks);
    } catch (error) {
      console.error('Error saving blocks:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Sort blocks by position
  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-8">
      {/* Block List */}
      {sortedBlocks.map(block => (
        <BlockRenderer
          key={block.id}
          block={block}
          isEditing={isEditing}
          onEdit={handleBlockEdit}
          onDelete={handleBlockDelete}
          onMove={handleBlockMove}
        />
      ))}

      {/* Add Block Toolbar (only in editing mode) */}
      {isEditing && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 flex items-center gap-3 z-50">
          <span className="text-sm font-medium text-gray-700">Add Block:</span>
          
          <select 
            onChange={(e) => {
              if (e.target.value) {
                handleAddBlock(e.target.value);
                e.target.value = '';
              }
            }}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">Select block type...</option>
            <option value="hero">Hero Section</option>
            <option value="content">Content</option>
            <option value="audio_player">Audio Player</option>
            <option value="product">Product Showcase</option>
            <option value="lead_magnet">Lead Magnet</option>
            <option value="testimonial">Testimonials</option>
            <option value="specialties">Specialties</option>
            <option value="credentials">Credentials</option>
            <option value="cta">Call to Action</option>
            <option value="social_proof">Social Proof</option>
          </select>

          {onSave && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Page'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Default settings for each block type
function getDefaultSettings(blockType: string): Record<string, any> {
  switch (blockType) {
    case 'hero':
      return {
        title: 'Welcome to Our Site',
        subtitle: 'Discover amazing content and transform your health',
        alignment: 'center',
        showCTA: true,
        ctaText: 'Get Started',
        ctaLink: '#'
      };
    case 'content':
      return {
        title: 'Content Section',
        content: '<p>Add your content here...</p>',
        alignment: 'left'
      };
    case 'audio_player':
      return {
        title: 'Personal Message',
        subtitle: 'Listen to our story',
        showWaveform: true
      };
    case 'product':
      return {
        title: 'Amazing Product',
        description: 'Transform your life with this incredible resource.',
        price: 97,
        originalPrice: 197,
        badge: 'Best Seller',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        ctaText: 'Get Instant Access'
      };
    case 'lead_magnet':
      return {
        title: 'Free Resource',
        description: 'Download our free guide to get started.',
        incentive: 'Free Guide',
        features: ['Quick tips', 'Step-by-step instructions', 'Bonus materials'],
        ctaText: 'Download Now'
      };
    case 'testimonial':
      return {
        testimonials: [
          {
            text: 'This changed my life completely!',
            author: 'Sarah Johnson',
            rating: 5
          }
        ],
        layout: 'grid',
        showRatings: true
      };
    case 'specialties':
      return {
        title: 'Areas of Expertise',
        specialties: [
          { name: 'Specialty 1', icon: '🧬' },
          { name: 'Specialty 2', icon: '⚖️' },
          { name: 'Specialty 3', icon: '💊' }
        ],
        layout: 'grid'
      };
    case 'credentials':
      return {
        credentials: ['MD', 'PhD', 'Board Certified'],
        publications: ['Research Paper 1', 'Research Paper 2'],
        certifications: ['Certification 1', 'Certification 2'],
        layout: 'side-by-side',
        showIcons: true
      };
    case 'cta':
      return {
        title: 'Ready to Get Started?',
        description: 'Join thousands who have transformed their lives.',
        ctaText: 'Start Your Journey',
        style: 'card'
      };
    case 'social_proof':
      return {
        count: 47284,
        text: 'happy customers',
        layout: 'banner',
        showAvatars: true,
        avatars: []
      };
    default:
      return {};
  }
}