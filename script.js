/* 
* Jos Medical College - Interactivity 
*/

document.addEventListener('DOMContentLoaded', function () {
    // --- ORIGINAL SITE FUNCTIONALITY ---

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function () {
            mainNav.classList.toggle('active');

            // Animate hamburger icon
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

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                // Close mobile menu if open
                if (mainNav && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                }

                // Account for sticky header
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Hero Background Slider
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000;

        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, slideInterval);
    }

    // --- STUDENT ADMISSION SYSTEM ---

    // Admission Form Submission
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

            alert('Application Submitted Successfully! Our administration will review your details and contact you soon.');
            this.reset();
        });
    }

    // Admin Dashboard Rendering
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
            const appsTable = document.getElementById('applicationsTable');
            if (emptyState) emptyState.style.display = 'block';
            if (appsTable) appsTable.style.display = 'none';
        } else {
            const emptyState = document.getElementById('emptyState');
            const appsTable = document.getElementById('applicationsTable');
            if (emptyState) emptyState.style.display = 'none';
            if (appsTable) appsTable.style.display = 'table';

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

    // PDF and Status Update functions attached to window for global access
    window.approveApp = function (id) {
        updateStatus(id, 'Approved');
    };

    window.rejectApp = function (id) {
        updateStatus(id, 'Rejected');
    };

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

                localStorage.setItem('jmc_applications', JSON.stringify(applications));
                generatePDF(applications[index]);
                alert(`Application Approved!\nStudent ID: ${stdId}\nTemp Password: ${tempPass}`);
            } else {
                localStorage.setItem('jmc_applications', JSON.stringify(applications));
                alert('Application Rejected. Notification sent to student.');
            }
            renderApplications();
        }
    }

    function generatePDF(app) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFillColor(45, 106, 79);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('JOS MEDICAL COLLEGE', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text('OF HEALTH SCIENCE AND TECHNOLOGY', 105, 28, { align: 'center' });

        // Title
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(18);
        doc.text('PROVISIONAL ADMISSION LETTER', 105, 60, { align: 'center' });

        // Details
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
        doc.text(`Student ID: ${app.studentId}`, 20, 90);

        doc.setFont('helvetica', 'bold');
        doc.text(`Dear ${app.fullName.toUpperCase()},`, 20, 110);
        doc.setFont('helvetica', 'normal');

        const message = `Congratulations! We are pleased to inform you that you have been offered provisional admission into the Medical Career College of Health Science and Technology, Jos for the 2026 academic session.`;
        const splitMessage = doc.splitTextToSize(message, 170);
        doc.text(splitMessage, 20, 120);

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

        doc.setFontSize(10);
        const footerText = `Please present this letter at the college registry for physical screening and documentation within two weeks of receipt.`;
        const splitFooter = doc.splitTextToSize(footerText, 170);
        doc.text(splitFooter, 20, 230);

        doc.line(20, 260, 80, 260);
        doc.text('Registrar', 20, 265);

        // Border
        doc.setDrawColor(45, 106, 79);
        doc.rect(5, 5, 200, 287);

        doc.save(`Admission_Letter_${app.fullName.replace(/\s+/g, '_')}.pdf`);
    }
});
