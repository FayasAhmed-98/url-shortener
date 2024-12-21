const express = require('express');
const shortid = require('shortid');
const URL = require('../models/urlModel');

// Initialize router
const router = express.Router();

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
    // Check if URL already exists
    let url = await URL.findOne({ long_url });
    if (url) {
      return res.json({ short_url: `http://short.ly/${url.short_url}` });
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

    // Send the short URL in response
    res.json({ short_url: `http://short.ly/${short_url}` });
  } catch (err) {
    res.status(500).json({ error: 'Error saving URL to database' });
  }
});

// GET /:short_url - Redirect to long URL
router.get('/:short_url', async (req, res) => {
  const { short_url } = req.params;

  try {
    // Find the URL by short URL
    const url = await URL.findOne({ short_url });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Redirect to the long URL
    return res.redirect(url.long_url);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
