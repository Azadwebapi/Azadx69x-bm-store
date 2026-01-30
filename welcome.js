const {
    createCanvas,
    loadImage,
    Image
} = require('canvas');
const fs = require('fs-extra');
const path = require('path');

// Modern design templates
const templates = [
    {
        name: "Gradient Blur",
        bgColor: '#0f172a',
        colors: ['#6366f1', '#8b5cf6', '#ec4899'],
        style: 'gradient'
    },
    {
        name: "Cyber Grid",
        bgColor: '#000814',
        colors: ['#00f5d4', '#ff006e', '#fb5607'],
        style: 'cyber'
    },
    {
        name: "Neon Glow",
        bgColor: '#1a1a2e',
        colors: ['#00ff88', '#00ccff', '#ff00ff'],
        style: 'neon'
    },
    {
        name: "Sunset Mesh",
        bgColor: '#1e1b4b',
        colors: ['#f97316', '#eab308', '#db2777'],
        style: 'mesh'
    },
    {
        name: "Abstract Waves",
        bgColor: '#0c4a6e',
        colors: ['#38bdf8', '#22d3ee', '#2dd4bf'],
        style: 'wave'
    },
    {
        name: "Matrix Code",
        bgColor: '#000000',
        colors: ['#10b981', '#22c55e', '#84cc16'],
        style: 'matrix'
    },
    {
        name: "Purple Haze",
        bgColor: '#2e1065',
        colors: ['#a855f7', '#d946ef', '#f0abfc'],
        style: 'haze'
    }
];

// Helper functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

async function drawTemplateBackground(ctx, width, height, template) {
    const { bgColor, colors, style } = template;
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    switch(style) {
        case 'gradient':
            drawGradientBackground(ctx, width, height, colors);
            break;
        case 'cyber':
            drawCyberGrid(ctx, width, height, colors);
            break;
        case 'neon':
            drawNeonGlow(ctx, width, height, colors);
            break;
        case 'mesh':
            drawMeshGradient(ctx, width, height, colors);
            break;
        case 'wave':
            drawWavePattern(ctx, width, height, colors);
            break;
        case 'matrix':
            drawMatrixEffect(ctx, width, height, colors);
            break;
        case 'haze':
            drawPurpleHaze(ctx, width, height, colors);
            break;
    }
}

