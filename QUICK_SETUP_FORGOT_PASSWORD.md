# Quick Setup - Forgot Password (Local Development)

## ✅ Hindi kailangan i-deploy! Pwede na sa local development

## 🚀 Quick Steps (5 minutes)

### Step 1: Configure Supabase Dashboard

1. **Pumunta sa Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project

2. **Configure Site URL:**
   - Go to **Authentication** → **URL Configuration**
   - Under **Site URL**, add:
     ```
     http://localhost:3000
     ```
   - Click **Save**

3. **Add Redirect URL:**
   - Scroll down to **Redirect URLs**
   - Click **Add URL**
   - Add:
     ```
     http://localhost:3000/reset-password
     ```
   - Click **Save**

### Step 2: Test Locally

1. **Start your dev server:**
   ```bash
   pnpm dev
   ```

2. **Test the flow:**
   - Go to http://localhost:3000/login
   - Click "Forgot password?"
   - Enter your email
   - Check your email (or Supabase logs)

3. **Click the reset link from email:**
   - Should redirect to http://localhost:3000/reset-password
   - Enter new password
   - Done! ✅

## 📧 Where to Check Reset Emails

### Option 1: Supabase Dashboard (Easiest for Testing)

1. Go to **Authentication** → **Users**
2. Find your user email
3. Click on the user
4. Check **Recent Auth Events** or **Logs**

### Option 2: Your Email Inbox

- Check your registered email
- Check spam folder
- Reset email comes from Supabase

### Option 3: Supabase Logs

1. Go to **Logs** → **Auth Logs**
2. Look for password reset events

## ⚠️ Common Issues

### Issue: "Invalid or expired reset link"

**Solution:**
- Make sure you added `http://localhost:3000/reset-password` to Redirect URLs
- Make sure Site URL is set to `http://localhost:3000`
- Use the LATEST reset link (each request creates a new one)

### Issue: Email not received

**Solutions:**
1. Check Supabase dashboard → Users → check if email exists
2. Check spam folder
3. Check Supabase logs for errors
4. Make sure email is correct
5. Try requesting again

### Issue: Redirect not working

**Solution:**
- Verify redirect URL in Supabase matches exactly:
  - Must be: `http://localhost:3000/reset-password`
  - No trailing slash
  - Exact match (case-sensitive)

## 🎯 Testing Checklist

- [ ] Site URL configured in Supabase
- [ ] Redirect URL added: `http://localhost:3000/reset-password`
- [ ] Dev server running (`pnpm dev`)
- [ ] Test forgot password page works
- [ ] Reset email received (or visible in Supabase)
- [ ] Reset link redirects correctly
- [ ] New password can be set
- [ ] Can login with new password

## 📝 Notes

- **Local development works perfectly!** No deployment needed
- Reset links expire after 1 hour (default)
- Rate limit: 5 attempts per 15 minutes
- Each new request creates a NEW link (old ones become invalid)

## 🚀 For Production (Later)

When you're ready to deploy:

1. Add production URL to Supabase:
   - Site URL: `https://your-domain.com`
   - Redirect URL: `https://your-domain.com/reset-password`

2. Set environment variable:
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.com`

That's it! Forgot password will work locally once Supabase is configured. 👍

