# INSOCtor Setup Guide

## Prerequisites

Before you can run the INSOCtor unified SOC dashboard, you need to install Node.js.

### Install Node.js

1. **Download Node.js**:
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Download the **LTS (Long Term Support)** version for Windows
   - Recommended: Node.js 18.x or 20.x

2. **Run the installer**:
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - ✅ Make sure "Add to PATH" is checked
   - ✅ Accept all default options

3. **Verify installation**:
   - **Close all existing PowerShell/terminal windows**
   - Open a **new** PowerShell window
   - Run these commands:
     ```powershell
     node --version
     npm --version
     ```
   - Both should display version numbers (e.g., `v20.10.0` and `10.2.3`)

## Backend Setup

Once Node.js is installed:

1. **Navigate to backend directory**:
   ```powershell
   cd c:\Users\DELL\Documents\InSoctor\backend
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Configure environment variables**:
   - Open `backend\.env` in a text editor
   - Replace the placeholder values with your actual service credentials:
     ```env
     # Wazuh Configuration
     WAZUH_API_URL=https://your-wazuh-server:55000
     WAZUH_API_USER=your-actual-username
     WAZUH_API_PASSWORD=your-actual-password
     
     # IRIS Configuration
     IRIS_API_URL=https://your-iris-server
     IRIS_API_KEY=your-actual-api-key
     
     # Shuffle Configuration (optional for now)
     SHUFFLE_API_URL=https://your-shuffle-server
     SHUFFLE_API_KEY=your-actual-api-key
     
     # MISP Configuration (optional for now)
     MISP_API_URL=https://your-misp-server
     MISP_API_KEY=your-actual-api-key
     ```

4. **Start the backend server**:
   ```powershell
   npm run dev
   ```
   
   You should see:
   ```
   🚀 INSOCtor Backend API running on port 3001
   📊 Environment: development
   🔗 Frontend URL: http://localhost:5173
   🛡️  Wazuh: https://your-wazuh-server:55000
   📋 IRIS: https://your-iris-server
   ```

## Frontend Setup

The frontend is already configured. You just need to update it to connect to the backend.

1. **Keep the backend running** in one terminal

2. **Open a new terminal** and navigate to frontend:
   ```powershell
   cd c:\Users\DELL\Documents\InSoctor
   ```

3. **Start the frontend** (if not already running):
   ```powershell
   npm run dev
   ```

4. **Open your browser**:
   - Go to `http://localhost:5173`
   - The frontend will connect to the backend at `http://localhost:3001`

## Troubleshooting

### "npm is not recognized"
- You need to install Node.js (see Prerequisites above)
- After installing, **close and reopen** your terminal

### Backend won't start
- Check that port 3001 is not already in use
- Verify your `.env` file has correct credentials
- Check the logs for specific error messages

### Frontend can't connect to backend
- Make sure backend is running on port 3001
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL

### Wazuh/IRIS connection errors
- Verify the API URLs are correct and accessible
- Check if you need to disable SSL verification (`WAZUH_VERIFY_SSL=false`)
- Confirm API credentials are valid
- Check firewall/network settings

## Next Steps

After both frontend and backend are running:

1. **Test the connection**:
   - Navigate to the Alerts page
   - You should see real alerts from Wazuh
   - Check the browser console for any errors

2. **Configure services**:
   - Make sure all your service URLs and credentials are correct
   - Test each integration individually

3. **Create a test case**:
   - Click on an alert
   - Click "Create Case"
   - Verify the case appears in IRIS

## Architecture

```
INSOCtor/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── services/    # Wazuh, IRIS, Shuffle, MISP integrations
│   │   ├── routes/      # API endpoints
│   │   └── server.ts    # Main server
│   ├── .env             # Your credentials (DO NOT COMMIT)
│   └── package.json
│
├── src/                  # React frontend
│   ├── pages/           # Dashboard, Alerts, Logs, Cases
│   ├── components/      # UI components
│   └── services/        # API client (to be created)
│
└── package.json
```

## Support

If you encounter issues:
1. Check the backend logs for error messages
2. Check the browser console for frontend errors
3. Verify all service credentials are correct
4. Ensure all services (Wazuh, IRIS) are accessible from your machine
