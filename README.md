# AITM MOM - Minutes of Meeting Management System

A comprehensive web application for managing college meeting minutes and coordination between different levels of college administration.

## Features

- **Role-based Access Control**: Different roles for Principal, Administrator, HOD, and Faculty
- **Hierarchical Meeting Organization**: 
  - Administrators can call meetings with Principals
  - Principals can call meetings with HODs
  - HODs can call meetings with Faculty from their department
- **Email Notifications**: Automatic email invitations and meeting reports
- **Meeting Management**: Create, schedule, and track meetings
- **Meeting Reports**: Generate and distribute meeting minutes with discussion summaries, decisions, and action items

## Installation

1. **Clone or download the project**
   ```bash
   cd aitm-mom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB Database**
   - Create a MongoDB database (local or cloud-based like MongoDB Atlas)
   - Get your MongoDB connection string

4. **Configure Environment Variables**
   - Open the `.env` file
   - Replace the placeholder values with your actual configuration:
   ```
   MONGODB_URI=your_actual_mongodb_connection_string
   PORT=5000
   EMAIL_USER=your_gmail_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

5. **Email Setup (Gmail)**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password for the application
   - Use this App Password in the EMAIL_PASS field

## Running the Application

1. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development (with auto-restart):
   ```bash
   npm run dev
   ```

2. **Access the application**
   - Open your browser and go to `http://localhost:5000`

## User Roles and Permissions

### Administrator
- Can create meetings and invite Principals
- Has access to high-level administrative meetings

### Principal
- Can create meetings and invite HODs
- Can participate in meetings called by Administrators

### Head of Department (HOD)
- Can create meetings and invite Faculty from their specific department
- Can participate in meetings called by Principals
- Must specify their department during registration

### Faculty
- Can participate in meetings called by HODs from their department
- Must specify their department during registration

## Usage Guide

### Registration
1. Go to the application homepage
2. Click on "Register"
3. Fill in your details:
   - Full Name
   - Email (this will be used for notifications)
   - Password
   - Role (Principal/Administrator/HOD/Faculty)
   - Department (if you're HOD or Faculty)

### Creating a Meeting
1. Login to your account
2. Click "Create Meeting"
3. Fill in meeting details:
   - Meeting Title
   - Agenda
   - Date and Time
   - Duration
   - Location
   - Select attendees (based on your role)
4. Submit to create and send invitations

### Managing Meetings
1. Click "My Meetings" to view all your meetings
2. For past meetings you organized, you can add meeting reports
3. Meeting reports include:
   - Discussion Summary
   - Decisions Made
   - Action Items

### Meeting Reports
- After a meeting concludes, the organizer can add meeting notes
- Reports are automatically emailed to all attendees
- Reports include structured information about discussions, decisions, and action items

## Project Structure

```
aitm-mom/
├── models/
│   ├── User.js          # User model with role-based fields
│   └── Meeting.js       # Meeting model with attendees and notes
├── routes/
│   ├── auth.js          # Authentication routes
│   └── meetings.js      # Meeting management routes
├── public/
│   ├── css/
│   │   └── style.css    # Application styling
│   ├── js/
│   │   └── app.js       # Frontend JavaScript
│   └── index.html       # Main HTML file
├── index.js             # Main server file
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables
└── README.md           # This file
```

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML, CSS, JavaScript
- **Email**: Nodemailer
- **Authentication**: bcryptjs for password hashing

## Email Configuration

The application uses Gmail for sending emails. To set this up:

1. Use your Gmail account
2. Enable 2-factor authentication
3. Generate an App Password specifically for this application
4. Use the App Password (not your regular password) in the .env file

## Troubleshooting

### MongoDB Connection Issues
- Ensure your MongoDB service is running
- Check that your connection string is correct
- Verify network connectivity if using a cloud database

### Email Issues
- Verify your Gmail credentials are correct
- Make sure you're using an App Password, not your regular password
- Check that 2-factor authentication is enabled on your Gmail account

### Port Issues
- If port 5000 is in use, change the PORT value in .env file
- Make sure no other application is using the same port

## Support

For issues or questions regarding the application, please check:
1. MongoDB connection is properly configured
2. Email credentials are correct
3. All dependencies are installed
4. Environment variables are set correctly

## Future Enhancements

- Real-time notifications
- Calendar integration
- Document attachment support
- Advanced reporting and analytics
- Mobile responsive design improvements
