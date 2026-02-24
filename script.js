// ===========================
// Navigation & Mobile Menu
// ===========================

const navbar = document.getElementById('navbar');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle with body scroll lock
function toggleMobileMenu() {
    const isOpen = navLinks.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

mobileMenuToggle.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close mobile menu on ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===========================
// Hero rotating "Future-*" text (slide in/out horizontally)
// ===========================

const heroRotatingWord = document.getElementById('heroRotatingWord');
if (heroRotatingWord) {
    const words = ['Future-Focused', 'Future-Driven', 'Future-Intense'];
    let index = 0;
    const duration = 400;
    const pause = 2800;

    function cycleWord() {
        heroRotatingWord.classList.add('slide-out');
        heroRotatingWord.classList.remove('slide-in', 'ready');

        setTimeout(() => {
            index = (index + 1) % words.length;
            heroRotatingWord.textContent = words[index];
            heroRotatingWord.classList.remove('slide-out');
            heroRotatingWord.classList.add('slide-in');

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    heroRotatingWord.classList.add('ready');
                });
            });

            setTimeout(() => {
                heroRotatingWord.classList.remove('slide-in', 'ready');
            }, duration);
        }, duration);
    }

    let cycleTimer = setInterval(cycleWord, pause + duration * 2);
}

// ===========================
// Smooth Scrolling
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Don't prevent default for modal triggers
        if (href === '#apply' && this.classList.contains('btn')) {
            return;
        }
        
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===========================
// Modal Management
// ===========================

const applyModal = document.getElementById('applyModal');

function openApplyModal() {
    applyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    clearApplyFormMessage();
}

function closeApplyModal() {
    applyModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && applyModal.classList.contains('active')) {
        closeApplyModal();
    }
});

// ===========================
// Form Handling
// ===========================

const contactForm = document.getElementById('contactForm');
const applyForm = document.getElementById('applyForm');

// Progressive apply form elements
const applySteps = document.querySelectorAll('.apply-step');
const applyProgressBarFill = document.getElementById('applyProgressBarFill');
const applyProgressLabel = document.getElementById('applyProgressLabel');
const applyProgressDots = document.querySelectorAll('.apply-progress-dot');

let currentApplyStep = 0;

function getApplyStepTitle(index) {
    const step = applySteps[index];
    if (!step) return '';
    return step.getAttribute('data-step-title') || '';
}

function updateApplyProgress() {
    const totalSteps = applySteps.length || 1;
    const current = currentApplyStep + 1;
    const segments = Math.max(1, totalSteps - 1);
    const linePercent = totalSteps > 1 ? (currentApplyStep / segments) * 100 : 0;

    if (applyProgressBarFill) {
        applyProgressBarFill.style.width = `${linePercent}%`;
    }
    if (applyProgressLabel) {
        applyProgressLabel.textContent = `Step ${current} of ${totalSteps} — ${getApplyStepTitle(currentApplyStep)}`;
    }
    if (applyProgressDots && applyProgressDots.length) {
        applyProgressDots.forEach((dot, idx) => {
            dot.classList.toggle('completed', idx < currentApplyStep);
            dot.classList.toggle('active', idx === currentApplyStep);
        });
    }
}

function showApplyStep(index) {
    if (!applySteps.length) return;
    const clampedIndex = Math.max(0, Math.min(index, applySteps.length - 1));
    applySteps.forEach((step, idx) => {
        step.classList.toggle('active', idx === clampedIndex);
    });
    currentApplyStep = clampedIndex;
    updateApplyProgress();
}

