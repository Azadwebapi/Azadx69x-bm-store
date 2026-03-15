const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

function roundRect(ctx, x, y, width, height, radius) {
    if (typeof radius === "number") {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
}

function formatNumber(num) {
    if (!num || isNaN(num)) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatMoney(num) {
    if (!num || num === 0) return "0";
    if (num < 1000) return num.toString();
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi"];
    const exp = Math.floor(Math.log(num) / Math.log(1000));
    const value = (num / Math.pow(1000, exp)).toFixed(1);
    return value.replace(/\.0$/, '') + suffixes[Math.min(exp, suffixes.length - 1)];
}

function expToLevel(exp) {
    if (!exp || exp <= 0) return 1;
    return Math.floor(Math.sqrt(2 * exp / 5)) + 1;
}

function expForNextLevel(level) {
    return ((level) * (level + 1) * 5) / 2;
}

function expForCurrentLevel(level) {
    if (level <= 1) return 0;
    return ((level - 1) * level * 5) / 2;
}

function getGradientColors(level) {
    if (level >= 100) return ['#FF0080', '#FF8C00', '#FFE500'];
    if (level >= 50) return ['#00C9FF', '#92FE9D', '#00C9FF'];
    if (level >= 30) return ['#667eea', '#764ba2', '#667eea'];
    if (level >= 10) return ['#f093fb', '#f5576c', '#f093fb'];
    return ['#4facfe', '#00f2fe', '#4facfe'];
}

async function loadAvatar(uid) {
    try {
        let imageBuffer;
        const fbUrls = [
            `https://graph.facebook.com/${uid}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            `https://graph.facebook.com/${uid}/picture?width=500&height=500`,
            `https://graph.facebook.com/${uid}/picture?type=large`,
        ];

        for (const url of fbUrls) {
            try {
                const response = await axios.get(url, {
                    responseType: "arraybuffer",
                    timeout: 5000,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        Accept: "image/*",
                    },
                });
                if (response.status === 200 && response.data) {
                    imageBuffer = Buffer.from(response.data);
                    break;
                }
            } catch (err) {
                continue;
            }
        }

        if (imageBuffer) return await loadImage(imageBuffer);
    } catch (err) {
        console.log("Avatar load failed");
    }

    return null;
}

function createDefaultAvatar(name) {
    const canvas = createCanvas(300, 300);
    const ctx = canvas.getContext("2d");
    
    const gradient = ctx.createLinearGradient(0, 0, 300, 300);
    gradient.addColorStop(0, '#4facfe');
    gradient.addColorStop(1, '#00f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 300);
    
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(150, 150, 120, 0, Math.PI * 2);
    ctx.fill();
    
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px "Segoe UI", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, 150, 150);
    
    return canvas;
}

module.exports = {
    config: {
        name: "rank",
        aliases: ["profile", "me", "info", "card"],
        version: "3.1",
        author: "Azadx69x",
        countDown: 5,
        shortDescription: { en: "Beautiful modern rank card" },
        longDescription: { en: "Display stylish profile card with modern design" },
        category: "info",
    },

    onStart: async function ({ event, message, usersData, args, api, threadsData }) {
        try {
            let targetUID;
            if (Object.keys(event.mentions).length > 0) {
                targetUID = Object.keys(event.mentions)[0];
            } else if (args[0] && /^\d+$/.test(args[0])) {
                targetUID = args[0];
            } else if (event.messageReply) {
                targetUID = event.messageReply.senderID;
            } else {
                targetUID = event.senderID;
            }

            const waitMsg = await message.reply("✨ Creating your beautiful rank card...");

            const userData = await usersData.get(targetUID);
            const allUsers = await usersData.getAll();

            // Get message count
            let messages = 0;
            try {
                const threadData = await threadsData.get(event.threadID);
                const memberData = threadData.members.find(m => m.userID === targetUID);
                messages = memberData?.count || 0;
            } catch {}

            // Get user info
            let name = userData.name || "User";
            let username = "";
            try {
                const info = (await api.getUserInfo(targetUID))[targetUID];
                if (info) {
                    if (info.name) name = info.name;
                    username = info.vanity ? `@${info.vanity}` : "";
                }
            } catch {}

            // Get gender
            let gender = "Not specified";
            if (userData.gender !== undefined) {
                const g = String(userData.gender).toLowerCase();
                if (g === "female" || g === "f" || g === "1") {
                    gender = "Female";
                } else if (g === "male" || g === "m" || g === "2") {
                    gender = "Male";
                }
            }

            // Calculate stats
            const exp = parseInt(userData.exp) || 0;
            const money = parseInt(userData.money) || 0;
            const level = expToLevel(exp);
            
            // Get gradient colors based on level
            const gradientColors = getGradientColors(level);
            
            // Calculate ranks
            const sortedByExp = [...allUsers].sort((a, b) => (b.exp || 0) - (a.exp || 0));
            const expRank = sortedByExp.findIndex(u => u.userID === targetUID) + 1;
            
            const sortedByMoney = [...allUsers].sort((a, b) => (b.money || 0) - (a.money || 0));
            const moneyRank = sortedByMoney.findIndex(u => u.userID === targetUID) + 1;

            // Check VIP
            const vipList = (
                global.GoatBot?.config?.vipuser ||
                global.GoatBot?.config?.vipUser ||
                global.GoatBot?.config?.vip ||
                []
            ).map(String);
            const isVIP = vipList.includes(String(targetUID));

            // Commands used
            const commandsUsed = parseInt(userData.commandUsed) || 
                                parseInt(userData.cmdCount) || 
                                parseInt(userData.commands) || 0;

            // Load avatar
            let avatar = await loadAvatar(targetUID);
            if (!avatar) avatar = createDefaultAvatar(name);

            // Create canvas
            const width = 1000;
            const height = 600;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext("2d");

            // Modern gradient background
            const bgGradient = ctx.createLinearGradient(0, 0, width, height);
            bgGradient.addColorStop(0, '#1a1a2e');
            bgGradient.addColorStop(0.5, '#16213e');
            bgGradient.addColorStop(1, '#0f3460');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            // Abstract shapes
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(200 + i * 200, 100 + i * 80, 150, 0, Math.PI * 2);
                ctx.fill();
            }

            // Main card with glass morphism effect
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 5;
            
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;
            roundRect(ctx, 30, 30, width - 60, height - 60, 30);
            ctx.fill();
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Inner glow
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            roundRect(ctx, 32, 32, width - 64, height - 64, 28);
            ctx.stroke();

            // ========== LEFT SIDE - PROFILE SECTION ==========
            
            // Avatar with gradient border
            ctx.save();
            ctx.shadowColor = gradientColors[0];
            ctx.shadowBlur = 25;
            
            ctx.beginPath();
            ctx.arc(200, 150, 95, 0, Math.PI * 2);
            ctx.strokeStyle = gradientColors[0];
            ctx.lineWidth = 4;
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            
            ctx.beginPath();
            ctx.arc(200, 150, 90, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, 110, 60, 180, 180);
            ctx.restore();

            // Level badge
            ctx.save();
            ctx.shadowColor = gradientColors[1];
            ctx.shadowBlur = 15;
            
            const badgeGradient = ctx.createLinearGradient(150, 230, 250, 280);
            badgeGradient.addColorStop(0, gradientColors[0]);
            badgeGradient.addColorStop(1, gradientColors[2]);
            
            ctx.beginPath();
            ctx.arc(200, 250, 35, 0, Math.PI * 2);
            ctx.fillStyle = badgeGradient;
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 22px "Segoe UI", Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`LV ${level}`, 200, 250);
            ctx.restore();

            // User name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px "Segoe UI", Arial';
            ctx.textAlign = 'left';
            ctx.fillText(name.length > 20 ? name.substring(0, 18) + '...' : name, 280, 100);
            
            // Username
            if (username) {
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.font = '16px "Segoe UI", Arial';
                ctx.fillText(username, 280, 135);
            }

            // ID badge
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            roundRect(ctx, 280, 150, 200, 30, 15);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(targetUID, 380, 171);

            // Stats grid (4 items in 2x2 grid)
            const stats = [
                { label: 'Messages', value: formatNumber(messages), icon: '💬', iconColor: gradientColors[0] },
                { label: 'Commands', value: formatNumber(commandsUsed), icon: '⚡', iconColor: gradientColors[1] },
                { label: 'Gender', value: gender, icon: '👤', iconColor: gradientColors[2] },
                { label: 'Joined', value: moment(userData.createdAt || Date.now()).format('MMM DD'), icon: '📅', iconColor: gradientColors[0] }
            ];

            // Row 1
            let statY = 310;
            
            // Message stat
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            roundRect(ctx, 100, statY - 25, 180, 60, 12);
            ctx.fill();
            
            ctx.fillStyle = stats[0].iconColor;
            ctx.font = '24px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(stats[0].icon, 115, statY);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px "Segoe UI", Arial';
            ctx.fillText(stats[0].label, 150, statY - 10);
            
            ctx.fillStyle = stats[0].iconColor;
            ctx.font = 'bold 20px "Segoe UI", Arial';
            ctx.fillText(stats[0].value, 150, statY + 15);

            // Commands stat
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            roundRect(ctx, 300, statY - 25, 180, 60, 12);
            ctx.fill();
            
            ctx.fillStyle = stats[1].iconColor;
            ctx.font = '24px Arial';
            ctx.fillText(stats[1].icon, 315, statY);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px "Segoe UI", Arial';
            ctx.fillText(stats[1].label, 350, statY - 10);
            
            ctx.fillStyle = stats[1].iconColor;
            ctx.font = 'bold 20px "Segoe UI", Arial';
            ctx.fillText(stats[1].value, 350, statY + 15);

            statY += 80;

            // Row 2
            // Gender stat
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            roundRect(ctx, 100, statY - 25, 180, 60, 12);
            ctx.fill();
            
            ctx.fillStyle = stats[2].iconColor;
            ctx.font = '24px Arial';
            ctx.fillText(stats[2].icon, 115, statY);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px "Segoe UI", Arial';
            ctx.fillText(stats[2].label, 150, statY - 10);
            
            ctx.fillStyle = stats[2].iconColor;
            ctx.font = 'bold 20px "Segoe UI", Arial';
            ctx.fillText(stats[2].value, 150, statY + 15);

            // Joined stat
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            roundRect(ctx, 300, statY - 25, 180, 60, 12);
            ctx.fill();
            
            ctx.fillStyle = stats[3].iconColor;
            ctx.font = '24px Arial';
            ctx.fillText(stats[3].icon, 315, statY);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px "Segoe UI", Arial';
            ctx.fillText(stats[3].label, 350, statY - 10);
            
            ctx.fillStyle = stats[3].iconColor;
            ctx.font = 'bold 20px "Segoe UI", Arial';
            ctx.fillText(stats[3].value, 350, statY + 15);

            // ========== RIGHT SIDE - RANK INFO ==========
            
            ctx.fillStyle = gradientColors[0];
            ctx.font = 'bold 32px "Segoe UI", Arial';
            ctx.textAlign = 'left';
            ctx.fillText('RANK', 600, 80);
            
            ctx.strokeStyle = gradientColors[1];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(600, 95);
            ctx.lineTo(900, 95);
            ctx.stroke();

            // Rank cards (4 in 2x2 grid)
            const rankStats = [
                { label: 'EXP Rank', value: `#${expRank || 'N/A'}`, color: gradientColors[0] },
                { label: 'Money Rank', value: `#${moneyRank || 'N/A'}`, color: gradientColors[1] },
                { label: 'Level', value: level, color: gradientColors[2] },
                { label: 'VIP', value: isVIP ? 'ACTIVE' : 'STANDARD', color: isVIP ? '#FFD700' : '#95A5A6' }
            ];

            let rankX = 600;
            let rankY = 130;
            
            rankStats.forEach((stat, index) => {
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                roundRect(ctx, rankX, rankY, 130, 100, 15);
                ctx.fill();
                
                ctx.strokeStyle = stat.color;
                ctx.lineWidth = 2;
                roundRect(ctx, rankX, rankY, 130, 100, 15);
                ctx.stroke();
                
                ctx.fillStyle = stat.color;
                ctx.font = 'bold 18px "Segoe UI", Arial';
                ctx.textAlign = 'center';
                ctx.fillText(stat.label, rankX + 65, rankY + 30);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 28px "Segoe UI", Arial';
                ctx.fillText(stat.value, rankX + 65, rankY + 70);
                
                rankX += 150;
                if ((index + 1) % 2 === 0) {
                    rankX = 600;
                    rankY += 130;
                }
            });

            // Money display
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            roundRect(ctx, 600, 390, 280, 70, 20);
            ctx.fill();
            
            ctx.fillStyle = gradientColors[0];
            ctx.font = '40px "Segoe UI", Arial';
            ctx.textAlign = 'left';
            ctx.fillText('💰', 620, 440);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px "Segoe UI", Arial';
            ctx.fillText('Total Balance', 680, 410);
            
            ctx.fillStyle = gradientColors[2];
            ctx.font = 'bold 30px "Segoe UI", Arial';
            ctx.fillText(`$${formatMoney(money)}`, 680, 450);

            // Progress bar
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px "Segoe UI", Arial';
            ctx.fillText('Progress to Next Level', 600, 490);

            const currExp = expForCurrentLevel(level);
            const nextExp = expForNextLevel(level);
            const progress = Math.max(0, exp - currExp);
            const needed = nextExp - currExp;
            const percent = needed > 0 ? Math.min(100, (progress / needed) * 100) : 100;

            // Progress bar background
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            roundRect(ctx, 600, 500, 330, 15, 8);
            ctx.fill();

            // Progress bar fill
            if (percent > 0) {
                const barWidth = (330 * percent) / 100;
                const barGradient = ctx.createLinearGradient(600, 0, 600 + barWidth, 0);
                barGradient.addColorStop(0, gradientColors[0]);
                barGradient.addColorStop(1, gradientColors[2]);
                
                ctx.fillStyle = barGradient;
                roundRect(ctx, 600, 500, barWidth, 15, 8);
                ctx.fill();
            }

            // Progress text
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px "Segoe UI", Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${formatNumber(progress)} / ${formatNumber(needed)} EXP`, 765, 530);

            // Footer
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '11px "Segoe UI", Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Generated on ${moment().format('DD MMM YYYY, HH:mm')}`, 500, 570);

            // Save and send
            const tmpPath = path.join(__dirname, "tmp");
            if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath, { recursive: true });
            const imagePath = path.join(tmpPath, `rank_${targetUID}_${Date.now()}.png`);

            fs.writeFileSync(imagePath, canvas.toBuffer('image/png'));

            // Delete wait message
            await message.unsend(waitMsg.messageID);

            // Send final message
            await message.reply({
                body: `╔════════════════════╗\n║    RANK CARD    ║\n╚════════════════════╝\n\nName: ${name}\nLevel: ${level}\nEXP Rank: #${expRank || 'N/A'}\nMoney: $${formatMoney(money)}\nVIP: ${isVIP ? 'Yes' : 'No'}`,
                attachment: fs.createReadStream(imagePath)
            });

            // Cleanup
            setTimeout(() => {
                try { fs.unlinkSync(imagePath); } catch {}
            }, 15000);

        } catch (err) {
            console.error("Rank command error:", err);
            await message.reply(`Error: ${err.message}`);
        }
    }
};
