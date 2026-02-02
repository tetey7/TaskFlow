# Deployment Guide

## Current Status
- ✅ Frontend builds successfully locally
- ✅ Vercel project created: task-flow-pi-six.vercel.app
- ❌ Getting 404 errors on Vercel

## Fix Vercel 404 Error

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/ann-renzel-lagundas-projects/task-flow/settings
2. Under **General** → **Root Directory**:
   - If it's set to anything other than blank/`.`, that's the issue
   - It should be blank (since you're deploying from the frontend folder)
3. Under **Environment Variables**, add:
   - Key: `NEXT_PUBLIC_BACKEND_URL`
   - Value: `http://localhost:8000` (temporary until backend is deployed)
   - Environment: Production
4. Go to **Deployments** → Click the three dots on latest → **Redeploy**

### Option 2: Via CLI
From the frontend directory, run:
```bash
cd /Users/tetey/work/TaskFlow/frontend
vercel env add NEXT_PUBLIC_BACKEND_URL production
# Enter: http://localhost:8000
vercel --prod --force
```

## Next Steps After Frontend Works

1. **Deploy Backend to Railway:**
   - Go to https://railway.app
   - Create new project from GitHub (TaskFlow repo)
   - Set root directory to `backend`
   - Add PostgreSQL database
   - Set environment variables:
     - `SECRET_KEY` (generate random string)
     - `DEBUG=False`
     - `ALLOWED_HOSTS=*.railway.app,task-flow-pi-six.vercel.app`

2. **Update Vercel Environment Variable:**
   - Change `NEXT_PUBLIC_BACKEND_URL` to your Railway URL
   - Redeploy frontend

3. **Update Django CORS Settings:**
   - Add Vercel domain to CORS_ALLOWED_ORIGINS in settings.py
