const axios = require('axios');

// Known educational channel IDs
const EDUCATIONAL_CHANNELS = {
  'Physics Wallah': 'UCZ0DiEJTNWHFmolD43UVFjw',
  'Khan Academy': 'UC4a-Gbdw7vOaccHmFo40b9g',
  'Unacademy': 'UCTtSGMkSEjHOFxOEBEJFqhw',
  'Vedantu': 'UCiNKto8-Ra5YQI-EoFRphEA',
  'Adda247': 'UCPLdFD3bG0U91vfxXi2X3qw',
  'StudyIQ': 'UCHi9Y-sSCioS3_dBq8dWPqw',
  'BYJU\'S': 'UCd8g9e8N1ZTRzlRBW5Vs14A',
  'Aman Dhattarwal': 'UCPKlhkiA8XFy9hvOjG6tslg',
  'Mathongo': 'UCWKgMEp0I_xvn6-SXQUoHCg',
};

const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

const MOCK_VIDEOS = [
  {
    id: 'L72S6oB49XU',
    title: 'Newton\'s Laws of Motion - Full Concepts with Examples',
    description: 'Master Newton\'s first, second, and third laws of motion with real-world applications and numerical practice questions.',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=640&q=80',
    channelTitle: 'Physics Wallah',
    channelId: 'UCZ0DiEJTNWHFmolD43UVFjw',
    provider: 'Physics Wallah',
    publishedAt: new Date().toISOString(),
    duration: '45:32',
    durationCategory: 'long',
    viewCount: '2.4M',
    likeCount: '250K',
    difficulty: 'intermediate',
    subject: 'Physics',
    exam: 'JEE',
    embedUrl: 'https://www.youtube.com/embed/L72S6oB49XU',
    watchUrl: 'https://www.youtube.com/watch?v=L72S6oB49XU'
  },
  {
    id: 'f3z4oK1_h8s',
    title: 'Introduction to Calculus - Limits and Derivatives',
    description: 'Learn the foundational concepts of calculus: limits, continuity, and derivatives from scratch with clean visual animations.',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=640&q=80',
    channelTitle: 'Khan Academy',
    channelId: 'UC4a-Gbdw7vOaccHmFo40b9g',
    provider: 'Khan Academy',
    publishedAt: new Date().toISOString(),
    duration: '22:15',
    durationCategory: 'medium',
    viewCount: '1.8M',
    likeCount: '190K',
    difficulty: 'beginner',
    subject: 'Mathematics',
    exam: 'Class 12',
    embedUrl: 'https://www.youtube.com/embed/f3z4oK1_h8s',
    watchUrl: 'https://www.youtube.com/watch?v=f3z4oK1_h8s'
  },
  {
    id: '9XyD0A3_r2s',
    title: 'Organic Chemistry Basics - IUPAC Nomenclature',
    description: 'Master IUPAC nomenclature rules for naming alkanes, alkenes, alkynes, and functional groups in organic chemistry.',
    thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=640&q=80',
    channelTitle: 'Vedantu',
    channelId: 'UCiNKto8-Ra5YQI-EoFRphEA',
    provider: 'Vedantu',
    publishedAt: new Date().toISOString(),
    duration: '35:10',
    durationCategory: 'long',
    viewCount: '980K',
    likeCount: '80K',
    difficulty: 'intermediate',
    subject: 'Chemistry',
    exam: 'NEET',
    embedUrl: 'https://www.youtube.com/embed/9XyD0A3_r2s',
    watchUrl: 'https://www.youtube.com/watch?v=9XyD0A3_r2s'
  },
  {
    id: '4k_b74CY0us',
    title: 'Electrostatics Class 12 One Shot - Full Chapter',
    description: 'Complete revision of Electrostatics, Coulomb\'s Law, Electric Field, Gauss Theorem, and Electric Potential in one session.',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=640&q=80',
    channelTitle: 'Physics Wallah',
    channelId: 'UCZ0DiEJTNWHFmolD43UVFjw',
    provider: 'Physics Wallah',
    publishedAt: new Date().toISOString(),
    duration: '1:15:00',
    durationCategory: 'long',
    viewCount: '3.1M',
    likeCount: '320K',
    difficulty: 'advanced',
    subject: 'Physics',
    exam: 'JEE',
    embedUrl: 'https://www.youtube.com/embed/4k_b74CY0us',
    watchUrl: 'https://www.youtube.com/watch?v=4k_b74CY0us'
  }
];

/**
 * Search YouTube videos with optional channel filter
 */
const searchVideos = async ({ query, channelId, maxResults = 12, pageToken = '' }) => {
  const params = {
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults,
    key: process.env.YOUTUBE_API_KEY,
    videoEmbeddable: true,
    safeSearch: 'strict',
  };
  if (channelId) params.channelId = channelId;
  if (pageToken) params.pageToken = pageToken;

  const response = await axios.get(`${YOUTUBE_BASE}/search`, { params });
  return response.data;
};

/**
 * Get video details (duration, view count, etc.)
 */
