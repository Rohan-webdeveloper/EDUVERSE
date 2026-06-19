# 🚀 EduVerse AI Deployment Guide

This guide describes how to deploy the full-stack EduVerse AI application to production. We will use **Render** to deploy the Node.js/Express backend server, and **Vercel** to deploy the React/Vite frontend.

---

## 📋 Table of Contents
1. [Backend Deployment (Render)](#1-backend-deployment-render)
2. [Frontend Deployment (Vercel)](#2-frontend-deployment-vercel)
3. [Updating Environment Variables (CORS)](#3-updating-environment-variables-cors)
4. [MongoDB Database Setup](#4-mongodb-database-setup)
5. [Troubleshooting & Monitoring](#5-troubleshooting--monitoring)

---

## 1. Backend Deployment (Vercel or Render)

You can choose to host the Express backend as serverless functions on **Vercel** (recommended for instant cold starts and simplified project management) or as a traditional web service on **Render**.

### Option A: Serverless Backend on Vercel (Recommended)

Since the project already contains `server/vercel.json`, Vercel will automatically compile the Express server into serverless functions.

1. Open your terminal in the **`server`** directory:
   ```bash
   cd server
   ```
2. Trigger the production build and deployment:
   ```bash
   npx vercel deploy --prod --yes
   ```
3. Once completed, Vercel will provide your backend URL (e.g. `https://eduverse-backend-phi.vercel.app`).
4. Go to your [Vercel Dashboard](https://vercel.com) for the `eduverse-backend` project.
5. Navigate to **Settings** > **Environment Variables** and add the keys from your `.env` file (`MONGODB_URI`, `YOUTUBE_API_KEY`, `GEMINI_API_KEY`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`).
   - *Note*: Set `CLIENT_URL` to your production frontend URL (e.g. `https://eduverse-ai-five.vercel.app`).
6. Go to **Deployments** tab on Vercel and **Redeploy** the latest deployment to apply the environment variables.

### Option B: Web Service Backend on Render

We will host the Node.js/Express server on **Render**. It connects to MongoDB Atlas and executes API endpoints for search and AI assistance.

#### Step-by-Step Setup:
1. Sign up or log in to the [Render Dashboard](https://render.com).
2. Click the **New +** button and select **Web Service**.
3. Connect your GitHub account and import your repository (`Rohan-webdeveloper/EDUVERSE`).
4. In the configuration details, enter:
   - **Name**: `eduverse-backend`
   - **Region**: Select a region close to your target users (e.g., Singapore or US East)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Choose the **Free** instance type (or any higher tier).
6. Expand the **Advanced** section and click **Add Environment Variable**. Add the following variables:

| Key | Value | Notes |
|:---|:---|:---|
| `NODE_ENV` | `production` | Enables production logger & caching optimizations |
| `PORT` | `10000` | Port Render binds to (can also be left to default) |
| `MONGODB_URI` | `mongodb+srv://...` | Your production MongoDB Atlas URI |
| `JWT_SECRET` | `your_random_string` | Secure random string used to sign Access Tokens |
| `JWT_REFRESH_SECRET` | `your_other_random_string` | Secure random string used to sign Refresh Tokens |
| `JWT_EXPIRE` | `15m` | Token expiration time |
| `JWT_REFRESH_EXPIRE` | `7d` | Refresh token expiration time |
| `YOUTUBE_API_KEY` | `AIzaSy...` | Google Cloud YouTube Data API v3 key |
| `GEMINI_API_KEY` | `AQ...` | Google Gemini API Key |
| `CLIENT_URL` | `https://localhost:5173` | Set temporarily. We will update this with the Vercel URL later |

7. Click **Create Web Service**. 
8. Render will compile and start the backend. Take note of the live backend service URL displayed at the top left of the dashboard (e.g., `https://eduverse-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

We will host the React single-page application (SPA) on **Vercel**, which handles CDN caching and asset optimization.

### Step-by-Step Setup:
1. Sign up or log in to the [Vercel Dashboard](https://vercel.com).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository (`Rohan-webdeveloper/EDUVERSE`).
4. In the project settings, configure:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add:

| Key | Value | Notes |
|:---|:---|:---|
| `VITE_API_URL` | `https://eduverse-backend.onrender.com/api` | Point this to your Render backend URL (appended with `/api`) |

6. Click **Deploy**. Vercel will build your static files and generate your live deployment link (e.g., `https://eduverse-client.vercel.app`).
7. Open the URL to verify that the landing page renders correctly in production.

---

## 3. Updating Environment Variables (CORS)

For security, the backend server limits API requests to specific origin domains (CORS). Now that the frontend is live, you must update the backend CORS settings.

1. Copy your live Vercel app domain (e.g., `https://eduverse-client.vercel.app`).
2. Navigate back to your Render Dashboard for `eduverse-backend`.
3. Go to the **Environment** tab on the left sidebar.
4. Locate the `CLIENT_URL` variable.
5. Change its value from the placeholder or localhost to your live Vercel URL:
   `https://eduverse-client.vercel.app`
6. Click **Save Changes**. Render will automatically redeploy and apply the updated CORS configuration.

---

## 4. MongoDB Database Setup

To ensure MongoDB Atlas allows connection requests from Render:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Network Access** under the Security tab.
3. Click **Add IP Address**.
4. Since Render's dynamic web service outbound IPs change, you should choose **Allow Access From Anywhere** (`0.0.0.0/0`) OR configure a static outbound IP if using a premium Render service tier.
5. Click **Confirm**.

---

## 5. Troubleshooting & Monitoring

### App showing a blank page on navigation?
- We have configured `vercel.json` inside the `client` directory to handle Single Page Application (SPA) routing redirection. If Vercel fails to route page refreshes, ensure that `client/vercel.json` is committed to your repository.

### API requests returning CORS errors?
- Verify that `CLIENT_URL` on Render exactly matches the protocol and domain of your Vercel deployment (no trailing slash, e.g. `https://eduverse-client.vercel.app`).

### AI or search features not working?
- Check the backend logs on Render to see if `YOUTUBE_API_KEY` or `GEMINI_API_KEY` are invalid or have hit quotas.
