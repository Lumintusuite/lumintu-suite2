export function getWelcomeEmailTemplate(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Lumintu Suite</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f9f9f9; border-radius: 8px; padding: 30px; }
    h1 { color: #2563eb; margin-bottom: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Lumintu Suite!</h1>
    <p>Hi ${name},</p>
    <p>Thank you for joining Lumintu Suite. We're excited to have you on board!</p>
    <p>Your account has been successfully created and you can now access all our features.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/member" class="button">Go to Dashboard</a>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Lumintu Suite. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getPurchaseSuccessEmailTemplate(name: string, orderId: string, total: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f9f9f9; border-radius: 8px; padding: 30px; }
    h1 { color: #2563eb; margin-bottom: 20px; }
    .order-details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .total { font-size: 18px; font-weight: bold; color: #2563eb; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Order Confirmation</h1>
    <p>Hi ${name},</p>
    <p>Thank you for your purchase! Your order has been successfully processed.</p>
    <div class="order-details">
      <p><strong>Order ID:</strong> ${orderId.slice(0, 8)}...</p>
      <p><strong>Total:</strong> <span class="total">$${total.toFixed(2)}</span></p>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${orderId}" class="button">View Order Details</a>
    <p>Your licenses will be generated shortly and sent to you via email.</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Lumintu Suite. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getLicenseGeneratedEmailTemplate(name: string, productName: string, licenseKey: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>License Generated</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f9f9f9; border-radius: 8px; padding: 30px; }
    h1 { color: #2563eb; margin-bottom: 20px; }
    .license-box { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border: 2px solid #2563eb; }
    .license-key { font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your License is Ready!</h1>
    <p>Hi ${name},</p>
    <p>Your license for <strong>${productName}</strong> has been generated successfully.</p>
    <div class="license-box">
      <p style="margin: 0 0 10px 0; font-weight: bold;">License Key:</p>
      <p class="license-key">${licenseKey}</p>
    </div>
    <p>Please save this license key securely. You will need it to activate your product.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/licenses" class="button">View All Licenses</a>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Lumintu Suite. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getAffiliateApprovedEmailTemplate(name: string, affiliateCode: string): string {
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}?ref=${affiliateCode}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Affiliate Application Approved</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f9f9f9; border-radius: 8px; padding: 30px; }
    h1 { color: #2563eb; margin-bottom: 20px; }
    .affiliate-code { background: white; padding: 15px; border-radius: 4px; margin: 20px 0; border: 2px solid #2563eb; }
    .code { font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Congratulations! You're Now an Affiliate</h1>
    <p>Hi ${name},</p>
    <p>Your affiliate application has been approved! You can now start earning commissions by referring customers to Lumintu Suite.</p>
    <div class="affiliate-code">
      <p style="margin: 0 0 10px 0; font-weight: bold;">Your Affiliate Code:</p>
      <p class="code">${affiliateCode}</p>
    </div>
    <p>Share your referral link to earn commissions:</p>
    <p style="font-family: monospace; background: white; padding: 10px; border-radius: 4px; word-break: break-all;">${referralUrl}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/affiliate" class="button">Go to Affiliate Dashboard</a>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Lumintu Suite. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getReferralSaleEmailTemplate(name: string, commissionAmount: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Referral Sale</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f9f9f9; border-radius: 8px; padding: 30px; }
    h1 { color: #2563eb; margin-bottom: 20px; }
    .commission { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border: 2px solid #10b981; }
    .amount { font-size: 24px; font-weight: bold; color: #10b981; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Great News! You Earned a Commission</h1>
    <p>Hi ${name},</p>
    <p>You've made a referral sale! Your commission is now pending approval.</p>
    <div class="commission">
      <p style="margin: 0 0 10px 0; font-weight: bold;">Commission Amount:</p>
      <p class="amount">$${commissionAmount.toFixed(2)}</p>
    </div>
    <p>Keep up the great work! Continue sharing your referral link to earn more commissions.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/affiliate/referrals" class="button">View Referral History</a>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Lumintu Suite. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getCommissionCreatedEmailTemplate(name: string, commissionAmount: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commission Approved</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f9f9f9; border-radius: 8px; padding: 30px; }
    h1 { color: #10b981; margin-bottom: 20px; }
    .commission { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border: 2px solid #10b981; }
    .amount { font-size: 24px; font-weight: bold; color: #10b981; }
    .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Commission Approved!</h1>
    <p>Hi ${name},</p>
    <p>Your commission has been approved and is now available for payout.</p>
    <div class="commission">
      <p style="margin: 0 0 10px 0; font-weight: bold;">Approved Amount:</p>
      <p class="amount">$${commissionAmount.toFixed(2)}</p>
    </div>
    <p>Thank you for being a valued affiliate partner!</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/affiliate" class="button">View Your Dashboard</a>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Lumintu Suite. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getTestEmailTemplate(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: #f9f9f9; border-radius: 8px; padding: 30px; }
    h1 { color: #2563eb; margin-bottom: 20px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Test Email</h1>
    <p>Hi ${name},</p>
    <p>This is a test email from Lumintu Suite. Your email configuration is working correctly!</p>
    <p>If you received this email, your email system is set up properly.</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Lumintu Suite. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
