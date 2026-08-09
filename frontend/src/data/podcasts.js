// Central mock data source so every page/component pulls from the same place.

export const categories = [
  { id: 'technology', name: 'Technology', shows: 142, letter: 'T', color: 'bg-sky-600' },
  { id: 'business', name: 'Business', shows: 98, letter: 'B', color: 'bg-emerald-600' },
  { id: 'true-crime', name: 'True Crime', shows: 76, letter: 'T', color: 'bg-rose-600' },
  { id: 'comedy', name: 'Comedy', shows: 120, letter: 'C', color: 'bg-amber-500' },
  { id: 'science', name: 'Science', shows: 64, letter: 'S', color: 'bg-violet-600' },
  { id: 'history', name: 'History', shows: 52, letter: 'H', color: 'bg-orange-700' },
  { id: 'health-fitness', name: 'Health & Fitness', shows: 88, letter: 'H', color: 'bg-pink-700' },
  { id: 'news-politics', name: 'News & Politics', shows: 110, letter: 'N', color: 'bg-slate-500' },
  { id: 'education', name: 'Education', shows: 67, letter: 'E', color: 'bg-indigo-600' },
  { id: 'stories', name: 'Stories', shows: 45, letter: 'S', color: 'bg-teal-600' },
]

export const trendingPodcasts = [
  {
    id: 'cold-case-files',
    title: 'Cold Case Files',
    host: 'Detective Laura Hayes',
    category: 'TRUE CRIME',
    rating: 4.9,
    listeners: '2.1M',
    gradient: 'from-slate-700 to-slate-900',
  },
  {
    id: 'tech-frontier',
    title: 'The Tech Frontier',
    host: 'Marcus Chen',
    category: 'TECH',
    rating: 4.8,
    listeners: '1.2M',
    gradient: 'from-sky-800 to-slate-900',
  },
  {
    id: 'science-uncovered',
    title: 'Science Uncovered',
    host: 'Dr. Emily Park',
    category: 'SCIENCE',
    rating: 4.8,
    listeners: '750K',
    gradient: 'from-cyan-800 to-slate-900',
  },
  {
    id: 'midnight-stories',
    title: 'Midnight Stories',
    host: 'Elena Vasquez',
    category: 'STORIES',
    rating: 4.8,
    listeners: '540K',
    gradient: 'from-zinc-800 to-black',
  },
  {
    id: 'mind-the-business',
    title: 'Mind the Business',
    host: 'Sarah Williams',
    category: 'BUSINESS',
    rating: 4.7,
    listeners: '890K',
    gradient: 'from-amber-900 to-stone-900',
  },
  {
    id: 'echoes-of-the-past',
    title: 'Echoes of the Past',
    host: 'Professor James Okoye',
    category: 'HISTORY',
    rating: 4.7,
    listeners: '620K',
    gradient: 'from-blue-900 to-slate-900',
  },
]

export const editorsPicks = [
  {
    id: 'mind-the-business',
    title: 'Mind the Business',
    category: 'BUSINESS',
    description:
      'Practical business wisdom from entrepreneurs who have been there. Real stories, real strategies, real results. No fluff, just actionable insights.',
    gradient: 'from-amber-900 to-stone-900',
  },
  {
    id: 'cold-case-files',
    title: 'Cold Case Files',
    category: 'TRUE CRIME',
    description:
      'Reopening the cases that were never solved. Meticulous research and gripping storytelling bring you inside the investigations that haunt detectives to this day.',
    gradient: 'from-slate-700 to-slate-900',
  },
]

export const newReleases = [
  {
    id: 'comedy-vault',
    title: 'The Comedy Vault',
    host: 'Jake & Amy',
    category: 'COMEDY',
    rating: 4.6,
    listeners: '1.5M',
    gradient: 'from-fuchsia-900 to-stone-900',
  },
  {
    id: 'science-uncovered',
    title: 'Science Uncovered',
    host: 'Dr. Emily Park',
    category: 'SCIENCE',
    rating: 4.8,
    listeners: '750K',
    gradient: 'from-cyan-800 to-slate-900',
  },
  {
    id: 'echoes-of-the-past',
    title: 'Echoes of the Past',
    host: 'Professor James Okoye',
    category: 'HISTORY',
    rating: 4.7,
    listeners: '620K',
    gradient: 'from-blue-900 to-slate-900',
  },
  {
    id: 'wellness-lab',
    title: 'The Wellness Lab',
    host: 'Dr. Sophia Reed',
    category: 'HEALTH',
    rating: 4.5,
    listeners: '980K',
    gradient: 'from-rose-900 to-stone-900',
  },
  {
    id: 'daily-brief',
    title: 'The Daily Brief',
    host: 'Newsroom Team',
    category: 'NEWS',
    rating: 4.4,
    listeners: '3.2M',
    gradient: 'from-zinc-700 to-zinc-900',
  },
  {
    id: 'learning-curve',
    title: 'Learning Curve',
    host: 'Professor David Kim',
    category: 'EDUCATION',
    rating: 4.6,
    listeners: '430K',
    gradient: 'from-indigo-900 to-slate-900',
  },
]