function drawGradientBackground(ctx, width, height, colors) {
    const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width
    );
    
    gradient.addColorStop(0, `${colors[0]}20`);
    gradient.addColorStop(0.5, `${colors[1]}10`);
    gradient.addColorStop(1, `${colors[2]}05`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add blur circles
    for(let i = 0; i < 8; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 200 + 100;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const circleGradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, radius
        );
        circleGradient.addColorStop(0, `${color}30`);
        circleGradient.addColorStop(1, `${color}00`);
        
        ctx.fillStyle = circleGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCyberGrid(ctx, width, height, colors) {
    // Grid lines
    ctx.strokeStyle = `${colors[0]}20`;
    ctx.lineWidth = 1;
    
    // Vertical lines
    for(let x = 0; x <= width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for(let y = 0; y <= height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Animated dots effect
    for(let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 4 + 1;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    // Diagonal lines
    ctx.strokeStyle = `${colors[1]}15`;
    for(let i = -height; i < width * 2; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
    }
}

function drawNeonGlow(ctx, width, height, colors) {
    // Multiple glow layers
    const layers = 5;
    
    for(let layer = 0; layer < layers; layer++) {
        const offset = layer * 20;
        const gradient = ctx.createLinearGradient(
            0, offset,
            width, height - offset
        );
        
        gradient.addColorStop(0, `${colors[0]}${10 + layer * 3}`);
        gradient.addColorStop(0.5, `${colors[1]}${10 + layer * 3}`);
        gradient.addColorStop(1, `${colors[2]}${10 + layer * 3}`);
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.1;
        ctx.fillRect(0, 0, width, height);
    }
    
    ctx.globalAlpha = 1;
    
    // Neon tubes effect
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 3;
    ctx.shadowColor = colors[0];
    ctx.shadowBlur = 20;
    
    // Border glow
    ctx.strokeRect(20, 20, width - 40, height - 40);
    ctx.shadowBlur = 0;
}

function drawWavePattern(ctx, width, height, colors) {
    // Wave pattern
    ctx.strokeStyle = `${colors[0]}30`;
    ctx.lineWidth = 2;
    
    for(let i = 0; i < height; i += 40) {
        ctx.beginPath();
        for(let x = 0; x <= width; x += 10) {
            const y = i + Math.sin(x * 0.05 + i * 0.1) * 20;
            if(x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Overlay gradient
    const overlay = ctx.createLinearGradient(0, 0, 0, height);
    colors.forEach((color, index) => {
        overlay.addColorStop(index / colors.length, `${color}10`);
    });
    
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);
}

async function drawUserCard(ctx, userImg, userName, position, width, height, colors) {
    const { x, y, size, type } = position;
    
    try {
        const img = await loadImage(userImg);
        
        // Create circular mask
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Draw image
        ctx.drawImage(img, x - size, y - size, size * 2, size * 2);
        ctx.restore();
        
        // Border with glow
        ctx.strokeStyle = colors[0];
        ctx.lineWidth = 4;
        ctx.shadowColor = colors[0];
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Name tag
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = colors[1];
        ctx.textAlign = 'center';
        
        if(type === 'main') {
            ctx.fillText(userName, x, y + size + 35);
        } else if(type === 'addedBy') {
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.fillText('Added by', x, y + size + 25);
            ctx.fillText(userName, x, y + size + 45);
        } else {
            ctx.fillText(userName, x, y + size + 25);
        }
        
    } catch (err) {
        // Fallback avatar
        ctx.fillStyle = colors[2];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Initial letter
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(userName.charAt(0).toUpperCase(), x, y);
    }
}

function drawTextEffects(ctx, text, x, y, colors, style = 'normal') {
    const baseFont = 'bold 48px "Segoe UI", "Arial Rounded MT Bold", Arial, sans-serif';
    
    switch(style) {
        case 'gradient':
            ctx.font = baseFont;
            const gradient = ctx.createLinearGradient(x - 150, y, x + 150, y);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(0.5, colors[1]);
            gradient.addColorStop(1, colors[2]);
            ctx.fillStyle = gradient;
            ctx.fillText(text, x, y);
            break;
            
        case 'glow':
            ctx.font = baseFont;
            ctx.shadowColor = colors[0];
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, x, y);
            ctx.shadowBlur = 0;
            break;
            
        case 'stroke':
            ctx.font = baseFont;
            ctx.strokeStyle = colors[0];
            ctx.lineWidth = 3;
            ctx.strokeText(text, x, y);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, x, y);
            break;
            
        case 'double':
            ctx.font = baseFont;
            // Shadow layer
            ctx.fillStyle = colors[1];
            ctx.fillText(text, x + 3, y + 3);
            // Main layer
            ctx.fillStyle = colors[0];
            ctx.fillText(text, x, y);
            break;
    }
}

async function createModernWelcome(gcImg, userImg, adderImg, userName, userNumber, threadName, adderName) {
    const width = 1200;
    const height = 700; // Slightly taller for modern layout
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Random template selection
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Draw template background
    await drawTemplateBackground(ctx, width, height, template);
    
    // Load images in parallel
    const imagePromises = [
        loadImage(gcImg).catch(() => null),
        loadImage(userImg).catch(() => null),
        loadImage(adderImg).catch(() => null)
    ];
    
    const [gcImage, userImage, adderImage] = await Promise.all(imagePromises);
    
    // Main layout
    const layoutType = Math.floor(Math.random() * 3); // 3 different layouts
    
    switch(layoutType) {
        case 0: // Centered layout
            // Group icon top center
            if(gcImage) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(width / 2, 150, 80, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(gcImage, width / 2 - 80, 70, 160, 160);
                ctx.restore();
                
                // Glow border
                ctx.strokeStyle = template.colors[0];
                ctx.lineWidth = 5;
                ctx.shadowColor = template.colors[0];
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(width / 2, 150, 85, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            
            // Welcome text
            ctx.font = 'bold 68px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = template.colors[1];
            ctx.textAlign = 'center';
            ctx.fillText('WELCOME', width / 2, 300);
            
            // User name with effect
            drawTextEffects(ctx, userName, width / 2, 380, template.colors, 'gradient');
            
            // To group text
            ctx.font = '32px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(`to ${threadName}`, width / 2, 440);
            
            // User image left
            if(userImage) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(200, 550, 60, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(userImage, 140, 490, 120, 120);
                ctx.restore();
            }
            
            // Adder image right
            if(adderImage) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(width - 200, 550, 50, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(adderImage, width - 250, 500, 100, 100);
                ctx.restore();
            }
            
            // Member info
            ctx.font = '24px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = template.colors[2];
            ctx.fillText(`Member #${userNumber} • Added by ${adderName}`, width / 2, 520);
            
            break;
            
        case 1: // Asymmetrical layout
            // Left side group icon
            if(gcImage) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(200, height / 2, 90, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(gcImage, 110, height / 2 - 90, 180, 180);
                ctx.restore();
            }
            
            // Right side content
            ctx.textAlign = 'left';
            ctx.fillStyle = template.colors[0];
            ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
            ctx.fillText('NEW MEMBER', 400, 200);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 56px "Segoe UI", Arial, sans-serif';
            ctx.fillText(userName, 400, 280);
            
            ctx.fillStyle = template.colors[1];
            ctx.font = '32px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`joined ${threadName}`, 400, 340);
            
            // User image
            if(userImage) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(900, 300, 70, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(userImage, 830, 230, 140, 140);
                ctx.restore();
            }
            
            // Bottom info bar
            ctx.fillStyle = `${template.colors[2]}20`;
            ctx.fillRect(0, height - 120, width, 120);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`#${userNumber}`, width / 4, height - 60);
            
            ctx.fillText(adderName, width * 3/4, height - 60);
            
            ctx.font = '20px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('MEMBER NUMBER', width / 4, height - 90);
            ctx.fillText('ADDED BY', width * 3/4, height - 90);
            
            break;
            
        case 2: // Card layout
            // Main card
            ctx.fillStyle = '#1e293b90';
            ctx.beginPath();
            ctx.roundRect(100, 100, width - 200, height - 200, 30);
            ctx.fill();
            
            // Card border
            ctx.strokeStyle = template.colors[0];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(100, 100, width - 200, height - 200, 30);
            ctx.stroke();
            
            // Center content
            ctx.textAlign = 'center';
            
            // Welcome badge
            ctx.fillStyle = template.colors[1];
            ctx.beginPath();
            ctx.roundRect(width / 2 - 120, 140, 240, 50, 25);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
            ctx.fillText('🎉 WELCOME 🎉', width / 2, 175);
            
            // User info
            if(userImage) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(width / 2, 280, 80, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(userImage, width / 2 - 80, 200, 160, 160);
                ctx.restore();
            }
            
            ctx.fillStyle = template.colors[2];
            ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
            ctx.fillText(userName, width / 2, 400);
            
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '28px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`to ${threadName}`, width / 2, 450);
            
            // Bottom section
            ctx.fillStyle = '#0f172a60';
            ctx.beginPath();
            ctx.roundRect(150, 500, width - 300, 80, 20);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`Member #${userNumber}`, width / 3, 545);
            ctx.fillText(`Added by ${adderName}`, width * 2/3, 545);
            
            break;
    }
    
    // Add template name watermark
    ctx.fillStyle = '#ffffff20';
    ctx.font = '14px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Theme: ${template.name}`, width - 20, height - 20);
    
    return canvas.toBuffer('image/png');
}

// Add roundRect to CanvasRenderingContext2D
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    }
}

module.exports = {
    config: {
        name: "welcome",
        version: "3.0",
        author: "Azadx69x",
        category: "events"
    },

    onStart: async ({ threadsData, event, message, usersData, api }) => {
        const type = "log:subscribe";
        if (event.logMessageType !== type) return;
        
        try {
            // Get all data in parallel for speed
            const threadID = event.threadID;
            const addedUser = event.logMessageData.addedParticipants[0];
            const addedUserId = addedUser.userFbId;
            const adderId = event.author;
            
            const [threadInfo, userAvatar, adderAvatar, userName, adderName] = await Promise.all([
                threadsData.get(threadID),
                usersData.getAvatarUrl(addedUserId),
                usersData.getAvatarUrl(adderId),
                Promise.resolve(addedUser.fullName),
                usersData.getName(adderId)
            ]);
            
            const groupImage = threadInfo.imageSrc || 
                'https://i.imgur.com/7Qk8k6c.png'; // Default group image
            const threadName = threadInfo.threadName || "Group Chat";
            const memberCount = threadInfo.members?.length || 1;
            
            // Create welcome image
            const imageBuffer = await createModernWelcome(
                groupImage,
                userAvatar,
                adderAvatar,
                userName,
                memberCount,
                threadName,
                adderName
            );
            
            // Send the image
            const tempPath = path.join(__dirname, 'temp_welcome.png');
            fs.writeFileSync(tempPath, imageBuffer);
            
            await message.reply({
                body: `✨ Welcome ${userName} to ${threadName}! ✨\nYou're our ${memberCount}th member! 🎉`,
                attachment: fs.createReadStream(tempPath)
            });
            
            // Cleanup
            setTimeout(() => {
                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }
            }, 3000);
            
        } catch (error) {
            console.error('[WELCOME] Error:', error);
            
            // Fallback simple welcome
            const addedUser = event.logMessageData.addedParticipants[0];
            await message.send(
                `🎉 Welcome ${addedUser.fullName} to the group! 🎉\n` +
                `Hope you enjoy your stay here! 😊`
            );
        }
    }
};
