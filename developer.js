const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "developer",
    aliases: ["dev", "developers"],
    version: "6.0",
    author: "Azadx69x",
    countDown: 5,
    role: 4,
    description: {
      en: "Developer management with full profile display"
    },
    category: "owner",
    guide: {
      en: "{pn} [add/remove/list/profile] [uid/@tag/reply]"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, api }) {
    // Load Canvas
    let Canvas, canvas, ctx;
    try {
      Canvas = require('canvas');
      // Register rounded rectangle function
      if (Canvas && Canvas.Context2d) {
        Canvas.Context2d.prototype.roundRect = function (x, y, width, height, radius) {
          if (width < 2 * radius) radius = width / 2;
          if (height < 2 * radius) radius = height / 2;
          this.beginPath();
          this.moveTo(x + radius, y);
          this.arcTo(x + width, y, x + width, y + height, radius);
          this.arcTo(x + width, y + height, x, y + height, radius);
          this.arcTo(x, y + height, x, y, radius);
          this.arcTo(x, y, x + width, y, radius);
          this.closePath();
          return this;
        };
      }
    } catch (e) {
      return message.reply("⚠️ | Canvas module not installed. Please install it with: npm install canvas");
    }

    // 5 Color Palettes for different moods
    const colorPalettes = [
      {
        name: "Matrix Green",
        primary: "#00ff41",
        secondary: "#008f11",
        accent: "#03a062",
        bgStart: "#0a0a0a",
        bgEnd: "#001a00",
        text: "#ffffff",
        cardBg: "rgba(0, 255, 65, 0.1)"
      },
      {
        name: "Cyber Purple",
        primary: "#9d00ff",
        secondary: "#6a00ff",
        accent: "#b388eb",
        bgStart: "#0a001a",
        bgEnd: "#1a0035",
        text: "#ffffff",
        cardBg: "rgba(157, 0, 255, 0.1)"
      },
      {
        name: "Neon Red",
        primary: "#ff003c",
        secondary: "#ff002b",
        accent: "#ff6b9d",
        bgStart: "#1a000a",
        bgEnd: "#350014",
        text: "#ffffff",
        cardBg: "rgba(255, 0, 60, 0.1)"
      },
      {
        name: "Ocean Blue",
        primary: "#00b4d8",
        secondary: "#0077b6",
        accent: "#90e0ef",
        bgStart: "#000814",
        bgEnd: "#001d3d",
        text: "#ffffff",
        cardBg: "rgba(0, 180, 216, 0.1)"
      },
      {
        name: "Gold Elite",
        primary: "#ffd700",
        secondary: "#daa520",
        accent: "#fffacd",
        bgStart: "#1a1300",
        bgEnd: "#2a2000",
        text: "#ffffff",
        cardBg: "rgba(255, 215, 0, 0.1)"
      }
    ];

    // Select random palette
    const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    
    // Check all possible keys for developer array
    let devArray = [];
    
    // Priority: developer -> devUsers -> developers
    if (config.developer && Array.isArray(config.developer)) {
      devArray = config.developer;
    } else if (config.devUsers && Array.isArray(config.devUsers)) {
      devArray = config.devUsers;
    } else if (config.developers && Array.isArray(config.developers)) {
      devArray = config.developers;
    }
    
    // Clean array (remove empty strings)
    const cleanDevArray = devArray.filter(uid => 
      uid && uid.toString().trim() !== "" && !isNaN(uid)
    );

    // Function to try multiple FB URLs for profile picture
    const tryMultipleFBUrls = async (uid) => {
      const fbUrls = [
        `https://graph.facebook.com/${uid}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        `https://graph.facebook.com/${uid}/picture?width=500&height=500`,
        `https://graph.facebook.com/${uid}/picture?type=large`,
        `https://graph.facebook.com/${uid}/picture`,
        `https://graph.facebook.com/${uid}/picture?width=720&height=720`,
        `https://graph.facebook.com/${uid}/picture?width=1500&height=1500`,
        `https://graph.facebook.com/${uid}/picture?redirect=true`,
        `https://graph.facebook.com/${uid}/picture?type=normal`
      ];
      
      for (const url of fbUrls) {
        try {
          const response = await axios.head(url, { timeout: 5000 });
          if (response.status === 200) {
            return url;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Return default if all fail
      return `https://graph.facebook.com/${uid}/picture?width=500&height=500`;
    };

    // Function to get detailed user info with profile picture
    const getUserInfo = async (uid) => {
      try {
        let name = `User_${uid.substring(0, 8)}`;
        let firstName = "User";
        
        // Try API to get user info
        try {
          const userInfo = await api.getUserInfo(uid);
          if (userInfo && userInfo[uid]) {
            name = userInfo[uid].name || name;
            firstName = userInfo[uid].firstName || firstName;
          }
        } catch (e) {
          // Try usersData as fallback
          try {
            const userData = await usersData.get(uid);
            if (userData && userData.name && userData.name !== "Unknown User") {
              name = userData.name;
              firstName = name.split(' ')[0] || firstName;
            }
          } catch (e2) {}
        }
        
        // Get profile picture from multiple FB URLs
        const profilePic = await tryMultipleFBUrls(uid);
        const highResPic = profilePic.replace('width=500', 'width=1500').replace('height=500', 'height=1500');
        
        return { 
          uid, 
          name, 
          firstName,
          profilePic,
          highResPic,
          shortName: name.length > 15 ? name.substring(0, 15) + '...' : name
        };
        
      } catch (error) {
        console.error("Error getting user info for", uid, error.message);
        return { 
          uid, 
          name: `User_${uid.substring(0, 8)}`,
          firstName: "User",
          profilePic: `https://graph.facebook.com/${uid}/picture?width=500&height=500`,
          highResPic: `https://graph.facebook.com/${uid}/picture?width=1500&height=1500`,
          shortName: `User_${uid.substring(0, 8)}`
        };
      }
    };

    // Function to download image with multiple URL fallbacks
    const downloadImage = async (uid) => {
      const fbUrls = [
        `https://graph.facebook.com/${uid}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        `https://graph.facebook.com/${uid}/picture?width=500&height=500`,
        `https://graph.facebook.com/${uid}/picture?type=large`,
        `https://graph.facebook.com/${uid}/picture`,
        `https://graph.facebook.com/${uid}/picture?width=720&height=720`
      ];
      
      const tempFilePath = path.join(__dirname, `cache_profile_${uid}_${Date.now()}.jpg`);
      
      for (const url of fbUrls) {
        try {
          const response = await axios({
            url,
            responseType: 'stream',
            timeout: 10000
          });
          
          await new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(tempFilePath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          
          // Check if file was created and has content
          if (fs.existsSync(tempFilePath) && fs.statSync(tempFilePath).size > 0) {
            return tempFilePath;
          }
        } catch (error) {
          console.log(`Failed with URL: ${url}, trying next...`);
          continue;
        }
      }
      
      // If all URLs fail, return null
      return null;
    };

    // Function to create full profile canvas
    const createFullProfileCanvas = async (devs, action = null, targetUsers = []) => {
      try {
        // Calculate canvas size
        const canvasWidth = 1200;
        let canvasHeight = 800; // Base height
        
        if (action === 'list') {
          canvasHeight = 200 + (devs.length * 280);
          canvasHeight = Math.min(canvasHeight, 3000);
        } else if (action === 'profile' && targetUsers.length === 1) {
          canvasHeight = 850;
        } else if (action === 'add' || action === 'remove') {
          canvasHeight = 750;
        } else {
          canvasHeight = 850;
        }
        
        canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
        ctx = canvas.getContext('2d');
        
        // Create DARK gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, palette.bgStart);
        gradient.addColorStop(0.5, '#000000');
        gradient.addColorStop(1, palette.bgEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Add subtle noise texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
        for (let i = 0; i < 5000; i++) {
          const x = Math.random() * canvasWidth;
          const y = Math.random() * canvasHeight;
          ctx.fillRect(x, y, 1, 1);
        }
        
        // Add geometric grid pattern
        ctx.strokeStyle = palette.primary + '15';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < canvasWidth; i += 50) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvasHeight);
          ctx.stroke();
        }
        
        for (let i = 0; i < canvasHeight; i += 50) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(canvasWidth, i);
          ctx.stroke();
        }
        
        // Draw decorative corner accents
        const cornerSize = 150;
        ctx.fillStyle = palette.primary + '30';
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(cornerSize, 0);
        ctx.lineTo(0, cornerSize);
        ctx.closePath();
        ctx.fill();
        
        // Top-right
        ctx.beginPath();
        ctx.moveTo(canvasWidth, 0);
        ctx.lineTo(canvasWidth - cornerSize, 0);
        ctx.lineTo(canvasWidth, cornerSize);
        ctx.closePath();
        ctx.fill();
        
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight);
        ctx.lineTo(cornerSize, canvasHeight);
        ctx.lineTo(0, canvasHeight - cornerSize);
        ctx.closePath();
        ctx.fill();
        
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(canvasWidth, canvasHeight);
        ctx.lineTo(canvasWidth - cornerSize, canvasHeight);
        ctx.lineTo(canvasWidth, canvasHeight - cornerSize);
        ctx.closePath();
        ctx.fill();
        
        // ========== HEADER SECTION ==========
        // Minimal header with just logo
        const headerGradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
        headerGradient.addColorStop(0, palette.primary + '40');
        headerGradient.addColorStop(1, palette.secondary + '40');
        
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, canvasWidth, 100);
        
        // Header logo/text only (no theme/dev count text)
        ctx.shadowColor = palette.primary;
        ctx.shadowBlur = 20;
        
        ctx.font = 'bold 50px "Segoe UI", "Arial", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ DEVELOPER SYSTEM', canvasWidth / 2, 65);
        
        ctx.shadowBlur = 0;
        
        let currentY = 120;
        
        // ========== ACTION-SPECIFIC DISPLAYS ==========
        
        if (action === 'list') {
          // Create profile card for each developer
          for (let i = 0; i < devs.length; i++) {
            const dev = devs[i];
            
            // Try to download profile picture
            let profileImage = null;
            let tempFilePath = null;
            
            try {
              tempFilePath = await downloadImage(dev.uid);
              if (tempFilePath) {
                profileImage = await Canvas.loadImage(tempFilePath);
              }
            } catch (e) {
              console.error("Failed to load profile image:", e.message);
            } finally {
              // Clean up temp file
              if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
              }
            }
            
            // Profile card container
            const cardWidth = canvasWidth - 100;
            const cardHeight = 240;
            const cardX = 50;
            const cardY = currentY;
            
            // Card background with gradient
            const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
            cardGradient.addColorStop(0, palette.cardBg);
            cardGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
            
            ctx.fillStyle = cardGradient;
            ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 25);
            ctx.fill();
            
            // Card border with glow
            ctx.strokeStyle = palette.primary;
            ctx.lineWidth = 3;
            ctx.shadowColor = palette.primary;
            ctx.shadowBlur = 15;
            ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 25);
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            // Profile picture frame
            const picSize = 170;
            const picX = cardX + 30;
            const picY = cardY + 35;
            
            // Draw profile picture if available
            if (profileImage) {
              try {
                // Create circular mask for profile picture
                ctx.save();
                ctx.beginPath();
                ctx.arc(picX + picSize/2, picY + picSize/2, picSize/2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(profileImage, picX, picY, picSize, picSize);
                ctx.restore();
              } catch (e) {
                console.error("Error drawing profile image:", e.message);
                // Fallback placeholder
                ctx.fillStyle = palette.secondary + '30';
                ctx.beginPath();
                ctx.arc(picX + picSize/2, picY + picSize/2, picSize/2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.font = '40px "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = palette.primary;
                ctx.textAlign = 'center';
                ctx.fillText('👤', picX + picSize/2, picY + picSize/2 + 15);
              }
            } else {
              // Placeholder if image fails
              ctx.fillStyle = palette.secondary + '30';
              ctx.beginPath();
              ctx.arc(picX + picSize/2, picY + picSize/2, picSize/2, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.font = '40px "Segoe UI", Arial, sans-serif';
              ctx.fillStyle = palette.primary;
              ctx.textAlign = 'center';
              ctx.fillText('👤', picX + picSize/2, picY + picSize/2 + 15);
            }
            
            // Profile picture border
            ctx.strokeStyle = palette.primary;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(picX + picSize/2, picY + picSize/2, picSize/2, 0, Math.PI * 2);
            ctx.stroke();
            
            // Developer number badge
            ctx.fillStyle = palette.primary;
            ctx.roundRect(picX + picSize - 40, picY + picSize - 40, 40, 40, 10);
            ctx.fill();
            
            ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.fillText(`#${i+1}`, picX + picSize - 20, picY + picSize - 15);
            
            // Developer info section
            const infoX = picX + picSize + 40;
            const infoY = picY;
            
            // Developer name
            ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.primary;
            ctx.textAlign = 'left';
            ctx.fillText(dev.name, infoX, infoY + 40);
            
            // UID
            ctx.font = '24px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#cccccc';
            ctx.fillText(`🔑 UID: ${dev.uid}`, infoX, infoY + 85);
            
            // First name
            ctx.fillText(`👤 First Name: ${dev.firstName}`, infoX, infoY + 125);
            
            // Added Date
            ctx.fillText(`📅 Added: ${new Date().toLocaleDateString()}`, infoX, infoY + 165);
            
            // Status badge
            ctx.fillStyle = '#00ff00' + '40';
            ctx.roundRect(infoX + 400, infoY + 20, 120, 40, 10);
            ctx.fill();
            
            ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#00ff00';
            ctx.textAlign = 'center';
            ctx.fillText('ACTIVE', infoX + 460, infoY + 46);
            
            // Role badge
            ctx.fillStyle = palette.secondary + '40';
            ctx.roundRect(infoX + 400, infoY + 70, 150, 40, 10);
            ctx.fill();
            
            ctx.fillStyle = palette.secondary;
            ctx.fillText('BOT DEVELOPER', infoX + 475, infoY + 90);
            
            currentY += cardHeight + 30;
            
            // Separator line between profiles
            if (i < devs.length - 1) {
              ctx.strokeStyle = palette.primary + '30';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(cardX, currentY - 10);
              ctx.lineTo(cardX + cardWidth, currentY - 10);
              ctx.stroke();
              
              currentY += 20;
            }
          }
        }
        else if (action === 'profile' && targetUsers.length === 1) {
          // Single profile detailed view
          const dev = devs[0];
          
          // Try to download high-res profile picture
          let profileImage = null;
          let tempFilePath = null;
          
          try {
            tempFilePath = await downloadImage(dev.uid);
            if (tempFilePath) {
              profileImage = await Canvas.loadImage(tempFilePath);
            }
          } catch (e) {
            console.error("Failed to load profile image:", e.message);
          } finally {
            if (tempFilePath && fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
            }
          }
          
          // Large profile picture
          const picSize = 300;
          const picX = (canvasWidth - picSize) / 2;
          const picY = currentY + 50;
          
          if (profileImage) {
            try {
              // Draw profile picture with circular mask
              ctx.save();
              ctx.beginPath();
              ctx.arc(picX + picSize/2, picY + picSize/2, picSize/2, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(profileImage, picX, picY, picSize, picSize);
              ctx.restore();
            } catch (e) {
              console.error("Error drawing profile image:", e.message);
            }
          }
          
          // Glowing border for profile picture
          ctx.strokeStyle = palette.primary;
          ctx.lineWidth = 6;
          ctx.shadowColor = palette.primary;
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.arc(picX + picSize/2, picY + picSize/2, picSize/2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          currentY += picSize + 80;
          
          // Developer name (large)
          ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = palette.primary;
          ctx.textAlign = 'center';
          ctx.fillText(dev.name, canvasWidth / 2, currentY);
          
          currentY += 50;
          
          // Info container
          const infoWidth = 800;
          const infoX = (canvasWidth - infoWidth) / 2;
          
          ctx.fillStyle = palette.cardBg;
          ctx.roundRect(infoX, currentY, infoWidth, 250, 25);
          ctx.fill();
          
          ctx.strokeStyle = palette.primary;
          ctx.lineWidth = 2;
          ctx.roundRect(infoX, currentY, infoWidth, 250, 25);
          ctx.stroke();
          
          // Info grid
          const infoStartY = currentY + 50;
          
          // Left column
          ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = palette.text;
          ctx.textAlign = 'left';
          
          ctx.fillText(`🔑 User ID:`, infoX + 40, infoStartY);
          ctx.fillText(`👤 First Name:`, infoX + 40, infoStartY + 60);
          ctx.fillText(`📅 Added Date:`, infoX + 40, infoStartY + 120);
          
          // Right column (values)
          ctx.font = '28px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = palette.primary;
          
          ctx.fillText(dev.uid, infoX + 300, infoStartY);
          ctx.fillText(dev.firstName, infoX + 300, infoStartY + 60);
          ctx.fillText(new Date().toLocaleDateString(), infoX + 300, infoStartY + 120);
          
          // Role badge
          ctx.fillStyle = palette.secondary + '40';
          ctx.roundRect(infoX + 500, infoStartY - 30, 200, 50, 15);
          ctx.fill();
          
          ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = palette.secondary;
          ctx.textAlign = 'center';
          ctx.fillText('ADMIN DEVELOPER', infoX + 600, infoStartY + 5);
          
          currentY += 300;
        }
        else if (action === 'add') {
          // Success message with added user profile
          ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = '#00ff88';
          ctx.textAlign = 'center';
          ctx.fillText('✅ DEVELOPER ADDED', canvasWidth / 2, currentY);
          
          currentY += 60;
          
          if (targetUsers.length > 0) {
            const addedDev = await getUserInfo(targetUsers[0]);
            
            // Try to download profile picture
            let profileImage = null;
            let tempFilePath = null;
            
            try {
              tempFilePath = await downloadImage(addedDev.uid);
              if (tempFilePath) {
                profileImage = await Canvas.loadImage(tempFilePath);
              }
            } catch (e) {
              console.error("Failed to load profile image:", e.message);
            } finally {
              if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
              }
            }
            
            // Show added developer profile
            const cardWidth = 800;
            const cardX = (canvasWidth - cardWidth) / 2;
            
            ctx.fillStyle = palette.cardBg;
            ctx.roundRect(cardX, currentY, cardWidth, 180, 20);
            ctx.fill();
            
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;
            ctx.roundRect(cardX, currentY, cardWidth, 180, 20);
            ctx.stroke();
            
            // Profile picture on left
            const picSize = 120;
            const picX = cardX + 30;
            const picY = currentY + 30;
            
            if (profileImage) {
              try {
                ctx.save();
                ctx.beginPath();
                ctx.arc(picX + picSize/2, picY + picSize/2, picSize/2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(profileImage, picX, picY, picSize, picSize);
                ctx.restore();
                
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(picX + picSize/2, picY + picSize/2, picSize/2, 0, Math.PI * 2);
                ctx.stroke();
              } catch (e) {
                console.error("Error drawing profile image:", e.message);
              }
            }
            
            // Developer info
            ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.primary;
            ctx.textAlign = 'left';
            ctx.fillText(addedDev.name, cardX + picSize + 60, currentY + 50);
            
            ctx.font = '24px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#cccccc';
            ctx.fillText(`UID: ${addedDev.uid}`, cardX + picSize + 60, currentY + 100);
            
            // Success icon
            ctx.font = '60px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#00ff88';
            ctx.textAlign = 'center';
            ctx.fillText('🎉', cardX + 700, currentY + 90);
            
            currentY += 220;
          }
        }
        else if (action === 'remove') {
          // Removal message
          ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = '#ff5555';
          ctx.textAlign = 'center';
          ctx.fillText('❌ DEVELOPER REMOVED', canvasWidth / 2, currentY);
          
          currentY += 60;
          
          if (targetUsers.length > 0) {
            const removedDev = await getUserInfo(targetUsers[0]);
            
            const cardWidth = 800;
            const cardX = (canvasWidth - cardWidth) / 2;
            
            ctx.fillStyle = 'rgba(255, 85, 85, 0.1)';
            ctx.roundRect(cardX, currentY, cardWidth, 150, 20);
            ctx.fill();
            
            ctx.strokeStyle = '#ff5555';
            ctx.lineWidth = 2;
            ctx.roundRect(cardX, currentY, cardWidth, 150, 20);
            ctx.stroke();
            
            ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ff5555';
            ctx.textAlign = 'left';
            ctx.fillText(removedDev.name, cardX + 30, currentY + 50);
            
            ctx.font = '22px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#cccccc';
            ctx.fillText(`UID: ${removedDev.uid}`, cardX + 30, currentY + 100);
            
            currentY += 200;
          }
        }
        else {
          // Help/Commands display
          ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = palette.accent;
          ctx.textAlign = 'center';
          ctx.fillText('⚙️ COMMAND REFERENCE', canvasWidth / 2, currentY);
          
          currentY += 70;
          
          const commands = [
            { icon: '👥', cmd: '/dev list', desc: 'Show all developer profiles' },
            { icon: '👤', cmd: '/dev profile [uid]', desc: 'Show detailed profile' },
            { icon: '➕', cmd: '/dev add [uid/@mention]', desc: 'Add new developer' },
            { icon: '➖', cmd: '/dev remove [uid/@mention]', desc: 'Remove developer' },
            { icon: '➕', cmd: '/dev add', desc: 'Add yourself' },
            { icon: '🎨', cmd: '/dev theme', desc: 'Theme info' },
            { icon: '📊', cmd: '/dev stats', desc: 'Statistics' }
          ];
          
          // Commands container
          ctx.fillStyle = palette.cardBg;
          ctx.roundRect(100, currentY, 1000, 350, 25);
          ctx.fill();
          
          ctx.strokeStyle = palette.primary;
          ctx.lineWidth = 2;
          ctx.roundRect(100, currentY, 1000, 350, 25);
          ctx.stroke();
          
          let yPos = currentY + 60;
          
          for (const command of commands) {
            ctx.font = '28px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.primary;
            ctx.textAlign = 'left';
            ctx.fillText(command.icon, 130, yPos);
            
            ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.text;
            ctx.fillText(command.cmd, 180, yPos);
            
            ctx.font = '22px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.text + 'cc';
            ctx.fillText(command.desc, 400, yPos);
            
            yPos += 50;
          }
        }
        
        // ========== FOOTER ==========
        const footerHeight = 80;
        
        // Footer gradient
        const footerGradient = ctx.createLinearGradient(0, canvasHeight - footerHeight, canvasWidth, canvasHeight);
        footerGradient.addColorStop(0, palette.primary + '20');
        footerGradient.addColorStop(1, palette.secondary + '20');
        
        ctx.fillStyle = footerGradient;
        ctx.fillRect(0, canvasHeight - footerHeight, canvasWidth, footerHeight);
        
        // Footer text (minimal)
        ctx.font = '20px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = palette.text;
        ctx.textAlign = 'center';
        ctx.fillText('GoatBot v6.0', canvasWidth / 2, canvasHeight - 30);
        
        // Save the image
        const imagePath = path.join(__dirname, 'cache', `dev_system_${Date.now()}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(imagePath, buffer);
        
        return imagePath;
        
      } catch (error) {
        console.error("Error creating profile canvas:", error);
        throw error;
      }
    };

    const getUIDs = () => {
      let uids = [];

      // Check for mentions
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        uids = Object.keys(event.mentions);
      }
      // Check for reply
      else if (event.messageReply && event.messageReply.senderID) {
        uids.push(event.messageReply.senderID);
      }
      // Check for arguments
      else if (args.length > 1) {
        uids = args.slice(1).filter(id => !isNaN(id) && id.trim() !== "");
      }
      // If only "add" command with no UID
      else if (args[0] === "add" && args.length === 1) {
        uids.push(event.senderID);
      }

      return [...new Set(uids.map(id => id.toString().trim()))];
    };

    const sub = (args[0] || "").toLowerCase();

    try {
      // Get current developers info
      const devs = await Promise.all(
        cleanDevArray.map(uid => getUserInfo(uid))
      );
      
      let imagePath;
      let actionType = 'help';
      let targetUsers = [];
      
      // Determine action type
      if (sub === "list" || sub === "-l" || !sub) {
        actionType = 'list';
      } 
      else if (sub === "profile" && args[1]) {
        actionType = 'profile';
        const uid = args[1];
        if (cleanDevArray.includes(uid)) {
          targetUsers = [uid];
          // Get only this developer's info
          const profileDev = await getUserInfo(uid);
          devs.length = 0;
          devs.push(profileDev);
        }
      }
      else if (sub === "add" || sub === "-a") {
        actionType = 'add';
        const uids = getUIDs();
        if (uids.length > 0) {
          const added = [];
          let newDevArray = [...cleanDevArray];

          for (const uid of uids) {
            const cleanUid = uid.toString().trim();
            if (!cleanUid || cleanUid === "" || isNaN(cleanUid)) continue;
            
            if (!newDevArray.includes(cleanUid)) {
              newDevArray.push(cleanUid);
              added.push(cleanUid);
            }
          }

          if (added.length > 0) {
            config.developer = newDevArray;
            config.devUsers = newDevArray;
            this.saveConfig();
            targetUsers = added;
          }
        }
      }
      else if (sub === "remove" || sub === "-r") {
        actionType = 'remove';
        const uids = getUIDs();
        if (uids.length > 0) {
          const removed = [];
          let newDevArray = [...cleanDevArray];

          for (const uid of uids) {
            const cleanUid = uid.toString().trim();
            const index = newDevArray.indexOf(cleanUid);
            if (index !== -1) {
              newDevArray.splice(index, 1);
              removed.push(cleanUid);
            }
          }

          if (removed.length > 0) {
            config.developer = newDevArray;
            config.devUsers = newDevArray;
            this.saveConfig();
            targetUsers = removed;
          }
        }
      }
      else if (sub === "theme" || sub === "stats") {
        actionType = 'help';
      }
      
      // Create full profile canvas
      imagePath = await createFullProfileCanvas(devs, actionType, targetUsers);
      
      // Send the image with NO TEXT in message body
      await message.reply({
        body: "", // Empty message body
        attachment: fs.createReadStream(imagePath)
      });
      
      // Clean up
      setTimeout(() => {
        try { fs.unlinkSync(imagePath); } catch (e) {}
      }, 5000);
      
    } catch (error) {
      console.error("Error in developer system:", error);
      return message.reply("❌ Error generating profile image. Please try again.");
    }
  },

  saveConfig: function() {
    try {
      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
      console.log("✅ Config saved successfully");
    } catch (error) {
      console.error("❌ Error saving config:", error);
    }
  }
};
