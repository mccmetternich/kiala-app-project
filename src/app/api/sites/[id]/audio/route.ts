import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: siteId } = await params;
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);
    
    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    // Check if site exists
    const site = await queries.siteQueries.getById(siteId) as any;
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'File must be an audio file' }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio', siteId);
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `audio-${timestamp}.${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const audioUrl = `/uploads/audio/${siteId}/${fileName}`;

    // Update site settings with new audio URL
    const currentSettings = typeof site.settings === 'string' 
      ? JSON.parse(site.settings) 
      : site.settings || {};
    
    const updatedSettings = {
      ...currentSettings,
      audioUrl
    };

    const siteData = {
      ...site,
      settings: updatedSettings
    };
    await queries.siteQueries.update(siteId, siteData);

    return NextResponse.json({ 
      success: true, 
      audioUrl,
      message: 'Audio file uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading audio file:', error);
    return NextResponse.json({ 
      error: 'Failed to upload audio file' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: siteId } = await params;
  try {
    const tenantId = request.headers.get('X-Tenant-Id') || undefined;
    const queries = createQueries(tenantId);
    
    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    // Check if site exists
    const site = await queries.siteQueries.getById(siteId) as any;
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Remove audio URL from site settings
    const currentSettings = typeof site.settings === 'string' 
      ? JSON.parse(site.settings) 
      : site.settings || {};
    
    const updatedSettings = {
      ...currentSettings
    };
    delete updatedSettings.audioUrl;

    const siteData = {
      ...site,
      settings: updatedSettings
    };
    await queries.siteQueries.update(siteId, siteData);

    return NextResponse.json({ 
      success: true, 
      message: 'Audio file removed successfully'
    });

  } catch (error) {
    console.error('Error removing audio file:', error);
    return NextResponse.json({ 
      error: 'Failed to remove audio file' 
    }, { status: 500 });
  }
}