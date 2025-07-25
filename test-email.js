// Email configuration test script for AITM MOM
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

console.log('📧 AITM MOM Email Configuration Test');
console.log('='.repeat(40));

// Test email configuration
async function testEmailConfig() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('❌ Email not configured in .env file');
        console.log('💡 Please update EMAIL_USER and EMAIL_PASS in .env');
        return;
    }

    if (process.env.EMAIL_USER === 'demo@gmail.com') {
        console.log('⚠️  Using demo email configuration');
        console.log('💡 Please update EMAIL_USER with your real Gmail address');
        return;
    }

    console.log('🔍 Testing email configuration...');
    console.log(`📧 Email User: ${process.env.EMAIL_USER}`);
    console.log(`🔑 App Password: ${process.env.EMAIL_PASS ? '***configured***' : 'NOT SET'}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        // Verify connection
        await transporter.verify();
        console.log('✅ Email configuration is valid!');
        
        // Send test email
        const testEmail = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: '🧪 AITM MOM Email Test',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">🎉 Email Configuration Successful!</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>✅ Test Status:</strong> SUCCESS</p>
                        <p><strong>📧 From:</strong> ${process.env.EMAIL_USER}</p>
                        <p><strong>🕒 Time:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>🎯 Purpose:</strong> Email configuration test</p>
                    </div>
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #1976d2;">💡 <strong>Your AITM MOM system is ready to send emails!</strong></p>
                    </div>
                    <p>Meeting invitations and reports will be sent automatically.</p>
                </div>
            `
        };

        await transporter.sendMail(testEmail);
        console.log('📬 Test email sent successfully!');
        console.log(`📥 Check your inbox: ${process.env.EMAIL_USER}`);
        
    } catch (error) {
        console.log('❌ Email configuration failed!');
        console.log('🔍 Error details:', error.message);
        
        if (error.message.includes('Username and Password not accepted')) {
            console.log('💡 Solution: Enable 2FA on Gmail and use App Password');
        } else if (error.message.includes('Invalid login')) {
            console.log('💡 Solution: Check EMAIL_USER and EMAIL_PASS in .env file');
        }
    }
}

// Run the test
testEmailConfig().then(() => {
    console.log('\n🏁 Email test completed');
}).catch(console.error);