function validateApplyStep(stepIndex) {
    if (!applyForm) return true;
    const formData = new FormData(applyForm);
    const data = Object.fromEntries(formData);

    const trim = (value) => (value || '').toString().trim();

    if (stepIndex === 0) {
        if (!trim(data.fullName)) {
            showApplyFormMessage('Please enter your full name.', 'error');
            return false;
        }
        if (!trim(data.email)) {
            showApplyFormMessage('Please enter your email address.', 'error');
            return false;
        }
        if (!isValidEmail(data.email)) {
            showApplyFormMessage('Please enter a valid email address.', 'error');
            return false;
        }
    }

    if (stepIndex === 1) {
        if (!data.experienceLevel) {
            showApplyFormMessage('Please select your current experience level.', 'error');
            return false;
        }
        const motivation = trim(data.motivation);
        if (!motivation || motivation.length < 50) {
            showApplyFormMessage('Please provide a motivation statement of at least 50 characters.', 'error');
            return false;
        }
        if (!data.startTimeframe) {
            showApplyFormMessage('Please tell us when you can start.', 'error');
            return false;
        }
        if (data.startTimeframe === 'specific-date' && !trim(data.startDateSpecific)) {
            showApplyFormMessage('Please specify your preferred start date.', 'error');
            return false;
        }
    }

    if (stepIndex === 2) {
        if (!data.fundingStatus) {
            showApplyFormMessage('Please select your funding status.', 'error');
            return false;
        }
        const requiresSponsorshipDetails =
            data.fundingStatus === 'employer-sponsored' || data.fundingStatus === 'other-sponsored';
        if (requiresSponsorshipDetails) {
            if (!trim(data.sponsorshipDetails)) {
                showApplyFormMessage('Please provide sponsorship details including organisation name and contact (if known).', 'error');
                return false;
            }
        }

        const sponsorshipFileInput = document.getElementById('sponsorshipFile');
        if (sponsorshipFileInput && sponsorshipFileInput.files.length > 0) {
            const file = sponsorshipFileInput.files[0];
            const fileName = file.name || '';
            const ext = fileName.split('.').pop().toLowerCase();
            const allowedExt = ['pdf', 'docx'];
            if (!allowedExt.includes(ext)) {
                showApplyFormMessage('Please upload a PDF or DOCX file for sponsorship documentation.', 'error');
                return false;
            }
        }
    }

    return true;
}

function populateApplicationReview() {
    if (!applyForm) return;
    const formData = new FormData(applyForm);
    const data = Object.fromEntries(formData);
    const trim = (value) => (value || '').toString().trim();

    const experienceMap = {
        'beginner': 'Beginner (0–1 year)',
        'intermediate': 'Intermediate (1–3 years)',
        'advanced': 'Advanced (3+ years)',
        'career-changer': 'Career‑changer (no prior experience but motivated)'
    };

    const startMap = {
        'immediately': 'Immediately',
        '1-month': 'Within 1 month',
        '3-months': 'Within 3 months',
        'specific-date': 'On a specific date'
    };

    const fundingMap = {
        'self-funded': 'Self‑funded',
        'employer-sponsored': 'Employer‑sponsored',
        'other-sponsored': 'Sponsored by another organisation',
        'not-confirmed': 'Not yet confirmed (exploring options)'
    };

    const reviewFullName = document.getElementById('reviewFullName');
    const reviewEmail = document.getElementById('reviewEmail');
    const reviewPhone = document.getElementById('reviewPhone');
    const reviewExperience = document.getElementById('reviewExperience');
    const reviewStart = document.getElementById('reviewStart');
    const reviewFunding = document.getElementById('reviewFunding');
    const reviewAffordability = document.getElementById('reviewAffordability');
    const reviewSponsorship = document.getElementById('reviewSponsorship');
    const reviewMotivation = document.getElementById('reviewMotivation');

    if (reviewFullName) reviewFullName.textContent = trim(data.fullName) || 'Not provided';
    if (reviewEmail) reviewEmail.textContent = trim(data.email) || 'Not provided';
    if (reviewPhone) reviewPhone.textContent = trim(data.phone) || 'Not provided';
    if (reviewExperience) reviewExperience.textContent = experienceMap[data.experienceLevel] || 'Not specified';

    let startText = startMap[data.startTimeframe] || 'Not specified';
    if (data.startTimeframe === 'specific-date' && data.startDateSpecific) {
        startText = `Specific date: ${data.startDateSpecific}`;
    }
    if (reviewStart) reviewStart.textContent = startText;

    if (reviewFunding) reviewFunding.textContent = fundingMap[data.fundingStatus] || 'Not specified';

    const affordabilitySelections = Array.from(
        applyForm.querySelectorAll('input[name="affordability"]:checked')
    ).map((input) => input.dataset.label || input.value);
    if (reviewAffordability) {
        reviewAffordability.textContent = affordabilitySelections.length
            ? affordabilitySelections.join(', ')
            : 'Not specified';
    }

    let sponsorshipSummary = 'No sponsorship information provided.';
    if (data.fundingStatus === 'self-funded') {
        sponsorshipSummary = 'Self‑funded.';
    } else if (data.fundingStatus === 'employer-sponsored' || data.fundingStatus === 'other-sponsored') {
        sponsorshipSummary = trim(data.sponsorshipDetails) || 'Sponsored (details to be confirmed).';
    } else if (data.fundingStatus === 'not-confirmed') {
        sponsorshipSummary = 'Funding not yet confirmed.';
    }

    const sponsorshipFileInput = document.getElementById('sponsorshipFile');
    if (sponsorshipFileInput && sponsorshipFileInput.files.length > 0) {
        const file = sponsorshipFileInput.files[0];
        sponsorshipSummary += ` Document: ${file.name}`;
    }

    if (reviewSponsorship) reviewSponsorship.textContent = sponsorshipSummary;

    if (reviewMotivation) reviewMotivation.textContent = trim(data.motivation) || 'No motivation statement provided.';
}

