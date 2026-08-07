// test/adminMiddleware.test.js
const test = require('node:test');
const assert = require('node:assert/strict');

const adminMiddleware = require('../middleware/adminMiddleware');
const { adminUsernames } = adminMiddleware;

function mockRes() {
  return {
    statusCode: null,
    sendStatus(code) { this.statusCode = code; return this; },
  };
}

test.afterEach(() => {
  delete process.env.ADMIN_USERNAMES;
});

test('parses a comma separated allowlist', () => {
  process.env.ADMIN_USERNAMES = 'fernando, ops-bot ,';
  assert.deepEqual(adminUsernames(), ['fernando', 'ops-bot']);
});

test('an unset allowlist names nobody', () => {
  assert.deepEqual(adminUsernames(), []);
});

test('denies when ADMIN_USERNAMES is unset, even with a session', async () => {
  const res = mockRes();
  let nextCalled = false;

  await adminMiddleware(
    { session: { userId: '507f1f77bcf86cd799439011' } },
    res,
    () => { nextCalled = true; }
  );

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
});

test('denies an anonymous request', async () => {
  process.env.ADMIN_USERNAMES = 'fernando';
  const res = mockRes();
  let nextCalled = false;

  await adminMiddleware({ session: {} }, res, () => { nextCalled = true; });

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
});

test('denies a malformed session id without querying the database', async () => {
  process.env.ADMIN_USERNAMES = 'fernando';
  const res = mockRes();

  await adminMiddleware({ session: { userId: 'not-an-objectid' } }, res, () => {});

  assert.equal(res.statusCode, 403);
});
