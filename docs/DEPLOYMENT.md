# Deployment Guide

This guide covers deploying Lumintu Suite to production.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Midtrans account for payments
- Resend account for emails
- Domain name configured

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Midtrans
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key

# Resend
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Application
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Supabase Setup

1. Create a new Supabase project
2. Run all migrations in order:
   - `001_profiles.sql`
   - `002_categories_products.sql`
   - `003_storage_buckets.sql`
   - `004_orders.sql`
   - `005_payments.sql`
   - `006_licenses.sql`
   - `007_affiliates.sql`
   - `008_email_logs.sql`
   - `009_webhook_logs.sql`
   - `010_error_logs.sql`

3. Configure storage buckets for product files
4. Set up Row Level Security (RLS) policies
5. Create an admin user manually in the profiles table

## Midtrans Setup

1. Create a Midtrans account
2. Get your Server Key and Client Key
3. Configure webhook URL: `https://yourdomain.com/api/webhooks/midtrans`
4. Add environment variables

## Resend Setup

1. Create a Resend account
2. Verify your domain
3. Get your API key
4. Add environment variables

## Deployment Options

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Digital Ocean App Platform
- AWS Amplify

## Post-Deployment Checklist

- [ ] Run database migrations
- [ ] Create admin user
- [ ] Test authentication flow
- [ ] Test payment flow with Midtrans
- [ ] Test email delivery with Resend
- [ ] Verify webhook endpoints
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Set up monitoring/alerting

## Monitoring

Monitor the following:
- Error logs in Supabase
- Webhook logs for payment processing
- Email logs for delivery issues
- Application performance
- Database performance

## Backup Strategy

- Enable Supabase automated backups
- Regularly export database schema
- Backup storage buckets
- Keep environment variables secure

## Security Considerations

- Never commit `.env.local` to version control
- Use strong passwords for admin accounts
- Enable 2FA on all service accounts
- Regularly update dependencies
- Monitor for security vulnerabilities
- Keep API keys secure and rotate regularly

## Troubleshooting

### Authentication Issues
- Check Supabase auth configuration
- Verify RLS policies
- Check middleware settings

### Payment Issues
- Verify Midtrans webhook URL
- Check server key configuration
- Review webhook logs

### Email Issues
- Verify Resend domain verification
- Check API key validity
- Review email logs

### Database Issues
- Run migrations in correct order
- Check RLS policies
- Verify indexes are created
