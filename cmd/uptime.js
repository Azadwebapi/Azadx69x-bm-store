const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["ping", "upt"],
    version: "3.8",
    author: "Azadx69x",//Author change korle tor marechudi 
    countDown: 5,
    role: 0,
    shortDescription: "Show bot uptime in image",
    longDescription: "Generate a high-quality image that shows bot uptime, ping, and owner",
    category: "system",
    guide: "{p}uptime"
  },

  onStart: async function ({ message }) {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

    const start = Date.now();
    const tempMsg = await message.reply({ body: "⚡ Generating uptime..." });
    const ping = Date.now() - start;

    const canvas = Canvas.createCanvas(1000, 500);
    const ctx = canvas.getContext("2d");

    const bgUrl = "https://i.imgur.com/DEWxbDN.png";
    const bgImg = await Canvas.loadImage(bgUrl);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(0,0,0,0.25)");
    gradient.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 8;

    const leftMargin = 50;
    let startY = 120;

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 60px Sans";
    ctx.fillText("🤖 Bot Uptime", leftMargin, startY);

    ctx.fillStyle = "#F0F0F0";
    ctx.font = "bold 40px Sans";
    startY += 100;

    const infoTexts = [
      `⏳ Uptime: ${uptimeStr}`,
      `📶 Ping: ${ping} ms`,
      `👑 Owner: Azadx69x`
    ];

    infoTexts.forEach(text => {
      ctx.fillText(text, leftMargin, startY);
      startY += 80;
    });

    const filePath = path.join(__dirname, `uptime-${Date.now()}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    await message.reply({
      body: "",
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);
    await tempMsg.delete();
  }
};
