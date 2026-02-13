import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import axios from 'axios';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userEmail = session.user.email;

        // 1. Parse FormData
        const formData = await req.formData();
        const videoFile = formData.get('video');
        const caption = formData.get('caption') || '';
        const privacy = formData.get('privacy') || 'SELF_ONLY'; // PUBLIC_TO_EVERYONE, MUTUAL_FOLLOW_FRIENDS, SELF_ONLY
        const disableDuet = formData.get('disableDuet') === 'true';
        const disableStitch = formData.get('disableStitch') === 'true';
        const disableComment = formData.get('disableComment') === 'true';

        if (!videoFile) {
            return NextResponse.json({ error: 'Video file is required.' }, { status: 400 });
        }

        // 2. Get Access Token
        const [rows] = await db.query(
            `SELECT access_token_encrypted FROM social_connect WHERE user_email = ? AND platform = 'tiktok' AND is_active = TRUE`,
            [userEmail]
        );

        if (rows.length === 0 || !rows[0].access_token_encrypted) {
            return NextResponse.json({ error: 'TikTok account not connected.' }, { status: 403 });
        }

        const accessToken = decrypt(rows[0].access_token_encrypted);

        // 3. Step 1: Initialize Upload
        // https://developers.tiktok.com/doc/tiktok-api-v2-video-publish-initialization/
        const initUrl = 'https://open.tiktokapis.com/v2/post/publish/video/init/';

        // Calculate video size
        const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
        const videoSize = videoBuffer.length;

        const initBody = {
            post_info: {
                title: caption,
                privacy_level: privacy,
                disable_duet: disableDuet,
                disable_comment: disableComment,
                disable_stitch: disableStitch,
                video_cover_timestamp_ms: 1000 // Default cover at 1s
            },
            source_info: {
                source: 'FILE_UPLOAD',
                video_size: videoSize,
                chunk_size: videoSize, // Uploading in one chunk for simplicity if size allows
                total_chunk_count: 1
            }
        };

        console.log('[TikTok] Initializing upload...', JSON.stringify(initBody));

        const initResponse = await axios.post(initUrl, initBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=UTF-8'
            }
        });

        if (initResponse.data.error && initResponse.data.error.code !== 0) {
            console.error('[TikTok] Init failed:', initResponse.data);
            throw new Error(`TikTok Init Failed: ${initResponse.data.error.message}`);
        }

        const { upload_url, publish_id } = initResponse.data.data;
        console.log(`[TikTok] Upload initialized. Publish ID: ${publish_id}`);

        // 4. Step 2: Upload Video
        // https://developers.tiktok.com/doc/tiktok-api-v2-video-publish-upload/
        console.log('[TikTok] Uploading video content...');

        const uploadResponse = await axios.put(upload_url, videoBuffer, {
            headers: {
                'Content-Type': 'video/mp4', // Adjust if supporting other formats
                'Content-Length': videoSize,
                'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`
            }
        });

        console.log(`[TikTok] Upload status: ${uploadResponse.status}`);

        if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
            throw new Error(`TikTok Upload Failed with status ${uploadResponse.status}`);
        }

        return NextResponse.json({
            success: true,
            message: 'Video uploaded to TikTok successfully!',
            publishId: publish_id
        });

    } catch (error) {
        console.error('[TikTok Post Error]', error.response?.data || error.message);
        return NextResponse.json({
            error: error.message || 'Failed to post to TikTok',
            details: error.response?.data
        }, { status: 500 });
    }
}
