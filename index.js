const express = require('express');
const bodyParser = require('body-parser');
const shortid = require('shortid');

const app = express();
app.use(bodyParser.json());

// In-memory store (Temporary; will use a database later)
const urlStore = {};

// POST /shorten - Shorten a URL
app.post('/shorten', (req, res) => {
    const { long_url } = req.body;

    // Validate URL
    if (!long_url || !long_url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Generate a short URL
    const short_url = shortid.generate();
    urlStore[short_url] = long_url;

    res.json({ short_url: `http://short.ly/${short_url}` });
});

// GET /:short_url - Redirect to the long URL
app.get('/:short_url', (req, res) => {
    const { short_url } = req.params;
    const long_url = urlStore[short_url];

    if (!long_url) {
        return res.status(404).json({ error: 'URL not found' });
    }

    res.redirect(long_url);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
