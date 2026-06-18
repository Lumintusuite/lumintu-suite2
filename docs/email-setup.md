# Email Setup

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Resend Setup

1. Sign up for a Resend account at https://resend.com/
2. Get your API key from the Resend dashboard
3. Add the API key to your environment variables
4. Configure your sending domain in Resend

## Email Types

The system sends the following emails:

### Buyer Emails
- **Welcome Email**: Sent when a user registers
- **Purchase Success**: Sent when an order payment is successful
- **License Generated**: Sent when a license is generated for a product

### Affiliate Emails
- **Affiliate Approved**: Sent when an affiliate application is approved
- **Referral Sale**: Sent when a referral generates a commission
- **Commission Created**: Sent when a commission is approved

### Admin Emails
- **Test Email**: Used to test email configuration

## Email Templates

Email templates are located in `lib/emails/templates.ts` and use responsive HTML.

## Email Logs

All email activity is logged in the `email_logs` table with:
- User ID
- Email type
- Status (pending, sent, failed)
- Sent timestamp
- Error message (if failed)

## Troubleshooting

If emails are not sending:
1. Check that RESEND_API_KEY is set correctly
2. Verify your Resend account is active
3. Check email logs in the admin dashboard for error messages
4. Ensure EMAIL_FROM is a verified domain in Resend
