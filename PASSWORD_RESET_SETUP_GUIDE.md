# Password Reset Setup Guide

This guide will help you set up the password reset functionality for your payroll management application.

## ✅ What's Already Implemented

The following features have been fully implemented:

1. **Forgot Password Page** (`/forgot-password`)
   - Users can enter their email to request a password reset
   - Rate limiting protection (5 attempts per 15 minutes)
   - Security: Prevents email enumeration

2. **Reset Password Page** (`/reset-password`)
   - Handles password reset from email links
   - Strong password validation
   - Secure password update flow

3. **API Routes**
   - `/api/auth/forgot-password` - Sends reset email
   - `/api/auth/reset-password` - Updates password (handled client-side)

4. **Security Features**
   - Rate limiting on forgot password requests
   - Strong password requirements (8+ chars, uppercase, lowercase, number)
   - Generic error messages to prevent user enumeration
   - Automatic session cleanup after password reset

## 🔧 Required Supabase Configuration

### Step 1: Configure Site URL in Supabase

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your site URLs:

   **For Development:**
   ```
   http://localhost:3000
   ```

   **For Production:**
   ```
   https://your-domain.com
   ```

5. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/reset-password
   https://your-domain.com/reset-password
   ```

### Step 2: Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Find the **Reset Password** template
3. Customize the email content if desired
4. Make sure the **Reset Link** uses this format:
   ```
   {{ .ConfirmationURL }}
   ```

   The link will automatically redirect to your `/reset-password` page.

### Step 3: Set Environment Variable (For Production)

If you're deploying to production, set the `NEXT_PUBLIC_SITE_URL` environment variable:

**For Vercel:**
- Go to your project settings
- Add environment variable:
  - Key: `NEXT_PUBLIC_SITE_URL`
  - Value: `https://your-domain.com`

**For other platforms:**
- Set the environment variable in your deployment platform's settings
- Use your production domain URL

**Note:** If not set, the app will try to use `NEXT_PUBLIC_VERCEL_URL` or default to `http://localhost:3000` for development.

## 📧 Email Configuration

### Email Provider Setup

Make sure your Supabase project has an email provider configured:

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure your email service:
   - **Default (Supabase SMTP)**: Works out of the box, limited to 3 emails/hour
   - **Custom SMTP**: Recommended for production
     - Gmail SMTP
     - SendGrid
     - AWS SES
     - Other SMTP providers

### Custom SMTP Setup (Recommended for Production)

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enter your SMTP credentials:
   - **Host**: Your SMTP server
   - **Port**: Usually 587 or 465
   - **Username**: Your email
   - **Password**: Your email password or app-specific password
   - **Sender Email**: The email address that will send reset emails
   - **Sender Name**: Display name for emails

3. Test the configuration by sending a test email

## 🔄 How It Works

### Password Reset Flow

1. **User requests reset:**
   - User goes to `/forgot-password`
   - Enters their email
   - Clicks "Send Reset Link"

2. **Email sent:**
   - Supabase sends password reset email
   - Email contains a secure token and redirect link
   - Link points to `/reset-password`

3. **User clicks link:**
   - Supabase automatically creates a session
   - User is redirected to `/reset-password`
   - Page detects active session

4. **User sets new password:**
   - User enters new password (twice for confirmation)
   - Password is validated (8+ chars, uppercase, lowercase, number)
   - Password is updated via Supabase
   - Session is cleared for security
   - User is redirected to login with success message

## 🧪 Testing

### Test the Flow Locally

1. **Start your development server:**
   ```bash
   pnpm dev
   ```

2. **Test forgot password:**
   - Go to http://localhost:3000/login
   - Click "Forgot password?"
   - Enter a registered email
   - Check your email (or Supabase logs) for the reset link

3. **Test reset password:**
   - Click the reset link from email
   - You should be redirected to `/reset-password`
   - Enter a new password
   - Verify you can login with the new password

### Test Rate Limiting

1. Try submitting the forgot password form 6 times quickly
2. You should see a rate limit error after 5 attempts
3. Wait 15 minutes or restart the server to reset the limit

## 🔒 Security Features

### Implemented Security Measures

✅ **Rate Limiting**: 5 attempts per 15 minutes per IP  
✅ **Email Enumeration Prevention**: Always returns success message  
✅ **Strong Password Requirements**: Enforced on both client and server  
✅ **Token Expiration**: Supabase handles token expiration automatically  
✅ **Session Cleanup**: Session cleared after password reset  
✅ **Generic Error Messages**: Prevents information leakage  

## 🐛 Troubleshooting

### Reset Link Not Working

**Problem:** Clicking reset link shows "Invalid or expired reset link"

**Solutions:**
1. Check that your site URL is correctly configured in Supabase
2. Verify the redirect URL matches exactly (including protocol http/https)
3. Check that the token hasn't expired (default is 1 hour)
4. Make sure you're using the latest link (each request creates a new token)

### Email Not Received

**Problem:** Reset email not arriving

**Solutions:**
1. Check spam/junk folder
2. Verify email is registered in your Supabase project
3. Check Supabase dashboard → Authentication → Users
4. Verify SMTP configuration (if using custom SMTP)
5. Check Supabase logs for email sending errors
6. Make sure you haven't exceeded email rate limits

### Rate Limit Issues

**Problem:** Getting rate limited too quickly

**Solutions:**
1. Rate limit resets after 15 minutes
2. Restart your development server to clear in-memory rate limits
3. For production, consider upgrading to Redis-based rate limiting

### Password Update Fails

**Problem:** "Failed to reset password" error

**Solutions:**
1. Ensure the reset link was clicked recently (session must be active)
2. Check browser console for detailed errors
3. Verify password meets requirements (8+ chars, uppercase, lowercase, number)
4. Try requesting a new reset link

## 📝 Additional Notes

- **Email Confirmation**: Password reset emails work regardless of email confirmation status
- **Session Duration**: Reset tokens expire after 1 hour by default (configurable in Supabase)
- **Multiple Requests**: Users can request multiple reset links; only the latest one is valid
- **Production**: Always use custom SMTP for production to avoid rate limits

## 🚀 Next Steps

After setup:

1. ✅ Test the forgot password flow
2. ✅ Test the reset password flow
3. ✅ Verify emails are being sent
4. ✅ Test rate limiting
5. ✅ Customize email templates if desired
6. ✅ Configure production SMTP for deployment

---

## Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure Supabase project settings are configured correctly

For Supabase-specific issues, refer to: https://supabase.com/docs/guides/auth

