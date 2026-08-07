// test/interactionEvent.test.js
const test = require('node:test');
const assert = require('node:assert/strict');

const InteractionEvent = require('../models/InteractionEvent');
const { coerceMetadata } = InteractionEvent;

test('EVENT_TYPES survives the module.exports reassignment', () => {
  assert.ok(Array.isArray(InteractionEvent.EVENT_TYPES));
  assert.ok(InteractionEvent.EVENT_TYPES.includes('view_feed'));
});

test('drops keys the sub-schema does not declare', () => {
  const meta = coerceMetadata('view_feed', { postCount: 3, injected: 'nope' });
  assert.deepEqual(meta, { postCount: 3 });
});

test('fills declared keys with their defaults when missing', () => {
  const meta = coerceMetadata('create_post', {});
  assert.deepEqual(meta, { category: null, hasImage: null, tagsCount: 0 });
});

test('casts to the declared type', () => {
  const meta = coerceMetadata('view_feed', { postCount: '12' });
  assert.equal(meta.postCount, 12);
  assert.equal(typeof meta.postCount, 'number');
});

test('throws CastError on a type mismatch', () => {
  assert.throws(
    () => coerceMetadata('view_post', { hasImage: 'not-a-boolean' }),
    err => err.name === 'CastError'
  );
});

test('unknown event type yields empty metadata', () => {
  assert.deepEqual(coerceMetadata('login', { anything: 1 }), {});
  assert.deepEqual(coerceMetadata('logout', undefined), {});
});

test('null and undefined metadata fall back to defaults', () => {
  assert.deepEqual(coerceMetadata('view_reactions', null), {
    myEmoji: null,
    category: null,
  });
});

test('view_reactions accepts the category the controller sends', () => {
  const meta = coerceMetadata('view_reactions', { myEmoji: 'love', category: 'pets' });
  assert.deepEqual(meta, { myEmoji: 'love', category: 'pets' });
});

test('pre-validate hook applies coercion to the document', async () => {
  const doc = new InteractionEvent({
    eventType: 'view_feed',
    metadata: { postCount: '4', stowaway: true },
  });

  await doc.validate();

  assert.deepEqual(doc.metadata, { postCount: 4 });
});

test('pre-validate hook rejects a bad metadata type', async () => {
  const doc = new InteractionEvent({
    eventType: 'create_post',
    metadata: { tagsCount: 'plenty' },
  });

  await assert.rejects(() => doc.validate());
});
