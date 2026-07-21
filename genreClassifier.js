const GENRE_KEYWORDS = [
  { genre: 'Afrobeats', keywords: ['afrobeats', 'afro', 'afropop', 'amapiano', 'burna boy', 'burna', 'davido', 'wizkid', 'rema', 'asake', 'olamide', 'fireboy', 'ckay', 'tiwa savage', 'kizz daniel', 'naija', 'nigerian', 'african pop'] },
  { genre: 'Dancehall', keywords: ['dancehall', 'vybz kartel', 'popcaan', 'alkaline', 'shaggy', 'beenie man', 'jamai', 'jamaican dancehall'] },
  { genre: 'Reggae', keywords: ['reggae', 'bob marley', 'damian marley', 'chronixx', 'protoje', 'sizzla', 'buju', 'ska', 'roots reggae'] },
  { genre: 'Trap', keywords: ['trap', 'young thug', '21 savage', 'gunna', 'future', 'lil baby', 'lil durk', 'drill', 'pop smoke', 'central cee', 'headie one', 'kodak black', 'migos'] },
  { genre: 'Hip-Hop', keywords: ['hip hop', 'hip-hop', 'rap', 'drake', 'kendrick lamar', 'kanye west', 'jay z', 'eminem', 'nicki minaj', 'cardi b', 'j. cole', 'big sean', 'meek mill', 'rick ross', 'lil wayne', 'snoop dogg', 'nas', 'biggie', '2pac', 'a$ap', 'asap', 'travis scott', 'schoolboy', 'rapper'] },
  { genre: 'K-Pop', keywords: ['k-pop', 'kpop', 'bts', 'blackpink', 'twice', 'exo', 'got7', 'stray kids', 'red velvet', 'aespa', 'itzy', 'nct', 'enhypen', 'seventeen', 'shinee', 'bigbang', 'korean pop', 'korean'] },
  { genre: 'Latin', keywords: ['latin', 'reggaeton', 'bad bunny', 'j balvin', 'ozuna', 'maluma', 'daddy yankee', 'nicky jam', 'farruko', 'rauw alejandro', 'karol g', 'rosalia', 'salsa', 'bachata', 'cumbia', 'brazil', 'spanish', 'mexican'] },
  { genre: 'R&B', keywords: ['r&b', 'rnb', 'r and b', 'sza', 'frank ocean', 'beyonce', 'beyoncé', 'alicia keys', 'usher', 'miguel', 'daniel caesar', '6lack', 'ella mai', 'khalid', 'giveon', 'brent faiyaz', 'slow jam', 'soulful'] },
  { genre: 'Soul', keywords: ['soul', 'neo soul', 'erykah badu', 'lauryn hill', 'jill scott', 'maxwell', 'marvin gaye', 'stevie wonder', 'otis redding', 'sam cooke', 'dangelo'] },
  { genre: 'Gospel', keywords: ['gospel', 'kirk franklin', 'lecrae', 'tye tribbett', 'fred hammond', 'travis greene', 'cece winans', 'church', 'worship'] },
  { genre: 'House', keywords: ['house', 'calvin harris', 'david guetta', 'afrojack', 'martin garrix', 'tiesto', 'tiësto', 'disclosure', 'fisher', 'chris lake', 'john summit', 'deep house', 'club house'] },
  { genre: 'Techno', keywords: ['techno', 'skrillex', 'deadmau5', 'charlotte de witte', 'nina kraviz', 'minimal techno'] },
  { genre: 'Electronic', keywords: ['electronic', 'edm', 'avicii', 'alan walker', 'marshmello', 'diplo', 'flume', 'porter robinson', 'madeon', 'illenium', 'trance', 'ambient'] },
  { genre: 'Drum & Bass', keywords: ['drum and bass', 'drum & bass', 'dnb', 'chase & status', 'pendulum', 'noisia', 'sub focus', 'liquid dnb'] },
  { genre: 'Metal', keywords: ['metal', 'metallica', 'iron maiden', 'black sabbath', 'slayer', 'megadeth', 'pantera', 'tool', 'avenged sevenfold', 'hardcore', 'heavy metal'] },
  { genre: 'Rock', keywords: ['rock', 'nirvana', 'radiohead', 'arctic monkeys', 'pearl jam', 'foo fighters', 'green day', 'red hot chili peppers', 'the killers', 'muse', 'punk', 'alternative rock'] },
  { genre: 'Indie Pop', keywords: ['indie', 'indie pop', 'tame impala', 'vampire weekend', 'mgmt', 'beach house', 'the 1975', 'the national', 'bon iver', 'sufjan', 'fleet foxes', 'alt-j', 'alt pop'] },
  { genre: 'Classical', keywords: ['classical', 'beethoven', 'mozart', 'chopin', 'bach', 'schubert', 'brahms', 'tchaikovsky', 'vivaldi', 'handel', 'debussy', 'orchestral', 'piano', 'symphony'] },
  { genre: 'Country', keywords: ['country', 'luke combs', 'morgan wallen', 'blake shelton', 'kenny rogers', 'johnny cash', 'dolly parton', 'garth brooks', 'cowboy', 'bluegrass'] },
  { genre: 'Blues', keywords: ['blues', 'b.b. king', 'muddy waters', 'howlin wolf', 'john lee hooker', 'buddy guy', 'bb king'] },
  { genre: 'Folk', keywords: ['folk', 'acoustic', 'iron & wine', 'noah kahan', 'phoebe bridgers', 'big thief', 'gregory alan isakov', 'campfire', 'folk pop'] },
  { genre: 'Dark Pop', keywords: ['billie eilish', 'lorde', 'halsey', 'melanie martinez', 'marina', 'banks', 'dark pop'] },
  { genre: 'Dance-Pop', keywords: ['lady gaga', 'katy perry', 'carly rae', 'meghan trainor', 'jason derulo', 'pitbull', 'flo rida', 'dance', 'club', 'dance pop', 'club pop'] },
  { genre: 'Pop Rock', keywords: ['imagine dragons', 'one republic', 'onerepublic', 'maroon 5', 'train', 'walk the moon', 'pop rock'] },
  { genre: 'Pop', keywords: ['pop', 'taylor swift', 'ariana grande', 'dua lipa', 'ed sheeran', 'harry styles', 'the weeknd', 'charlie puth', 'shawn mendes', 'selena gomez', 'doja cat', 'olivia rodrigo', 'post malone', 'sam smith', 'adele', 'summer pop'] },
];

