import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Generate a client token for the browser to upload the file
        // Allow common image formats for the workout thumbnails
        const userId = clientPayload || 'unknown_user';
        
        // Define explicit folder path: users/usr_1234/images/my_photo.jpg
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Called by Vercel API on client upload completion
        console.log('blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}
