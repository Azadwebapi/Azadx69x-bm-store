const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "pair",
    author: "Azadx69x",
    version: "3.0",
    role: 0,
    category: "love",
    shortDescription: {
      en: "💘 Generate a love match"
    },
    longDescription: {
      en: "Find your love match in the group"
    },
    guide: {
      en: "{p}pair"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      // Get thread info
      const threadInfo = await api.getThreadInfo(event.threadID);
      const participants = threadInfo.participantIDs;
      
      // Remove bot ID and sender ID
      const filteredParticipants = participants.filter(id => 
        id !== event.senderID && id !== api.getCurrentUserID()
      );
      
      if (filteredParticipants.length === 0) {
        return api.sendMessage("❌ No other members found to pair with!", event.threadID);
      }
      
      // Randomly select a match
      const randomIndex = Math.floor(Math.random() * filteredParticipants.length);
      const matchID = filteredParticipants[randomIndex];
      
      // Get names
      const senderInfo = await api.getUserInfo(event.senderID);
      const matchInfo = await api.getUserInfo(matchID);
      
      const senderName = senderInfo[event.senderID].name;
      const matchName = matchInfo[matchID].name;
      
      // Generate love percentage
      const lovePercent = Math.floor(Math.random() * 31) + 70;
      
      // Load avatars
      const [senderAvatar, matchAvatar] = await Promise.all([
        loadAvatar(event.senderID),
        loadAvatar(matchID)
      ]);
      
      // Create image with larger size for better background
      const width = 1000;
      const height = 600;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      // === ULTIMATE BACKGROUND DESIGN ===
      
      // 1. MULTI-COLOR GRADIENT BACKGROUND
      const gradient1 = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
      gradient1.addColorStop(0, "#ff6b8b");
      gradient1.addColorStop(0.3, "#ff4081");
      gradient1.addColorStop(0.6, "#d81b60");
      gradient1.addColorStop(1, "#8e24aa");
      
      const gradient2 = ctx.createLinearGradient(0, 0, width, height);
      gradient2.addColorStop(0, "rgba(255, 107, 139, 0.8)");
      gradient2.addColorStop(1, "rgba(142, 36, 170, 0.8)");
      
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);
      
      // 2. SPARKLE EFFECTS
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 4 + 1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect to some sparkles
        if (i % 5 === 0) {
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(x, y, size * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      
      // 3. ANIMATED HEARTS BACKGROUND (Multiple layers)
      const heartColors = [
        "rgba(255, 64, 129, 0.3)",
        "rgba(255, 107, 139, 0.4)",
        "rgba(255, 182, 193, 0.3)",
        "rgba(255, 255, 255, 0.2)"
      ];
      
      // Layer 1: Small floating hearts
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 25 + 10;
        const colorIndex = Math.floor(Math.random() * heartColors.length);
        
        ctx.fillStyle = heartColors[colorIndex];
        drawFloatingHeart(ctx, x, y, size);
        ctx.fill();
      }
      
      // Layer 2: Big hearts with borders
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 60 + 40;
        
        drawHeart(ctx, x, y, size);
        ctx.stroke();
      }
      
      // 4. GEOMETRIC PATTERNS
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      
      // Diagonal lines
      for (let i = -height; i < width * 2; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      
      // 5. GRADIENT OVERLAY FOR DEPTH
      const overlayGradient = ctx.createLinearGradient(0, 0, 0, height);
      overlayGradient.addColorStop(0, "rgba(142, 36, 170, 0.2)");
      overlayGradient.addColorStop(0.5, "rgba(255, 64, 129, 0.1)");
      overlayGradient.addColorStop(1, "rgba(255, 107, 139, 0.3)");
      
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, width, height);
      
      // 6. GLOWING BORDER
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 30;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 15;
      ctx.strokeRect(25, 25, width - 50, height - 50);
      ctx.shadowBlur = 0;
      
      // Inner border
      ctx.strokeStyle = "#ff6b8b";
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, width - 80, height - 80);
      
      // === MAIN CONTENT ===
      
      // Draw semi-transparent card for content
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      roundRect(ctx, 100, 100, width - 200, height - 200, 40);
      ctx.fill();
      
      // Draw circles for avatars with glow effect
      const circleRadius = 120;
      
      // Left circle (sender) with glow
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 20;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(250, 300, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Avatar for sender
      ctx.save();
      ctx.beginPath();
      ctx.arc(250, 300, circleRadius, 0, Math.PI * 2);
      ctx.clip();
      
      if (senderAvatar) {
        ctx.drawImage(senderAvatar, 130, 180, 240, 240);
      } else {
        // Fallback design
        ctx.fillStyle = "#ff4081";
        ctx.fillRect(130, 180, 240, 240);
        ctx.fillStyle = "white";
        ctx.font = "bold 80px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(senderName.charAt(0).toUpperCase(), 250, 300);
      }
      ctx.restore();
      
      // Right circle (match) with glow
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(750, 300, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Avatar for match
      ctx.save();
      ctx.beginPath();
      ctx.arc(750, 300, circleRadius, 0, Math.PI * 2);
      ctx.clip();
      
      if (matchAvatar) {
        ctx.drawImage(matchAvatar, 630, 180, 240, 240);
      } else {
        // Fallback design
        ctx.fillStyle = "#ff4081";
        ctx.fillRect(630, 180, 240, 240);
        ctx.fillStyle = "white";
        ctx.font = "bold 80px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(matchName.charAt(0).toUpperCase(), 750, 300);
      }
      ctx.restore();
      
      // Animated connecting hearts line
      for (let i = 0; i < 5; i++) {
        const x = 250 + (i * 100);
        const y = 300 + Math.sin(Date.now() / 1000 + i) * 10;
        
        ctx.fillStyle = i % 2 === 0 ? "#ff4081" : "#ffffff";
        drawHeart(ctx, x, y, 20 + i * 5);
        ctx.fill();
      }
      
      // Big glowing heart in middle
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#ffffff";
      drawHeart(ctx, 500, 300, 80);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Names with glow effect
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      
      const displaySenderName = truncateText(senderName, 15);
      const displayMatchName = truncateText(matchName, 15);
      
      ctx.fillText(displaySenderName, 250, 450);
      ctx.fillText(displayMatchName, 750, 450);
      ctx.shadowBlur = 0;
      
      // Love percentage with stunning design
      ctx.fillStyle = "rgba(255, 64, 129, 0.9)";
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 20;
      roundRect(ctx, 400, 470, 200, 70, 35);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Inner glow for percentage box
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 3;
      roundRect(ctx, 400, 470, 200, 70, 35);
      ctx.stroke();
      
      // Percentage text with glow
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px 'Arial Rounded MT Bold', Arial, sans-serif";
      ctx.fillText(`💖 ${lovePercent}%`, 500, 515);
      ctx.shadowBlur = 0;
      
      // Decorative elements
      ctx.fillStyle = "#ffffff";
      ctx.font = "60px Arial";
      ctx.textAlign = "center";
      ctx.fillText("💘", 500, 200);
      
      // Title text
      ctx.shadowColor = "#ff4081";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px 'Brush Script MT', cursive";
      ctx.fillText("Perfect Match Found!", 500, 100);
      ctx.shadowBlur = 0;
      
      // Save image
      const imagePath = path.join(__dirname, "pair_match.png");
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imagePath, buffer);
      
      // Send message
      const message = `💞 𝗠𝗮𝘁𝗰𝗵𝗺𝗮𝗸𝗶𝗻𝗴 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 💞\n\n` +
                     `✨ ${senderName}\n` +
                     `✨ ${matchName}\n\n` +
                     `💖 ${lovePercent}%`;
      
      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(imagePath)
      }, event.threadID);
      
      // Clean up
      fs.unlinkSync(imagePath);
      
    } catch (error) {
      console.error("Pair command error:", error);
      api.sendMessage("❌ An error occurred.", event.threadID);
    }
  }
};

