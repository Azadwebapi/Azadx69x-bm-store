const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pending",
    version: "1.0.1",
    author: "Azad 💥", //author change korle tor marechudi 
    role: 2,
    shortDescription: { en: "pending manager with video" },
    category: "Admin"
  },

  langs: {
    en: {
      invalidNumber: `✦━━━━━━━━━━━━━━━━━✦   ⚠️ | 𝙏𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 *%1* 𝙞𝙨 𝙣𝙤𝙩 𝙫𝙖𝙡𝙞𝙙! 💫   ➪▮▭▭▭▭▭▭▭▭▮〄`,
      approveSuccess: `✦━━━━━━━━━━━━━━━━━✦

🌸 | 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙖𝙥𝙥𝙧𝙤𝙫𝙚𝙙 %1 𝙜𝙧𝙤𝙪𝙥(𝙨)! ✨
➪▮▭▭▭▭▭▭▭▭▮〄`,
      cancelSuccess: `✦━━━━━━━━━━━━━━━━━✦

💢 | 𝘾𝙖𝙣𝙘𝙚𝙡𝙡𝙚𝙙 %1 𝙜𝙧𝙤𝙪𝙥(𝙨)! ❌
➪▮▭▭▭▭▭▭▭▭▮〄`,
      returnListPending: `✦━━━━━━━━━━━━━━━━━✦

📜 | 𝙋𝙚𝙣𝙙𝙞𝙣𝙜 𝙂𝙧𝙤𝙪𝙥𝙨 (%1):
%2

🩷 𝙍𝙚𝙥𝙡𝙮 𝙬𝙞𝙩𝙝 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧(𝙨) 𝙩𝙤 𝙖𝙥𝙥𝙧𝙤𝙫𝙚
💢 𝙏𝙮𝙥𝙚 \`cancel <num>\` 𝙩𝙤 𝙧𝙚𝙟𝙚𝙘𝙩
➪▮▭▭▭▭▭▭▭▭▮〄`,
      returnListClean: `✦━━━━━━━━━━━━━━━━━✦

🌺 | 𝙉𝙤 𝙥𝙚𝙣𝙙𝙞𝙣𝙜 𝙂𝙧𝙤𝙪𝙥𝙨 𝙛𝙤𝙪𝙣𝙙! 💖
➪▮▭▭▭▭▭▭▭▭▮〄`
    }
  },

  onStart: async function ({ api, event, getLang }) {
    const { threadID, messageID } = event;
    try {
      // ✅ FIXED: merge BOTH PENDING + OTHER to catch all invites
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const other = await api.getThreadList(100, null, ["OTHER"]) || [];
      const list = [...pending, ...other].filter(g => g.isGroup);

      if (!list.length) return api.sendMessage(getLang("returnListClean"), threadID, messageID);

      const msg = list.map((g, i) => `🔹 ${i + 1}. 𝙉𝙖𝙢𝙚: *${g.name}* (\`${g.threadID}\`)`).join("\n");  
      return api.sendMessage(getLang("returnListPending", list.length, msg), threadID, (err, info) => {  
        global.GoatBot.onReply.set(info.messageID, {  
          commandName: "pending",  
          messageID: info.messageID,  
          author: event.senderID,  
          pending: list  
        });  
      }, messageID);  
    } catch (err) {  
      console.error(err);  
      return api.sendMessage("❌ | Failed to fetch pending groups!", threadID, messageID);  
    }
  },

  onReply: async function ({ api, event, Reply, getLang }) {
    if (event.senderID !== Reply.author) return;
    const { body, threadID, messageID } = event;

    if (body.toLowerCase().startsWith("c") || body.toLowerCase().startsWith("cancel")) {  
      const nums = body.replace(/^(c|cancel)/i, "").trim().split(/\s+/).map(n => parseInt(n));  
      let count = 0;  
      for (const n of nums) {  
        if (isNaN(n) || n <= 0 || n > Reply.pending.length) {
          await api.sendMessage(getLang("invalidNumber", n), threadID, messageID);
          continue;
        }
        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[n - 1].threadID);  
          count++;  
        } catch (err) {
          console.error(`❌ Failed to cancel group ${n}:`, err.message);
        }
      }  
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);  
    }  

    const index = body.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n) && n > 0 && n <= Reply.pending.length);  
    if (!index.length) return api.sendMessage("⚠️ | Invalid group number(s)! 💫", threadID, messageID);  

    const uptimeMs = process.uptime() * 1000;  
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));  
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));  
    const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);  
    const uptime = `${hours}h ${minutes}m ${seconds}s`;  

    let count = 0;  
    const videoUrl = "https://files.catbox.moe/qn8lrr.mp4";  
    const videoPath = path.join(__dirname, "cache", "pending.mp4");  
    await fs.ensureDir(path.join(__dirname, "cache"));  

    try {  
      const response = await axios.get(videoUrl, { responseType: "arraybuffer" });  
      fs.writeFileSync(videoPath, Buffer.from(response.data));  
    } catch (err) {  
      console.error("❌ Video download failed:", err.message);  
    }  

    for (const i of index) {  
      try {  
        const tID = Reply.pending[i - 1].threadID;  
        const threadInfo = await api.getThreadInfo(tID);  
        const groupName = threadInfo.threadName || "Unnamed Group";  
        const members = threadInfo.participantIDs.length;  
        const approval = threadInfo.approvalMode ? "🟢 On" : "🔴 Off";  
        const joined = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', hour12: true });  

        const text = `✦━━━━━━━━━━━━━━━━━✦
🌸 𝙉𝙖𝙢𝙚: ${groupName}   
🆔 𝙄𝘿: ${tID}   
👥 𝙈𝙚𝙢𝙗𝙚𝙧𝙨: ${members}   
🔒 𝘼𝙥𝙥𝙧𝙤𝙫𝙖𝙡: ${approval}   
⏰ 𝙅𝙤𝙞𝙣𝙚𝙙: ${joined}   
⚙️ 𝘽𝙤𝙩 𝙐𝙥𝙩𝙞𝙢𝙚: ${uptime}   
👑 𝙊𝙬𝙣𝙚𝙧: your'azad   
🔗 𝙁𝘽: https://www.facebook.com/profile.php?id=61578365162382   
➪▮▭▭▭▭▭▭▭▭▮〄   
🎬 𝙒𝙖𝙩𝙘𝙝 𝙩𝙝𝙚 𝙫𝙞𝙙𝙚𝙤 𝙗𝙚𝙡𝙤𝙬!`;

        await api.sendMessage({  
          body: text,  
          attachment: fs.existsSync(videoPath) ? fs.createReadStream(videoPath) : null  
        }, tID);  

        count++;  
      } catch (err) {  
        console.error(`❌ Failed to send to one group:`, err.message);  
      }  
    }  

    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);  
    return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
  }
};
