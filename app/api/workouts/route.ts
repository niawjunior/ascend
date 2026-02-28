import { put, list, head } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const filename = `users/${userId}/workouts.json`;
    
    // First try `head` if available, otherwise fallback to `list`
    let urlToFetch = null;
    
    try {
        const blobDetails = await head(filename);
        if (blobDetails) {
            urlToFetch = blobDetails.url;
        }
    } catch (headErr) {
        // head might fail if file doesn't exist or sdk version differs, fallback to list
        const { blobs } = await list({ prefix: filename });
        const fileBlob = blobs.find(b => b.pathname === filename);
        if (fileBlob) {
            urlToFetch = fileBlob.url;
        }
    }

    if (urlToFetch) {
      const response = await fetch(urlToFetch, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ workouts: data });
      }
    }
    
    return NextResponse.json({ workouts: [] });
  } catch (err) {
    console.error("GET /api/workouts Error:", err);
    return NextResponse.json({ workouts: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, workouts } = await request.json();

    if (!userId || !workouts) {
      return NextResponse.json({ error: 'Missing userId or workouts' }, { status: 400 });
    }

    const filename = `users/${userId}/workouts.json`;
    const blob = await put(filename, JSON.stringify(workouts), {
      access: 'private',
      addRandomSuffix: false, // Override the existing JSON file for this user
      contentType: 'application/json',
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (err) {
    console.error("POST /api/workouts Error:", err);
    return NextResponse.json({ error: "Failed to upload to blob" }, { status: 500 });
  }
}
