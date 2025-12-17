const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "ping",
    aliases: ["latency"],
    version: "1.6",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Ping background" },
    longDescription: { en: "Shows ping background" },
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    try {
      const start = Date.now();
      const temp = await api.sendMessage("⚡ping...", event.threadID);
      const ping = Date.now() - start;
      await api.unsendMessage(temp.messageID);

      const finalPing = ping;

      const width = 900;
      const height = 520;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#0f2027");
      bg.addColorStop(0.5, "#203a43");
      bg.addColorStop(1, "#2c5364");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.4})`;
        ctx.fill();
      }

      const cx = width / 2;
      const cy = height * 0.7;
      const radius = 240;
      
      const segments = 180;
      for (let i = 0; i < segments; i++) {
        const a1 = Math.PI + (i / segments) * Math.PI;
        const a2 = Math.PI + ((i + 1) / segments) * Math.PI;
        const t = i / segments;
        const r = Math.floor(20 + t * 220);
        const g = Math.floor(200 - t * 180);
        const b = 40;

        ctx.beginPath();
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 26;
        ctx.arc(cx, cy, radius, a1, a2);
        ctx.stroke();
      }
      
      const scaleValues = [0,100,200,300,400,500,600,700,800,900,1000];
      ctx.font = "16px Sans";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      scaleValues.forEach(val => {
        const angle = Math.PI + (val / 1000) * Math.PI;
        const tickX = cx + Math.cos(angle) * (radius + 10);
        const tickY = cy + Math.sin(angle) * (radius + 10);
        const textX = cx + Math.cos(angle) * (radius + 30);
        const textY = cy + Math.sin(angle) * (radius + 30);

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.moveTo(tickX, tickY);
        ctx.lineTo(cx + Math.cos(angle) * (radius - 10), cy + Math.sin(angle) * (radius - 10));
        ctx.stroke();

        ctx.fillText(val.toString(), textX, textY);
      });
      
      const maxPing = 1000;
      const clampedPing = Math.min(finalPing, maxPing);
      const needleAngle = Math.PI + (clampedPing / maxPing) * Math.PI;
      const nx = cx + Math.cos(needleAngle) * (radius - 70);
      const ny = cy + Math.sin(needleAngle) * (radius - 70);

      ctx.beginPath();
      ctx.lineWidth = 8;
      ctx.strokeStyle = clampedPing < 200 ? "lime" : clampedPing < 500 ? "yellow" : "red";
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.fillStyle = "#000";
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.font = "bold 70px Sans";
      ctx.fillStyle = "#00ffff";
      ctx.textAlign = "center";
      ctx.fillText(`${finalPing} ms`, cx, cy + 120);
      
      const buffer = canvas.toBuffer("image/png");
      const filePath = path.join(__dirname, "ping_card.png");
      await fs.promises.writeFile(filePath, buffer);

      await api.sendMessage(
        { attachment: fs.createReadStream(filePath) },
        event.threadID,
        event.messageID
      );

      fs.unlinkSync(filePath);

    } catch (err) {
      await api.sendMessage(`❌ Ping command error: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
