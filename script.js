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
                const hasProgramSections = document.getElementById('degree-section') || document.getElementById('diploma-section');
                if (hasProgramSections) {
                    e.preventDefault();
                    if (mainNav && mainNav.classList.contains('active')) {
                        mainNav.classList.remove('active');
                    }
                    const filterName = targetId === '#degree' ? 'degree' : (targetId === '#diploma' ? 'diploma' : 'all');
                    if (typeof window.openProgramSection === 'function') {
                        window.openProgramSection(filterName);
                        return;
                    } else if (typeof window.filterPrograms === 'function') {
                        window.filterPrograms(filterName, true);
                        return;
                    }
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
            
            // Generic Live Preview Logic for ALL file fields
            let previewContainer = wrapper.nextElementSibling;
            if (!previewContainer || !previewContainer.classList.contains('document-preview-container')) {
                previewContainer = document.createElement('div');
                previewContainer.className = 'document-preview-container';
                previewContainer.style.display = 'none';
                previewContainer.innerHTML = `
                    <div class="passport-preview-card" style="margin-top: 15px; display: flex; align-items: center; gap: 15px; padding: 15px; background: var(--bg-light); border-radius: 8px; border: 1px dashed var(--border-color);">
                        <img class="preview-img" src="" alt="Preview" style="display:none; max-height: 80px; max-width: 80px; object-fit: cover; border-radius: 6px;">
                        <i class="preview-icon fas fa-file-pdf" style="font-size: 3rem; color: var(--primary-color); display:none;"></i>
                        <div class="passport-preview-info">
                            <div style="display:flex; align-items: center; gap: 5px; margin-bottom: 5px;">
                                <i class="fas fa-check-circle" style="color:#2ecc71;"></i>
                                <strong>Document uploaded</strong>
                            </div>
                            <p class="preview-name" style="font-size:0.85rem; color:var(--text-light); word-break: break-all; margin: 0;"></p>
                        </div>
                    </div>
                `;
                if (field.id === 'passportPhoto') {
                    const infoDiv = previewContainer.querySelector('.passport-preview-info');
                    const tip = document.createElement('p');
                    tip.className = 'passport-preview-tip';
                    tip.style.cssText = 'margin-top: 8px; font-size: 0.8rem; color: var(--text-color);';
                    tip.innerHTML = '<i class="fas fa-info-circle"></i> Make sure this is a clear photo of your face on a <strong>white background</strong>.';
                    infoDiv.appendChild(tip);
                }
                wrapper.parentNode.insertBefore(previewContainer, wrapper.nextSibling);
            }
            
            const previewImg = previewContainer.querySelector('.preview-img');
            const previewIcon = previewContainer.querySelector('.preview-icon');
            const previewName = previewContainer.querySelector('.preview-name');
            
            if (this.files && this.files[0]) {
                const file = this.files[0];
                if (previewName) previewName.textContent = file.name;
                
                if (file.type.startsWith('image/')) {
                    const url = URL.createObjectURL(file);
                    if (previewImg) {
                        previewImg.src = url;
                        previewImg.style.display = 'block';
                    }
                    if (previewIcon) previewIcon.style.display = 'none';
                } else {
                    if (previewImg) {
                        previewImg.src = '';
                        previewImg.style.display = 'none';
                    }
                    if (previewIcon) previewIcon.style.display = 'block';
                }
                previewContainer.style.display = 'block';
            } else {
                previewContainer.style.display = 'none';
                if (previewImg) previewImg.src = '';
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
                        <button class="btn btn-sm btn-secondary" onclick="downloadLetter('${app._id}')" title="Reprint Admission Letter">
                            <i class="fas fa-file-pdf"></i> Letter
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

    // Student Login Handler - FULL API INTEGRATION
    const loginForm = document.getElementById('studentLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const rawId = document.getElementById('studentId').value.trim();
            // Automatically convert slashes to hyphens and uppercase (e.g. jmc/2026/1550 -> JMC-2026-1550)
            const studentId = rawId.replace(/\//g, '-').toUpperCase();
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

    // Dashboard Initialization - FULL API INTEGRATION
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
            idEls.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = (id === 'profileIdHeader' ? 'ID: ' : '') + (student.studentId || student.applicationNumber || student.email); });

            const emailEls = ['sidebarEmail', 'viewEmail'];
            emailEls.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = student.email; });

            const programEl = document.getElementById('viewProgram');
            if (programEl) programEl.textContent = student.program;

            const phoneEl = document.getElementById('viewPhone');
            if (phoneEl) phoneEl.textContent = student.phone || 'Not Set';

            const avatarInt = document.getElementById('avatarInitial');
            if (avatarInt) avatarInt.textContent = student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S';

            const statusEl = document.getElementById('viewStatus');
            if (statusEl) statusEl.textContent = student.admissionStatus || 'Approved';

            // Inputs (for edit mode)
            const inputMap = { 
                'editFullName': student.fullName, 
                'editId': student.studentId || student.applicationNumber || student.email, 
                'editProgram': student.program, 
                'editEmail': student.email, 
                'editPhone': student.phone || '' 
            };
            Object.entries(inputMap).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val; });
        };

        // Fetch latest student data from authenticated endpoint
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
                localStorage.setItem('jmc_logged_student', JSON.stringify(student));
                updateUI(student);
            })
            .catch(err => {
                console.error('Dashboard Auth Error:', err);
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
            const s = JSON.parse(localStorage.getItem('jmc_logged_student'));
            if (s) updateUI(s);
        };

        // Profile Form Submit - Update Phone via API
        const profileInPlaceForm = document.getElementById('profileInPlaceForm');
        if (profileInPlaceForm) {
            profileInPlaceForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const phone = document.getElementById('editPhone').value.trim();

                try {
                    const response = await fetch(`${API_BASE_URL}/students/me`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ phone })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem('jmc_logged_student', JSON.stringify(data.student));
                        showToast('Profile updated successfully!', 'success');
                        exitEditMode();
                        updateUI(data.student);
                    } else {
                        showToast('Update failed: ' + (data.message || 'Error updating profile'), 'error');
                    }
                } catch (err) {
                    console.error('Update Error:', err);
                    showToast('Connection error: Could not update profile.', 'error');
                }
            });
        }

        // Change Password Form
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPortalPassword').value;
                const confirmPassword = document.getElementById('confirmPortalPassword').value;
                const submitBtn = document.getElementById('changePassSubmitBtn');

                if (newPassword !== confirmPassword) {
                    showToast('New passwords do not match.', 'error');
                    return;
                }

                if (newPassword.length < 6) {
                    showToast('Password must be at least 6 characters long.', 'error');
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.innerText = 'Updating...';

                try {
                    const response = await fetch(`${API_BASE_URL}/students/change-password`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ currentPassword, newPassword })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        showToast('Password changed successfully!', 'success');
                        changePasswordForm.reset();
                        closeModal('changePasswordModal');
                    } else {
                        showToast(data.message || 'Failed to change password', 'error');
                    }
                } catch (err) {
                    console.error('Change Password Error:', err);
                    showToast('Connection error. Please try again.', 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Update Password';
                }
            });
        }

        // Secure Document Download for Logged-In Student
        window.downloadStudentDoc = async function (docIndex) {
            try {
                showToast('Retrieving document...', 'info');
                const response = await fetch(`${API_BASE_URL}/students/documents/${docIndex}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    showToast(errData.message || 'Failed to download document', 'error');
                    return;
                }

                const blob = await response.blob();
                const disposition = response.headers.get('content-disposition');
                let filename = `Document-${docIndex + 1}`;
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                showToast('Document downloaded successfully', 'success');
            } catch (err) {
                console.error('Download doc error:', err);
                showToast('Error downloading document', 'error');
            }
        };
    }

    window.switchTab = function (tabName) {
        document.querySelectorAll('.dashboard-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
        const targetTab = document.getElementById('tab-' + tabName);
        if (targetTab) targetTab.classList.add('active');
        if (window.event && window.event.currentTarget) window.event.currentTarget.classList.add('active');
    };

    window.logoutStudent = function () {
        localStorage.removeItem('jmc_logged_student');
        localStorage.removeItem('jmc_token');
        window.location.href = 'student-login.html';
    };

    // --- TEACHING STAFF PORTAL LOGIC ---
    try {
        // Staff Login Handler
        const staffLoginForm = document.getElementById('staffLoginForm');
        if (staffLoginForm) {
            staffLoginForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const emailEl = document.getElementById('staffEmail');
                const passEl = document.getElementById('staffPassword');

                if (!emailEl || !passEl) {
                    showToast('Login inputs not found.', 'error');
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
                        localStorage.setItem('jmc_logged_staff', JSON.stringify(data));
                        localStorage.setItem('jmc_staff_token', data.token);
                        showToast('Staff login successful! Redirecting...', 'success');
                        setTimeout(() => window.location.href = 'staff-dashboard.html', 1000);
                    } else {
                        showToast('Login failed: ' + (data.message || 'Incorrect credentials'), 'error');
                    }
                } catch (err) {
                    console.error('Staff Login Error:', err);
                    showToast(`Connection error: ${err.message || 'Check your internet connection'}.`, 'error');
                }
            });
        }

        // Staff Dashboard Initialization
        if (window.location.pathname.includes('staff-dashboard.html')) {
            const token = localStorage.getItem('jmc_staff_token');
            if (!token) {
                window.location.href = 'staff-login.html';
                return;
            }

            const updateStaffUI = (staff) => {
                const nameEl = document.getElementById('dispStaffName');
                if (nameEl) nameEl.textContent = staff.fullName;

                const idEl = document.getElementById('dispStaffId');
                if (idEl) idEl.textContent = staff.staffId || 'Not Assigned';

                const deptEl = document.getElementById('dispStaffDept');
                if (deptEl) deptEl.textContent = staff.department || 'General Health Sciences';

                const emailEl = document.getElementById('dispStaffEmail');
                if (emailEl) emailEl.textContent = staff.email;

                const phoneEl = document.getElementById('staffUpdatePhone');
                if (phoneEl) phoneEl.value = staff.phone || '';

                const sidebarName = document.getElementById('staffSidebarName');
                if (sidebarName) sidebarName.textContent = staff.fullName;

                const sidebarDept = document.getElementById('staffSidebarDept');
                if (sidebarDept) sidebarDept.textContent = staff.department || 'General Health Sciences';

                const avatar = document.getElementById('staffAvatarInitial');
                if (avatar) avatar.textContent = staff.fullName ? staff.fullName.charAt(0).toUpperCase() : 'T';
            };

            // Fetch live profile from backend
            fetch(`${API_BASE_URL}/staff/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Unauthorized or expired staff session');
                    }
                    return response.json();
                })
                .then(staff => {
                    localStorage.setItem('jmc_logged_staff', JSON.stringify(staff));
                    updateStaffUI(staff);
                })
                .catch(err => {
                    console.error('Staff Auth Error:', err);
                    localStorage.removeItem('jmc_staff_token');
                    localStorage.removeItem('jmc_logged_staff');
                    window.location.href = 'staff-login.html';
                });

            // Staff Logout
            document.getElementById('staffLogoutBtn')?.addEventListener('click', function (e) {
                e.preventDefault();
                localStorage.removeItem('jmc_staff_token');
                localStorage.removeItem('jmc_logged_staff');
                window.location.href = 'staff-login.html';
            });

            // Staff Profile Phone Update
            const staffProfileForm = document.getElementById('staffProfileForm');
            if (staffProfileForm) {
                staffProfileForm.addEventListener('submit', async function (e) {
                    e.preventDefault();
                    const phone = document.getElementById('staffUpdatePhone').value.trim();
                    const submitBtn = document.getElementById('saveStaffPhoneBtn');

                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerText = 'Saving...';
                    }

                    try {
                        const response = await fetch(`${API_BASE_URL}/staff/me`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ phone })
                        });

                        const data = await response.json();

                        if (response.ok) {
                            localStorage.setItem('jmc_logged_staff', JSON.stringify(data.staff));
                            showToast('Staff contact updated successfully!', 'success');
                            updateStaffUI(data.staff);
                        } else {
                            showToast('Update failed: ' + (data.message || 'Error updating profile'), 'error');
                        }
                    } catch (err) {
                        console.error('Update Error:', err);
                        showToast('Connection error: Could not update profile.', 'error');
                    } finally {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerText = 'Save Contact Updates';
                        }
                    }
                });
            }

            // Staff In-Profile Password Change
            const staffChangePassForm = document.getElementById('staffChangePassForm');
            if (staffChangePassForm) {
                staffChangePassForm.addEventListener('submit', async function(e) {
                    e.preventDefault();

                    const currentPassword = document.getElementById('staffCurrentPass').value;
                    const newPassword = document.getElementById('staffNewPass').value;
                    const confirmPassword = document.getElementById('staffConfirmPass').value;
                    const submitBtn = document.getElementById('staffPassSubmitBtn');

                    if (newPassword !== confirmPassword) {
                        showToast('New passwords do not match.', 'error');
                        return;
                    }

                    if (newPassword.length < 6) {
                        showToast('Password must be at least 6 characters.', 'error');
                        return;
                    }

                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerText = 'Saving...';
                    }

                    try {
                        const response = await fetch(`${API_BASE_URL}/staff/change-password`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ currentPassword, newPassword })
                        });

                        const data = await response.json();

                        if (response.ok) {
                            showToast('Password changed successfully!', 'success');
                            staffChangePassForm.reset();
                            closeStaffChangePassModal();
                        } else {
                            showToast(data.message || 'Failed to change password', 'error');
                        }
                    } catch (err) {
                        console.error('Staff change pass error:', err);
                        showToast('Connection error. Please try again.', 'error');
                    } finally {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerText = 'Save Password';
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.error('General failure in Staff Portal logic:', e);
    }

    // Staff Modal Global Helpers
    window.openStaffChangePassModal = function() {
        const modal = document.getElementById('staffChangePasswordModal');
        if (modal) modal.style.display = 'flex';
    };

    window.closeStaffChangePassModal = function() {
        const modal = document.getElementById('staffChangePasswordModal');
        if (modal) modal.style.display = 'none';
    };

    // --- ADMIN LOGIN LOGIC ---

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
        
        const btnDegree = document.getElementById('btn-show-degree');
        const btnDiploma = document.getElementById('btn-show-diploma');

        if (type === 'degree') {
            degreeSection.style.display = 'block';
            diplomaSection.style.display = 'none';
            if (btnDegree && btnDiploma) {
                btnDegree.className = 'btn btn-primary program-tab-btn';
                btnDiploma.className = 'btn btn-secondary program-tab-btn';
            }
        } else if (type === 'diploma') {
            diplomaSection.style.display = 'block';
            degreeSection.style.display = 'none';
            if (btnDegree && btnDiploma) {
                btnDiploma.className = 'btn btn-primary program-tab-btn';
                btnDegree.className = 'btn btn-secondary program-tab-btn';
            }
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

    // Alias for compatibility
    window.filterPrograms = function (type) {
        window.openProgramSection(type);
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
                    showToast(result.message || 'Message sent successfully!', 'success', 5000);
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

    // ==========================================
    // NEWS & EVENTS CMS (ADMIN DASHBOARD)
    // ==========================================
    window.switchAdminTab = function(tabName) {
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

        const targetBtn = document.querySelector(`.admin-tab-btn[onclick="switchAdminTab('${tabName}')"]`);
        const targetContent = document.getElementById(`tabContent-${tabName}`);

        if (targetBtn) targetBtn.classList.add('active');
        if (targetContent) targetContent.classList.add('active');

        if (tabName === 'news') loadAdminNews();
        if (tabName === 'events') loadAdminEvents();
    };

    // --- Admin News Logic ---
    let allAdminNews = [];
    async function loadAdminNews() {
        const token = localStorage.getItem('jmc_token');
        if (!token) return;

        const body = document.getElementById('adminNewsBody');
        const empty = document.getElementById('emptyNewsState');
        if (!body) return;

        body.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Loading articles...</td></tr>`;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/news`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();

            if (res.ok && result.data) {
                allAdminNews = result.data;
                renderAdminNews(allAdminNews);
            } else {
                body.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Failed to load news</td></tr>`;
            }
        } catch (err) {
            console.error('Admin news fetch error:', err);
            body.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Error connecting to server</td></tr>`;
        }
    }

    function renderAdminNews(newsList) {
        const body = document.getElementById('adminNewsBody');
        const empty = document.getElementById('emptyNewsState');
        if (!body) return;

        body.innerHTML = '';
        if (newsList.length === 0) {
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        newsList.forEach(item => {
            const tr = document.createElement('tr');
            const dateStr = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString();
            const statusClass = item.status === 'published' ? 'status-published' : item.status === 'draft' ? 'status-draft' : 'status-archived';

            tr.innerHTML = `
                <td>
                    <div style="font-weight:600; color:var(--secondary-color); font-size:0.95rem;">${item.title}</div>
                    <div style="font-size:0.8rem; color:var(--text-light); margin-top:0.2rem; max-width:400px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        ${item.excerpt}
                    </div>
                </td>
                <td><span class="news-badge">${item.category}</span></td>
                <td>${dateStr}</td>
                <td><span class="status-badge ${statusClass}">${item.status}</span></td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="openEditNewsModal('${item._id}')" title="Edit Article">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm ${item.status === 'published' ? 'btn-cancel' : 'btn-approve'}" onclick="toggleNewsStatus('${item._id}', '${item.status === 'published' ? 'draft' : 'published'}')">
                        ${item.status === 'published' ? '<i class="fas fa-eye-slash"></i> Unpublish' : '<i class="fas fa-paper-plane"></i> Publish'}
                    </button>
                    <button class="btn btn-sm btn-reject" onclick="deleteNews('${item._id}')" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            body.appendChild(tr);
        });
    }

    window.openCreateNewsModal = function() {
        const form = document.getElementById('newsEditorForm');
        if (form) form.reset();
        document.getElementById('newsEditId').value = '';
        document.getElementById('newsFeaturedImageUrl').value = '';
        document.getElementById('newsVideoUrl').value = '';
        const videoInput = document.getElementById('newsVideoUrlInput');
        if (videoInput) videoInput.value = '';
        document.getElementById('newsModalTitle').innerText = 'Create News Article';
        document.getElementById('newsImagePreviewBox').style.display = 'none';
        const videoBox = document.getElementById('newsVideoPreviewBox');
        if (videoBox) videoBox.style.display = 'none';
        
        const modal = document.getElementById('newsModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    };

    window.openEditNewsModal = function(id) {
        const item = allAdminNews.find(n => n._id === id);
        if (!item) return;

        document.getElementById('newsEditId').value = item._id;
        document.getElementById('newsTitleInput').value = item.title;
        document.getElementById('newsCategorySelect').value = item.category;
        document.getElementById('newsStatusSelect').value = item.status;
        document.getElementById('newsExcerptInput').value = item.excerpt;
        document.getElementById('newsContentInput').value = item.content;
        document.getElementById('newsFeaturedImageUrl').value = item.featuredImage || '';
        document.getElementById('newsVideoUrl').value = item.videoUrl || '';
        const videoInput = document.getElementById('newsVideoUrlInput');
        if (videoInput) videoInput.value = item.videoUrl && !item.videoUrl.startsWith('/api/uploads/') ? item.videoUrl : '';
        document.getElementById('newsModalTitle').innerText = 'Edit News Article';

        const previewBox = document.getElementById('newsImagePreviewBox');
        const previewImg = document.getElementById('newsImagePreviewImg');
        if (item.featuredImage) {
            previewImg.src = item.featuredImage;
            previewBox.style.display = 'block';
        } else {
            previewBox.style.display = 'none';
        }

        const videoBox = document.getElementById('newsVideoPreviewBox');
        const videoPlayer = document.getElementById('newsVideoPreviewPlayer');
        if (item.videoUrl && item.videoUrl.startsWith('/api/uploads/') && videoBox && videoPlayer) {
            videoPlayer.src = item.videoUrl;
            videoBox.style.display = 'block';
        } else if (videoBox) {
            videoBox.style.display = 'none';
        }

        const modal = document.getElementById('newsModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    };

    window.closeNewsModal = function() {
        const modal = document.getElementById('newsModal');
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    };

    // Helper: Upload file (image or video) to /api/admin/upload-image
    async function uploadMediaFile(fileInput) {
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) return null;
        const token = localStorage.getItem('jmc_token');
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);

        const res = await fetch(`${API_BASE_URL}/admin/upload-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();
        if (res.ok && (data.imageUrl || data.fileUrl || data.videoUrl)) {
            return data.fileUrl || data.imageUrl || data.videoUrl;
        } else {
            throw new Error(data.message || 'File upload failed');
        }
    }

    const newsEditorForm = document.getElementById('newsEditorForm');
    if (newsEditorForm) {
        // Image preview listener
        const imgInput = document.getElementById('newsImageFileInput');
        if (imgInput) {
            imgInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = e => {
                        document.getElementById('newsImagePreviewImg').src = e.target.result;
                        document.getElementById('newsImagePreviewBox').style.display = 'block';
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }

        // Media (Video / Audio) preview listener
        const vidInput = document.getElementById('newsVideoFileInput');
        if (vidInput) {
            vidInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    const url = URL.createObjectURL(file);
                    const vidPlayer = document.getElementById('newsVideoPreviewPlayer');
                    const audPlayer = document.getElementById('newsAudioPreviewPlayer');
                    const box = document.getElementById('newsVideoPreviewBox');
                    const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|aac|m4a)$/i.test(file.name);

                    if (box) box.style.display = 'block';
                    if (isAudio) {
                        if (vidPlayer) vidPlayer.style.display = 'none';
                        if (audPlayer) {
                            audPlayer.src = url;
                            audPlayer.style.display = 'block';
                        }
                    } else {
                        if (audPlayer) audPlayer.style.display = 'none';
                        if (vidPlayer) {
                            vidPlayer.src = url;
                            vidPlayer.style.display = 'block';
                        }
                    }
                }
            });
        }

        newsEditorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const token = localStorage.getItem('jmc_token');
            const saveBtn = document.getElementById('saveNewsBtn');
            const editId = document.getElementById('newsEditId').value;
            const fileInput = document.getElementById('newsImageFileInput');
            const videoFileInput = document.getElementById('newsVideoFileInput');
            const videoUrlInput = document.getElementById('newsVideoUrlInput');

            saveBtn.disabled = true;
            saveBtn.innerText = 'Saving...';

            try {
                let featuredImage = document.getElementById('newsFeaturedImageUrl').value;
                if (fileInput && fileInput.files.length > 0) {
                    saveBtn.innerText = 'Uploading Image...';
                    featuredImage = await uploadMediaFile(fileInput);
                }

                let videoUrl = document.getElementById('newsVideoUrl').value;
                if (videoFileInput && videoFileInput.files.length > 0) {
                    saveBtn.innerText = 'Uploading Video...';
                    videoUrl = await uploadMediaFile(videoFileInput);
                } else if (videoUrlInput && videoUrlInput.value.trim()) {
                    videoUrl = videoUrlInput.value.trim();
                }

                saveBtn.innerText = 'Saving Article...';

                const payload = {
                    title: document.getElementById('newsTitleInput').value.trim(),
                    category: document.getElementById('newsCategorySelect').value,
                    status: document.getElementById('newsStatusSelect').value,
                    excerpt: document.getElementById('newsExcerptInput').value.trim(),
                    content: document.getElementById('newsContentInput').value.trim(),
                    videoUrl: videoUrl || null,
                    featuredImage
                };

                const url = editId ? `${API_BASE_URL}/admin/news/${editId}` : `${API_BASE_URL}/admin/news`;
                const method = editId ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok) {
                    showToast(data.message || 'Article saved successfully!', 'success');
                    closeNewsModal();
                    loadAdminNews();
                } else {
                    showToast(data.message || 'Error saving article', 'error');
                }
            } catch (err) {
                console.error('News save error:', err);
                showToast(err.message || 'Failed to save article', 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerText = 'Save Article';
            }
        });
    }

    window.toggleNewsStatus = async function(id, newStatus) {
        const token = localStorage.getItem('jmc_token');
        try {
            const res = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`Status updated to ${newStatus}`, 'success');
                loadAdminNews();
            } else {
                showToast(data.message || 'Failed to update status', 'error');
            }
        } catch (e) {
            showToast('Connection error', 'error');
        }
    };

    window.deleteNews = function(id) {
        const item = allAdminNews.find(n => n._id === id);
        showConfirm(
            `Are you sure you want to delete the article "${item ? item.title : 'this item'}"?`,
            async () => {
                const token = localStorage.getItem('jmc_token');
                try {
                    const res = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (res.ok) {
                        showToast('Article deleted', 'success');
                        loadAdminNews();
                    } else {
                        showToast(data.message || 'Failed to delete', 'error');
                    }
                } catch (e) {
                    showToast('Network error while deleting', 'error');
                }
            },
            null,
            'Yes, Delete'
        );
    };

    // --- Admin Events Logic ---
    let allAdminEvents = [];
    async function loadAdminEvents() {
        const token = localStorage.getItem('jmc_token');
        if (!token) return;

        const body = document.getElementById('adminEventsBody');
        const empty = document.getElementById('emptyEventsState');
        if (!body) return;

        body.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Loading events...</td></tr>`;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/events`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();

            if (res.ok && result.data) {
                allAdminEvents = result.data;
                renderAdminEvents(allAdminEvents);
            } else {
                body.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Failed to load events</td></tr>`;
            }
        } catch (err) {
            console.error('Admin events fetch error:', err);
            body.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Error connecting to server</td></tr>`;
        }
    }

    function renderAdminEvents(eventsList) {
        const body = document.getElementById('adminEventsBody');
        const empty = document.getElementById('emptyEventsState');
        if (!body) return;

        body.innerHTML = '';
        if (eventsList.length === 0) {
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        eventsList.forEach(item => {
            const tr = document.createElement('tr');
            const dateStr = new Date(item.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const statusClass = item.status === 'published' ? 'status-published' : item.status === 'draft' ? 'status-draft' : 'status-archived';

            tr.innerHTML = `
                <td>
                    <div style="font-weight:600; color:var(--secondary-color); font-size:0.95rem;">${item.title}</div>
                    <div style="font-size:0.8rem; color:var(--text-light); margin-top:0.2rem;"><i class="fas fa-map-marker-alt"></i> ${item.location}</div>
                </td>
                <td>
                    <div style="font-weight:500;">${dateStr}</div>
                    <div style="font-size:0.8rem; color:var(--text-light);">${item.startTime}${item.endTime ? ' - ' + item.endTime : ''}</div>
                </td>
                <td><span class="news-badge">${item.category}</span></td>
                <td><span class="status-badge ${statusClass}">${item.status}</span></td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="openEditEventModal('${item._id}')" title="Edit Event">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm ${item.status === 'published' ? 'btn-cancel' : 'btn-approve'}" onclick="toggleEventStatus('${item._id}', '${item.status === 'published' ? 'draft' : 'published'}')">
                        ${item.status === 'published' ? '<i class="fas fa-eye-slash"></i> Unpublish' : '<i class="fas fa-paper-plane"></i> Publish'}
                    </button>
                    <button class="btn btn-sm btn-reject" onclick="deleteEvent('${item._id}')" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            body.appendChild(tr);
        });
    }

    window.openCreateEventModal = function() {
        const form = document.getElementById('eventEditorForm');
        if (form) form.reset();
        document.getElementById('eventEditId').value = '';
        document.getElementById('eventFeaturedImageUrl').value = '';
        document.getElementById('eventVideoUrl').value = '';
        const videoInput = document.getElementById('eventVideoUrlInput');
        if (videoInput) videoInput.value = '';
        document.getElementById('eventModalTitle').innerText = 'Schedule Campus Event';
        document.getElementById('eventImagePreviewBox').style.display = 'none';
        const videoBox = document.getElementById('eventVideoPreviewBox');
        if (videoBox) videoBox.style.display = 'none';

        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    };

    window.openEditEventModal = function(id) {
        const item = allAdminEvents.find(e => e._id === id);
        if (!item) return;

        document.getElementById('eventEditId').value = item._id;
        document.getElementById('eventTitleInput').value = item.title;
        document.getElementById('eventCategorySelect').value = item.category;
        document.getElementById('eventStatusSelect').value = item.status;
        document.getElementById('eventDateInput').value = new Date(item.eventDate).toISOString().split('T')[0];
        document.getElementById('eventStartTimeInput').value = item.startTime;
        document.getElementById('eventLocationInput').value = item.location;
        document.getElementById('eventShortDescInput').value = item.shortDescription;
        document.getElementById('eventFullDescInput').value = item.fullDescription;
        document.getElementById('eventFeaturedImageUrl').value = item.featuredImage || '';
        document.getElementById('eventVideoUrl').value = item.videoUrl || '';
        const videoInput = document.getElementById('eventVideoUrlInput');
        if (videoInput) videoInput.value = item.videoUrl && !item.videoUrl.startsWith('/api/uploads/') ? item.videoUrl : '';
        document.getElementById('eventModalTitle').innerText = 'Edit Campus Event';

        const previewBox = document.getElementById('eventImagePreviewBox');
        const previewImg = document.getElementById('eventImagePreviewImg');
        if (item.featuredImage) {
            previewImg.src = item.featuredImage;
            previewBox.style.display = 'block';
        } else {
            previewBox.style.display = 'none';
        }

        const videoBox = document.getElementById('eventVideoPreviewBox');
        const videoPlayer = document.getElementById('eventVideoPreviewPlayer');
        if (item.videoUrl && item.videoUrl.startsWith('/api/uploads/') && videoBox && videoPlayer) {
            videoPlayer.src = item.videoUrl;
            videoBox.style.display = 'block';
        } else if (videoBox) {
            videoBox.style.display = 'none';
        }

        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    };

    window.closeEventModal = function() {
        const modal = document.getElementById('eventModal');
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    };

    const eventEditorForm = document.getElementById('eventEditorForm');
    if (eventEditorForm) {
        // Image preview listener
        const imgInput = document.getElementById('eventImageFileInput');
        if (imgInput) {
            imgInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = e => {
                        document.getElementById('eventImagePreviewImg').src = e.target.result;
                        document.getElementById('eventImagePreviewBox').style.display = 'block';
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }

        // Media (Video / Audio) preview listener
        const vidInput = document.getElementById('eventVideoFileInput');
        if (vidInput) {
            vidInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    const url = URL.createObjectURL(file);
                    const vidPlayer = document.getElementById('eventVideoPreviewPlayer');
                    const audPlayer = document.getElementById('eventAudioPreviewPlayer');
                    const box = document.getElementById('eventVideoPreviewBox');
                    const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|aac|m4a)$/i.test(file.name);

                    if (box) box.style.display = 'block';
                    if (isAudio) {
                        if (vidPlayer) vidPlayer.style.display = 'none';
                        if (audPlayer) {
                            audPlayer.src = url;
                            audPlayer.style.display = 'block';
                        }
                    } else {
                        if (audPlayer) audPlayer.style.display = 'none';
                        if (vidPlayer) {
                            vidPlayer.src = url;
                            vidPlayer.style.display = 'block';
                        }
                    }
                }
            });
        }

        eventEditorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const token = localStorage.getItem('jmc_token');
            const saveBtn = document.getElementById('saveEventBtn');
            const editId = document.getElementById('eventEditId').value;
            const fileInput = document.getElementById('eventImageFileInput');
            const videoFileInput = document.getElementById('eventVideoFileInput');
            const videoUrlInput = document.getElementById('eventVideoUrlInput');

            saveBtn.disabled = true;
            saveBtn.innerText = 'Saving...';

            try {
                let featuredImage = document.getElementById('eventFeaturedImageUrl').value;
                if (fileInput && fileInput.files.length > 0) {
                    saveBtn.innerText = 'Uploading Banner...';
                    featuredImage = await uploadMediaFile(fileInput);
                }

                let videoUrl = document.getElementById('eventVideoUrl').value;
                if (videoFileInput && videoFileInput.files.length > 0) {
                    saveBtn.innerText = 'Uploading Video...';
                    videoUrl = await uploadMediaFile(videoFileInput);
                } else if (videoUrlInput && videoUrlInput.value.trim()) {
                    videoUrl = videoUrlInput.value.trim();
                }

                saveBtn.innerText = 'Saving Event...';

                const payload = {
                    title: document.getElementById('eventTitleInput').value.trim(),
                    category: document.getElementById('eventCategorySelect').value,
                    status: document.getElementById('eventStatusSelect').value,
                    eventDate: document.getElementById('eventDateInput').value,
                    startTime: document.getElementById('eventStartTimeInput').value.trim(),
                    location: document.getElementById('eventLocationInput').value.trim(),
                    shortDescription: document.getElementById('eventShortDescInput').value.trim(),
                    fullDescription: document.getElementById('eventFullDescInput').value.trim(),
                    videoUrl: videoUrl || null,
                    featuredImage
                };

                const url = editId ? `${API_BASE_URL}/admin/events/${editId}` : `${API_BASE_URL}/admin/events`;
                const method = editId ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok) {
                    showToast(data.message || 'Event saved successfully!', 'success');
                    closeEventModal();
                    loadAdminEvents();
                } else {
                    showToast(data.message || 'Error saving event', 'error');
                }
            } catch (err) {
                console.error('Event save error:', err);
                showToast(err.message || 'Failed to save event', 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerText = 'Save Event';
            }
        });
    }

    // Helper: Extract YouTube Video ID from any URL format (standard, shorts, youtu.be, embed)
    function getYouTubeVideoId(url) {
        if (!url) return null;
        const ytMatch = url.trim().match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|user\/\S+|\S*?[?&]v=))([\w-]{11})/i);
        return ytMatch ? ytMatch[1] : null;
    }

    // Interactive Video Lightbox Player
    window.openVideoModal = function(e, videoUrl) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!videoUrl) return;

        let overlay = document.getElementById('globalVideoLightbox');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'globalVideoLightbox';
            overlay.className = 'video-lightbox-overlay';
            overlay.innerHTML = `
                <div class="video-lightbox-container">
                    <button class="video-lightbox-close" onclick="closeVideoModal()"><i class="fas fa-times"></i></button>
                    <div class="video-lightbox-aspect" id="videoLightboxPlayerSlot"></div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Close on clicking backdrop
            overlay.addEventListener('click', function(evt) {
                if (evt.target === overlay) {
                    closeVideoModal();
                }
            });

            // Close on ESC key
            document.addEventListener('keydown', function(evt) {
                if (evt.key === 'Escape') closeVideoModal();
            });
        }

        const slot = document.getElementById('videoLightboxPlayerSlot');
        const ytId = getYouTubeVideoId(videoUrl);

        if (ytId) {
            slot.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
        } else if (videoUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/i)) {
            const vimeoId = videoUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/i)[3];
            slot.innerHTML = `<iframe src="https://player.vimeo.com/video/${vimeoId}?autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            slot.innerHTML = `
                <video controls autoplay playsinline style="width: 100%; height: 100%; object-fit: contain; background:#000;">
                    <source src="${videoUrl}" type="video/mp4">
                    <source src="${videoUrl}">
                    Your browser does not support video playback.
                </video>
            `;
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeVideoModal = function() {
        const overlay = document.getElementById('globalVideoLightbox');
        if (overlay) {
            overlay.classList.remove('active');
            const slot = document.getElementById('videoLightboxPlayerSlot');
            if (slot) slot.innerHTML = '';
        }
        document.body.style.overflow = '';
    };

    // Helper: Render card media thumbnail (with responsive image and clickable instant play button)
    function renderCardMediaHtml(item, altText) {
        const title = altText || item.title || 'News Media';
        const rawVideo = item.videoUrl ? item.videoUrl.replace(/'/g, "\\'") : '';
        const playBtnHtml = item.videoUrl ? `
            <div class="video-play-overlay" title="Play Video" onclick="openVideoModal(event, '${rawVideo}')">
                <i class="fas fa-play"></i>
            </div>
        ` : '';
        
        // 1. If explicit featuredImage was uploaded
        if (item.featuredImage) {
            return `
                <div class="card-media-wrapper" ${item.videoUrl ? `onclick="openVideoModal(event, '${rawVideo}')"` : ''}>
                    <img src="${item.featuredImage}" alt="${title}">
                    ${playBtnHtml}
                </div>
            `;
        }

        // 2. If item has videoUrl
        if (item.videoUrl) {
            const ytId = getYouTubeVideoId(item.videoUrl);
            if (ytId) {
                // High-quality YouTube thumbnail with fallback
                return `
                    <div class="card-media-wrapper" onclick="openVideoModal(event, '${rawVideo}')">
                        <img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="${title}" onerror="this.src='https://img.youtube.com/vi/${ytId}/mqdefault.jpg'">
                        ${playBtnHtml}
                    </div>
                `;
            }

            // Direct uploaded video file (e.g. mp4/webm/mov)
            if (item.videoUrl.match(/\.(mp4|webm|mov|mkv)$/i) || item.videoUrl.includes('/uploads/')) {
                return `
                    <div class="card-media-wrapper" onclick="openVideoModal(event, '${rawVideo}')">
                        <video preload="metadata" muted playsinline style="pointer-events: none;">
                            <source src="${item.videoUrl}#t=0.5" type="video/mp4">
                            <source src="${item.videoUrl}">
                        </video>
                        ${playBtnHtml}
                    </div>
                `;
            }
        }

        // 3. Fallback institution picture
        return `
            <div class="card-media-wrapper">
                <img src="assets/hero_content1.jpeg" alt="${title}">
            </div>
        `;
    }

    // Helper: Build responsive embed HTML for YouTube, Vimeo, direct video, or audio (MP3, WAV)
    function renderVideoEmbed(url) {
        if (!url) return '';
        url = url.trim();

        // YouTube matches (standard watch, short URL youtu.be, embed, shorts, live, etc.)
        const videoId = getYouTubeVideoId(url);
        if (videoId) {
            return `
                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 12px; margin: 1.5rem 0; box-shadow: 0 4px 16px rgba(0,0,0,0.12); background: #000;">
                    <iframe src="https://www.youtube.com/embed/${videoId}?rel=0" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </div>
            `;
        }

        // Vimeo matches
        const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/i);
        if (vimeoMatch && vimeoMatch[3]) {
            return `
                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 12px; margin: 1.5rem 0; box-shadow: 0 4px 16px rgba(0,0,0,0.12); background: #000;">
                    <iframe src="https://player.vimeo.com/video/${vimeoMatch[3]}" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; border:0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        }

        // Audio files (MP3, WAV, AAC, M4A, OGG)
        if (url.match(/\.(mp3|wav|aac|m4a|oga|ogg)$/i) || url.includes('/uploads/audio-') || url.includes('/uploads/audio_')) {
            return `
                <div style="margin: 1.5rem 0; padding: 1.25rem; background: #f8f9fa; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; font-weight: 600; color: var(--secondary-color);">
                        <i class="fas fa-volume-up" style="color: var(--primary-color);"></i> Audio Broadcast / Recording
                    </div>
                    <audio controls style="width: 100%; display: block;" preload="auto">
                        <source src="${url}">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            `;
        }

        // Direct video link (e.g. mp4/webm/mov/mkv) or server uploaded video
        return `
            <div style="margin: 1.5rem 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.12); background: #000;">
                <video controls playsinline preload="auto" style="width: 100%; max-height: 520px; display: block; object-fit: contain; margin: 0 auto; background: #000;">
                    <source src="${url}" type="video/mp4">
                    <source src="${url}">
                    Your browser does not support HTML video playback.
                </video>
            </div>
        `;
    }

    // ==========================================
    // DETAIL PAGE LOADER (news-detail.html)
    // ==========================================
    async function loadDetailPage() {
        const card = document.getElementById('detailMainCard');
        const sidebarList = document.getElementById('detailSidebarList');
        if (!card) return;

        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        const isEvent = urlParams.get('type') === 'event';

        if (!slug) {
            card.innerHTML = `<div style="text-align:center; padding:3rem;"><p>Invalid article or event requested.</p><a href="news.html" class="btn btn-primary" style="margin-top:1rem;">Back to News</a></div>`;
            return;
        }

        try {
            const endpoint = isEvent ? `${API_BASE_URL}/events/${slug}` : `${API_BASE_URL}/news/${slug}`;
            const res = await fetch(endpoint);
            const json = await res.json();

            if (!res.ok || !json.data) {
                card.innerHTML = `<div style="text-align:center; padding:3rem;"><p>${json.message || 'Content not found or is unpublished.'}</p><a href="news.html" class="btn btn-primary" style="margin-top:1rem;">Back to News & Events</a></div>`;
                return;
            }

            const item = json.data;
            const videoHtml = renderVideoEmbed(item.videoUrl);

            if (isEvent) {
                const dateStr = new Date(item.eventDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                // Only show separate featured image if item has no video embed, or explicit image was supplied
                const imgHtml = (!item.videoUrl && item.featuredImage) ? `<img src="${item.featuredImage}" alt="${item.title}" class="detail-featured-img">` : (item.featuredImage && item.videoUrl ? `<img src="${item.featuredImage}" alt="${item.title}" class="detail-featured-img">` : '');
                
                card.innerHTML = `
                    <span class="detail-badge">${item.category}</span>
                    <h1 class="detail-title">${item.title}</h1>
                    <div class="detail-meta-bar">
                        <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                        <span><i class="fas fa-clock"></i> ${item.startTime}${item.endTime ? ' - ' + item.endTime : ''}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${item.location}</span>
                    </div>
                    ${imgHtml}
                    ${videoHtml}
                    <div class="detail-body-text">${item.fullDescription}</div>
                `;

                if (sidebarList && json.upcoming) {
                    sidebarList.innerHTML = '';
                    json.upcoming.forEach(u => {
                        const uDate = new Date(u.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                        sidebarList.innerHTML += `
                            <a href="news-detail.html?type=event&slug=${u.slug}" class="sidebar-item">
                                <div class="sidebar-item-title">${u.title}</div>
                                <div class="sidebar-item-date"><i class="far fa-calendar-alt"></i> ${uDate} • ${u.location}</div>
                            </a>
                        `;
                    });
                }
            } else {
                const dateStr = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
                // Only show separate featured image if item has no video embed, or explicit image was supplied
                const imgHtml = (!item.videoUrl && item.featuredImage) ? `<img src="${item.featuredImage}" alt="${item.title}" class="detail-featured-img">` : (item.featuredImage && item.videoUrl ? `<img src="${item.featuredImage}" alt="${item.title}" class="detail-featured-img">` : '');
                
                card.innerHTML = `
                    <span class="detail-badge">${item.category}</span>
                    <h1 class="detail-title">${item.title}</h1>
                    <div class="detail-meta-bar">
                        <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                        <span><i class="fas fa-user-edit"></i> ${item.author || 'Communications Office'}</span>
                    </div>
                    ${imgHtml}
                    ${videoHtml}
                    <div class="detail-body-text">${item.content}</div>
                `;

                if (sidebarList && json.recent) {
                    sidebarList.innerHTML = '';
                    json.recent.forEach(r => {
                        const rDate = r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
                        sidebarList.innerHTML += `
                            <a href="news-detail.html?slug=${r.slug}" class="sidebar-item">
                                <div class="sidebar-item-title">${r.title}</div>
                                <div class="sidebar-item-date"><i class="far fa-calendar-alt"></i> ${rDate}</div>
                            </a>
                        `;
                    });
                }
            }
        } catch (err) {
            console.error('Error loading detail page:', err);
            card.innerHTML = `<div style="text-align:center; padding:3rem; color:red;"><p>Connection error loading details.</p><a href="news.html" class="btn btn-secondary" style="margin-top:1rem;">Back</a></div>`;
        }
    }

    window.toggleEventStatus = async function(id, newStatus) {
        const token = localStorage.getItem('jmc_token');
        try {
            const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`Status updated to ${newStatus}`, 'success');
                loadAdminEvents();
            } else {
                showToast(data.message || 'Failed to update status', 'error');
            }
        } catch (e) {
            showToast('Connection error', 'error');
        }
    };

    window.deleteEvent = function(id) {
        const item = allAdminEvents.find(e => e._id === id);
        showConfirm(
            `Are you sure you want to delete the event "${item ? item.title : 'this event'}"?`,
            async () => {
                const token = localStorage.getItem('jmc_token');
                try {
                    const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (res.ok) {
                        showToast('Event deleted', 'success');
                        loadAdminEvents();
                    } else {
                        showToast(data.message || 'Failed to delete event', 'error');
                    }
                } catch (e) {
                    showToast('Network error while deleting', 'error');
                }
            },
            null,
            'Yes, Delete'
        );
    };

    // ==========================================
    // PUBLIC NEWS & EVENTS FEED (news.html)
    // ==========================================
    window.switchPublicFeed = function(type) {
        const newsBtn = document.getElementById('toggleNewsBtn');
        const eventsBtn = document.getElementById('toggleEventsBtn');
        const newsFeed = document.getElementById('publicNewsFeed');
        const eventsFeed = document.getElementById('publicEventsFeed');

        if (!newsBtn || !eventsBtn || !newsFeed || !eventsFeed) return;

        if (type === 'news') {
            newsBtn.classList.add('active');
            eventsBtn.classList.remove('active');
            newsFeed.style.display = 'block';
            eventsFeed.style.display = 'none';
        } else {
            eventsBtn.classList.add('active');
            newsBtn.classList.remove('active');
            eventsFeed.style.display = 'block';
            newsFeed.style.display = 'none';
        }
    };

    async function loadPublicNewsPage() {
        const grid = document.getElementById('publicNewsGrid');
        const empty = document.getElementById('publicNewsEmpty');
        if (!grid) return;

        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3rem;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--primary-color);"></i></div>`;

        try {
            const res = await fetch(`${API_BASE_URL}/news`);
            const json = await res.json();

            if (res.ok && json.data && json.data.length > 0) {
                if (empty) empty.style.display = 'none';
                grid.innerHTML = '';
                json.data.forEach(item => {
                    const dateStr = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                    const mediaHtml = renderCardMediaHtml(item, item.title);
                    const card = document.createElement('div');
                    card.className = 'news-card';
                    card.innerHTML = `
                        ${mediaHtml}
                        <div class="news-card-body">
                            <div class="news-card-meta">
                                <span class="news-badge">${item.category}</span>
                                <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                            </div>
                            <h3 class="news-card-title">${item.title}</h3>
                            <p class="news-card-excerpt">${item.excerpt}</p>
                            <a href="news-detail.html?slug=${item.slug}" class="news-read-more">
                                Read Full Article <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            } else {
                grid.innerHTML = '';
                if (empty) empty.style.display = 'block';
            }
        } catch (err) {
            console.error('Error fetching public news:', err);
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--text-light);">Unable to load news at this time.</div>`;
        }
    }

    async function loadPublicEventsPage() {
        const list = document.getElementById('publicEventsList');
        const empty = document.getElementById('publicEventsEmpty');
        if (!list) return;

        list.innerHTML = `<div style="text-align:center; padding:3rem;"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:var(--primary-color);"></i></div>`;

        try {
            const res = await fetch(`${API_BASE_URL}/events?type=upcoming`);
            const json = await res.json();

            if (res.ok && json.data && json.data.length > 0) {
                if (empty) empty.style.display = 'none';
                list.innerHTML = '';
                json.data.forEach(item => {
                    const evDate = new Date(item.eventDate);
                    const day = evDate.getDate();
                    const month = evDate.toLocaleString('default', { month: 'short' });
                    
                    // Render video/picture thumbnail for event card if available
                    let thumbHtml = '';
                    if (item.featuredImage || item.videoUrl) {
                        const mediaWrapper = renderCardMediaHtml(item, item.title);
                        thumbHtml = `<div class="event-media-thumb">${mediaWrapper}</div>`;
                    }

                    const card = document.createElement('div');
                    card.className = 'event-card';
                    card.innerHTML = `
                        <div class="event-date-box">
                            <span class="day">${day}</span>
                            <span class="month">${month}</span>
                        </div>
                        ${thumbHtml}
                        <div class="event-body">
                            <div class="event-meta">
                                <span><i class="fas fa-clock"></i> ${item.startTime}</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${item.location}</span>
                                <span class="news-badge" style="background:#f0f4f8;">${item.category}</span>
                            </div>
                            <h3 class="event-title">${item.title}</h3>
                            <p style="font-size:0.95rem; color:var(--text-dark); margin-bottom:1rem; line-height:1.5;">${item.shortDescription}</p>
                            <a href="news-detail.html?type=event&slug=${item.slug}" class="news-read-more">
                                Event Details & Schedule <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    `;
                    list.appendChild(card);
                });
            } else {
                list.innerHTML = '';
                if (empty) empty.style.display = 'block';
            }
        } catch (err) {
            console.error('Error fetching public events:', err);
            list.innerHTML = `<div style="text-align:center; color:var(--text-light);">Unable to load events at this time.</div>`;
        }
    }

    if (window.location.pathname.includes('news.html')) {
        loadPublicNewsPage();
        loadPublicEventsPage();
    }

    if (window.location.pathname.includes('news-detail.html')) {
        loadDetailPage();
    }

    // ==========================================
    // HOMEPAGE NEWS PREVIEW LOADER (index.html)
    // ==========================================
    async function loadHomepageNewsPreview() {
        const grid = document.getElementById('homeNewsGrid');
        if (!grid) return;

        try {
            const res = await fetch(`${API_BASE_URL}/news?limit=3`);
            const json = await res.json();

            if (res.ok && json.data && json.data.length > 0) {
                grid.innerHTML = '';
                json.data.forEach(item => {
                    const dateStr = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                    const mediaHtml = renderCardMediaHtml(item, item.title);
                    const card = document.createElement('div');
                    card.className = 'news-card';
                    card.innerHTML = `
                        ${mediaHtml}
                        <div class="news-card-body">
                            <div class="news-card-meta">
                                <span class="news-badge">${item.category}</span>
                                <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                            </div>
                            <h3 class="news-card-title">${item.title}</h3>
                            <p class="news-card-excerpt">${item.excerpt}</p>
                            <a href="news-detail.html?slug=${item.slug}" class="news-read-more">
                                Read More <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            } else {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align:center; padding:2rem; color:var(--text-light);">
                        <p>Welcome to Jos Medical College. News & events announcements will appear here.</p>
                    </div>
                `;
            }
        } catch (err) {
            console.error('Error fetching homepage news preview:', err);
        }
    }

    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '') {
        loadHomepageNewsPreview();
    }

});

