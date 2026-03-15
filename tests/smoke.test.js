import assert from 'node:assert/strict';
import test from 'node:test';

import { createEmptyLibrary, createStarterSummary } from '../src/library.js';

// Each test checks one small behavior.
// `assert.equal(actual, expected)` compares the real result with what you expected.
test('createStarterSummary returns a readable message', () => {
  assert.equal(createStarterSummary('My Library'), 'My Library starter ready.');
});

test('createEmptyLibrary starts with no books', () => {
  assert.deepEqual(createEmptyLibrary(), []);
});
