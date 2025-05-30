export const mockChallenges = [
  { id: "chal1", name: "Login Bypass", category: "Web" },
  { id: "chal2", name: "Caesar Cipher Advanced", category: "Crypto" },
  { id: "chal3", name: "Memory Forensics 101", category: "Forensics" },
  { id: "chal4", name: "Beginner Reversing", category: "Reverse" },
  { id: "chal5", name: "Find the Location", category: "OSINT" },
  { id: "chal6", name: "Database Takeover", category: "Web" },
  { id: "chal7", name: "Hidden in Plain Sight", category: "Stego" },
];

export const mockTickets = [
  {
    ticketId: "TKT-001",
    status: "Open",
    challengeId: "chal1",
    challengeName: "Login Bypass",
    subject: "Hint needed for stage 2",
    user: "cyberNinja",
    problemSetter: "admin",
    lastUpdated: "2024-05-29T10:30:00Z",
    messages: [
      {
        sender: "cyberNinja",
        timestamp: "2024-05-29T10:30:00Z",
        text: "I'm stuck on the second part of the login bypass, any hints?",
      },
      {
        sender: "admin",
        timestamp: "2024-05-29T10:35:00Z",
        text: "Have you considered how the application handles session cookies?",
      },
    ],
  },
  {
    ticketId: "TKT-002",
    status: "Closed",
    challengeId: "chal2",
    challengeName: "Caesar Cipher Advanced",
    subject: "Issue with decryption key",
    user: "rootKit",
    problemSetter: "admin",
    lastUpdated: "2024-05-28T15:00:00Z",
    messages: [
      {
        sender: "rootKit",
        timestamp: "2024-05-28T14:55:00Z",
        text: "The provided key doesn't seem to work.",
      },
      {
        sender: "admin",
        timestamp: "2024-05-28T15:00:00Z",
        text: "Apologies, there was a typo in the challenge description. It has been corrected. Please try again.",
      },
    ],
  },
  {
    ticketId: "TKT-003",
    status: "Open",
    challengeId: "chal4",
    challengeName: "Beginner Reversing",
    subject: "Understanding assembly instructions",
    user: "pwn3r",
    problemSetter: "admin",
    lastUpdated: "2024-05-29T16:45:00Z",
    messages: [
      {
        sender: "pwn3r",
        timestamp: "2024-05-29T16:45:00Z",
        text: "Can you explain what the `jmp` instruction does here?",
      },
    ],
  },
];
