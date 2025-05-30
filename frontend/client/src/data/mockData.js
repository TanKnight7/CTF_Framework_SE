// Event information
export const eventInfo = {
  name: "CyberSec CTF Challenge 2025",
  status: "Active",
  startDate: "2025-05-01",
  startTime: "09:00",
  endDate: "2025-05-15",
  endTime: "18:00",
  location: "Virtual",
  participants: 120,
  description:
    "Welcome to the CyberSec CTF Challenge 2025! This Capture The Flag competition is designed to test your cybersecurity skills across various domains. Solve challenges, find flags, and compete with teams from around the world. The event features challenges in web exploitation, cryptography, reverse engineering, forensics, and more.",
};

// Announcements data
export const announcements = [
  {
    id: 1,
    title: "Welcome to CyberSec CTF 2025!",
    content:
      "Welcome to all participants! The competition has officially begun. All challenges are now live. Good luck and happy hacking!",
    date: "2025-05-01",
    time: "09:15",
  },
  {
    id: 2,
    title: "New Challenge Released: Crypto Madness",
    content:
      "We've just released a new challenge in the Cryptography category called 'Crypto Madness'. This is worth 300 points. Hint: Look beyond the obvious encoding.",
    date: "2025-05-03",
    time: "14:30",
  },
  {
    id: 3,
    title: "Server Maintenance",
    content:
      "We will be performing server maintenance today from 22:00 to 22:30 UTC. Some challenges might be temporarily unavailable during this period. We apologize for any inconvenience.",
    date: "2025-05-05",
    time: "18:45",
  },
  {
    id: 4,
    title: "Hint for 'Binary Bomb'",
    content:
      "Many teams are stuck on the 'Binary Bomb' challenge. Here's a hint: The overflow occurs in an unexpected place. Look at the error handling functions too.",
    date: "2025-05-07",
    time: "10:15",
  },
  {
    id: 5,
    title: "Final Day Reminder",
    content:
      "This is a reminder that the CTF will end tomorrow at 18:00 UTC. Make sure to submit all your flags before the deadline. The scoreboard will be frozen 1 hour before the end.",
    date: "2025-05-14",
    time: "12:00",
  },
];

// Leaderboard data
export const leaderboardData = [
  {
    id: 1,
    rank: 1,
    team: "ByteBusters",
    score: 4250,
    solved: 17,
  },
  {
    id: 2,
    rank: 2,
    team: "HackMasters",
    score: 3800,
    solved: 15,
  },
  {
    id: 3,
    rank: 3,
    team: "CyberShadows",
    score: 3650,
    solved: 14,
  },
  {
    id: 4,
    rank: 4,
    team: "Shell Shocked",
    score: 3200,
    solved: 13,
  },
  {
    id: 5,
    rank: 5,
    team: "Bit Bandits",
    score: 2900,
    solved: 12,
  },
  {
    id: 6,
    rank: 6,
    team: "Binary Beasts",
    score: 2750,
    solved: 11,
  },
  {
    id: 7,
    rank: 7,
    team: "Kernel Panic",
    score: 2500,
    solved: 10,
  },
  {
    id: 8,
    rank: 8,
    team: "Overflow Crew",
    score: 2300,
    solved: 9,
  },
  {
    id: 9,
    rank: 9,
    team: "Zero-Day Heroes",
    score: 2100,
    solved: 8,
  },
  {
    id: 10,
    rank: 10,
    team: "Firewall Breakers",
    score: 1900,
    solved: 7,
  },
  {
    id: 11,
    rank: 11,
    team: "SQL Injectors",
    score: 1750,
    solved: 7,
  },
  {
    id: 12,
    rank: 12,
    team: "Hex Wizards",
    score: 1600,
    solved: 6,
  },
];

// Challenge Categories
export const challengeCategories = [
  {
    id: 1,
    name: "Web",
    icon: "fa-globe",
  },
  {
    id: 2,
    name: "Cryptography",
    icon: "fa-lock",
  },
  {
    id: 3,
    name: "Reverse Engineering",
    icon: "fa-cogs",
  },
  {
    id: 4,
    name: "Forensics",
    icon: "fa-search",
  },
  {
    id: 5,
    name: "Pwn",
    icon: "fa-bug",
  },
];

