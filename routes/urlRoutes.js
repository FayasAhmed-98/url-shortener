const express = require('express');
const shortid = require('shortid');
const NodeCache = require('node-cache'); // Import node-cache
const URL = require('../models/urlModel');
const router = express.Router();

// Initialize cache with a default TTL of 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600 });

// URL validation helper
const isValidUrl = (url) => {
  const regex =
    /^(https?:\/\/)?([\w\d-]+\.)+[\w\d-]+(\/[\w\d-]*)*(\?[;&a-z\d%_.~+=-]*)*(#[^&]*)?$/i;
  return regex.test(url);
};

// POST /shorten - Shorten URL
router.post('/shorten', async (req, res) => {
  const { long_url } = req.body;

  // Validate the URL
  if (!long_url || !isValidUrl(long_url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Check if URL is already cached
    const cachedShortUrl = cache.get(long_url);
    if (cachedShortUrl) {
      return res.json({ short_url: cachedShortUrl });
    }

    // Check if URL exists in the database
    let url = await URL.findOne({ long_url });
    if (url) {
      const shortUrl = `http://short.ly/${url.short_url}`;
      cache.set(long_url, shortUrl); // Cache the result
      return res.json({ short_url: shortUrl });
    }

    // Generate a unique short URL
    let short_url = shortid.generate();
    let existingUrl = await URL.findOne({ short_url });
    while (existingUrl) {
      short_url = shortid.generate(); // Generate a new short URL if the current one exists
      existingUrl = await URL.findOne({ short_url });
    }

    // Save the new short URL
    url = new URL({ short_url, long_url });
    await url.save();

    const shortUrl = `http://short.ly/${short_url}`;
    cache.set(long_url, shortUrl); // Cache the result

    // Send the short URL in response
    res.json({ short_url: shortUrl });
  } catch (err) {
    res.status(500).json({ error: 'Error saving URL to database' });
  }
});

// GET /:short_url - Redirect to long URL
router.get('/:short_url', async (req, res) => {
  const { short_url } = req.params;

  try {
    // Check if the long URL is cached
    const cachedLongUrl = cache.get(short_url);
    if (cachedLongUrl) {
      return res.redirect(cachedLongUrl);
    }

    // Find the URL by short URL in the database
    const url = await URL.findOne({ short_url });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Cache the long URL for future requests
    cache.set(short_url, url.long_url);

    // Redirect to the long URL
    return res.redirect(url.long_url);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
