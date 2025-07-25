// MongoDB connection test script for AITM MOM
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('🗄️  AITM MOM MongoDB Connection Test');
console.log('='.repeat(40));

async function testMongoConnection() {
    console.log('🔍 Testing MongoDB connection...');
    console.log(`📡 Connection URI: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connection successful!');
        
        // Test database operations
        console.log('🔍 Testing database operations...');
        
        // Create a simple test collection
        const TestSchema = new mongoose.Schema({
            name: String,
            timestamp: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('ConnectionTest', TestSchema);
        
        // Insert a test document
        const testDoc = new TestModel({
            name: 'AITM MOM Connection Test'
        });
        
        await testDoc.save();
        console.log('✅ Test document created successfully');
        
        // Read the test document
        const foundDoc = await TestModel.findOne({ name: 'AITM MOM Connection Test' });
        console.log('✅ Test document retrieved successfully');
        console.log(`📄 Document ID: ${foundDoc._id}`);
        
        // Clean up - delete the test document
        await TestModel.deleteOne({ _id: foundDoc._id });
        console.log('✅ Test document cleaned up');
        
        // Close connection
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        
        console.log('\n🎉 MongoDB is ready for AITM MOM!');
        console.log('💡 You can now restart your application to use MongoDB');
        
    } catch (error) {
        console.log('❌ MongoDB connection failed!');
        console.log('🔍 Error details:', error.message);
        
        if (error.message.includes('authentication failed')) {
            console.log('💡 Solution: Check username and password in connection string');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('💡 Solution: Check internet connection and cluster URL');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Solution: If using local MongoDB, make sure it\'s running');
            console.log('   Run: brew services start mongodb/brew/mongodb-community');
        }
    }
}

// Run the test
testMongoConnection().then(() => {
    console.log('\n🏁 MongoDB test completed');
    process.exit(0);
}).catch(console.error);
