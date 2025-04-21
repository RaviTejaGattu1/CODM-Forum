const initialPosts = [
  {
    id: 1,
    title: "Best Loadout for Ranked Matches?",
    content: "I've been using the AK-47 with Red Dot Sight. What do you guys recommend?",
    image: "https://via.placeholder.com/400x200?text=CODM+Loadout",
    video: "",
    flag: "Question",
    upvotes: 10,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    comments: [
      { text: "Try the M13 with a suppressor!", userId: "user1" },
      { text: "AK-47 is solid, but check out the Kilo Bolt-Action.", userId: "user2" }
    ],
    userId: "user1",
    repostId: null
  },
  {
    id: 2,
    title: "New Battle Pass Worth It?",
    content: "The new skins look awesome, but is it worth the price?",
    image: "https://via.placeholder.com/400x200?text=CODM+Battle+Pass",
    video: "",
    flag: "Opinion",
    upvotes: 5,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    comments: [],
    userId: "user2",
    repostId: null
  }
];

export default initialPosts;