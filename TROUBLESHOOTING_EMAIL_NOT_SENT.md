# Troubleshooting: Reset Password Email Not Being Sent

## 🔍 Step-by-Step Troubleshooting

### Step 1: Check Supabase Email Configuration

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project

2. **Check Email Provider:**
   - Go to **Authentication** → **Providers**
   - Make sure **Email** provider is **ENABLED** ✅
   - If disabled, enable it and save

3. **Check Email Rate Limits:**
   - Supabase free tier: **3 emails per hour** only
   - If you've sent 3 emails in the past hour, you need to wait
   - Check: **Authentication** → **Settings** → **Rate Limits**

### Step 2: Check Supabase Logs

1. **Go to Logs:**
   - Supabase Dashboard → **Logs** → **Auth Logs**
   - Look for recent password reset attempts
   - Check for any error messages

2. **Check What You See:**
   - If you see "Email sent" → Email was sent, check spam folder
   - If you see errors → Note the error message
   - If nothing appears → API might not be calling Supabase correctly

### Step 3: Verify Redirect URL Configuration

1. **Check Redirect URLs:**
   - Go to **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, make sure you have:
     ```
     http://localhost:3000/reset-password
     ```
   - Must match EXACTLY (no trailing slash, no https)

2. **Check Site URL:**
   - Site URL should be: `http://localhost:3000`
   - Make sure it's saved

### Step 4: Check Browser Console

1. **Open Browser DevTools:**
   - Press `F12` or right-click → Inspect
   - Go to **Console** tab

2. **Test Forgot Password:**
   - Go to http://localhost:3000/forgot-password
   - Enter your email and submit
   - Check console for errors

3. **Check Network Tab:**
   - Go to **Network** tab
   - Submit forgot password form
   - Find the request to `/api/auth/forgot-password`
   - Check if it returns success or error
   - Check the response message

### Step 5: Test API Directly

1. **Open Browser Console** (F12)

2. **Run this test:**
   ```javascript
   fetch('/api/auth/forgot-password', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email: 'your-email@gmail.com' })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error)
   ```

3. **Check the response:**
   - Should return: `{ message: "If an account exists..." }`
   - If error, check the error message

### Step 6: Check Email Settings

1. **Check Email Templates:**
   - Go to **Authentication** → **Email Templates**
   - Find **Reset Password** template
   - Make sure it's enabled
   - Check the **Redirect URL** field uses: `{{ .ConfirmationURL }}`

2. **Check SMTP Settings:**
   - Go to **Project Settings** → **Auth** → **SMTP Settings**
   - If using default Supabase SMTP:
     - Limited to 3 emails/hour
     - Check if you've exceeded limit
   - If using custom SMTP:
     - Verify credentials are correct
     - Test email sending

### Step 7: Check Spam/Junk Folder

1. **Check Gmail:**
   - Open Gmail
   - Check **Spam** folder
   - Check **Promotions** tab
   - Search for "Supabase" or "password reset"

2. **Check Email Filters:**
   - Gmail might be filtering the email
   - Check Gmail filters/settings

### Step 8: Verify Email Exists in Supabase

1. **Check if email is registered:**
   - Go to **Authentication** → **Users**
   - Search for your email
   - If NOT found → Email won't be sent (by design, for security)
   - If found → Proceed with other steps

2. **Note:** Supabase returns success even if email doesn't exist (to prevent email enumeration)

## 🎯 Quick Fixes

### Fix 1: Wait for Rate Limit
- **Problem:** Sent 3+ emails in 1 hour
- **Solution:** Wait 1 hour, then try again
- **Check:** Authentication → Settings → Rate Limits

### Fix 2: Enable Email Provider
- **Problem:** Email provider is disabled
- **Solution:** 
  1. Authentication → Providers
  2. Enable "Email" provider
  3. Save

### Fix 3: Check Redirect URL
- **Problem:** Redirect URL not configured
- **Solution:**
  1. Authentication → URL Configuration
  2. Add: `http://localhost:3000/reset-password`
  3. Save

### Fix 4: Verify Email in Supabase
- **Problem:** Email not registered
- **Solution:**
  1. Make sure you signed up first
  2. Check Authentication → Users
  3. If not there, sign up first

### Fix 5: Use Supabase Logs to Find Email
- **Problem:** Can't find email in inbox
- **Solution:**
  1. Authentication → Users → Click your email
  2. Check "Recent Auth Events"
  3. Or check Logs → Auth Logs

## 📋 Debug Checklist

- [ ] Email provider is ENABLED in Supabase
- [ ] Redirect URL configured: `http://localhost:3000/reset-password`
- [ ] Site URL configured: `http://localhost:3000`
- [ ] Email exists in Supabase Users
- [ ] Not exceeded 3 emails/hour limit
- [ ] Checked spam/junk folder
- [ ] Checked Supabase Auth Logs for errors
- [ ] Browser console shows no errors
- [ ] API returns success response

## 🔧 Advanced: Test with Supabase Client Directly

If API route isn't working, test directly:

```javascript
// In browser console
import { createBrowserClient } from '@/lib/supabaseClient'

const supabase = createBrowserClient()
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'your-email@gmail.com',
  {
    redirectTo: 'http://localhost:3000/reset-password'
  }
)

console.log('Data:', data)
console.log('Error:', error)
```

## 📞 Still Not Working?

1. **Check Supabase Status:** https://status.supabase.com
2. **Check Supabase Logs:** Dashboard → Logs → Auth Logs
3. **Verify environment variables:** Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
4. **Test with a different email** (if possible)
5. **Check if other Supabase emails work** (like signup confirmation)

## 💡 Most Common Issue

**90% of cases:** Either:
1. Email provider disabled → Enable it
2. Rate limit exceeded → Wait 1 hour
3. Email in spam folder → Check spam
4. Redirect URL not configured → Add it to Supabase

Try these first! 👍

