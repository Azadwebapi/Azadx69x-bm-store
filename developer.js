const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "developer",
    aliases: ["dev"],
    version: "4.0",
    author: "Azadx69x",
    countDown: 5,
    role: 4,
    description: {
      en: "Add, remove developer role with colorful canvas display"
    },
    category: "owner",
    guide: {
      en: "{pn} [add/remove/list/canvas] [uid/@tag/reply]"
    }
  },

  langs: {
    en: {
      added: "✅ | Added developer role for %1 users:\n%2",
      alreadyDev: "\n⚠️ | %1 users already have developer role:\n%2",
      missingIdAdd: "⚠️ | Reply / tag / UID required to add developer",
      removed: "✅ | Removed developer role of %1 users:\n%2",
      notDev: "⚠️ | %1 users don't have developer role:\n%2",
      missingIdRemove: "⚠️ | Reply / tag / UID required to remove developer"
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

    // 5 Random Color Palettes
    const colorPalettes = [
      {
        name: "Neon Cyberpunk",
        primary: "#00ff88",
        secondary: "#ff00ff",
        accent: "#00ffff",
        bgStart: "#0a0a2a",
        bgEnd: "#1a1a3a",
        text: "#ffffff",
        cardBg: "rgba(255, 255, 255, 0.05)"
      },
      {
        name: "Sunset Gradient",
        primary: "#ff6b6b",
        secondary: "#ffa726",
        accent: "#ffeb3b",
        bgStart: "#1a237e",
        bgEnd: "#311b92",
        text: "#ffffff",
        cardBg: "rgba(255, 255, 255, 0.07)"
      },
      {
        name: "Ocean Blue",
        primary: "#4fc3f7",
        secondary: "#29b6f6",
        accent: "#00e5ff",
        bgStart: "#0d47a1",
        bgEnd: "#1565c0",
        text: "#ffffff",
        cardBg: "rgba(255, 255, 255, 0.06)"
      },
      {
        name: "Forest Green",
        primary: "#66bb6a",
        secondary: "#43a047",
        accent: "#a5d6a7",
        bgStart: "#1b5e20",
        bgEnd: "#2e7d32",
        text: "#ffffff",
        cardBg: "rgba(255, 255, 255, 0.06)"
      },
      {
        name: "Royal Purple",
        primary: "#ab47bc",
        secondary: "#8e24aa",
        accent: "#e1bee7",
        bgStart: "#4a148c",
        bgEnd: "#6a1b9a",
        text: "#ffffff",
        cardBg: "rgba(255, 255, 255, 0.06)"
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

    // Function to get user info
    const getUserInfo = async (uid) => {
      try {
        let name = `User_${uid.substring(0, 8)}`;
        let profilePic = `https://graph.facebook.com/${uid}/picture?width=720&height=720`;
        
        // Try API to get user info
        try {
          const userInfo = await api.getUserInfo(uid);
          if (userInfo && userInfo[uid]) {
            name = userInfo[uid].name || userInfo[uid].firstName || name;
          }
        } catch (e) {
          // Try usersData as fallback
          try {
            const userData = await usersData.get(uid);
            if (userData && userData.name && userData.name !== "Unknown User") {
              name = userData.name;
            }
          } catch (e2) {}
        }
        
        return { uid, name, profilePic };
        
      } catch (error) {
        console.error("Error getting user info for", uid, error.message);
        return { 
          uid, 
          name: `User_${uid.substring(0, 8)}`,
          profilePic: `https://graph.facebook.com/${uid}/picture?width=720&height=720`
        };
      }
    };

    // Function to download image
    const downloadImage = async (url, filepath) => {
      try {
        const response = await axios({
          url,
          responseType: 'stream',
          timeout: 10000
        });
        
        return new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(filepath);
          response.data.pipe(writer);
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
      } catch (error) {
        console.error("Error downloading image:", url);
        return null;
      }
    };

    // Function to create colorful canvas
    const createColorfulCanvas = async (devs, action = null, targetUsers = []) => {
      try {
        // Create canvas with random size based on content
        let canvasWidth = 1000;
        let canvasHeight = 600;
        
        if (action === 'list' && devs.length > 0) {
          canvasHeight = 200 + (Math.ceil(devs.length / 2) * 140);
          canvasHeight = Math.min(canvasHeight, 1500);
        } else if (action === 'add' || action === 'remove') {
          canvasHeight = 700;
        } else if (action === 'help') {
          canvasHeight = 800;
        }
        
        canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
        ctx = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, palette.bgStart);
        gradient.addColorStop(1, palette.bgEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Add abstract shapes for style
        ctx.fillStyle = palette.primary + '20'; // 20% opacity
        for (let i = 0; i < 15; i++) {
          const x = Math.random() * canvasWidth;
          const y = Math.random() * canvasHeight;
          const size = Math.random() * 100 + 50;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw decorative geometric patterns
        ctx.strokeStyle = palette.accent + '30';
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
          const x = Math.random() * canvasWidth;
          const y = Math.random() * canvasHeight;
          const size = Math.random() * 80 + 20;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let j = 0; j < 6; j++) {
            const angle = (j * 60 * Math.PI) / 180;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
        
        // Draw top decorative wave
        ctx.fillStyle = palette.primary + '40';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i < canvasWidth; i += 20) {
          const y = Math.sin(i * 0.01) * 15;
          ctx.lineTo(i, y);
        }
        ctx.lineTo(canvasWidth, 0);
        ctx.closePath();
        ctx.fill();
        
        // Main header with gradient
        const headerGradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
        headerGradient.addColorStop(0, palette.primary);
        headerGradient.addColorStop(0.5, palette.secondary);
        headerGradient.addColorStop(1, palette.accent);
        
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, canvasWidth, 120);
        
        // Add header pattern
        ctx.fillStyle = '#ffffff20';
        for (let i = 0; i < canvasWidth; i += 40) {
          ctx.beginPath();
          ctx.arc(i, 60, 10, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Header text with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.font = 'bold 45px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('🚀 DEVELOPER CONTROL PANEL', canvasWidth / 2, 65);
        
        ctx.font = '22px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffffffcc';
        ctx.fillText(`Theme: ${palette.name} | ${devs.length} Active Developers`, canvasWidth / 2, 100);
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        let currentY = 150;
        
        // ========== ACTION DISPLAYS ==========
        
        if (action === 'list') {
          // Title with icon
          ctx.font = 'bold 38px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = palette.secondary;
          ctx.textAlign = 'left';
          ctx.fillText('👥 DEVELOPER TEAM ROSTER', 50, currentY);
          
          currentY += 60;
          
          if (devs.length === 0) {
            // Empty state design
            ctx.fillStyle = palette.cardBg;
            ctx.roundRect(100, currentY, 800, 200, 20);
            ctx.fill();
            
            ctx.strokeStyle = palette.primary;
            ctx.lineWidth = 2;
            ctx.roundRect(100, currentY, 800, 200, 20);
            ctx.stroke();
            
            ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.primary;
            ctx.textAlign = 'center';
            ctx.fillText('📭 NO DEVELOPERS FOUND', canvasWidth / 2, currentY + 100);
            
            ctx.font = '24px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.text;
            ctx.fillText('Use /dev add to add yourself as developer', canvasWidth / 2, currentY + 150);
            
            currentY += 250;
          } else {
            // Developer grid with colorful cards
            const devsPerRow = 2;
            const cardWidth = 430;
            const cardHeight = 130;
            const cardSpacing = 40;
            
            for (let i = 0; i < devs.length; i++) {
              const dev = devs[i];
              const row = Math.floor(i / devsPerRow);
              const col = i % devsPerRow;
              
              const x = 50 + (col * (cardWidth + cardSpacing));
              const y = currentY + (row * (cardHeight + 20));
              
              // Random card color from palette
              const cardColors = [palette.primary, palette.secondary, palette.accent];
              const cardColor = cardColors[i % 3];
              
              // Card background with gradient
              const cardGradient = ctx.createLinearGradient(x, y, x + cardWidth, y + cardHeight);
              cardGradient.addColorStop(0, cardColor + '30');
              cardGradient.addColorStop(1, cardColor + '10');
              
              ctx.fillStyle = cardGradient;
              ctx.roundRect(x, y, cardWidth, cardHeight, 15);
              ctx.fill();
              
              // Card border
              ctx.strokeStyle = cardColor;
              ctx.lineWidth = 3;
              ctx.roundRect(x, y, cardWidth, cardHeight, 15);
              ctx.stroke();
              
              // Number badge with gradient
              const badgeGradient = ctx.createLinearGradient(x + 15, y + 15, x + 55, y + 55);
              badgeGradient.addColorStop(0, cardColor);
              badgeGradient.addColorStop(1, palette.secondary);
              
              ctx.fillStyle = badgeGradient;
              ctx.roundRect(x + 15, y + 15, 40, 40, 8);
              ctx.fill();
              
              // Number
              ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
              ctx.fillStyle = '#ffffff';
              ctx.textAlign = 'center';
              ctx.fillText(`${i + 1}`, x + 35, y + 43);
              
              // Developer info
              ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
              ctx.fillStyle = palette.text;
              ctx.textAlign = 'left';
              
              // Truncate long names
              let displayName = dev.name;
              if (displayName.length > 18) {
                displayName = displayName.substring(0, 18) + '...';
              }
              
              ctx.fillText(displayName, x + 70, y + 40);
              
              // UID
              ctx.font = '18px "Segoe UI", Arial, sans-serif';
              ctx.fillStyle = palette.text + 'cc';
              ctx.fillText(`UID: ${dev.uid}`, x + 70, y + 70);
              
              // Status indicator
              ctx.fillStyle = '#00ff88';
              ctx.beginPath();
              ctx.arc(x + 70, y + 100, 6, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
              ctx.fillStyle = palette.primary;
              ctx.fillText('ACTIVE', x + 85, y + 105);
            }
            
            currentY += (Math.ceil(devs.length / devsPerRow) * (cardHeight + 20)) + 40;
            
            // Statistics box with gradient
            const statsGradient = ctx.createLinearGradient(50, currentY, canvasWidth - 50, currentY + 80);
            statsGradient.addColorStop(0, palette.primary + '40');
            statsGradient.addColorStop(1, palette.secondary + '40');
            
            ctx.fillStyle = statsGradient;
            ctx.roundRect(50, currentY, canvasWidth - 100, 80, 15);
            ctx.fill();
            
            ctx.strokeStyle = palette.accent;
            ctx.lineWidth = 2;
            ctx.roundRect(50, currentY, canvasWidth - 100, 80, 15);
            ctx.stroke();
            
            ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.text;
            ctx.textAlign = 'center';
            ctx.fillText(`📊 TEAM STATISTICS: ${devs.length} DEVELOPERS`, canvasWidth / 2, currentY + 50);
            
            currentY += 120;
          }
        }
        else if (action === 'add') {
          // Success header with celebration
          ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = '#00ff88';
          ctx.textAlign = 'center';
          ctx.fillText('🎉 NEW DEVELOPER ADDED!', canvasWidth / 2, currentY);
          
          currentY += 60;
          
          // Success card with gradient
          const successGradient = ctx.createLinearGradient(100, currentY, canvasWidth - 100, currentY + 180);
          successGradient.addColorStop(0, '#00ff8840');
          successGradient.addColorStop(1, '#00ff8810');
          
          ctx.fillStyle = successGradient;
          ctx.roundRect(100, currentY, 800, 180, 20);
          ctx.fill();
          
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 3;
          ctx.roundRect(100, currentY, 800, 180, 20);
          ctx.stroke();
          
          // Success icon
          ctx.font = '80px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = '#00ff88';
          ctx.textAlign = 'center';
          ctx.fillText('✅', canvasWidth / 2, currentY + 100);
          
          currentY += 220;
          
          // Added users list
          if (targetUsers.length > 0) {
            const addedInfo = await Promise.all(targetUsers.map(uid => getUserInfo(uid)));
            
            ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.secondary;
            ctx.textAlign = 'left';
            ctx.fillText('Newly Added Developers:', 100, currentY);
            
            currentY += 40;
            
            ctx.font = '22px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.text;
            
            for (const user of addedInfo) {
              ctx.fillText(`• ${user.name} (${user.uid})`, 120, currentY);
              currentY += 35;
            }
          }
        }
        else if (action === 'remove') {
          // Removal header
          ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = '#ff5555';
          ctx.textAlign = 'center';
          ctx.fillText('🗑️ DEVELOPER REMOVED', canvasWidth / 2, currentY);
          
          currentY += 60;
          
          // Removal card
          const removeGradient = ctx.createLinearGradient(100, currentY, canvasWidth - 100, currentY + 180);
          removeGradient.addColorStop(0, '#ff555540');
          removeGradient.addColorStop(1, '#ff555510');
          
          ctx.fillStyle = removeGradient;
          ctx.roundRect(100, currentY, 800, 180, 20);
          ctx.fill();
          
          ctx.strokeStyle = '#ff5555';
          ctx.lineWidth = 3;
          ctx.roundRect(100, currentY, 800, 180, 20);
          ctx.stroke();
          
          // Removal icon
          ctx.font = '80px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = '#ff5555';
          ctx.textAlign = 'center';
          ctx.fillText('❌', canvasWidth / 2, currentY + 100);
          
          currentY += 220;
          
          // Removed users list
          if (targetUsers.length > 0) {
            const removedInfo = await Promise.all(targetUsers.map(uid => getUserInfo(uid)));
            
            ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.secondary;
            ctx.textAlign = 'left';
            ctx.fillText('Removed Developers:', 100, currentY);
            
            currentY += 40;
            
            ctx.font = '22px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.text;
            
            for (const user of removedInfo) {
              ctx.fillText(`• ${user.name} (${user.uid})`, 120, currentY);
              currentY += 35;
            }
          }
        }
        else {
          // Help/Commands display
          ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = palette.accent;
          ctx.textAlign = 'center';
          ctx.fillText('📖 COMMAND REFERENCE', canvasWidth / 2, currentY);
          
          currentY += 60;
          
          // Commands container
          ctx.fillStyle = palette.cardBg;
          ctx.roundRect(50, currentY, canvasWidth - 100, 400, 20);
          ctx.fill();
          
          ctx.strokeStyle = palette.primary;
          ctx.lineWidth = 2;
          ctx.roundRect(50, currentY, canvasWidth - 100, 400, 20);
          ctx.stroke();
          
          const commands = [
            { icon: '👥', cmd: '/dev list', desc: 'Show all active developers' },
            { icon: '➕', cmd: '/dev add [uid]', desc: 'Add developer by UID' },
            { icon: '➕', cmd: '/dev add @mention', desc: 'Add developer by mention' },
            { icon: '➕', cmd: '/dev add', desc: 'Add yourself as developer' },
            { icon: '➖', cmd: '/dev remove [uid]', desc: 'Remove developer by UID' },
            { icon: '➖', cmd: '/dev remove @mention', desc: 'Remove developer by mention' },
            { icon: '🎨', cmd: '/dev canvas', desc: 'Random colorful display' }
          ];
          
          let yPos = currentY + 60;
          
          for (const command of commands) {
            // Command icon
            ctx.font = '24px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.primary;
            ctx.textAlign = 'left';
            ctx.fillText(command.icon, 80, yPos);
            
            // Command
            ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.text;
            ctx.fillText(command.cmd, 120, yPos);
            
            // Description
            ctx.font = '22px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = palette.text + 'cc';
            ctx.fillText(command.desc, 350, yPos);
            
            yPos += 50;
          }
          
          currentY = yPos + 30;
          
          // Current theme info
          ctx.fillStyle = palette.primary + '30';
          ctx.roundRect(50, currentY, canvasWidth - 100, 80, 15);
          ctx.fill();
          
          ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
          ctx.fillStyle = palette.text;
          ctx.textAlign = 'center';
          ctx.fillText(`🎨 Current Theme: ${palette.name} | 👥 Developers: ${devs.length}`, canvasWidth / 2, currentY + 50);
          
          currentY += 100;
        }
        
        // Footer with gradient
        const footerGradient = ctx.createLinearGradient(0, canvasHeight - 80, canvasWidth, canvasHeight);
        footerGradient.addColorStop(0, palette.primary + '40');
        footerGradient.addColorStop(1, palette.secondary + '40');
        
        ctx.fillStyle = footerGradient;
        ctx.fillRect(0, canvasHeight - 80, canvasWidth, 80);
        
        // Footer text
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = palette.text;
        ctx.textAlign = 'center';
        ctx.fillText('⚡ GoatBot Developer System v4.0', canvasWidth / 2, canvasHeight - 45);
        
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = palette.text + 'cc';
        ctx.fillText('Every execution shows random colorful theme!', canvasWidth / 2, canvasHeight - 20);
        
        // Bottom decorative line
        ctx.fillStyle = palette.accent;
        ctx.fillRect(0, canvasHeight - 5, canvasWidth, 5);
        
        // Save the image
        const imagePath = path.join(__dirname, 'cache', `dev_colorful_${Date.now()}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(imagePath, buffer);
        
        return imagePath;
        
      } catch (error) {
        console.error("Error creating colorful canvas:", error);
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

    // ========= ALL COMMANDS RETURN COLORFUL IMAGES =========
    
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
      else if (sub === "canvas" || sub === "-c") {
        actionType = 'list'; // Canvas shows list in colorful way
      }
      
      // Get updated developers list if needed
      const currentDevs = targetUsers.length > 0 ? 
        await Promise.all(config.developer.map(uid => getUserInfo(uid))) : 
        devs;
      
      // Create colorful canvas
      imagePath = await createColorfulCanvas(currentDevs, actionType, targetUsers);
      
      // Create message based on action
      let messageText = '';
      switch(actionType) {
        case 'list':
          messageText = `🎨 ${palette.name} Theme | 👥 ${currentDevs.length} Developers`;
          break;
        case 'add':
          messageText = `✅ Added ${targetUsers.length} developer(s)!`;
          break;
        case 'remove':
          messageText = `❌ Removed ${targetUsers.length} developer(s)!`;
          break;
        default:
          messageText = `📖 Developer System | 🎨 ${palette.name} Theme`;
      }
      
      // Send the image
      await message.reply({
        body: messageText,
        attachment: fs.createReadStream(imagePath)
      });
      
      // Clean up after 5 seconds
      setTimeout(() => {
        try { fs.unlinkSync(imagePath); } catch (e) {}
      }, 5000);
      
    } catch (error) {
      console.error("Error in developer system:", error);
      return message.reply("❌ Error generating colorful image. Please try again.");
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