// Step navigation buttons
if (applySteps.length) {
    showApplyStep(0);

    document.querySelectorAll('.apply-next').forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.style.color = 'black';
            const step = parseInt(btn.getAttribute('data-step'), 10) || 0;
            if (validateApplyStep(step)) {
                clearApplyFormMessage();
                const nextIndex = step + 1;
                if (nextIndex === applySteps.length - 1) {
                    populateApplicationReview();
                }
                showApplyStep(nextIndex);
            }
        });
    });

    document.querySelectorAll('.apply-back').forEach((btn) => {
        btn.addEventListener('click', () => {
            clearApplyFormMessage();
            const step = parseInt(btn.getAttribute('data-step'), 10) || 0;
            const prevIndex = Math.max(0, step - 1);
            showApplyStep(prevIndex);
        });
    });
}

// Conditional fields: start date & sponsorship details
const startTimeframeSelect = document.getElementById('startTimeframe');
const startDateRow = document.getElementById('startDateRow');
function updateStartDateVisibility() {
    if (!startTimeframeSelect || !startDateRow) return;
    const show = startTimeframeSelect.value === 'specific-date';
    startDateRow.classList.toggle('hidden', !show);
}
if (startTimeframeSelect) {
    startTimeframeSelect.addEventListener('change', updateStartDateVisibility);
    updateStartDateVisibility();
}

const fundingStatusSelect = document.getElementById('fundingStatus');
const sponsorshipDetailsRow = document.getElementById('sponsorshipDetailsRow');
function updateSponsorshipVisibility() {
    if (!fundingStatusSelect || !sponsorshipDetailsRow) return;
    const value = fundingStatusSelect.value;
    const show = value === 'employer-sponsored' || value === 'other-sponsored';
    sponsorshipDetailsRow.classList.toggle('hidden', !show);
}
if (fundingStatusSelect) {
    fundingStatusSelect.addEventListener('change', updateSponsorshipVisibility);
    updateSponsorshipVisibility();
}

// Affordability selection rules:
// - "No concerns" and "Prefer not to say" are mutually exclusive with everything else (and with each other)
const affordabilityInputs = applyForm
    ? Array.from(applyForm.querySelectorAll('input[name="affordability"]'))
    : [];

