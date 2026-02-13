/* 
* Jos Medical College - Interactivity 
*/

document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function () {
            mainNav.classList.toggle('active');

            // Animate hamburger icon
            const bars = document.querySelectorAll('.bar');
            if (mainNav.classList.contains('active')) {
                // Simple animation state logic can go here if using specific CSS classes
                mobileMenuBtn.style.opacity = '0.8';
            } else {
                mobileMenuBtn.style.opacity = '1';
            }
        });
    }

    // Sticky Header Scroll Effect
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        }
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Close mobile menu if open
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Account for sticky header
                const headerHeight = header.offsetHeight;
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
        const slideInterval = 5000; // 5 seconds

        setInterval(() => {
            // Remove active class from current slide
            slides[currentSlide].classList.remove('active');

            // Move to next slide
            currentSlide = (currentSlide + 1) % slides.length;

            // Add active class to next slide
            slides[currentSlide].classList.add('active');
        }, slideInterval);
    }

    // Lightbox Functionality
    const lightbox = document.getElementById('certificateLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');
    const certificates = document.querySelectorAll('.certificate-img');

    if (lightbox && lightboxImg && lightboxCaption && closeBtn) {
        certificates.forEach(img => {
            img.addEventListener('click', function () {
                lightbox.style.display = 'block';
                lightboxImg.src = this.src;
                lightboxCaption.innerHTML = this.getAttribute('data-caption') || this.alt;
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });

        // Close logic
        const closeLightbox = function () {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        };

        closeBtn.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.style.display === 'block') {
                closeLightbox();
            }
        });
    }
});
