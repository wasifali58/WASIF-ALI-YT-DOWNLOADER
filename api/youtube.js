const axios = require("axios");

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const sendError = (statusCode, message) => {
        return res.status(statusCode).json({
            error: message,
            developer: "WASIF ALI",
            telegram: "@FREEHACKS95"
        });
    };

    // Home route
    if (req.url === '/' || req.url === '') {
        return res.json({
            message: "YouTube Video Downloader API",
            usage: "/api/youtube?url=YOUTUBE_VIDEO_URL",
            developer: "WASIF ALI",
            telegram: "@FREEHACKS95"
        });
    }

    // Get URL from query (GET) or body (POST)
    const url = req.query.url || (req.body && req.body.url);

    if (!url) {
        return sendError(400, "URL parameter is required");
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
        return sendError(400, "Invalid YouTube URL");
    }

    try {
        const body = new URLSearchParams({
            auth: "20250901majwlqo",
            domain: "api-ak.vidssave.com",
            origin: "cache",
            link: url,
        });

        const { data } = await axios.post(
            "https://api.vidssave.com/api/contentsite_api/media/parse",
            body.toString(),
            {
                headers: {
                    accept: "*/*",
                    "content-type": "application/x-www-form-urlencoded",
                    referer: "https://vidssave.com/",
                },
                timeout: 15000,
            }
        );

        if (!data || data.status !== 1 || !data.data) {
            throw new Error("Invalid response from vidssave");
        }

        const video = data.data;

        const videos = [];
        const audios = [];

        (video.resources || []).forEach((r) => {
            const item = {
                format: r.format,
                quality: r.quality || null,
                url: r.download_url,
                sizeMB: +(r.size / 1024 / 1024).toFixed(2),
            };

            if (r.type === "video") videos.push(item);
            if (r.type === "audio") audios.push(item);
        });

        const responsePayload = {
            type: "video",
            url: url,
            thumbnail: video.thumbnail || null,
            title: video.title || null,
            duration: video.duration || null,
            videos: videos,
            audios: audios,
            developer: "WASIF ALI",
            telegram: "@FREEHACKS95"
        };

        // Set JSON response headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="yt.json"');

        return res.status(200).json(responsePayload);

    } catch (err) {
        console.error("Vidssave scrape failed:", err.message);
        return sendError(500, "Failed to fetch video data");
    }
}