function enforceAffordabilityRules(changedInput) {
    if (!changedInput || !changedInput.checked) return;

    const exclusive = new Set(['no-concerns', 'prefer-not-to-say']);
    const changedValue = changedInput.value;

    if (exclusive.has(changedValue)) {
        affordabilityInputs.forEach((input) => {
            if (input !== changedInput) input.checked = false;
        });
        return;
    }

    // If selecting any non-exclusive option, clear exclusive options
    affordabilityInputs.forEach((input) => {
        if (exclusive.has(input.value)) input.checked = false;
    });
}

affordabilityInputs.forEach((input) => {
    input.addEventListener('change', () => enforceAffordabilityRules(input));
});

// Contact Form Submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Frontend validation
    if (!data.name || !data.email || !data.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate form submission
    console.log('Contact Form Data:', data);
    
    showNotification('Thank you! We\'ll get back to you within 24 hours.', 'success');
    contactForm.reset();
});

// Apply Form Submission
applyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(applyForm);
    const data = Object.fromEntries(formData);
    const trim = (value) => (value || '').toString().trim();
    
    // Validate all steps before final submit
    if (!validateApplyStep(0) || !validateApplyStep(1) || !validateApplyStep(2)) {
        return;
    }

    if (!data.consent) {
        showApplyFormMessage('Please confirm your consent before submitting.', 'error');
        return;
    }

    if (!data.declaration) {
        showApplyFormMessage('Please confirm the declaration before submitting.', 'error');
        return;
    }
    
    // Simulate form submission
    console.log('Application Form Data:', data);
    
    showApplyFormMessage('Application submitted successfully! We\'ll review it within 48 hours.', 'success');
    applyForm.reset();

    // Reset wizard state after submit
    showApplyStep(0);
    clearApplyFormMessage();
    updateStartDateVisibility();
    updateSponsorshipVisibility();
    
    // Close modal after short delay
    setTimeout(() => {
        closeApplyModal();
    }, 2500);
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===========================
// Application form in-form message (centred inside modal)
// ===========================

function showApplyFormMessage(message, type = 'error') {
    const el = document.getElementById('applyFormMessage');
    if (!el) return;
    el.textContent = message;
    el.removeAttribute('hidden');
    el.className = 'apply-form-message ' + (type === 'success' ? 'success' : 'error');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (type === 'success') {
        setTimeout(() => {
            el.setAttribute('hidden', '');
            el.textContent = '';
        }, 4000);
    }
}

function clearApplyFormMessage() {
    const el = document.getElementById('applyFormMessage');
    if (el) {
        el.setAttribute('hidden', '');
        el.textContent = '';
    }
}

// ===========================
// Notification System
// ===========================

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '24px',
        backgroundColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#0FB9C6',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: 10000,
        maxWidth: '400px',
        fontSize: '0.9375rem',
        fontWeight: '500',
        animation: 'slideInRight 0.3s ease-out',
        fontFamily: 'Inter, sans-serif'
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add animation styles
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===========================
// Scroll Reveal Animation
// ===========================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for scroll reveal
function initScrollReveal() {
    const elementsToReveal = [
        '.problem-card',
        '.feature-card',
        '.timeline-item',
        '.pathway-stage',
        '.partner-logo',
        '.trust-item'
    ];
    
    elementsToReveal.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.setAttribute('data-scroll', '');
            observer.observe(el);
        });
    });
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
    initScrollReveal();
}

// ===========================
// Dynamic Stats Counter
// ===========================

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatStatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatStatNumber(Math.floor(current));
        }
    }, 16);
}

function formatStatNumber(num) {
    if (typeof num === 'string') return num;
    return num.toLocaleString();
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const targetText = statNumber.textContent;
            const targetNumber = parseInt(targetText.replace(/\D/g, ''));
            
            if (!isNaN(targetNumber)) {
                statNumber.textContent = '0';
                animateCounter(statNumber, targetNumber);
            }
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
});

