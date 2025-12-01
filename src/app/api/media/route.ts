import { NextRequest, NextResponse } from 'next/server';
import { createQueries } from '@/lib/db-enhanced';
import { nanoid } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary - initialized fresh on each request
function getCloudinaryConfig() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// GET /api/media - Get all media for a site
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const fileType = searchParams.get('type') || 'all';

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    const queries = createQueries();
    const media = await queries.mediaQueries.getAllBySite(siteId, fileType);

    // Transform to match MediaFile interface
    const transformedMedia = (media as any[]).map(m => ({
      id: m.id,
      name: m.original_name,
      type: m.file_type,
      url: m.url,
      size: m.size,
      uploadedAt: m.created_at,
      dimensions: m.width && m.height ? { width: m.width, height: m.height } : undefined,
      alt: m.alt,
      tags: JSON.parse(m.tags || '[]')
    }));

    return NextResponse.json(transformedMedia);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/media - Upload a new media file to Cloudinary
export async function POST(request: NextRequest) {
  // Initialize Cloudinary config fresh
  getCloudinaryConfig();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const siteId = formData.get('siteId') as string | null;
    const alt = formData.get('alt') as string | null;
    const tags = formData.get('tags') as string | null;

    if (!file || !siteId) {
      return NextResponse.json({ error: 'File and site ID are required' }, { status: 400 });
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 });
    }

    // Determine file type
    const mimeType = file.type;
    let fileType = 'document';
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    if (mimeType.startsWith('image/')) {
      fileType = 'image';
      resourceType = 'image';
    } else if (mimeType.startsWith('video/')) {
      fileType = 'video';
      resourceType = 'video';
    } else if (mimeType.startsWith('audio/')) {
      fileType = 'audio';
      resourceType = 'video'; // Cloudinary uses 'video' for audio files
    } else {
      resourceType = 'raw';
    }

    // Create unique filename (without extension, Cloudinary handles it)
    const publicId = `kiala/${siteId}/${nanoid()}`;

    // Convert file to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          folder: `kiala/${siteId}`,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Get dimensions from Cloudinary response (for images)
    const width = uploadResult.width || undefined;
    const height = uploadResult.height || undefined;

    // URL from Cloudinary
    const url = uploadResult.secure_url;

    // Save to database
    const id = nanoid();
    const queries = createQueries();
    await queries.mediaQueries.create({
      id,
      siteId,
      filename: uploadResult.public_id,
      originalName: file.name,
      mimeType,
      fileType,
      size: file.size,
      url,
      width,
      height,
      alt: alt || undefined,
      tags: tags ? JSON.parse(tags) : []
    });

    return NextResponse.json({
      id,
      name: file.name,
      type: fileType,
      url,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      dimensions: width && height ? { width, height } : undefined,
      alt: alt || undefined,
      tags: tags ? JSON.parse(tags) : []
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error uploading media:', error);
    // Return more specific error message
    const errorMessage = error?.message || 'Internal server error';
    return NextResponse.json({
      error: errorMessage,
      details: error?.http_code ? `Cloudinary error: ${error.http_code}` : undefined,
      debug: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
        apiKey: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 4) + '...' : 'NOT SET',
        apiSecret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
      }
    }, { status: 500 });
  }
}

// DELETE /api/media - Delete a media file from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const queries = createQueries();

    // Get the media file to find its Cloudinary public_id
    const media = await queries.mediaQueries.getById(id) as any;
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && media.filename) {
      try {
        // Determine resource type from file_type
        let resourceType: 'image' | 'video' | 'raw' = 'image';
        if (media.file_type === 'video' || media.file_type === 'audio') {
          resourceType = 'video';
        } else if (media.file_type === 'document') {
          resourceType = 'raw';
        }

        await cloudinary.uploader.destroy(media.filename, { resource_type: resourceType });
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue to delete from database even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await queries.mediaQueries.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
