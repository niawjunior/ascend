import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    // Authenticate the request to Vercel Blob with the private token
    const result = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });

    if (!result.ok) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Stream the secure image back to the browser, with caching enabled
    return new NextResponse(result.body, {
      headers: {
        'Content-Type': result.headers.get('Content-Type') || 'application/octet-stream',
        'Cache-Control': 'private, max-age=86400',
      },
    });
  } catch (error) {
    console.error("Error streaming private blob:", error);
    return new NextResponse('Error fetching file', { status: 500 });
  }
}
