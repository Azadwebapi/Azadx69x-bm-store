const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

// Polyfill for non-TTY environments (cloud hosting, Docker, etc.)
if (!process.stderr.clearLine) process.stderr.clearLine = () => {};
if (!process.stderr.cursorTo) process.stderr.cursorTo = () => {};
if (!process.stderr.moveCursor) process.stderr.moveCursor = () => {};
if (!process.stdout.clearLine) process.stdout.clearLine = () => {};
if (!process.stdout.cursorTo) process.stdout.cursorTo = () => {};
if (!process.stdout.moveCursor) process.stdout.moveCursor = () => {};

const { createCanvas, loadImage } = require("canvas");
const os = require("os");

module.exports = {
  config: {
    name: "owner",
    version: "5.0",
    author: "Azadx69x",
    category: "owner",
    guide: {
      en: "❯  OWNER  ❮\n\nType 'owner' to view owner information and bot stats."
    },
    usePrefix: true,
    cooldown: 10,
    role: 0
  },

  sentThreads: new Map(),

  onStart: async function ({ api, event, message, usersData, threadsData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    if (this.sentThreads.has(threadID)) return;
    this.sentThreads.set(threadID, true);

    try {
      // Add loading reaction
      api.setMessageReaction("⏳", event.messageID, event.threadID, () => {}, true);

      // Get user info
      const senderInfo = await api.getUserInfo(senderID);
      const senderName = senderInfo[senderID]?.name || "User";
      
      // Bot stats
      const uptime = process.uptime();
      const botUptime = {
        days: Math.floor(uptime / 86400),
        hours: Math.floor((uptime % 86400) / 3600),
        minutes: Math.floor((uptime % 3600) / 60),
        seconds: Math.floor(uptime % 60)
      };

      // System info
      const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeMemory = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const cpuModel = os.cpus()[0].model;
      const cpuCores = os.cpus().length;

      // Current time
      const now = moment().tz("Asia/Dhaka");
      const date = now.format("MMMM Do YYYY");
      const time = now.format("hh:mm:ss A");
      const day = now.format("dddd");

      // Owner info
      const ownerInfo = {
        name: "𝐀𝐳𝐚𝐝𝐱𝟔𝟗𝐱",
        fullName: "Azad Hossain",
        gender: "𝐌𝐚𝐥𝐞",
        age: "𝟏𝟕",
        birthDate: "𝐉𝐚𝐧 𝟏, 𝟐𝟎𝟎𝟕",
        from: "𝐁𝐡𝐨𝐥𝐚, 𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡",
        location: "𝐁𝐡𝐨𝐥𝐚 𝐒𝐚𝐝𝐚𝐫",
        hobby: "𝐆𝐚𝐦𝐢𝐧𝐠, 𝐂𝐨𝐝𝐢𝐧𝐠",
        status: "𝐒𝐢𝐧𝐠𝐥𝐞",
        occupation: "𝐒𝐭𝐮𝐝𝐞𝐧𝐭 / 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫",
        bio: "𝐗𝟔𝟗𝐗 𝐌𝐞𝐬𝐬𝐞𝐧𝐠𝐞𝐫 𝐁𝐨𝐭",
        nick: "𝐚𝐳𝐚𝐝",
        contact: "@azadx69x",
        email: "azad@example.com",
        website: "azadx69x.xyz",
        facebook: "Azad Hossain",
        github: "azadx69x",
        discord: "azadx69x#1234"
      };

      // Bot info
      const botInfo = {
        name: "𝐗𝟔𝟗𝐗 𝐁𝐎𝐓",
        version: "𝐯𝟓.𝟎.𝟎",
        prefix: "!",
        language: "𝐁𝐚𝐧𝐠𝐥𝐚 / 𝐄𝐧𝐠𝐥𝐢𝐬𝐡",
        platform: "𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤",
        framework: "𝐆𝐨𝐚𝐭-𝐁𝐨𝐭 𝐯𝟐",
        creator: "𝐀𝐳𝐚𝐝𝐱𝟔𝟗𝐱"
      };

      // Create cache directory
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const imgPath = path.join(cacheDir, `owner_${threadID}_${Date.now()}.png`);

      // Load profile image
      let profileImage;
      try {
        profileImage = await loadImage("https://i.imgur.com/nLsLLeV.jpeg");
      } catch (imgErr) {
        console.log("Profile image load failed, continuing without it");
      }

      // Create canvas
      const canvas = createCanvas(1200, 2000);
      const ctx = canvas.getContext("2d");

      // ========== PROFESSIONAL BACKGROUND ==========
      // Premium dark gradient
      const gradient = ctx.createLinearGradient(0, 0, 1200, 2000);
      gradient.addColorStop(0, "#0a0a0f");
      gradient.addColorStop(0.3, "#1a1a2e");
      gradient.addColorStop(0.6, "#16213e");
      gradient.addColorStop(1, "#0f0f1f");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated particle effects
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.3;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }

      // Premium border design
      ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Corner decorations
      const cornerSize = 40;
      ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
      ctx.lineWidth = 4;
      
      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(20, 20 + cornerSize);
      ctx.lineTo(20, 20);
      ctx.lineTo(20 + cornerSize, 20);
      ctx.stroke();
      
      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(canvas.width - 20 - cornerSize, 20);
      ctx.lineTo(canvas.width - 20, 20);
      ctx.lineTo(canvas.width - 20, 20 + cornerSize);
      ctx.stroke();
      
      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(20, canvas.height - 20 - cornerSize);
      ctx.lineTo(20, canvas.height - 20);
      ctx.lineTo(20 + cornerSize, canvas.height - 20);
      ctx.stroke();
      
      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(canvas.width - 20 - cornerSize, canvas.height - 20);
      ctx.lineTo(canvas.width - 20, canvas.height - 20);
      ctx.lineTo(canvas.width - 20, canvas.height - 20 - cornerSize);
      ctx.stroke();

      // ========== HEADER SECTION ==========
      // Premium header bar
      const headerGradient = ctx.createLinearGradient(0, 0, 1200, 100);
      headerGradient.addColorStop(0, "rgba(255, 215, 0, 0.2)");
      headerGradient.addColorStop(0.5, "rgba(255, 215, 0, 0.4)");
      headerGradient.addColorStop(1, "rgba(255, 215, 0, 0.2)");
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, canvas.width, 100);

      // Main title with glow
      ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 70px 'Arial', 'Sans'";
      ctx.textAlign = "center";
      ctx.fillText("⚡ 𝐎𝐖𝐍𝐄𝐑 𝐂𝐄𝐍𝐓𝐑𝐀𝐋 ⚡", 600, 70);

      // Reset shadow for other elements
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // ========== PROFILE SECTION ==========
      const profileY = 130;
      const profileSize = 180;
      const profileX = 600;

      if (profileImage) {
        // Premium profile container
        ctx.shadowColor = "rgba(255, 215, 0, 0.3)";
        ctx.shadowBlur = 20;
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(profileX, profileY + profileSize/2, profileSize/2 + 15, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(profileX, profileY + profileSize/2, profileSize/2 + 8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Profile image with clipping
        ctx.save();
        ctx.beginPath();
        ctx.arc(profileX, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Draw profile image
        ctx.drawImage(profileImage, profileX - profileSize/2, profileY, profileSize, profileSize);
        ctx.restore();

        // Add glossy overlay
        ctx.beginPath();
        ctx.arc(profileX, profileY + profileSize/2 - 20, profileSize/3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;
      }

      // Owner name with gradient
      const nameGradient = ctx.createLinearGradient(400, 0, 800, 0);
      nameGradient.addColorStop(0, "#ffd700");
      nameGradient.addColorStop(0.5, "#ffa500");
      nameGradient.addColorStop(1, "#ffd700");
      
      ctx.fillStyle = nameGradient;
      ctx.font = "bold 48px 'Arial', 'Sans'";
      ctx.textAlign = "center";
      ctx.fillText(ownerInfo.name, 600, profileY + profileSize + 60);
      
      // Bio with stylized background
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(400, profileY + profileSize + 70, 400, 40);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "22px 'Arial', 'Sans'";
      ctx.fillText(ownerInfo.bio, 600, profileY + profileSize + 100);

      // ========== MAIN CARDS ==========
      const cardStartY = 470;

      // Helper function for premium cards
      const drawPremiumCard = (ctx, x, y, width, height, gradientColors) => {
        // Card shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // Card background with gradient
        const cardGradient = ctx.createLinearGradient(x, y, x + width, y + height);
        cardGradient.addColorStop(0, gradientColors[0]);
        cardGradient.addColorStop(0.5, gradientColors[1]);
        cardGradient.addColorStop(1, gradientColors[2]);
        
        ctx.fillStyle = cardGradient;
        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + width - 20, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + 20);
        ctx.lineTo(x + width, y + height - 20);
        ctx.quadraticCurveTo(x + width, y + height, x + width - 20, y + height);
        ctx.lineTo(x + 20, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - 20);
        ctx.lineTo(x, y + 20);
        ctx.quadraticCurveTo(x, y, x + 20, y);
        ctx.closePath();
        ctx.fill();

        // Card border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();

        return cardGradient;
      };

      // Left Card - Owner Info (Premium Purple)
      drawPremiumCard(ctx, 40, cardStartY, 540, 480, [
        "rgba(147, 51, 234, 0.3)",
        "rgba(126, 34, 206, 0.4)",
        "rgba(88, 28, 135, 0.3)"
      ]);

      // Right Card - Bot Stats (Premium Blue)
      drawPremiumCard(ctx, 620, cardStartY, 540, 480, [
        "rgba(59, 130, 246, 0.3)",
        "rgba(37, 99, 235, 0.4)",
        "rgba(29, 78, 216, 0.3)"
      ]);

      // Bottom Card - System Info (Premium Teal)
      drawPremiumCard(ctx, 40, cardStartY + 510, 1120, 380, [
        "rgba(20, 184, 166, 0.3)",
        "rgba(13, 148, 136, 0.4)",
        "rgba(17, 94, 89, 0.3)"
      ]);

      // Section titles with icons - INSIDE the boxes
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(255, 215, 0, 0.3)";
      
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 32px 'Arial', 'Sans'";
      
      // Owner section title - properly inside left box
      ctx.fillText("👤 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎", 80, cardStartY + 50);
      
      // Bot section title - properly inside right box
      ctx.fillText("🤖 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐒", 660, cardStartY + 50);
      
      // System section title - properly inside bottom box
      ctx.fillText("💻 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎", 80, cardStartY + 560);

      ctx.shadowBlur = 0;

      // ========== OWNER DETAILS - PROPERLY INSIDE LEFT BOX ==========
      const ownerDetails = [
        { icon: "📛", label: "Name", value: ownerInfo.fullName },
        { icon: "⚥", label: "Gender", value: ownerInfo.gender },
        { icon: "🎂", label: "Age", value: ownerInfo.age },
        { icon: "📅", label: "Birth", value: ownerInfo.birthDate },
        { icon: "📍", label: "From", value: ownerInfo.from },
        { icon: "🎮", label: "Hobby", value: ownerInfo.hobby },
        { icon: "❤️", label: "Status", value: ownerInfo.status },
        { icon: "💼", label: "Occupation", value: ownerInfo.occupation }
      ];

      let yPos = cardStartY + 100;
      const lineHeight = 45;

      ownerDetails.forEach(detail => {
        // Icon
        ctx.fillStyle = "#ffd700";
        ctx.font = "24px 'Arial', 'Sans'";
        ctx.fillText(detail.icon, 60, yPos);
        
        // Label
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 16px 'Arial', 'Sans'";
        ctx.fillText(detail.label, 100, yPos - 8);
        
        // Value
        ctx.fillStyle = "#ffffff";
        ctx.font = "18px 'Arial', 'Sans'";
        ctx.fillText(detail.value, 100, yPos + 12);
        
        // Decorative line
        ctx.strokeStyle = "rgba(255, 215, 0, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, yPos + 18);
        ctx.lineTo(540, yPos + 18);
        ctx.stroke();
        
        yPos += lineHeight;
      });

      // ========== BOT DETAILS - PROPERLY INSIDE RIGHT BOX ==========
      const botDetails = [
        { icon: "🤖", label: "Bot Name", value: botInfo.name },
        { icon: "📌", label: "Version", value: botInfo.version },
        { icon: "⚡", label: "Prefix", value: botInfo.prefix },
        { icon: "🌐", label: "Language", value: botInfo.language },
        { icon: "📱", label: "Platform", value: botInfo.platform },
        { icon: "🔧", label: "Framework", value: botInfo.framework },
        { icon: "⏰", label: "Uptime", value: `${botUptime.days}d ${botUptime.hours}h ${botUptime.minutes}m` },
        { icon: "🕐", label: "Time", value: time }
      ];

      yPos = cardStartY + 100;

      botDetails.forEach(detail => {
        // Icon
        ctx.fillStyle = "#ffd700";
        ctx.font = "24px 'Arial', 'Sans'";
        ctx.fillText(detail.icon, 640, yPos);
        
        // Label
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 16px 'Arial', 'Sans'";
        ctx.fillText(detail.label, 680, yPos - 8);
        
        // Value
        ctx.fillStyle = "#ffffff";
        ctx.font = "18px 'Arial', 'Sans'";
        
        // Truncate value if too long
        let displayValue = detail.value;
        if (detail.label === "Bot Name" && detail.value.length > 15) {
          displayValue = detail.value.substring(0, 12) + "...";
        }
        ctx.fillText(displayValue, 680, yPos + 12);
        
        // Decorative line
        ctx.strokeStyle = "rgba(255, 215, 0, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(640, yPos + 18);
        ctx.lineTo(1120, yPos + 18);
        ctx.stroke();
        
        yPos += lineHeight;
      });

      // ========== SYSTEM INFO - PROPERLY INSIDE BOTTOM BOX ==========
      const systemDetails = [
        { icon: "💾", label: "OS", value: os.type() },
        { icon: "⚙️", label: "CPU", value: cpuModel.substring(0, 25) + "..." },
        { icon: "🔢", label: "Cores", value: cpuCores.toString() },
        { icon: "🧠", label: "RAM", value: `${totalMemory} GB` },
        { icon: "🟢", label: "Node", value: process.version },
        { icon: "📟", label: "Platform", value: process.platform },
        { icon: "👤", label: "User", value: senderName }
      ];

      // Two column layout inside bottom box
      yPos = cardStartY + 610;
      const sysLineHeight = 48;

      systemDetails.forEach((detail, index) => {
        const colX = index < 4 ? 60 : 600;
        const rowIndex = index < 4 ? index : index - 4;
        const currentY = yPos + (rowIndex * sysLineHeight);

        // Icon
        ctx.fillStyle = "#ffd700";
        ctx.font = "24px 'Arial', 'Sans'";
        ctx.fillText(detail.icon, colX, currentY);
        
        // Label
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 16px 'Arial', 'Sans'";
        ctx.fillText(detail.label, colX + 35, currentY - 8);
        
        // Value
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px 'Arial', 'Sans'";
        
        // Adjust RAM display
        let displayValue = detail.value;
        if (detail.label === "RAM") {
          displayValue = `${totalMemory} GB (${freeMemory} free)`;
        }
        ctx.fillText(displayValue, colX + 35, currentY + 12);
        
        // Decorative line for first column
        if (index < 4) {
          ctx.strokeStyle = "rgba(255, 215, 0, 0.2)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(colX, currentY + 18);
          ctx.lineTo(540, currentY + 18);
          ctx.stroke();
        }
      });

      // ========== CONTACT SECTION ==========
      const contactY = cardStartY + 910;
      
      // Contact card with special gradient
      const contactGradient = ctx.createLinearGradient(40, contactY, 1160, contactY + 120);
      contactGradient.addColorStop(0, "rgba(255, 215, 0, 0.2)");
      contactGradient.addColorStop(0.5, "rgba(255, 215, 0, 0.3)");
      contactGradient.addColorStop(1, "rgba(255, 215, 0, 0.2)");
      
      ctx.fillStyle = contactGradient;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(255, 215, 0, 0.3)";
      
      ctx.beginPath();
      ctx.moveTo(40 + 20, contactY);
      ctx.lineTo(1160 - 20, contactY);
      ctx.quadraticCurveTo(1160, contactY, 1160, contactY + 20);
      ctx.lineTo(1160, contactY + 100);
      ctx.quadraticCurveTo(1160, contactY + 120, 1140, contactY + 120);
      ctx.lineTo(60, contactY + 120);
      ctx.quadraticCurveTo(40, contactY + 120, 40, contactY + 100);
      ctx.lineTo(40, contactY + 20);
      ctx.quadraticCurveTo(40, contactY, 60, contactY);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 0;

      // Contact title
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 30px 'Arial', 'Sans'";
      ctx.fillText("📱 𝐂𝐎𝐍𝐍𝐄𝐂𝐓 𝐖𝐈𝐓𝐇 𝐌𝐄", 600, contactY + 45);

      // Contact icons in a row
      const contacts = [
        { icon: "📧", value: "azad@example.com" },
        { icon: "🌐", value: "azadx69x.xyz" },
        { icon: "📘", value: "Azad Hossain" },
        { icon: "💻", value: "@azadx69x" }
      ];

      let contactX = 180;
      contacts.forEach(contact => {
        ctx.fillStyle = "#ffd700";
        ctx.font = "24px 'Arial', 'Sans'";
        ctx.fillText(contact.icon, contactX, contactY + 85);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px 'Arial', 'Sans'";
        
        // Truncate if too long
        let displayValue = contact.value;
        if (contact.value.length > 12) {
          displayValue = contact.value.substring(0, 10) + "...";
        }
        ctx.fillText(displayValue, contactX + 30, contactY + 90);
        
        contactX += 250;
      });

      // ========== FOOTER ==========
      const footerY = contactY + 140;
      
      // Decorative line
      ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, footerY);
      ctx.lineTo(1000, footerY);
      ctx.stroke();

      // Date and time with glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(255, 215, 0, 0.3)";
      
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 24px 'Arial', 'Sans'";
      ctx.fillText(`✦ ${date} ✦ ${day} ✦ ${time} ✦`, 600, footerY + 30);

      // Powered by
      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px 'Arial', 'Sans'";
      ctx.fillText("⚡ Powered by X69X Technology ⚡", 600, footerY + 60);

      ctx.shadowBlur = 0;

      // Save image
      const buffer = canvas.toBuffer();
      fs.writeFileSync(imgPath, buffer);

      // Remove loading reaction and add success reaction
      api.setMessageReaction("✅", event.messageID, event.threadID, () => {}, true);

      // Send message with attachment
      await message.reply({
        body: `━━━━━━━━━━━━━━━━━━━━━━━━\n⚡ 𝐎𝐖𝐍𝐄𝐑 𝐂𝐄𝐍𝐓𝐑𝐀𝐋 ⚡\n━━━━━━━━━━━━━━━━━━━━━━━━\n✨ 𝐇𝐞𝐥𝐥𝐨 ${senderName}! 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐭𝐡𝐞 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐨𝐰𝐧𝐞𝐫 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 ✨`,
        attachment: fs.createReadStream(imgPath)
      });

      // Clean up
      setTimeout(() => {
        try {
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        } catch (e) {}
      }, 5000);

    } catch (err) {
      console.error("Owner command error:", err);
      
      // Add error reaction
      api.setMessageReaction("❌", event.messageID, event.threadID, () => {}, true);
      
      await message.reply("❌ An error occurred while processing the owner command.");
    }

    // Clear thread cooldown after 5 minutes
    setTimeout(() => this.sentThreads.delete(threadID), 300000);
  }
};
