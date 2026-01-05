# Render Deployment Guide for ReadSphere

## Backend Deployment on Render

### 1. Create Render Account
- Go to https://render.com
- Sign up with your GitHub account

### 2. Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `readsphere-db`
3. Database: `readsphere`
4. User: `readsphere_user`
5. Region: Choose closest to you
6. Instance Type: **Free**
7. Click "Create Database"
8. Copy the "Internal Database URL" (starts with `postgresql://`)

### 3. Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `readsphere-backend`
   - **Runtime**: Docker (or Java)
   - **Build Command**: `cd backend && mvn clean package -DskipTests`
   - **Start Command**: `cd backend && java -Dspring.profiles.active=prod -jar target/readsphere-0.0.1-SNAPSHOT.jar`
   - **Instance Type**: **Free**

4. Add Environment Variables:
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `DATABASE_URL` = (paste the Internal Database URL from step 2)
   - `JWT_SECRET` = (generate a random 64-character string)
   - `CORS_ORIGINS` = `*` (update later with Vercel URL)
   - `EMAIL_USERNAME` = your Gmail address
   - `EMAIL_PASSWORD` = your Gmail app password
   - `PORT` = `8080`

5. Click "Create Web Service"

### 4. Get Your Backend URL
- After deployment, you'll get a URL like: `https://readsphere-backend.onrender.com`
- Test it: `https://readsphere-backend.onrender.com/api/auth/test`

---

## Frontend Deployment on Vercel

### 1. Update API Base URL
- Before deploying, update your React app to use the Render backend URL
- File: `frontend-react/src/services/api.js`
- Change to: `https://readsphere-backend.onrender.com`

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend-react`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Click "Deploy"

### 3. Get Your Frontend URL
- You'll get a URL like: `https://readsphere.vercel.app`

### 4. Update CORS
- Go back to Render dashboard
- Update `CORS_ORIGINS` environment variable with your Vercel URL
- Restart the backend service

---

## Important Notes

⚠️ **Render Free Tier**:
- Spins down after 15 minutes of inactivity
- First request after sleep takes ~50 seconds
- 750 hours/month free (enough for one service)

💡 **Tips**:
- Keep sensitive data in environment variables
- Use strong JWT secret (64+ characters)
- Enable GitHub auto-deploy for easy updates

## Alternative: Railway (If Render doesn't work)
- Railway also offers free tier: https://railway.app
- $5 free credit monthly
- Similar setup process
