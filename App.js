import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  StatusBar, SafeAreaView, ActivityIndicator, Alert,
  Dimensions, ScrollView, Modal, Platform,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';

const { width: W, height: H } = Dimensions.get('window');
const isCompactScreen = W < 380;
const playerArtSize = Math.min(W - 48, 320);
const playerPad = Math.max(16, W * 0.06);

// ─── Theme ───────────────────────────────────────────────────
const C = {
  bg:      '#0a0a12',
  surface: '#10101e',
  card:    '#161628',
  raised:  '#1e1e32',
  border:  'rgba(255,255,255,0.07)',
  gold:    '#f5c842',
  coral:   '#ff5f6d',
  teal:    '#00e5c0',
  text:    '#eeeaf8',
  text2:   'rgba(238,234,248,0.55)',
  text3:   'rgba(238,234,248,0.28)',
};

// ─── Genre config ─────────────────────────────────────────────
const GENRES = {
  'Afrobeats':   ['rgba(245,200,66,.2)',  '#f5c842', '🌍'],
  'Hip-Hop':     ['rgba(255,95,109,.18)', '#ff5f6d', '🎤'],
  'Trap':        ['rgba(255,80,130,.15)', '#ff507a', '🌀'],
  'Pop':         ['rgba(167,139,250,.18)','#a78bfa', '⭐'],
  'Dance-Pop':   ['rgba(56,189,248,.15)', '#38bdf8', '💃'],
  'Dark Pop':    ['rgba(120,80,200,.2)',  '#9060d0', '🖤'],
  'R&B':         ['rgba(255,160,80,.18)', '#ffa050', '🎶'],
  'Soul':        ['rgba(220,140,60,.18)', '#dc8c3c', '🕯️'],
  'Jazz':        ['rgba(56,189,248,.15)', '#38bdf8', '🎺'],
  'Electronic':  ['rgba(0,229,192,.18)',  '#00e5c0', '⚡'],
  'House':       ['rgba(0,200,170,.15)',  '#00c8aa', '🏠'],
  'Techno':      ['rgba(100,160,255,.15)','#64a0ff', '🤖'],
  'Drum & Bass': ['rgba(150,80,255,.18)', '#9650ff', '💥'],
  'Rock':        ['rgba(255,140,60,.18)', '#ff8c3c', '🤘'],
  'Indie Pop':   ['rgba(0,229,192,.15)',  '#00e5c0', '🌊'],
  'Metal':       ['rgba(150,70,70,.22)',  '#b04040', '⚔️'],
  'Reggae':      ['rgba(80,200,80,.18)',  '#50c850', '🌿'],
  'Dancehall':   ['rgba(60,210,100,.15)', '#3cd264', '🎪'],
  'K-Pop':       ['rgba(255,130,190,.18)','#ff82be', '✨'],
  'Latin':       ['rgba(255,100,60,.18)', '#ff643c', '💃'],
  'Classical':   ['rgba(190,180,220,.15)','#bebcd8', '🎼'],
  'Country':     ['rgba(200,150,60,.18)', '#c8963c', '🤠'],
  'Gospel':      ['rgba(245,200,66,.18)', '#f5c842', '✝️'],
  'Blues':       ['rgba(56,120,200,.15)', '#3878c8', '😢'],
  'Folk':        ['rgba(170,130,70,.18)', '#aa8246', '🎻'],
  'Pop Rock':    ['rgba(245,200,66,.18)', '#f5c842', '🎸'],
  'Unknown':     ['rgba(130,130,150,.15)','#888899', '🎵'],
};

function getStyle(genre) { return GENRES[genre] || GENRES['Unknown']; }

