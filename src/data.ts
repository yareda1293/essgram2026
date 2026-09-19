import type { User, Chat, Message, ChannelPost, Comment, Moment, Call, EssSpace, Notification, Poll, EventItem } from './types';

export const CURRENT_USER_ID = 'u_me';

export const seedUsers: User[] = [
  {
    id: 'u_me',
    name: 'Alex Rivera',
    username: '@alexrivera',
    phone: '+1 (415) 555-0192',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Designer & coffee enthusiast. Building beautiful things.',
    status: 'Available',
    isOnline: true,
    isVerified: true,
  },
  {
    id: 'u_sofia',
    name: 'Sofia Nakamura',
    username: '@sofiadesigns',
    phone: '+1 (628) 555-0143',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Product designer at Lumen. Pixel perfectionist.',
    status: 'In a meeting',
    isOnline: true,
    lastSeen: 'online',
    isVerified: true,
  },
  {
    id: 'u_marcus',
    name: 'Marcus Bellingham',
    username: '@marcusb',
    phone: '+1 (917) 555-0267',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Frontend dev. TypeScript enthusiast.',
    isOnline: false,
    lastSeen: '2m ago',
  },
  {
    id: 'u_priya',
    name: 'Priya Sharma',
    username: '@priyacodes',
    phone: '+44 20 7946 0312',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'AI researcher. Dog mom. Tea over coffee.',
    status: '✨ Building something cool',
    isOnline: true,
    lastSeen: 'online',
  },
  {
    id: 'u_leon',
    name: 'Leon Okonkwo',
    username: '@leonpixel',
    phone: '+234 803 555 0188',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Visual artist & illustrator. Lagos → Berlin.',
    isOnline: false,
    lastSeen: '1h ago',
  },
  {
    id: 'u_ella',
    name: 'Ela Castellanos',
    username: '@elacast',
    phone: '+34 612 555 077',
    avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Photographer. Wanderer. Cat person.',
    isOnline: true,
    lastSeen: 'online',
  },
  {
    id: 'u_james',
    name: 'James Wright',
    username: '@jwright',
    phone: '+1 (650) 555-0351',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Startup founder. Always shipping.',
    isOnline: false,
    lastSeen: '5h ago',
    isVerified: true,
  },
  {
    id: 'u_amara',
    name: 'Amara Chen',
    username: '@amarachen',
    phone: '+65 8123 5550',
    avatar: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Music producer. Lo-fi beats & jazz.',
    isOnline: false,
    lastSeen: '1d ago',
  },
  {
    id: 'u_diego',
    name: 'Diego Morales',
    username: '@diegom',
    phone: '+52 55 5555 0199',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Travel vlogger. 47 countries and counting.',
    isOnline: true,
    lastSeen: 'online',
  },
  {
    id: 'u_natasha',
    name: 'Natasha Volkov',
    username: '@natashav',
    phone: '+7 921 555 0144',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'UX writer. Word nerd. Plant killer (accidentally).',
    isOnline: false,
    lastSeen: '3h ago',
  },
  {
    id: 'u_omar',
    name: 'Omar Hassan',
    username: '@omarhassan',
    phone: '+971 50 555 0233',
    avatar: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Fintech builder. Crypto curious.',
    isOnline: true,
    lastSeen: 'online',
  },
  {
    id: 'u_luna',
    name: 'Luna Park',
    username: '@lunapark',
    phone: '+82 10 5555 0178',
    avatar: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Illustrator & comic artist. Seoul-based.',
    isOnline: false,
    lastSeen: '12m ago',
  },
];

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const seedMessages: Message[] = [
  // DM with Sofia
  { id: 'm1', chatId: 'c_sofia', senderId: 'u_sofia', type: 'text', text: 'Hey! Did you see the new design system I shared? 🎨', timestamp: hoursAgo(5), status: 'read', reactions: [] },
  { id: 'm2', chatId: 'c_sofia', senderId: CURRENT_USER_ID, type: 'text', text: 'Yes! The color palette is gorgeous. Love the coral accents.', timestamp: hoursAgo(4.8), status: 'read', reactions: [{ emoji: '❤️', userId: 'u_sofia' }] },
  { id: 'm3', chatId: 'c_sofia', senderId: 'u_sofia', type: 'text', text: 'Thanks! I was going for something warm but still premium. Can we hop on a call later to review the components?', timestamp: hoursAgo(4.5), status: 'read', reactions: [] },
  { id: 'm4', chatId: 'c_sofia', senderId: CURRENT_USER_ID, type: 'text', text: 'Absolutely. How about 3pm?', timestamp: hoursAgo(4.3), status: 'read', readAt: hoursAgo(4.2), reactions: [] },
  { id: 'm5', chatId: 'c_sofia', senderId: 'u_sofia', type: 'text', text: 'Perfect 🙌', timestamp: hoursAgo(4.1), status: 'read', reactions: [] },
  { id: 'm6', chatId: 'c_sofia', senderId: 'u_sofia', type: 'image', mediaUrl: 'https://images.pexels.com/photos/1966448/pexels-photo-1966448.jpeg?auto=compress&cs=tinysrgb&w=400', text: 'Here\'s the updated card component', timestamp: hoursAgo(2), status: 'read', reactions: [{ emoji: '🔥', userId: CURRENT_USER_ID }] },
  { id: 'm7', chatId: 'c_sofia', senderId: 'u_sofia', type: 'voice', duration: 23, timestamp: minsAgo(15), status: 'delivered', reactions: [] },
  { id: 'm8', chatId: 'c_sofia', senderId: 'u_sofia', type: 'text', text: 'Let me know what you think of that voice note when you get a sec!', timestamp: minsAgo(12), status: 'delivered', reactions: [] },

  // DM with Marcus
  { id: 'm10', chatId: 'c_marcus', senderId: 'u_marcus', type: 'text', text: 'Did you push the fix for the chat scroll bug?', timestamp: hoursAgo(8), status: 'read', reactions: [] },
  { id: 'm11', chatId: 'c_marcus', senderId: CURRENT_USER_ID, type: 'text', text: 'Yeah, it was a useRef cleanup issue. Should be solid now.', timestamp: hoursAgo(7.5), status: 'read', reactions: [{ emoji: '👍', userId: 'u_marcus' }] },
  { id: 'm12', chatId: 'c_marcus', senderId: 'u_marcus', type: 'document', mediaName: 'chat-fix-diff.pdf', mediaUrl: '#', text: 'Here\'s the diff if you want to review', timestamp: hoursAgo(7), status: 'read', reactions: [] },
  { id: 'm13', chatId: 'c_marcus', senderId: 'u_marcus', type: 'text', text: 'Also — are we still on for the team sync tomorrow?', timestamp: hoursAgo(1), status: 'delivered', reactions: [] },

  // DM with Priya
  { id: 'm20', chatId: 'c_priya', senderId: 'u_priya', type: 'text', text: 'OMG you have to see this AI demo 🤯', timestamp: hoursAgo(3), status: 'read', reactions: [] },
  { id: 'm21', chatId: 'c_priya', senderId: 'u_priya', type: 'video', mediaUrl: 'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400', text: 'It can generate UI from sketches!', timestamp: hoursAgo(2.9), status: 'read', reactions: [{ emoji: '🤯', userId: CURRENT_USER_ID }, { emoji: '🔥', userId: 'u_priya' }] },
  { id: 'm22', chatId: 'c_priya', senderId: CURRENT_USER_ID, type: 'text', text: 'That\'s insane. Is the model open source?', timestamp: hoursAgo(2.5), status: 'read', reactions: [] },
  { id: 'm23', chatId: 'c_priya', senderId: 'u_priya', type: 'text', text: 'Not yet but they said they\'re releasing weights next month', timestamp: hoursAgo(2.3), status: 'read', reactions: [] },
  { id: 'm24', chatId: 'c_priya', senderId: 'u_priya', type: 'sticker', stickerUrl: '🐾', text: '', timestamp: minsAgo(3), status: 'delivered', reactions: [] },

  // DM with Ela
  { id: 'm30', chatId: 'c_ella', senderId: 'u_ella', type: 'image', mediaUrl: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=400', text: 'Golden hour in Lisbon today 🌅', timestamp: hoursAgo(6), status: 'read', reactions: [{ emoji: '😍', userId: CURRENT_USER_ID }, { emoji: '🌅', userId: CURRENT_USER_ID }] },
  { id: 'm31', chatId: 'c_ella', senderId: CURRENT_USER_ID, type: 'text', text: 'Unreal. You always find the best light.', timestamp: hoursAgo(5.5), status: 'read', reactions: [] },
  { id: 'm32', chatId: 'c_ella', senderId: 'u_ella', type: 'text', text: 'It\'s all about patience 😊 how are things on your end?', timestamp: hoursAgo(5), status: 'read', reactions: [] },
  { id: 'm33', chatId: 'c_ella', senderId: 'u_ella', type: 'text', text: 'I\'m flying back to Madrid this weekend. We should catch up!', timestamp: minsAgo(40), status: 'delivered', reactions: [] },

  // DM with Leon
  { id: 'm40', chatId: 'c_leon', senderId: 'u_leon', type: 'image', mediaUrl: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=400', text: 'Working on a new series — what do you think of this composition?', timestamp: hoursAgo(20), status: 'read', reactions: [] },
  { id: 'm41', chatId: 'c_leon', senderId: CURRENT_USER_ID, type: 'text', text: 'The negative space is *chef\'s kiss*. Is this for the Berlin show?', timestamp: hoursAgo(19), status: 'read', reactions: [] },
  { id: 'm42', chatId: 'c_leon', senderId: 'u_leon', type: 'text', text: 'Yes! Opening night is the 28th. You coming?', timestamp: hoursAgo(18), status: 'read', reactions: [] },
  { id: 'm43', chatId: 'c_leon', senderId: CURRENT_USER_ID, type: 'text', text: 'Wouldn\'t miss it.', timestamp: hoursAgo(17), status: 'read', reactions: [{ emoji: '🎉', userId: 'u_leon' }] },

  // DM with Natasha
  { id: 'm50', chatId: 'c_natasha', senderId: 'u_natasha', type: 'text', text: 'I rewrote the onboarding copy. Want to take a look?', timestamp: hoursAgo(10), status: 'read', reactions: [] },
  { id: 'm51', chatId: 'c_natasha', senderId: CURRENT_USER_ID, type: 'text', text: 'Send it over!', timestamp: hoursAgo(9), status: 'read', reactions: [] },
  { id: 'm52', chatId: 'c_natasha', senderId: 'u_natasha', type: 'document', mediaName: 'onboarding-copy-v3.docx', mediaUrl: '#', text: '', timestamp: hoursAgo(8.5), status: 'read', reactions: [] },
  { id: 'm53', chatId: 'c_natasha', senderId: 'u_natasha', type: 'text', text: 'The microcopy for the empty states is my favorite part. Let me know if anything feels off.', timestamp: hoursAgo(8), status: 'read', reactions: [] },

  // Group: Design Team
  { id: 'm60', chatId: 'c_design_team', senderId: 'u_sofia', type: 'text', text: 'Team! Design review at 2pm today. Please bring your latest mockups.', timestamp: hoursAgo(6), status: 'read', reactions: [{ emoji: '👍', userId: CURRENT_USER_ID }, { emoji: '👍', userId: 'u_ella' }, { emoji: '👍', userId: 'u_leon' }] },
  { id: 'm61', chatId: 'c_design_team', senderId: 'u_ella', type: 'text', text: 'I\'ll have the photography guidelines ready', timestamp: hoursAgo(5.5), status: 'read', reactions: [] },
  { id: 'm62', chatId: 'c_design_team', senderId: 'u_leon', type: 'text', text: 'Working on the icon set updates now', timestamp: hoursAgo(5), status: 'read', reactions: [] },
  { id: 'm63', chatId: 'c_design_team', senderId: CURRENT_USER_ID, type: 'text', text: 'I\'ll present the component library audit', timestamp: hoursAgo(4), status: 'read', reactions: [{ emoji: '🙌', userId: 'u_sofia' }] },
  { id: 'm64', chatId: 'c_design_team', senderId: 'u_natasha', type: 'text', text: 'I dropped new copy suggestions in the shared doc. Focus on the empty states section.', timestamp: hoursAgo(3), status: 'read', reactions: [] },
  { id: 'm65', chatId: 'c_design_team', senderId: 'u_sofia', type: 'text', text: 'Perfect. Don\'t forget we have the client walkthrough on Friday!', timestamp: hoursAgo(1.5), status: 'delivered', reactions: [] },
  { id: 'm66', chatId: 'c_design_team', senderId: 'u_leon', type: 'text', text: 'Reminder: please vote on the poll above so we know about catering', timestamp: minsAgo(30), status: 'delivered', reactions: [] },

  // Group: Weekend Hikers
  { id: 'm70', chatId: 'c_hikers', senderId: 'u_diego', type: 'image', mediaUrl: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400', text: 'Found this trail for Saturday — looks incredible 🏔️', timestamp: hoursAgo(26), status: 'read', reactions: [{ emoji: '🔥', userId: CURRENT_USER_ID }, { emoji: '🏔️', userId: 'u_ella' }] },
  { id: 'm71', chatId: 'c_hikers', senderId: 'u_ella', type: 'text', text: 'That view! What\'s the difficulty level?', timestamp: hoursAgo(25), status: 'read', reactions: [] },
  { id: 'm72', chatId: 'c_hikers', senderId: 'u_diego', type: 'text', text: 'Moderate. About 8km with 400m elevation gain.', timestamp: hoursAgo(24.5), status: 'read', reactions: [] },
  { id: 'm73', chatId: 'c_hikers', senderId: CURRENT_USER_ID, type: 'text', text: 'I\'m in. What time do we start?', timestamp: hoursAgo(24), status: 'read', reactions: [{ emoji: '👍', userId: 'u_diego' }] },
  { id: 'm74', chatId: 'c_hikers', senderId: 'u_diego', type: 'text', text: '7am at the trailhead parking lot. Bring water and snacks!', timestamp: hoursAgo(23), status: 'read', reactions: [] },
  { id: 'm75', chatId: 'c_hikers', senderId: 'u_amara', type: 'text', text: 'Count me in too! I\'ll make a playlist for the drive', timestamp: hoursAgo(2), status: 'delivered', reactions: [{ emoji: '🎶', userId: CURRENT_USER_ID }] },

  // Group: Music Producers
  { id: 'm80', chatId: 'c_music', senderId: 'u_amara', type: 'text', text: 'New beat drop. Lo-fi meets synthwave. Thoughts?', timestamp: hoursAgo(12), status: 'read', reactions: [] },
  { id: 'm81', chatId: 'c_music', senderId: CURRENT_USER_ID, type: 'text', text: 'The bass line is fire 🔥', timestamp: hoursAgo(11), status: 'read', reactions: [{ emoji: '🔥', userId: 'u_amara' }] },
  { id: 'm82', chatId: 'c_music', senderId: 'u_luna', type: 'text', text: 'Can you send the stems? I want to try something with the bridge', timestamp: hoursAgo(10), status: 'read', reactions: [] },
  { id: 'm83', chatId: 'c_music', senderId: 'u_amara', type: 'document', mediaName: 'midnight-stems.zip', mediaUrl: '#', text: 'Here you go! Can\'t wait to hear what you do with it', timestamp: hoursAgo(9), status: 'read', reactions: [{ emoji: '🎉', userId: 'u_luna' }] },
  { id: 'm84', chatId: 'c_music', senderId: 'u_luna', type: 'text', text: 'On it! Will send something back by tonight', timestamp: minsAgo(55), status: 'delivered', reactions: [] },

  // Group chat for Ess Space: Lumen Community
  { id: 'm90', chatId: 'c_lumen_group', senderId: 'u_james', type: 'text', text: 'Welcome to the Lumen Community discussion group! This is where we talk about everything product, design, and community.', timestamp: hoursAgo(48), status: 'read', reactions: [{ emoji: '👋', userId: CURRENT_USER_ID }, { emoji: '👋', userId: 'u_sofia' }, { emoji: '👋', userId: 'u_omar' }] },
  { id: 'm91', chatId: 'c_lumen_group', senderId: 'u_sofia', type: 'text', text: 'So excited to have everyone here! We\'ll be sharing behind-the-scenes design work regularly.', timestamp: hoursAgo(47), status: 'read', reactions: [] },
  { id: 'm92', chatId: 'c_lumen_group', senderId: 'u_omar', type: 'text', text: 'Quick question — will there be a beta program for new features?', timestamp: hoursAgo(46), status: 'read', reactions: [] },
  { id: 'm93', chatId: 'c_lumen_group', senderId: 'u_james', type: 'text', text: 'Yes! We\'ll open beta signups through the channel next week. Stay tuned.', timestamp: hoursAgo(45), status: 'read', reactions: [{ emoji: '🚀', userId: 'u_omar' }, { emoji: '🚀', userId: CURRENT_USER_ID }] },
  { id: 'm94', chatId: 'c_lumen_group', senderId: CURRENT_USER_ID, type: 'text', text: 'This is such a great initiative. Looking forward to the community growing here!', timestamp: hoursAgo(20), status: 'read', reactions: [{ emoji: '❤️', userId: 'u_james' }] },
  { id: 'm95', chatId: 'c_lumen_group', senderId: 'u_sofia', type: 'text', text: 'Just posted a sneak peek of the new theme in the channel. Check it out!', timestamp: hoursAgo(3), status: 'delivered', reactions: [] },
];

export const seedPolls: Record<string, Poll> = {
  'c_design_team': {
    id: 'poll1',
    question: 'What should we order for the design review lunch?',
    options: [
      { id: 'o1', text: 'Sushi platter', votes: ['u_sofia', 'u_ella'] },
      { id: 'o2', text: 'Pizza', votes: ['u_leon', CURRENT_USER_ID] },
      { id: 'o3', text: 'Salad bowls', votes: ['u_natasha'] },
      { id: 'o4', text: 'Tacos', votes: [] },
    ],
    isMulti: false,
    isClosed: false,
  },
};

export const seedEvents: Record<string, EventItem[]> = {
  'c_lumen_group': [
    {
      id: 'ev1',
      title: 'Lumen Beta Launch Party',
      description: 'Join us for the official beta launch of Lumen 2.0. Live demos, Q&A with the team, and giveaways!',
      date: new Date(now + 5 * 24 * 3600_000).toISOString(),
      location: 'Virtual — Lumen Space',
      going: ['u_james', 'u_sofia', 'u_omar', CURRENT_USER_ID],
      maybe: ['u_sofia'],
    },
    {
      id: 'ev2',
      title: 'Design Systems AMA',
      description: 'An open AMA with the Lumen design team. Bring your questions about tokens, theming, and component architecture.',
      date: new Date(now + 12 * 3600_000).toISOString(),
      location: 'Lumen Community Voice Channel',
      going: ['u_sofia', 'u_natasha', CURRENT_USER_ID],
      maybe: ['u_leon'],
    },
  ],
};

const seedComments: Comment[] = [
  { id: 'cm1', postId: 'p1', authorId: 'u_omar', text: 'This is stunning. The attention to detail is next level!', timestamp: hoursAgo(23), reactions: [{ emoji: '🔥', userId: 'u_james' }] },
  { id: 'cm2', postId: 'p1', authorId: 'u_priya', text: 'The micro-interactions are so smooth. What animation library are you using?', timestamp: hoursAgo(22), reactions: [] },
  { id: 'cm3', postId: 'p1', authorId: 'u_james', text: 'Built from scratch with custom springs. We\'ll share a technical breakdown soon!', timestamp: hoursAgo(21), reactions: [{ emoji: '👏', userId: 'u_omar' }, { emoji: '👏', userId: 'u_priya' }] },
  { id: 'cm4', postId: 'p1', authorId: 'u_luna', text: 'Can\'t wait for the beta! Signed up immediately.', timestamp: hoursAgo(18), reactions: [] },
  { id: 'cm5', postId: 'p2', authorId: 'u_ella', text: 'The coral accents are my favorite part. Very warm and inviting.', timestamp: hoursAgo(2.5), reactions: [{ emoji: '❤️', userId: 'u_sofia' }] },
  { id: 'cm6', postId: 'p2', authorId: 'u_marcus', text: 'Any chance of a light mode too?', timestamp: hoursAgo(2), reactions: [] },
  { id: 'cm7', postId: 'p2', authorId: 'u_james', text: 'Light mode is in the works! Beta will ship with dark first though.', timestamp: hoursAgo(1.5), reactions: [{ emoji: '👍', userId: 'u_marcus' }] },
  { id: 'cm8', postId: 'p3', authorId: 'u_leon', text: '3 spots left! If you\'re on the fence, just do it. The community is amazing.', timestamp: minsAgo(45), reactions: [{ emoji: '🙌', userId: 'u_omar' }] },
  { id: 'cm9', postId: 'p3', authorId: 'u_diego', text: 'Just signed up. Looking forward to it!', timestamp: minsAgo(20), reactions: [] },
];

export const seedChannelPosts: ChannelPost[] = [
  {
    id: 'p1',
    channelId: 'c_lumen_channel',
    authorId: 'u_james',
    text: 'Lumen 2.0 is shaping up beautifully. Here\'s a sneak peek at our new glassmorphism design language — every surface is designed to feel depth-rich, tactile, and alive. We can\'t wait to share more with you all. The beta is right around the corner. 🚀',
    mediaUrl: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600',
    timestamp: hoursAgo(24),
    reactions: [{ emoji: '🔥', userId: 'u_omar' }, { emoji: '🔥', userId: 'u_priya' }, { emoji: '❤️', userId: 'u_ella' }, { emoji: '🚀', userId: CURRENT_USER_ID }, { emoji: '👏', userId: 'u_leon' }],
    commentCount: 4,
    isPinned: true,
    views: 12847,
    comments: seedComments.filter(c => c.postId === 'p1'),
  },
  {
    id: 'p2',
    channelId: 'c_lumen_channel',
    authorId: 'u_sofia',
    text: 'A closer look at our color system. We chose deep navy surfaces with violet, pink, and coral accents to create a palette that feels both calm and expressive. Every color has a 10-shade ramp for maximum flexibility. What do you think of the direction? 🎨',
    mediaUrl: 'https://images.pexels.com/photos/13450828/pexels-photo-13450828.jpeg?auto=compress&cs=tinysrgb&w=600',
    timestamp: hoursAgo(3),
    reactions: [{ emoji: '😍', userId: 'u_ella' }, { emoji: '🎨', userId: 'u_leon' }, { emoji: '❤️', userId: CURRENT_USER_ID }, { emoji: '🔥', userId: 'u_omar' }],
    commentCount: 3,
    isPinned: false,
    views: 5234,
    comments: seedComments.filter(c => c.postId === 'p2'),
  },
  {
    id: 'p3',
    channelId: 'c_lumen_channel',
    authorId: 'u_james',
    text: '📣 Beta tester sign-ups are OPEN! We\'re looking for 500 passionate community members to test Lumen 2.0 before public launch. As a beta tester you\'ll get early access, a direct line to our team, and an exclusive founder badge on your profile. Only 3 spots left out of the initial 50!',
    timestamp: hoursAgo(1),
    reactions: [{ emoji: '🚀', userId: 'u_omar' }, { emoji: '🚀', userId: 'u_priya' }, { emoji: '🎉', userId: 'u_leon' }, { emoji: '🙌', userId: 'u_ella' }, { emoji: '🚀', userId: CURRENT_USER_ID }],
    commentCount: 2,
    isPinned: false,
    views: 3201,
    comments: seedComments.filter(c => c.postId === 'p3'),
  },
];

export const seedMoments: Moment[] = [
  { id: 'mo0', userId: CURRENT_USER_ID, mediaUrl: 'https://images.pexels.com/photos/1183099/pexels-photo-1183099.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Morning coffee run ☕', timestamp: hoursAgo(1), viewedBy: [], type: 'photo' },
  { id: 'mo1', userId: 'u_sofia', mediaUrl: 'https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Designing in the zone ✨', timestamp: hoursAgo(2), viewedBy: [], type: 'photo' },
  { id: 'mo2', userId: 'u_sofia', mediaUrl: 'https://images.pexels.com/photos/317356/pexels-photo-317356.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'New desk setup', timestamp: hoursAgo(1), viewedBy: [], type: 'photo' },
  { id: 'mo3', userId: 'u_priya', mediaUrl: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'AI lab life 🤖', timestamp: hoursAgo(3), viewedBy: [], type: 'photo' },
  { id: 'mo4', userId: 'u_ella', mediaUrl: 'https://images.pexels.com/photos/35888/amazing-beautiful-breathtaking-clouds.jpg?auto=compress&cs=tinysrgb&w=400', caption: 'Lisbon sunsets never get old 🌅', timestamp: hoursAgo(4), viewedBy: [CURRENT_USER_ID], type: 'photo' },
  { id: 'mo5', userId: 'u_diego', mediaUrl: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'On top of the world 🏔️', timestamp: hoursAgo(6), viewedBy: [], type: 'photo' },
  { id: 'mo6', userId: 'u_leon', mediaUrl: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Studio session', timestamp: hoursAgo(8), viewedBy: [CURRENT_USER_ID], type: 'photo' },
  { id: 'mo7', userId: 'u_amara', mediaUrl: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'Late night in the studio 🎵', timestamp: hoursAgo(10), viewedBy: [], type: 'photo' },
  { id: 'mo8', userId: 'u_luna', mediaUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400', caption: 'New comic drops Friday!', timestamp: hoursAgo(14), viewedBy: [], type: 'photo' },
];

export const seedCalls: Call[] = [
  { id: 'call1', userId: 'u_sofia', type: 'video', direction: 'outgoing', timestamp: hoursAgo(2.5), duration: 1820 },
  { id: 'call2', userId: 'u_marcus', type: 'voice', direction: 'incoming', timestamp: hoursAgo(8), duration: 340 },
  { id: 'call3', userId: 'u_priya', type: 'voice', direction: 'outgoing', timestamp: hoursAgo(14), duration: 720 },
  { id: 'call4', userId: 'u_ella', type: 'video', direction: 'missed', timestamp: hoursAgo(20) },
  { id: 'call5', userId: 'u_james', type: 'voice', direction: 'incoming', timestamp: hoursAgo(28), duration: 600 },
  { id: 'call6', userId: 'u_leon', type: 'video', direction: 'outgoing', timestamp: hoursAgo(48), duration: 2400 },
  { id: 'call7', userId: 'u_diego', type: 'voice', direction: 'missed', timestamp: hoursAgo(52) },
  { id: 'call8', userId: 'u_natasha', type: 'voice', direction: 'incoming', timestamp: hoursAgo(72), duration: 180 },
];

export const seedChats: Chat[] = [
  {
    id: 'c_sofia',
    type: 'dm',
    name: 'Sofia Nakamura',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    unreadCount: 3,
    isPinned: true,
    isMuted: false,
    lastMessageId: 'm8',
    lastMessagePreview: 'Let me know what you think of that voice note!',
    lastMessageTimestamp: minsAgo(12),
  },
  {
    id: 'c_lumen_channel',
    type: 'channel',
    name: 'Lumen',
    avatar: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'The official Lumen channel. Product updates, design insights, and community news.',
    isPublic: true,
    subscriberCount: 12847,
    unreadCount: 2,
    isPinned: true,
    isMuted: false,
    lastMessageId: 'p3',
    lastMessagePreview: 'Beta tester sign-ups are OPEN! Only 3 spots left...',
    lastMessageTimestamp: hoursAgo(1),
    spaceId: 's_lumen',
  },
  {
    id: 'c_lumen_group',
    type: 'group',
    name: 'Lumen Community',
    avatar: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Discussion group for the Lumen community.',
    memberCount: 248,
    adminIds: ['u_james', 'u_sofia'],
    moderatorIds: ['u_omar'],
    unreadCount: 5,
    isPinned: false,
    isMuted: false,
    lastMessageId: 'm95',
    lastMessagePreview: 'Just posted a sneak peek of the new theme in the channel!',
    lastMessageTimestamp: hoursAgo(3),
    spaceId: 's_lumen',
  },
  {
    id: 'c_priya',
    type: 'dm',
    name: 'Priya Sharma',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    lastMessageId: 'm24',
    lastMessagePreview: '🐾',
    lastMessageTimestamp: minsAgo(3),
  },
  {
    id: 'c_design_team',
    type: 'group',
    name: 'Design Team',
    avatar: 'https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Internal design team chat',
    memberCount: 6,
    adminIds: ['u_sofia'],
    moderatorIds: [],
    unreadCount: 2,
    isPinned: false,
    isMuted: false,
    lastMessageId: 'm66',
    lastMessagePreview: 'Reminder: please vote on the poll above so we know about catering',
    lastMessageTimestamp: minsAgo(30),
  },
  {
    id: 'c_ella',
    type: 'dm',
    name: 'Ela Castellanos',
    avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200',
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    lastMessageId: 'm33',
    lastMessagePreview: 'I\'m flying back to Madrid this weekend. We should catch up!',
    lastMessageTimestamp: minsAgo(40),
  },
  {
    id: 'c_marcus',
    type: 'dm',
    name: 'Marcus Bellingham',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200',
    unreadCount: 1,
    isPinned: false,
    isMuted: true,
    lastMessageId: 'm13',
    lastMessagePreview: 'Also — are we still on for the team sync tomorrow?',
    lastMessageTimestamp: hoursAgo(1),
  },
  {
    id: 'c_hikers',
    type: 'group',
    name: 'Weekend Hikers',
    avatar: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Weekend hiking crew',
    memberCount: 8,
    adminIds: ['u_diego'],
    moderatorIds: ['u_ella'],
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    lastMessageId: 'm75',
    lastMessagePreview: 'Count me in too! I\'ll make a playlist for the drive',
    lastMessageTimestamp: hoursAgo(2),
  },
  {
    id: 'c_music',
    type: 'group',
    name: 'Music Producers',
    avatar: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Beat makers & producers',
    memberCount: 15,
    adminIds: ['u_amara'],
    moderatorIds: ['u_luna'],
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    lastMessageId: 'm84',
    lastMessagePreview: 'On it! Will send something back by tonight',
    lastMessageTimestamp: minsAgo(55),
  },
  {
    id: 'c_leon',
    type: 'dm',
    name: 'Leon Okonkwo',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    lastMessageId: 'm43',
    lastMessagePreview: 'Wouldn\'t miss it.',
    lastMessageTimestamp: hoursAgo(17),
  },
  {
    id: 'c_natasha',
    type: 'dm',
    name: 'Natasha Volkov',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200',
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    lastMessageId: 'm53',
    lastMessagePreview: 'The microcopy for the empty states is my favorite part.',
    lastMessageTimestamp: hoursAgo(8),
  },
];

export const seedSpaces: EssSpace[] = [
  {
    id: 's_lumen',
    name: 'Lumen Community',
    description: 'The official Lumen community hub. Product updates, design discussions, events, and more.',
    avatar: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200',
    coverUrl: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    memberCount: 248,
    isPublic: true,
    channelId: 'c_lumen_channel',
    groupId: 'c_lumen_group',
    events: seedEvents['c_lumen_group'] || [],
    roles: [
      { id: 'r1', name: 'Founder', color: '#ff4784', permissions: ['all'] },
      { id: 'r2', name: 'Admin', color: '#7c5cff', permissions: ['manage_members', 'post', 'pin', 'edit'] },
      { id: 'r3', name: 'Moderator', color: '#ff5a3c', permissions: ['manage_members', 'pin'] },
      { id: 'r4', name: 'Member', color: '#6e7690', permissions: ['view', 'comment'] },
    ],
  },
];

export const seedNotifications: Notification[] = [
  { id: 'n1', type: 'message', title: 'Sofia Nakamura', body: 'Let me know what you think of that voice note!', timestamp: minsAgo(12), read: false, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'n2', type: 'message', title: 'Priya Sharma', body: 'Sent a sticker', timestamp: minsAgo(3), read: false, avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'n3', type: 'reaction', title: 'Sofia Nakamura', body: 'reacted ❤️ to your message', timestamp: hoursAgo(1), read: true, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'n4', type: 'call', title: 'Missed video call', body: 'from Ela Castellanos', timestamp: hoursAgo(20), read: true, avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200' },
  { id: 'n5', type: 'system', title: 'Ess Gram', body: 'Two-step verification is now available. Enable it in Settings → Privacy.', timestamp: hoursAgo(48), read: true },
];

export const discoverChannels = [
  { id: 'dc1', name: 'Tech Daily', username: '@techdaily', avatar: 'https://images.pexels.com/photos/18104/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=200', subscribers: 89234, description: 'Daily tech news and analysis from around the world.', isVerified: true },
  { id: 'dc2', name: 'Art & Illustration', username: '@artillustration', avatar: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=200', subscribers: 45120, description: 'Showcasing the best digital art and illustration talent.', isVerified: false },
  { id: 'dc3', name: 'Travel Stories', username: '@travelstories', avatar: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=200', subscribers: 127890, description: 'Real travel stories, tips, and hidden gems from travelers worldwide.', isVerified: true },
  { id: 'dc4', name: 'Lo-Fi Beats', username: '@lofibeats', avatar: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=200', subscribers: 234567, description: 'Daily lo-fi mixes for studying, relaxing, and creating.', isVerified: true },
  { id: 'dc5', name: 'Design Inspo', username: '@designinspo', avatar: 'https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg?auto=compress&cs=tinysrgb&w=200', subscribers: 67890, description: 'Curated design inspiration. UI, UX, product, and more.', isVerified: false },
  { id: 'dc6', name: 'Photography Club', username: '@photoclub', avatar: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=200', subscribers: 34567, description: 'Share your photos, get feedback, and learn from pros.', isVerified: false },
];

export const discoverGroups = [
  { id: 'dg1', name: 'Indie Hackers', avatar: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200', members: 1240, description: 'Building and launching indie products together.' },
  { id: 'dg2', name: 'Frontend Masters', avatar: 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=200', members: 3890, description: 'Discussing the latest in frontend development.' },
  { id: 'dg3', name: 'Book Club International', avatar: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=200', members: 876, description: 'Monthly reads and lively discussions.' },
  { id: 'dg4', name: 'Startup Founders EU', avatar: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200', members: 567, description: 'European startup community. Networking and support.' },
];

export const discoverCreators = [
  { id: 'dcr1', name: 'James Wright', username: '@jwright', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200', followers: 45230, isVerified: true, bio: 'Startup founder. Always shipping.' },
  { id: 'dcr2', name: 'Sofia Nakamura', username: '@sofiadesigns', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200', followers: 32100, isVerified: true, bio: 'Product designer at Lumen.' },
  { id: 'dcr3', name: 'Diego Morales', username: '@diegom', avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200', followers: 89000, isVerified: false, bio: 'Travel vlogger. 47 countries.' },
  { id: 'dcr4', name: 'Amara Chen', username: '@amarachen', avatar: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=200', followers: 23400, isVerified: false, bio: 'Music producer. Lo-fi beats & jazz.' },
];

export const getChatMembers = (chatId: string): User[] => {
  const memberMap: Record<string, string[]> = {
    c_sofia: ['u_me', 'u_sofia'],
    c_marcus: ['u_me', 'u_marcus'],
    c_priya: ['u_me', 'u_priya'],
    c_ella: ['u_me', 'u_ella'],
    c_leon: ['u_me', 'u_leon'],
    c_natasha: ['u_me', 'u_natasha'],
    c_design_team: ['u_me', 'u_sofia', 'u_ella', 'u_leon', 'u_natasha'],
    c_hikers: ['u_me', 'u_diego', 'u_ella', 'u_amara'],
    c_music: ['u_me', 'u_amara', 'u_luna'],
    c_lumen_group: ['u_me', 'u_james', 'u_sofia', 'u_omar'],
  };
  const ids = memberMap[chatId] || [];
  return ids.map(id => seedUsers.find(u => u.id === id)).filter(Boolean) as User[];
};

export const getUserById = (id: string): User | undefined =>
  seedUsers.find(u => u.id === id);
