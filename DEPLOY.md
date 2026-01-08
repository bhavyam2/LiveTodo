# Deploy to Railway (Recommended)

Railway is the **best option** for this Socket.io application because:
- ✅ Supports WebSocket connections natively
- ✅ Can serve both frontend and backend together
- ✅ Easy GitHub integration
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Simple configuration

## Quick Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository
6. Railway will auto-detect Node.js and start deploying

### 3. Set Environment Variables

In Railway dashboard, go to your service → Variables tab:

- **DATABASE_URL**: Your Supabase PostgreSQL connection string
  - Get this from Supabase Dashboard → Settings → Database → Connection string
  - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### 4. Deploy Prisma Migrations

After first deployment, run migrations:

```bash
# In Railway dashboard, go to your service → Deployments → View Logs
# Or use Railway CLI:
railway run npx prisma migrate deploy
```

Or add this to your package.json scripts and Railway will run it automatically.

### 5. Get Your URL

Railway will give you a URL like: `https://your-app.railway.app`

Your app will be live at that URL! 🎉

---

## Alternative: Render

If you prefer Render:

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variable: `DATABASE_URL`
6. Deploy!

---

## Why Not Vercel?

Vercel uses **serverless functions** which don't support persistent WebSocket connections that Socket.io needs. Railway and Render run your app as a **persistent process**, which is required for Socket.io.