const getVideoDetails = async (videoIds) => {
  const params = {
    part: 'snippet,contentDetails,statistics',
    id: Array.isArray(videoIds) ? videoIds.join(',') : videoIds,
    key: process.env.YOUTUBE_API_KEY,
  };
  const response = await axios.get(`${YOUTUBE_BASE}/videos`, { params });
  return response.data.items;
};

/**
 * Parse ISO 8601 duration to readable format
 */
const parseDuration = (iso) => {
  if (!iso) return 'N/A';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'N/A';
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/**
 * Format view count
 */
const formatViews = (count) => {
  if (!count) return '0';
  const n = parseInt(count);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

/**
 * Get provider name from channel title
 */
const getProvider = (channelTitle) => {
  for (const [provider] of Object.entries(EDUCATIONAL_CHANNELS)) {
    if (channelTitle.toLowerCase().includes(provider.toLowerCase())) return provider;
  }
  return channelTitle;
};

/**
 * Main search function — searches across multiple channels
 */
const searchEducationalVideos = async ({ query, filters = {}, pageToken = '', maxResults = 12 }) => {
  try {
    const { provider, exam, subject, duration: durationFilter, difficulty } = filters;

    // Build search query with exam/subject context
    let searchQuery = query;
    if (exam) searchQuery += ` ${exam}`;
    if (subject) searchQuery += ` ${subject}`;

    let channelId = null;
    if (provider && EDUCATIONAL_CHANNELS[provider]) {
      channelId = EDUCATIONAL_CHANNELS[provider];
    }

    const searchData = await searchVideos({ query: searchQuery, channelId, maxResults, pageToken });
    if (!searchData.items || searchData.items.length === 0) {
      return { videos: [], nextPageToken: null, totalResults: 0 };
    }

    const videoIds = searchData.items.map(item => item.id.videoId).filter(Boolean);
    const videoDetails = videoIds.length > 0 ? await getVideoDetails(videoIds) : [];

    const detailsMap = {};
    videoDetails.forEach(v => { detailsMap[v.id] = v; });

    let videos = searchData.items
      .filter(item => item.id.videoId)
      .map(item => {
        const detail = detailsMap[item.id.videoId] || {};
        const durationRaw = detail.contentDetails?.duration || '';
        const durationFormatted = parseDuration(durationRaw);
        const viewCount = detail.statistics?.viewCount || '0';
        const channelTitle = item.snippet.channelTitle;

        // Duration category
        const totalMinutes = (() => {
          const m = durationRaw.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
          if (!m) return 0;
          return (parseInt(m[1] || 0) * 60) + parseInt(m[2] || 0);
        })();

        let durationCategory = 'short';
        if (totalMinutes >= 30) durationCategory = 'long';
        else if (totalMinutes >= 10) durationCategory = 'medium';

        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
          channelTitle,
          channelId: item.snippet.channelId,
          provider: getProvider(channelTitle),
          publishedAt: item.snippet.publishedAt,
          duration: durationFormatted,
          durationCategory,
          viewCount: formatViews(viewCount),
          likeCount: formatViews(detail.statistics?.likeCount || '0'),
          difficulty: difficulty || 'intermediate',
          subject: subject || '',
          exam: exam || '',
          embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
          watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        };
      });

    // Apply duration filter
    if (durationFilter && durationFilter !== 'all') {
      videos = videos.filter(v => v.durationCategory === durationFilter);
    }

    return {
      videos,
      nextPageToken: searchData.nextPageToken || null,
      totalResults: searchData.pageInfo?.totalResults || 0,
    };
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    console.warn('Falling back to mock educational videos due to YouTube API rate limit or network issue.');

    let filteredMocks = MOCK_VIDEOS;
    if (filters && filters.provider) {
      filteredMocks = filteredMocks.filter(v => v.provider.toLowerCase().includes(filters.provider.toLowerCase()));
    }
    if (filters && filters.subject) {
      filteredMocks = filteredMocks.filter(v => v.subject.toLowerCase().includes(filters.subject.toLowerCase()));
    }
    if (filteredMocks.length === 0) filteredMocks = MOCK_VIDEOS;

    return {
      videos: filteredMocks,
      nextPageToken: null,
      totalResults: filteredMocks.length,
    };
  }
};

/**
 * Get trending educational videos
 */
const getTrendingVideos = async (regionCode = 'IN', maxResults = 12) => {
  try {
    const params = {
      part: 'snippet,contentDetails,statistics',
      chart: 'mostPopular',
      videoCategoryId: '27', // Education category
      regionCode,
      maxResults,
      key: process.env.YOUTUBE_API_KEY,
    };
    const response = await axios.get(`${YOUTUBE_BASE}/videos`, { params });
    return response.data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url,
      channelTitle: item.snippet.channelTitle,
      provider: getProvider(item.snippet.channelTitle),
      duration: parseDuration(item.contentDetails?.duration),
      viewCount: formatViews(item.statistics?.viewCount),
      publishedAt: item.snippet.publishedAt,
      embedUrl: `https://www.youtube.com/embed/${item.id}`,
    }));
  } catch (error) {
    console.error('Trending error:', error.message);
    return [];
  }
};

module.exports = { searchEducationalVideos, getTrendingVideos, getVideoDetails, parseDuration, EDUCATIONAL_CHANNELS };
