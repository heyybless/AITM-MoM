const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Demo user storage (in-memory, for demo purposes only)
let demoUsers = [];
let demoMeetings = [];
let userId = 1;
let meetingId = 1;

// Demo registration route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        // Check if user already exists
        const existingUser = demoUsers.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Validate department requirement
        if ((role === 'hod' || role === 'faculty') && !department) {
            return res.status(400).json({ message: 'Department is required for HOD and Faculty roles' });
        }

        // Create demo user
        const user = {
            id: userId++,
            name,
            email,
            password: '***hidden***', // Don't store actual passwords in demo
            role,
            department: (role === 'hod' || role === 'faculty') ? department : undefined,
            createdAt: new Date()
        };

        demoUsers.push(user);

        res.status(201).json({
            message: 'Demo registration successful! (Data will not persist)',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            },
            note: 'This is demo mode - configure MongoDB for data persistence'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Demo server error during registration' });
    }
});

// Demo login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = demoUsers.find(user => user.email === email);
        if (!user) {
            return res.status(400).json({ 
                message: 'User not found. Try registering first in demo mode.',
                availableUsers: demoUsers.map(u => ({ email: u.email, role: u.role }))
            });
        }

        res.json({
            message: 'Demo login successful!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            },
            note: 'This is demo mode - configure MongoDB for data persistence'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Demo server error during login' });
    }
});

