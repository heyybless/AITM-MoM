const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const demoRoutes = require('./routes/demo');

dotenv.config();

const app = express();
let isMongoConnected = false;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Try to connect to MongoDB first
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ MongoDB Connected - using production mode');
    isMongoConnected = true;
    
    // Use production routes with MongoDB
    const authRoutes = require('./routes/auth');
    const meetingRoutes = require('./routes/meetings');
    app.use('/api/auth', authRoutes);
    app.use('/api/meetings', meetingRoutes);
})
.catch(err => {
    console.log('⚠️  MongoDB not available - falling back to demo mode');
    console.log('💡 To enable full functionality, set up MongoDB and update MONGODB_URI in .env');
    console.log('🎮 Demo mode: Registration and login will work with temporary data');
    
    // Use demo routes as fallback
    app.use('/api/auth', demoRoutes);
    app.use('/api/meetings', demoRoutes);
});

// Always provide demo routes for testing
app.use('/api/demo', demoRoutes);

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Listen on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
    console.log('📝 Ready to create meetings!');
});
