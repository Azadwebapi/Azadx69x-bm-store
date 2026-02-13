const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "count",
    aliases: ["activity", "stats", "level"],
    version: "5.0",
    author: "Azadx69x",
    countDown: 3,
    role: 0,
    description: "Show top users with profile pics and progress bars",
    category: "box chat"
  },

  onStart: async function({ api, event, threadsData, usersData, args }) {
    try {
      const threadID = event.threadID;
      const threadData = await threadsData.get(threadID, "members") || [];
      
      if (!threadData || threadData.length === 0)
        return api.sendMessage("❌ No data available for this group.", threadID);
      
      const topUsers = threadData.sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 15);
      
      if (args[0] && args[0].toLowerCase() === "all") {
        // ===== TOP 15 LEADERBOARD - BEAUTIFUL DESIGN =====
        const canvasWidth = 1000;
        const canvasHeight = 1800;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');
        
        // Premium Gradient Background
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, "#0d0b1a");
        gradient.addColorStop(0.5, "#1a1a2f");
        gradient.addColorStop(1, "#16213e");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Decorative Elements
        ctx.strokeStyle = "rgba(255,215,0,0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, canvasWidth - 40, canvasHeight - 40);

        // Main Title
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#ffd700";
        ctx.font = "bold 70px 'Arial Black'";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("🏆 ACTIVITY LEADERBOARD", canvasWidth / 2, 90);
        
        ctx.shadowBlur = 0;
        ctx.font = "30px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText("TOP 15 ACTIVE MEMBERS", canvasWidth / 2, 150);

        // Table Header
        ctx.fillStyle = "rgba(255,215,0,0.2)";
        ctx.fillRect(50, 180, 900, 50);
        
        ctx.font = "bold 25px Arial";
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.fillText("RANK", 100, 215);
        ctx.fillText("PROFILE", 200, 215);
        ctx.fillText("NAME", 400, 215);
        ctx.fillText("MESSAGES", 650, 215);
        ctx.fillText("PROGRESS", 820, 215);

        // Header Line
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 230);
        ctx.lineTo(950, 230);
        ctx.stroke();

        let startY = 260;
        const rowHeight = 90;
        const maxCount = topUsers[0].count || 1;

        for (let i = 0; i < topUsers.length; i++) {
          const user = topUsers[i];
          const rank = i + 1;
          
          try {
            // Get Avatar
            const avatarUrl = await usersData.getAvatarUrl(user.userID);
            let avatar;
            try { 
              avatar = await loadImage(avatarUrl); 
            } catch { 
              avatar = await loadImage('https://i.imgur.com/placeholder.png'); 
            }

            // Row Background (alternating)
            ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.2)";
            ctx.fillRect(50, startY - 30, 900, 80);

            // Rank with Medal for Top 3
            ctx.textAlign = "center";
            if (rank === 1) {
              ctx.font = "40px Arial";
              ctx.fillStyle = "#FFD700";
              ctx.fillText("🥇", 100, startY + 15);
            } else if (rank === 2) {
              ctx.font = "40px Arial";
              ctx.fillStyle = "#C0C0C0";
              ctx.fillText("🥈", 100, startY + 15);
            } else if (rank === 3) {
              ctx.font = "40px Arial";
              ctx.fillStyle = "#CD7F32";
              ctx.fillText("🥉", 100, startY + 15);
            } else {
              ctx.font = "bold 25px Arial";
              ctx.fillStyle = "#fff";
              ctx.fillText(`#${rank}`, 100, startY + 15);
            }

            // Profile Picture Circle
            ctx.save();
            ctx.beginPath();
            ctx.arc(200, startY - 5, 30, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, 170, startY - 35, 60, 60);
            ctx.restore();

            // Profile Picture Border
            ctx.beginPath();
            ctx.arc(200, startY - 5, 32, 0, Math.PI * 2);
            ctx.strokeStyle = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : "#00ffff";
            ctx.lineWidth = 3;
            ctx.stroke();

            // Name
            ctx.textAlign = "left";
            ctx.font = "bold 23px Arial";
            ctx.fillStyle = "#fff";
            const displayName = user.name && user.name.length > 18 ? user.name.substring(0, 15) + "..." : user.name || "Anonymous";
            ctx.fillText(displayName, 280, startY + 5);

            // User ID small text
            ctx.font = "16px Arial";
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.fillText(user.userID.slice(0, 8) + "...", 280, startY + 30);

            // Message Count
            ctx.textAlign = "center";
            ctx.font = "bold 28px Arial";
            ctx.fillStyle = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : "#00ffff";
            ctx.fillText((user.count || 0).toLocaleString(), 650, startY + 15);

            // Level Badge
            const level = Math.floor(Math.sqrt((user.count || 0) / 10)) + 1;
            ctx.font = "bold 20px Arial";
            ctx.fillStyle = "#ffff00";
            ctx.fillText(`Lv.${level}`, 770, startY - 10);

            // Progress Bar Background
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect(770, startY + 5, 150, 12);

            // Progress Bar Fill
            const progressWidth = ((user.count || 0) / maxCount) * 150;
            
            // Gradient for progress bar
            const barGradient = ctx.createLinearGradient(770, startY + 5, 920, startY + 17);
            if (rank === 1) {
              barGradient.addColorStop(0, "#FFD700");
              barGradient.addColorStop(1, "#FFA500");
            } else if (rank === 2) {
              barGradient.addColorStop(0, "#C0C0C0");
              barGradient.addColorStop(1, "#A0A0A0");
            } else if (rank === 3) {
              barGradient.addColorStop(0, "#CD7F32");
              barGradient.addColorStop(1, "#8B4513");
            } else {
              barGradient.addColorStop(0, "#00ffff");
              barGradient.addColorStop(1, "#ff00ff");
            }
            
            ctx.fillStyle = barGradient;
            ctx.shadowBlur = 8;
            ctx.shadowColor = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : "#00ffff";
            ctx.fillRect(770, startY + 5, progressWidth, 12);
            ctx.shadowBlur = 0;

            // Progress Percentage
            const percentage = Math.round((user.count || 0) / maxCount * 100);
            ctx.font = "bold 16px Arial";
            ctx.fillStyle = "#fff";
            ctx.fillText(`${percentage}%`, 855, startY - 10);

            startY += rowHeight;

          } catch (e) {
            console.log("Error processing user:", e);
            startY += rowHeight;
          }
        }

        // Footer Stats
        const totalMessages = topUsers.reduce((sum, user) => sum + (user.count || 0), 0);
        const avgMessages = Math.round(totalMessages / topUsers.length);
        
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(50, 1620, 900, 80);
        
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 1620, 900, 80);

        ctx.font = "bold 25px Arial";
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.fillText(`📊 Total Members: ${topUsers.length}`, 250, 1665);
        ctx.fillText(`💬 Total Messages: ${totalMessages.toLocaleString()}`, 550, 1665);
        ctx.fillText(`📈 Avg: ${avgMessages.toLocaleString()}`, 800, 1665);

        // Timestamp
        ctx.font = "18px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.textAlign = "left";
        ctx.fillText(`📅 ${new Date().toLocaleString()}`, 70, 1740);
        ctx.textAlign = "right";
        ctx.fillText("✨ Made by Azadx69x", 930, 1740);

        // Save and send
        const outputPath = path.resolve(__dirname, 'cache', `leaderboard_${threadID}.png`);
        await fs.ensureDir(path.dirname(outputPath));
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        return api.sendMessage({
          body: "━━━━━━━━━━━━━━━━━━\n👑 **TOP 15 LEADERBOARD** 👑\n━━━━━━━━━━━━━━━━━━\n✨ Each member has profile pic\n📊 Progress bars show activity\n━━━━━━━━━━━━━━━━━━",
          attachment: fs.createReadStream(outputPath)
        }, threadID, () => fs.unlinkSync(outputPath));

      } else {
        // Individual user card code remains same...
        // (keeping it short since you asked specifically for count all)
        const uid = event.senderID;
        const userData = threadData.find(u => u.userID === uid) || { count: 0 };
        const userRank = threadData.findIndex(u => u.userID === uid) + 1;
        const count = userData.count || 0;

        return api.sendMessage(
          `━━━━━━━━━━━━━━━━━━\n📊 **YOUR STATS**\n━━━━━━━━━━━━━━━━━━\n💬 Messages: ${count}\n🏆 Rank: #${userRank}/${threadData.length}\n━━━━━━━━━━━━━━━━━━`,
          threadID
        );
      }

    } catch (err) {
      console.error("Error:", err);
      api.sendMessage("❌ An error occurred.", event.threadID);
    }
  },

  onChat: async ({ usersData, threadsData, event }) => {
    const { senderID, threadID } = event;
    
    if (!senderID || senderID.includes("bot")) return;
    
    try {
      const members = await threadsData.get(threadID, "members") || [];
      const findMember = members.find(u => u.userID == senderID);

      if (!findMember) {
        members.push({
          userID: senderID,
          name: await usersData.getName(senderID),
          count: 1
        });
      } else {
        findMember.count += 1;
      }

      await threadsData.set(threadID, members, "members");
    } catch (error) {
      console.error("Error updating count:", error);
    }
  }
};
