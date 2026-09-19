/**
 * JMC Toast Notification System
 * Self-contained: injects its own CSS and HTML on load.
 * Safe to include in <head> — DOM init is deferred until DOMContentLoaded.
 *
 * API:
 *   showToast(message, type = 'info', duration = 3500)
 *     type: 'success' | 'error' | 'info'
 *
 *   showConfirm(message, onConfirm, onCancel, confirmLabel)
 *     Replaces window.confirm() — shows a modern modal.
 */
(function () {

    // ── 1. INJECT CSS (safe in <head>, no body needed) ────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        #jmc-toast-container {
            position: fixed;
            top: 1.2rem;
            right: 1.2rem;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            pointer-events: none;
        }

        .jmc-toast {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            min-width: 280px;
            max-width: 400px;
            background: #1e293b;
            color: #f1f5f9;
            padding: 0.9rem 1.1rem 1.2rem;
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            font-size: 0.9rem;
            line-height: 1.45;
            pointer-events: all;
            border-left: 4px solid transparent;
            position: relative;
            overflow: hidden;
            animation: jmc-slide-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .jmc-toast.jmc-hide {
            animation: jmc-slide-out 0.3s ease-in forwards;
        }

        .jmc-toast.success { border-left-color: #22c55e; }
        .jmc-toast.error   { border-left-color: #ef4444; }
        .jmc-toast.info    { border-left-color: #38bdf8; }

        .jmc-toast-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
        .jmc-toast-body { flex: 1; word-break: break-word; }

        .jmc-toast-close {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 0.95rem;
            padding: 0;
            line-height: 1;
            flex-shrink: 0;
            transition: color 0.15s;
        }
        .jmc-toast-close:hover { color: #f1f5f9; }

        .jmc-toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            width: 100%;
            transform-origin: left;
        }
        .jmc-toast.success .jmc-toast-progress { background: #22c55e; }
        .jmc-toast.error   .jmc-toast-progress { background: #ef4444; }
        .jmc-toast.info    .jmc-toast-progress { background: #38bdf8; }

        @keyframes jmc-slide-in {
            from { opacity: 0; transform: translateX(110%); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes jmc-slide-out {
            from { opacity: 1; transform: translateX(0); }
            to   { opacity: 0; transform: translateX(110%); }
        }
        @keyframes jmc-drain {
            from { transform: scaleX(1); }
            to   { transform: scaleX(0); }
        }

        /* ── Confirm Modal ───────────────────────────────────────────────── */
        #jmc-confirm-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            z-index: 100000;
            align-items: center;
            justify-content: center;
        }
        #jmc-confirm-overlay.jmc-active {
            display: flex;
            animation: jmc-fade-in 0.2s ease;
        }
        @keyframes jmc-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
        }

        #jmc-confirm-box {
            background: #fff;
            border-radius: 14px;
            padding: 2rem 2rem 1.6rem;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            animation: jmc-scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes jmc-scale-in {
            from { opacity: 0; transform: scale(0.87); }
            to   { opacity: 1; transform: scale(1); }
        }

        #jmc-confirm-icon-wrap {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #fff3f3;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            margin: 0 auto 1.1rem;
        }
        #jmc-confirm-title {
            text-align: center;
            font-size: 1.1rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 0.5rem;
        }
        #jmc-confirm-message {
            text-align: center;
            color: #64748b;
            font-size: 0.92rem;
            line-height: 1.6;
            margin: 0 0 1.5rem;
        }
        #jmc-confirm-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
        }
        .jmc-confirm-btn {
            padding: 0.65rem 1.6rem;
            border-radius: 8px;
            border: none;
            font-size: 0.92rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
        }
        .jmc-confirm-btn.jmc-cancel { background: #f1f5f9; color: #475569; }
        .jmc-confirm-btn.jmc-cancel:hover { background: #e2e8f0; }
        .jmc-confirm-btn.jmc-danger { background: #ef4444; color: #fff; }
        .jmc-confirm-btn.jmc-danger:hover { background: #dc2626; }
    `;
    document.head.appendChild(style);

    // ── 2 & 3. CREATE DOM ELEMENTS (deferred until body is ready) ────────────
    let container, overlay;

    function _initDOM() {
        // Toast container
        container = document.createElement('div');
        container.id = 'jmc-toast-container';
        document.body.appendChild(container);

        // Confirm modal
        overlay = document.createElement('div');
        overlay.id = 'jmc-confirm-overlay';
        overlay.innerHTML = `
            <div id="jmc-confirm-box" role="dialog" aria-modal="true">
                <div id="jmc-confirm-icon-wrap">⚠️</div>
                <h3 id="jmc-confirm-title">Are you sure?</h3>
                <p id="jmc-confirm-message"></p>
                <div id="jmc-confirm-actions">
                    <button class="jmc-confirm-btn jmc-cancel" id="jmc-confirm-cancel">Cancel</button>
                    <button class="jmc-confirm-btn jmc-danger" id="jmc-confirm-ok">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // Safe whether script is in <head> or at end of <body>
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _initDOM);
    } else {
        _initDOM();
    }

    // ── 4. showToast() ────────────────────────────────────────────────────────
    const ICONS = { success: '✅', error: '❌', info: 'ℹ️' };

    /**
     * Display a toast notification.
     * @param {string} message  - Text to show
     * @param {'success'|'error'|'info'} type - Toast colour/icon
     * @param {number} duration - Auto-dismiss time in ms (default 3500)
     */
    window.showToast = function (message, type = 'info', duration = 3500) {
        if (!container) return; // safety guard (shouldn't happen in practice)
        const toast = document.createElement('div');
        toast.className = `jmc-toast ${type}`;
        toast.innerHTML = `
            <span class="jmc-toast-icon">${ICONS[type] || 'ℹ️'}</span>
            <span class="jmc-toast-body">${message}</span>
            <button class="jmc-toast-close" aria-label="Dismiss">✕</button>
            <span class="jmc-toast-progress"
                  style="animation: jmc-drain ${duration}ms linear forwards;"></span>
        `;
        container.appendChild(toast);

        const dismiss = () => {
            toast.classList.add('jmc-hide');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        };

        toast.querySelector('.jmc-toast-close').addEventListener('click', dismiss);
        setTimeout(dismiss, duration);
    };

    // ── 5. showConfirm() ──────────────────────────────────────────────────────
    /**
     * Show a confirmation modal (replaces native confirm()).
     * @param {string}   message       - Question to ask the user
     * @param {Function} onConfirm     - Called when user clicks Confirm
     * @param {Function} [onCancel]    - Called when user cancels (optional)
     * @param {string}   [confirmLabel='Confirm'] - Label for the confirm button
     */
    window.showConfirm = function (message, onConfirm, onCancel = null, confirmLabel = 'Confirm') {
        document.getElementById('jmc-confirm-message').textContent = message;
        document.getElementById('jmc-confirm-ok').textContent = confirmLabel;
        overlay.classList.add('jmc-active');

        const okBtn = document.getElementById('jmc-confirm-ok');
        const cancelBtn = document.getElementById('jmc-confirm-cancel');

        const close = () => overlay.classList.remove('jmc-active');

        function handleOk() {
            close();
            cleanup();
            if (typeof onConfirm === 'function') onConfirm();
        }

        function handleCancel() {
            close();
            cleanup();
            if (typeof onCancel === 'function') onCancel();
        }

        function handleOverlay(e) {
            if (e.target === overlay) handleCancel();
        }

        function cleanup() {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            overlay.removeEventListener('click', handleOverlay);
        }

        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        overlay.addEventListener('click', handleOverlay);
    };

})();
