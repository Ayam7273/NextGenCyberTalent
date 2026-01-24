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

// Mobile menu toggle
mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    });
});

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
    
    // Frontend validation
    if (!data.fullName || !data.email || !data.experience || !data.motivation || !data.availability) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (!data.terms) {
        showNotification('Please agree to the terms', 'error');
        return;
    }
    
    // Simulate form submission
    console.log('Application Form Data:', data);
    
    showNotification('Application submitted successfully! We\'ll review it within 48 hours.', 'success');
    applyForm.reset();
    
    // Close modal after short delay
    setTimeout(() => {
        closeApplyModal();
    }, 2000);
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
// Initialize All Features
// ===========================

console.log('✅ All features initialized successfully');
