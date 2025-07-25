const express = require('express');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email configuration (you'll need to configure this with your email service)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Create a new meeting
router.post('/create', async (req, res) => {
    try {
        const { title, agenda, date, time, duration, organizerId, attendeeIds, location } = req.body;

        // Create meeting
        const meeting = new Meeting({
            title,
            agenda,
            date: new Date(date),
            time,
            duration,
            organizer: organizerId,
            attendees: attendeeIds.map(id => ({ user: id })),
            location
        });

        await meeting.save();

        // Populate organizer and attendees for email
        await meeting.populate('organizer attendees.user');

        // Send email notifications to attendees
        const attendeeEmails = meeting.attendees.map(attendee => attendee.user.email);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: attendeeEmails,
            subject: `Meeting Invitation: ${title}`,
            html: `
                <h2>You are invited to a meeting</h2>
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Agenda:</strong> ${agenda}</p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Organizer:</strong> ${meeting.organizer.name}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            message: 'Meeting created and invitations sent',
            meeting
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating meeting' });
    }
});

// Get meetings for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const meetings = await Meeting.find({
            $or: [
                { organizer: userId },
                { 'attendees.user': userId }
            ]
        })
        .populate('organizer', 'name email role')
        .populate('attendees.user', 'name email role')
        .sort({ date: 1 });

        res.json(meetings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching meetings' });
    }
});

// Update meeting status and add meeting notes
router.put('/:meetingId/notes', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { discussionSummary, decisionsMade, actionItems } = req.body;

        const meeting = await Meeting.findByIdAndUpdate(
            meetingId,
            {
                status: 'completed',
                meetingNotes: {
                    discussionSummary,
                    decisionsMade,
                    actionItems
                }
            },
            { new: true }
        ).populate('organizer attendees.user');

        // Send meeting report to all attendees
        const attendeeEmails = meeting.attendees.map(attendee => attendee.user.email);
        
        const reportHtml = `
            <h2>Meeting Report: ${meeting.title}</h2>
            <p><strong>Date:</strong> ${meeting.date.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${meeting.time}</p>
            
            <h3>Discussion Summary</h3>
            <p>${discussionSummary}</p>
            
            <h3>Decisions Made</h3>
            <ul>
                ${decisionsMade.map(decision => `<li>${decision}</li>`).join('')}
            </ul>
            
            <h3>Action Items</h3>
            <ul>
                ${actionItems.map(item => `<li>${item.item} - Assigned to: ${item.assignedTo ? 'TBD' : 'TBD'}</li>`).join('')}
            </ul>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: attendeeEmails,
            subject: `Meeting Report: ${meeting.title}`,
            html: reportHtml
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: 'Meeting notes saved and report sent',
            meeting
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating meeting notes' });
    }
});

// Get eligible attendees based on organizer role
router.get('/eligible-attendees/:organizerId', async (req, res) => {
    try {
        const { organizerId } = req.params;
        const organizer = await User.findById(organizerId);

        let eligibleUsers = [];

        switch (organizer.role) {
            case 'administrator':
                // Administrator can invite principals
                eligibleUsers = await User.find({ role: 'principal' }).select('-password');
                break;
            case 'principal':
                // Principal can invite HODs
                eligibleUsers = await User.find({ role: 'hod' }).select('-password');
                break;
            case 'hod':
                // HOD can invite faculty from same department
                eligibleUsers = await User.find({ 
                    role: 'faculty', 
                    department: organizer.department 
                }).select('-password');
                break;
            default:
                eligibleUsers = [];
        }

        res.json(eligibleUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching eligible attendees' });
    }
});

module.exports = router;
