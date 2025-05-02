
export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  followers: number;
  following: number;
  bio: string;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  likes: number;
  timestamp: string;
  replies?: Comment[];
}

export interface Idea {
  id: string;
  user: User;
  title: string;
  description: string;
  type: 'video' | 'card';
  category: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  shares: number;
  videoUrl?: string;
  images?: string[];
  thumbnailUrl: string;
  timestamp: string;
  rating?: {
    practicality: number;
    innovation: number;
    impact: number;
  };
}

// Mock users
const users: User[] = [
  {
    id: "user1",
    username: "innovator",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    followers: 2400,
    following: 125,
    bio: "Product designer | Innovator 💡 | Sharing ideas that can change the world!"
  },
  {
    id: "user2",
    username: "techguru",
    name: "Mike Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    followers: 1800,
    following: 340,
    bio: "Tech enthusiast | Software engineer 💻 | Turning problems into solutions"
  },
  {
    id: "user3",
    username: "greenthoughts",
    name: "Emma Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    followers: 900,
    following: 230,
    bio: "Environmental scientist | Sustainability advocate 🌱 | Ideas for a greener future"
  },
  {
    id: "user4",
    username: "healthhacker",
    name: "Alex Rodriguez",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    followers: 3200,
    following: 182,
    bio: "Healthcare innovator | Digital health expert 🩺 | Creating better health solutions"
  },
  {
    id: "user5",
    username: "artfulminds",
    name: "Kevin Hart",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    followers: 5600,
    following: 95,
    bio: "Creative director | Artist 🎨 | Exploring innovative artistic concepts"
  }
];

// Video URLs (these would be actual video files in a real app)
const videoSources = [
  "https://player.vimeo.com/progressive_redirect/playback/768182537/rendition/1080p/file.mp4?loc=external&signature=3d33aafd14b9015b61df9e66b2f9a177e2a63144ad10dd62d398a02e8c76b745",
  "https://player.vimeo.com/progressive_redirect/playback/698682854/rendition/720p/file.mp4?loc=external&signature=0cb5c5a8b6c25612344fe5581a7a49a7965b9272eaf22d9f0d094b7318414dc2",
  "https://player.vimeo.com/progressive_redirect/playback/573128233/rendition/720p/file.mp4?loc=external&signature=7215269018a9b37ea9611b3ad8233a396ad64d41b853acddbbbf0febc24b981e",
  "https://player.vimeo.com/progressive_redirect/playback/829971762/rendition/540p/file.mp4?loc=external&signature=b1268618b40a50bfceb5a4a2659387c7a51c468542b99ee8bea9cdfac0998dfa",
  "https://player.vimeo.com/progressive_redirect/playback/771877976/rendition/720p/file.mp4?loc=external&signature=ae2e6f9168a2778935424aaf983bc7137859784b005a429148c0b4fc25e77c56"
];

// Create mock ideas
export const ideas: Idea[] = [
  {
    id: "idea1",
    user: users[0],
    title: "AI-Powered Smart Garden",
    description: "A smart garden system that uses AI to optimize water usage, detect plant diseases, and provide personalized care recommendations. 🌱 #sustainability #ai #gardening",
    type: "video",
    category: "Technology",
    tags: ["sustainability", "ai", "gardening"],
    likes: 1200,
    comments: [
      {
        id: "comment1",
        user: users[1],
        text: "This could drastically reduce water waste in agriculture!",
        likes: 24,
        timestamp: "2h ago"
      },
      {
        id: "comment2",
        user: users[2],
        text: "Have you considered integrating solar panels to make it fully sustainable? 🔋",
        likes: 18,
        timestamp: "3h ago"
      }
    ],
    shares: 45,
    videoUrl: videoSources[0],
    thumbnailUrl: "https://images.unsplash.com/photo-1545128485-c400ce7b6892?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    timestamp: "5h ago",
    rating: {
      practicality: 8,
      innovation: 9,
      impact: 7
    }
  },
  {
    id: "idea2",
    user: users[1],
    title: "Decentralized Education Platform",
    description: "A blockchain-based platform that connects students directly with educators worldwide, eliminating intermediaries and reducing costs. 📚 #education #blockchain #decentralized",
    type: "card",
    category: "Education",
    tags: ["education", "blockchain", "decentralized"],
    likes: 890,
    comments: [
      {
        id: "comment3",
        user: users[0],
        text: "This could revolutionize access to education in developing countries!",
        likes: 12,
        timestamp: "1h ago"
      }
    ],
    shares: 32,
    images: [
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    timestamp: "1d ago",
    rating: {
      practicality: 6,
      innovation: 8,
      impact: 9
    }
  },
  {
    id: "idea3",
    user: users[2],
    title: "Biodegradable Food Packaging",
    description: "Packaging made from food waste that naturally decomposes in 30 days and even adds nutrients to soil. 🌎 #sustainability #zerowaste #packaging",
    type: "video",
    category: "Environment",
    tags: ["sustainability", "zerowaste", "packaging"],
    likes: 750,
    comments: [
      {
        id: "comment4",
        user: users[3],
        text: "Have you tested how it holds up in different climates?",
        likes: 9,
        timestamp: "4h ago"
      },
      {
        id: "comment5",
        user: users[4],
        text: "This could eliminate so much plastic waste!",
        likes: 32,
        timestamp: "5h ago"
      }
    ],
    shares: 28,
    videoUrl: videoSources[2],
    thumbnailUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    timestamp: "2d ago",
    rating: {
      practicality: 7,
      innovation: 9,
      impact: 10
    }
  },
  {
    id: "idea4",
    user: users[3],
    title: "Mental Health AI Companion",
    description: "An AI assistant specially trained to detect signs of anxiety and depression through voice analysis, and provide personalized coping strategies. 🧠 #mentalhealth #ai #wellness",
    type: "card",
    category: "Healthcare",
    tags: ["mentalhealth", "ai", "wellness"],
    likes: 1500,
    comments: [
      {
        id: "comment6",
        user: users[0],
        text: "Privacy concerns would need to be addressed, but the potential impact is enormous.",
        likes: 21,
        timestamp: "6h ago"
      }
    ],
    shares: 52,
    images: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    ],
    thumbnailUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    timestamp: "3d ago",
    rating: {
      practicality: 8,
      innovation: 7,
      impact: 9
    }
  },
  {
    id: "idea5",
    user: users[4],
    title: "Community Skill Exchange",
    description: "A neighborhood platform where people can trade skills instead of money - coding lessons for home cooking, language tutoring for garden help, etc. 🤝 #community #sharing #skills",
    type: "video",
    category: "Social",
    tags: ["community", "sharing", "skills"],
    likes: 3200,
    comments: [
      {
        id: "comment7",
        user: users[1],
        text: "We're building something similar in our neighborhood - it works!",
        likes: 45,
        timestamp: "2h ago"
      },
      {
        id: "comment8",
        user: users[2],
        text: "Would love to see this scaled with some kind of skill verification system.",
        likes: 23,
        timestamp: "3h ago"
      }
    ],
    shares: 125,
    videoUrl: videoSources[4],
    thumbnailUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    timestamp: "5h ago",
    rating: {
      practicality: 9,
      innovation: 6,
      impact: 8
    }
  }
];

export const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return count.toString();
  }
};
