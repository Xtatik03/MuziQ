const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyTrack, parseName, normalizeGenreName, inferFallbackGenre } = require('./genreClassifier');

test('full metadata pipeline', async (t) => {
  await t.test('classifies well-known artists with high confidence', () => {
    const cases = [
      { title: 'City Boys', artist: 'Burna Boy', expectedGenre: 'Afrobeats', minConf: 74 },
      { title: 'Gods Plan', artist: 'Drake', expectedGenre: 'Hip-Hop', minConf: 74 },
      { title: 'Levitating', artist: 'Dua Lipa', expectedGenre: 'Pop', minConf: 60 },
      { title: 'Blinding Lights', artist: 'The Weeknd', expectedGenre: 'Pop', minConf: 60 },
      { title: 'Anti-Hero', artist: 'Taylor Swift', expectedGenre: 'Pop', minConf: 60 },
    ];

    cases.forEach(({ title, artist, expectedGenre, minConf }) => {
      const result = classifyTrack(title, artist, '');
      assert.equal(result.genre, expectedGenre, `Expected ${expectedGenre} for "${title}" by ${artist}, got ${result.genre}`);
      assert.ok(result.confidence >= minConf, `Confidence ${result.confidence} < ${minConf} for "${title}"`);
      assert.ok(result.mood, `No mood assigned for ${result.genre}`);
    });
  });

  await t.test('never returns "Unknown" genre', () => {
    const unknownCases = [
      { title: 'Random Track', artist: 'Random Artist', album: '' },
      { title: 'My Song', artist: '', album: '' },
      { title: '', artist: 'Anonymous', album: '' },
      { title: 'xyz', artist: 'abc', album: 'xyz' },
      { title: 'Instrumental Piece', artist: 'Unknown', album: 'Collection' },
    ];

    unknownCases.forEach(({ title, artist, album }) => {
      const result = classifyTrack(title, artist, album);
      assert.notEqual(result.genre, 'Unknown', `Got "Unknown" genre for: ${title || '(empty)'} / ${artist || '(empty)'}`);
      assert.ok(result.genre, 'Genre must not be empty');
      assert.ok(result.confidence >= 55, `Confidence too low: ${result.confidence}`);
    });
  });

  await t.test('parses complex filenames correctly', () => {
    const cases = [
      { filename: 'Burna Boy - City Boys.mp3', expectedArtist: 'Burna Boy', expectedTitle: 'City Boys' },
      { filename: 'Drake by OVO Sound.m4a', expectedArtist: 'Drake', expectedTitle: 'OVO Sound' },
      { filename: 'Song (Remix Mix).flac', expectedArtist: 'Song', expectedTitle: 'Remix Mix' },
      { filename: 'just_a_song.mp3', expectedArtist: 'Unknown Artist', expectedTitle: 'just a song' },
    ];

    cases.forEach(({ filename, expectedArtist, expectedTitle }) => {
      const { artist, title } = parseName(filename);
      assert.equal(artist, expectedArtist, `Artist mismatch for "${filename}"`);
      assert.equal(title, expectedTitle, `Title mismatch for "${filename}"`);
    });
  });

  await t.test('fallback genre chain works', () => {
    const cases = [
      { text: 'afro beat rap', expectedGenre: 'Afrobeats' },
      { text: 'deep house club', expectedGenre: 'House' },
      { text: 'electronic trance', expectedGenre: 'Electronic' },
      { text: 'classical symphony piano', expectedGenre: 'Classical' },
      { text: 'unknown random words xyz', expectedGenre: 'Pop' }, // Final fallback
    ];

    cases.forEach(({ text, expectedGenre }) => {
      const genre = inferFallbackGenre(text);
      assert.equal(genre, expectedGenre, `Fallback failed for "${text}": got ${genre}, expected ${expectedGenre}`);
    });
  });

  await t.test('normalizeGenreName maps external data correctly', () => {
    const cases = [
      { input: 'Hip-Hop', expected: 'Hip-Hop' },
      { input: 'Hip Hop', expected: 'Hip-Hop' },
      { input: 'Electronic Dance Music', expected: null }, // Not exact match
      { input: 'Pop', expected: 'Pop' },
      { input: 'Trap', expected: 'Trap' },
      { input: 'K-Pop', expected: 'K-Pop' },
    ];

    cases.forEach(({ input, expected }) => {
      const result = normalizeGenreName(input);
      assert.equal(result, expected, `Genre name normalization failed for "${input}": got ${result}, expected ${expected}`);
    });
  });
});