const FALLBACK_RULES = [
  { genre: 'Afrobeats', keywords: ['afro', 'afrobeats', 'amapiano', 'nigerian', 'naija', 'african'] },
  { genre: 'Dancehall', keywords: ['dancehall', 'caribbean', 'jamaican'] },
  { genre: 'Hip-Hop', keywords: ['rap', 'rapper', 'hip hop', 'hip-hop', 'verse', 'beat', 'mixtape'] },
  { genre: 'R&B', keywords: ['rnb', 'r and b', 'r&b', 'smooth', 'slow jam'] },
  { genre: 'Soul', keywords: ['soul', 'neo soul', 'smooth soul'] },
  { genre: 'Gospel', keywords: ['gospel', 'church', 'worship'] },
  { genre: 'House', keywords: ['house', 'club', 'deep house', 'nightclub'] },
  { genre: 'Techno', keywords: ['techno', 'minimal'] },
  { genre: 'Electronic', keywords: ['edm', 'electronic', 'trance', 'synth'] },
  { genre: 'Drum & Bass', keywords: ['drum and bass', 'drum & bass', 'dnb'] },
  { genre: 'Metal', keywords: ['metal', 'hardcore', 'heavy'] },
  { genre: 'Rock', keywords: ['rock', 'punk', 'alt', 'indie rock'] },
  { genre: 'Indie Pop', keywords: ['indie', 'indie pop', 'alt pop'] },
  { genre: 'Classical', keywords: ['classical', 'orchestral', 'piano', 'symphony'] },
  { genre: 'Country', keywords: ['country', 'cowboy', 'bluegrass'] },
  { genre: 'Blues', keywords: ['blues', 'blue'] },
  { genre: 'Folk', keywords: ['folk', 'acoustic', 'campfire'] },
  { genre: 'K-Pop', keywords: ['k-pop', 'kpop', 'korean'] },
  { genre: 'Latin', keywords: ['latin', 'reggaeton', 'salsa', 'brazil', 'spanish', 'mexican'] },
  { genre: 'Dance-Pop', keywords: ['dance', 'dance pop', 'club pop', 'club'] },
  { genre: 'Pop', keywords: ['pop', 'radio', 'mainstream'] },
];

