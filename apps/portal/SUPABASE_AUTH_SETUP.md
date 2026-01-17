# Supabase Auth Setup Guide

This document outlines the complete Supabase authentication setup for the IFS Portal, including email verification and password reset flows.

## Overview

The portal now has a complete authentication system with:
- ✅ Email/password registration with email verification
- ✅ Email/password login
- ✅ Password reset flow
- ✅ Custom verification pages
- ✅ Proper redirect handling

## Supabase Dashboard Configuration

### 1. Enable Email Confirmation

Navigate to **Authentication > Providers > Email** in your Supabase dashboard:

1. **Confirm email**: Toggle this ON to require users to verify their email before accessing the app
2. **Secure email change**: Toggle this ON for additional security (recommended)

### 2. Configure URL Settings

Navigate to **Authentication > URL Configuration** in your Supabase dashboard:

#### Site URL
Set your production URL as the Site URL:
```
https://portal.yourwebsite.com
```

For local development, you can temporarily set:
```
http://localhost:3001
```

#### Redirect URLs
Add the following redirect URLs (whitelist):

For **Production**:
```
https://portal.yourwebsite.com/verify-email
https://portal.yourwebsite.com/reset-password
https://portal.yourwebsite.com/**
```

For **Local Development**:
```
http://localhost:3001/verify-email
http://localhost:3001/reset-password
http://localhost:3001/**
```

⚠️ **Important**: These URLs must be whitelisted, or email confirmation and password reset links will not work.

### 3. Customize Email Templates (Optional)

Navigate to **Authentication > Email Templates** to customize:

#### Confirm Signup Email
Update the confirmation link to use your custom page:
```html
<a href="{{ .SiteURL }}/verify-email?token_hash={{ .TokenHash }}&type=email">Verify your email</a>
```

#### Reset Password Email
Update the reset link:
```html
<a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery">Reset your password</a>
```

## Application Setup

### Environment Variables

Your [.env](apps/portal/.env) file should already have:
```
VITE_SUPABASE_URL=https://duewbxktgjugeknesmqn.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Routes Configured

The following routes are now available:

| Route | Page | Description |
|-------|------|-------------|
| `/register` | RegisterPage | User registration with email verification |
| `/login` | LoginPage | User login |
| `/forgot-password` | ForgotPasswordPage | Request password reset |
| `/verify-email` | EmailVerificationPage | Email verification handler |
| `/reset-password` | ResetPasswordPage | Password reset handler |

## User Flow Diagrams

### Registration Flow

```
User fills form → Click "Create account"
    ↓
Backend creates user (unconfirmed)
    ↓
User redirected to /verify-email (pending state)
    ↓
User receives email with verification link
    ↓
User clicks link → /verify-email?token_hash=xxx&type=email
    ↓
Token verified by Supabase
    ↓
User redirected to /Dashboard (logged in)
```

### Password Reset Flow

```
User goes to /forgot-password
    ↓
User enters email → Click "Send reset link"
    ↓
Reset email sent with link
    ↓
User clicks link → /reset-password?token_hash=xxx&type=recovery
    ↓
User enters new password
    ↓
Password updated → Redirect to /Login
```

### Login Flow

```
User enters credentials → Click "Sign in"
    ↓
If email not verified:
    ↓
    Error: "Email not confirmed"
    ↓
    User can request new verification email

If email verified:
    ↓
    User logged in → Redirect to /Dashboard
```

## Files Modified/Created

### New Files Created:
1. [`packages/shared/src/components/auth/EmailVerificationPage.jsx`](packages/shared/src/components/auth/EmailVerificationPage.jsx) - Email verification page
2. [`packages/shared/src/components/auth/ResetPasswordPage.jsx`](packages/shared/src/components/auth/ResetPasswordPage.jsx) - Password reset page
3. [`apps/portal/src/pages/VerifyEmail.jsx`](apps/portal/src/pages/VerifyEmail.jsx) - Portal wrapper for verification
4. [`apps/portal/src/pages/ResetPassword.jsx`](apps/portal/src/pages/ResetPassword.jsx) - Portal wrapper for reset

### Modified Files:
1. [`packages/shared/src/api/supabaseAuth.js`](packages/shared/src/api/supabaseAuth.js:70-90) - Added `emailRedirectTo` to signup
2. [`packages/shared/src/components/auth/RegisterPage.jsx`](packages/shared/src/components/auth/RegisterPage.jsx:66-95) - Updated to handle verification flow
3. [`apps/portal/src/pages/index.jsx`](apps/portal/src/pages/index.jsx) - Added routes for new pages
4. [`apps/portal/src/pages/Layout.jsx`](apps/portal/src/pages/Layout.jsx:18) - Added pages to noLayoutPages array

## Testing the Setup

### 1. Test Registration with Email Verification

1. Go to `/register`
2. Fill in the registration form
3. Click "Create account"
4. You should be redirected to `/verify-email` with a "Check your email" message
5. Check your email inbox for the verification email
6. Click the verification link
7. You should be redirected to the dashboard and logged in

### 2. Test Login Before Email Verification

1. Try to login with unverified credentials
2. You should see an error: "Email not confirmed"
3. This is expected behavior when email confirmation is enabled

### 3. Test Password Reset

1. Go to `/forgot-password`
2. Enter your email
3. Click "Send reset link"
4. Check your email for the reset link
5. Click the link
6. You should land on `/reset-password`
7. Enter a new password
8. You should be redirected to `/login`

### 4. Test Direct Navigation

1. Navigate to `/verify-email` without a token
2. You should see "Check your email" message (pending state)
3. Navigate to `/reset-password` without a token
4. You should be redirected to `/forgot-password` with an error

## Troubleshooting

### Issue: Email verification links not working

**Solution**:
- Ensure redirect URLs are whitelisted in Supabase Dashboard → Authentication → URL Configuration
- Check that the URL format matches exactly (including http/https)

### Issue: "Invalid token" error

**Causes**:
- Token expired (tokens are valid for 24 hours by default)
- Token already used
- Wrong token type

**Solution**: Request a new verification/reset email

### Issue: Users not receiving emails

**Checks**:
1. Check spam folder
2. Verify email provider settings in Supabase
3. Check Supabase logs for email delivery status
4. For production, configure a custom SMTP provider in Supabase

### Issue: Login succeeds even without email verification

**Solution**:
- Check that "Confirm email" is enabled in Supabase Dashboard → Authentication → Providers → Email
- This setting controls whether email verification is required

## Security Considerations

1. **Redirect URL Whitelist**: Always maintain a strict whitelist of allowed redirect URLs
2. **Token Expiry**: Default token expiry is 24 hours - consider reducing for sensitive applications
3. **Rate Limiting**: Supabase has built-in rate limiting, but consider additional measures for password reset
4. **HTTPS Only**: Always use HTTPS in production for redirect URLs
5. **Email Provider**: Use a reliable SMTP provider in production (not Supabase's default)

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Redirect URLs Guide](https://supabase.com/docs/guides/auth/redirect-urls)
- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)

## Next Steps

1. ✅ Configure Supabase dashboard settings (URL configuration, email confirmation)
2. ✅ Test the complete flow in development
3. ⬜ Customize email templates with your branding
4. ⬜ Set up custom SMTP provider for production emails
5. ⬜ Add email verification reminder in user profile for unverified users
6. ⬜ Consider adding "Resend verification email" functionality
