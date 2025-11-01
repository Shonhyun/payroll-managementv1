# Vercel Deployment Checklist for Password Reset

## ✅ Pre-Deployment Steps

### 1. Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables

**Required Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### 2. Update Supabase Redirect URLs

Go to Supabase Dashboard → Authentication → URL Configuration

**Add Production URLs:**

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs (add both):**
```
https://your-app.vercel.app/reset-password
https://your-app.vercel.app/auth/callback
```

**Keep Development URLs too:**
```
http://localhost:3000
http://localhost:3000/reset-password
http://localhost:3000/auth/callback
```

### 3. Update Forgot Password Route

Make sure the `redirectTo` uses `NEXT_PUBLIC_SITE_URL` when available.

## 🚀 Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Fix password reset flow"
   git push
   ```

2. **Deploy:**
   - Go to Vercel Dashboard
   - Your repo should auto-deploy
   - Or manually trigger deployment

3. **After Deployment:**
   - Copy your production URL (e.g., `https://your-app.vercel.app`)
   - Update Supabase redirect URLs (see step 2 above)

## ✅ Post-Deployment Testing

1. **Test Password Reset:**
   - Go to `https://your-app.vercel.app/forgot-password`
   - Enter email
   - Check email for reset link
   - Click link IMMEDIATELY
   - Should redirect to reset password page

2. **Check Console:**
   - Open browser DevTools (F12)
   - Check Console for errors
   - Check Network tab for failed requests

3. **Verify Environment Variables:**
   - Make sure all env vars are set in Vercel
   - Redeploy if you add new ones

## 🐛 Common Issues After Deployment

### Issue 1: Still Getting 400/403 Errors

**Solution:**
- Verify Supabase redirect URLs include production URL
- Check environment variables are set correctly
- Make sure Site URL in Supabase matches production URL

### Issue 2: Password Reset Link Not Working

**Solution:**
- Check Supabase logs (Dashboard → Logs → Auth Logs)
- Verify email was sent successfully
- Make sure you're using the link immediately (within 1 hour)

### Issue 3: Different Error in Production

**Solution:**
- Production might handle PKCE differently
- Check Vercel function logs
- Compare production vs development behavior

## 📝 Notes

- **HTTPS Required:** Production must use HTTPS (Vercel does this automatically)
- **URLs Must Match:** Supabase redirect URLs must match exactly
- **Environment Variables:** Must be set in Vercel, not just `.env.local`
- **Test Immediately:** Use reset links right away to avoid expiration

## 🎯 Expected Behavior After Deployment

1. User requests password reset → Email sent
2. User clicks link → Redirects to production reset-password page
3. Session is created → User can set new password
4. Password updated → Redirect to login

If this doesn't work, check Vercel function logs and Supabase auth logs for specific errors.

