import { put, head } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const filename = `profiles/${cleanUsername}.json`;

    try {
      // Check if the username already exists
      const blobDetails = await head(filename);
      if (blobDetails) {
        // User exists, return their mapped UUID using private auth header
        const response = await fetch(blobDetails.url, {
          headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
        });
        const data = await response.json();
        return NextResponse.json({ success: true, isNew: false, uuid: data.uuid, username: cleanUsername });
      }
    } catch (e) {
      // head throws an error if the file doesn't exist. This means the username is available!
    }

    // Create a new user profile mapping to a fresh UUID
    const newUuid = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await put(filename, JSON.stringify({ uuid: newUuid, createdAt: new Date().toISOString() }), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return NextResponse.json({ success: true, isNew: true, uuid: newUuid, username: cleanUsername });
    
  } catch (err: any) {
    console.error("Auth API Error:", err);
    return NextResponse.json({ error: err.message || "Authentication failed" }, { status: 500 });
  }
}
