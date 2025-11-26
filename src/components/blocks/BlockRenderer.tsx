'use client';

import { Block } from '@/types/blocks';
import HeroBlock from './HeroBlock';
import AudioPlayerBlock from './AudioPlayerBlock';
import ProductBlock from './ProductBlock';
import LeadMagnetBlock from './LeadMagnetBlock';
import TestimonialBlock from './TestimonialBlock';
import ContentBlock from './ContentBlock';
import SpecialtiesBlock from './SpecialtiesBlock';
import CredentialsBlock from './CredentialsBlock';
import CTABlock from './CTABlock';
import SocialProofBlock from './SocialProofBlock';

interface BlockRendererProps {
  block: Block;
  isEditing?: boolean;
  onEdit?: (block: Block) => void;
  onDelete?: (blockId: string) => void;
  onMove?: (blockId: string, direction: 'up' | 'down') => void;
}

export default function BlockRenderer({
  block,
  isEditing = false,
  onEdit,
  onDelete,
  onMove
}: BlockRendererProps) {
  if (!block.visible && !isEditing) {
    return null;
  }

  const renderBlock = () => {
    switch (block.type) {
      case 'hero':
        return <HeroBlock block={block} />;
      case 'audio_player':
        return <AudioPlayerBlock block={block} />;
      case 'product':
        return <ProductBlock block={block} />;
      case 'lead_magnet':
        return <LeadMagnetBlock block={block} />;
      case 'testimonial':
        return <TestimonialBlock block={block} />;
      case 'content':
        return <ContentBlock block={block} />;
      case 'specialties':
        return <SpecialtiesBlock block={block} />;
      case 'credentials':
        return <CredentialsBlock block={block} />;
      case 'cta':
        return <CTABlock block={block} />;
      case 'social_proof':
        return <SocialProofBlock block={block} />;
      default:
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            Unknown block type: {(block as any).type}
          </div>
        );
    }
  };

  if (isEditing) {
    return (
      <div className="relative group">
        <div className={`${!block.visible ? 'opacity-50' : ''}`}>
          {renderBlock()}
        </div>
        
        {/* Edit Overlay */}
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        {/* Edit Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMove?.(block.id, 'up')}
            className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700 pointer-events-auto"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={() => onMove?.(block.id, 'down')}
            className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700 pointer-events-auto"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={() => onEdit?.(block)}
            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 pointer-events-auto"
            title="Edit block"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete?.(block.id)}
            className="p-1 bg-red-600 text-white rounded hover:bg-red-700 pointer-events-auto"
            title="Delete block"
          >
            🗑️
          </button>
        </div>

        {/* Block Info */}
        <div className="absolute bottom-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          {block.type} #{block.position}
        </div>
      </div>
    );
  }

  return renderBlock();
}