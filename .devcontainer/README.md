# GitHub Codespaces Setup

This folder contains the configuration to run CoopeSuma Management System in GitHub Codespaces for mobile testing.

## 🚀 Quick Start

### 1. Create Codespace
1. Go to https://github.com/CorralesK/coopesumaManagementSystem
2. Switch to branch **codespaces-deployment**
3. Click **Code** → **Codespaces** → **Create codespace on codespaces-deployment**
4. Wait 3-5 minutes for automatic setup

### 2. Start the Application

The URLs are configured automatically! Just run:

**Terminal 1 - Backend:**
```bash
bash .devcontainer/start-backend.sh
```

**Terminal 2 - Frontend (open new terminal with Ctrl+Shift+`):**
```bash
bash .devcontainer/start-frontend.sh
```

### 3. Access from Your Phone

The ports are automatically set to **Public**. Look at the **PORTS** tab (bottom panel) and:

1. Find port **5173** (Frontend)
2. Copy the **Forwarded Address** (it looks like: `https://xxx-5173.app.github.dev`)
3. Open that URL on your phone's browser

**That's it!** The frontend is already configured to use the correct backend URL.

## 📱 Quick URLs

Once Codespaces is running, you can find your URLs in the terminal output or in the PORTS tab:
- **Frontend** (for your phone): Port 5173 Forwarded Address
- **Backend API**: Port 5000 Forwarded Address

## 🗄️ Database Setup

The database is created automatically, but you need to import your schema:

```bash
# If you have a SQL dump file
sudo -u postgres psql cooplinkcr < your_schema.sql
```

## ⚙️ Manual Configuration (if needed)

If the automatic URL configuration doesn't work, you can manually run:

```bash
bash .devcontainer/configure-urls.sh
```

This will reconfigure both backend and frontend with the correct Codespace URLs.

## 🛑 Stopping Codespaces

- Auto-stops after 30 minutes of inactivity
- **Free tier**: 60 hours/month (120 hours for students/teachers)
- Manually stop: Go to https://github.com/codespaces → Stop your codespace

## 🔧 Troubleshooting

### npm command not found
The devcontainer should install Node.js automatically. If it fails:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### PostgreSQL not running
```bash
sudo service postgresql start
```

### Ports not public
1. Go to **PORTS** tab
2. Right-click ports 5000 and 5173
3. Select **Port Visibility** → **Public**

### Can't connect from phone
- Make sure ports are set to **Public** (not Private)
- Use HTTPS URL (not HTTP)
- Check that both backend and frontend are running
