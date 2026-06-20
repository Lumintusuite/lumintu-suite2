# Production Checklist

Use this checklist to ensure Lumintu Suite is ready for production launch.

## Security

- [ ] Review and test authentication flow (Auth.js)
- [ ] Review and test authorization (admin/member/affiliate access)
- [ ] Verify middleware protection on all protected routes
- [ ] Test admin access controls
- [ ] Test member access controls
- [ ] Test affiliate access controls
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Rotate all API keys
- [ ] Review and update CORS settings
- [ ] Enable rate limiting on API endpoints
- [ ] Set up security monitoring
- [ ] Verify AUTH_SECRET is strong and unique
- [ ] Verify HTTPS is enforced in production

## Database (Prisma + PostgreSQL)

- [ ] Run `npx prisma migrate deploy` to apply migrations
- [ ] Verify all tables created correctly
- [ ] Verify all indexes created
- [ ] Run `npx prisma generate` to generate client
- [ ] Create admin user manually in database
- [ ] Enable automated backups (PostgreSQL)
- [ ] Test backup restoration
- [ ] Review database performance
- [ ] Set up connection pooling
- [ ] Verify database connection string is secure
- [ ] Test database failover (if applicable)

## Configuration

- [ ] Set all required environment variables (see docs/ENVIRONMENT.md)
- [ ] Verify DATABASE_URL is correct
- [ ] Verify AUTH_SECRET is generated and secure
- [ ] Verify NEXTAUTH_URL is set to production domain
- [ ] Verify Midtrans configuration (sandbox vs production)
- [ ] Verify Resend configuration and domain verification
- [ ] Set production domain
- [ ] Configure SSL certificates
- [ ] Set up CDN for static assets (optional)
- [ ] Verify email domain is verified in Resend

## Performance

- [ ] Review and optimize images
- [ ] Implement dynamic imports where appropriate
- [ ] Verify server components usage
- [ ] Check bundle size
- [ ] Enable caching headers
- [ ] Optimize database queries
- [ ] Set up CDN
- [ ] Enable compression
- [ ] Monitor page load times
- [ ] Set up performance monitoring

## Error Handling

- [ ] Test error boundaries
- [ ] Verify friendly error pages
- [ ] Test API error handling
- [ ] Test form error handling
- [ ] Set up error logging
- [ ] Configure error alerts
- [ ] Test webhook error handling
- [ ] Review error logs setup

## SEO

- [ ] Verify metadata configuration
- [ ] Test sitemap.xml
- [ ] Test robots.txt
- [ ] Verify OpenGraph tags
- [ ] Test social media previews
- [ ] Set up analytics
- [ ] Configure structured data
- [ ] Test page titles
- [ ] Verify meta descriptions

## Monitoring

- [ ] Set up application monitoring
- [ ] Set up error tracking
- [ ] Set up performance monitoring
- [ ] Set up uptime monitoring
- [ ] Configure alerts
- [ ] Set up log aggregation
- [ ] Test webhook monitoring
- [ ] Set up database monitoring
- [ ] Configure email delivery monitoring

## Testing

- [ ] Test user registration flow (Auth.js)
- [ ] Test login flow (Auth.js)
- [ ] Test logout flow (Auth.js)
- [ ] Test session persistence
- [ ] Test admin dashboard
- [ ] Test member dashboard
- [ ] Test product creation
- [ ] Test checkout flow
- [ ] Test payment processing (Midtrans)
- [ ] Test license generation
- [ ] Test affiliate sign-up
- [ ] Test affiliate approval
- [ ] Test referral tracking
- [ ] Test email delivery (Resend)
- [ ] Test webhook processing (Midtrans callbacks)

## Documentation

- [ ] Update deployment guide (Vercel)
- [ ] Document environment variables (docs/ENVIRONMENT.md)
- [ ] Document API endpoints
- [ ] Create troubleshooting guide
- [ ] Document backup procedures (PostgreSQL)
- [ ] Create runbook for common issues
- [ ] Document escalation procedures
- [ ] Update README with new architecture
- [ ] Document Prisma migration process

## Compliance

- [ ] Review privacy policy
- [ ] Review terms of service
- [ ] Set up cookie consent
- [ ] Configure GDPR compliance
- [ ] Review data retention policy
- [ ] Set up data export functionality (user account deletion)
- [ ] Configure data deletion (user account deletion)
- [ ] Review accessibility compliance

## Launch Readiness

- [ ] All checklist items completed
- [ ] Stakeholder sign-off
- [ ] Marketing materials ready
- [ ] Support team trained
- [ ] Documentation published
- [ ] Monitoring configured (Vercel Analytics)
- [ ] Alerts configured
- [ ] Backup procedures tested (PostgreSQL)
- [ ] Rollback plan documented
- [ ] Launch window scheduled
- [ ] Run `npm install`, `npx prisma generate`, `npm run lint`, `npm run build` successfully

## Post-Launch

- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Review analytics
- [ ] Check payment processing
- [ ] Verify email delivery
- [ ] Monitor webhook processing
- [ ] Review security logs
- [ ] Address any issues promptly
- [ ] Plan next iteration
