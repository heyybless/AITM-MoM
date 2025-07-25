const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    agenda: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        default: 60
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attendees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['invited', 'accepted', 'declined', 'attended'],
            default: 'invited'
        }
    }],
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    location: {
        type: String,
        default: 'Conference Room'
    },
    meetingNotes: {
        discussionSummary: String,
        decisionsMade: [String],
        actionItems: [{
            item: String,
            assignedTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            dueDate: Date,
            status: {
                type: String,
                enum: ['pending', 'in-progress', 'completed'],
                default: 'pending'
            }
        }]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);
