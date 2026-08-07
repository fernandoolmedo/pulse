// test/postInput.test.js
const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeCategory, parseTags } = require('../lib/postInput');
const BlogPost = require('../models/BlogPost');

test('every category in the taxonomy has a display label', () => {
  for (const slug of BlogPost.CATEGORIES) {
    assert.ok(BlogPost.CATEGORY_LABELS[slug], `missing label for ${slug}`);
  }
});

test('accepts a slug from the locked taxonomy', () => {
  assert.equal(normalizeCategory('food-drink'), 'food-drink');
  assert.equal(normalizeCategory('pets'), 'pets');
});

test('normalizes case and surrounding whitespace', () => {
  assert.equal(normalizeCategory('  TECH '), 'tech');
});

test('falls back to other rather than throwing', () => {
  // 'technology' was in the superseded 7-bucket enum; a stale form must not
  // fail the whole post.
  assert.equal(normalizeCategory('technology'), 'other');
  assert.equal(normalizeCategory(''), 'other');
  assert.equal(normalizeCategory(undefined), 'other');
  assert.equal(normalizeCategory({ evil: true }), 'other');
});

test('splits a comma separated string', () => {
  assert.deepEqual(parseTags('ramen, late night, seoul'), ['ramen', 'late night', 'seoul']);
});

test('lowercases, strips leading hashes, and de-duplicates', () => {
  assert.deepEqual(parseTags('Coffee, #ramen, coffee, ##beans'), ['coffee', 'ramen', 'beans']);
});

test('drops empty segments', () => {
  assert.deepEqual(parseTags('a,,  ,b'), ['a', 'b']);
});

test('caps the tag count', () => {
  const tags = parseTags('a,b,c,d,e,f,g,h');
  assert.equal(tags.length, BlogPost.MAX_TAGS);
});

test('truncates an over-long tag', () => {
  const [tag] = parseTags('x'.repeat(100));
  assert.equal(tag.length, BlogPost.MAX_TAG_LENGTH);
});

test('accepts an array as well as a string', () => {
  assert.deepEqual(parseTags(['One', 'two']), ['one', 'two']);
});

test('empty and missing input yield no tags', () => {
  assert.deepEqual(parseTags(''), []);
  assert.deepEqual(parseTags(undefined), []);
  assert.deepEqual(parseTags(null), []);
});
