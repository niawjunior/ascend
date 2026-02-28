import { put, head } from '@vercel/blob';
import { NextResponse, type NextRequest } from 'next/server';

// GET User History
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const filename = `users/${userId}/history.json`;
    let urlToFetch: string | null = null;

    try {
      const blobDetails = await head(filename);
      if (blobDetails) {
        urlToFetch = blobDetails.url;
      }
    } catch (e) {
      // JSON doesn't exist yet, which is fine (new user)
      return NextResponse.json({ history: [] });
    }

    if (urlToFetch) {
      const response = await fetch(urlToFetch, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ history: data });
      }
    }

    return NextResponse.json({ history: [] });
  } catch (err) {
    console.error("History API GET Error:", err);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

// POST new Workout Log or overwrite History
export async function POST(request: Request) {
  try {
    const { userId, logs } = await request.json();

    if (!userId || !logs || !Array.isArray(logs)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const filename = `users/${userId}/history.json`;
    const blob = await put(filename, JSON.stringify(logs), {
      access: 'private',
      addRandomSuffix: false, // Override the existing JSON history for this user
      contentType: 'application/json',
    });

    return NextResponse.json({ success: true, blob });
  } catch (err) {
    console.error("History API POST Error:", err);
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
  }
}
