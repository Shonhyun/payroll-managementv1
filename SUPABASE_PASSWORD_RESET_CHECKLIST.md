# Supabase Password Reset Configuration Checklist

## ⚠️ CRITICAL: Check These Settings in Supabase Dashboard

### 1. Authentication → URL Configuration

**Site URL:**
```
http://localhost:3000
```
- Must be EXACTLY this (no trailing slash)
- Must match your development URL

**Redirect URLs - ADD BOTH:**
```
http://localhost:3000/reset-password
http://localhost:3000/auth/callback
```
- Both must be listed
- No trailing slashes
- Exact match required

### 2. Authentication → Settings

**Check these settings:**
- ✅ Email provider is ENABLED
- ✅ "Enable email confirmations" - Check if needed
- ✅ "Enable email change" - Check if needed

**Password Reset Settings:**
- Check expiration time (default: 1 hour)
- Check if "Secure password reset" is enabled
- Check PKCE settings (if available, try disabling for password reset)

### 3. Authentication → Email Templates

**Reset Password Template:**
- Template must use: `{{ .ConfirmationURL }}`
- Make sure the link format is correct
- Check if there are any custom redirect URLs hardcoded

### 4. Project Settings → API

**Verify these environment variables match:**
- `NEXT_PUBLIC_SUPABASE_URL` - Must match your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Must match your anon key

### 5. Authentication → Providers → Email

**Settings to check:**
- Email provider is enabled
- SMTP settings are correct (if using custom SMTP)
- Rate limits (free tier: 3 emails/hour)

## 🔍 Debugging Steps

1. **Check Supabase Logs:**
   - Dashboard → Logs → Auth Logs
   - Look for password reset attempts
   - Check for errors

2. **Verify Email Was Sent:**
   - Check Supabase logs for "Email sent"
   - Check spam folder
   - Check email rate limits

3. **Test with Fresh Link:**
   - Request NEW password reset link
   - Use it IMMEDIATELY (within 1 minute)
   - Don't click twice

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

## ❌ Common Issues

### Issue 1: "otp_expired" Error

**Causes:**
- Link was clicked before (one-time use)
- Link is older than expiration time (default 1 hour)
- Multiple reset requests invalidated previous links

**Solution:**
- Request a FRESH password reset link
- Use it IMMEDIATELY
- Don't test with old links

### Issue 2: "access_denied" Error

**Causes:**
- Redirect URL not configured correctly
- Site URL mismatch
- PKCE flow issue

**Solution:**
- Verify Redirect URLs in Supabase
- Check Site URL matches exactly
- Ensure both URLs are in the list

### Issue 3: Code Exchange Fails

**Causes:**
- PKCE flow not properly configured
- Missing code_verifier
- Server-side vs client-side mismatch

**Solution:**
- Try disabling PKCE in Supabase settings (if available)
- Or ensure proper code exchange handling

## ✅ Quick Test

1. Go to `/forgot-password`
2. Enter your email
3. Check email IMMEDIATELY
4. Click the link WITHIN 1 MINUTE
5. Should redirect to `/reset-password` with session

If this doesn't work, check Supabase logs for specific errors.

