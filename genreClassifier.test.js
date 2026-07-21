const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyTrack, parseName } = require('./genreClassifier');

test('classifies afrobeat and hip-hop artists with strong confidence', () => {
  const afro = classifyTrack('City Boys', 'Burna Boy', 'I Told Them');
  assert.equal(afro.genre, 'Afrobeats');
  assert.ok(afro.confidence >= 76);

  const hipHop = classifyTrack('God’s Plan', 'Drake', 'Scorpion');
  assert.equal(hipHop.genre, 'Hip-Hop');
  assert.ok(hipHop.confidence >= 76);
});

test('uses a fallback genre when the title is ambiguous', () => {
  const result = classifyTrack('Midnight Drive', 'Unknown Artist', '');
  assert.ok(result.genre);
  assert.notEqual(result.genre, 'Unknown');
});

test('parses filenames into artist and title', () => {
  const parsed = parseName('Burna Boy - City Boys.mp3');
  assert.equal(parsed.artist, 'Burna Boy');
  assert.equal(parsed.title, 'City Boys');
});
