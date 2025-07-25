# 📧 Email Setup Guide for AITM MOM

To enable email notifications for meeting invitations and reports, follow these steps:

## 🔧 Gmail Configuration (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Gmail account settings
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. In your Google Account settings, go to "Security"
2. Under "2-Step Verification", click on "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Enter "AITM MOM" as the custom name
5. Google will generate a 16-character app password

### Step 3: Update .env File
Open your `.env` file and update the email settings:

```env
MONGODB_URI=mongodb://localhost:27017/aitm-mom
PORT=3000
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_character_app_password
```

**Important:** Use the 16-character app password, NOT your regular Gmail password!

### Step 4: Restart the Server
```bash
npm start
```

## 🧪 Testing Email Configuration

1. **Register users** with real email addresses
2. **Create a meeting** and invite attendees
3. **Check the server console** for email status messages
4. **Check email inboxes** of attendees for invitations

## 📧 What Emails Are Sent?

### Meeting Invitations
- Sent when a meeting is created
- Contains meeting details (title, agenda, date, time, location)
- Sent to all selected attendees

### Meeting Reports
- Sent when meeting notes are added
- Contains discussion summary, decisions made, and action items
- Sent to all attendees and the organizer

## 🔍 Troubleshooting

### Email Not Sending?
1. **Check console logs** for error messages
2. **Verify credentials** in .env file
3. **Ensure 2FA is enabled** on Gmail account
4. **Use app password** instead of regular password

### Common Error Messages:
- `"Invalid login"` → Check email and app password
- `"Username and Password not accepted"` → Enable 2FA and use app password
- `"Connection timeout"` → Check internet connection

### Testing Email Configuration:
You can test if emails are working by:

```bash
# Check demo status
curl http://localhost:3000/api/demo/status

# Register test users
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Principal",
    "email": "your_real_email@gmail.com",
    "password": "password123",
    "role": "principal"
  }'
```

## 🌟 Email Templates

### Meeting Invitation Template:
- Professional HTML format
- Meeting details clearly displayed
- AITM MOM branding
- Mobile-friendly design

### Meeting Report Template:
- Structured sections for discussion, decisions, and action items
- Color-coded content areas
- Professional formatting
- Easy to read and print

## 🔒 Security Notes

- Never commit your real email credentials to version control
- Keep your app password secure
- Regularly rotate app passwords
- Use environment variables for sensitive data

## 🚀 Next Steps

Once email is configured:
1. Register users with real email addresses
2. Test meeting creation and invitations
3. Test meeting reports functionality
4. Configure MongoDB for persistent data storage

For production deployment, consider using:
- **SendGrid** for high-volume email sending
- **AWS SES** for reliable email delivery
- **Mailgun** for advanced email features

---

💡 **Tip:** For testing purposes, you can use a secondary Gmail account to avoid mixing test emails with your primary account.
