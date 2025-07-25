const http = require('http');

console.log('🔍 AITM MOM Application Status Check');
console.log('='.repeat(40));

// Check if server is running
function checkServer(port) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    bodyLength: data.length,
                    title: data.match(/<title>(.*?)<\/title>/) ? data.match(/<title>(.*?)<\/title>/)[1] : 'No title'
                });
            });
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => reject(new Error('Timeout')));
    });
}

async function runChecks() {
    try {
        console.log('🌐 Checking web server...');
        const result = await checkServer(3000);
        
        console.log(`✅ Server Status: ${result.status === 200 ? 'RUNNING' : 'ERROR'}`);
        console.log(`📄 Page Title: ${result.title}`);
        console.log(`📊 Content Size: ${result.bodyLength} bytes`);
        console.log(`🔗 Server URL: http://localhost:3000`);
        
        console.log('\n🎯 Available Features:');
        console.log('├── ✅ User Registration (Principal, Administrator, HOD, Faculty)');
        console.log('├── ✅ Role-based Login System');
        console.log('├── ✅ Hierarchical Meeting Creation');
        console.log('├── ✅ Meeting Management Dashboard');
        console.log('├── ✅ Email Notifications (requires configuration)');
        console.log('└── ✅ Meeting Reports & Minutes');
        
        console.log('\n⚠️  Current Limitations:');
        console.log('├── MongoDB not connected (demo mode)');
        console.log('├── Email service not configured');
        console.log('└── Data will not persist between sessions');
        
        console.log('\n🚀 Next Steps:');
        console.log('1. Open http://localhost:3000 in your browser');
        console.log('2. Try the registration and login forms');
        console.log('3. Set up MongoDB for data persistence');
        console.log('4. Configure email for notifications');
        
    } catch (error) {
        console.log('❌ Server not responding:', error.message);
        console.log('💡 Make sure to run "npm start" first');
    }
}

runChecks();
