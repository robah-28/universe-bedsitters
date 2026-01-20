// Global Variables
let currentUser = null;
let currentAdmin = null;
let selectedRoom = null;
let currentRating = 0;
let userBookings = [];
let reportedIssues = [];
let reviews = [];
let allComrades = [];
let adminUsers = [];

// Initialize demo data
function initDemoData() {
    // Load from localStorage
    const storedUser = localStorage.getItem('universe_currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUserDisplay();
    }

    const storedAdmin = localStorage.getItem('universe_currentAdmin');
    if (storedAdmin) {
        currentAdmin = JSON.parse(storedAdmin);
        updateAdminDisplay();
    }

    // Load bookings
    const storedBookings = localStorage.getItem('universe_bookings');
    userBookings = storedBookings ? JSON.parse(storedBookings) : [];

    // Load issues
    const storedIssues = localStorage.getItem('universe_issues');
    reportedIssues = storedIssues ? JSON.parse(storedIssues) : [];

    // Load reviews
    const storedReviews = localStorage.getItem('universe_reviews');
    reviews = storedReviews ? JSON.parse(storedReviews) : [];

    // Load comrades
    const storedComrades = localStorage.getItem('universe_comrades');
    if (storedComrades) {
        allComrades = JSON.parse(storedComrades);
    } else {
        // Create demo comrades
        allComrades = [
            { id: 'CU/001/21', name: 'Comrade CU/001/21', phone: '0716 102 910', status: 'active' },
            { id: 'CU/002/21', name: 'Comrade CU/002/21', phone: '0712 345 678', status: 'active' },
            { id: 'CU/003/21', name: 'Comrade CU/003/21', phone: '0713 456 789', status: 'active' }
        ];
        localStorage.setItem('universe_comrades', JSON.stringify(allComrades));
    }

    // Load admin users
    const storedAdmins = localStorage.getItem('universe_admins');
    if (storedAdmins) {
        adminUsers = JSON.parse(storedAdmins);
    } else {
        // Create default admin
        adminUsers = [
            { username: 'admin', password: 'admin123', name: 'System Admin', role: 'superadmin' },
            { username: 'warden', password: 'warden123', name: 'Hostel Warden', role: 'admin' }
        ];
        localStorage.setItem('universe_admins', JSON.stringify(adminUsers));
    }

    // Set semester dates
    const today = new Date();
    const checkinInput = document.getElementById('checkinDate');
    const checkoutInput = document.getElementById('checkoutDate');

    if (checkinInput) {
        checkinInput.value = today.toISOString().split('T')[0];
        checkinInput.min = today.toISOString().split('T')[0];
    }

    if (checkoutInput) {
        const semesterEnd = new Date();
        semesterEnd.setMonth(semesterEnd.getMonth() + 4);
        checkoutInput.value = semesterEnd.toISOString().split('T')[0];
        checkoutInput.min = today.toISOString().split('T')[0];
    }

    // Load rooms
    loadRooms();

    // Display data if available
    if (currentUser) {
        displayIssues();
        displayReviews();
    }
}

// Login Function for Comrades
function login() {
    const studentId = document.getElementById('studentId').value.trim().toUpperCase();
    const password = document.getElementById('password').value;

    if (!studentId) {
        alert('Please enter your Chuka University Registration Number');
        return;
    }

    if (!studentId.startsWith('CU/')) {
        alert('Please enter a valid Chuka University registration number (e.g., CU/001/21)');
        return;
    }

    // Check if comrade exists, if not create new
    let comrade = allComrades.find(c => c.id === studentId);
    if (!comrade) {
        comrade = {
            id: studentId,
            name: 'Comrade ' + studentId,
            phone: 'Not provided',
            status: 'active',
            joined: new Date().toISOString()
        };
        allComrades.push(comrade);
        localStorage.setItem('universe_comrades', JSON.stringify(allComrades));
    }

    currentUser = {
        id: studentId,
        name: comrade.name,
        phone: comrade.phone
    };

    localStorage.setItem('universe_currentUser', JSON.stringify(currentUser));
    updateUserDisplay();
    closeModal();

    // Update registration field in payment form
    const regInput = document.getElementById('regNumber');
    if (regInput) {
        regInput.value = studentId;
    }

    alert(`Karibu Comrade ${studentId}! You can now book your semester.`);
}

