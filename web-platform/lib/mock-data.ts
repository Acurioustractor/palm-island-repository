// Mock data for development and testing
// Replace with real Supabase data in production

export const mockStories = [
  {
    id: '1',
    title: 'Finding Strength Through Healing Circle',
    summary: 'Martha shares her healing journey through Bwgcolman Healing Service monthly circles.',
    content: `My journey with the Bwgcolman Healing Service began after experiencing profound loss. Through monthly healing circles, I found a safe space where traditional medicine combined with contemporary therapeutic approaches.

The support of other community members and the guidance of our healing practitioners helped me find my voice again. I learned that healing happens in community, not isolation.

Today, I share my story to encourage others to seek support when they need it. The healing circle taught me that vulnerability is strength, and that our cultural ways of healing are powerful and valid.`,
    featured_image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    category: ['health', 'healing', 'culture'],
    themes: ['traditional-medicine', 'community-support', 'grief', 'resilience'],
    storyteller: {
      full_name: 'Martha Johnson',
      display_name: 'Martha',
      avatar_url: 'https://i.pravatar.cc/150?img=1',
      community_role: 'Elder'
    },
    service: {
      name: 'Bwgcolman Healing Service',
      slug: 'bwgcolman-healing'
    },
    location_name: 'Cultural Centre',
    story_date: '2024-03-15',
    access_level: 'public',
    view_count: 234,
    published: true,
    created_at: '2024-03-16T10:30:00Z'
  },
  {
    id: '2',
    title: 'Youth Basketball Program Success',
    summary: 'James describes how the basketball program has positively impacted youth on Palm Island.',
    content: `The youth basketball program has been more than just a sport for me and my mates. It's given us purpose, discipline, and a sense of belonging.

Every week we come together, learn from our coaches, and support each other on and off the court. The program has helped many of us stay focused on our goals and build friendships that will last a lifetime.

We're grateful to PICC Youth Services for believing in us and giving us this opportunity. Basketball has taught us teamwork, resilience, and the importance of showing up – not just for ourselves, but for each other.`,
    featured_image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    category: ['youth', 'sports', 'community'],
    themes: ['youth-development', 'sports', 'mentorship', 'community-building'],
    storyteller: {
      full_name: 'James Williams',
      display_name: 'James',
      avatar_url: 'https://i.pravatar.cc/150?img=12',
      community_role: 'Youth Leader'
    },
    service: {
      name: 'Youth Services',
      slug: 'youth-services'
    },
    location_name: 'Community Sports Ground',
    story_date: '2024-06-20',
    access_level: 'public',
    view_count: 187,
    published: true,
    created_at: '2024-06-21T14:15:00Z'
  },
  {
    id: '3',
    title: 'Traditional Healing Practices',
    summary: 'Elder William shares traditional healing knowledge and its integration with contemporary services.',
    content: `As an elder who has practiced traditional healing for over 40 years, I've seen the importance of passing this knowledge to younger generations.

Traditional bush medicine, combined with modern understanding, offers powerful healing for our people. The plants our ancestors used for thousands of years still hold their power today.

The Bwgcolman Healing Service respects both ways of knowing and creates space for our ancestral wisdom. This is how we maintain our culture while moving forward together. Our young people need to know these practices, and I'm proud to see them learning.`,
    featured_image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    category: ['culture', 'health', 'healing'],
    themes: ['traditional-knowledge', 'cultural-preservation', 'intergenerational', 'traditional-medicine'],
    storyteller: {
      full_name: 'William Thompson',
      display_name: 'William',
      avatar_url: 'https://i.pravatar.cc/150?img=33',
      community_role: 'Elder and Traditional Healer'
    },
    service: {
      name: 'Bwgcolman Healing Service',
      slug: 'bwgcolman-healing'
    },
    location_name: 'Cultural Centre',
    story_date: '2024-01-10',
    access_level: 'community',
    view_count: 156,
    published: true,
    created_at: '2024-01-11T09:00:00Z'
  },
  {
    id: '4',
    title: 'Family Wellbeing Journey',
    summary: 'A family shares their experience with PICC Family Wellbeing Centre support services.',
    content: `When our family was going through a difficult time, we didn't know where to turn. The Family Wellbeing Centre became our lifeline.

The staff didn't just provide services – they walked alongside us with compassion and understanding. They helped us rebuild communication, heal old wounds, and strengthen our family bonds.

What made the biggest difference was that they respected our culture and our way of doing things. They didn't come with a one-size-fits-all approach. They listened, they cared, and they helped us find our own strength as a family.`,
    featured_image_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    category: ['family', 'wellbeing', 'community'],
    themes: ['family-support', 'healing', 'community-services', 'cultural-respect'],
    storyteller: {
      full_name: 'Sarah Anderson',
      display_name: 'Sarah',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      community_role: 'Community Member'
    },
    service: {
      name: 'Family Wellbeing Centre',
      slug: 'family-wellbeing'
    },
    location_name: 'PICC Family Services Building',
    story_date: '2024-02-14',
    access_level: 'public',
    view_count: 142,
    published: true,
    created_at: '2024-02-15T11:20:00Z'
  },
  {
    id: '5',
    title: 'Cyclone Yasi: Community Resilience',
    summary: 'Remembering how our community came together during and after Cyclone Yasi.',
    content: `February 2011. We'll never forget Cyclone Yasi. Category 5. The strongest cyclone to hit Queensland in recorded history.

But what I remember most isn't the destruction – it's how our community came together. Neighbors checking on neighbors. Sharing food, water, shelter. No one was alone.

The cyclone destroyed buildings, but it couldn't destroy our spirit. We rebuilt together, stronger than before. That's the Palm Island way – we take care of each other, no matter what.

This platform helps us remember these moments and share them with future generations. Our resilience is our story.`,
    featured_image_url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800',
    category: ['community', 'history', 'resilience'],
    themes: ['cyclone-yasi', 'community-resilience', 'disaster-recovery', 'solidarity'],
    storyteller: {
      full_name: 'Robert Wilson',
      display_name: 'Rob',
      avatar_url: 'https://i.pravatar.cc/150?img=68',
      community_role: 'Long-time Resident'
    },
    service: null,
    location_name: 'Bwgcolman',
    story_date: '2011-02-03',
    access_level: 'public',
    view_count: 298,
    published: true,
    created_at: '2024-02-03T16:00:00Z'
  },
  {
    id: '6',
    title: "Women's Healing Circle: Finding Our Voice",
    summary: 'The power of women coming together in a safe, cultural space to heal and grow.',
    content: `The Women's Healing Circle has become a sacred space for many of us. Every month, we gather to share, to listen, to heal.

In this circle, there's no judgment. Just understanding, support, and the wisdom of our sisters. We talk about things we can't talk about anywhere else. We cry, we laugh, we heal together.

The facilitators from the Women's Healing Service create a space that honors our culture and our experiences as Aboriginal women. They understand the unique challenges we face and the strength we carry.

This circle has changed my life. I've found my voice, my strength, and my sisters. We're not just healing ourselves – we're healing generations.`,
    featured_image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
    category: ['health', 'women', 'healing', 'culture'],
    themes: ['womens-healing', 'support-circles', 'cultural-healing', 'empowerment'],
    storyteller: {
      full_name: 'Linda Brown',
      display_name: 'Linda',
      avatar_url: 'https://i.pravatar.cc/150?img=9',
      community_role: 'Community Member'
    },
    service: {
      name: "Women's Healing Service",
      slug: 'womens-healing'
    },
    location_name: 'Women's Centre',
    story_date: '2024-05-08',
    access_level: 'community',
    view_count: 176,
    published: true,
    created_at: '2024-05-09T13:30:00Z'
  }
]

