'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SiteLayout from '@/components/layout/SiteLayout';
import CredibilitySidebar from '@/components/CredibilitySidebar';
import PageBuilder from '@/components/blocks/PageBuilder';
import { Block } from '@/types/blocks';
import { clientAPI } from '@/lib/api';

// Fallback site data
const fallbackSiteData = {
  id: 'dr-heart',
  name: 'Dr. Heart',
  domain: 'localhost:3000',
  doctor: {
    name: 'Dr. Sarah Heart',
    title: 'Board Certified Cardiologist',
    bio: 'Passionate about helping patients achieve optimal heart health through evidence-based medicine and lifestyle interventions.',
    quote: 'Your heart is the engine of your life. Let\'s keep it running strong.',
    specialties: ['Cardiovascular Health', 'Preventive Medicine', 'Lifestyle Medicine'],
    credentials: ['MD', 'FACC'],
    certifications: ['Board Certified Cardiology'],
    publications: []
  },
  settings: {
    emailCapture: {
      leadMagnet: {
        title: 'Free Heart Health Guide',
        description: 'Get started with better heart health today'
      }
    }
  }
};

export default function AboutBlocksPage() {
  const { id } = useParams() as { id: string };
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch site data
        const site = await clientAPI.getSiteBySubdomain('dr-heart');
        if (site) {
          setSiteData(site);
        } else {
          // Fallback to mock data if no site found
          setSiteData(fallbackSiteData);
        }
      } catch (error) {
        console.error('Error loading about page:', error);
        // Fallback to mock data on error
        setSiteData(fallbackSiteData);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Initialize page with example blocks if none exist
  useEffect(() => {
    if (siteData) {
      initializeExampleBlocks();
    }
  }, [siteData]);

  const initializeExampleBlocks = async () => {
    try {
      // Check if blocks already exist
      const response = await fetch(`/api/blocks?pageId=about&siteId=${siteData.id || 'dr-heart'}`);
      const data = await response.json();
      
      if (data.blocks && data.blocks.length > 0) {
        return; // Blocks already exist
      }

      const doctor = typeof siteData.doctor_profile === 'string'
        ? JSON.parse(siteData.doctor_profile)
        : siteData.doctor_profile || fallbackSiteData.doctor;

      // Create example blocks that recreate our beautiful about page
      const exampleBlocks: Block[] = [
        {
          id: 'hero-profile-audio',
          type: 'hero',
          position: 0,
          visible: true,
          settings: {
            title: `Meet ${doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}`,
            subtitle: doctor.title,
            alignment: 'center',
            backgroundColor: 'bg-gradient-to-r from-blue-50 to-purple-50',
            showCTA: false
          }
        } as Block,
        {
          id: 'audio-player-1',
          type: 'audio_player',
          position: 1,
          visible: true,
          settings: {
            title: `Personal Message from ${doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}`,
            subtitle: 'Listen to my personal story and approach to healing',
            showWaveform: true
          }
        } as Block,
        {
          id: 'content-bio',
          type: 'content',
          position: 2,
          visible: true,
          settings: {
            title: 'My Story',
            content: `
              <p class="text-gray-700 leading-relaxed mb-6">${doctor.bio}</p>
              <blockquote class="border-l-4 border-primary-500 pl-6 italic text-lg text-gray-800 my-8">
                "${doctor.quote}"
              </blockquote>
              <p class="text-gray-700 leading-relaxed">
                My journey into integrative medicine began when I realized that conventional approaches 
                weren't addressing the root causes of my patients' health challenges. Through years of 
                research and clinical practice, I've developed protocols that combine the best of 
                evidence-based medicine with natural healing approaches.
              </p>
            `,
            alignment: 'left'
          }
        } as Block,
        {
          id: 'specialties-1',
          type: 'specialties',
          position: 3,
          visible: true,
          settings: {
            title: 'Areas of Expertise',
            specialties: doctor.specialties?.map((specialty: string, index: number) => ({
              name: specialty,
              icon: index === 0 ? '🧬' : index === 1 ? '⚖️' : '💊'
            })) || [
              { name: 'Gut Health', icon: '🧬' },
              { name: 'Hormone Balance', icon: '⚖️' },
              { name: 'Natural Medicine', icon: '💊' }
            ],
            layout: 'grid',
            backgroundColor: 'bg-gray-50'
          }
        } as Block,
        {
          id: 'credentials-1',
          type: 'credentials',
          position: 4,
          visible: true,
          settings: {
            credentials: Array.isArray(doctor.credentials) ? doctor.credentials : ['MD', 'PhD', 'FACS'],
            publications: doctor.publications || [
              'Integrative Approaches to Digestive Health',
              'Hormone Optimization in Women Over 40',
              'The Gut-Brain Connection: A Clinical Perspective'
            ],
            certifications: doctor.certifications || [
              'Board Certified Internal Medicine',
              'Functional Medicine Certified',
              'Institute for Functional Medicine'
            ],
            layout: 'side-by-side',
            showIcons: true
          }
        } as Block,
        {
          id: 'product-gut-reset',
          type: 'product',
          position: 5,
          visible: true,
          settings: {
            title: 'Complete Gut Reset Protocol',
            description: 'My comprehensive 30-day program to heal your gut, balance hormones, and restore energy naturally. Includes meal plans, supplement protocols, and step-by-step guidance.',
            price: 47,
            originalPrice: 197,
            badge: 'Most Popular',
            badgeColor: 'bg-green-100 text-green-800',
            features: [
              '30-Day Meal Plans',
              'Supplement Protocols',
              'Step-by-Step Guidance',
              'Private Community Access',
              'Weekly Q&A Sessions',
              'Money-Back Guarantee'
            ],
            ctaText: 'Get Instant Access',
            testimonials: [
              {
                text: 'This protocol changed everything for me!',
                author: 'Sarah M.',
                rating: 5
              }
            ]
          }
        } as Block,
        {
          id: 'lead-magnet-hormone',
          type: 'lead_magnet',
          position: 6,
          visible: true,
          settings: {
            title: 'Hormone Balance Quick Start Guide',
            description: 'Join 47,284+ women who have downloaded my free guide to naturally balance hormones in just 7 days. Get the exact meal plans and simple protocols I use with patients.',
            incentive: 'Free Hormone Guide',
            features: [
              '7-Day Meal Plan Templates',
              'Supplement Timing Guide',
              'Hormone Testing Checklist',
              'Weekly Email Support'
            ],
            ctaText: 'Download Free Guide',
            backgroundColor: 'bg-gradient-to-br from-purple-50 to-pink-50'
          }
        } as Block
      ];

      // Save the example blocks
      await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageId: 'about',
          siteId: siteData.id || 'dr-heart',
          blocks: exampleBlocks
        })
      });

    } catch (error) {
      console.error('Error initializing example blocks:', error);
    }
  };

  const handleSaveBlocks = async (blocks: Block[]) => {
    try {
      await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageId: 'about',
          siteId: siteData.id || 'dr-heart',
          blocks
        })
      });
    } catch (error) {
      console.error('Error saving blocks:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading about page...</p>
        </div>
      </div>
    );
  }

  // Transform database site data to match the Site interface
  const transformedSite = siteData && siteData.id !== fallbackSiteData.id ? {
    ...fallbackSiteData,
    id: siteData.id,
    name: siteData.name,
    domain: siteData.domain,
    doctor: typeof siteData.doctor_profile === 'string'
      ? JSON.parse(siteData.doctor_profile)
      : siteData.doctor_profile || fallbackSiteData.doctor,
    settings: typeof siteData.settings === 'string'
      ? { ...fallbackSiteData.settings, ...JSON.parse(siteData.settings) }
      : { ...fallbackSiteData.settings, ...siteData.settings }
  } : siteData || fallbackSiteData;

  const doctor = transformedSite?.doctor;

  if (!doctor) {
    return <div>Doctor information not found.</div>;
  }

  return (
    <SiteLayout 
      site={transformedSite}
      showSidebar={true}
      sidebar={
        <CredibilitySidebar 
          doctor={doctor}
          leadMagnet={transformedSite.settings?.emailCapture?.leadMagnet}
          communityCount={47284}
        />
      }
    >
      <div className="space-y-12">
        {/* Block System Toggle (for demo) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Block System Demo</h3>
              <p className="text-blue-700 text-sm">
                This page demonstrates our new modular block system. Toggle edit mode to see the magic!
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditing ? 'Exit Edit Mode' : 'Enable Edit Mode'}
            </button>
          </div>
        </div>

        {/* Block-Based Page Content */}
        <PageBuilder
          pageId="about"
          siteId={transformedSite.id || 'dr-heart'}
          pageType="about"
          isEditing={isEditing}
          onSave={handleSaveBlocks}
        />
      </div>
    </SiteLayout>
  );
}