// ===========================
// Active Navigation Link
// ===========================

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
        
        if (navLink && !navLink.classList.contains('btn')) {
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-links a').forEach(link => {
                    if (!link.classList.contains('btn')) {
                        link.style.color = '';
                    }
                });
                navLink.style.color = '#0FB9C6';
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// ===========================
// Form Character Counter (Optional Enhancement)
// ===========================

const motivationField = document.getElementById('motivation');
if (motivationField) {
    const counterDiv = document.createElement('div');
    counterDiv.style.cssText = 'font-size: 0.875rem; color: #6B7280; text-align: right; margin-top: 4px;';
    motivationField.parentElement.appendChild(counterDiv);
    
    function updateCounter() {
        const length = motivationField.value.length;
        const minLength = 50;
        counterDiv.textContent = `${length} characters`;
        
        if (length < minLength) {
            counterDiv.style.color = '#EF4444';
            counterDiv.textContent = `${length} characters (minimum ${minLength})`;
        } else {
            counterDiv.style.color = '#10B981';
        }
    }
    
    motivationField.addEventListener('input', updateCounter);
    updateCounter();
}

// ===========================
// Preload Prevention for Forms
// ===========================

// Prevent form auto-fill on page load
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.value && field.type !== 'checkbox') {
                field.value = '';
            }
        });
    }, 100);
});

// ===========================
// Easter Egg: Konami Code
// ===========================

let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiPattern.join(',')) {
        showNotification('🎉 Konami Code Activated! You\'re already thinking like a cybersecurity pro!', 'success');
        document.body.style.animation = 'rainbow 2s linear';
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 2000);
        
        konamiCode = [];
    }
});

// ===========================
// Accessibility Enhancements
// ===========================

// Skip to main content link
const skipLink = document.createElement('a');
skipLink.href = '#home';
skipLink.textContent = 'Skip to main content';
skipLink.className = 'skip-link';
skipLink.style.cssText = `
    position: absolute;
    top: -100px;
    left: 0;
    background: #0FB9C6;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 0 0 8px 0;
    z-index: 10001;
    font-weight: 600;
    transition: top 0.3s;
`;
skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
});
skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-100px';
});
document.body.prepend(skipLink);

// Announce page section changes to screen readers
let lastSection = '';
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 200;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            if (sectionId !== lastSection) {
                lastSection = sectionId;
                // Announce to screen readers
                const announcement = document.createElement('div');
                announcement.setAttribute('role', 'status');
                announcement.setAttribute('aria-live', 'polite');
                announcement.style.position = 'absolute';
                announcement.style.left = '-10000px';
                announcement.textContent = `Navigated to ${sectionId.replace(/-/g, ' ')} section`;
                document.body.appendChild(announcement);
                setTimeout(() => announcement.remove(), 1000);
            }
        }
    });
});

// ===========================
// Performance Optimization
// ===========================

// Lazy load images (if any are added later)
if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img').forEach(img => {
        img.loading = 'lazy';
    });
}

// Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll-heavy functions
const debouncedUpdateActiveNav = debounce(updateActiveNavLink, 100);
window.addEventListener('scroll', debouncedUpdateActiveNav);

// ===========================
// Console Welcome Message
// ===========================

console.log('%c🔐 NEXT GEN CYBER TALENT', 'color: #0FB9C6; font-size: 24px; font-weight: bold;');
console.log('%cWelcome, future cybersecurity professional!', 'color: #0A1624; font-size: 14px;');
console.log('%cInterested in how this site works? That\'s the spirit we\'re looking for.', 'color: #1E2933; font-size: 12px;');
console.log('%cApply now: Scroll up and click the Apply button!', 'color: #0FB9C6; font-size: 12px; font-weight: bold;');

// ===========================
// Programme Chatbot
// ===========================

const chatbotWidget = document.getElementById('chatbotWidget');
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotPanel = document.getElementById('chatbotPanel');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');