// Challenges data
export const challenges = [
  {
    id: 1,
    name: "SQL Injection 101",
    category: "Web",
    difficulty: "Easy",
    points: 100,
    description:
      "Find the vulnerability in the login form and extract the admin password.",
    solved: true,
  },
  {
    id: 2,
    name: "XSS Challenge",
    category: "Web",
    difficulty: "Medium",
    points: 200,
    description:
      "Bypass the XSS filters and execute JavaScript on the admin's browser.",
    solved: true,
  },
  {
    id: 3,
    name: "Hidden Message",
    category: "Cryptography",
    difficulty: "Medium",
    points: 200,
    description: "Decrypt the message using the provided key and algorithm.",
    solved: true,
  },
  {
    id: 4,
    name: "Caesar's Secret",
    category: "Cryptography",
    difficulty: "Easy",
    points: 100,
    description: "Decode the message hidden with a classical cipher.",
    solved: true,
  },
  {
    id: 5,
    name: "Binary Bomb",
    category: "Reverse Engineering",
    difficulty: "Hard",
    points: 300,
    description:
      "Disarm the binary bomb by analyzing the assembly code and finding the correct inputs.",
    solved: false,
  },
  {
    id: 6,
    name: "Memory Dump",
    category: "Forensics",
    difficulty: "Medium",
    points: 200,
    description: "Analyze the memory dump and find the hidden password.",
    solved: false,
  },
  {
    id: 7,
    name: "Buffer Overflow",
    category: "Pwn",
    difficulty: "Hard",
    points: 300,
    description:
      "Exploit the buffer overflow vulnerability to get a shell on the server.",
    solved: false,
  },
  {
    id: 8,
    name: "Packet Analysis",
    category: "Forensics",
    difficulty: "Easy",
    points: 100,
    description:
      "Analyze the network traffic and find the hidden communication.",
    solved: true,
  },
];

// Team information
export const teamInfo = {
  name: "ByteBusters",
  rank: 1,
  score: 4250,
  stats: {
    web: {
      solved: 5,
      total: 8,
    },
    cryptography: {
      solved: 4,
      total: 6,
    },
    reverseEngineering: {
      solved: 3,
      total: 5,
    },
    forensics: {
      solved: 3,
      total: 4,
    },
    pwn: {
      solved: 2,
      total: 5,
    },
  },
  members: [
    {
      id: 1,
      username: "CaptainCyber",
      role: "Team Leader",
      avatar: "👨‍💻",
      score: 1250,
    },
    {
      id: 2,
      username: "CryptoQueen",
      role: "Cryptography Specialist",
      avatar: "👩‍💻",
      score: 1050,
    },
    {
      id: 3,
      username: "BinaryNinja",
      role: "Reverse Engineer",
      avatar: "🥷",
      score: 950,
    },
    {
      id: 4,
      username: "WebWizard",
      role: "Web Security Expert",
      avatar: "🧙‍♂️",
      score: 1000,
    },
  ],
};

// User profile information
export const userProfile = {
  username: "CaptainCyber",
  avatar: "👨‍💻",
  role: "Team Leader",
  team: "ByteBusters",
  rank: 1,
  score: 1250,
  joinDate: "2023-01-15",
  stats: {
    totalSolved: 12,
    categories: {
      web: {
        solved: 4,
        total: 8,
      },
      cryptography: {
        solved: 3,
        total: 6,
      },
      reverseEngineering: {
        solved: 2,
        total: 5,
      },
      forensics: {
        solved: 2,
        total: 4,
      },
      pwn: {
        solved: 1,
        total: 5,
      },
    },
  },
  solvedChallenges: [
    {
      id: 1,
      name: "SQL Injection 101",
      category: "Web",
      points: 100,
    },
    {
      id: 2,
      name: "XSS Challenge",
      category: "Web",
      points: 200,
    },
    {
      id: 3,
      name: "Hidden Message",
      category: "Cryptography",
      points: 200,
    },
    {
      id: 4,
      name: "Caesar's Secret",
      category: "Cryptography",
      points: 100,
    },
    {
      id: 8,
      name: "Packet Analysis",
      category: "Forensics",
      points: 100,
    },
  ],
};
