// ========================================
// Recruitment Page - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 페이지 초기화
function initializePage() {
    setupScrollAnimations();
    setupInteractiveElements();
    setupFormHandling();
}

// ========================================
// Scroll Animations
// ========================================

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 섹션에 애니메이션 적용
    document.querySelectorAll('.section').forEach(function(section) {
        section.classList.add('fade-in-element');
        observer.observe(section);
    });

    // 프로세스 스텝에 애니메이션 적용
    document.querySelectorAll('.process-step').forEach(function(step, index) {
        step.classList.add('fade-in-element');
        step.style.animationDelay = (index * 100) + 'ms';
        observer.observe(step);
    });
}

// ========================================
// Interactive Elements
// ========================================

function setupInteractiveElements() {
    setupEmailCopy();
    setupPhoneCopy();
    setupAccordion();
    setupSmoothScroll();
}

// 이메일 복사 기능
function setupEmailCopy() {
    const emailElements = document.querySelectorAll('.contact-value');
    
    emailElements.forEach(function(element) {
        if (element.textContent.includes('@goodrich')) {
            element.style.cursor = 'pointer';
            element.title = '클릭하여 복사';
            
            element.addEventListener('click', function() {
                const email = this.textContent.trim();
                copyToClipboard(email, this);
            });
        }
    });
}

// 전화번호 복사 기능
function setupPhoneCopy() {
    const phoneElements = document.querySelectorAll('.contact-value');
    
    phoneElements.forEach(function(element) {
        if (element.textContent.includes('010-')) {
            element.style.cursor = 'pointer';
            element.title = '클릭하여 복사';
            
            element.addEventListener('click', function() {
                const phone = this.textContent.trim();
                copyToClipboard(phone, this);
            });
        }
    });
}

// 클립보드에 복사
function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(function() {
        const originalText = element.textContent;
        element.textContent = '✓ 복사됨!';
        element.style.color = '#175fff';
        element.style.fontWeight = 'bold';
        
        setTimeout(function() {
            element.textContent = originalText;
            element.style.color = '#737373';
            element.style.fontWeight = '500';
        }, 2000);
    }).catch(function() {
        // 폴백: 다른 방법으로 복사
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        element.textContent = '✓ 복사됨!';
        element.style.color = '#175fff';
        element.style.fontWeight = 'bold';
        
        setTimeout(function() {
            element.textContent = text;
            element.style.color = '#737373';
            element.style.fontWeight = '500';
        }, 2000);
    });
}

// 아코디언 기능
function setupAccordion() {
    const sectionHeaders = document.querySelectorAll('.section-header');
    
    sectionHeaders.forEach(function(header) {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const section = this.closest('.section');
            const body = section.querySelector('.section-body');
            
            if (body.style.maxHeight) {
                body.style.maxHeight = null;
                section.classList.remove('expanded');
            } else {
                body.style.maxHeight = body.scrollHeight + 'px';
                section.classList.add('expanded');
            }
        });
    });
}

// 부드러운 스크롤
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// Form Handling (향후 확장)
// ========================================

function setupFormHandling() {
    // 지원하기 폼 처리 (향후 추가 예정)
    console.log('Form handling ready');
}

// ========================================
// Utility Functions
// ========================================

// 요소가 뷰포트에 보이는지 확인
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 날짜 포맷팅
function formatDate(date) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    return new Intl.DateTimeFormat('ko-KR', options).format(date);
}

// 전화번호 포맷팅
function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    
    return phoneNumber;
}

// 이메일 유효성 검사
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========================================
// Analytics (선택 사항)
// ========================================

function trackEvent(eventName, eventData) {
    if (typeof window.gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    console.log('Event tracked:', eventName, eventData);
}

// 이메일 클릭 추적
document.addEventListener('click', function(e) {
    if (e.target.closest('.contact-value')) {
        const contactValue = e.target.textContent.trim();
        if (contactValue.includes('@')) {
            trackEvent('email_copy', { email: contactValue });
        } else if (contactValue.includes('-')) {
            trackEvent('phone_copy', { phone: contactValue });
        }
    }
});

// 섹션 보기 추적
function setupSectionTracking() {
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const sectionTitle = entry.target.querySelector('.section-title');
                if (sectionTitle) {
                    trackEvent('section_viewed', {
                        section: sectionTitle.textContent
                    });
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(function(section) {
        observer.observe(section);
    });
}

// ========================================
// CSS Animation Injection
// ========================================

function injectAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in-element {
            opacity: 0;
            will-change: opacity, transform;
        }

        .fade-in {
            animation: fadeIn 0.6s ease-out forwards;
        }

        .section.expanded .section-body {
            animation: fadeIn 0.3s ease-out forwards;
        }

        /* Smooth transitions for interactive elements */
        .contact-value,
        .item-icon,
        .process-step {
            transition: all 0.3s ease-out;
        }

        .contact-value:hover {
            color: #175fff;
            transform: translateX(2px);
        }
    `;
    document.head.appendChild(style);
}

// 페이지 로드 시 애니메이션 스타일 주입
injectAnimationStyles();

// ========================================
// Performance Optimization
// ========================================

// 부하가 많은 스크롤 이벤트 최적화
let scrollTimeout;
function onScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
        // 스크롤 기반 동작 처리
    }, 150);
}

window.addEventListener('scroll', onScroll, { passive: true });

// ========================================
// Browser Compatibility
// ========================================

// 레거시 브라우저 지원
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        let el = this;
        do {
            if (Element.prototype.matches.call(el, s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

console.log('Recruitment page script loaded successfully');