// Admin Login Function
function adminLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!username || !password) {
        alert('Please enter admin username and password');
        return;
    }

    const admin = adminUsers.find(a => a.username === username && a.password === password);

    if (!admin) {
        alert('Invalid admin credentials');
        return;
    }

    currentAdmin = admin;
    localStorage.setItem('universe_currentAdmin', JSON.stringify(currentAdmin));
    updateAdminDisplay();
    closeModal();
    openAdminPanel();

    alert(`Welcome ${admin.name}! Admin panel loaded.`);
}

// Admin Logout
function adminLogout() {
    currentAdmin = null;
    localStorage.removeItem('universe_currentAdmin');
    updateAdminDisplay();
    closeModal();
    alert('Admin logged out successfully');
}

// Open Admin Login
function openAdminLogin() {
    openModal('adminLoginModal');
}

// Open Admin Panel
function openAdminPanel() {
    if (!currentAdmin) {
        openAdminLogin();
        return;
    }

    loadAdminDashboard();
    openModal('adminPanelModal');
}

// Update Admin Display
function updateAdminDisplay() {
    const adminBtn = document.querySelector('.admin-btn');
    if (!adminBtn) return;

    if (currentAdmin) {
        adminBtn.innerHTML = `<i class="fas fa-user-shield"></i> ${currentAdmin.name}`;
        adminBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)';
    } else {
        adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
        adminBtn.style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
    }
}

// Update User Display
function updateUserDisplay() {
    const userNameElement = document.getElementById('userName');
    const loginBtn = document.getElementById('loginBtn');

    if (currentUser) {
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
            userNameElement.style.display = 'inline-block';
        }
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }

        const regInput = document.getElementById('regNumber');
        if (regInput) {
            regInput.value = currentUser.id;
        }
    } else {
        if (userNameElement) {
            userNameElement.style.display = 'none';
        }
        if (loginBtn) {
            loginBtn.style.display = 'flex';
        }
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Admin Tab Functions
function openAdminTab(tabName, event) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const tabElement = document.getElementById(tabName + 'Tab');
    if (tabElement) {
        tabElement.classList.add('active');
    }

    // Activate selected button
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Load tab data
    switch (tabName) {
        case 'dashboard':
            loadAdminDashboard();
            break;
        case 'bookings':
            loadBookingsTable();
            break;
        case 'payments':
            loadPaymentsTable();
            break;
        case 'issues':
            loadIssuesTable();
            break;
        case 'rooms':
            loadRoomsTab();
            break;
        case 'users':
            loadUsersTable();
            break;
    }
}

// Load Admin Dashboard
function loadAdminDashboard() {
    if (!currentAdmin) return;

    // Calculate stats
    const totalComrades = allComrades.length;
    const totalBookings = userBookings.length;
    const totalRevenue = userBookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.amount || 0), 0);
    const pendingIssues = reportedIssues.filter(i => i.status === 'pending').length;

    // Update stats
    updateElementText('totalComrades', totalComrades);
    updateElementText('totalBookings', totalBookings);
    updateElementText('totalRevenue', totalRevenue.toLocaleString());
    updateElementText('pendingIssues', pendingIssues);
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

