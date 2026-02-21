/* 
* Jos Medical College - Interactivity 
*/

document.addEventListener('DOMContentLoaded', function () {
    // --- STYLES & SHARED UI ---
    // Populate Admin Support on Dashboard
    const adminSupportDashboard = document.getElementById('adminSupportDashboard');
    if (adminSupportDashboard) {
        adminSupportDashboard.innerHTML = `
            <h3>Contact Us</h3>
            <address>
                <p>No.2 Rikkos Jos</p>
                <p>Plateau State, Nigeria</p>
                <p style="margin-top: 0.5rem;"><i class="fab fa-whatsapp" style="color: #25D366;"></i> <a href="https://wa.me/2349066498487" style="color: inherit; text-decoration: none;">09066498487</a></p>
                <p><i class="fas fa-envelope"></i> <a href="mailto:e.medicalcareeracademy.edu@gmail.com" style="color: inherit; text-decoration: none;">e.medicalcareeracademy.edu@gmail.com</a></p>
            </address>
        `;
    }

    // API_BASE_URL is defined in config.js (loaded before this script)
    const ADMIN_CREDENTIALS = {
        email: 'admin@josmed.edu.ng',
        password: 'adminpassword123'
    };

    // Initialize Mock Data - REMOVED FOR BACKEND INTEGRATION
    // function initMockData() { ... } 
    // initMockData();

    // ── PASSWORD VISIBILITY TOGGLE ──────────────────────────────────────────
    // Auto-applies to every input[type="password"] on the page — no HTML edits needed
    document.querySelectorAll('input[type="password"]').forEach(function (input) {
        // Wrap input in a relative container
        const wrapper = document.createElement('div');
        wrapper.className = 'pwd-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Create the eye icon button
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pwd-toggle';
        btn.setAttribute('aria-label', 'Toggle password visibility');
        btn.setAttribute('tabindex', '-1');
        btn.innerHTML = '<i class="fas fa-eye"></i>';
        wrapper.appendChild(btn);

        btn.addEventListener('click', function () {
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.innerHTML = isHidden
                ? '<i class="fas fa-eye-slash"></i>'
                : '<i class="fas fa-eye"></i>';
            input.focus();
        });
    });

    // --- 2. MODAL CONTROLS ---
    window.openModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    };

    window.closeModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    };

    // --- ORIGINAL SITE FUNCTIONALITY ---

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function () {
            mainNav.classList.toggle('active');
            if (mainNav.classList.contains('active')) {
                mobileMenuBtn.style.opacity = '0.8';
            } else {
                mobileMenuBtn.style.opacity = '1';
            }
        });
    }

    // Sticky Header Scroll Effect
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', function () {
        if (header) {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }
        }
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                if (mainNav && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                }
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // Hero Background Slider
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // --- STUDENT ADMISSION SYSTEM ---

    const admissionForm = document.getElementById('admissionForm');
    const documentsInput = document.getElementById('documents');
    const uploadDesign = document.querySelector('.file-upload-design');

    // Helper to reset upload UI
    function resetUploadUI() {
        const label = uploadDesign ? uploadDesign.querySelector('span') : null;
        const icon = uploadDesign ? uploadDesign.querySelector('.fas') : null;
        if (label) { label.textContent = 'Click to upload or drag and drop'; label.style.color = ''; label.style.fontWeight = ''; }
        if (icon) { icon.className = 'fas fa-cloud-upload-alt'; icon.style.color = ''; }
    }

    // Helper to show selected files in the UI
    function updateUploadUI(files) {
        const label = uploadDesign ? uploadDesign.querySelector('span') : null;
        const icon = uploadDesign ? uploadDesign.querySelector('.fas') : null;
        if (files && files.length > 0) {
            const fileNames = Array.from(files).map(f => f.name).join(', ');
            if (label) { label.textContent = `✔ ${files.length} file(s) selected: ${fileNames}`; label.style.color = 'green'; label.style.fontWeight = '600'; }
            if (icon) { icon.className = 'fas fa-check-circle'; icon.style.color = 'green'; }
        } else {
            resetUploadUI();
        }
    }

    // File input change event
    if (documentsInput) {
        documentsInput.addEventListener('change', function () {
            updateUploadUI(this.files);
        });
    }

    // Drag-and-drop support
    if (uploadDesign && documentsInput) {
        uploadDesign.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = 'rgba(0,168,232,0.05)';
        });

        uploadDesign.addEventListener('dragleave', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = '';
            this.style.background = '';
        });

        uploadDesign.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.style.borderColor = '';
            this.style.background = '';

            const dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length > 0) {
                // Transfer files to the real input
                const dataTransfer = new DataTransfer();
                Array.from(dt.files).forEach(file => dataTransfer.items.add(file));
                documentsInput.files = dataTransfer.files;
                updateUploadUI(documentsInput.files);
            }
        });
    }

    if (admissionForm) {
        admissionForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Create FormData object to handle text + files
            const formData = new FormData(this);
            formData.append('password', 'password123');

            try {
                const response = await fetch(`${API_BASE_URL}/students/register`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    showToast('Application submitted successfully!', 'success');
                    this.reset();       // Reset form fields
                    resetUploadUI();    // Reset upload UI
                } else {
                    showToast('Error: ' + (data.message || 'Failed to submit application'), 'error');
                }
            } catch (err) {
                console.error('Registration Error:', err);
                showToast('Connection error: Could not connect to the server.', 'error');
            }
        });
    }

    // ── Admin Dashboard State ──────────────────────────────────────────────────
    let allApplications = [];   // master list fetched once from API
    let currentFilter = 'All'; // active filter tab

    const appsTableBody = document.getElementById('applicationsBody');
    if (appsTableBody) {
        fetchApplications();
        wireFilterButtons();
    }

    /** Fetch all applications from the API and render. Called once on page load. */
    async function fetchApplications() {
        const token = localStorage.getItem('jmc_token');
        if (!token) {
            showToast('You are not logged in. Redirecting...', 'error');
            setTimeout(() => window.location.href = 'admin-login.html', 1500);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                showToast('Session expired. Please login again.', 'error');
                setTimeout(() => window.location.href = 'admin-login.html', 1500);
                return;
            }

            if (!response.ok) throw new Error('Failed to fetch applications');

            allApplications = await response.json();
            applyFilter(currentFilter);

        } catch (err) {
            console.error('Error fetching applications:', err);
        }
    }

    /**
     * Filter allApplications client-side and re-render the table.
     * @param {string} filter - 'All' | 'Pending' | 'Approved' | 'Rejected'
     */
    function applyFilter(filter) {
        currentFilter = filter;

        // Highlight the active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        const filtered = filter === 'All'
            ? allApplications
            : allApplications.filter(a => a.admissionStatus === filter);

        renderRows(filtered);
        updateStats();
    }

    /** Render table rows for a given list of applications */
    function renderRows(apps) {
        const table = document.getElementById('applicationsTable');
        const empty = document.getElementById('emptyState');

        appsTableBody.innerHTML = '';

        if (apps.length === 0) {
            if (table) table.style.display = 'none';
            if (empty) empty.style.display = 'block';
            return;
        }

        if (table) table.style.display = 'table';
        if (empty) empty.style.display = 'none';

        apps.forEach(app => {
            const status = app.admissionStatus; // 'Pending' | 'Approved' | 'Rejected'
            const isPending = status === 'Pending';

            const tr = document.createElement('tr');
            tr.dataset.id = app._id;

            tr.innerHTML = `
                <td>
                    <div style="font-weight:600; color:var(--secondary-color);">${app.fullName}</div>
                    <div style="font-size:0.8rem; color:var(--text-light);">${app.email}</div>
                </td>
                <td>${app.program}</td>
                <td>${new Date(app.dateApplied).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge status-${status.toLowerCase()}">
                        ${status === 'Pending' ? '🟡' : status === 'Approved' ? '🟢' : '🔴'} ${status}
                    </span>
                </td>
                <td class="actions">
                    ${isPending ? `
                        <button class="btn btn-sm btn-approve" onclick="approveApp('${app._id}')">Approve</button>
                        <button class="btn btn-sm btn-reject"  onclick="rejectApp('${app._id}')">Reject</button>
                    ` : status === 'Approved' ? `
                        <button class="btn btn-sm btn-secondary" onclick="downloadLetter('${app._id}')">
                            <i class="fas fa-file-pdf"></i> Reprint
                        </button>
                    ` : `<span style="color:var(--text-light); font-size:0.8rem;">—</span>`}
                </td>
            `;
            appsTableBody.appendChild(tr);
        });

        window.cachedApplications = allApplications; // keep for downloadLetter
    }

    /** Recalculate and update the four stat cards */
    function updateStats() {
        const stats = { total: allApplications.length, pending: 0, approved: 0, rejected: 0 };
        allApplications.forEach(a => {
            if (a.admissionStatus === 'Pending') stats.pending++;
            if (a.admissionStatus === 'Approved') stats.approved++;
            if (a.admissionStatus === 'Rejected') stats.rejected++;
        });
        const el = id => document.getElementById(id);
        if (el('totalApps')) el('totalApps').textContent = stats.total;
        if (el('pendingApps')) el('pendingApps').textContent = stats.pending;
        if (el('approvedApps')) el('approvedApps').textContent = stats.approved;
        if (el('rejectedApps')) el('rejectedApps').textContent = stats.rejected;
    }

    /** Wire filter button click events */
    function wireFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                applyFilter(this.dataset.filter);
            });
        });
    }

    // Global helpers for inline onclick handlers
    window.approveApp = function (id) { updateStatus(id, 'Approved'); };
    window.rejectApp = function (id) {
        showConfirm(
            'Are you sure you want to reject this application? This action cannot be undone.',
            () => updateStatus(id, 'Rejected'),
            null,
            'Yes, Reject'
        );
    };
    window.downloadLetter = function (id) {
        const app = allApplications.find(a => a._id === id);
        if (app) generatePDF(app);
    };

    /**
     * PATCH status via API, then update allApplications in-place and re-render.
     * No full page reload. Buttons are disabled instantly to prevent double-clicks.
     */
    async function updateStatus(id, status) {
        const token = localStorage.getItem('jmc_token');
        if (!token) { showToast('Unauthorized. Please login again.', 'error'); return; }

        // Immediately disable the row's buttons to prevent double-click
        const row = appsTableBody.querySelector(`tr[data-id="${id}"]`);
        if (row) row.querySelectorAll('button').forEach(b => b.disabled = true);

        try {
            const response = await fetch(`${API_BASE_URL}/admin/applications/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const data = await response.json();
                showToast('Error: ' + data.message, 'error');
                // Re-enable the buttons on failure
                if (row) row.querySelectorAll('button').forEach(b => b.disabled = false);
                return;
            }

            const updatedApp = await response.json();

            // Update the record in-place inside allApplications (no re-fetch needed)
            const idx = allApplications.findIndex(a => a._id === id);
            if (idx !== -1) {
                allApplications[idx].admissionStatus = status;
                if (status === 'Approved' && updatedApp.studentId) {
                    allApplications[idx].studentId = updatedApp.studentId;
                }
            }

            // Re-render with current filter (approved student disappears from Pending view, etc.)
            applyFilter(currentFilter);

            // Show confirmation
            if (status === 'Approved') {
                showToast(`Approved! Student ID: ${updatedApp.studentId} — Email sent to ${updatedApp.email}`, 'success', 6000);
                generatePDF(updatedApp);
            } else {
                showToast('Application has been rejected.', 'info');
            }

        } catch (err) {
            console.error('Update status error:', err);
            showToast('Connection error. Please try again.', 'error');
            if (row) row.querySelectorAll('button').forEach(b => b.disabled = false);
        }
    }

    function generatePDF(app) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFillColor(0, 168, 232);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('JOS MEDICAL COLLEGE', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text('OF HEALTH SCIENCE AND TECHNOLOGY', 105, 28, { align: 'center' });
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(18);
        doc.text('PROVISIONAL ADMISSION LETTER', 105, 60, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
        doc.text(`Student ID: ${app.studentId || 'Pending'}`, 20, 90);
        doc.setFont('helvetica', 'bold');
        doc.text(`Dear ${app.fullName.toUpperCase()},`, 20, 110);
        doc.setFont('helvetica', 'normal');
        const message = `Congratulations! You have been offered provisional admission into JMC for the 2026 session.`;
        doc.text(doc.splitTextToSize(message, 170), 20, 120);
        doc.setFont('helvetica', 'bold');
        doc.text('PROGRAM DETAILS:', 20, 145);
        doc.setFont('helvetica', 'normal');
        doc.text(`Program: ${app.program}`, 30, 155);
        doc.text(`Academic Session: 2026/2027`, 30, 165);
        doc.setFont('helvetica', 'bold');
        doc.text('PORTAL ACCESS:', 20, 185);
        doc.setFont('helvetica', 'normal');
        doc.text(`Portal Link: medicalcareer.netlify.app`, 30, 195);
        doc.text(`Login ID: ${app.studentId || 'Check your approval email'}`, 30, 205);
        doc.text(`Password: 5-digit number sent to your email`, 30, 215);
        doc.save(`Admission_Letter_${app.fullName.replace(/\s+/g, '_')}.pdf`);
    }

    // --- STUDENT PORTAL LOGIC ---

    // Student Login Handler - UPDATED FOR API INTEGRATION
    const loginForm = document.getElementById('studentLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const studentId = document.getElementById('studentId').value.trim();
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_BASE_URL}/students/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentId, password })
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.role === 'admin' || data.role === 'staff') {
                        showToast('Access denied: This login is for students only.', 'error');
                        localStorage.removeItem('jmc_token');
                    } else {
                        localStorage.setItem('jmc_token', data.token);
                        localStorage.setItem('jmc_logged_student', JSON.stringify(data));
                        showToast('Login successful! Redirecting...', 'success');
                        setTimeout(() => window.location.href = 'student-dashboard.html', 1000);
                    }
                } else {
                    showToast('Login failed: ' + (data.message || 'Incorrect credentials'), 'error');
                }
            } catch (err) {
                console.error('Login Error:', err);
                showToast('Connection error: Could not connect to the server.', 'error');
            }
        });
    }


    const setupForm = document.getElementById('passwordSetupForm');
    if (setupForm) {
        setupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;

            if (newPass !== confirmPass) {
                showToast('Passwords do not match.', 'error');
                return;
            }

            const applications = JSON.parse(localStorage.getItem('jmc_applications') || '[]');
            const index = applications.findIndex(a => a.studentId === window.tempStudent.studentId);
            if (index !== -1) {
                applications[index].password = newPass;
                applications[index].tempPass = '';
                localStorage.setItem('jmc_applications', JSON.stringify(applications));
                localStorage.setItem('jmc_logged_student', JSON.stringify(applications[index]));
                showToast('Password set successfully!', 'success');
                setTimeout(() => window.location.href = 'student-dashboard.html', 1000);
            }
        });
    }

    // Dashboard Initialization - UPDATED FOR API INTEGRATION
    if (window.location.pathname.includes('student-dashboard.html')) {
        const token = localStorage.getItem('jmc_token');

        if (!token) {
            window.location.href = 'student-login.html';
            return;
        }

        const updateUI = (student) => {
            // Header & Sidebar
            const nameEls = ['profileNameHeader', 'sidebarName', 'viewFullName'];
            nameEls.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = student.fullName; });

            const idEls = ['profileIdHeader', 'viewId'];
            // Use email or special ID from backend if available
            idEls.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = (id === 'profileIdHeader' ? 'ID: ' : '') + (student.studentId || student.email); });

            const emailEls = ['sidebarEmail', 'viewEmail'];
            emailEls.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = student.email; });

            const programEl = document.getElementById('viewProgram');
            if (programEl) programEl.textContent = student.program;

            const phoneEl = document.getElementById('viewPhone');
            if (phoneEl) phoneEl.textContent = student.phone || 'Not Set';

            const avatarInt = document.getElementById('avatarInitial');
            if (avatarInt) avatarInt.textContent = student.fullName ? student.fullName.charAt(0) : 'S';

            // Profile Picture
            const imgEl = document.getElementById('currentProfilePic');
            const defEl = document.getElementById('defaultAvatar');
            if (student.profilePic) {
                if (imgEl) { imgEl.src = student.profilePic; imgEl.style.display = 'block'; }
                if (defEl) defEl.style.display = 'none';
            } else {
                if (imgEl) imgEl.style.display = 'none';
                if (defEl) defEl.style.display = 'block';
            }

            // Inputs (for edit mode)
            const inputMap = { 'editFullName': student.fullName, 'editId': student.studentId || student.email, 'editProgram': student.program, 'editEmail': student.email, 'editPhone': student.phone || '' };
            Object.entries(inputMap).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val; });
        };

        // Fetch latest student data
        fetch(`${API_BASE_URL}/students/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Unauthorized or failed to fetch profile');
                }
                return response.json();
            })
            .then(student => {
                // Update local storage to keep it fresh
                localStorage.setItem('jmc_logged_student', JSON.stringify(student));
                updateUI(student);
            })
            .catch(err => {
                console.error('Dashboard Auth Error:', err);
                // If auth fails, redirect to login
                localStorage.removeItem('jmc_token');
                localStorage.removeItem('jmc_logged_student');
                window.location.href = 'student-login.html';
            });

        // In-Place Mode Controls
        window.enterEditMode = function () {
            document.getElementById('tab-profile').classList.add('editing');
        };

        window.exitEditMode = function () {
            document.getElementById('tab-profile').classList.remove('editing');
            // Re-fetch to revert UI or rely on stored data
            const s = JSON.parse(localStorage.getItem('jmc_logged_student'));
            if (s) updateUI(s);
        };

        // Photo Upload Handling
        const photoInput = document.getElementById('photoUpload');
        if (photoInput) {
            photoInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        const base64 = event.target.result;
                        document.getElementById('currentProfilePic').src = base64;
                        document.getElementById('currentProfilePic').style.display = 'block';
                        document.getElementById('defaultAvatar').style.display = 'none';
                        window.pendingProfilePic = base64;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Profile Form Submit - Update via API
        const profileInPlaceForm = document.getElementById('profileInPlaceForm');
        if (profileInPlaceForm) {
            profileInPlaceForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const token = localStorage.getItem('jmc_token');
                const email = document.getElementById('editEmail').value;
                const phone = document.getElementById('editPhone').value;

                const updateData = { email, phone };

                if (window.pendingProfilePic) {
                    updateData.profilePic = window.pendingProfilePic;
                    window.pendingProfilePic = null;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/students/profile`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(updateData)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem('jmc_logged_student', JSON.stringify(data));
                        showToast('Profile updated successfully!', 'success');
                        exitEditMode();
                        updateUI(data);
                    } else {
                        showToast('Update failed: ' + (data.message || 'Error updating profile'), 'error');
                    }
                } catch (err) {
                    console.error('Update Error:', err);
                    showToast('Connection error: Could not update profile.', 'error');
                }
            });
        }
    }


    window.switchTab = function (tabName) {
        document.querySelectorAll('.dashboard-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
        const targetTab = document.getElementById('tab-' + tabName);
        if (targetTab) targetTab.classList.add('active');
        if (event && event.currentTarget) event.currentTarget.classList.add('active');
    };

    window.logoutStudent = function () {
        localStorage.removeItem('jmc_logged_student');
        localStorage.removeItem('jmc_token');
        window.location.href = 'student-login.html';
    };

    // --- TEACHING STAFF PORTAL LOGIC ---
    try {
        // Initialize Mock Staff Data and ensure test accounts are synced
        // Initialize Mock Staff Data - REMOVED FOR BACKEND INTEGRATION
        // function initStaffData() { ... }
        // initStaffData();

        // Staff Login Handler
        const staffLoginForm = document.getElementById('staffLoginForm');
        if (staffLoginForm) {
            console.log('Attaching Staff Login listener.');
            staffLoginForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                console.log('Staff Login form submitted.');

                const emailEl = document.getElementById('staffEmail');
                const passEl = document.getElementById('staffPassword');

                if (!emailEl || !passEl) {
                    showToast('Technical error: Login inputs not found.', 'error');
                    return;
                }

                const email = emailEl.value.trim().toLowerCase();
                const password = passEl.value;

                try {
                    const response = await fetch(`${API_BASE_URL}/staff/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        if (data.isTempPassword) {
                            window.tempStaff = data;
                            const modal = document.getElementById('staffPasswordSetupModal');
                            if (modal) modal.style.display = 'flex';
                            else showToast('First-time setup modal missing. Please contact IT.', 'error');
                        } else {
                            localStorage.setItem('jmc_logged_staff', JSON.stringify(data));
                            localStorage.setItem('jmc_staff_token', data.token);
                            showToast('Login successful! Redirecting...', 'success');
                            setTimeout(() => window.location.href = 'staff-dashboard.html', 1000);
                        }
                    } else {
                        showToast('Login failed: ' + (data.message || 'Incorrect credentials'), 'error');
                    }
                } catch (err) {
                    console.error('Login Error:', err);
                    showToast('Connection error: Could not connect to the server.', 'error');
                }
            });
        }

        // Staff Password Setup
        const staffSetupForm = document.getElementById('staffPasswordSetupForm');
        if (staffSetupForm) {
            staffSetupForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const newPassEl = document.getElementById('staffNewPassword');
                const confirmPassEl = document.getElementById('staffConfirmPassword');

                if (!newPassEl || !confirmPassEl) return;

                const newPass = newPassEl.value;
                const confirmPass = confirmPassEl.value;

                if (newPass !== confirmPass) {
                    showToast('Passwords do not match.', 'error');
                    return;
                }

                if (!window.tempStaff) {
                    showToast('Session expired. Please refresh the login page.', 'error');
                    return;
                }

                const staffList = JSON.parse(localStorage.getItem('jmc_staff') || '[]');
                const index = staffList.findIndex(s => s.id === window.tempStaff.id);
                if (index !== -1) {
                    staffList[index].password = newPass;
                    localStorage.setItem('jmc_staff', JSON.stringify(staffList));
                    localStorage.setItem('jmc_logged_staff', JSON.stringify(staffList[index]));
                    showToast('Staff account verified! Redirecting...', 'success');
                    setTimeout(() => window.location.href = 'staff-dashboard.html', 1000);
                }
            });
        }
    } catch (e) {
        console.error('General failure in Staff Portal logic:', e);
    }

    // --- ADMIN LOGIN LOGIC ---
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value;

            try {
                // Reuse student login endpoint as it returns role 'admin'
                const response = await fetch(`${API_BASE_URL}/students/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.role === 'admin') {
                        localStorage.setItem('jmc_token', data.token);
                        showToast('Admin login successful! Redirecting...', 'success');
                        setTimeout(() => window.location.href = 'admin-dashboard.html', 1000);
                    } else {
                        showToast('Access denied: You do not have administrator privileges.', 'error');
                        localStorage.removeItem('jmc_token');
                    }
                } else {
                    showToast('Login failed: ' + (data.message || 'Incorrect credentials'), 'error');
                }
            } catch (err) {
                console.error('Admin Login Error:', err);
                showToast('Connection error: Could not connect to the server.', 'error');
            }
        });
    }

    // Staff Dashboard Initialization
    if (window.location.pathname.includes('staff-dashboard.html')) {
        const staff = JSON.parse(localStorage.getItem('jmc_logged_staff'));
        if (!staff) {
            window.location.href = 'staff-login.html';
            return;
        }

        document.getElementById('dispStaffName').textContent = staff.fullName;
        document.getElementById('dispStaffId').textContent = staff.id;
        document.getElementById('dispStaffDept').textContent = staff.dept;
        document.getElementById('dispStaffEmail').textContent = staff.email;
        document.getElementById('staffUpdatePhone').value = staff.phone || '';
        document.getElementById('staffSidebarName').textContent = staff.fullName;
        document.getElementById('staffSidebarDept').textContent = staff.dept;
        document.getElementById('staffAvatarInitial').textContent = staff.fullName.charAt(0);

        // Logout
        document.getElementById('staffLogoutBtn')?.addEventListener('click', function () {
            localStorage.removeItem('jmc_logged_staff');
            window.location.href = 'staff-login.html';
        });
    }

    // Staff Profile Update
    const staffProfileForm = document.getElementById('staffProfileForm');
    if (staffProfileForm) {
        staffProfileForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const token = localStorage.getItem('jmc_staff_token'); // Use specific token key if different
            // Note: Login sets 'jmc_staff_token' in my previous edit.

            const phone = document.getElementById('staffUpdatePhone').value;

            try {
                const response = await fetch(`${API_BASE_URL}/staff/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ phone })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('jmc_logged_staff', JSON.stringify(data));
                    showToast('Staff profile updated successfully!', 'success');
                } else {
                    showToast('Update failed: ' + (data.message || 'Error updating profile'), 'error');
                }
            } catch (err) {
                console.error('Update Error:', err);
                showToast('Connection error: Could not update profile.', 'error');
            }
        });
    }

    // RBAC - Access Restrictions
    function enforceRBAC() {
        const path = window.location.pathname;
        const student = localStorage.getItem('jmc_logged_student');
        const staff = localStorage.getItem('jmc_logged_staff');

        if (path.includes('admin-dashboard.html') && staff) {
            showToast('Access denied: Staff cannot access the admin panel.', 'error');
            setTimeout(() => window.location.href = 'staff-dashboard.html', 1500);
        }
        if (path.includes('staff-dashboard.html') && student) {
            showToast('Access denied: Students cannot access the staff portal.', 'error');
            setTimeout(() => window.location.href = 'student-dashboard.html', 1500);
        }
    }
    enforceRBAC();

    window.downloadLetterPortal = function () {
        const student = JSON.parse(localStorage.getItem('jmc_logged_student'));
        if (student) generatePDF(student);
    };

    // Toggle Program Card Expansion
    window.toggleCourse = function (btn) {
        const card = btn.closest('.course-card');
        card.classList.toggle('expanded');
        if (card.classList.contains('expanded')) {
            btn.innerHTML = 'Read Less ↑';
        } else {
            btn.innerHTML = 'Read More →';
        }
    };
});