// Avatar loading function
async function loadAvatar(uid) {
    try {
        let imageBuffer;
        const fbUrls = [
            `https://graph.facebook.com/${uid}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            `https://graph.facebook.com/${uid}/picture?width=500&height=500`,
            `https://graph.facebook.com/${uid}/picture?type=large`,
            `https://graph.facebook.com/${uid}/picture`
        ];

        for (const url of fbUrls) {
            try {
                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'image/*',
                        'Referer': 'https://www.facebook.com/'
                    }
                });
                if (response.status === 200 && response.data) {
                    imageBuffer = Buffer.from(response.data);
                    break;
                }
            } catch (err) { 
                continue; 
            }
        }

        if (imageBuffer) {
            return await loadImage(imageBuffer);
        }
    } catch (err) {
        console.log("Avatar load failed for UID:", uid, err.message);
    }

    return null;
}

// Helper functions
function drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.beginPath();
    
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    
    // Left curve
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    
    // Left bottom curve
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.85, x, y + size);
    
    // Right bottom curve
    ctx.bezierCurveTo(x, y + size * 0.85, x + size / 2, y + size / 2, x + size / 2, y + topCurveHeight);
    
    // Right curve
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    
    ctx.closePath();
    ctx.restore();
}

function drawFloatingHeart(ctx, x, y, size) {
    ctx.save();
    ctx.beginPath();
    
    // Create a more stylized heart for floating effect
    ctx.moveTo(x, y + size * 0.25);
    
    ctx.bezierCurveTo(x, y, x - size * 0.4, y, x - size * 0.4, y + size * 0.25);
    ctx.bezierCurveTo(x - size * 0.4, y + size * 0.5, x, y + size * 0.7, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.7, x + size * 0.4, y + size * 0.5, x + size * 0.4, y + size * 0.25);
    ctx.bezierCurveTo(x + size * 0.4, y, x, y, x, y + size * 0.25);
    
    ctx.closePath();
    ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
}
