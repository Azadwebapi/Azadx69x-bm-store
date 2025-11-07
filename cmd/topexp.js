module.exports = {
  config: {
    name: "topexp",
    version: "1.2",
    author: "Azad 💥",
    role: 0,
    shortDescription: { en: "Top 15 Exp users (Rank Board)" },
    longDescription: { en: "" },
    category: "economy",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const allUsers = await usersData.getAll();
      if (!allUsers || allUsers.length === 0) {
        return api.sendMessage("No users found!", event.threadID);
      }

      const usersWithExp = allUsers.filter(u => u.exp > 0);
      if (usersWithExp.length === 0) {
        return api.sendMessage("No users have experience points yet!", event.threadID);
      }

      const topExp = usersWithExp.sort((a, b) => b.exp - a.exp).slice(0, 15);

      const borderTop = "╔═════════════ RANK BOARD ═════════════╗";
      const borderBottom = "╚═══════════════════════════════════════╝";

      const topUsersList = topExp.map((user, index) => {
        const name = user.name || "Unknown";
        const exp = user.exp || 0;

        let rankEmoji = "🏅";
        if (index === 0) rankEmoji = "🥇";
        else if (index === 1) rankEmoji = "🥈";
        else if (index === 2) rankEmoji = "🥉";

        return `│ ${rankEmoji} ${name} ➥ ${exp} │`;
      }).join("\n");

      const messageText = `${borderTop}\n${topUsersList}\n${borderBottom}`;

      await api.sendMessage(messageText, event.threadID);

    } catch (err) {
      console.error("Error generating leaderboard:", err);
      api.sendMessage("❌ Failed to generate leaderboard.", event.threadID);
    }
  }
};
