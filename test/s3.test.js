// test/s3.test.js
const test = require('node:test');
const assert = require('node:assert/strict');

const { buildImageKey, cloudfrontUrlForKey } = require('../lib/s3');

test('namespaces the key by user and keeps a safe extension', () => {
  const key = buildImageKey({ userId: 'u1', originalname: 'photo.PNG' });
  assert.match(key, /^posts\/u1\/\d+-[0-9a-f]{16}\.png$/);
});

test('coerces an unlisted extension to .jpg', () => {
  const key = buildImageKey({ userId: 'u1', originalname: 'payload.exe' });
  assert.ok(key.endsWith('.jpg'));
});

test('falls back to anon when there is no user', () => {
  const key = buildImageKey({ originalname: 'x.jpg' });
  assert.ok(key.startsWith('posts/anon/'));
});

test('keys are unique for identical inputs', () => {
  const args = { userId: 'u1', originalname: 'x.jpg' };
  assert.notEqual(buildImageKey(args), buildImageKey(args));
});

test('cloudfrontUrlForKey throws when the domain is unset', () => {
  const saved = process.env.CLOUDFRONT_DOMAIN;
  delete process.env.CLOUDFRONT_DOMAIN;

  try {
    assert.throws(() => cloudfrontUrlForKey('posts/u1/x.jpg'), /CLOUDFRONT_DOMAIN/);
  } finally {
    if (saved !== undefined) process.env.CLOUDFRONT_DOMAIN = saved;
  }
});

test('cloudfrontUrlForKey builds an https url', () => {
  const saved = process.env.CLOUDFRONT_DOMAIN;
  process.env.CLOUDFRONT_DOMAIN = 'cdn.example.net';

  try {
    assert.equal(
      cloudfrontUrlForKey('posts/u1/x.jpg'),
      'https://cdn.example.net/posts/u1/x.jpg'
    );
  } finally {
    if (saved === undefined) delete process.env.CLOUDFRONT_DOMAIN;
    else process.env.CLOUDFRONT_DOMAIN = saved;
  }
});