export const freshEpisodes = [
  {
    id: 1,
    title: 'The Future of Artificial Intelligence',
    show: 'The Tech Frontier',
    host: 'Marcus Chen',
    date: 'Today',
    duration: '56m 7s',
    gradient: 'from-sky-800 to-slate-900',
  },
  {
    id: 2,
    title: 'The Future of Artificial Intelligence',
    show: 'Mind the Business',
    host: 'Sarah Williams',
    date: 'Today',
    duration: '41m 58s',
    gradient: 'from-amber-900 to-stone-900',
  },
  {
    id: 3,
    title: 'The Future of Artificial Intelligence',
    show: 'Cold Case Files',
    host: 'Detective Laura Hayes',
    date: 'Today',
    duration: '1h 3m',
    gradient: 'from-slate-700 to-slate-900',
  },
  {
    id: 4,
    title: 'The Future of Artificial Intelligence',
    show: 'The Comedy Vault',
    host: 'Jake & Amy',
    date: 'Today',
    duration: '35m 10s',
    gradient: 'from-fuchsia-900 to-stone-900',
  },
  {
    id: 5,
    title: 'The Future of Artificial Intelligence',
    show: 'Science Uncovered',
    host: 'Dr. Emily Park',
    date: 'Today',
    duration: '32m 28s',
    gradient: 'from-cyan-800 to-slate-900',
  },
]

// Full episode lists, keyed by podcast id — powers the podcast details page.
export const episodesByPodcast = {
  'tech-frontier': [
    {
      episodeNumber: 8,
      title: 'The Future of Artificial Intelligence',
      description:
        'In this episode, we explore the cutting-edge developments reshaping our understanding of the world and what it means for the future.',
      date: 'Today',
      duration: '1h 15m',
      gradient: 'from-sky-800 to-slate-900',
    },
    {
      episodeNumber: 7,
      title: 'Conversations with Industry Leaders',
      description:
        'Join us as we sit down with thought leaders and pioneers to unpack the ideas driving change across industries.',
      date: '1 weeks ago',
      duration: '59m 6s',
      gradient: 'from-sky-800 to-slate-900',
    },
    {
      episodeNumber: 6,
      title: 'Breaking Down Complex Topics',
      description:
        'A fascinating conversation about the challenges and opportunities that define our current moment in history.',
      date: '2 weeks ago',
      duration: '48m 0s',
      gradient: 'from-sky-800 to-slate-900',
    },
    {
      episodeNumber: 5,
      title: 'A Deep Dive into Modern Technology',
      description:
        'We break down the complex systems and structures that govern our world, making them accessible and engaging.',
      date: '3 weeks ago',
      duration: '46m 28s',
      gradient: 'from-sky-800 to-slate-900',
    },
    {
      episodeNumber: 4,
      title: 'Stories That Shape Our World',
      description:
        'From humble beginnings to global impact, this episode traces the journeys of those who dared to think differently.',
      date: '4 weeks ago',
      duration: '41m 11s',
      gradient: 'from-sky-800 to-slate-900',
    },
    {
      episodeNumber: 3,
      title: 'The Untold History of Innovation',
      description:
        'An in-depth look at the technologies, trends, and movements that are quietly transforming society.',
      date: 'Jun 14, 2026',
      duration: '1h 11m',
      gradient: 'from-sky-800 to-slate-900',
    },
    {
      episodeNumber: 2,
      title: 'Where We Go From Here',
      description:
        'What does the future hold? We ask the experts and examine the signals that point toward what comes next.',
      date: 'Jun 7, 2026',
      duration: '43m 34s',
      gradient: 'from-sky-800 to-slate-900',
    },
    {
      episodeNumber: 1,
      title: 'Lessons From the Field',
      description:
        'Real stories from real people. This episode features voices from the front lines of innovation and change.',
      date: 'May 31, 2026',
      duration: '36m 45s',
      gradient: 'from-sky-800 to-slate-900',
    },
  ],
}

// Full podcast profile data, keyed by id — powers the podcast details header.
export const podcastDetailsById = {
  'tech-frontier': {
    id: 'tech-frontier',
    title: 'The Tech Frontier',
    host: 'Marcus Chen',
    category: 'TECH',
    rating: 4.8,
    subscribers: '1.2M subscribers',
    episodesCount: '142 episodes',
    description:
      'Exploring the cutting edge of technology, from AI breakthroughs to quantum computing. Each week, we bring you conversations with the visionaries shaping tomorrow.',
    tags: ['#AI', '#Startups', '#Future'],
    gradient: 'from-sky-800 to-slate-900',
  },
}

export const featuredPodcast = {
  id: 'tech-frontier',
  title: 'The Tech Frontier',
  host: 'Marcus Chen',
  description:
    'Exploring the cutting edge of technology, from AI breakthroughs to quantum computing. Each week, we bring you conversations with the visionaries shaping tomorrow.',
  rating: 4.8,
  subscribers: '1.2M subscribers',
  episodes: '142 episodes',
}
