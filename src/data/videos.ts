
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

export interface Video {
  id: string;
  user: User;
  description: string;
  audioName: string;
  audioCreator: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  shares: number;
  videoUrl: string;
  thumbnailUrl: string;
  timestamp: string;
}

// Mock users
const users: User[] = [
  {
    id: "user1",
    username: "dancingqueen",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    followers: 2400000,
    following: 125,
    bio: "Professional dancer | Choreographer 💃 | Follow for daily dance videos!"
  },
  {
    id: "user2",
    username: "travelguy",
    name: "Mike Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    followers: 1800000,
    following: 340,
    bio: "Traveling the world one country at a time ✈️ | 30 countries and counting"
  },
  {
    id: "user3",
    username: "foodieforlife",
    name: "Emma Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    followers: 900000,
    following: 230,
    bio: "Food blogger | Recipe creator 🍕 | Sharing delicious recipes daily"
  },
  {
    id: "user4",
    username: "fitnessguru",
    name: "Alex Rodriguez",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    followers: 3200000,
    following: 182,
    bio: "Personal trainer | Fitness coach 💪 | Helping you achieve your fitness goals"
  },
  {
    id: "user5",
    username: "comedyking",
    name: "Kevin Hart",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
    followers: 5600000,
    following: 95,
    bio: "Comedian | Actor 🎭 | Making the world laugh one video at a time"
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

// Create mock videos
export const videos: Video[] = [
  {
    id: "video1",
    user: users[0],
    description: "Check out my new dance routine! 💃 #dance #choreography",
    audioName: "Original Sound - dancingqueen",
    audioCreator: "dancingqueen",
    tags: ["dance", "choreography", "viral"],
    likes: 1200000,
    comments: [
      {
        id: "comment1",
        user: users[1],
        text: "This is amazing! Can you do a tutorial?",
        likes: 2400,
        timestamp: "2h ago"
      },
      {
        id: "comment2",
        user: users[2],
        text: "Your moves are so smooth! 🔥",
        likes: 1800,
        timestamp: "3h ago"
      }
    ],
    shares: 45000,
    videoUrl: videoSources[0],
    thumbnailUrl: "https://images.unsplash.com/photo-1545128485-c400ce7b6892?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    timestamp: "5h ago"
  },
  {
    id: "video2",
    user: users[1],
    description: "Beautiful sunset in Bali 🌅 #travel #bali #sunset",
    audioName: "Tropical Vibes - DJ Summer",
    audioCreator: "djsummer",
    tags: ["travel", "bali", "sunset", "vacation"],
    likes: 890000,
    comments: [
      {
        id: "comment3",
        user: users[0],
        text: "Wow! Adding this to my bucket list!",
        likes: 1200,
        timestamp: "1h ago"
      }
    ],
    shares: 32000,
    videoUrl: videoSources[1],
    thumbnailUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    timestamp: "1d ago"
  },
  {
    id: "video3",
    user: users[2],
    description: "Easy 5-minute chocolate cake recipe 🍰 #recipe #food #dessert",
    audioName: "Cooking Time - Music Box",
    audioCreator: "musicbox",
    tags: ["recipe", "food", "dessert", "chocolate"],
    likes: 750000,
    comments: [
      {
        id: "comment4",
        user: users[3],
        text: "I tried this and it was delicious!",
        likes: 950,
        timestamp: "4h ago"
      },
      {
        id: "comment5",
        user: users[4],
        text: "Can I use almond flour instead?",
        likes: 320,
        timestamp: "5h ago"
      }
    ],
    shares: 28000,
    videoUrl: videoSources[2],
    thumbnailUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    timestamp: "2d ago"
  },
  {
    id: "video4",
    user: users[3],
    description: "Try this 10-minute ab workout at home! No equipment needed 💪 #fitness #workout #abs",
    audioName: "Workout Beats - Fitness Music",
    audioCreator: "fitnessmusic",
    tags: ["fitness", "workout", "abs", "homeworkout"],
    likes: 1500000,
    comments: [
      {
        id: "comment6",
        user: users[0],
        text: "Just tried this and I'm sweating! Great workout!",
        likes: 2100,
        timestamp: "6h ago"
      }
    ],
    shares: 52000,
    videoUrl: videoSources[3],
    thumbnailUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    timestamp: "3d ago"
  },
  {
    id: "video5",
    user: users[4],
    description: "When your mom calls you by your full name 😂 #comedy #funny #skit",
    audioName: "Comedy Sound Effects",
    audioCreator: "soundeffects",
    tags: ["comedy", "funny", "skit", "viral"],
    likes: 3200000,
    comments: [
      {
        id: "comment7",
        user: users[1],
        text: "This is so relatable 🤣",
        likes: 4500,
        timestamp: "2h ago"
      },
      {
        id: "comment8",
        user: users[2],
        text: "You always make my day with your videos!",
        likes: 2300,
        timestamp: "3h ago"
      }
    ],
    shares: 125000,
    videoUrl: videoSources[4],
    thumbnailUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
    timestamp: "5h ago"
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
