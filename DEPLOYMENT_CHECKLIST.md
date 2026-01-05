# 🚀 ReadSphere Deployment Checklist

## ✅ Pre-Deployment Preparation (DONE)

- [x] Added PostgreSQL driver to backend
- [x] Created production application properties
- [x] Configured environment-based API URL in frontend
- [x] Created Vercel configuration
- [x] Created deployment documentation

## 📋 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy Database (Render)
1. Go to https://render.com/
2. Sign up/Login with GitHub
3. Click "New +" → "PostgreSQL"
4. Configure:
   - Name: `readsphere-db`
   - Database: `readsphere`
   - User: `readsphere_user`
   - Plan: **Free**
5. Click "Create Database"
6. **COPY** the "Internal Database URL" (you'll need this!)

### Step 3: Deploy Backend (Render)
1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name**: `readsphere-backend`
   - **Root Directory**: Leave empty or put `backend`
   - **Environment**: Java
   - **Build Command**: `cd backend && mvn clean package -DskipTests`
   - **Start Command**: `cd backend && java -Dspring.profiles.active=prod -jar target/readsphere-0.0.1-SNAPSHOT.jar`
   - **Plan**: **Free**

4. **Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   ```
   SPRING_PROFILES_ACTIVE = prod
   DATABASE_URL = [paste from Step 2]
   JWT_SECRET = [generate 64-char random string]
   CORS_ORIGINS = *
   EMAIL_USERNAME = [your Gmail]
   EMAIL_PASSWORD = [your Gmail app password]
   PORT = 8080
   ```

5. Click "Create Web Service"
6. Wait for build (5-10 minutes)
7. **COPY** your backend URL: `https://readsphere-backend-xxxx.onrender.com`

### Step 4: Deploy Frontend (Vercel)
1. Go to https://vercel.com/
2. Sign up/Login with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend-react`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   
6. **Environment Variables**:
   ```
   REACT_APP_API_URL = [paste backend URL from Step 3]/api
   ```
   Example: `https://readsphere-backend-xxxx.onrender.com/api`

7. Click "Deploy"
8. Wait for build (2-5 minutes)
9. **COPY** your frontend URL: `https://readsphere-xxxx.vercel.app`

### Step 5: Update CORS (Render)
1. Go back to Render dashboard
2. Find your backend service
3. Go to "Environment" tab
4. Update `CORS_ORIGINS` variable:
   - Replace `*` with your Vercel URL from Step 4
   - Example: `https://readsphere-xxxx.vercel.app`
5. Click "Save Changes"
6. Service will auto-restart

### Step 6: Test Your Deployment
1. Open your Vercel URL
2. Try to register/login
3. Test creating a book
4. Check if all features work

## 🎉 You're Live!

Your app is now deployed 100% free!

## 📝 Important Notes

### Free Tier Limitations:
- **Render**: 
  - Spins down after 15 min inactivity
  - First request takes ~50 sec to wake up
  - 750 hours/month free
  
- **Vercel**:
  - Always on (no sleep)
  - 100GB bandwidth/month
  - Unlimited requests

### Tips:
- Keep your `.env` file local (never commit it)
- Use strong passwords for JWT_SECRET
- Get Gmail app password: Google Account → Security → 2-Step Verification → App passwords
- Monitor your app on Render/Vercel dashboards

## 🔄 Future Updates

To deploy updates:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Both Render and Vercel will **auto-deploy** from GitHub!

## 🆘 Troubleshooting

**Backend not starting?**
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

**Frontend can't connect to backend?**
- Check REACT_APP_API_URL is correct
- Verify CORS_ORIGINS includes your Vercel URL
- Wait 50 sec if backend is sleeping (Render free tier)

**Database connection failed?**
- Use "Internal Database URL" from Render (not External)
- Format: `postgresql://user:password@host/database`

## 🌟 Alternative Free Options

If you encounter issues:
- **Backend**: Railway.app ($5 credit/month)
- **Database**: Supabase (1GB free PostgreSQL)
- **Frontend**: Netlify (alternative to Vercel)
