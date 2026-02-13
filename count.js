const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "count",
    aliases: ["activity", "stats", "level"],
    version: "4.0",
    author: "Azadx69x",
    countDown: 3,
    role: 0,
    description: "Show top 15 users count with premium level card",
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
        // ===== TOP 15 LEADERBOARD - ULTRA PREMIUM =====
        const canvasWidth = 1000;
        const canvasHeight = 1700;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');
        
        // Royal Purple Gradient Background
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, "#0a0f0f");
        gradient.addColorStop(0.3, "#1a1f2f");
        gradient.addColorStop(0.6, "#2a1f3f");
        gradient.addColorStop(1, "#1a0f2f");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Animated Stars Effect
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * canvasWidth;
          const y = Math.random() * canvasHeight;
          const size = Math.random() * 3;
          ctx.globalAlpha = Math.random() * 0.5;
          ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;

        // Golden Border with Glow
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#ffd700";
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 5;
        ctx.strokeRect(15, 15, canvasWidth - 30, canvasHeight - 30);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff00ff";
        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(25, 25, canvasWidth - 50, canvasHeight - 50);
        ctx.shadowBlur = 0;

        // Main Title with 3D Effect
        ctx.font = "bold 80px 'Arial Black'";
        ctx.textAlign = "center";
        
        // Shadow layers
        ctx.fillStyle = "#ffd700";
        ctx.fillText("🏆 ELITE", canvasWidth / 2 + 5, 105);
        ctx.fillStyle = "#ff00ff";
        ctx.fillText("🏆 ELITE", canvasWidth / 2 - 5, 95);
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#ffd700";
        ctx.fillText("🏆 ELITE", canvasWidth / 2, 100);
        
        ctx.shadowBlur = 0;
        ctx.font = "40px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillText("LEADERBOARD • TOP 15", canvasWidth / 2, 170);

        // ===== TOP 3 THRONE POSITIONS =====
        const top3Positions = [
          { x: 500, y: 350, r: 90, crown: "👑", title: "KING" },      // 1st - Center
          { x: 250, y: 430, r: 80, crown: "⚜️", title: "PRINCE" },     // 2nd - Left
          { x: 750, y: 430, r: 80, crown: "🎯", title: "WARRIOR" }      // 3rd - Right
        ];
        const top3Colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        const glowColors = ['#FFD700', '#E0E0E0', '#CD7F32'];

        for (let i = 0; i < 3 && i < topUsers.length; i++) {
          const user = topUsers[i];
          const avatarUrl = await usersData.getAvatarUrl(user.userID);
          let avatar;
          try { 
            avatar = await loadImage(avatarUrl); 
          } catch { 
            avatar = await loadImage('https://i.imgur.com/placeholder.png'); 
          }

          const pos = top3Positions[i];
          
          // Throne Platform
          ctx.shadowBlur = 30;
          ctx.shadowColor = glowColors[i];
          ctx.fillStyle = `rgba(${i === 0 ? '255,215,0' : i === 1 ? '192,192,192' : '205,127,50'}, 0.2)`;
          ctx.beginPath();
          ctx.ellipse(pos.x, pos.y + 50, 120, 30, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Avatar Glow
          ctx.shadowBlur = 40;
          ctx.shadowColor = glowColors[i];
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pos.r + 5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fill();
          
          // Avatar
          ctx.shadowBlur = 0;
          ctx.save();
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatar, pos.x - pos.r, pos.y - pos.r, pos.r * 2, pos.r * 2);
          ctx.restore();
          
          // Avatar Border
          ctx.shadowBlur = 20;
          ctx.shadowColor = glowColors[i];
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
          ctx.strokeStyle = top3Colors[i];
          ctx.lineWidth = 5;
          ctx.stroke();
          
          // Crown
          ctx.font = "60px Arial";
          ctx.fillStyle = top3Colors[i];
          ctx.shadowBlur = 20;
          ctx.shadowColor = glowColors[i];
          ctx.fillText(pos.crown, pos.x - 30, pos.y - pos.r - 20);
          
          // Title
          ctx.font = "bold 25px Arial";
          ctx.fillStyle = top3Colors[i];
          ctx.fillText(pos.title, pos.x - 30, pos.y - pos.r - 70);
          
          // Name
          ctx.shadowBlur = 10;
          ctx.font = "bold 30px Arial";
          ctx.fillStyle = "#fff";
          const displayName = user.name && user.name.length > 15 ? user.name.substring(0, 12) + "..." : user.name || "Anonymous";
          ctx.fillText(displayName, pos.x, pos.y + pos.r + 40);
          
          // Level Badge
          const level = Math.floor(Math.sqrt((user.count || 0) / 10)) + 1;
          ctx.shadowBlur = 15;
          ctx.fillStyle = "#ffff00";
          ctx.font = "bold 28px Arial";
          ctx.fillText(`⭐ LV.${level}`, pos.x, pos.y + pos.r + 75);
          
          // Count
          ctx.font = "25px Arial";
          ctx.fillStyle = top3Colors[i];
          ctx.fillText(`${(user.count || 0).toLocaleString()} msgs`, pos.x, pos.y + pos.r + 110);
        }

        // ===== BEAUTIFUL TABLE HEADER =====
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 215, 0, 0.1)";
        ctx.fillRect(60, 650, 880, 70);
        
        // Decorative header lines
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, 655);
        ctx.lineTo(940, 655);
        ctx.stroke();
        
        ctx.strokeStyle = "#ff00ff";
        ctx.beginPath();
        ctx.moveTo(60, 715);
        ctx.lineTo(940, 715);
        ctx.stroke();

        // Header text with icons
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.fillText("⚡ RANK", 120, 705);
        ctx.fillText("👤 MEMBER", 350, 705);
        ctx.fillText("💬 MSGS", 600, 705);
        ctx.fillText("⭐ LEVEL", 750, 705);
        ctx.fillText("📊 BAR", 880, 705);

        // ===== RANKS 4-15 WITH LEVEL STYLES =====
        let startY = 750;
        const rowHeight = 80;

        for (let i = 3; i < topUsers.length; i++) {
          const user = topUsers[i];
          const rank = i + 1;
          
          // Row background with gradient
          const rowGradient = ctx.createLinearGradient(60, startY - 25, 940, startY + 25);
          rowGradient.addColorStop(0, `rgba(255,215,0,${i % 2 === 0 ? 0.05 : 0.02})`);
          rowGradient.addColorStop(1, `rgba(255,0,255,${i % 2 === 0 ? 0.05 : 0.02})`);
          ctx.fillStyle = rowGradient;
          ctx.fillRect(60, startY - 25, 880, 70);

          // Rank number with medal style
          ctx.font = "bold 25px Arial";
          ctx.fillStyle = rank <= 5 ? "#ffd700" : "#00ffff";
          ctx.textAlign = "center";
          ctx.fillText(`#${rank}`, 120, startY + 15);

          // Name with avatar emoji
          ctx.textAlign = "left";
          const displayName = user.name && user.name.length > 18 ? user.name.substring(0, 15) + "..." : user.name || "Anonymous";
          
          // Random emoji based on rank
          const emojis = ["🔰", "⚡", "💫", "✨", "🌟", "⭐", "🔥", "💪", "🎯", "🎨", "🎭", "🎪"];
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];
          
          ctx.font = "25px Arial";
          ctx.fillStyle = "#fff";
          ctx.fillText(`${emoji} ${displayName}`, 250, startY + 15);

          // Message count
          ctx.font = "bold 25px Arial";
          ctx.fillStyle = "#00ffff";
          ctx.textAlign = "center";
          ctx.fillText((user.count || 0).toLocaleString(), 600, startY + 15);

          // Level with beautiful badge
          const level = Math.floor(Math.sqrt((user.count || 0) / 10)) + 1;
          
          // Level background
          ctx.fillStyle = "rgba(255,255,0,0.2)";
          ctx.beginPath();
          ctx.arc(750, startY + 5, 20, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.font = "bold 22px Arial";
          ctx.fillStyle = "#ffff00";
          ctx.fillText(level, 750, startY + 10);

          // Level progress bar with gradient
          const maxCount = topUsers[0].count || 1;
          const barWidth = ((user.count || 0) / maxCount) * 120;
          
          // Bar background
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillRect(820, startY - 5, 120, 12);
          
          // Animated bar
          const barGradient = ctx.createLinearGradient(820, startY - 5, 940, startY + 7);
          barGradient.addColorStop(0, "#00ffff");
          barGradient.addColorStop(1, "#ff00ff");
          ctx.fillStyle = barGradient;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#00ffff";
          ctx.fillRect(820, startY - 5, barWidth, 12);
          ctx.shadowBlur = 0;

          startY += rowHeight;
        }

        // ===== FOOTER STATS =====
        const totalMessages = topUsers.reduce((sum, user) => sum + (user.count || 0), 0);
        const avgLevel = Math.floor(topUsers.reduce((sum, user) => sum + (Math.floor(Math.sqrt((user.count || 0) / 10)) + 1), 0) / topUsers.length);
        
        // Footer card
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ffd700";
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(60, 1500, 880, 100);
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 1500, 880, 100);

        // Footer stats
        ctx.font = "28px Arial";
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = "center";
        ctx.fillText(`📊 TOTAL MEMBERS: ${topUsers.length}`, 250, 1560);
        ctx.fillText(`💬 TOTAL MSGS: ${totalMessages.toLocaleString()}`, 550, 1560);
        ctx.fillText(`⭐ AVG LEVEL: ${avgLevel}`, 800, 1560);

        // Timestamp
        ctx.font = "20px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.textAlign = "left";
        ctx.fillText(`📅 ${new Date().toLocaleString()}`, 80, 1650);
        ctx.textAlign = "right";
        ctx.fillText("✨ Premium Level Tracker by Azadx69x", 920, 1650);

        // Save and send
        const outputPath = path.resolve(__dirname, 'cache', `leaderboard_${threadID}.png`);
        await fs.ensureDir(path.dirname(outputPath));
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        return api.sendMessage({
          body: "━━━━━━━━━━━━━━━━━━\n👑 **ELITE LEADERBOARD** 👑\n━━━━━━━━━━━━━━━━━━\n✨ Top 15 Champions This Week\n⭐ Level System Active\n━━━━━━━━━━━━━━━━━━",
          attachment: fs.createReadStream(outputPath)
        }, threadID, () => fs.unlinkSync(outputPath));

      } else {
        // ===== INDIVIDUAL USER CARD - ULTRA PREMIUM LEVEL STYLE =====
        const uid = event.senderID;
        const userData = threadData.find(u => u.userID === uid) || { count: 0 };
        const userRank = threadData.findIndex(u => u.userID === uid) + 1;
        const count = userData.count || 0;

        try {
          const avatarUrl = await usersData.getAvatarUrl(uid);
          const avatar = await loadImage(avatarUrl);
          const name = await usersData.getName(uid);

          // Calculate level and experience
          const level = Math.floor(Math.sqrt(count / 10)) + 1;
          const nextLevel = Math.pow(level, 2) * 10;
          const prevLevel = Math.pow(level - 1, 2) * 10;
          const expNeeded = nextLevel - prevLevel;
          const currentExp = count - prevLevel;
          const progress = (currentExp / expNeeded) * 100;
          const expToNext = nextLevel - count;

          const canvasWidth = 1000;
          const canvasHeight = 1600;
          const canvas = createCanvas(canvasWidth, canvasHeight);
          const ctx = canvas.getContext('2d');

          // ===== PREMIUM LEVEL CARD BACKGROUND =====
          const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
          gradient.addColorStop(0, "#0a0f1f");
          gradient.addColorStop(0.3, "#1a1f3f");
          gradient.addColorStop(0.6, "#2a1f4f");
          gradient.addColorStop(1, "#1a0f3f");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Animated particles
          ctx.fillStyle = "#ffffff";
          for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvasWidth;
            const y = Math.random() * canvasHeight;
            ctx.globalAlpha = Math.random() * 0.3;
            ctx.fillRect(x, y, 2, 2);
          }
          ctx.globalAlpha = 1;

          // ===== LEVEL BADGE - CENTERPIECE =====
          const badgeX = canvasWidth / 2;
          const badgeY = 300;
          
          // Level glow
          ctx.shadowBlur = 50;
          ctx.shadowColor = "#ffff00";
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 150, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,0,0.1)";
          ctx.fill();
          
          // Level circle
          ctx.shadowBlur = 30;
          ctx.shadowColor = "#ffd700";
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 130, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.7)";
          ctx.fill();
          
          // Level number
          ctx.shadowBlur = 40;
          ctx.shadowColor = "#ffff00";
          ctx.font = "bold 120px 'Arial Black'";
          ctx.fillStyle = "#ffff00";
          ctx.textAlign = "center";
          ctx.fillText(level, badgeX, badgeY + 40);
          
          // Level text
          ctx.shadowBlur = 20;
          ctx.font = "30px Arial";
          ctx.fillStyle = "#ffffff";
          ctx.fillText("LEVEL", badgeX, badgeY - 60);

          // ===== AVATAR WITH CRYSTAL FRAME =====
          ctx.shadowBlur = 30;
          ctx.shadowColor = "#00ffff";
          ctx.save();
          ctx.beginPath();
          ctx.arc(200, 200, 80, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatar, 120, 120, 160, 160);
          ctx.restore();

          // Avatar border
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#00ffff";
          ctx.beginPath();
          ctx.arc(200, 200, 82, 0, Math.PI * 2);
          ctx.strokeStyle = "#00ffff";
          ctx.lineWidth = 4;
          ctx.stroke();

          // ===== USER NAME WITH GLOW =====
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#ff00ff";
          ctx.font = "bold 45px 'Arial Black'";
          ctx.fillStyle = "#fff";
          ctx.fillText(name, canvasWidth / 2, 500);

          // ===== RANK BADGE =====
          let rankColor = userRank === 1 ? "#FFD700" : userRank === 2 ? "#C0C0C0" : userRank === 3 ? "#CD7F32" : "#00ffff";
          let rankTitle = userRank === 1 ? "👑 CHAMPION" : userRank === 2 ? "⚜️ ELITE" : userRank === 3 ? "🎯 WARRIOR" : "⭐ MEMBER";
          
          ctx.shadowBlur = 15;
          ctx.shadowColor = rankColor;
          ctx.fillStyle = rankColor;
          ctx.font = "bold 35px Arial";
          ctx.fillText(rankTitle, canvasWidth / 2, 570);
          
          ctx.font = "30px Arial";
          ctx.fillStyle = "#fff";
          ctx.fillText(`Rank #${userRank} of ${threadData.length}`, canvasWidth / 2, 630);

          // ===== STATS CARD WITH GLASS EFFECT =====
          ctx.shadowBlur = 30;
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.fillStyle = "rgba(255,255,255,0.05)";
          ctx.fillRect(150, 700, 700, 500);
          
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "rgba(255,215,0,0.3)";
          ctx.lineWidth = 2;
          ctx.strokeRect(150, 700, 700, 500);

          // Stats Title
          ctx.font = "bold 40px Arial";
          ctx.fillStyle = "#ffd700";
          ctx.fillText("📊 STATISTICS", canvasWidth / 2, 770);

          // ===== STATS WITH LEVEL STYLES =====
          const leftX = 220;
          const rightX = 600;
          let statsY = 850;

          // Messages
          ctx.font = "30px Arial";
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillText("💬 Messages:", leftX, statsY);
          ctx.font = "bold 40px Arial";
          ctx.fillStyle = "#00ffff";
          ctx.fillText(count.toLocaleString(), rightX, statsY);

          // Experience
          statsY += 70;
          ctx.font = "30px Arial";
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillText("✨ Experience:", leftX, statsY);
          ctx.font = "bold 35px Arial";
          ctx.fillStyle = "#ffff00";
          ctx.fillText(`${currentExp.toLocaleString()}/${expNeeded.toLocaleString()}`, rightX, statsY);

          // Next Level
          statsY += 70;
          ctx.font = "30px Arial";
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillText("🎯 Next Level:", leftX, statsY);
          ctx.font = "bold 35px Arial";
          ctx.fillStyle = "#ff00ff";
          ctx.fillText(`${expToNext.toLocaleString()} EXP needed`, rightX, statsY);

          // Total Needed
          statsY += 70;
          ctx.font = "30px Arial";
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillText("📈 Total for Lv." + (level + 1) + ":", leftX, statsY);
          ctx.font = "bold 35px Arial";
          ctx.fillStyle = "#ffd700";
          ctx.fillText(nextLevel.toLocaleString(), rightX, statsY);

          // ===== LEVEL PROGRESS BAR =====
          const barX = 220;
          const barY = 1120;
          const barWidth = 460;
          
          // Bar background with glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#ffff00";
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillRect(barX, barY, barWidth, 25);
          
          // Animated progress bar
          const progGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY + 25);
          progGradient.addColorStop(0, "#ffff00");
          progGradient.addColorStop(0.5, "#ff00ff");
          progGradient.addColorStop(1, "#00ffff");
          
          ctx.fillStyle = progGradient;
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#ffff00";
          ctx.fillRect(barX, barY, (progress / 100) * barWidth, 25);
          
          // Progress percentage
          ctx.shadowBlur = 0;
          ctx.font = "bold 28px Arial";
          ctx.fillStyle = "#fff";
          ctx.fillText(`${Math.round(progress)}% to Level ${level + 1}`, canvasWidth / 2, barY - 20);

          // ===== ACHIEVEMENT BADGES =====
          const badges = [
            { emoji: "🔥", text: `${level} LVL`, color: "#ff4500" },
            { emoji: "💬", text: `${count} MSG`, color: "#00ffff" },
            { emoji: "🏆", text: `#${userRank}`, color: rankColor },
            { emoji: "⭐", text: `${Math.floor(level * 1.5)} PTS`, color: "#ffff00" }
          ];

          let badgeStartX = 250;
          badges.forEach(badge => {
            ctx.shadowBlur = 15;
            ctx.shadowColor = badge.color;
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(badgeStartX, 1230, 150, 50);
            
            ctx.strokeStyle = badge.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(badgeStartX, 1230, 150, 50);
            
            ctx.font = "25px Arial";
            ctx.fillStyle = badge.color;
            ctx.fillText(`${badge.emoji} ${badge.text}`, badgeStartX + 25, 1265);
            
            badgeStartX += 180;
          });

          // ===== FOOTER =====
          ctx.shadowBlur = 0;
          ctx.font = "22px Arial";
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillText("✦ Premium Level System ✦", canvasWidth / 2, 1400);
          ctx.fillText("Made by Azadx69x", canvasWidth / 2, 1450);

          // Save and send
          const outputPath = path.resolve(__dirname, 'cache', `user_${uid}_${threadID}.png`);
          await fs.ensureDir(path.dirname(outputPath));
          const buffer = canvas.toBuffer('image/png');
          fs.writeFileSync(outputPath, buffer);

          // Generate level up message if applicable
          const oldLevel = Math.floor(Math.sqrt((count - 1) / 10)) + 1;
          const levelUpMessage = level > oldLevel ? `\n🎉 **LEVEL UP!** Reached Level ${level}` : "";

          return api.sendMessage({
            body: `━━━━━━━━━━━━━━━━━━\n👤 **${name}**\n━━━━━━━━━━━━━━━━━━\n⭐ **LEVEL ${level}** ${levelUpMessage}\n💬 Messages: ${count.toLocaleString()}\n✨ EXP: ${currentExp.toLocaleString()}/${expNeeded.toLocaleString()}\n🎯 Need ${expToNext.toLocaleString()} EXP for Level ${level + 1}\n🏆 Rank: #${userRank}/${threadData.length}\n📊 Progress: ${Math.round(progress)}%\n━━━━━━━━━━━━━━━━━━`,
            attachment: fs.createReadStream(outputPath)
          }, threadID, () => fs.unlinkSync(outputPath));

        } catch (error) {
          console.error("Error generating user card:", error);
          const userData = threadData.find(u => u.userID === uid) || { count: 0 };
          const userRank = threadData.findIndex(u => u.userID === uid) + 1;
          return api.sendMessage(
            `━━━━━━━━━━━━━━━━━━\n📊 **ACTIVITY STATS**\n━━━━━━━━━━━━━━━━━━\n💬 Messages: ${userData.count || 0}\n🏆 Rank: #${userRank || 0}/${threadData.length}\n━━━━━━━━━━━━━━━━━━`,
            threadID
          );
        }
      }

    } catch (err) {
      console.error("Error generating leaderboard:", err);
      api.sendMessage("❌ An error occurred while generating leaderboard.", event.threadID);
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
