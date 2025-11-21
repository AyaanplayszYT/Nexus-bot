# Nexus Bot - Hosting & Deployment Guide

This guide covers hosting Nexus Bot on various platforms with step-by-step instructions.

---

##  Quick Start - Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Discord token and API keys

# 3. Deploy commands
npm run deploy

# 4. Start the bot
npm start
```

---

## ☁️ Cloud Hosting Options

### 1. **Railway.app** (Easiest - Recommended)

**Pros**: Simple setup, free tier, auto-deploys on git push  
**Cons**: Limited free resources

**Steps**:
1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Nexus-bot` repository
4. Configure environment variables:
   - Add `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `OPENROUTER_API_KEY`, etc.
5. Click "Deploy"
6. The bot will auto-start and restart on crashes

**Railway dashboard commands**:
- View logs: Click "Logs" tab
- Restart: Click the deployment, then "Restart"
- Update: Push to main branch and Railway auto-deploys

---

### 2. **Replit** (Beginner-Friendly)

**Pros**: Browser-based, easy, free tier available  
**Cons**: Resource limitations, may be slower

**Steps**:
1. Go to [replit.com](https://replit.com)
2. Click "Create" → Import from GitHub
3. Paste: `https://github.com/AyaanplayszYT/Nexus-bot`
4. Wait for import to complete
5. Configure secrets:
   - Click "Secrets" (lock icon)
   - Add each env variable (DISCORD_TOKEN, CLIENT_ID, etc.)
6. Click "Run"

**Note**: Replit may stop the bot if inactive. Use Uptime Robot (free) to ping your Replit instance every 5 minutes to keep it alive.

---

### 3. **Docker** (Advanced - Any Cloud)

**Pros**: Portable, scalable, works everywhere  
**Cons**: Requires Docker knowledge

**Local Testing**:
```bash
# Build image
docker build -t nexus-bot .

# Run container
docker run -d \
  --name nexus-bot \
  -e DISCORD_TOKEN=your_token \
  -e CLIENT_ID=your_id \
  -e GUILD_ID=your_guild \
  nexus-bot
```

**Deploy to Cloud**:
- **Google Cloud Run**: Push to `gcr.io` registry, deploy via Cloud Run
- **AWS ECR + ECS**: Push image, run on ECS
- **Azure Container Instances**: Push to ACR, deploy as ACI
- **DigitalOcean App Platform**: Connect GitHub, auto-builds from Dockerfile

---

### 4. **VPS Hosting** (Most Control)

**Providers**: DigitalOcean, Linode, AWS EC2, Vultr, etc.

**Ubuntu/Debian Setup**:
```bash
# SSH into your server
ssh root@your_server_ip

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/AyaanplayszYT/Nexus-bot.git
cd Nexus-bot

# Install dependencies
npm install

# Create .env file
nano .env
# Paste your environment variables, Ctrl+O to save

# Deploy commands
npm run deploy

# Install PM2 (process manager)
sudo npm install -g pm2

# Start bot with PM2
pm2 start index.js --name "nexus-bot"

# Make PM2 start on server reboot
pm2 startup
pm2 save

# View logs
pm2 logs nexus-bot

# Monitor
pm2 monit
```

**DigitalOcean Specific**:
- Droplet: $4-6/month for basic bot
- Firewall: Allow port 22 (SSH) only
- Backups: Enable automatic snapshots

---

### 5. **Heroku** (Deprecated - Not Recommended)

Heroku discontinued free tier. Use Railway or other options instead.

---

## 🔑 Environment Variables Checklist

Before deploying, ensure you have:

| Variable | Where to Get | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | [Discord Dev Portal](https://discord.com/developers/applications) - Bot → Copy Token | ✅ |
| `CLIENT_ID` | Discord Dev Portal - General Information | ✅ |
| `GUILD_ID` | Right-click server → Copy Server ID (Dev Mode on) | ✅ |
| `OPENROUTER_API_KEY` | [OpenRouter.ai](https://openrouter.ai) - Keys page | ❌ Optional |
| `SPAM_MENTION_LIMIT` | Set to `5` or higher | ❌ Optional |
| `BANNED_WORDS` | Comma-separated: `badword1,badword2` | ❌ Optional |
| `MOD_ROLE_IDS` | Right-click role → Copy Role ID | ❌ Optional |
| `AUTO_ROLE_ID` | Right-click role → Copy Role ID | ❌ Optional |
| `AI_CHANNEL_NAME` | Use default or custom channel name | ❌ Optional |

---

## 📊 Performance & Monitoring

### Uptime Monitoring
- **UptimeRobot** (free): Pings your bot every 5 min to keep alive on Replit
- **Status Page**: Create status.im page for public transparency

### Logs & Debugging
```bash
# View last 100 lines
pm2 logs nexus-bot --lines 100

# View specific error
pm2 logs nexus-bot | grep "Error"

# Save logs to file
pm2 logs nexus-bot > bot-logs.txt
```

### Resource Usage
```bash
# Monitor CPU/Memory
pm2 monit

# Or directly
node --max-old-space-size=256 index.js  # Limit to 256MB
```

---

## 🐛 Troubleshooting Deployment

### Bot doesn't start
```bash
# Check syntax
node -c index.js

# Run with detailed errors
node index.js

# Check Node version (must be 18+)
node --version
```

### Commands not appearing
```bash
# Redeploy commands
npm run deploy

# Wait 1-2 minutes for Discord sync
# Check bot has "Use Application Commands" permission
```

### Environment variables not loading
```bash
# Verify .env file exists
cat .env

# Restart bot
pm2 restart nexus-bot
```

### Memory issues on small servers
```bash
# Limit Node memory
pm2 start index.js --max-memory-restart 256M --name "nexus-bot"
```

---

## 🔄 Continuous Deployment (Auto-Updates)

### GitHub → Railway (Automatic)
1. Railway watches your GitHub repo
2. Push to `main` branch
3. Railway auto-builds and deploys

### GitHub → VPS (Manual)
```bash
# SSH into server, then:
cd /path/to/Nexus-bot
git pull origin main
npm install
pm2 restart nexus-bot
```

