// lib/postInput.js
// Normalisation for user-supplied post fields. Kept free of Mongoose so it can
// be unit tested without a database connection.

const {
  CATEGORIES,
  MAX_TAGS,
  MAX_TAG_LENGTH
} = require('../models/BlogPost');

// Anything not in the locked taxonomy falls back to 'other' rather than
// erroring — a stale or hand-crafted form post shouldn't lose the whole post.
function normalizeCategory(raw) {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  return CATEGORIES.includes(value) ? value : 'other';
}

// Accepts "Coffee, #ramen, coffee" (or an array) and returns ['coffee','ramen'].
// Lowercased and de-duplicated so tag counts aggregate correctly downstream.
function parseTags(raw) {
  const parts = Array.isArray(raw) ? raw : String(raw ?? '').split(',');

  const seen = new Set();
  for (const part of parts) {
    const tag = String(part ?? '')
      .trim()
      .toLowerCase()
      .replace(/^#+/, '')
      .slice(0, MAX_TAG_LENGTH)
      .trim();

    if (tag) seen.add(tag);
    if (seen.size >= MAX_TAGS) break;
  }

  return [...seen];
}

module.exports = { normalizeCategory, parseTags };
