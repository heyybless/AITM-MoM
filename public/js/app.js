// Global variables
let currentUser = null;
let eligibleAttendees = [];

// DOM Elements
const authContainer = document.getElementById('authContainer');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const createMeetingForm = document.getElementById('createMeetingForm');
const meetingsList = document.getElementById('meetingsList');
const meetingNotesModal = document.getElementById('meetingNotesModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }

    // Form event listeners
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    document.getElementById('meetingFormElement').addEventListener('submit', handleCreateMeeting);
    document.getElementById('meetingNotesForm').addEventListener('submit', handleMeetingNotes);
});

// Authentication Functions
function showLogin() {
    document.querySelector('.toggle-btn.active').classList.remove('active');
    document.querySelector('.toggle-btn').classList.add('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
}

function showRegister() {
    document.querySelector('.toggle-btn.active').classList.remove('active');
    document.querySelectorAll('.toggle-btn')[1].classList.add('active');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
}

function toggleDepartmentField() {
    const role = document.getElementById('registerRole').value;
    const departmentGroup = document.getElementById('departmentGroup');
    
    if (role === 'hod' || role === 'faculty') {
        departmentGroup.classList.remove('hidden');
        document.getElementById('registerDepartment').required = true;
    } else {
        departmentGroup.classList.add('hidden');
        document.getElementById('registerDepartment').required = false;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showSuccess('Login successful!');
            showDashboard();
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Login failed. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    const department = document.getElementById('registerDepartment').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role, department })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Registration successful! Please login.');
            showLogin();
            document.getElementById('registerFormElement').reset();
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Registration failed. Please try again.');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    authContainer.classList.remove('hidden');
    dashboard.classList.add('hidden');
    showLogin();
}

// Dashboard Functions
function showDashboard() {
    authContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.name}!`;
    showMyMeetings();
}

// Meeting Functions
async function showCreateMeeting() {
    hideAllSections();
    createMeetingForm.classList.remove('hidden');
    
    // Load eligible attendees based on user role
    await loadEligibleAttendees();
}

function hideCreateMeeting() {
    createMeetingForm.classList.add('hidden');
    document.getElementById('meetingFormElement').reset();
}

async function loadEligibleAttendees() {
    try {
        const response = await fetch(`/api/meetings/eligible-attendees/${currentUser.id}`);
        const attendees = await response.json();
        
        eligibleAttendees = attendees;
        displayAttendeesList(attendees);
    } catch (error) {
        showError('Failed to load attendees');
    }
}

function displayAttendeesList(attendees) {
    const attendeesContainer = document.getElementById('attendeesList');
    attendeesContainer.innerHTML = '';

    if (attendees.length === 0) {
        attendeesContainer.innerHTML = '<p>No eligible attendees found for your role.</p>';
        return;
    }

    const attendeesDiv = document.createElement('div');
    attendeesDiv.className = 'attendees-selection';

    attendees.forEach(attendee => {
        const attendeeDiv = document.createElement('div');
        attendeeDiv.className = 'attendee-item';
        
        attendeeDiv.innerHTML = `
            <input type="checkbox" id="attendee_${attendee._id}" value="${attendee._id}">
            <label for="attendee_${attendee._id}">
                ${attendee.name} (${attendee.role}${attendee.department ? ' - ' + attendee.department : ''})
            </label>
        `;
        
        attendeesDiv.appendChild(attendeeDiv);
    });

    attendeesContainer.appendChild(attendeesDiv);
}

async function handleCreateMeeting(e) {
    e.preventDefault();
    
    const title = document.getElementById('meetingTitle').value;
    const agenda = document.getElementById('meetingAgenda').value;
    const date = document.getElementById('meetingDate').value;
    const time = document.getElementById('meetingTime').value;
    const duration = document.getElementById('meetingDuration').value;
    const location = document.getElementById('meetingLocation').value;
    
    // Get selected attendees
    const checkboxes = document.querySelectorAll('#attendeesList input[type="checkbox"]:checked');
    const attendeeIds = Array.from(checkboxes).map(cb => cb.value);

    if (attendeeIds.length === 0) {
        showError('Please select at least one attendee');
        return;
    }

    try {
        const response = await fetch('/api/meetings/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                agenda,
                date,
                time,
                duration,
                location,
                organizerId: currentUser.id,
                attendeeIds
            })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Meeting created successfully and invitations sent!');
            hideCreateMeeting();
            showMyMeetings();
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Failed to create meeting. Please try again.');
    }
}

async function showMyMeetings() {
    hideAllSections();
    meetingsList.classList.remove('hidden');
    
    try {
        const response = await fetch(`/api/meetings/user/${currentUser.id}`);
        const meetings = await response.json();
        
        displayMeetings(meetings);
    } catch (error) {
        showError('Failed to load meetings');
    }
}

function displayMeetings(meetings) {
    const container = document.getElementById('meetingsContainer');
    container.innerHTML = '';

    if (meetings.length === 0) {
        container.innerHTML = '<p>No meetings found.</p>';
        return;
    }

    meetings.forEach(meeting => {
        const meetingDiv = document.createElement('div');
        meetingDiv.className = 'meeting-card';
        
        const isOrganizer = meeting.organizer._id === currentUser.id;
        const meetingDate = new Date(meeting.date);
        const isPast = meetingDate < new Date();
        
        meetingDiv.innerHTML = `
            <div class="meeting-header">
                <h4 class="meeting-title">${meeting.title}</h4>
                <span class="meeting-status status-${meeting.status}">${meeting.status}</span>
            </div>
            <div class="meeting-info">
                <p><strong>Date:</strong> ${meetingDate.toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${meeting.time}</p>
                <p><strong>Location:</strong> ${meeting.location}</p>
                <p><strong>Organizer:</strong> ${meeting.organizer.name}</p>
                <p><strong>Attendees:</strong> ${meeting.attendees.length}</p>
            </div>
            <div class="meeting-actions">
                ${isOrganizer && meeting.status === 'scheduled' && isPast ? 
                    `<button class="btn-primary btn-small" onclick="openMeetingNotesModal('${meeting._id}')">Add Meeting Report</button>` : 
                    ''}
            </div>
        `;
        
        container.appendChild(meetingDiv);
    });
}

// Meeting Notes Functions
function openMeetingNotesModal(meetingId) {
    document.getElementById('meetingIdForNotes').value = meetingId;
    meetingNotesModal.classList.remove('hidden');
}

function closeMeetingNotesModal() {
    meetingNotesModal.classList.add('hidden');
    document.getElementById('meetingNotesForm').reset();
}

async function handleMeetingNotes(e) {
    e.preventDefault();
    
    const meetingId = document.getElementById('meetingIdForNotes').value;
    const discussionSummary = document.getElementById('discussionSummary').value;
    const decisionsMade = document.getElementById('decisionsMade').value.split('\n').filter(d => d.trim());
    const actionItems = document.getElementById('actionItems').value.split('\n').filter(a => a.trim()).map(item => ({ item }));

    try {
        const response = await fetch(`/api/meetings/${meetingId}/notes`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                discussionSummary,
                decisionsMade,
                actionItems
            })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Meeting report saved and sent to attendees!');
            closeMeetingNotesModal();
            showMyMeetings();
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('Failed to save meeting notes. Please try again.');
    }
}

// Utility Functions
function hideAllSections() {
    createMeetingForm.classList.add('hidden');
    meetingsList.classList.add('hidden');
}

function showSuccess(message) {
    showAlert(message, 'success');
}

function showError(message) {
    showAlert(message, 'error');
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.querySelector('.container').insertBefore(alert, document.querySelector('.container').firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