// ─── Classifier ───────────────────────────────────────────────
const KW = [
  { g:'Afrobeats',   k:['afrobeat','afropop','wizkid','burna','rema','davido','tiwa','kizz','omah','ckay','fireboy','joeboy','tems','asake','olamide','naira marley','amapiano'] },
  { g:'Dancehall',   k:['dancehall','vybz kartel','popcaan','alkaline','shaggy','beenie man'] },
  { g:'Reggae',      k:['reggae','bob marley','damian marley','chronixx','protoje','sizzla','buju','ska'] },
  { g:'Trap',        k:['trap','young thug','21 savage','gunna','lil baby','future','2 chainz','drill','pop smoke','central cee','headie one','kodak'] },
  { g:'Hip-Hop',     k:['hip-hop','hip hop','rap','drake','kendrick','kanye','jay-z','eminem','nicki minaj','cardi b','j. cole','big sean','meek mill','rick ross','lil wayne','snoop','nas','biggie','tupac','a$ap','asap','travis scott','schoolboy','rapper'] },
  { g:'K-Pop',       k:['k-pop','kpop','bts','blackpink','twice','exo','got7','stray kids','red velvet','aespa','itzy','nct','enhypen','seventeen','shinee','bigbang','korean pop'] },
  { g:'Latin',       k:['latin','reggaeton','bad bunny','j balvin','ozuna','maluma','daddy yankee','nicky jam','farruko','rauw alejandro','karol g','rosalia','salsa','bachata','cumbia','brazil','spanish'] },
  { g:'R&B',         k:['r&b','rnb','r n b','sza','frank ocean','beyonce','beyoncé','alicia keys','usher','miguel','daniel caesar','6lack','ella mai','khalid','giveon','brent faiyaz','soulful'] },
  { g:'Soul',        k:['soul','neo soul','erykah badu','lauryn hill','jill scott','maxwell','marvin gaye','stevie wonder','otis redding','sam cooke','d\'angelo'] },
  { g:'Gospel',      k:['gospel','kirk franklin','lecrae','tye tribbett','fred hammond','travis greene','cece winans','church'] },
  { g:'House',       k:['house','calvin harris','david guetta','afrojack','martin garrix','tiesto','tiësto','disclosure','fisher','chris lake','john summit'] },
  { g:'Techno',      k:['techno','skrillex','deadmau5','charlotte de witte','nina kraviz'] },
  { g:'Electronic',  k:['electronic','edm','avicii','alan walker','marshmello','diplo','flume','porter robinson','madeon','illenium','trance'] },
  { g:'Drum & Bass', k:['drum and bass','drum & bass','dnb','chase & status','pendulum','noisia','sub focus'] },
  { g:'Metal',       k:['metal','metallica','iron maiden','black sabbath','slayer','megadeth','pantera','tool','avenged sevenfold','hardcore'] },
  { g:'Rock',        k:['rock','nirvana','radiohead','arctic monkeys','pearl jam','foo fighters','green day','red hot chili peppers','the killers','muse','punk'] },
  { g:'Indie Pop',   k:['indie','tame impala','vampire weekend','mgmt','beach house','the 1975','the national','bon iver','sufjan','fleet foxes','alt-j'] },
  { g:'Classical',   k:['classical','beethoven','mozart','chopin','bach','schubert','brahms','tchaikovsky','vivaldi','handel','debussy','orchestral','piano'] },
  { g:'Country',     k:['country','luke combs','morgan wallen','blake shelton','kenny rogers','johnny cash','dolly parton','garth brooks','cowboy'] },
  { g:'Blues',       k:['blues','b.b. king','muddy waters','howlin wolf','john lee hooker','buddy guy'] },
  { g:'Folk',        k:['folk','acoustic','iron & wine','noah kahan','phoebe bridgers','big thief','gregory alan isakov','campfire'] },
  { g:'Dark Pop',    k:['billie eilish','lorde','halsey','melanie martinez','marina','banks'] },
  { g:'Dance-Pop',   k:['lady gaga','katy perry','carly rae','meghan trainor','jason derulo','pitbull','flo rida','dance','club'] },
  { g:'Pop Rock',    k:['imagine dragons','onerepublic','maroon 5','train','walk the moon'] },
  { g:'Pop',         k:['pop','taylor swift','ariana grande','dua lipa','ed sheeran','harry styles','the weeknd','charlie puth','shawn mendes','selena gomez','doja cat','olivia rodrigo','post malone','sam smith','adele'] },
];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s&+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferFallbackGenre(text) {
  const hay = normalizeText(text);
  const fallbackRules = [
    { g:'Afrobeats', k:['afro','afrobeats','amapiano','nigerian','naija'] },
    { g:'Dancehall', k:['dancehall','dancehall','reggae'] },
    { g:'Hip-Hop', k:['rap','rapper','hip hop','hip-hop','beat','verse'] },
    { g:'R&B', k:['rnb','r and b','r&b','smooth','slow jam'] },
    { g:'Soul', k:['soul','neo soul'] },
    { g:'Gospel', k:['gospel','church','worship'] },
    { g:'House', k:['house','club','deep house'] },
    { g:'Techno', k:['techno','minimal'] },
    { g:'Electronic', k:['edm','electronic','trance'] },
    { g:'Drum & Bass', k:['drum and bass','drum & bass','dnb'] },
    { g:'Metal', k:['metal','hardcore','heavy'] },
    { g:'Rock', k:['rock','punk','alt'] },
    { g:'Indie Pop', k:['indie','alt pop','indie pop'] },
    { g:'Classical', k:['classical','orchestral','piano'] },
    { g:'Country', k:['country','cowboy'] },
    { g:'Blues', k:['blues','blue'] },
    { g:'Folk', k:['folk','acoustic'] },
    { g:'K-Pop', k:['k-pop','kpop','korean'] },
    { g:'Latin', k:['latin','reggaeton','salsa','brazil','spanish','mexican'] },
    { g:'Dance-Pop', k:['dance','pop dance','club'] },
  ];
  for (const { g, k } of fallbackRules) {
    if (k.some(kw => hay.includes(kw))) return g;
  }
  return 'Pop';
}

function classify(title, artist, album) {
  const hay = normalizeText(`${title} ${artist} ${album}`);
  const artistNorm = normalizeText(artist);
  let bestG = null, bestScore = 0;
  for (const { g, k } of KW) {
    for (const kw of k) {
      const kwNorm = normalizeText(kw);
      if (hay.includes(kwNorm)) {
        const score = kwNorm.length + (kwNorm === artistNorm ? 10 : 0);
        if (score > bestScore) { bestScore = score; bestG = g; }
      }
    }
  }
  const fallback = inferFallbackGenre(hay);
  const genre = bestG || fallback;
  const confidence = bestG
    ? Math.min(97, 62 + Math.floor(bestScore * 1.4))
    : fallback === 'Pop' ? 56 : Math.min(86, 64 + Math.floor(fallback.length / 3));
  const moodMap = {
    'Metal':'Aggressive','Trap':'Hype','Drum & Bass':'Energetic',
    'Electronic':'Energetic','House':'Energetic','Dance-Pop':'Uplifting',
    'K-Pop':'Uplifting','Reggae':'Uplifting','Afrobeats':'Uplifting',
    'Classical':'Melancholic','Jazz':'Chill','Soul':'Melancholic',
    'Blues':'Melancholic','Folk':'Melancholic','R&B':'Chill',
    'Hip-Hop':'Chill','Gospel':'Spiritual','Dark Pop':'Melancholic',
    'Pop':'Uplifting','Rock':'Energetic','Indie Pop':'Balanced',
  };
  return { genre, confidence, mood: moodMap[genre] || 'Balanced' };
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
    const m = normalized.match(pattern);
    if (m) return { artist: m[1].trim(), title: m[2].trim() };
  }
  return { artist: 'Unknown', title: normalized || 'Unknown' };
}

function mapLookupGenre(genreName) {
  const normalized = normalizeText(genreName || '');
  const genreMap = {
    'hip hop': 'Hip-Hop',
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
  };
  return genreMap[normalized] || null;
}

