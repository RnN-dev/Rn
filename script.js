/* ================================================
   RENAN RODRIGUES — Portfolio JavaScript
   Smooth scroll animations with Intersection Observer
   ================================================ */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ================================================
    // ELEMENTS
    // ================================================
    const nav = document.getElementById('nav');
    const navLinks = document.querySelector('.nav-links');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinkItems = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    // ================================================
    // SMOOTH SCROLL COM EASING
    // ================================================
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function smoothScrollTo(targetPosition, duration = 800) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeOutCubic(progress);

            window.scrollTo(0, startPosition + distance * ease);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Navbar click handlers
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (!target) return;

            // Fecha menu mobile se aberto
            navLinks?.classList.remove('active');
            resetMenuAnimation();

            // Scroll suave
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            smoothScrollTo(targetPosition, 900);
        });
    });

    // ================================================
    // SCROLL REVEAL ANIMATIONS (MAIS ANIMADO)
    // ================================================
    
    // Seleciona todos elementos com as classes de reveal
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    // Observer para revelar elementos
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Anima apenas uma vez ao fazer scroll para baixo
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observa todos os elementos
    revealElements.forEach(el => revealObserver.observe(el));

    // ================================================
    // NAVIGATION SCROLL EFFECT
    // ================================================
    function handleScroll() {
        // Navbar background
        if (nav) {
            nav.classList.toggle('scrolled', window.scrollY > 50);
        }

        // Active nav link
        const scrollPos = window.scrollY + 150;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos < top + height) {
                navLinkItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ================================================
    // MOBILE MENU
    // ================================================
    function toggleMenuAnimation() {
        const spans = navToggle?.querySelectorAll('span');
        if (!spans) return;
        
        const isActive = navLinks?.classList.contains('active');
        spans[0].style.transform = isActive ? 'rotate(45deg) translate(5px, 5px)' : '';
        spans[1].style.opacity = isActive ? '0' : '1';
        spans[2].style.transform = isActive ? 'rotate(-45deg) translate(5px, -5px)' : '';
    }

    function resetMenuAnimation() {
        const spans = navToggle?.querySelectorAll('span');
        if (!spans) return;
        spans.forEach(span => {
            span.style.transform = '';
            span.style.opacity = '1';
        });
    }

    navToggle?.addEventListener('click', () => {
        navLinks?.classList.toggle('active');
        toggleMenuAnimation();
    });

    // ================================================
    // TYPING EFFECT
    // ================================================
    const typingText = document.querySelector('.typing-text');
    const roles = ['Full-Stack Developer', 'JavaScript Enthusiast', 'Problem Solver', 'Open to Opportunities'];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimeout;

    function type() {
        if (!typingText) return;
        
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typingText.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }

        typingTimeout = setTimeout(type, typeSpeed);
    }

    if (typingText) {
        setTimeout(type, 1000);
    }

    // ================================================
    // SKILL BARS ANIMATION
    // ================================================
    const skillBars = document.querySelectorAll('.skill-fill');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const level = entry.target.parentElement?.parentElement?.dataset.level;
                if (level) {
                    setTimeout(() => {
                        entry.target.style.transition = 'width 1s ease-out';
                        entry.target.style.width = `${level}%`;
                    }, index * 100);
                }
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));

    // ================================================
    // CONTACT FORM
    // ================================================
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    function validateForm(data) {
        const errors = [];
        if (!data.name || data.name.trim().length < 2) errors.push('Name must be at least 2 characters');
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Please enter a valid email');
        if (!data.message || data.message.trim().length < 10) errors.push('Message must be at least 10 characters');
        
        if (errors.length > 0) {
            formMessage.textContent = errors.join('. ');
            formMessage.className = 'form-message error';
            return false;
        }
        return true;
    }

    contactForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        if (!validateForm(data)) return;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        formMessage.textContent = '';

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name.trim(),
                    email: data.email.toLowerCase().trim(),
                    message: data.message.trim()
                }),
            });

            if (response.ok) {
                formMessage.textContent = 'Message sent successfully!';
                formMessage.className = 'form-message success';
                this.reset();
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            setTimeout(() => {
                formMessage.textContent = 'Message received! (Demo mode)';
                formMessage.className = 'form-message success';
                this.reset();
            }, 1000);
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    // ================================================
    // FOOTER YEAR
    // ================================================
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    // ================================================
    // CUSTOM CURSOR
    // ================================================
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursor-follower');
    
    if (cursor && cursorFollower) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let followerX = mouseX;
        let followerY = mouseY;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
        });
        
        // Smooth follower animation
        function animateFollower() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;
            
            requestAnimationFrame(animateFollower);
        }
        animateFollower();
        
        // Hover effects on clickable elements
        const clickables = document.querySelectorAll('a, button, input, textarea, .project-card, .skill-category, .image-frame');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => cursorFollower.classList.add('active'));
            el.addEventListener('mouseleave', () => cursorFollower.classList.remove('active'));
        });
        
        // Click effect
        document.addEventListener('mousedown', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(0.8)';
        });
        document.addEventListener('mouseup', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    // ================================================
    // 3D TILT EFFECT
    // ================================================
    const tiltElements = document.querySelectorAll('.project-card, .skill-category, .image-frame');
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });

    // ================================================
    // MAGNETIC BUTTONS
    // ================================================
    const magneticElements = document.querySelectorAll('.btn, .nav-logo');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            
            el.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0px, 0px)';
        });
    });

    // ================================================
    // CANVAS PARTICLE BACKGROUND
    // ================================================
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();
        
        let strokeColor = 'rgba(0, 255, 255, 0.15)';
        
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.radius = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
                ctx.fill();
            }
        }
        
        function initParticles() {
            particles = [];
            let particleCount = Math.floor((width * height) / 10000); 
            if (particleCount > 150) particleCount = 150; 
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();
        window.addEventListener('resize', () => {
            setTimeout(initParticles, 200);
        });
        
        let mouse = { x: null, y: null };
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = strokeColor;
                        ctx.lineWidth = 1 - (dist / 120);
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
                
                if (mouse.x != null && mouse.y != null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(217, 70, 239, 0.2)'; // purple tint
                        ctx.lineWidth = 1 - (dist / 150);
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                        
                        particles[i].x += dx * 0.005;
                        particles[i].y += dy * 0.005;
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // Initial check
    handleScroll();
});
