import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  buildBootstrapPayload,
  buildLivePayload,
  loadSharedEvents,
} from '../src/utils/shared-content-contracts.js';
import { validatePrayerSubmission } from '../src/utils/prayer-contract.js';

test('bootstrap payload exposes required shared sections', () => {
  const payload = buildBootstrapPayload();

  assert.equal(payload.site.name, 'The Life Place');
  assert.equal(typeof payload.features.ministriesEnabled, 'boolean');
  assert.equal(typeof payload.features.messagesEnabled, 'boolean');
  assert.ok(payload.contact.email);
  assert.ok(payload.socials.youtube);
  assert.ok(payload.location.mapsQueryUrl);
  assert.ok(Array.isArray(payload.ministries));
  assert.ok(Array.isArray(payload.devotionals));
  assert.ok(payload.giving.bank.accountNumber);
});

test('live payload exposes watch and embed URLs', () => {
  const payload = buildLivePayload(new Date('2026-03-22T07:30:00.000Z'));

  assert.ok(typeof payload.watchUrl === 'string' && payload.watchUrl.length > 0);
  assert.ok(typeof payload.embedUrl === 'string' && payload.embedUrl.length > 0);
  assert.ok(['live', 'offline'].includes(payload.status));
});

test('events loader falls back to generated schedule when ICS is unavailable', async () => {
  const events = await loadSharedEvents(async () => ({
    ok: false,
    status: 503,
    text: async () => '',
  }));

  assert.ok(events.length > 0);
  assert.equal(events[0].summary, 'Sunday Service');
});

test('prayer validation accepts a valid shared submission', () => {
  const result = validatePrayerSubmission({
    name: 'Test Person',
    email: 'test@example.com',
    request: 'Please pray for wisdom and peace this week.',
    consent: true,
    source: 'tlp-app/prayer',
  });

  assert.equal(result.valid, true);
  assert.equal(result.submission.client, 'app');
  assert.equal(result.submission.wordsUsed > 0, true);
});

test('prayer validation rejects requests over 75 words', () => {
  const longRequest = Array.from({ length: 76 }, () => 'word').join(' ');
  const result = validatePrayerSubmission({
    name: 'Test Person',
    email: 'test@example.com',
    request: longRequest,
    consent: true,
  });

  assert.equal(result.valid, false);
  assert.equal(result.fieldErrors.request, 'Please keep your prayer request within 75 words.');
});

test('seed messages match the shared message contract shape', async () => {
  const raw = await readFile(new URL('../src/data/messages.json', import.meta.url), 'utf8');
  const messages = JSON.parse(raw);

  assert.ok(Array.isArray(messages));
  assert.ok(messages.length > 0);

  for (const message of messages) {
    assert.ok(message.id);
    assert.ok(message.title);
    assert.ok(message.preacher);
    assert.ok(message.series);
    assert.ok(message.date);
    assert.ok(message.thumbnail);
  }
});