// Programme Q&A knowledge base
const chatbotKnowledge = [
    { keywords: ['apply', 'application', 'how to apply', 'join'], response: 'To apply for the Global Cyber Talent Initiative, click the "Apply" button in the navigation or the "Apply Now" button in the hero section. You\'ll fill out a short form with your name, email, experience level, and why you want to join. Applications are reviewed within 48 hours.' },
    { keywords: ['duration', 'how long', '12 month', 'weeks', 'length'], response: 'The programme runs for 12 months. It\'s an industry-aligned development programme with structured learning, hands-on labs, and real-world projects. Each phase includes checkpoints and performance review.' },
    { keywords: ['cost', 'price', 'fee', 'free', 'pay'], response: 'For specific pricing and funding options, please contact us through the Contact section. We offer various options to make the programme accessible.' },
    { keywords: ['prerequisite', 'requirement', 'experience', 'background', 'qualify'], response: 'No prior technical experience is required. We look for motivation and commitment. The programme starts with foundation-building and progresses through applied skills, projects, and professional readiness.' },
    { keywords: ['learn', 'curriculum', 'course', 'teach', 'skills'], response: 'You\'ll learn core cybersecurity concepts, hands-on labs, threat intelligence, incident response, ethical hacking, and security operations. The 12-month journey includes Foundation Phase, Applied Skills Phase, Project & Collaboration Phase, and Professional Readiness Phase.' },
    { keywords: ['pathway', 'phases', 'stages', 'journey'], response: 'The learner pathway has 4 phases: 1) Foundation Phase - core concepts and professional expectations, 2) Applied Skills Phase - hands-on labs and scenarios, 3) Project & Collaboration Phase - team projects and incident response, 4) Professional Readiness Phase - workplace behaviours and employer-facing delivery.' },
    { keywords: ['performance', 'platinum', 'gold', 'silver', 'bronze', 'tier'], response: 'Learners are ranked in a performance framework: Platinum (high performers, ready for complex tasks), Gold (capable, minimal supervision), Silver (solid foundation, growing confidence), and Bronze (early-stage learners). This helps employers engage talent at the right level.' },
    { keywords: ['employer', 'job', 'hire', 'placement', 'career'], response: 'The programme prepares you for real organisational roles. Employers can access ranked talent, offer placements, and observe performance before hiring. We focus on work-ready skills, not just certifications.' },
    { keywords: ['contact', 'email', 'reach', 'support'], response: 'You can reach us through the Contact section on this page. Fill out the form with your name, email, and message. We respond within 24 hours.' },
    { keywords: ['partners', 'companies', 'industry'], response: 'Our graduates work at leading tech and cybersecurity companies. The programme is recognised by industry leaders. Check the Partners section for more details.' }
];

const defaultResponse = 'I can help with questions about the programme, how to apply, duration, curriculum, performance tiers, or career outcomes. Try asking something like "How do I apply?" or "What will I learn?"';

function getChatbotResponse(userMessage) {
    const lower = userMessage.toLowerCase().trim();
    for (const item of chatbotKnowledge) {
        if (item.keywords.some(kw => lower.includes(kw))) {
            return item.response;
        }
    }
    return defaultResponse;
}

function addChatMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = `chatbot-message ${isUser ? 'user' : 'bot'}`;
    const p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function sendChatMessage() {
    const text = chatbotInput.value.trim();
    if (!text) return;
    
    addChatMessage(text, true);
    chatbotInput.value = '';
    
    setTimeout(() => {
        const response = getChatbotResponse(text);
        addChatMessage(response, false);
    }, 500);
}

if (chatbotToggle) {
    chatbotToggle.addEventListener('click', () => chatbotWidget.classList.add('open'));
}
if (chatbotClose) {
    chatbotClose.addEventListener('click', () => chatbotWidget.classList.remove('open'));
}
if (chatbotSend) {
    chatbotSend.addEventListener('click', sendChatMessage);
}
if (chatbotInput) {
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}

// ===========================
// Initialize All Features
// ===========================

console.log('✅ All features initialized successfully');