// Load Bookings Table
function loadBookingsTable() {
    if (!currentAdmin) return;

    const tbody = document.getElementById('bookingsTable');
    if (!tbody) return;

    tbody.innerHTML = '';

    userBookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.comradeName || 'N/A'}</td>
            <td>${booking.comradeId || 'N/A'}</td>
            <td>${booking.roomType || 'N/A'}</td>
            <td>Ksh ${(booking.amount || 0).toLocaleString()}</td>
            <td>${formatDate(booking.checkin)} - ${formatDate(booking.checkout)}</td>
            <td><span class="status-badge ${booking.paymentStatus === 'paid' ? 'status-confirmed' : 'status-pending'}">
                ${booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </span></td>
            <td class="action-buttons">
                <button class="action-btn view" onclick="viewBooking(${booking.id})">View</button>
                ${booking.paymentStatus !== 'paid' ?
                `<button class="action-btn edit" onclick="markAsPaid(${booking.id})">Mark Paid</button>` : ''}
                <button class="action-btn delete" onclick="deleteBooking(${booking.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load Payments Table
function loadPaymentsTable() {
    if (!currentAdmin) return;

    const tbody = document.getElementById('paymentsTable');
    if (!tbody) return;

    const paidBookings = userBookings.filter(b => b.paymentStatus === 'paid');
    const pendingBookings = userBookings.filter(b => !b.paymentStatus || b.paymentStatus !== 'paid');

    // Update summary
    const totalPaid = paidBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalPending = pendingBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

    updateElementText('totalPayments', totalPaid.toLocaleString());
    updateElementText('pendingPayments', totalPending.toLocaleString());

    // Load table
    tbody.innerHTML = '';
    paidBookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>REC-${booking.id}</td>
            <td>${booking.comradeName || 'N/A'}</td>
            <td>Ksh ${(booking.amount || 0).toLocaleString()}</td>
            <td>${formatDate(booking.paymentDate || booking.date)}</td>
            <td>Equity Bank</td>
            <td><span class="status-badge status-paid">Paid</span></td>
            <td><button class="action-btn view" onclick="verifyPayment(${booking.id})">Verify</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Load Issues Table
function loadIssuesTable() {
    if (!currentAdmin) return;

    const tbody = document.getElementById('issuesTable');
    if (!tbody) return;

    tbody.innerHTML = '';

    reportedIssues.forEach(issue => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${issue.id}</td>
            <td>${issue.comradeName || 'N/A'}<br><small>${issue.comradeId || 'N/A'}</small></td>
            <td>${(issue.description || '').substring(0, 50)}${(issue.description || '').length > 50 ? '...' : ''}</td>
            <td><span class="status-badge ${(issue.priority || '') === 'High' ? 'status-pending' : 'status-confirmed'}">
                ${issue.priority || 'Medium'}
            </span></td>
            <td>${formatDate(issue.date)}</td>
            <td><span class="status-badge ${(issue.status || '') === 'resolved' ? 'status-resolved' : 'status-pending'}">
                ${issue.status || 'pending'}
            </span></td>
            <td class="action-buttons">
                <button class="action-btn view" onclick="viewIssue(${issue.id})">View</button>
                ${issue.status !== 'resolved' ?
                `<button class="action-btn resolve" onclick="resolveIssue(${issue.id})">Resolve</button>` : ''}
                <button class="action-btn delete" onclick="deleteIssue(${issue.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load Rooms Tab
function loadRoomsTab() {
    if (!currentAdmin) return;

    // Calculate room occupancy
    const occupiedRooms = userBookings.filter(b => b.paymentStatus === 'paid').length;
    const availableRooms = Math.max(0, 12 - occupiedRooms);

    updateElementText('occupiedRooms', occupiedRooms);
    updateElementText('availableRooms', availableRooms);
}

// Load Users Table
function loadUsersTable() {
    if (!currentAdmin) return;

    const tbody = document.getElementById('usersTable');
    if (!tbody) return;

    tbody.innerHTML = '';

    allComrades.forEach(comrade => {
        const userBookingsCount = userBookings.filter(b => b.comradeId === comrade.id).length;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${comrade.id}</td>
            <td>${comrade.name}</td>
            <td>${comrade.phone}</td>
            <td>${userBookingsCount} booking(s)</td>
            <td><span class="status-badge status-confirmed">${comrade.status || 'active'}</span></td>
            <td class="action-buttons">
                <button class="action-btn view" onclick="viewComrade('${comrade.id}')">View</button>
                <button class="action-btn edit" onclick="editComrade('${comrade.id}')">Edit</button>
                <button class="action-btn delete" onclick="deleteComrade('${comrade.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Admin Actions
function viewBooking(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if (booking) {
        alert(`Booking Details:\n\nID: ${booking.id}\nComrade: ${booking.comradeName}\nRegistration: ${booking.comradeId}\nRoom: ${booking.roomType}\nAmount: Ksh ${booking.amount}\nStatus: ${booking.paymentStatus || 'pending'}\nDate: ${formatDate(booking.date)}`);
    }
}

function markAsPaid(bookingId) {
    if (!currentAdmin) return;

    const booking = userBookings.find(b => b.id === bookingId);
    if (booking) {
        booking.paymentStatus = 'paid';
        booking.paymentDate = new Date().toISOString();
        localStorage.setItem('universe_bookings', JSON.stringify(userBookings));
        loadBookingsTable();
        loadPaymentsTable();
        alert(`Booking ${bookingId} marked as paid.`);
    }
}

function deleteBooking(bookingId) {
    if (!currentAdmin) return;

    if (confirm('Are you sure you want to delete this booking?')) {
        userBookings = userBookings.filter(b => b.id !== bookingId);
        localStorage.setItem('universe_bookings', JSON.stringify(userBookings));
        loadBookingsTable();
        loadAdminDashboard();
        alert('Booking deleted successfully.');
    }
}

function verifyPayment(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if (booking) {
        alert(`Payment Verified!\n\nReceipt: REC-${booking.id}\nComrade: ${booking.comradeName}\nAmount: Ksh ${booking.amount}\nDate: ${formatDate(booking.paymentDate || booking.date)}\nStatus: Confirmed`);
    }
}

function viewIssue(issueId) {
    const issue = reportedIssues.find(i => i.id === issueId);
    if (issue) {
        alert(`Issue Details:\n\nTicket #${issue.id}\nComrade: ${issue.comradeName}\nRegistration: ${issue.comradeId}\nIssue: ${issue.description}\nPriority: ${issue.priority}\nStatus: ${issue.status}\nDate: ${formatDate(issue.date)}`);
    }
}

function resolveIssue(issueId) {
    if (!currentAdmin) return;

    const issue = reportedIssues.find(i => i.id === issueId);
    if (issue) {
        issue.status = 'resolved';
        issue.resolvedDate = new Date().toISOString();
        issue.resolvedBy = currentAdmin.name;
        localStorage.setItem('universe_issues', JSON.stringify(reportedIssues));
        loadIssuesTable();
        displayIssues();
        alert(`Issue ${issueId} marked as resolved.`);
    }
}

function deleteIssue(issueId) {
    if (!currentAdmin) return;

    if (confirm('Are you sure you want to delete this issue?')) {
        reportedIssues = reportedIssues.filter(i => i.id !== issueId);
        localStorage.setItem('universe_issues', JSON.stringify(reportedIssues));
        loadIssuesTable();
        displayIssues();
        alert('Issue deleted successfully.');
    }
}

function markAllIssuesResolved() {
    if (!currentAdmin) return;

    if (confirm('Mark all pending issues as resolved?')) {
        reportedIssues.forEach(issue => {
            if (issue.status === 'pending') {
                issue.status = 'resolved';
                issue.resolvedDate = new Date().toISOString();
                issue.resolvedBy = currentAdmin.name;
            }
        });
        localStorage.setItem('universe_issues', JSON.stringify(reportedIssues));
        loadIssuesTable();
        displayIssues();
        alert('All issues marked as resolved.');
    }
}

function updatePrice(type) {
    if (!currentAdmin) return;

    const inputId = type === 'single' ? 'singlePrice' : 'sharedPrice';
    const input = document.getElementById(inputId);
    if (!input) return;

    const newPrice = parseInt(input.value);

    if (newPrice < 10000 || newPrice > 50000) {
        alert('Price must be between Ksh 10,000 and Ksh 50,000');
        return;
    }

    // Update in localStorage
    const prices = JSON.parse(localStorage.getItem('universe_prices') || '{"single":15000,"shared":20000}');
    prices[type] = newPrice;
    localStorage.setItem('universe_prices', JSON.stringify(prices));

    alert(`${type === 'single' ? 'Single Bedsitter' : 'With Roommate'} price updated to Ksh ${newPrice.toLocaleString()}`);
}

function viewComrade(comradeId) {
    const comrade = allComrades.find(c => c.id === comradeId);
    const bookings = userBookings.filter(b => b.comradeId === comradeId);

    if (comrade) {
        alert(`Comrade Details:\n\nRegistration: ${comrade.id}\nName: ${comrade.name}\nPhone: ${comrade.phone}\nStatus: ${comrade.status}\nTotal Bookings: ${bookings.length}\nJoined: ${formatDate(comrade.joined)}`);
    }
}

function editComrade(comradeId) {
    const comrade = allComrades.find(c => c.id === comradeId);
    if (comrade) {
        const newPhone = prompt('Enter new phone number:', comrade.phone);
        if (newPhone) {
            comrade.phone = newPhone;
            localStorage.setItem('universe_comrades', JSON.stringify(allComrades));
            loadUsersTable();
            alert('Comrade information updated.');
        }
    }
}

function deleteComrade(comradeId) {
    if (!currentAdmin) return;

    if (comradeId === currentUser?.id) {
        alert('Cannot delete currently logged in comrade.');
        return;
    }

    if (confirm('Are you sure you want to delete this comrade? This will also delete their bookings and issues.')) {
        // Delete comrade
        allComrades = allComrades.filter(c => c.id !== comradeId);
        localStorage.setItem('universe_comrades', JSON.stringify(allComrades));

        // Delete comrade's bookings
        userBookings = userBookings.filter(b => b.comradeId !== comradeId);
        localStorage.setItem('universe_bookings', JSON.stringify(userBookings));

        // Delete comrade's issues
        reportedIssues = reportedIssues.filter(i => i.comradeId !== comradeId);
        localStorage.setItem('universe_issues', JSON.stringify(reportedIssues));

        loadUsersTable();
        loadBookingsTable();
        loadIssuesTable();
        loadAdminDashboard();

        alert('Comrade and all associated data deleted.');
    }
}

// Search Functions
function searchBookings() {
    const searchTerm = document.getElementById('searchBooking')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#bookingsTable tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function searchUsers() {
    const searchTerm = document.getElementById('searchUser')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#usersTable tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function filterIssues() {
    const filter = document.getElementById('issueFilter')?.value || 'all';
    const rows = document.querySelectorAll('#issuesTable tr');

    rows.forEach(row => {
        if (filter === 'all') {
            row.style.display = '';
        } else if (filter === 'pending') {
            row.style.display = row.textContent.includes('pending') ? '' : 'none';
        } else if (filter === 'resolved') {
            row.style.display = row.textContent.includes('resolved') ? '' : 'none';
        } else if (filter === 'urgent') {
            row.style.display = row.textContent.includes('High') ? '' : 'none';
        }
    });
}

// Export Data
function exportData() {
    if (!currentAdmin) return;

    const data = {
        exportDate: new Date().toISOString(),
        exportedBy: currentAdmin.name,
        comrades: allComrades,
        bookings: userBookings,
        issues: reportedIssues,
        reviews: reviews,
        admins: adminUsers
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `universe-hostels-data-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    alert('Data exported successfully!');
}

// Room Data
const rooms = [
    {
        id: 1,
        name: "Universe Bedsitters Hostel",
        price: 15000,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
        features: [
            "Single Bedsitter: Ksh 15,000/semester",
            "With Roommate: Ksh 20,000/semester",
            "Strong WiFi throughout semester",
            "Clean water flow 24/7",
            "Reliable electricity with backup",
            "Rooms with ceilings & tiles",
            "Well maintained facilities",
            "Secure for comrades",
            "12 rooms available only",
            "Walking distance to campus"
        ],
        description: "PREMIUM SEMESTER ACCOMMODATION - Exclusive for Chuka University comrades. Limited to 12 rooms only."
    }
];

// Load Rooms
function loadRooms() {
    const container = document.getElementById('roomsContainer');
    if (!container) return;

    container.innerHTML = '';

    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        roomCard.innerHTML = `
            <img src="${room.image}" alt="${room.name}" class="room-img">
            <div class="room-info">
                <h3>${room.name}</h3>
                <div class="room-price">Semester Fee: Ksh ${room.price.toLocaleString()}</div>
                <p><strong>${room.description}</strong></p>
                <div class="room-features">
                    ${room.features.map(feature => `
                        <div class="feature">
                            <i class="fas fa-check-circle"></i>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="book-room-btn" onclick="selectRoom(${room.id})">
                    <i class="fas fa-graduation-cap"></i> Book This Semester
                </button>
            </div>
        `;
        container.appendChild(roomCard);
    });
}

// Select Room
function selectRoom(roomId) {
    if (!currentUser) {
        alert('Please login first as a comrade to book a semester');
        openModal('loginModal');
        return;
    }

    selectedRoom = rooms.find(room => room.id === roomId);
    const roomTypeSelect = document.getElementById('roomType');
    if (roomTypeSelect) {
        roomTypeSelect.value = 'single';
    }

    scrollToSection('book');
}

// Start Booking Process - FIXED FUNCTION
function startBooking() {
    console.log('startBooking called'); // Debug log

    if (!currentUser) {
        alert('Please login first as a comrade to book a semester');
        openModal('loginModal');
        return;
    }

    const checkin = document.getElementById('checkinDate')?.value;
    const checkout = document.getElementById('checkoutDate')?.value;
    const roomTypeSelect = document.getElementById('roomType');
    const roomType = roomTypeSelect ? roomTypeSelect.value : 'single';

    console.log('Checkin:', checkin, 'Checkout:', checkout, 'RoomType:', roomType); // Debug log

    if (!checkin || !checkout) {
        alert('Please select both semester start and end dates');
        return;
    }

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    if (checkoutDate <= checkinDate) {
        alert('Semester end date must be after start date');
        return;
    }

    // Get prices from localStorage or default
    const prices = JSON.parse(localStorage.getItem('universe_prices') || '{"single":15000,"shared":20000}');
    const semesterFee = roomType === 'single' ? prices.single : prices.shared;
    const roomName = roomType === 'single' ? 'Single Bedsitter' : 'With Roommate';

    selectedRoom = {
        name: roomName,
        price: semesterFee
    };

    // Calculate duration in months
    const months = (checkoutDate.getFullYear() - checkinDate.getFullYear()) * 12 +
        (checkoutDate.getMonth() - checkinDate.getMonth());

    // Show booking summary
    const bookingSummary = document.getElementById('bookingSummary');
    if (bookingSummary) {
        bookingSummary.innerHTML = `
            <div class="summary-item">
                <strong>Comrade:</strong> ${currentUser.name}
            </div>
            <div class="summary-item">
                <strong>Registration:</strong> ${currentUser.id}
            </div>
            <div class="summary-item">
                <strong>Accommodation:</strong> ${selectedRoom.name}
            </div>
            <div class="summary-item">
                <strong>Semester Start:</strong> ${formatDate(checkin)}
            </div>
            <div class="summary-item">
                <strong>Semester End:</strong> ${formatDate(checkout)}
            </div>
            <div class="summary-item">
                <strong>Duration:</strong> ${months} month(s)
            </div>
            <div class="summary-item">
                <strong>Rooms Available:</strong> 12 (Limited)
            </div>
            <div class="summary-item total">
                <strong>Semester Fee:</strong> Ksh ${selectedRoom.price.toLocaleString()}
            </div>
            <div class="semester-info" style="margin-top: 1rem; padding: 1rem;">
                <h4><i class="fas fa-info-circle"></i> Important:</h4>
                <p>• Payment required before semester starts</p>
                <p>• Limited to 12 rooms only</p>
                <p>• Strictly for Chuka University comrades</p>
                <p>• Contact: 0716 102 910 for queries</p>
            </div>
        `;
    }

    console.log('Opening booking modal'); // Debug log
    openModal('bookingModal');
}

// Confirm Booking - FIXED FUNCTION
function confirmBooking() {
    console.log('confirmBooking called'); // Debug log

    if (!selectedRoom || !currentUser) {
        alert('No room selected or user not logged in');
        return;
    }

    const checkin = document.getElementById('checkinDate')?.value;
    const checkout = document.getElementById('checkoutDate')?.value;

    if (!checkin || !checkout) {
        alert('Missing dates');
        return;
    }

    const booking = {
        id: Date.now(),
        comradeId: currentUser.id,
        comradeName: currentUser.name,
        roomType: selectedRoom.name,
        checkin: checkin,
        checkout: checkout,
        amount: selectedRoom.price,
        status: 'confirmed',
        date: new Date().toISOString(),
        semester: true,
        paymentStatus: 'pending'
    };

    userBookings.push(booking);
    localStorage.setItem('universe_bookings', JSON.stringify(userBookings));

    closeModal();

    // Update payment section
    const paymentRoomType = document.getElementById('paymentRoomType');
    const paymentAmount = document.getElementById('paymentAmount');

    if (paymentRoomType) {
        paymentRoomType.textContent = selectedRoom.name;
    }
    if (paymentAmount) {
        paymentAmount.textContent = `Ksh ${selectedRoom.price.toLocaleString()}`;
    }

    // Show success message
    const paymentStatus = document.getElementById('paymentStatus');
    if (paymentStatus) {
        paymentStatus.innerHTML = `
            <div style="color: #4caf50; background: #e8f5e9; padding: 1rem; border-radius: 8px;">
                <i class="fas fa-check-circle"></i> 
                Semester booking confirmed! Proceed to payment via Equity Bank.
            </div>
        `;
    }

    scrollToSection('payments');

    alert(`Semester booking confirmed for ${selectedRoom.name}! Please proceed to payment.`);
}

// Process Payment
function processPayment() {
    console.log('processPayment called'); // Debug log

    if (!selectedRoom) {
        alert('Please book a semester first');
        return;
    }

    if (!currentUser) {
        alert('Please login first');
        return;
    }

    const paymentStatus = document.getElementById('paymentStatus');
    if (!paymentStatus) return;

    // Show Equity Bank payment details
    paymentStatus.innerHTML = `
        <div class="paybill-display">
            <h4><i class="fas fa-university"></i> Equity Bank Payment Details</h4>
            <p><strong>PayBill Number:</strong></p>
            <div class="paybill-number">247247</div>
            <p><strong>Account Name:</strong></p>
            <div class="paybill-account">UNIVERSE BEDSITTERS</div>
            <p><strong>Your Account Number:</strong></p>
            <div class="paybill-account" style="background: #fff; color: #1a237e;">
                ${currentUser.id}
            </div>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> 
                After payment, WhatsApp receipt to: <strong>0716 102 910</strong>
            </p>
        </div>
        <div style="color: #2196f3; background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;">
            <i class="fas fa-sync-alt fa-spin"></i><br>
            <strong>Awaiting payment confirmation...</strong><br>
            <small>Once payment is confirmed, contact warden for room allocation</small>
        </div>
    `;

    // Simulate payment confirmation
    setTimeout(() => {
        // Find and update booking
        const latestBooking = userBookings[userBookings.length - 1];
        if (latestBooking && latestBooking.comradeId === currentUser.id) {
            latestBooking.paymentStatus = 'paid';
            latestBooking.paymentDate = new Date().toISOString();
            localStorage.setItem('universe_bookings', JSON.stringify(userBookings));
        }

        paymentStatus.innerHTML = `
            <div style="color: #4caf50; background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <i class="fas fa-check-circle"></i> 
                <strong>Payment recorded successfully!</strong><br>
                Ksh ${selectedRoom.price.toLocaleString()} for ${selectedRoom.name} semester.
            </div>
            <div class="paybill-display">
                <h4><i class="fas fa-phone"></i> Next Steps:</h4>
                <p>1. WhatsApp payment receipt to: <strong>0716 102 910</strong></p>
                <p>2. Contact warden for room allocation</p>
                <p>3. Visit: Slaughter, Chuka University</p>
                <p>4. Show your registration: <strong>${currentUser.id}</strong></p>
                <div style="background: #fff8e1; padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 4px solid #ffb300;">
                    <p><i class="fas fa-exclamation-circle"></i> 
                    <strong>Important:</strong> Bring your student ID and payment receipt</p>
                </div>
            </div>
        `;

        alert(`Payment recorded! WhatsApp receipt to 0716 102 910 for room allocation.`);
    }, 3000);
}

// Report Common Issue
function reportCommonIssue(issueType) {
    if (!currentUser) {
        alert('Please login first as a comrade to report issues');
        openModal('loginModal');
        return;
    }

    let defaultMessage = '';
    switch (issueType) {
        case 'WiFi Problem':
            defaultMessage = 'WiFi is slow or not working in my room. Please check.';
            break;
        case 'Water Problem':
            defaultMessage = 'Water supply issue in my room/hostel. Need immediate attention.';
            break;
        case 'Electricity':
            defaultMessage = 'Electricity problem in my room. Power keeps going off.';
            break;
        case 'Room Maintenance':
            defaultMessage = 'Need room maintenance (ceiling, tiles, door, etc.).';
            break;
        default:
            defaultMessage = `Issue with ${issueType}`;
    }

    const issueDesc = document.getElementById('issueDescription');
    const issueTypeSelect = document.getElementById('issueType');

    if (issueDesc) {
        issueDesc.value = defaultMessage;
    }
    if (issueTypeSelect) {
        issueTypeSelect.value = issueType === 'Electricity' ? 'urgent' : 'major';
    }

    scrollToSection('issues');
}

// Submit Issue Report
function submitIssue() {
    if (!currentUser) {
        alert('Please login first as a comrade to report issues');
        openModal('loginModal');
        return;
    }

    const issueDesc = document.getElementById('issueDescription');
    const issueTypeSelect = document.getElementById('issueType');

    if (!issueDesc || !issueTypeSelect) return;

    const description = issueDesc.value.trim();
    const type = issueTypeSelect.value;

    if (!description) {
        alert('Please describe the issue');
        return;
    }

    const issue = {
        id: Date.now(),
        comradeId: currentUser.id,
        comradeName: currentUser.name,
        description: description,
        type: type,
        status: 'pending',
        date: new Date().toISOString(),
        priority: type === 'urgent' ? 'High' : type === 'major' ? 'Medium' : 'Low',
        response: 'Our warden will contact you shortly via WhatsApp'
    };

    reportedIssues.push(issue);
    localStorage.setItem('universe_issues', JSON.stringify(reportedIssues));

    // Clear form
    issueDesc.value = '';
    issueTypeSelect.value = 'urgent';

    // Show success message
    const issueStatus = document.getElementById('issueStatus');
    if (issueStatus) {
        issueStatus.innerHTML = `
            <div style="color: #4caf50; background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <i class="fas fa-check-circle"></i> 
                <strong>Issue reported successfully!</strong><br>
                Ticket #${issue.id} created. Warden will contact you on WhatsApp.
            </div>
        `;
    }

    // Update issues list
    displayIssues();

    setTimeout(() => {
        if (issueStatus) {
            issueStatus.innerHTML = '';
        }
    }, 5000);
}

// Display Issues
function displayIssues() {
    const issuesList = document.getElementById('issuesList');
    if (!issuesList || !currentUser) return;

    const userIssues = reportedIssues.filter(issue => issue.comradeId === currentUser.id);

    if (userIssues.length === 0) {
        issuesList.innerHTML = `
            <div style="text-align: center; color: #666; padding: 2rem;">
                <i class="fas fa-check-circle" style="font-size: 2rem; color: #4caf50;"></i>
                <p>No issues reported yet</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Report any hostel issues for immediate response</p>
            </div>
        `;
        return;
    }

    issuesList.innerHTML = userIssues.map(issue => `
        <div class="issue-item">
            <div class="issue-header">
                <strong>Ticket #${issue.id}</strong>
                <span class="issue-type ${issue.type}">${issue.priority} Priority</span>
            </div>
            <p><strong>Issue:</strong> ${issue.description}</p>
            <p style="margin-top: 0.5rem;"><strong>Response:</strong> ${issue.response}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.9rem; color: #666;">
                <span><i class="fas fa-calendar"></i> ${formatDate(issue.date)}</span>
                <span><i class="fas fa-info-circle"></i> Status: <strong>${issue.status}</strong></span>
            </div>
        </div>
    `).join('');
}

// Rating System
function rate(stars) {
    currentRating = stars;
    const starElements = document.querySelectorAll('.stars i');

    starElements.forEach((star, index) => {
        if (index < stars) {
            star.classList.add('active');
            star.style.color = '#ffd700';
        } else {
            star.classList.remove('active');
            star.style.color = '#ddd';
        }
    });
}

// Submit Review
function submitReview() {
    if (!currentUser) {
        alert('Please login first as a comrade to submit a review');
        openModal('loginModal');
        return;
    }

    if (currentRating === 0) {
        alert('Please rate your hostel experience first');
        return;
    }

    const reviewText = document.getElementById('reviewText');
    if (!reviewText) return;

    const text = reviewText.value.trim();
    if (!text) {
        alert('Please write your review about the hostel');
        return;
    }

    const review = {
        id: Date.now(),
        comradeId: currentUser.id,
        comradeName: currentUser.name,
        rating: currentRating,
        text: text,
        date: new Date().toISOString(),
        semester: 'Current'
    };

    reviews.unshift(review);
    localStorage.setItem('universe_reviews', JSON.stringify(reviews));

    // Clear form
    reviewText.value = '';
    currentRating = 0;
    document.querySelectorAll('.stars i').forEach(star => {
        star.classList.remove('active');
        star.style.color = '#ddd';
    });

    // Update reviews list
    displayReviews();

    alert('Thank you for your review! It helps other comrades choose their accommodation.');
}

// Display Reviews
function displayReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    const recentReviews = reviews.slice(0, 5);

    if (recentReviews.length === 0) {
        reviewsList.innerHTML = `
            <div style="text-align: center; color: #666; padding: 2rem;">
                <i class="fas fa-star" style="font-size: 2rem; color: #ffd700;"></i>
                <p>No reviews yet from comrades</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Be the first to share your experience!</p>
            </div>
        `;
        return;
    }

    reviewsList.innerHTML = recentReviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div>
                    <strong>${review.comradeName}</strong>
                    <div class="review-stars" title="${review.rating} out of 5 stars">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                        <span style="color: #666; font-size: 0.9rem; margin-left: 0.5rem;">(${review.rating}/5)</span>
                    </div>
                </div>
                <span class="review-date">${formatDate(review.date)}</span>
            </div>
            <p>"${review.text}"</p>
            <div style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">
                <i class="fas fa-graduation-cap"></i> Chuka University Comrade
            </div>
        </div>
    `).join('');
}

// Utility Functions
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Date not set';
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        window.scrollTo({
            top: section.offsetTop - 80,
            behavior: 'smooth'
        });
    }
}

// Event Listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded - initializing...'); // Debug log
    initDemoData();

    // Set up event listeners for buttons
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log('Login button clicked'); // Debug log
            openModal('loginModal');
        });
    }

    const adminBtn = document.querySelector('.admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', openAdminLogin);
    }

    // Set up payment method selection
    document.querySelectorAll('.method').forEach(method => {
        method.addEventListener('click', function () {
            document.querySelectorAll('.method').forEach(m => m.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    console.log('Initialization complete'); // Debug log
});