# Environment Variables Configuration

This document lists all required environment variables for the Lumintu Suite application.

## Required Variables

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database
```
- **Description:** PostgreSQL connection string
- **Required:** Yes
- **Example:** `postgresql://postgres:password@localhost:5432/lumintu_suite`

### Authentication
```
AUTH_SECRET=your-secret-key-here
```
- **Description:** Secret key for NextAuth JWT token signing
- **Required:** Yes
- **Generation:** Use `openssl rand -base64 32` to generate
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

```
NEXTAUTH_URL=https://yourdomain.com
```
- **Description:** Base URL for NextAuth
- **Required:** Yes
- **Development:** `http://localhost:3000`
- **Production:** Your actual domain

### Payment Processing (Midtrans)
```
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
```
- **Description:** Midtrans server key for API calls
- **Required:** Yes
- **Sandbox:** Starts with `SB-Mid-server-`
- **Production:** Starts with `Mid-server-`

```
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
```
- **Description:** Midtrans client key for frontend
- **Required:** Yes
- **Sandbox:** Starts with `SB-Mid-client-`
- **Production:** Starts with `Mid-client-`

```
MIDTRANS_IS_PRODUCTION=false
```
- **Description:** Midtrans environment flag
- **Required:** Yes
- **Development/Sandbox:** `false`
- **Production:** `true`

### Email Service (Resend)
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```
- **Description:** Resend API key for email sending
- **Required:** Yes
- **Format:** Starts with `re_`
- **Get from:** https://resend.com/api-keys

```
EMAIL_FROM=noreply@yourdomain.com
```
- **Description:** Default sender email address
- **Required:** Yes
- **Example:** `noreply@lumintu.com`

## Removed Variables (Supabase)

The following Supabase environment variables are no longer needed:
- ❌ `NEXT_PUBLIC_SUPABASE_URL`
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ❌ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- ❌ `SUPABASE_SERVICE_ROLE_KEY`

## Setup Instructions

### 1. Create .env.local file
```bash
cp docs/ENVIRONMENT.md .env.local
```

### 2. Generate AUTH_SECRET
```bash
openssl rand -base64 32
```

### 3. Configure Database
Set your PostgreSQL connection string in `DATABASE_URL`

### 4. Configure Midtrans
- Get sandbox keys from Midtrans dashboard
- Set `MIDTRANS_IS_PRODUCTION=false` for development
- Set `MIDTRANS_IS_PRODUCTION=true` for production

### 5. Configure Resend
- Get API key from Resend dashboard
- Verify your sender domain in Resend

### 6. Set NEXTAUTH_URL
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

## Development Environment Example

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/lumintu_suite
AUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@lumintu.com
```

## Production Environment Example

```env
DATABASE_URL=postgresql://user:password@host:port/database
AUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://lumintu.com
MIDTRANS_SERVER_KEY=Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=true
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@lumintu.com
```

## Security Notes

1. **Never commit .env.local to git** - It's in .gitignore
2. **Use strong secrets** - Generate AUTH_SECRET with sufficient entropy
3. **Rotate secrets regularly** - Especially for production
4. **Use different secrets per environment** - Development vs production
5. **Limit API key permissions** - Only grant necessary permissions

## Vercel Deployment

When deploying to Vercel, set these environment variables in:
- Vercel Dashboard → Settings → Environment Variables

Add all variables listed above under "Required Variables".

## Verification

After setting environment variables, verify:
```bash
npm run dev
```

If the application starts successfully, environment variables are configured correctly.