async function lookupTrackMetadata(title, artist, fallbackGenre) {
  try {
    const query = [title, artist].filter(Boolean).join(' ').trim();
    if (!query || query === 'Unknown') return null;
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const hit = data.results?.[0];
    if (!hit) return null;
    const resolvedTitle = hit.trackName || title;
    const resolvedArtist = hit.artistName || artist;
    const genre = mapLookupGenre(hit.primaryGenreName) || fallbackGenre || null;
    return {
      title: resolvedTitle,
      artist: resolvedArtist,
      album: hit.collectionName || '',
      genre,
    };
  } catch (error) {
    return null;
  }
}

function fmtTime(ms) {
  if (!ms || isNaN(ms)) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function fmtDur(sec) {
  if (!sec) return '';
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('library');
  const [songs, setSongs] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [refreshingMetadata, setRefreshingMetadata] = useState(false);
  const [scanProg, setScanProg] = useState({ cur: 0, total: 0, name: '' });
  const [error, setError] = useState('');

  // Player state (expo-audio hook-based)
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const [nowPlaying, setNowPlaying] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const queueRef = useRef([]);
  const queueIdxRef = useRef(-1);
  const lastFinishedRef = useRef(false);

  const isPlaying = status?.playing || false;
  const position = (status?.currentTime || 0) * 1000;  // expo-audio uses seconds
  const duration = (status?.duration || 0) * 1000;

  // Setup audio mode on mount
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
  }, []);

  // Detect track finished -> auto play next
  useEffect(() => {
    if (status?.didJustFinish && !lastFinishedRef.current) {
      lastFinishedRef.current = true;
      playNext();
    } else if (!status?.didJustFinish) {
      lastFinishedRef.current = false;
    }
  }, [status?.didJustFinish]);

  // ── Scan library ──
  const scanLibrary = useCallback(async () => {
    setError('');
    try {
      const { status: permStatus } = await MediaLibrary.requestPermissionsAsync();
      if (permStatus !== 'granted') {
        setError('Permission denied. Please allow music access in Settings.');
        return;
      }
      setScanning(true);
      setSongs([]);
      let all = [], after = undefined, hasMore = true;
      while (hasMore) {
        const page = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: 200, after,
        });
        all = all.concat(page.assets);
        after = page.endCursor;
        hasMore = page.hasNextPage;
      }
      if (!all.length) { setError('No music found on device.'); setScanning(false); return; }
      setScanProg({ cur: 0, total: all.length, name: '' });
      const result = [];
      for (let i = 0; i < all.length; i++) {
        const a = all[i];
        const { artist, title } = parseName(a.filename);
        setScanProg({ cur: i + 1, total: all.length, name: title });
        let uri = a.uri;
        try { const info = await MediaLibrary.getAssetInfoAsync(a); uri = info.localUri || a.uri; } catch {}
        const initialClassification = classify(title, artist, '');
        const shouldLookup = !artist || artist === 'Unknown' || !title || title === 'Unknown' || initialClassification.genre === 'Unknown' || initialClassification.confidence < 60;
        const metadata = shouldLookup ? await lookupTrackMetadata(title, artist, initialClassification.genre) : null;
        const resolvedTitle = metadata?.title || title;
        const resolvedArtist = metadata?.artist || artist;
        const enrichedClassification = classify(resolvedTitle, resolvedArtist, metadata?.album || '');
        const finalGenre = metadata?.genre || enrichedClassification.genre;
        const finalConfidence = metadata?.genre ? Math.min(97, Math.max(enrichedClassification.confidence, 72)) : enrichedClassification.confidence;
        result.push({ id: a.id, uri, title: resolvedTitle, artist: resolvedArtist, duration: a.duration, genre: finalGenre, confidence: finalConfidence, mood: enrichedClassification.mood });
        if (i % 20 === 0) { setSongs([...result]); await new Promise(r => setTimeout(r, 0)); }
      }
      setSongs(result);
    } catch (e) { setError('Scan failed: ' + e.message); }
    finally { setScanning(false); }
  }, []);

  // ── Pick files ──
  const pickFiles = useCallback(async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'audio/*', multiple: true, copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) return;
      const picked = await Promise.all(res.assets.map(async (f, i) => {
        const { artist, title } = parseName(f.name);
        const initialClassification = classify(title, artist, '');
        const shouldLookup = !artist || artist === 'Unknown' || !title || title === 'Unknown' || initialClassification.genre === 'Unknown' || initialClassification.confidence < 60;
        const metadata = shouldLookup ? await lookupTrackMetadata(title, artist, initialClassification.genre) : null;
        const resolvedTitle = metadata?.title || title;
        const resolvedArtist = metadata?.artist || artist;
        const enrichedClassification = classify(resolvedTitle, resolvedArtist, metadata?.album || '');
        const finalGenre = metadata?.genre || enrichedClassification.genre;
        const finalConfidence = metadata?.genre ? Math.min(97, Math.max(enrichedClassification.confidence, 72)) : enrichedClassification.confidence;
        return { id: `pick-${i}-${Date.now()}`, uri: f.uri, title: resolvedTitle, artist: resolvedArtist, duration: 0, genre: finalGenre, confidence: finalConfidence, mood: enrichedClassification.mood };
      }));
      setSongs(prev => {
        const ids = new Set(prev.map(s => s.id));
        return [...prev, ...picked.filter(s => !ids.has(s.id))];
      });
    } catch (e) { if (!e.message?.includes('cancel')) setError('Pick failed: ' + e.message); }
  }, []);

  const refreshMetadata = useCallback(async () => {
    if (!songs.length) return;
    setError('');
    setRefreshingMetadata(true);
    try {
      const updated = await Promise.all(songs.map(async (song) => {
        const shouldLookup = !song.artist || song.artist === 'Unknown' || !song.title || song.title === 'Unknown' || song.genre === 'Unknown' || song.confidence < 65;
        const metadata = shouldLookup ? await lookupTrackMetadata(song.title, song.artist, song.genre) : null;
        if (!metadata) return song;
        const resolvedTitle = metadata.title || song.title;
        const resolvedArtist = metadata.artist || song.artist;
        const enrichedClassification = classify(resolvedTitle, resolvedArtist, metadata.album || '');
        const finalGenre = metadata.genre || enrichedClassification.genre || song.genre;
        const finalConfidence = metadata.genre ? Math.min(97, Math.max(enrichedClassification.confidence, 72)) : Math.max(song.confidence, enrichedClassification.confidence);
        return {
          ...song,
          title: resolvedTitle,
          artist: resolvedArtist,
          genre: finalGenre,
          confidence: finalConfidence,
          mood: enrichedClassification.mood,
        };
      }));
      setSongs(updated);
    } catch (e) {
      setError('Metadata refresh failed: ' + e.message);
    } finally {
      setRefreshingMetadata(false);
    }
  }, [songs]);

  // ── Play song (expo-audio) ──
  const playSong = useCallback((song, queue, idx) => {
    try {
      queueRef.current = queue || [song];
      queueIdxRef.current = idx ?? 0;
      setNowPlaying(song);
      player.replace({ uri: song.uri });
      player.play();
    } catch (e) {
      Alert.alert('Playback Error', 'Cannot play this file: ' + e.message);
    }
  }, [player]);

  const togglePlay = useCallback(() => {
    try {
      if (isPlaying) player.pause();
      else player.play();
    } catch {}
  }, [player, isPlaying]);

  const playNext = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    const next = (queueIdxRef.current + 1) % q.length;
    playSong(q[next], q, next);
  }, [playSong]);

  const playPrev = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    const prev = (queueIdxRef.current - 1 + q.length) % q.length;
    playSong(q[prev], q, prev);
  }, [playSong]);

  const seekTo = useCallback((pct) => {
    try {
      const seconds = pct * (status?.duration || 0);
      player.seekTo(seconds);
    } catch {}
  }, [player, status]);

  // ── Genre groups ──
  const genreGroups = React.useMemo(() => {
    const map = {};
    for (const s of songs) { if (!map[s.genre]) map[s.genre] = []; map[s.genre].push(s); }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
      .map(([genre, tracks]) => ({
        genre, tracks, count: tracks.length,
        avg: Math.round(tracks.reduce((a, t) => a + t.confidence, 0) / tracks.length),
      }));
  }, [songs]);

  const stats = React.useMemo(() => ({
    total: songs.length,
    genres: genreGroups.length,
    avg: songs.length ? Math.round(songs.reduce((a, s) => a + s.confidence, 0) / songs.length) : 0,
  }), [songs, genreGroups]);

  const progPct = duration > 0 ? position / duration : 0;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <SafeAreaView style={{ backgroundColor: C.surface }}>
        <View style={s.header}>
          <View style={s.logoRow}>
            <View style={s.logoMark}><Text style={{ fontSize: 16 }}>🎵</Text></View>
            <Text style={s.logoName}>MuziQ</Text>
            <View style={s.badge}><Text style={s.badgeText}>FREE</Text></View>
          </View>
          {scanning && <View style={s.livePill}><View style={s.liveDot} /><Text style={s.liveText}>SCANNING</Text></View>}
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <View style={s.tabBar}>
        {[
          { id: 'library', label: 'Library', icon: '🎵' },
          { id: 'genres',  label: 'Genres',  icon: '📊' },
          { id: 'insights',label: 'Insights',icon: '✨' },
        ].map(t => (
          <TouchableOpacity key={t.id} style={[s.tab, tab === t.id && s.tabOn]} onPress={() => setTab(t.id)}>
            <Text style={{ fontSize: 13 }}>{t.icon}</Text>
            <Text style={[s.tabLabel, tab === t.id && s.tabLabelOn]}>{t.label}</Text>
            {t.id === 'library' && songs.length > 0 && <View style={s.pill}><Text style={s.pillTxt}>{songs.length}</Text></View>}
            {t.id === 'genres'  && genreGroups.length > 0 && <View style={s.pill}><Text style={s.pillTxt}>{genreGroups.length}</Text></View>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Screens */}
      <View style={{ flex: 1 }}>
        {tab === 'library'  && <LibraryScreen songs={songs} scanning={scanning} scanProg={scanProg} error={error} stats={stats} nowPlaying={nowPlaying} refreshingMetadata={refreshingMetadata} onScan={scanLibrary} onPick={pickFiles} onRefreshMetadata={refreshMetadata} onPlay={playSong} />}
        {tab === 'genres'   && <GenresScreen  genreGroups={genreGroups} nowPlaying={nowPlaying} onPlay={playSong} />}
        {tab === 'insights' && <InsightsScreen songs={songs} genreGroups={genreGroups} stats={stats} />}
      </View>

      {/* Mini player */}
      {nowPlaying && (
        <TouchableOpacity style={s.miniPlayer} onPress={() => setPlayerOpen(true)} activeOpacity={0.9}>
          <View style={s.miniProgress}><View style={[s.miniProgFill, { width: `${progPct * 100}%` }]} /></View>
          <View style={s.miniInner}>
            <View style={[s.miniArt, { backgroundColor: getStyle(nowPlaying.genre)[0] }]}>
              <Text style={{ fontSize: 17 }}>{getStyle(nowPlaying.genre)[2]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.miniTitle} numberOfLines={1}>{nowPlaying.title}</Text>
              <Text style={s.miniArtist} numberOfLines={1}>{nowPlaying.artist}</Text>
            </View>
            <View style={s.miniControls}>
              <TouchableOpacity onPress={playPrev} style={{ padding: 6 }}><Text style={{ fontSize: 18 }}>⏮</Text></TouchableOpacity>
              <TouchableOpacity onPress={togglePlay} style={s.miniPlayBtn}>
                <Text style={{ fontSize: 16, color: C.bg }}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={playNext} style={{ padding: 6 }}><Text style={{ fontSize: 18 }}>⏭</Text></TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}

      <SafeAreaView style={{ backgroundColor: nowPlaying ? C.card : C.bg }} />

      {/* Full player modal */}
      <Modal visible={playerOpen} animationType="slide" onRequestClose={() => setPlayerOpen(false)}>
        <PlayerScreen
          song={nowPlaying}
          isPlaying={isPlaying}
          progPct={progPct}
          posStr={fmtTime(position)}
          durStr={fmtTime(duration) || fmtDur(nowPlaying?.duration)}
          onClose={() => setPlayerOpen(false)}
          onToggle={togglePlay}
          onNext={playNext}
          onPrev={playPrev}
          onSeek={seekTo}
        />
      </Modal>
    </View>
  );
}

// ─── Library Screen ───────────────────────────────────────────
function LibraryScreen({ songs, scanning, scanProg, error, stats, nowPlaying, refreshingMetadata, onScan, onPick, onRefreshMetadata, onPlay }) {
  if (!songs.length && !scanning) {
    return (
      <View style={s.empty}>
        <Text style={{ fontSize: 52, marginBottom: 18 }}>🎵</Text>
        <Text style={s.emptyTitle}>Welcome to MuziQ</Text>
        <Text style={s.emptySub}>Scan your device library or pick files. Every song gets classified by genre — free, no internet needed.</Text>
        {!!error && <Text style={s.errTxt}>{error}</Text>}
        <TouchableOpacity style={s.btnPrimary} onPress={onScan}>
          <Text style={s.btnPrimaryTxt}>📱  Scan Device Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnOutline} onPress={onPick}>
          <Text style={s.btnOutlineTxt}>📂  Pick Files</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, padding: 14, gap: 10 }}>
      {scanning && (
        <>
          <View style={s.scanCard}>
            <View style={s.eqWrap}>
              {[14,20,24,18,10].map((h, i) => <View key={i} style={[s.eqBar, { height: h }]} />)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.scanTitle} numberOfLines={1}>{scanProg.name || 'Analyzing…'}</Text>
              <Text style={s.scanMeta}>{scanProg.cur} / {scanProg.total} · Classifying genre</Text>
            </View>
            <ActivityIndicator color={C.teal} />
          </View>
          <View style={s.progTrack}>
            <View style={[s.progFill, { width: `${scanProg.total > 0 ? (scanProg.cur / scanProg.total) * 100 : 0}%` }]} />
          </View>
        </>
      )}
      {songs.length > 0 && (
        <>
          <View style={s.statsRow}>
            {[['SONGS', stats.total], ['GENRES', stats.genres], ['ACCURACY', stats.avg + '%']].map(([l, v]) => (
              <View key={l} style={s.statCard}>
                <Text style={s.statVal}>{v}</Text>
                <Text style={s.statLbl}>{l}</Text>
              </View>
            ))}
          </View>
          {!scanning && (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[s.actionBtn, { flex: 1 }]} onPress={onScan}><Text style={s.actionTxt}>🔄 Re-scan</Text></TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { flex: 1 }]} onPress={onPick}><Text style={s.actionTxt}>➕ Add Files</Text></TouchableOpacity>
              </View>
              <TouchableOpacity style={s.actionBtn} onPress={onRefreshMetadata} disabled={refreshingMetadata}>
                {refreshingMetadata ? <ActivityIndicator color={C.gold} /> : <Text style={s.actionTxt}>🧠 Refresh Metadata</Text>}
              </TouchableOpacity>
            </View>
          )}
          <Text style={s.secLbl}>CLASSIFIED SONGS</Text>
          <FlatList
            data={songs}
            keyExtractor={s => s.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
            contentContainerStyle={{ paddingBottom: 8 }}
            renderItem={({ item, index }) => {
              const [bg, tc, em] = getStyle(item.genre);
              const active = nowPlaying?.id === item.id;
              return (
                <TouchableOpacity style={[s.songCard, active && s.songCardOn]} onPress={() => onPlay(item, songs, index)} activeOpacity={0.75}>
                  <View style={[s.thumb, { backgroundColor: bg }]}>
                    <Text style={{ fontSize: 17 }}>{em}</Text>
                    {active && <View style={s.thumbOverlay}><Text style={{ fontSize: 13, color: '#fff' }}>▶</Text></View>}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[s.songTitle, active && { color: C.gold }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={s.songArtist} numberOfLines={1}>{item.artist}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 3 }}>
                    <View style={[s.genrePill, { backgroundColor: bg, borderColor: tc + '70' }]}>
                      <Text style={[s.genrePillTxt, { color: tc }]}>{item.genre}</Text>
                    </View>
                    <Text style={s.confTxt}>{item.confidence}%</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}
    </View>
  );
}

// ─── Genres Screen ────────────────────────────────────────────
function GenresScreen({ genreGroups, nowPlaying, onPlay }) {
  const [expanded, setExpanded] = useState(null);
  if (!genreGroups.length) return (
    <View style={s.empty}>
      <Text style={{ fontSize: 40, marginBottom: 14 }}>🎼</Text>
      <Text style={s.emptyTitle}>No genres yet</Text>
      <Text style={s.emptySub}>Scan your library first</Text>
    </View>
  );
  const max = genreGroups[0].count;
  return (
    <FlatList
      data={genreGroups}
      keyExtractor={g => g.genre}
      contentContainerStyle={{ padding: 14, gap: 8, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListHeaderComponent={<Text style={[s.secLbl, { marginBottom: 8 }]}>GENRE BREAKDOWN — {genreGroups.length} GENRES</Text>}
      renderItem={({ item: g, index }) => {
        const [bg, tc] = getStyle(g.genre);
        const open = expanded === g.genre;
        return (
          <View style={s.genreBlock}>
            <TouchableOpacity style={s.genreHdr} onPress={() => setExpanded(open ? null : g.genre)} activeOpacity={0.8}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={s.rank}>#{index + 1}</Text>
                <View>
                  <Text style={s.genreName}>{g.genre}</Text>
                  <Text style={s.genreMeta}>{g.count} tracks · {g.avg}% avg</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[s.genreCount, { backgroundColor: bg }]}><Text style={{ color: tc, fontFamily: 'Courier', fontSize: 11, fontWeight: '700' }}>{g.count}</Text></View>
                <Text style={{ color: C.text3, fontSize: 14 }}>{open ? '⌃' : '⌄'}</Text>
              </View>
            </TouchableOpacity>
            <View style={s.barTrack}><View style={[s.barFill, { width: `${(g.count / max) * 100}%`, backgroundColor: tc }]} /></View>
            {open && (
              <View style={{ borderTopWidth: 1, borderTopColor: C.border }}>
                {g.tracks.map((t, i) => (
                  <TouchableOpacity key={t.id} style={s.trackRow} onPress={() => onPlay(t, g.tracks, i)} activeOpacity={0.7}>
                    <Text style={s.trackNum}>{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.trackTitle, nowPlaying?.id === t.id && { color: C.gold }]} numberOfLines={1}>{t.title}</Text>
                      <Text style={s.trackArtist} numberOfLines={1}>{t.artist}</Text>
                    </View>
                    <Text style={{ color: tc, fontFamily: 'Courier', fontSize: 10 }}>{t.confidence}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

// ─── Insights Screen ──────────────────────────────────────────
function InsightsScreen({ songs, genreGroups, stats }) {
  if (!songs.length) return (
    <View style={s.empty}>
      <Text style={{ fontSize: 40, marginBottom: 14 }}>✨</Text>
      <Text style={s.emptyTitle}>No insights yet</Text>
      <Text style={s.emptySub}>Classify your library first</Text>
    </View>
  );
  const moodCounts = {};
  songs.forEach(s => { moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1; });
  const moods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  const maxMood = moods[0]?.[1] || 1;
  const artistCounts = {};
  songs.forEach(s => { artistCounts[s.artist] = (artistCounts[s.artist] || 0) + 1; });
  const artists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxArtist = artists[0]?.[1] || 1;
  const topG = genreGroups[0];
  const [topBg, topTc] = topG ? getStyle(topG.genre) : ['', ''];
  const MOOD_C = { Energetic:'#f5c842',Hype:'#ff5f6d',Uplifting:'#00e5c0',Chill:'#38bdf8',Balanced:'#a78bfa',Melancholic:'#9080c0',Aggressive:'#ff5f6d',Spiritual:'#c8b0ff',Neutral:'#888899',Unknown:'#888899' };
  const MOOD_E = { Energetic:'⚡',Hype:'🔥',Uplifting:'☀️',Chill:'🌊',Balanced:'🎵',Melancholic:'🌧️',Aggressive:'💥',Spiritual:'✨',Neutral:'😐',Unknown:'🎵' };
  return (
    <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 24, gap: 14 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {[['SONGS', stats.total], ['GENRES', stats.genres], ['ACCURACY', stats.avg + '%'], ['ARTISTS', Object.keys(artistCounts).length]].map(([l, v]) => (
          <View key={l} style={[s.statCard, { minWidth: '44%', flex: 1 }]}>
            <Text style={s.statVal}>{v}</Text><Text style={s.statLbl}>{l}</Text>
          </View>
        ))}
      </View>
      {topG && (
        <View style={[s.heroCard, { borderColor: topTc + '60', backgroundColor: topBg }]}>
          <Text style={[s.secLbl, { color: topTc, opacity: 0.7, marginBottom: 5 }]}>DOMINANT GENRE</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: topTc, marginBottom: 3 }}>{topG.genre}</Text>
          <Text style={{ fontFamily: 'Courier', fontSize: 10, color: topTc, opacity: 0.65 }}>{topG.count} songs · {Math.round(topG.count / songs.length * 100)}% of library</Text>
        </View>
      )}
      <Text style={s.secLbl}>MOOD DISTRIBUTION</Text>
      <View style={s.section}>
        {moods.map(([mood, cnt]) => (
          <View key={mood} style={s.barRow2}>
            <Text style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{MOOD_E[mood] || '🎵'}</Text>
            <View style={s.barTrack2}><View style={[s.barFill2, { width: `${(cnt / maxMood) * 100}%`, backgroundColor: MOOD_C[mood] || '#888' }]} /></View>
            <Text style={s.barName}>{mood}</Text>
            <Text style={s.barCount}>{cnt}</Text>
          </View>
        ))}
      </View>
      {artists.length > 1 && <>
        <Text style={s.secLbl}>TOP ARTISTS</Text>
        <View style={s.section}>
          {artists.map(([artist, cnt], i) => (
            <View key={artist} style={s.barRow2}>
              <Text style={{ fontFamily: 'Courier', fontSize: 9, color: C.text3, width: 20, textAlign: 'center' }}>#{i + 1}</Text>
              <View style={s.barTrack2}><View style={[s.barFill2, { width: `${(cnt / maxArtist) * 100}%`, backgroundColor: C.gold }]} /></View>
              <Text style={s.barName} numberOfLines={1}>{artist}</Text>
              <Text style={s.barCount}>{cnt}</Text>
            </View>
          ))}
        </View>
      </>}
    </ScrollView>
  );
}

// ─── Player Screen (Modal) ────────────────────────────────────
function PlayerScreen({ song, isPlaying, progPct, posStr, durStr, onClose, onToggle, onNext, onPrev, onSeek }) {
  if (!song) return null;
  const [bg, tc, em] = getStyle(song.genre);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: 56, paddingHorizontal: playerPad, paddingBottom: 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}><Text style={{ fontSize: 22, color: C.text2 }}>⌄</Text></TouchableOpacity>
        <Text style={s.secLbl}>NOW PLAYING</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={[s.bigArt, { backgroundColor: bg, width: playerArtSize, height: playerArtSize }]}>
        <Text style={{ fontSize: isCompactScreen ? 72 : 90 }}>{em}</Text>
      </View>
      <View style={{ marginBottom: 24, alignItems: 'center', width: '100%' }}>
        <Text style={[s.bigTitle, { fontSize: isCompactScreen ? 19 : 22 }]} numberOfLines={2}>{song.title}</Text>
        <Text style={[s.bigArtist, { fontSize: isCompactScreen ? 12 : 14 }]}>{song.artist}</Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
          <View style={[s.genrePill, { backgroundColor: bg, borderColor: tc + '60' }]}><Text style={[s.genrePillTxt, { color: tc }]}>{song.genre}</Text></View>
          <Text style={s.confTxt}>{song.mood} · {song.confidence}%</Text>
        </View>
      </View>
      <TouchableOpacity
        style={s.seekTrack}
        onPress={(e) => { onSeek(Math.max(0, Math.min(1, e.nativeEvent.locationX / (W - 48)))); }}
        activeOpacity={1}
      >
        <View style={[s.seekFill, { width: `${progPct * 100}%` }]}>
          <View style={s.seekThumb} />
        </View>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }}>
        <Text style={s.timeTxt}>{posStr}</Text>
        <Text style={s.timeTxt}>{durStr}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <TouchableOpacity onPress={onPrev} style={s.sideBtn}><Text style={{ fontSize: 22 }}>⏮</Text></TouchableOpacity>
        <TouchableOpacity onPress={onToggle} style={s.bigPlayBtn}><Text style={{ fontSize: 30, color: C.bg }}>{isPlaying ? '⏸' : '▶'}</Text></TouchableOpacity>
        <TouchableOpacity onPress={onNext} style={s.sideBtn}><Text style={{ fontSize: 22 }}>⏭</Text></TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:12, paddingVertical:12, backgroundColor:C.surface, borderBottomWidth:1, borderBottomColor:C.border, flexWrap:'wrap', gap:8 },
  logoRow:      { flexDirection:'row', alignItems:'center', gap:8, flexShrink:1 },
  logoMark:     { width:32, height:32, borderRadius:9, backgroundColor:C.gold, alignItems:'center', justifyContent:'center' },
  logoName:     { fontSize:20, fontWeight:'800', color:C.gold, letterSpacing:-0.5 },
  badge:        { backgroundColor:'rgba(245,200,66,.12)', borderWidth:1, borderColor:'rgba(245,200,66,.3)', borderRadius:999, paddingHorizontal:7, paddingVertical:2 },
  badgeText:    { fontSize:9, color:C.gold, fontFamily:'Courier', fontWeight:'700', letterSpacing:0.8 },
  livePill:     { flexDirection:'row', alignItems:'center', gap:6 },
  liveDot:      { width:6, height:6, borderRadius:3, backgroundColor:C.teal },
  liveText:     { fontFamily:'Courier', fontSize:9, color:C.teal, letterSpacing:0.8 },
  tabBar:       { flexDirection:'row', backgroundColor:C.surface, borderBottomWidth:1, borderBottomColor:C.border, paddingHorizontal:4, paddingBottom:2 },
  tab:          { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:4, paddingVertical:10, paddingHorizontal:2, borderBottomWidth:2, borderBottomColor:'transparent', minWidth:0 },
  tabOn:        { borderBottomColor:C.gold },
  tabLabel:     { fontSize:10, fontWeight:'600', color:C.text3 },
  tabLabelOn:   { color:C.gold },
  pill:         { backgroundColor:'rgba(245,200,66,.15)', borderRadius:999, paddingHorizontal:5, paddingVertical:1 },
  pillTxt:      { fontFamily:'Courier', fontSize:9, color:C.gold, fontWeight:'700' },
  empty:        { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:24, paddingVertical:28, maxWidth:560, alignSelf:'center', width:'100%' },
  emptyTitle:   { fontSize:20, fontWeight:'800', color:C.text, marginBottom:10, textAlign:'center' },
  emptySub:     { fontSize:13, color:C.text2, textAlign:'center', lineHeight:20, marginBottom:28 },
  errTxt:       { color:C.coral, fontFamily:'Courier', fontSize:11, marginBottom:16, textAlign:'center' },
  btnPrimary:   { backgroundColor:C.gold, borderRadius:12, paddingVertical:15, alignItems:'center', width:'100%', marginBottom:10 },
  btnPrimaryTxt:{ color:C.bg, fontWeight:'800', fontSize:14 },
  btnOutline:   { borderWidth:1, borderColor:'rgba(245,200,66,.35)', borderRadius:12, paddingVertical:14, alignItems:'center', width:'100%' },
  btnOutlineTxt:{ color:C.gold, fontWeight:'700', fontSize:14 },
  scanCard:     { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:C.card, borderWidth:1, borderColor:'rgba(0,229,192,.15)', borderRadius:12, padding:13 },
  eqWrap:       { flexDirection:'row', alignItems:'flex-end', gap:3, height:26 },
  eqBar:        { width:3, backgroundColor:C.teal, borderRadius:1.5 },
  scanTitle:    { color:C.text, fontSize:12, fontWeight:'700', marginBottom:2 },
  scanMeta:     { color:C.text3, fontSize:10, fontFamily:'Courier' },
  progTrack:    { height:3, backgroundColor:C.raised, borderRadius:2 },
  progFill:     { height:3, backgroundColor:C.gold, borderRadius:2 },
  statsRow:     { flexDirection:'row', flexWrap:'wrap', gap:8 },
  statCard:     { flex:1, minWidth:'31%', backgroundColor:C.card, borderWidth:1, borderColor:C.border, borderRadius:12, padding:11, alignItems:'center' },
  statVal:      { fontSize:22, fontWeight:'800', color:C.gold, marginBottom:3 },
  statLbl:      { fontSize:9, color:C.text3, fontFamily:'Courier', letterSpacing:1 },
  actionBtn:    { backgroundColor:C.card, borderWidth:1, borderColor:C.border, borderRadius:8, paddingVertical:9, alignItems:'center' },
  actionTxt:    { color:C.text2, fontSize:11, fontWeight:'600' },
  secLbl:       { fontFamily:'Courier', fontSize:9, color:C.text3, letterSpacing:1.5 },
  songCard:     { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:C.card, borderWidth:1, borderColor:C.border, borderRadius:12, padding:10, minHeight:58, flexShrink:1 },
  songCardOn:   { borderColor:'rgba(245,200,66,.5)', backgroundColor:'rgba(245,200,66,.04)' },
  thumb:        { width:40, height:40, borderRadius:9, alignItems:'center', justifyContent:'center', overflow:'hidden' },
  thumbOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,.45)', alignItems:'center', justifyContent:'center', borderRadius:9 },
  songTitle:    { color:C.text, fontSize:12, fontWeight:'700', marginBottom:2, flexShrink:1 },
  songArtist:   { color:C.text3, fontSize:10, fontFamily:'Courier', flexShrink:1 },
  genrePill:    { paddingHorizontal:8, paddingVertical:2, borderRadius:999, borderWidth:1, maxWidth:120, flexShrink:1 },
  genrePillTxt: { fontSize:9, fontFamily:'Courier', fontWeight:'600' },
  confTxt:      { fontSize:9, color:C.text3, fontFamily:'Courier' },
  genreBlock:   { backgroundColor:C.card, borderWidth:1, borderColor:C.border, borderRadius:12, overflow:'hidden' },
  genreHdr:     { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:13, paddingBottom:8 },
  rank:         { fontFamily:'Courier', fontSize:9, color:C.text3, width:20 },
  genreName:    { fontSize:13, fontWeight:'700', color:C.text, marginBottom:1 },
  genreMeta:    { fontSize:9, color:C.text3, fontFamily:'Courier' },
  genreCount:   { paddingHorizontal:10, paddingVertical:3, borderRadius:999 },
  barTrack:     { height:2, backgroundColor:'rgba(255,255,255,.04)', marginHorizontal:14, marginBottom:12 },
  barFill:      { height:2, borderRadius:1 },
  trackRow:     { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:10, paddingHorizontal:14 },
  trackNum:     { fontFamily:'Courier', fontSize:9, color:C.text3, width:16, textAlign:'right' },
  trackTitle:   { fontSize:12, fontWeight:'600', color:C.text, marginBottom:1 },
  trackArtist:  { fontSize:9, color:C.text3, fontFamily:'Courier' },
  heroCard:     { borderWidth:1, borderRadius:12, padding:16 },
  section:      { backgroundColor:C.card, borderWidth:1, borderColor:C.border, borderRadius:12, overflow:'hidden' },
  barRow2:      { flexDirection:'row', alignItems:'center', gap:9, padding:10, paddingHorizontal:13, borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:C.border },
  barTrack2:    { flex:1, height:4, backgroundColor:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' },
  barFill2:     { height:4, borderRadius:2 },
  barName:      { fontFamily:'Courier', fontSize:10, color:C.text2, flex:1, minWidth:70, maxWidth:90 },
  barCount:     { fontFamily:'Courier', fontSize:10, color:C.text3, width:24, textAlign:'right', marginLeft:4 },
  miniPlayer:   { backgroundColor:C.card, borderTopWidth:1, borderTopColor:C.border },
  miniProgress: { height:2, backgroundColor:C.raised },
  miniProgFill: { height:2, backgroundColor:C.gold },
  miniInner:    { flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingVertical:10, gap:10 },
  miniArt:      { width:40, height:40, borderRadius:9, alignItems:'center', justifyContent:'center' },
  miniTitle:    { color:C.text, fontSize:13, fontWeight:'700', marginBottom:2 },
  miniArtist:   { color:C.text3, fontSize:11, fontFamily:'Courier' },
  miniControls: { flexDirection:'row', alignItems:'center', gap:6 },
  miniPlayBtn:  { width:36, height:36, borderRadius:18, backgroundColor:C.gold, alignItems:'center', justifyContent:'center' },
  closeBtn:     { width:40, height:40, backgroundColor:C.card, borderWidth:1, borderColor:C.border, borderRadius:8, alignItems:'center', justifyContent:'center' },
  bigArt:       { borderRadius:24, alignSelf:'center', alignItems:'center', justifyContent:'center', marginBottom:24, maxWidth:320, maxHeight:320 },
  bigTitle:     { fontSize:22, fontWeight:'800', color:C.text, textAlign:'center', marginBottom:6, letterSpacing:-0.3, maxWidth:'100%' },
  bigArtist:    { fontSize:14, color:C.text2, fontFamily:'Courier', textAlign:'center', maxWidth:'100%' },
  seekTrack:    { height:4, backgroundColor:C.raised, borderRadius:2, marginBottom:8 },
  seekFill:     { height:4, backgroundColor:C.gold, borderRadius:2, flexDirection:'row', justifyContent:'flex-end', alignItems:'center' },
  seekThumb:    { width:14, height:14, borderRadius:7, backgroundColor:C.gold, marginRight:-7 },
  timeTxt:      { fontSize:11, color:C.text3, fontFamily:'Courier' },
  sideBtn:      { width:52, height:52, borderRadius:26, backgroundColor:C.card, borderWidth:1, borderColor:C.border, alignItems:'center', justifyContent:'center' },
  bigPlayBtn:   { width:70, height:70, borderRadius:35, backgroundColor:C.gold, alignItems:'center', justifyContent:'center' },
});