const MOOD_MAP = {
  Metal: 'Aggressive',
  Trap: 'Hype',
  'Drum & Bass': 'Energetic',
  Electronic: 'Energetic',
  House: 'Energetic',
  'Dance-Pop': 'Uplifting',
  'K-Pop': 'Uplifting',
  Reggae: 'Uplifting',
  Afrobeats: 'Uplifting',
  Classical: 'Melancholic',
  Jazz: 'Chill',
  Soul: 'Melancholic',
  Blues: 'Melancholic',
  Folk: 'Melancholic',
  'R&B': 'Chill',
  'Hip-Hop': 'Chill',
  Gospel: 'Spiritual',
  'Dark Pop': 'Melancholic',
  Pop: 'Uplifting',
  Rock: 'Energetic',
  'Indie Pop': 'Balanced',
  Latin: 'Energetic',
  Country: 'Balanced',
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s&+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeGenreName(value) {
  const normalized = normalizeText(value);
  const genreMap = {
    'hip hop': 'Hip-Hop',
    'hip-hop': 'Hip-Hop',
    'rap': 'Hip-Hop',
    'rnb': 'R&B',
    'rhythm and blues': 'R&B',
    'soul': 'Soul',
    'gospel': 'Gospel',
    'house': 'House',
    'techno': 'Techno',
    'electronic': 'Electronic',
    'dance': 'Dance-Pop',
    'dance pop': 'Dance-Pop',
    'club pop': 'Dance-Pop',
    'pop': 'Pop',
    'rock': 'Rock',
    'indie': 'Indie Pop',
    'indie pop': 'Indie Pop',
    'folk': 'Folk',
    'country': 'Country',
    'classical': 'Classical',
    'jazz': 'Jazz',
    'metal': 'Metal',
    'blues': 'Blues',
    'reggae': 'Reggae',
    'latin': 'Latin',
    'k pop': 'K-Pop',
    'k-pop': 'K-Pop',
    'afrobeats': 'Afrobeats',
    'afro': 'Afrobeats',
    'dancehall': 'Dancehall',
    'trap': 'Trap',
    'drum and bass': 'Drum & Bass',
    'drum & bass': 'Drum & Bass',
    'dnb': 'Drum & Bass',
    'dark pop': 'Dark Pop',
    'pop rock': 'Pop Rock',
    'alternative rock': 'Rock',
  };
  return genreMap[normalized] || null;
}

function inferFallbackGenre(text) {
  const hay = normalizeText(text);
  for (const rule of FALLBACK_RULES) {
    if (rule.keywords.some((keyword) => hay.includes(keyword))) {
      return rule.genre;
    }
  }
  return 'Pop';
}

function classifyTrack(title, artist, album) {
  const hay = normalizeText(`${title || ''} ${artist || ''} ${album || ''}`);
  const artistNorm = normalizeText(artist);
  let bestGenre = null;
  let bestScore = 0;

  for (const entry of GENRE_KEYWORDS) {
    for (const keyword of entry.keywords) {
      const keywordNorm = normalizeText(keyword);
      if (hay.includes(keywordNorm)) {
        const score = keywordNorm.length + (keywordNorm === artistNorm ? 10 : 0);
        if (score > bestScore) {
          bestScore = score;
          bestGenre = entry.genre;
        }
      }
    }
  }

  const fallbackGenre = inferFallbackGenre(hay);
  const genre = bestGenre || fallbackGenre;
  const confidence = bestGenre
    ? Math.min(97, 74 + Math.min(15, Math.floor(bestScore / 4)) + (artistNorm && hay.includes(artistNorm) ? 4 : 0))
    : Math.min(86, 58 + Math.floor(fallbackGenre.length / 4));

  return {
    genre,
    confidence: Math.max(55, confidence),
    mood: MOOD_MAP[genre] || 'Balanced',
  };
}

function parseName(filename) {
  const clean = (filename || '').replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();
  const normalized = clean.replace(/\s+/g, ' ');
  const patterns = [
    /^(.+?)\s*[-–—:|]\s*(.+)$/i,
    /^(.+?)\s+by\s+(.+)$/i,
    /^(.+?)\s+\((.+)\)$/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      return { artist: match[1].trim(), title: match[2].trim() };
    }
  }

  return { artist: 'Unknown Artist', title: normalized || 'Unknown Title' };
}

module.exports = {
  classifyTrack,
  parseName,
  normalizeGenreName,
  normalizeText,
  inferFallbackGenre,
};
