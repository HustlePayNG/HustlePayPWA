// LocalStorage-based Mock Database for HustlePay PWA

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  roles: ('seeker' | 'artisan')[];
  activeModePreference: 'seeker' | 'artisan';
  address?: {
    formattedAddress: string;
    latitude: number;
    longitude: number;
  };
  kycStatus?: 'not_started' | 'pending_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  lastReminderSentAt?: string;
  trainingSessionSelected?: string;
}

export interface ServiceCategory {
  id: string;
  key: string;
  name: string;
  iconKey: string;
}

export interface ArtisanProfile {
  id: string; // matches User.id
  fullName: string;
  avatarUrl: string;
  businessName: string;
  bio: string;
  yearsExperience: number;
  ratingAverage: number;
  ratingCount: number;
  completedJobsCount: number;
  distanceKm: number;
  serviceAreaKm: number;
  services: {
    id: string;
    name: string;
    description: string;
    price: number;
  }[];
  pricing: {
    rateType: 'hourly' | 'per_service';
    baseRate: number;
    calloutFee: number;
    additionalCharges: { label: string; amount: number }[];
  };
  availability: {
    weekday: string; // 'Monday', 'Tuesday', etc.
    enabled: boolean;
    startTime: string;
    endTime: string;
  }[];
}

export interface Booking {
  id: string;
  reference: string;
  seekerId: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar: string;
  seekerName: string;
  seekerPhone: string;
  status:
    | 'requested'
    | 'accepted'
    | 'declined'
    | 'in_progress'
    | 'price_proposed'
    | 'price_accepted'
    | 'completed'
    | 'seeker_confirmed'
    | 'cancelled'
    | 'disputed';
  serviceName: string;
  description: string;
  photos: string[];
  scheduledStartAt: string;
  address: string;
  calloutFee: number;
  estimatedAmount: number;
  finalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  userId: string;
  balance: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'top_up' | 'callout_payment' | 'service_payment' | 'commission' | 'refund' | 'withdrawal';
  amount: number;
  direction: 'credit' | 'debit';
  status: 'successful' | 'pending' | 'failed';
  bookingRef?: string;
  description: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  reference: string;
  bookingId: string;
  bookingRef: string;
  openedByUserId: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved';
  resolution?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface JobProposal {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar: string;
  price: number;
  note: string;
  createdAt: string;
}

export interface JobOpening {
  id: string;
  seekerId: string;
  seekerName: string;
  title: string;
  category: string;
  categoryId: string;
  description: string;
  budget: number;
  address: string;
  status: 'open' | 'assigned' | 'completed';
  artisanId?: string;
  createdAt: string;
  proposals: JobProposal[];
  imageUrl?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  body: string;
  createdAt: string;
}

export interface ArtisanPost {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar: string;
  artisanOccupation: string;
  imageUrl?: string;
  caption: string;
  category: string;
  likesCount: number;
  likedByMe: boolean;
  comments: PostComment[];
  createdAt: string;
}


// Initial static seed categories
const CATEGORIES: ServiceCategory[] = [
  { id: 'cat-1', key: 'plumbing', name: 'Plumbing', iconKey: 'Wrench' },
  { id: 'cat-2', key: 'electrical', name: 'Electrical', iconKey: 'Zap' },
  { id: 'cat-3', key: 'carpentry', name: 'Carpentry', iconKey: 'Hammer' },
  { id: 'cat-4', key: 'cleaning', name: 'Cleaning', iconKey: 'Sparkles' },
  { id: 'cat-5', key: 'painting', name: 'Painting', iconKey: 'Paintbrush' },
  { id: 'cat-6', key: 'mechanic', name: 'Auto Repair', iconKey: 'Car' }
];

// Initial mock artisans seed
const ARTISANS_SEED: ArtisanProfile[] = [
  {
    id: 'artisan-1',
    fullName: 'Tunde Bakare',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    businessName: 'Bakare Plumbing Express',
    bio: 'Professional plumber with over 8 years experience fixing leaks, drainage issues, and installing bathrooms.',
    yearsExperience: 8,
    ratingAverage: 4.8,
    ratingCount: 34,
    completedJobsCount: 142,
    distanceKm: 1.2,
    serviceAreaKm: 15,
    services: [
      { id: 'srv-1', name: 'Pipe Leak Repair', description: 'Fixing burst or leaking pipes in kitchens/bathrooms.', price: 12000 },
      { id: 'srv-2', name: 'Drain Unclogging', description: 'Clearing blocked drains and sewer lines.', price: 8000 },
      { id: 'srv-3', name: 'Water Heater Install', description: 'Complete water heater unit installation.', price: 25000 }
    ],
    pricing: {
      rateType: 'per_service',
      baseRate: 10000,
      calloutFee: 3000,
      additionalCharges: [
        { label: 'Emergency Weekend Callout', amount: 5000 },
        { label: 'Materials Surcharge (standard)', amount: 2000 }
      ]
    },
    availability: [
      { weekday: 'Monday', enabled: true, startTime: '08:00', endTime: '17:00' },
      { weekday: 'Tuesday', enabled: true, startTime: '08:00', endTime: '17:00' },
      { weekday: 'Wednesday', enabled: true, startTime: '08:00', endTime: '17:00' },
      { weekday: 'Thursday', enabled: true, startTime: '08:00', endTime: '17:00' },
      { weekday: 'Friday', enabled: true, startTime: '08:00', endTime: '17:00' }
    ]
  },
  {
    id: 'artisan-2',
    fullName: 'Chidi Okafor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    businessName: 'Okafor Spark Electricals',
    bio: 'Licensed electrician specializing in residential wiring, inverter installation, and fuse repairs.',
    yearsExperience: 5,
    ratingAverage: 4.6,
    ratingCount: 22,
    completedJobsCount: 88,
    distanceKm: 2.5,
    serviceAreaKm: 10,
    services: [
      { id: 'srv-4', name: 'Inverter Diagnostics', description: 'Checking system backup issues and batteries.', price: 15000 },
      { id: 'srv-5', name: 'Light Fixture Fitting', description: 'Installing ceiling fans and light points.', price: 5000 },
      { id: 'srv-6', name: 'Generator Connection', description: 'Setting up automated/manual transfer switches.', price: 18000 }
    ],
    pricing: {
      rateType: 'hourly',
      baseRate: 4000,
      calloutFee: 4000,
      additionalCharges: []
    },
    availability: [
      { weekday: 'Monday', enabled: true, startTime: '09:00', endTime: '18:00' },
      { weekday: 'Wednesday', enabled: true, startTime: '09:00', endTime: '18:00' },
      { weekday: 'Friday', enabled: true, startTime: '09:00', endTime: '18:00' },
      { weekday: 'Saturday', enabled: true, startTime: '10:00', endTime: '16:00' }
    ]
  },
  {
    id: 'artisan-3',
    fullName: 'Fatima Bello',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    businessName: 'Bello Cleaning Services',
    bio: 'Affordable, detailed, and highly trusted deep home and office cleaning provider.',
    yearsExperience: 4,
    ratingAverage: 4.9,
    ratingCount: 51,
    completedJobsCount: 198,
    distanceKm: 4.8,
    serviceAreaKm: 20,
    services: [
      { id: 'srv-7', name: 'Standard Cleaning (3-bedroom)', description: 'Mopping, dusting, trash disposal, vacuuming.', price: 20000 },
      { id: 'srv-8', name: 'Deep Kitchen Degreasing', description: 'Intensive oven, cabinets, tiles, and exhaust cleaning.', price: 15000 },
      { id: 'srv-9', name: 'Post-Construction Clean', description: 'Removal of paint drops, cement stains, and debris.', price: 45000 }
    ],
    pricing: {
      rateType: 'per_service',
      baseRate: 15000,
      calloutFee: 2000,
      additionalCharges: [
        { label: 'Special Disinfectant Spray', amount: 3000 }
      ]
    },
    availability: [
      { weekday: 'Tuesday', enabled: true, startTime: '07:00', endTime: '16:00' },
      { weekday: 'Wednesday', enabled: true, startTime: '07:00', endTime: '16:00' },
      { weekday: 'Thursday', enabled: true, startTime: '07:00', endTime: '16:00' },
      { weekday: 'Saturday', enabled: true, startTime: '08:00', endTime: '18:00' },
      { weekday: 'Sunday', enabled: true, startTime: '12:00', endTime: '18:00' }
    ]
  }
];

// Helper to initialize local storage
function initializeStorage() {
  if (!localStorage.getItem('hp_initialized')) {
    localStorage.setItem('hp_initialized', 'true');
    localStorage.setItem('hp_categories', JSON.stringify(CATEGORIES));
    localStorage.setItem('hp_artisans', JSON.stringify(ARTISANS_SEED));
    localStorage.setItem('hp_bookings', JSON.stringify([]));
    localStorage.setItem('hp_transactions', JSON.stringify([]));
    localStorage.setItem('hp_wallets', JSON.stringify([
      { userId: 'default-seeker', balance: 50000 },
      { userId: 'artisan-1', balance: 25000 },
      { userId: 'artisan-2', balance: 12000 },
      { userId: 'artisan-3', balance: 40000 }
    ]));
    localStorage.setItem('hp_bank_accounts', JSON.stringify([]));
    localStorage.setItem('hp_messages', JSON.stringify([]));
    localStorage.setItem('hp_disputes', JSON.stringify([]));
    localStorage.setItem('hp_notifications', JSON.stringify([]));
    
    // Seed default seeker user
    const defaultSeeker: User = {
      id: 'default-seeker',
      email: 'user@hustlepay.com',
      fullName: 'Leslie Sterling',
      phone: '+234 812 345 6789',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      roles: ['seeker'],
      activeModePreference: 'seeker',
      address: {
        formattedAddress: '42 Montgomery Road, Yaba, Lagos',
        latitude: 6.5058,
        longitude: 3.3768
      }
    };
    
    // Seed default artisan user (who has not completed onboarding)
    const defaultArtisan: User = {
      id: 'default-artisan',
      email: 'artisan@hustlepay.com',
      fullName: 'Kolawole Benson',
      phone: '+234 905 555 4433',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      roles: ['artisan'],
      activeModePreference: 'artisan',
      kycStatus: 'not_started'
    };

    localStorage.setItem('hp_users', JSON.stringify([defaultSeeker, defaultArtisan]));
  }

  // Force-seed a mock chat booking if bookings list is empty (helps immediate chat/messages testing)
  try {
    const bookingsStr = localStorage.getItem('hp_bookings');
    const bookings = bookingsStr ? JSON.parse(bookingsStr) : [];
    if (bookings.length === 0) {
      const defaultBooking: Booking = {
        id: 'mock-booking-1',
        reference: 'BK-8902',
        seekerId: 'default-seeker',
        artisanId: 'artisan-1',
        artisanName: 'Tunde Bakare',
        artisanAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
        seekerName: 'Leslie Sterling',
        seekerPhone: '+234 812 345 6789',
        status: 'accepted',
        serviceName: 'Pipe Leak Repair',
        description: 'Water leak under the kitchen sink. Need immediate leak repair and pipe checking.',
        photos: [],
        scheduledStartAt: new Date(Date.now() + 86400000).toISOString(),
        address: '42 Montgomery Road, Yaba, Lagos',
        calloutFee: 3000,
        estimatedAmount: 12000,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      };

      const initialMessages: Message[] = [
        {
          id: 'msg-1',
          bookingId: 'mock-booking-1',
          senderId: 'artisan-1',
          body: "Hello Leslie, I've seen your plumbing request. I can come over tomorrow morning.",
          createdAt: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: 'msg-2',
          bookingId: 'mock-booking-1',
          senderId: 'default-seeker',
          body: "That works for me. What time will you be arriving?",
          createdAt: new Date(Date.now() - 3000000).toISOString()
        },
        {
          id: 'msg-3',
          bookingId: 'mock-booking-1',
          senderId: 'artisan-1',
          body: "I'll be there by 9 AM sharp. Let me know if that works!",
          createdAt: new Date(Date.now() - 2500000).toISOString()
        }
      ];

      localStorage.setItem('hp_bookings', JSON.stringify([defaultBooking]));
      localStorage.setItem('hp_messages', JSON.stringify(initialMessages));
    }
  } catch (e) {
    console.error('Failed to seed default chat booking:', e);
  }
}

// Ensure storage is seeded immediately
initializeStorage();

// Storage Get/Set Utilities
const getStorageItem = <T>(key: string): T => JSON.parse(localStorage.getItem(key) || '[]');
const setStorageItem = <T>(key: string, data: T): void => localStorage.setItem(key, JSON.stringify(data));

export const mockDb = {
  // --- Service Categories ---
  getServiceCategories: (): ServiceCategory[] => getStorageItem<ServiceCategory[]>('hp_categories'),

  // --- Artisan Search & Profiles ---
  getArtisans: (
    categoryId?: string,
    query: string = '',
    filters: { minRating?: number; maxDistance?: number; rateType?: string } = {}
  ): ArtisanProfile[] => {
    let list = getStorageItem<ArtisanProfile[]>('hp_artisans');

    if (categoryId) {
      // Find matching category name and see if matches
      const cat = getStorageItem<ServiceCategory[]>('hp_categories').find(c => c.id === categoryId);
      if (cat) {
        // Simple mapping: Plumber matches Plumbing
        const catKey = cat.key.toLowerCase();
        list = list.filter(art => 
          art.businessName.toLowerCase().includes(catKey) || 
          art.bio.toLowerCase().includes(catKey) || 
          art.services.some(s => s.name.toLowerCase().includes(catKey))
        );
      }
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(art => 
        art.fullName.toLowerCase().includes(q) || 
        art.businessName.toLowerCase().includes(q) || 
        art.bio.toLowerCase().includes(q) ||
        art.services.some(s => s.name.toLowerCase().includes(q))
      );
    }

    if (filters.minRating) {
      list = list.filter(art => art.ratingAverage >= (filters.minRating || 0));
    }

    if (filters.maxDistance) {
      list = list.filter(art => art.distanceKm <= (filters.maxDistance || 999));
    }

    if (filters.rateType) {
      list = list.filter(art => art.pricing.rateType === filters.rateType);
    }

    return list;
  },

  getArtisanById: (id: string): ArtisanProfile | undefined => {
    return getStorageItem<ArtisanProfile[]>('hp_artisans').find(a => a.id === id);
  },

  getPostsByArtisan: (artisanId: string): ArtisanPost[] => {
    return mockDb.getAllPosts().filter(p => p.artisanId === artisanId);
  },

  getAllPosts: (): ArtisanPost[] => {
    const stored = getStorageItem<ArtisanPost[]>('hp_artisan_posts');
    if (stored.length > 0) return stored;

    // Seed posts once
    const artisans = getStorageItem<ArtisanProfile[]>('hp_artisans');
    const occupationMap: Record<string, string> = {};
    artisans.forEach(a => {
      const n = a.businessName.toLowerCase();
      const b = a.bio.toLowerCase();
      if (n.includes('plumb') || b.includes('plumb')) occupationMap[a.id] = 'Plumber';
      else if (n.includes('elect') || b.includes('elect')) occupationMap[a.id] = 'Electrician';
      else if (n.includes('carpen') || b.includes('carpen')) occupationMap[a.id] = 'Carpenter';
      else if (n.includes('clean') || b.includes('clean')) occupationMap[a.id] = 'Cleaner';
      else if (n.includes('paint') || b.includes('paint')) occupationMap[a.id] = 'Painter';
      else if (n.includes('mechanic') || n.includes('auto')) occupationMap[a.id] = 'Mechanic';
      else occupationMap[a.id] = 'Artisan';
    });

    const categories = ['Completed Work', 'Before & After', 'On-site', 'Showcase', 'Tip'];
    const captions = [
      'Just finished this job — client was absolutely thrilled! Clean result every time. 🔧',
      'Before & after speaks for itself. Quality craftsmanship, always on time. This is why we love what we do.',
      'On-site today in Lekki. Big project but we love a challenge! 💪 Call us anytime.',
      'This one took some patience but the finish is immaculate. Proud of this work — 3 days well spent.',
      'Pro tip: always check the fittings before signing off. Saves everyone time and money later. 💡',
      'Another satisfied customer! Referrals are always appreciated. Word of mouth is our best marketing 🙏',
      'Early morning call-out, problem solved in under 2 hours. Fast & reliable — that\'s our promise.',
    ];
    const seedComments: PostComment[][] = [
      [{ id: 'c1', postId: '', userId: 'usr-seed-1', userName: 'Chukwuemeka O.', userAvatar: 'https://i.pravatar.cc/150?img=11', body: 'Great work! How long did this take?', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }],
      [{ id: 'c2', postId: '', userId: 'usr-seed-2', userName: 'Amaka T.', userAvatar: 'https://i.pravatar.cc/150?img=5', body: 'This is exactly what I needed done in my house 🙌', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() }],
      [],
      [{ id: 'c3', postId: '', userId: 'usr-seed-3', userName: 'Bello I.', userAvatar: 'https://i.pravatar.cc/150?img=8', body: 'Bookmarking this artisan for next month!', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }],
    ];
    const imagePool = [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80',
    ];
    const posts: ArtisanPost[] = [];
    artisans.forEach((a, ai) => {
      const count = 2 + (ai % 2);
      for (let i = 0; i < count; i++) {
        const postId = `post-${a.id}-${i}`;
        const cms = seedComments[(ai + i) % seedComments.length].map(c => ({ ...c, postId, id: `${c.id}-${postId}` }));
        posts.push({
          id: postId,
          artisanId: a.id,
          artisanName: a.fullName,
          artisanAvatar: a.avatarUrl,
          artisanOccupation: occupationMap[a.id] || 'Artisan',
          imageUrl: i % 3 !== 2 ? imagePool[(ai + i) % imagePool.length] : undefined,
          caption: captions[(ai + i) % captions.length],
          category: categories[(ai + i) % categories.length],
          likesCount: 4 + ((ai * 3 + i * 7) % 42),
          likedByMe: false,
          comments: cms,
          createdAt: new Date(Date.now() - (i + ai) * 3 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    });
    setStorageItem('hp_artisan_posts', posts);
    return posts;
  },

  likePost: (postId: string): ArtisanPost[] => {
    const posts = getStorageItem<ArtisanPost[]>('hp_artisan_posts');
    const updated = posts.map(p =>
      p.id === postId
        ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likedByMe ? p.likesCount - 1 : p.likesCount + 1 }
        : p
    );
    setStorageItem('hp_artisan_posts', updated);
    return updated;
  },

  addComment: (postId: string, userId: string, userName: string, userAvatar: string, body: string): ArtisanPost[] => {
    const posts = getStorageItem<ArtisanPost[]>('hp_artisan_posts');
    const comment: PostComment = {
      id: `cmt-${Math.random().toString(36).substr(2, 9)}`,
      postId,
      userId,
      userName,
      userAvatar,
      body,
      createdAt: new Date().toISOString(),
    };
    const updated = posts.map(p =>
      p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
    );
    setStorageItem('hp_artisan_posts', updated);
    return updated;
  },

  // --- Auth & Users ---
  signup: (userData: Omit<User, 'id' | 'roles' | 'activeModePreference'>, initialRole: 'seeker' | 'artisan'): User => {
    const users = getStorageItem<User[]>('hp_users');
    const newUser: User = {
      ...userData,
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      roles: [initialRole],
      activeModePreference: initialRole,
      kycStatus: initialRole === 'artisan' ? 'not_started' : undefined
    };
    users.push(newUser);
    setStorageItem('hp_users', users);

    // Initialize wallet
    const wallets = getStorageItem<Wallet[]>('hp_wallets');
    wallets.push({ userId: newUser.id, balance: 0 });
    setStorageItem('hp_wallets', wallets);

    return newUser;
  },

  login: (email: string, role: 'seeker' | 'artisan'): User => {
    const users = getStorageItem<User[]>('hp_users');
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      const cleanName = email.split('@')[0];
      const fullName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      user = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        fullName,
        phone: '+234 800 000 0000',
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`,
        roles: [role],
        activeModePreference: role,
        kycStatus: role === 'artisan' ? 'approved' : undefined,
        address: {
          formattedAddress: '42 Montgomery Road, Yaba, Lagos',
          latitude: 6.5058,
          longitude: 3.3768
        }
      };
      users.push(user);
      setStorageItem('hp_users', users);

      const wallets = getStorageItem<Wallet[]>('hp_wallets');
      wallets.push({ userId: user.id, balance: 100000 });
      setStorageItem('hp_wallets', wallets);
    }
    return user;
  },

  getUserById: (id: string): User | undefined => {
    return getStorageItem<User[]>('hp_users').find(u => u.id === id);
  },

  updateUser: (id: string, updates: Partial<User>): User => {
    const users = getStorageItem<User[]>('hp_users');
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    
    users[idx] = { ...users[idx], ...updates };
    setStorageItem('hp_users', users);
    return users[idx];
  },

  // --- Artisan Onboarding & Verification ---
  setupArtisanProfile: (
    userId: string,
    services: { name: string; description: string; price: number }[],
    pricing: ArtisanProfile['pricing'],
    availability: ArtisanProfile['availability'],
    bio: string,
    yearsExperience: number,
    businessName: string
  ): void => {
    const artisans = getStorageItem<ArtisanProfile[]>('hp_artisans');
    const user = mockDb.getUserById(userId);
    if (!user) return;

    const newProfile: ArtisanProfile = {
      id: userId,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      businessName,
      bio,
      yearsExperience,
      ratingAverage: 5.0,
      ratingCount: 0,
      completedJobsCount: 0,
      distanceKm: parseFloat((Math.random() * 5).toFixed(1)),
      serviceAreaKm: 15,
      services: services.map((s, idx) => ({ ...s, id: `srv-custom-${userId}-${idx}` })),
      pricing,
      availability
    };

    const idx = artisans.findIndex(a => a.id === userId);
    if (idx !== -1) {
      artisans[idx] = newProfile;
    } else {
      artisans.push(newProfile);
    }
    setStorageItem('hp_artisans', artisans);

    // Update user kycStatus to pending review
    mockDb.updateUser(userId, { kycStatus: 'pending_review' });
    mockDb.createNotification(userId, 'Application Submitted', 'Your artisan application is currently pending admin review.');
  },

  // Approve artisan via admin mockup panel
  adminApproveArtisan: (userId: string, approve: boolean, reason?: string): void => {
    const user = mockDb.getUserById(userId);
    if (!user) return;

    if (approve) {
      mockDb.updateUser(userId, { kycStatus: 'approved', roles: [...new Set([...user.roles, 'artisan' as const])] });
      mockDb.createNotification(userId, 'Application Approved!', 'Congratulations! Your profile is approved. You can now access the Artisan Dashboard.');
    } else {
      mockDb.updateUser(userId, { kycStatus: 'rejected', rejectionReason: reason || 'Incomplete document files' });
      mockDb.createNotification(userId, 'Application Rejected', `Reason: ${reason || 'Incomplete docs'}. Please revise your documents.`);
    }
  },

  // --- Bookings Lifecycle ---
  createBooking: (
    seekerId: string,
    artisanId: string,
    serviceName: string,
    description: string,
    photos: string[],
    scheduledStartAt: string
  ): Booking => {
    const seeker = mockDb.getUserById(seekerId);
    const artisan = mockDb.getArtisanById(artisanId);
    if (!seeker || !artisan) throw new Error('Seeker or Artisan profile missing');

    // Deduct callout fee from seeker wallet
    const callout = artisan.pricing.calloutFee;
    mockDb.deductWallet(seekerId, callout, `Call-out fee for ${artisan.fullName}`, `HP-${Math.floor(Math.random()*100000)}`);

    const booking: Booking = {
      id: `bk-${Math.random().toString(36).substr(2, 9)}`,
      reference: `HP-${Math.floor(100000 + Math.random() * 900000)}`,
      seekerId,
      artisanId,
      artisanName: artisan.fullName,
      artisanAvatar: artisan.avatarUrl,
      seekerName: seeker.fullName,
      seekerPhone: seeker.phone,
      status: 'requested',
      serviceName,
      description,
      photos,
      scheduledStartAt,
      address: seeker.address?.formattedAddress || 'Lagos, Nigeria',
      calloutFee: callout,
      estimatedAmount: artisan.pricing.baseRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const bookings = getStorageItem<Booking[]>('hp_bookings');
    bookings.push(booking);
    setStorageItem('hp_bookings', bookings);

    // Notify artisan
    mockDb.createNotification(artisanId, 'New Booking Request', `${seeker.fullName} requested you for ${serviceName}.`);

    return booking;
  },

  getBookings: (userId: string, mode: 'seeker' | 'artisan'): Booking[] => {
    const bookings = getStorageItem<Booking[]>('hp_bookings');
    return bookings
      .filter(b => (mode === 'seeker' ? b.seekerId === userId : b.artisanId === userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getBookingById: (id: string): Booking | undefined => {
    return getStorageItem<Booking[]>('hp_bookings').find(b => b.id === id);
  },

  updateBookingStatus: (
    id: string,
    status: Booking['status'],
    additionalData: Partial<Booking> = {}
  ): Booking => {
    const bookings = getStorageItem<Booking[]>('hp_bookings');
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Booking not found');

    const updated = {
      ...bookings[idx],
      ...additionalData,
      status,
      updatedAt: new Date().toISOString()
    };
    bookings[idx] = updated;
    setStorageItem('hp_bookings', bookings);

    // Notify other party
    const seekerNotify = updated.seekerId;
    const artisanNotify = updated.artisanId;
    const ref = updated.reference;

    if (status === 'accepted') {
      mockDb.createNotification(seekerNotify, 'Booking Accepted', `${updated.artisanName} accepted your request (${ref}).`);
    } else if (status === 'declined') {
      // Refund call-out fee
      mockDb.creditWallet(seekerNotify, updated.calloutFee, `Refund: Request declined`, ref);
      mockDb.createNotification(seekerNotify, 'Booking Declined', `${updated.artisanName} declined your request (${ref}). Call-out fee refunded.`);
    } else if (status === 'in_progress') {
      mockDb.createNotification(seekerNotify, 'Job Started', `${updated.artisanName} is on site and has started the job.`);
    } else if (status === 'completed') {
      mockDb.createNotification(seekerNotify, 'Job Completed', `${updated.artisanName} marked the job completed. Please confirm completion & pay.`);
    } else if (status === 'seeker_confirmed') {
      // Release payment to artisan wallet (95% to artisan, 5% commission)
      const finalAmount = updated.finalAmount || updated.estimatedAmount;
      const commission = Math.round(finalAmount * 0.05);
      const net = finalAmount - commission;

      // Credit artisan
      mockDb.creditWallet(artisanNotify, net, `Payout for booking ${ref}`, ref);
      // Commission entry
      mockDb.createCommissionEntry(commission, ref);

      mockDb.createNotification(artisanNotify, 'Job Confirmed & Paid', `Seeker confirmed job ${ref}. Net payout of ₦${net.toLocaleString()} added to wallet.`);
    } else if (status === 'cancelled') {
      // Simple cancellation: refund seeker call-out fee if cancelled early
      mockDb.creditWallet(seekerNotify, updated.calloutFee, `Refund: Booking cancelled`, ref);
      mockDb.createNotification(artisanNotify, 'Booking Cancelled', `Seeker cancelled the booking ${ref}.`);
    }

    return updated;
  },

  // --- Wallet Operations ---
  getWallet: (userId: string): Wallet => {
    const wallets = getStorageItem<Wallet[]>('hp_wallets');
    let wallet = wallets.find(w => w.userId === userId);
    if (!wallet) {
      wallet = { userId, balance: 0 };
      wallets.push(wallet);
      setStorageItem('hp_wallets', wallets);
    }
    return wallet;
  },

  deductWallet: (userId: string, amount: number, description: string, ref: string): boolean => {
    const wallets = getStorageItem<Wallet[]>('hp_wallets');
    const idx = wallets.findIndex(w => w.userId === userId);
    if (idx === -1) return false;

    if (wallets[idx].balance < amount) throw new Error('Insufficient wallet balance');

    wallets[idx].balance -= amount;
    setStorageItem('hp_wallets', wallets);

    // Record Transaction
    const txs = getStorageItem<Transaction[]>('hp_transactions');
    txs.push({
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: description.toLowerCase().includes('call') ? 'callout_payment' : 'service_payment',
      amount,
      direction: 'debit',
      status: 'successful',
      bookingRef: ref,
      description,
      createdAt: new Date().toISOString()
    });
    setStorageItem('hp_transactions', txs);

    return true;
  },

  creditWallet: (userId: string, amount: number, description: string, ref?: string): void => {
    const wallets = getStorageItem<Wallet[]>('hp_wallets');
    const idx = wallets.findIndex(w => w.userId === userId);
    if (idx !== -1) {
      wallets[idx].balance += amount;
    } else {
      wallets.push({ userId, balance: amount });
    }
    setStorageItem('hp_wallets', wallets);

    const txs = getStorageItem<Transaction[]>('hp_transactions');
    txs.push({
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: description.toLowerCase().includes('top') ? 'top_up' : 'service_payment',
      amount,
      direction: 'credit',
      status: 'successful',
      bookingRef: ref,
      description,
      createdAt: new Date().toISOString()
    });
    setStorageItem('hp_transactions', txs);
  },

  createCommissionEntry: (amount: number, ref: string): void => {
    const txs = getStorageItem<Transaction[]>('hp_transactions');
    txs.push({
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'admin-commission-account',
      type: 'commission',
      amount,
      direction: 'credit',
      status: 'successful',
      bookingRef: ref,
      description: `HustlePay 5% commission on booking ${ref}`,
      createdAt: new Date().toISOString()
    });
    setStorageItem('hp_transactions', txs);
  },

  getTransactions: (userId: string): Transaction[] => {
    const txs = getStorageItem<Transaction[]>('hp_transactions');
    return txs
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // --- Bank Accounts & Withdrawals ---
  getBankAccounts: (userId: string): BankAccount[] => {
    const accounts = getStorageItem<BankAccount[]>('hp_bank_accounts');
    return accounts.filter(a => a.userId === userId);
  },

  addBankAccount: (userId: string, bankName: string, accountNumber: string, accountName: string): BankAccount => {
    const accounts = getStorageItem<BankAccount[]>('hp_bank_accounts');
    const newAcc: BankAccount = {
      id: `acc-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      bankName,
      accountNumber,
      accountName,
      isDefault: accounts.filter(a => a.userId === userId).length === 0
    };
    accounts.push(newAcc);
    setStorageItem('hp_bank_accounts', accounts);
    return newAcc;
  },

  withdraw: (userId: string, amount: number, bankAccountId: string): void => {
    const bank = getStorageItem<BankAccount[]>('hp_bank_accounts').find(b => b.id === bankAccountId);
    if (!bank) throw new Error('Bank account details not found');

    const wallets = getStorageItem<Wallet[]>('hp_wallets');
    const idx = wallets.findIndex(w => w.userId === userId);
    if (idx === -1 || wallets[idx].balance < amount) throw new Error('Insufficient wallet balance');

    wallets[idx].balance -= amount;
    setStorageItem('hp_wallets', wallets);

    // Record transaction
    const txs = getStorageItem<Transaction[]>('hp_transactions');
    txs.push({
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'withdrawal',
      amount,
      direction: 'debit',
      status: 'successful',
      description: `Withdrawal to bank account (${bank.bankName} - ${bank.accountNumber.substr(-4)})`,
      createdAt: new Date().toISOString()
    });
    setStorageItem('hp_transactions', txs);
    mockDb.createNotification(userId, 'Withdrawal Successful', `₦${amount.toLocaleString()} was successfully transferred to your bank account.`);
  },

  // --- In-App Chat ---
  getConversations: (userId: string): { booking: Booking; lastMessage?: Message }[] => {
    const bookings = getStorageItem<Booking[]>('hp_bookings');
    const messages = getStorageItem<Message[]>('hp_messages');

    const userBookings = bookings.filter(b => b.seekerId === userId || b.artisanId === userId);
    
    return userBookings.map(booking => {
      const chatMsgs = messages.filter(m => m.bookingId === booking.id);
      const lastMessage = chatMsgs.length > 0 ? chatMsgs[chatMsgs.length - 1] : undefined;
      return { booking, lastMessage };
    });
  },

  getMessages: (bookingId: string): Message[] => {
    return getStorageItem<Message[]>('hp_messages').filter(m => m.bookingId === bookingId);
  },

  sendMessage: (bookingId: string, senderId: string, body: string): Message => {
    const messages = getStorageItem<Message[]>('hp_messages');
    const newMsg: Message = {
      id: `msg-${Math.random().toString(36).substr(2, 9)}`,
      bookingId,
      senderId,
      body,
      createdAt: new Date().toISOString()
    };
    messages.push(newMsg);
    setStorageItem('hp_messages', messages);
    return newMsg;
  },

  // --- Disputes ---
  createDispute: (bookingId: string, openedByUserId: string, reason: string, description: string, _photos: string[]): Dispute => {
    const booking = mockDb.getBookingById(bookingId);
    if (!booking) throw new Error('Booking not found');

    const dispute: Dispute = {
      id: `disp-${Math.random().toString(36).substr(2, 9)}`,
      reference: `DISP-${Math.floor(100000 + Math.random()*900000)}`,
      bookingId,
      bookingRef: booking.reference,
      openedByUserId,
      reason,
      description,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    const disputes = getStorageItem<Dispute[]>('hp_disputes');
    disputes.push(dispute);
    setStorageItem('hp_disputes', disputes);

    // Update booking status
    mockDb.updateBookingStatus(bookingId, 'disputed');

    // Notify other party
    const targetUserId = openedByUserId === booking.seekerId ? booking.artisanId : booking.seekerId;
    mockDb.createNotification(targetUserId, 'Dispute Filed', `A dispute has been raised against booking ${booking.reference}.`);

    return dispute;
  },

  getDisputes: (userId: string): Dispute[] => {
    const disputes = getStorageItem<Dispute[]>('hp_disputes');
    const bookings = getStorageItem<Booking[]>('hp_bookings');
    
    // Disputes opened by user, or against bookings they are part of
    return disputes.filter(d => {
      const b = bookings.find(x => x.id === d.bookingId);
      if (!b) return false;
      return d.openedByUserId === userId || b.seekerId === userId || b.artisanId === userId;
    });
  },

  addReview: (bookingId: string, _seekerId: string, rating: number, _reviewText: string, _tags: string[]): void => {
    const artisans = getStorageItem<ArtisanProfile[]>('hp_artisans');
    const bookings = getStorageItem<Booking[]>('hp_bookings');
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const artIdx = artisans.findIndex(a => a.id === booking.artisanId);
    if (artIdx !== -1) {
      const art = artisans[artIdx];
      const newCount = art.ratingCount + 1;
      const newAverage = ((art.ratingAverage * art.ratingCount) + rating) / newCount;
      
      artisans[artIdx] = {
        ...art,
        ratingCount: newCount,
        ratingAverage: parseFloat(newAverage.toFixed(1)),
        completedJobsCount: art.completedJobsCount + 1
      };
      setStorageItem('hp_artisans', artisans);
    }
  },

  // --- Notifications ---
  createNotification: (userId: string, title: string, body: string): void => {
    const list = getStorageItem<Notification[]>('hp_notifications');
    list.push({
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title,
      body,
      read: false,
      createdAt: new Date().toISOString()
    });
    setStorageItem('hp_notifications', list);
  },

  getNotifications: (userId: string): Notification[] => {
    return getStorageItem<Notification[]>('hp_notifications')
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markNotificationsAsRead: (userId: string): void => {
    const list = getStorageItem<Notification[]>('hp_notifications');
    const updated = list.map(n => n.userId === userId ? { ...n, read: true } : n);
    setStorageItem('hp_notifications', updated);
  },

  markNotificationsByKeywordsAsRead: (userId: string, keywords: string[]): void => {
    const list = getStorageItem<Notification[]>('hp_notifications');
    const updated = list.map(n => {
      if (n.userId !== userId) return n;
      const match = keywords.some(k => 
        n.title.toLowerCase().includes(k) || n.body.toLowerCase().includes(k)
      );
      return match ? { ...n, read: true } : n;
    });
    setStorageItem('hp_notifications', updated);
  },

  // --- Job Openings ---
  createJobOpening: (seekerId: string, seekerName: string, title: string, categoryId: string, description: string, budget: number, address: string, imageUrl?: string): JobOpening => {
    const list = getStorageItem<JobOpening[]>('hp_openings');
    const categories = getStorageItem<ServiceCategory[]>('hp_categories');
    const cat = categories.find(c => c.id === categoryId);
    
    const newOpening: JobOpening = {
      id: `job-${Math.random().toString(36).substr(2, 9)}`,
      seekerId,
      seekerName,
      title,
      category: cat ? cat.name : 'General',
      categoryId,
      description,
      budget,
      address,
      status: 'open',
      createdAt: new Date().toISOString(),
      proposals: [],
      imageUrl
    };
    
    list.push(newOpening);
    setStorageItem('hp_openings', list);
    return newOpening;
  },

  getJobOpenings: (seekerId?: string): JobOpening[] => {
    const list = getStorageItem<JobOpening[]>('hp_openings');
    if (seekerId) {
      return list.filter(o => o.seekerId === seekerId);
    }
    return list;
  },

  getJobOpeningById: (id: string): JobOpening | undefined => {
    const list = getStorageItem<JobOpening[]>('hp_openings');
    return list.find(o => o.id === id);
  },

  updateJobOpening: (id: string, updates: Partial<JobOpening>): boolean => {
    const list = getStorageItem<JobOpening[]>('hp_openings');
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return false;
    
    if (updates.categoryId) {
      const categories = getStorageItem<ServiceCategory[]>('hp_categories');
      const cat = categories.find(c => c.id === updates.categoryId);
      if (cat) {
        updates.category = cat.name;
      }
    }

    list[idx] = { ...list[idx], ...updates };
    setStorageItem('hp_openings', list);
    return true;
  },

  submitJobProposal: (jobId: string, artisanId: string, price: number, note: string): boolean => {
    const list = getStorageItem<JobOpening[]>('hp_openings');
    const artisans = getStorageItem<ArtisanProfile[]>('hp_artisans');
    const artisan = artisans.find(a => a.id === artisanId);
    if (!artisan) return false;

    const idx = list.findIndex(o => o.id === jobId);
    if (idx === -1) return false;

    const job = list[idx];
    if (job.status !== 'open') return false;

    // Check if artisan already has a proposal
    const exists = job.proposals.some(p => p.artisanId === artisanId);
    if (exists) return false;

    const newProposal: JobProposal = {
      id: `prop-${Math.random().toString(36).substr(2, 9)}`,
      artisanId,
      artisanName: artisan.businessName,
      artisanAvatar: artisan.avatarUrl,
      price,
      note,
      createdAt: new Date().toISOString()
    };

    job.proposals.push(newProposal);
    list[idx] = job;
    setStorageItem('hp_openings', list);

    // Notify seeker that they got a new bid
    mockDb.createNotification(job.seekerId, 'New Bid Received', `Artisan ${artisan.businessName} submitted a bid of ₦${price.toLocaleString()} for "${job.title}".`);

    return true;
  },

  acceptJobProposal: (jobId: string, proposalId: string): Booking | null => {
    const openings = getStorageItem<JobOpening[]>('hp_openings');
    const bookings = getStorageItem<Booking[]>('hp_bookings');
    const users = getStorageItem<User[]>('hp_users');

    const jobIdx = openings.findIndex(o => o.id === jobId);
    if (jobIdx === -1) return null;
    const job = openings[jobIdx];

    const prop = job.proposals.find(p => p.id === proposalId);
    if (!prop) return null;

    const seeker = users.find(u => u.id === job.seekerId);

    // Update job opening status
    openings[jobIdx] = {
      ...job,
      status: 'assigned',
      artisanId: prop.artisanId
    };
    setStorageItem('hp_openings', openings);

    // Create booking
    const newBooking: Booking = {
      id: `book-${Math.random().toString(36).substr(2, 9)}`,
      reference: `HP-${Math.floor(100000 + Math.random() * 900000)}`,
      seekerId: job.seekerId,
      artisanId: prop.artisanId,
      artisanName: prop.artisanName,
      artisanAvatar: prop.artisanAvatar,
      seekerName: seeker?.fullName || job.seekerName,
      seekerPhone: seeker?.phone || '',
      status: 'accepted',
      serviceName: job.title,
      description: job.description,
      photos: [],
      scheduledStartAt: new Date(Date.now() + 24*60*60*1000).toISOString(),
      address: job.address,
      calloutFee: 0,
      estimatedAmount: prop.price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    setStorageItem('hp_bookings', bookings);

    // Notify artisan that their bid was accepted
    mockDb.createNotification(prop.artisanId, 'Bid Accepted!', `Your bid of ₦${prop.price.toLocaleString()} for "${job.title}" has been accepted.`);

    return newBooking;
  }
};