// Get users by role (for meeting attendee selection)
router.get('/users/:role', async (req, res) => {
    try {
        const { role } = req.params;
        const { department } = req.query;

        let users = demoUsers.filter(user => user.role === role);
        
        if (department) {
            users = users.filter(user => user.department === department);
        }

        res.json(users.map(user => ({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Demo server error fetching users' });
    }
});

// Demo create meeting
router.post('/create', async (req, res) => {
    try {
        const { title, agenda, date, time, duration, organizerId, attendeeIds, location } = req.body;

        const organizer = demoUsers.find(user => user.id == organizerId);
        if (!organizer) {
            return res.status(400).json({ message: 'Organizer not found' });
        }

        const attendees = attendeeIds.map(id => {
            const user = demoUsers.find(u => u.id == id);
            return { user: user || { name: 'Unknown', email: 'unknown@demo.com' } };
        });

        const meeting = {
            _id: meetingId++,
            title,
            agenda,
            date: new Date(date),
            time,
            duration,
            organizer: organizer,
            attendees: attendees,
            location,
            status: 'scheduled',
            createdAt: new Date()
        };

        demoMeetings.push(meeting);

        // Send email notifications to attendees
        let emailStatus = 'not configured';
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
            process.env.EMAIL_USER !== 'demo@gmail.com') {
            
            try {
                const attendeeEmails = attendees.map(attendee => attendee.user.email);
                
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: attendeeEmails,
                    subject: `Meeting Invitation: ${title}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #667eea;">📅 You are invited to a meeting</h2>
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>📝 Title:</strong> ${title}</p>
                                <p><strong>📋 Agenda:</strong> ${agenda}</p>
                                <p><strong>📅 Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                                <p><strong>⏰ Time:</strong> ${time}</p>
                                <p><strong>🏢 Location:</strong> ${location}</p>
                                <p><strong>👤 Organizer:</strong> ${organizer.name} (${organizer.role})</p>
                                <p><strong>⏱️ Duration:</strong> ${duration} minutes</p>
                            </div>
                            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #1976d2;">💡 <strong>Note:</strong> This invitation is sent from AITM MOM (Minutes of Meeting) system.</p>
                            </div>
                            <p style="color: #666;">Please make sure to attend the meeting on time.</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                emailStatus = 'sent successfully';
                console.log(`📧 Meeting invitation emails sent to: ${attendeeEmails.join(', ')}`);
                
            } catch (emailError) {
                console.error('📧 Email sending failed:', emailError.message);
                emailStatus = 'failed to send';
            }
        } else {
            console.log('📧 Email not configured. Update EMAIL_USER and EMAIL_PASS in .env file');
        }

        res.status(201).json({
            message: `Meeting created successfully! Email status: ${emailStatus}`,
            meeting,
            emailStatus,
            note: emailStatus === 'not configured' ? 
                'Configure EMAIL_USER and EMAIL_PASS in .env file to enable email notifications' : 
                'Meeting invitations sent to attendees'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Demo error creating meeting' });
    }
});

// Get meetings for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const meetings = demoMeetings.filter(meeting => 
            meeting.organizer.id == userId || 
            meeting.attendees.some(attendee => attendee.user.id == userId)
        );

        res.json(meetings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Demo error fetching meetings' });
    }
});

// Get eligible attendees based on organizer role
router.get('/eligible-attendees/:organizerId', async (req, res) => {
    try {
        const { organizerId } = req.params;
        const organizer = demoUsers.find(user => user.id == organizerId);

        if (!organizer) {
            return res.json([]);
        }

        let eligibleUsers = [];

        switch (organizer.role) {
            case 'administrator':
                eligibleUsers = demoUsers.filter(user => user.role === 'principal');
                break;
            case 'principal':
                eligibleUsers = demoUsers.filter(user => user.role === 'hod');
                break;
            case 'hod':
                eligibleUsers = demoUsers.filter(user => 
                    user.role === 'faculty' && user.department === organizer.department
                );
                break;
            default:
                eligibleUsers = [];
        }

        res.json(eligibleUsers.map(user => ({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Demo error fetching eligible attendees' });
    }
});

// Add meeting notes
router.put('/:meetingId/notes', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { discussionSummary, decisionsMade, actionItems } = req.body;

        const meeting = demoMeetings.find(m => m._id == meetingId);
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        meeting.status = 'completed';
        meeting.meetingNotes = {
            discussionSummary,
            decisionsMade,
            actionItems: actionItems.map(item => ({ item }))
        };

        // Send meeting report to all attendees
        let emailStatus = 'not configured';
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
            process.env.EMAIL_USER !== 'demo@gmail.com') {
            
            try {
                const attendeeEmails = meeting.attendees.map(attendee => attendee.user.email);
                // Also send to organizer
                attendeeEmails.push(meeting.organizer.email);
                
                const reportHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #667eea;">📋 Meeting Report: ${meeting.title}</h2>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>📅 Date:</strong> ${meeting.date.toLocaleDateString()}</p>
                            <p><strong>⏰ Time:</strong> ${meeting.time}</p>
                            <p><strong>🏢 Location:</strong> ${meeting.location}</p>
                            <p><strong>👤 Organizer:</strong> ${meeting.organizer.name}</p>
                            <p><strong>👥 Attendees:</strong> ${meeting.attendees.length} participants</p>
                        </div>
                        
                        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #2e7d32; margin-top: 0;">💬 Discussion Summary</h3>
                            <p style="line-height: 1.6;">${discussionSummary}</p>
                        </div>
                        
                        <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #f57c00; margin-top: 0;">✅ Decisions Made</h3>
                            <ul style="line-height: 1.6;">
                                ${decisionsMade.map(decision => `<li>${decision}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1976d2; margin-top: 0;">📋 Action Items</h3>
                            <ul style="line-height: 1.6;">
                                ${actionItems.map(item => `<li>${item.item}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div style="background-color: #fce4ec; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #c2185b;">📧 <strong>Note:</strong> This report is generated from AITM MOM (Minutes of Meeting) system.</p>
                        </div>
                    </div>
                `;

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: [...new Set(attendeeEmails)], // Remove duplicates
                    subject: `📋 Meeting Report: ${meeting.title}`,
                    html: reportHtml
                };

                await transporter.sendMail(mailOptions);
                emailStatus = 'sent successfully';
                console.log(`📧 Meeting report emails sent to: ${[...new Set(attendeeEmails)].join(', ')}`);
                
            } catch (emailError) {
                console.error('📧 Email sending failed:', emailError.message);
                emailStatus = 'failed to send';
            }
        } else {
            console.log('📧 Email not configured. Update EMAIL_USER and EMAIL_PASS in .env file');
        }

        res.json({
            message: `Meeting notes saved successfully! Email status: ${emailStatus}`,
            meeting,
            emailStatus,
            note: emailStatus === 'not configured' ? 
                'Configure EMAIL_USER and EMAIL_PASS in .env file to enable email reports' : 
                'Meeting report sent to all attendees'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Demo error updating meeting notes' });
    }
});

// Get demo status
router.get('/status', (req, res) => {
    res.json({
        mode: 'DEMO',
        message: 'Running in demo mode - data will not persist',
        stats: {
            registeredUsers: demoUsers.length,
            createdMeetings: demoMeetings.length,
            userRoles: demoUsers.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {})
        },
        users: demoUsers.map(user => ({
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department
        }))
    });
});

module.exports = router;
