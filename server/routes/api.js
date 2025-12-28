/**
 * Nature on Zoom — API Routes
 */

import { Router } from 'express';

const router = Router();

// Stream data
const streams = {
    eagle: {
        id: 'eagle',
        title: 'Bald Eagle Nest',
        status: 'live',
        viewers: 142,
        quality: '1080p',
        bitrate: '4500kbps',
        thumbnail: 'assets/images/eagle-thumb.jpg'
    },
    owl: {
        id: 'owl',
        title: 'Barn Owl Family',
        status: 'live',
        viewers: 89,
        quality: '1080p',
        bitrate: '4000kbps',
        thumbnail: 'assets/images/owl-thumb.jpg'
    },
    hummingbird: {
        id: 'hummingbird',
        title: 'Hummingbird Haven',
        status: 'live',
        viewers: 234,
        quality: '1080p',
        bitrate: '4500kbps',
        thumbnail: 'assets/images/hummingbird-thumb.jpg'
    },
    osprey: {
        id: 'osprey',
        title: 'Osprey Overlook',
        status: 'live',
        viewers: 67,
        quality: '720p',
        bitrate: '3000kbps',
        thumbnail: 'assets/images/osprey-thumb.jpg'
    },
    falcon: {
        id: 'falcon',
        title: 'Peregrine Falcon Tower',
        status: 'live',
        viewers: 178,
        quality: '1080p',
        bitrate: '5000kbps',
        thumbnail: 'assets/images/falcon-thumb.jpg'
    },
    heron: {
        id: 'heron',
        title: 'Great Blue Heron Colony',
        status: 'live',
        viewers: 45,
        quality: '720p',
        bitrate: '2500kbps',
        thumbnail: 'assets/images/heron-thumb.jpg'
    },
    penguin: {
        id: 'penguin',
        title: 'Penguin Nursery',
        status: 'live',
        viewers: 312,
        quality: '1080p',
        bitrate: '4500kbps',
        thumbnail: 'assets/images/penguin-thumb.jpg'
    },
    flamingo: {
        id: 'flamingo',
        title: 'Flamingo Lagoon',
        status: 'live',
        viewers: 198,
        quality: '1080p',
        bitrate: '4000kbps',
        thumbnail: 'assets/images/flamingo-thumb.jpg'
    }
};

/**
 * GET /api/stream/preview/:id
 * Get stream preview metadata
 */
router.get('/stream/preview/:id', (req, res) => {
    const { id } = req.params;
    const stream = streams[id];

    if (!stream) {
        return res.status(404).json({
            code: 'STREAM_NOT_FOUND',
            message: `Stream with id '${id}' not found`
        });
    }

    // Randomize viewers count
    const variance = Math.floor(stream.viewers * 0.2);
    const viewers = stream.viewers + Math.floor(Math.random() * variance * 2) - variance;

    // Add dynamic data
    const response = {
        ...stream,
        viewers,
        startedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
    };

    console.log(`[API] GET /stream/preview/${id} - ${viewers} viewers`);

    res.json(response);
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * GET /api/streams
 * Get all streams (for debugging)
 */
router.get('/streams', (req, res) => {
    const streamList = Object.values(streams).map(stream => ({
        id: stream.id,
        title: stream.title,
        status: stream.status
    }));

    res.json({ streams: streamList });
});

export default router;