export const mockServices = [
  {
    id: '1',
    name: 'Bwgcolman Healing Service',
    slug: 'bwgcolman-healing',
    description: 'Culturally-appropriate healing and wellness services combining traditional and contemporary approaches.',
    service_type: 'healing',
    staff_count: 15,
    story_count: 47
  },
  {
    id: '2',
    name: 'Youth Services',
    slug: 'youth-services',
    description: 'Programs and support for young people including sports, education, and leadership development.',
    service_type: 'youth',
    staff_count: 9,
    story_count: 28
  },
  {
    id: '3',
    name: 'Family Wellbeing Centre',
    slug: 'family-wellbeing',
    description: 'Comprehensive family support services including counseling, case management, and family programs.',
    service_type: 'family',
    staff_count: 12,
    story_count: 34
  },
  {
    id: '4',
    name: "Women's Healing Service",
    slug: 'womens-healing',
    description: 'Specialized support for women including healing circles, case management, and cultural programs.',
    service_type: 'healing',
    staff_count: 8,
    story_count: 19
  },
  {
    id: '5',
    name: 'Educational Services',
    slug: 'educational-services',
    description: 'Education support, tutoring, and learning programs for all ages.',
    service_type: 'education',
    staff_count: 11,
    story_count: 15
  }
]

export const mockAnnualReportData = {
  year: 2024,
  period: {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  stories: {
    total: 142,
    byCategory: {
      'health': 47,
      'culture': 38,
      'youth': 28,
      'family': 34,
      'education': 15,
      'community': 29,
      'healing': 45
    },
    byService: {
      'Bwgcolman Healing Service': 47,
      'Youth Services': 28,
      'Family Wellbeing Centre': 34,
      "Women's Healing Service": 19,
      'Educational Services': 15
    },
    featured: mockStories.slice(0, 5)
  },
  services: mockServices.map(s => ({
    name: s.name,
    storyCount: s.story_count,
    staffCount: s.staff_count
  })),
  impact: {
    totalPeopleReached: 2341,
    storiesCollected: 142,
    communityEngagement: 87,
    servicesActive: 16
  },
  metadata: {
    generatedAt: new Date().toISOString(),
    generatedBy: 'Palm Island Story Server'
  }
}

export const categories = [
  { id: 'health', label: 'Health & Healing', color: 'green', count: 47 },
  { id: 'culture', label: 'Culture & Tradition', color: 'purple', count: 38 },
  { id: 'youth', label: 'Youth & Young People', color: 'blue', count: 28 },
  { id: 'family', label: 'Family & Community', color: 'pink', count: 34 },
  { id: 'education', label: 'Education & Learning', color: 'yellow', count: 15 },
  { id: 'healing', label: 'Healing Journeys', color: 'teal', count: 45 },
  { id: 'history', label: 'History & Resilience', color: 'orange', count: 12 },
  { id: 'women', label: "Women's Stories", color: 'rose', count: 19 }
]
