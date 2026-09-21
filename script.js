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

    // Smooth Scrolling & Hash Handling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            // Handle special program filter anchors on programs page
            if (targetId === '#degree' || targetId === '#diploma' || targetId === '#all-programs') {
                if (typeof window.filterPrograms === 'function' && (document.getElementById('degree-section') || document.getElementById('diploma-section'))) {
                    e.preventDefault();
                    if (mainNav && mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                    }
                    const filterName = targetId === '#degree' ? 'degree' : (targetId === '#diploma' ? 'diploma' : 'all');
                    window.filterPrograms(filterName, true);
                    return;
                }
            }

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

    // Document fields definition — used for validation, upload feedback, and reset
    const ADMISSION_DOC_FIELDS = [
        { id: 'ssce',             label: 'SSCE (WAEC/NECO/NABTEB)' },
        { id: 'stateOrigin',      label: 'Certificate of State of Origin' },
        { id: 'birthCertificate', label: 'Birth Certificate' },
        { id: 'nin',              label: 'NIN (National Identification Number)' },
        { id: 'medicalFitness',   label: 'Medical Fitness Report' },
        { id: 'passportPhoto',    label: 'Passport Photograph' }
    ];

    // Wire per-field upload visual feedback
    ADMISSION_DOC_FIELDS.forEach(function(field) {
        const input = document.getElementById(field.id);
        if (!input) return;
        input.addEventListener('change', function() {
            const wrapper = this.closest('.file-upload-wrapper');
            if (!wrapper) return;
            const span = wrapper.querySelector('.file-upload-design span');
            const icon = wrapper.querySelector('.file-upload-design i');
            if (this.files && this.files.length > 0) {
                wrapper.classList.add('has-file');
                if (icon) icon.className = 'fas fa-check-circle';
                if (span) span.textContent = '\u2714 ' + this.files[0].name;
            } else {
                wrapper.classList.remove('has-file');
                if (icon) icon.className = 'fas fa-cloud-upload-alt';
                if (span) span.textContent = 'Click to upload or drag and drop';
            }
            
            // Passport Live Preview Logic
            if (field.id === 'passportPhoto') {
                const previewContainer = document.getElementById('passportPreviewContainer');
                const previewImg = document.getElementById('passportPreviewImg');
                const previewName = document.getElementById('passportPreviewName');
                
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    const url = URL.createObjectURL(file);
                    if (previewImg) previewImg.src = url;
                    if (previewName) previewName.textContent = file.name;
                    if (previewContainer) previewContainer.style.display = 'block';
                } else {
                    if (previewContainer) previewContainer.style.display = 'none';
                    if (previewImg) previewImg.src = '';
                }
            }
        });
    });

    // Helper: reset all 6 upload boxes to default state
    function resetAllUploadBoxes() {
        ADMISSION_DOC_FIELDS.forEach(function(field) {
            const input = document.getElementById(field.id);
            const wrapper = input ? input.closest('.file-upload-wrapper') : null;
            if (!wrapper) return;
            wrapper.classList.remove('has-file');
            const icon = wrapper.querySelector('.file-upload-design i');
            const span = wrapper.querySelector('.file-upload-design span');
            if (icon) icon.className = 'fas fa-cloud-upload-alt';
            if (span) span.textContent = 'Click to upload or drag and drop';
        });
    }

    const admissionForm = document.getElementById('admissionForm');
    
    // Store pending form data globally for the review modal
    let pendingFormData = null;

    if (admissionForm) {
        admissionForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate: all 6 document fields must have a file
            const missingDocs = ADMISSION_DOC_FIELDS.filter(function(field) {
                const input = document.getElementById(field.id);
                return !input || !input.files || input.files.length === 0;
            });

            if (missingDocs.length > 0) {
                showToast('Please upload: ' + missingDocs.map(f => f.label).join(', '), 'error', 6000);
                return;
            }
            
            // Populate the Review Modal checklist
            const reviewDocsList = document.getElementById('reviewDocsList');
            const reviewPassportImg = document.getElementById('reviewPassportImg');
            
            if (reviewDocsList) {
                reviewDocsList.innerHTML = ADMISSION_DOC_FIELDS.filter(f => f.id !== 'passportPhoto').map(field => {
                    const input = document.getElementById(field.id);
                    const fileName = input && input.files[0] ? input.files[0].name : '';
                    return `
                        <div class="review-doc-item">
                            <span><i class="fas fa-file-alt" style="color:var(--text-light);"></i> ${field.label}</span>
                            <span style="color:var(--primary-color);">${fileName}</span>
                        </div>
                    `;
                }).join('');
            }
            
            if (reviewPassportImg) {
                const passportInput = document.getElementById('passportPhoto');
                if (passportInput && passportInput.files[0]) {
                    reviewPassportImg.src = URL.createObjectURL(passportInput.files[0]);
                }
            }

            // Build FormData manually — append all files under 'documents' key
            pendingFormData = new FormData();
            pendingFormData.append('fullName', document.getElementById('fullName').value.trim());
            pendingFormData.append('email',    document.getElementById('email').value.trim());
            pendingFormData.append('phone',    document.getElementById('phone').value.trim());
            pendingFormData.append('program',  document.getElementById('program').value);
            pendingFormData.append('password', 'password123');

            ADMISSION_DOC_FIELDS.forEach(function(field) {
                const input = document.getElementById(field.id);
                if (input && input.files[0]) {
                    pendingFormData.append('documents', input.files[0]);
                }
            });

            // Show Review Modal
            const modal = document.getElementById('reviewModal');
            if (modal) {
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('active'), 10);
            }
        });
    }

    window.closeReviewModal = function() {
        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    };

    window.confirmSubmitApplication = async function() {
        if (!pendingFormData) return;
        
        const confirmBtn = document.getElementById('reviewConfirmBtn');
        const goBackBtn = document.getElementById('reviewGoBackBtn');
        const submitBtn = document.querySelector('.submit-btn');

        // Show loading state
        if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...'; }
        if (goBackBtn) { goBackBtn.disabled = true; }
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...'; }

        try {
            const response = await fetch(`${API_BASE_URL}/students/register`, {
                method: 'POST',
                body: pendingFormData
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Application submitted successfully! You will be contacted via email once reviewed.', 'success', 7000);
                if (admissionForm) admissionForm.reset();
                resetAllUploadBoxes();
                
                // Clear passport preview specifically
                const previewContainer = document.getElementById('passportPreviewContainer');
                if (previewContainer) previewContainer.style.display = 'none';
                
                closeReviewModal();
            } else {
                showToast('Error: ' + (data.message || 'Failed to submit application'), 'error');
            }
        } catch (err) {
            console.error('Registration Error:', err);
            showToast('Connection error: ' + (err.message || 'Check your internet connection.'), 'error');
        } finally {
            if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Confirm & Submit'; }
            if (goBackBtn) { goBackBtn.disabled = false; }
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Submit Application'; }
        }
    };

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
            const docs = app.documents || [];

            const tr = document.createElement('tr');
            tr.dataset.id = app._id;

            tr.innerHTML = `
                <td>
                    <div style="font-weight:600; color:var(--secondary-color);">${app.fullName}</div>
                    <div style="font-size:0.8rem; color:var(--text-light);">${app.email}</div>
                    <div style="font-size:0.78rem; color:var(--text-light);">${app.phone || ''}</div>
                </td>
                <td>${app.program}</td>
                <td>${new Date(app.dateApplied).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge status-${status.toLowerCase()}">
                        ${status === 'Pending' ? '\uD83D\uDFE1' : status === 'Approved' ? '\uD83D\uDFE2' : '\uD83D\uDD34'} ${status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm" style="background:var(--secondary-color);color:#fff;margin-bottom:0.3rem;" onclick="viewDocs('${app._id}')">
                        <i class="fas fa-folder-open"></i> View Docs (${docs.length})
                    </button>
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

    // Open the documents modal for a given application
    window.viewDocs = function(id) {
        const app = allApplications.find(a => a._id === id);
        if (!app) return;

        const DOC_LABELS = [
            'SSCE (WAEC/NECO/NABTEB)',
            'Certificate of State of Origin',
            'Birth Certificate',
            'NIN (National Identification Number)',
            'Medical Fitness Report',
            'Passport Photograph'
        ];

        const docs = app.documents || [];
        const modal = document.getElementById('docsModal');
        const modalTitle = document.getElementById('docsModalTitle');
        const docsList = document.getElementById('docsModalList');

        if (!modal || !docsList) return;

        modalTitle.textContent = app.fullName + ' — Documents';

        if (docs.length === 0) {
            docsList.innerHTML = '<p style="color:var(--text-light); text-align:center; padding:2rem;">No documents uploaded for this application.</p>';
        } else {
            docsList.innerHTML = docs.map(function(doc, i) {
                const label = DOC_LABELS[i] || ('Document ' + (i + 1));
                const originalName = doc.originalName || '';
                const mimeType = doc.mimeType || '';
                const isImage = mimeType.startsWith('image/');
                const isPdf   = mimeType === 'application/pdf';
                const icon    = isPdf ? 'fa-file-pdf' : isImage ? 'fa-file-image' : 'fa-file';
                return `
                    <div class="doc-item">
                        <div class="doc-item-info" title="${originalName}">
                            <i class="fas ${icon} doc-icon"></i>
                            <span class="doc-label">${label}</span>
                        </div>
                        <button onclick="fetchSecureDocument('${app._id}', ${i}, '${originalName}')" class="btn btn-sm btn-approve doc-download-btn">
                            <i class="fas fa-external-link-alt"></i> Open
                        </button>
                    </div>
                `;
            }).join('');
        }

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    };

    window.fetchSecureDocument = async function(appId, docIndex, fileName) {
        const token = localStorage.getItem('jmc_token');
        if (!token) {
            showToast('Unauthorized. Please login again.', 'error');
            return;
        }
        
        try {
            showToast('Opening document...', 'success');
            const response = await fetch(`${API_BASE_URL}/admin/applications/${appId}/documents/${docIndex}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) showToast('Document file is missing from server.', 'error');
                else showToast('Failed to load document.', 'error');
                return;
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            // Open in new tab
            const newTab = window.open(objectUrl, '_blank');
            if (!newTab) {
                showToast('Popup blocked! Please allow popups for this site.', 'error');
            }
            
            // Optional cleanup (revoke after a short delay so the new tab can load it)
            setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
        } catch (error) {
            console.error('Error fetching document:', error);
            showToast('Network error while opening document.', 'error');
        }
    };

    window.closeDocsModal = function() {
        const modal = document.getElementById('docsModal');
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
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

    // --- STUDENT ID AUTO-FORMATTER ---
    const studentIdInput = document.getElementById('studentId');
    if (studentIdInput) {
        studentIdInput.addEventListener('input', function (e) {
            let cursorPosition = e.target.selectionStart;
            let originalValue = e.target.value.toUpperCase();

            // Extract just the alphanumeric characters
            let digits = originalValue.replace(/[^A-Z0-9]/g, '');

            // If they just type numbers, auto-prefix JMC
            if (/^\d/.test(digits) && !digits.startsWith('JMC')) {
                digits = 'JMC' + digits;
            }

            let formatted = '';
            if (digits.length > 0) {
                // PART 1: JMC
                formatted = digits.substring(0, 3);

                // PART 2: YYYY
                if (digits.length > 3) {
                    formatted += '/' + digits.substring(3, 7);
                }

                // PART 3: NNN
                if (digits.length > 7) {
                    formatted += '/' + digits.substring(7, 11);
                }
            }

            // Only update if it actually changed to prevent cursor jumps
            if (e.target.value !== formatted) {
                e.target.value = formatted;

                // Try to maintain cursor position (simple logic)
                if (cursorPosition) {
                    // If we added a slash, adjust cursor
                    let slashesBefore = (formatted.substring(0, cursorPosition).match(/\//g) || []).length;
                    let slashesAfter = (originalValue.substring(0, cursorPosition).match(/\//g) || []).length;
                    if (slashesBefore > slashesAfter) cursorPosition++;
                    e.target.setSelectionRange(cursorPosition, cursorPosition);
                }
            }
        });

        // Also handle backspace specifically for slashes
        studentIdInput.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace') {
                const pos = this.selectionStart;
                if (this.value[pos - 1] === '/') {
                    // If they delete a slash, delete the character before it too
                    this.value = this.value.substring(0, pos - 2) + this.value.substring(pos);
                    this.setSelectionRange(pos - 2, pos - 2);
                    e.preventDefault();
                }
            }
        });
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
                showToast(`Connection error: ${err.message || 'Check your internet connection'}.`, 'error');
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
                    showToast(`Connection error: ${err.message || 'Check your internet'}.`, 'error');
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
                // Use dedicated admin login endpoint
                const response = await fetch(`${API_BASE_URL}/admin/login`, {
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
                showToast(`Connection error: ${err.message || 'Check your internet'}.`, 'error');
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

    // Mobile / Touch Dropdown Menu Click Support
    document.querySelectorAll('.dropdown > a').forEach(function (toggle) {
        toggle.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                const parent = this.closest('.dropdown');
                if (parent) {
                    const menu = parent.querySelector('.dropdown-menu');
                    if (menu) {
                        e.preventDefault();
                        const isVisible = window.getComputedStyle(menu).display === 'block';
                        menu.style.display = isVisible ? 'none' : 'block';
                    }
                }
            }
        });
    });

    // --- PROGRAM SECTION NAV TOGGLE ---
    window.openProgramSection = function (type) {
        const degreeSection = document.getElementById('degree-section');
        const diplomaSection = document.getElementById('diploma-section');
        
        if (!degreeSection || !diplomaSection) return;

        if (type === 'degree') {
            degreeSection.style.display = 'block';
            diplomaSection.style.display = 'none';
        } else if (type === 'diploma') {
            diplomaSection.style.display = 'block';
            degreeSection.style.display = 'none';
        }
        
        // Close the mobile menu if open
        const mainNav = document.querySelector('.main-nav');
        if (mainNav && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
            if (mobileMenuBtn) mobileMenuBtn.style.opacity = '1';
        }

        // Smooth scroll to the top of the section
        setTimeout(function () {
            const header = document.querySelector('.main-header');
            const headerOffset = header ? header.offsetHeight + 20 : 80;
            const targetSection = type === 'degree' ? degreeSection : diplomaSection;
            const pos = targetSection.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: pos - headerOffset, behavior: 'smooth' });
        }, 80);
    };

    // Show correct section if URL hash matches on load
    (function () {
        const hash = window.location.hash.toLowerCase().replace('#', '');
        if (hash === 'diploma' || hash === 'degree') {
            window.openProgramSection(hash);
        }
    })();
});


/* --------------------------------- */
/* Gallery Lightbox Logic */
/* --------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    if (galleryItems.length > 0 && lightbox) {
        let currentIndex = 0;
        const images = Array.from(galleryItems).map(item => item.querySelector('.gallery-img').src);

        function openLightbox(index) {
            currentIndex = index;
            lightboxImg.src = images[currentIndex];
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % images.length;
            lightboxImg.src = images[currentIndex];
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            lightboxImg.src = images[currentIndex];
        }

        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => openLightbox(index));
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxNext.addEventListener('click', showNext);
        lightboxPrev.addEventListener('click', showPrev);

        // Close when clicking outside image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
        });
    }

    // ==========================================
    // CONTACT FORM HANDLING
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitContactBtn');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = 'Sending...';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE_URL}/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    showToast(result.message, 'success', 5000);
                    contactForm.reset();
                } else {
                    showToast(result.message || 'Failed to send message.', 'error');
                }
            } catch (error) {
                console.error('Contact form error:', error);
                showToast('Network error while sending message.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }
});
