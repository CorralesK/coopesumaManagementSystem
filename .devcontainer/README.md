# GitHub Codespaces Setup

This folder contains the configuration to run CoopeSuma Management System in GitHub Codespaces.

## Quick Start

1. Go to the repository on GitHub
2. Click on **Code** → **Codespaces** → **Create codespace on development**
3. Wait for the environment to set up (3-5 minutes)
4. Once ready, the setup script will install all dependencies automatically

## Running the Application

### Start Backend
```bash
cd backend
npm start
```

### Start Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

## Accessing the Application

- **Frontend**: The port 5173 will open automatically in your browser
- **Backend API**: Available at port 5000
- **Database**: PostgreSQL running on port 5432

## Making Ports Public

To access the app from your phone:

1. Go to the **PORTS** tab in Codespaces (bottom panel)
2. Right-click on port **5173** (Frontend)
3. Select **Port Visibility** → **Public**
4. Do the same for port **5000** (Backend)
5. Copy the **Forwarded Address** URLs and use them on your phone

## Database Setup

The PostgreSQL database is created automatically. You may need to import your schema:

```bash
# If you have a SQL dump file
sudo -u postgres psql cooplinkcr < your_schema.sql
```

## Stopping Codespaces

- Codespaces auto-stop after 30 minutes of inactivity
- Free tier: 60 hours/month
- Manually stop: Click your Codespace name → Stop

## Troubleshooting

### PostgreSQL not running
```bash
sudo service postgresql start
```

### Port forwarding issues
Make sure ports are set to **Public** visibility in the PORTS tab
