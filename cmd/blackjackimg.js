const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "blackjackimg",
    aliases: ["bg"],
    version: "1.0",
    author: "Azadx69x",
    role: 0,
    category: "game",
    shortDescription: "Blackjack image with win/loss and money. Use '/bg <amount>'",
    guide: { en: "{pn} <bet>" }
  },

  onStart: async function({ message, args, api, event }) {
    const bet = parseInt(args[0], 10);
    if (!bet || isNaN(bet) || bet <= 0) {
      return api.sendMessage(
        "🔴 𝗘𝗥𝗥𝗢𝗥: Please enter a valid bet amount!",
        event.threadID
      );
    }

    const loadingMessage = await api.sendMessage(
      "⚡ Try your luck Blackjack game...",
      event.threadID
    );

    const width = 1000;
    const height = 500;
    const cardWidth = 120;
    const cardHeight = 80;
    const padding = 40;

    const dealerPositions = [];
    const playerPositions = [];
    for (let i = 0; i < 7; i++) {
      dealerPositions.push([padding + i*(cardWidth + 15), padding]);
      playerPositions.push([padding + i*(cardWidth + 15), height - cardHeight - padding]);
    }

    const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    const suits = ["S","H","D","C","★","♣","♥","♦","♟️","♠️"];
    const suitColors = {
      S:"#000000", H:"#FF4D4F", D:"#FF4500", C:"#0000FF",
      "★":"#FFD700", "♣":"#228B22", "♥":"#FF1493", "♦":"#00CED1",
      "♟️":"#8B4513", "♠️":"#2F4F4F"
    };

    const getRandomCard = () => ({
      rank: ranks[Math.floor(Math.random()*ranks.length)],
      suit: suits[Math.floor(Math.random()*suits.length)]
    });

    const dealerCards = Array.from({length:7}, getRandomCard);
    const playerCards = Array.from({length:7}, getRandomCard);

    const isWin = Math.random() < 0.5;
    const resultText = isWin ? "WIN" : "LOSE";
    const wonAmount = isWin ? bet*2 : 0;
    const lostAmount = isWin ? 0 : bet;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const loadCardImage = async card => {
      try {
        return await loadImage(`https://raw.githubusercontent.com/azad-s-api-web/cards/main/${card.suit}_${card.rank}.png`);
      } catch {
        return null;
      }
    };

    const drawCards = async (cards, positions) => {
      for (let i = 0; i < cards.length; i++) {
        const img = await loadCardImage(cards[i]);
        const [x, y] = positions[i];

        if (img) {    
          ctx.drawImage(img, x, y, cardWidth, cardHeight);    
        } else {    
          ctx.fillStyle = "#fff";    
          ctx.fillRect(x, y, cardWidth, cardHeight);    
          ctx.strokeStyle = "#000";    
          ctx.lineWidth = 2;    
          ctx.strokeRect(x, y, cardWidth, cardHeight);    
          ctx.fillStyle = suitColors[cards[i].suit] || "#000";    
          ctx.font = "bold 28px Arial";    
          ctx.textAlign = "left";    
          ctx.textBaseline = "top";    
          ctx.fillText(cards[i].rank, x + 8, y + 4);    
          ctx.font = "24px Arial";    
          ctx.fillText(cards[i].suit, x + 8, y + 32);    
          ctx.font = "bold 48px Arial";    
          ctx.textAlign = "center";    
          ctx.textBaseline = "middle";    
          ctx.fillText(cards[i].suit, x + cardWidth / 2, y + cardHeight / 2);    
        }
      }
    };

    const grad = ctx.createLinearGradient(0,0,0,height);
    grad.addColorStop(0,"#0c3b2e");
    grad.addColorStop(1,"#083026");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,width,height);

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(padding-5, padding-5, width - 2*padding + 10, cardHeight + 10);
    ctx.fillRect(padding-5, height - cardHeight - padding -5, width - 2*padding + 10, cardHeight + 10);

    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "#FFFFFF";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#FF69B4";
    ctx.fillText("Dealer", width/2, padding + cardHeight + 60);
    ctx.fillStyle = "#1E90FF";
    ctx.fillText("Player", width/2, height - cardHeight - padding - 20);
    ctx.shadowBlur = 0;

    await drawCards(dealerCards, dealerPositions);
    await drawCards(playerCards, playerPositions);

    ctx.font = "bold 80px Arial";
    const gradient = ctx.createLinearGradient(width-220,height/2-50,width-30,height/2+50);
    gradient.addColorStop(0, isWin ? "#4CAF50" : "#FF4D4F");
    gradient.addColorStop(1, "#FFFFFF");
    ctx.fillStyle = gradient;
    ctx.textAlign = "right";
    ctx.fillText(resultText, width-30,height/2);

    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "left";
    const infoStartY = Math.floor(height/2 - 60);
    const infoSpacing = 60;
    const infoX = padding;
    ctx.fillText(`Bet: ${bet}`, infoX, infoStartY);
    ctx.fillText(`Won: ${wonAmount}`, infoX, infoStartY + infoSpacing);
    ctx.fillText(`Lost: ${lostAmount}`, infoX, infoStartY + infoSpacing*2);

    const filePath = path.join(__dirname, `blackjack_${Date.now()}.png`);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(filePath, buffer);

    await api.unsendMessage(loadingMessage.messageID);
    await api.sendMessage({
      body: `🃏 Blackjack Game\n💸 Bet: ${bet} coins\n👤 Author: Azad 💥\n🏆 ${resultText} | Won: ${wonAmount} | Lost: ${lostAmount}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath));
  }
};
