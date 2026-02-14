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
    if (admissionForm) {
        admissionForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const application = {
                id: 'APP-' + Date.now(),
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                program: formData.get('program'),
                date: new Date().toLocaleDateString(),
                status: 'Pending'
            };
            const applications = JSON.parse(localStorage.getItem('jmc_applications') || '[]');
            applications.push(application);
            localStorage.setItem('jmc_applications', JSON.stringify(applications));
            alert('Application Submitted Successfully!');
            this.reset();
        });
    }

    const appsTableBody = document.getElementById('applicationsBody');
    if (appsTableBody) {
        renderApplications();
    }

    function renderApplications() {
        const applications = JSON.parse(localStorage.getItem('jmc_applications') || '[]');
        const stats = { total: applications.length, pending: 0, approved: 0 };
        appsTableBody.innerHTML = '';
        if (applications.length === 0) {
            const emptyState = document.getElementById('emptyState');
            if (emptyState) emptyState.style.display = 'block';
            const table = document.getElementById('applicationsTable');
            if (table) table.style.display = 'none';
        } else {
            const emptyState = document.getElementById('emptyState');
            if (emptyState) emptyState.style.display = 'none';
            const table = document.getElementById('applicationsTable');
            if (table) table.style.display = 'table';
            ([...applications]).reverse().forEach(app => {
                if (app.status === 'Pending') stats.pending++;
                if (app.status === 'Approved') stats.approved++;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div style="font-weight: 600; color: var(--secondary-color);">${app.fullName}</div>
                        <div style="font-size: 0.8rem; color: var(--text-light);">${app.email}</div>
                    </td>
                    <td>${app.program}</td>
                    <td>${app.date}</td>
                    <td><span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></td>
                    <td class="actions">
                        ${app.status === 'Pending' ? `
                            <button class="btn btn-sm btn-approve" onclick="approveApp('${app.id}')">Approve</button>
                            <button class="btn btn-sm btn-reject" onclick="rejectApp('${app.id}')">Reject</button>
                        ` : app.status === 'Approved' ? `
                            <button class="btn btn-sm btn-secondary" onclick="downloadLetter('${app.id}')"><i class="fas fa-file-pdf"></i> Reprint</button>
                        ` : `<span style="color: var(--text-light); font-size: 0.8rem;">No Actions</span>`}
                    </td>
                `;
                appsTableBody.appendChild(tr);
            });
        }
        const statsTotal = document.getElementById('totalApps');
        const statsPending = document.getElementById('pendingApps');
        const statsApproved = document.getElementById('approvedApps');
        if (statsTotal) statsTotal.textContent = stats.total;
        if (statsPending) statsPending.textContent = stats.pending;
        if (statsApproved) statsApproved.textContent = stats.approved;
    }

    // Functions for Global Access
    window.approveApp = function (id) { updateStatus(id, 'Approved'); };
    window.rejectApp = function (id) { updateStatus(id, 'Rejected'); };
    window.downloadLetter = function (id) {
        const applications = JSON.parse(localStorage.getItem('jmc_applications') || '[]');
        const app = applications.find(a => a.id === id);
        if (app) generatePDF(app);
    };

    function updateStatus(id, status) {
        const applications = JSON.parse(localStorage.getItem('jmc_applications') || '[]');
        const index = applications.findIndex(a => a.id === id);
        if (index !== -1) {
            applications[index].status = status;
            if (status === 'Approved') {
                const stdId = 'JMC/2026/' + Math.floor(Math.random() * 900 + 100);
                const tempPass = Math.random().toString(36).slice(-8).toUpperCase();
                applications[index].studentId = stdId;
                applications[index].tempPass = tempPass;
                applications[index].password = tempPass; // Default password
                localStorage.setItem('jmc_applications', JSON.stringify(applications));
                generatePDF(applications[index]);
                alert(`Approved! Student ID: ${stdId} | Temp Password: ${tempPass}`);
            } else {
                localStorage.setItem('jmc_applications', JSON.stringify(applications));
                alert('Rejected.');
            }
            renderApplications();
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
        doc.text(`Student ID: ${app.studentId}`, 20, 90);
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
        doc.text(`Portal Link: portal.josmed.edu.ng`, 30, 195);
        doc.text(`Temporary Password: ${app.tempPass}`, 30, 205);
        doc.save(`Admission_Letter_${app.fullName.replace(/\s+/g, '_')}.pdf`);
    }

    // --- STUDENT PORTAL LOGIC ---

    const loginForm = document.getElementById('studentLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const stdId = document.getElementById('studentId').value;
            const pass = document.getElementById('password').value;
            const applications = JSON.parse(localStorage.getItem('jmc_applications') || '[]');
            const student = applications.find(a => a.studentId === stdId);

            if (!student || student.status !== 'Approved') {
                alert('Invalid Student ID or Application not yet approved.');
                return;
            }

            if (student.password === pass && pass === student.tempPass) {
                // First-time login
                window.tempStudent = student;
                document.getElementById('passwordSetupModal').style.display = 'flex';
            } else if (student.password === pass) {
                // Regular login
                localStorage.setItem('jmc_logged_student', JSON.stringify(student));
                window.location.href = 'student-dashboard.html';
            } else {
                alert('Incorrect password.');
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
                alert('Passwords do not match.');
                return;
            }

            const applications = JSON.parse(localStorage.getItem('jmc_applications') || '[]');
            const index = applications.findIndex(a => a.studentId === window.tempStudent.studentId);
            if (index !== -1) {
                applications[index].password = newPass;
                localStorage.setItem('jmc_applications', JSON.stringify(applications));
                localStorage.setItem('jmc_logged_student', JSON.stringify(applications[index]));
                alert('Password set successfully!');
                window.location.href = 'student-dashboard.html';
            }
        });
    }

    // Dashboard Initialization
    if (window.location.pathname.includes('student-dashboard.html')) {
        const student = JSON.parse(localStorage.getItem('jmc_logged_student'));
        if (!student) {
            window.location.href = 'student-login.html';
            return;
        }

        document.getElementById('profileName').textContent = student.fullName;
        document.getElementById('profileId').textContent = student.studentId;
        document.getElementById('profileProgram').textContent = student.program;
        document.getElementById('updateEmail').value = student.email;
        document.getElementById('updatePhone').value = student.phone || '';
        document.getElementById('sidebarName').textContent = student.fullName;
        document.getElementById('sidebarEmail').textContent = student.email;
        document.getElementById('avatarInitial').textContent = student.fullName.charAt(0);
    }

    const profileForm = document.getElementById('profileUpdateForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const student = JSON.parse(localStorage.getItem('jmc_logged_student'));
            student.email = document.getElementById('updateEmail').value;
            student.phone = document.getElementById('updatePhone').value;

            // Update in applications list too
            const applications = JSON.parse(localStorage.getItem('jmc_applications') || '[]');
            const index = applications.findIndex(a => a.studentId === student.studentId);
            if (index !== -1) {
                applications[index] = student;
                localStorage.setItem('jmc_applications', JSON.stringify(applications));
                localStorage.setItem('jmc_logged_student', JSON.stringify(student));
                alert('Profile updated successfully!');
                window.location.reload();
            }
        });
    }

    window.switchTab = function (tabName) {
        document.querySelectorAll('.dashboard-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
        document.getElementById('tab-' + tabName).classList.add('active');
        event.currentTarget.classList.add('active');
    };

    window.logoutStudent = function () {
        localStorage.removeItem('jmc_logged_student');
        window.location.href = 'student-login.html';
    };

    // --- TEACHING STAFF PORTAL LOGIC ---

    // Initialize Mock Staff Data if empty
    function initStaffData() {
        const staff = JSON.parse(localStorage.getItem('jmc_staff') || '[]');
        if (staff.length === 0) {
            const mockStaff = [
                {
                    id: 'STF/2026/001',
                    fullName: 'Dr. Samuel Ahmed',
                    email: 's.ahmed@josmed.edu.ng',
                    password: 'password123',
                    tempPass: 'password123',
                    dept: 'Nursing Sciences',
                    phone: '08012345678',
                    courses: ['NSG 301', 'ANA 201']
                },
                {
                    id: 'STF/2026/002',
                    fullName: 'Prof. Mary John',
                    email: 'm.john@josmed.edu.ng',
                    password: 'password123',
                    tempPass: 'password123',
                    dept: 'Anatomy',
                    phone: '08087654321',
                    courses: ['ANA 202', 'BIO 105']
                }
            ];
            localStorage.setItem('jmc_staff', JSON.stringify(mockStaff));
        }
    }
    initStaffData();

    // Staff Login Handler
    const staffLoginForm = document.getElementById('staffLoginForm');
    if (staffLoginForm) {
        staffLoginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('staffEmail').value;
            const pass = document.getElementById('staffPassword').value;
            const staffList = JSON.parse(localStorage.getItem('jmc_staff') || '[]');
            const staff = staffList.find(s => s.email === email);

            if (!staff) {
                alert('Invalid Staff Email.');
                return;
            }

            if (staff.password === pass && pass === staff.tempPass) {
                // First-time login for staff
                window.tempStaff = staff;
                document.getElementById('staffPasswordSetupModal').style.display = 'flex';
            } else if (staff.password === pass) {
                // Regular staff login
                localStorage.setItem('jmc_logged_staff', JSON.stringify(staff));
                window.location.href = 'staff-dashboard.html';
            } else {
                alert('Incorrect password.');
            }
        });
    }

    // Staff Password Setup
    const staffSetupForm = document.getElementById('staffPasswordSetupForm');
    if (staffSetupForm) {
        staffSetupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const newPass = document.getElementById('staffNewPassword').value;
            const confirmPass = document.getElementById('staffConfirmPassword').value;

            if (newPass !== confirmPass) {
                alert('Passwords do not match.');
                return;
            }

            const staffList = JSON.parse(localStorage.getItem('jmc_staff') || '[]');
            const index = staffList.findIndex(s => s.id === window.tempStaff.id);
            if (index !== -1) {
                staffList[index].password = newPass;
                localStorage.setItem('jmc_staff', JSON.stringify(staffList));
                localStorage.setItem('jmc_logged_staff', JSON.stringify(staffList[index]));
                alert('Staff password set successfully!');
                window.location.href = 'staff-dashboard.html';
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
        staffProfileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const staff = JSON.parse(localStorage.getItem('jmc_logged_staff'));
            staff.phone = document.getElementById('staffUpdatePhone').value;

            const staffList = JSON.parse(localStorage.getItem('jmc_staff') || '[]');
            const index = staffList.findIndex(s => s.id === staff.id);
            if (index !== -1) {
                staffList[index] = staff;
                localStorage.setItem('jmc_staff', JSON.stringify(staffList));
                localStorage.setItem('jmc_logged_staff', JSON.stringify(staff));
                alert('Staff profile updated!');
                window.location.reload();
            }
        });
    }

    // RBAC - Access Restrictions
    function enforceRBAC() {
        const path = window.location.pathname;
        const student = localStorage.getItem('jmc_logged_student');
        const staff = localStorage.getItem('jmc_logged_staff');

        if (path.includes('admin-dashboard.html') && staff) {
            alert('Access Denied: Teaching staff do not have administrative privileges.');
            window.location.href = 'staff-dashboard.html';
        }
        if (path.includes('staff-dashboard.html') && student) {
            alert('Access Denied: Students cannot access the staff portal.');
            window.location.href = 'student-dashboard.html';
        }
    }
    enforceRBAC();

    window.downloadLetterPortal = function () {
        const student = JSON.parse(localStorage.getItem('jmc_logged_student'));
        if (student) generatePDF(student);
    };
});
