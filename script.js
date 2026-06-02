/* -------------------------------------------------------------
 * SNIPIX STUDIO — Premium Interactive Script Suite (GSAP & Lenis)
 * ------------------------------------------------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCWXHl3lmKweo6F9HlF2eBH0qzDA4a8X9w",
    authDomain: "snipix-c0737.firebaseapp.com",
    projectId: "snipix-c0737",
    storageBucket: "snipix-c0737.firebasestorage.app",
    messagingSenderId: "154174697325",
    appId: "1:154174697325:web:cc106f3a80f673ec817464",
    measurementId: "G-M11W1QZ3TK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {

    // Note: EmailJS was removed in favor of Vercel Serverless Functions backend.


    // --- State Variables ---
    let soundEnabled = false;
    const soundTick = document.getElementById('soundTick');
    const soundClick = document.getElementById('soundClick');

    // Set custom audio volume limits
    if (soundTick) soundTick.volume = 0.04;
    if (soundClick) soundClick.volume = 0.06;

    // --- Sound Feedback System ---
    function playTick() {
        if (soundEnabled && soundTick) {
            soundTick.currentTime = 0;
            soundTick.play().catch(() => { });
        }
    }

    function playClick() {
        if (soundEnabled && soundClick) {
            soundClick.currentTime = 0;
            soundClick.play().catch(() => { });
        }
    }

    // Toggle Sound Controller
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundToggle.classList.toggle('active', soundEnabled);
            const statusText = soundToggle.querySelector('.sound-status-text');
            if (statusText) {
                statusText.textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF';
            }
            playClick();
        });
    }

    // Trigger subtle click noises across elements
    const interactiveSelectors = 'a, button, .stacked-card, .calendar-day, .time-slot';
    document.querySelectorAll(interactiveSelectors).forEach(element => {
        element.addEventListener('mouseenter', playTick);
        element.addEventListener('click', playClick);
    });


    // --- 1. Dynamic Preloader & Smooth Eased Timer ---
    const preloader = document.getElementById('preloader');
    const preloaderCounter = document.getElementById('preloaderCounter');
    const preloaderBar = document.getElementById('preloaderBar');

    if (preloader) {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        // Multi-phase cinematic kinetic typography logo reveal timeline
        const preloaderTl = gsap.timeline();

        // Ensure initial SVG path properties are set for drawing
        gsap.set(".preloader-svg-logo .draw-path", { strokeDasharray: 260, strokeDashoffset: 260 });

        // 1. Fade in the blueprint grid lines
        preloaderTl.to(".blueprint-grid", {
            opacity: 1,
            duration: 0.7,
            ease: "power2.out"
        })
            .to(".preloader-logo-container", {
                opacity: 1,
                duration: 0.1
            }, "-=0.4")

            // 2. Fly in and draw each spelling path alternatively from off-screen edges (Screenshot 2 style)
            .from(".s-path", { x: -screenW, y: -screenH, opacity: 0, duration: 1.3, ease: "power4.out" }, "-=0.2")
            .from(".n-path", { x: -screenW, y: screenH, opacity: 0, duration: 1.3, ease: "power4.out" }, "-=1.1")
            .from(".i1-path", { y: -screenH, opacity: 0, duration: 1.2, ease: "power4.out" }, "-=1.1")
            .from(".i1-square", { y: -screenH, scale: 0, opacity: 0, duration: 0.9, ease: "bounce.out" }, "-=0.7")
            .from(".p-path", { x: screenW, opacity: 0, duration: 1.3, ease: "power4.out" }, "-=1.1")
            .from(".i2-path", { y: screenH, opacity: 0, duration: 1.2, ease: "power4.out" }, "-=1.1")
            .from(".i2-square", { y: -screenH, scale: 0, opacity: 0, duration: 0.9, ease: "bounce.out" }, "-=0.7")
            .from(".x-path-1", { x: screenW, y: -screenH, opacity: 0, duration: 1.3, ease: "power4.out" }, "-=1.1")
            .from(".x-path-2", { x: screenW, y: screenH, opacity: 0, duration: 1.3, ease: "power4.out" }, "-=1.15")

            // Animate drawing stroke outline concurrent with assembly
            .to(".preloader-svg-logo .draw-path", {
                strokeDashoffset: 0,
                duration: 1.4,
                stagger: 0.05,
                ease: "power2.out"
            }, "-=2.2")

            // 3. Sublogo slides up
            .to("#preloaderSublogo", {
                y: "0%",
                duration: 0.75,
                ease: "power3.out"
            }, "-=0.5");

        // Smooth GSAP count up timeline for the progress indicator
        const loaderProgress = { value: 0 };
        gsap.to(loaderProgress, {
            value: 100,
            duration: 3.5,
            ease: "power1.inOut",
            onUpdate: () => {
                const formatted = Math.floor(loaderProgress.value).toString().padStart(2, '0');
                if (preloaderCounter) preloaderCounter.textContent = formatted;
                if (preloaderBar) preloaderBar.style.width = `${loaderProgress.value}%`;
            },
            onComplete: () => {
                // Exit transition sequence
                const exitTl = gsap.timeline({
                    onComplete: () => {
                        preloader.style.display = 'none';
                        // Activate Lenis scroll after loader completes
                        if (lenis) lenis.start();
                    }
                });

                exitTl.to(".preloader-content", {
                    opacity: 0,
                    scale: 0.95,
                    y: -20,
                    duration: 0.8,
                    ease: "power3.inOut"
                })
                    .to(preloader, {
                        y: "-100%",
                        opacity: 0,
                        duration: 1.4,
                        ease: "power4.inOut"
                    }, "-=0.3")
                    .add(() => {
                        triggerHeroAnimations();
                    }, "-=1.0");
            }
        });
    }
    // --- 2. Lenis Buttery Smooth Scroll Engine ---
    const lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium exponential easing
        smooth: true,
        mouseMultiplier: 1.0,
        smoothTouch: false
    });

    // Temporarily pause Lenis scroll during Preloading
    lenis.stop();

    // Standard robust requestAnimationFrame loop matching standard refresh rates
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Synchronize Lenis scrolling events with GSAP ScrollTrigger updates
    lenis.on('scroll', ScrollTrigger.update);


    // --- 3. GSAP Hardware-Accelerated Reveal Sequences ---

    // Sequential mask-reveal entrance for Hero elements
    // Sequential entrance for Hero elements
    function triggerHeroAnimations() {
        const tl = gsap.timeline();

        tl.to(".hero-brand-wrap", {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.6,
            ease: "expo.out"
        })
            .to(".hero-eyebrow", {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out"
            }, "-=1.0")
            .to(".hero-title .title-line", {
                opacity: 1,
                y: 0,
                duration: 1.4,
                stagger: 0.2,
                ease: "power4.out"
            }, "-=0.9")
            .to(".hero-subtitle", {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out"
            }, "-=1.0")
            .to(".hero-cta", {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out"
            }, "-=1.0")
            .to(".kb-item", {
                opacity: 1,
                scale: 1,
                duration: 1.2,
                stagger: 0.1,
                ease: "back.out(1.5)"
            }, "-=1.0")
            .to(".hero-scroll-indicator", {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out"
            }, "-=0.6");
    }

    // Set initial states for hero animate items to prevent FOUC (flash of unstyled content)
    gsap.set(".hero-brand-wrap", { opacity: 0, scale: 0.9, filter: "blur(10px)" });
    gsap.set(".hero-eyebrow", { opacity: 0, y: 30 });
    gsap.set(".hero-title .title-line", { opacity: 0, y: 60 });
    gsap.set(".hero-subtitle", { opacity: 0, y: 35 });
    gsap.set(".hero-cta", { opacity: 0, y: 30 });
    gsap.set(".kb-item", { opacity: 0, scale: 0.8 });
    gsap.set(".hero-scroll-indicator", { opacity: 0, y: 20 });

    // --- 3.5. Mouse Parallax for Badges ---
    const heroSection = document.getElementById('hero');
    const kbItems = document.querySelectorAll('.kb-item');
    if (heroSection && kbItems.length > 0) {
        heroSection.addEventListener('mousemove', (e) => {
            const xPos = (e.clientX / window.innerWidth - 0.5) * 45;
            const yPos = (e.clientY / window.innerHeight - 0.5) * 45;

            gsap.to(kbItems, {
                x: xPos,
                y: yPos,
                duration: 0.6,
                ease: "power2.out",
                overwrite: "auto"
            });
        });

        heroSection.addEventListener('mouseleave', () => {
            gsap.to(kbItems, {
                x: 0,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                overwrite: "auto"
            });
        });
    }
    // Buttery scroll reveal for all main sections containing the .scroll-reveal class
    document.querySelectorAll('.scroll-reveal').forEach((section) => {
        gsap.to(section, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none none"
            }
        });
    });

    // "The Big Show" featured widescreen expanding scale effect
    gsap.fromTo("#showreelWrapper", {
        scale: 0.93,
        borderRadius: "24px"
    }, {
        scale: 1,
        borderRadius: "0px",
        ease: "none",
        scrollTrigger: {
            trigger: "#showreelContainer",
            start: "top bottom",
            end: "center center",
            scrub: true
        }
    });

    // Showreel visibility logic
    const showreelContainer = document.getElementById('showreelContainer');
    const showreelVideo = document.getElementById('showreelVideo');

    if (showreelContainer && showreelVideo) {
        const videoSrc = showreelVideo.getAttribute('src');
        if (!videoSrc || videoSrc.trim() === '') {
            showreelContainer.style.display = 'none';
        } else {
            showreelContainer.style.display = 'block';
        }
    }

    // Reels Container fade-in is handled by .scroll-reveal on the section

    // Editorial text in About grid fade-in
    gsap.from(".about-editorial-text > *", {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#about",
            start: "top 75%"
        }
    });

    // Stats counting triggers on entry
    ScrollTrigger.create({
        trigger: "#about",
        start: "top 75%",
        onEnter: triggerStatsCounter,
        once: true
    });

    // Parallax scrolling translation on about image
    gsap.fromTo(".about-img", {
        yPercent: -15
    }, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
            trigger: ".about-editorial-visual",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // Contact form side entrance
    gsap.from(".contact-form-side > *", {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#contact",
            start: "top 75%"
        }
    });

    // Consultation booking widget card slide-in
    gsap.from(".contact-scheduler-side", {
        x: 40,
        opacity: 0,
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#contact",
            start: "top 75%"
        }
    });

    // Active Pill Navigation on scroll triggers
    ScrollTrigger.create({
        start: "top -50px",
        onToggle: self => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.classList.toggle('scrolled', self.isActive);
            }
        }
    });


    // --- 4. Custom GSAP inertia Cursor & Label ---
    const cursor = document.getElementById('customCursor');
    const cursorDot = document.getElementById('customCursorDot');
    const cursorLabel = document.getElementById('cursorLabel');

    let mouseX = 0, mouseY = 0;

    // Track cursor coordinates
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Instant inner dot placement
        gsap.to(cursorDot, {
            x: mouseX,
            y: mouseY,
            duration: 0.1,
            ease: "power2.out"
        });

        // Fluid spring-lagged outer ring tracking
        gsap.to(cursor, {
            x: mouseX,
            y: mouseY,
            duration: 0.45,
            ease: "power3.out"
        });
    });

    // Scale ring transformations with GSAP to avoid layout transition delay janks
    const standardHoverables = document.querySelectorAll('a, button, .sound-toggle-btn, .cal-nav-btn, .clear-booking-btn, .submit-btn');
    standardHoverables.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(cursor, {
                width: 60,
                height: 60,
                backgroundColor: "rgba(0, 0, 0, 0.02)",
                borderColor: "#0f0f11",
                duration: 0.35,
                ease: "power2.out"
            });
        });
        item.addEventListener('mouseleave', () => {
            gsap.to(cursor, {
                width: 24,
                height: 24,
                backgroundColor: "transparent",
                borderColor: "rgba(0,0,0,0.15)",
                duration: 0.35,
                ease: "power2.out"
            });
        });
    });


    // --- 5. 3D Card Hover Tilt Interaction ---
    // (Removed because inline GSAP transforms override the CSS 3D position classes)


    // --- 6. "The Big Show" Featured Widescreen Player ---
    // Removed because we are using the minimal motionpill showreel player which autoplay loops.    // --- 6.5. 3D perspective stacked card slider logic ---
    const p3dContainer = document.getElementById('p3dContainer');
    const stackedCards = Array.from(document.querySelectorAll('.stacked-card'));
    const p3dPrevBtn = document.getElementById('p3dPrev');
    const p3dNextBtn = document.getElementById('p3dNext');

    let activeStackedCards = [...stackedCards];
    let currentStackIndex = 0;
    let totalStackCards = activeStackedCards.length;
    let stackUserInteracted = false;

    function stopAllStackedVideos() {
        stackedCards.forEach(card => {
            const v = card.querySelector('video');
            if (v) {
                v.pause();
                v.currentTime = 0;
            }
            card.classList.remove('playing');
        });
    }

    function layout3DStack() {
        totalStackCards = activeStackedCards.length;
        if (totalStackCards === 0) return;

        // Hide all cards initially and reset classes
        stackedCards.forEach(card => {
            card.style.display = 'none';
            card.className = 'stacked-card';
        });

        // Show and layout only the active categories
        activeStackedCards.forEach((card, i) => {
            card.style.display = 'block';
            let offset = i - currentStackIndex;

            // Circular wrap calculations
            if (offset > Math.floor(totalStackCards / 2)) offset -= totalStackCards;
            if (offset < -Math.floor(totalStackCards / 2)) offset += totalStackCards;

            card.className = 'stacked-card';

            if (offset === 0) {
                card.classList.add('active');
            } else if (offset === -1) {
                card.classList.add('left-1');
            } else if (offset === 1) {
                card.classList.add('right-1');
            } else if (offset === -2) {
                card.classList.add('left-2');
            } else if (offset === 2) {
                card.classList.add('right-2');
            } else if (offset < 0) {
                card.classList.add('hidden-left');
            } else {
                card.classList.add('hidden-right');
            }
        });
    }

    function goToStackedIndex(index) {
        stopAllStackedVideos();
        if (activeStackedCards.length === 0) return;

        currentStackIndex = ((index % totalStackCards) + totalStackCards) % totalStackCards;
        layout3DStack();

        // Autoplay the video on the active card
        const activeCard = activeStackedCards[currentStackIndex];
        const vid = activeCard && activeCard.querySelector('video');
        if (vid) {
            if (!vid.src) {
                vid.src = activeCard.getAttribute('data-video-src');
                vid.load();
            }
            vid.muted = !stackUserInteracted; // Muted by default unless user interacts
            vid.currentTime = 0;
            vid.play()
                .then(() => {
                    activeCard.classList.add('playing');
                })
                .catch(err => {
                    if (!vid.muted) {
                        vid.muted = true;
                        vid.play()
                            .then(() => activeCard.classList.add('playing'))
                            .catch(e => console.warn(e));
                    }
                });
        }
    }

    if (p3dPrevBtn) {
        p3dPrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stackUserInteracted = true;
            goToStackedIndex(currentStackIndex - 1);
        });
    }

    if (p3dNextBtn) {
        p3dNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stackUserInteracted = true;
            goToStackedIndex(currentStackIndex + 1);
        });
    }

    stackedCards.forEach((card, idx) => {
        card.addEventListener('click', (e) => {
            stackUserInteracted = true;
            const indexInActive = activeStackedCards.indexOf(card);
            if (indexInActive === -1) return;

            if (indexInActive !== currentStackIndex) {
                // Click adjacent card -> transition stack to it
                goToStackedIndex(indexInActive);
            } else {
                // Click active card -> toggle play/pause
                const vid = card.querySelector('video');
                if (vid) {
                    if (vid.paused) {
                        vid.muted = false; // Unmute on explicit interaction
                        vid.play().then(() => card.classList.add('playing')).catch(e => console.warn(e));
                        if (cursor) cursorLabel.textContent = 'PAUSE';
                    } else {
                        vid.pause();
                        card.classList.remove('playing');
                        if (cursor) cursorLabel.textContent = 'PLAY';
                    }
                }
            }
        });

        // Hover effect for play cursor and scaling
        card.addEventListener('mouseenter', () => {
            if (cursor && card.classList.contains('active')) {
                gsap.to(cursor, {
                    width: 80,
                    height: 80,
                    backgroundColor: "#0f0f11",
                    borderColor: "#0f0f11",
                    duration: 0.3,
                    ease: "power2.out"
                });
                cursor.classList.add('video-hover');
                cursorLabel.textContent = 'PLAY';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (cursor) {
                gsap.to(cursor, {
                    width: 24,
                    height: 24,
                    backgroundColor: "transparent",
                    borderColor: "rgba(0,0,0,0.15)",
                    duration: 0.3,
                    ease: "power2.out"
                });
                cursor.classList.remove('video-hover');
                cursorLabel.textContent = '';
            }
        });
    });

    // Touch Swipe & Mouse Drag Snap for 3D Stack
    let startStackX = 0;
    let stackDragging = false;

    if (p3dContainer) {
        p3dContainer.addEventListener('mousedown', (e) => {
            if (e.target.closest('.p3d-nav')) return;
            startStackX = e.clientX;
            stackDragging = true;
        });

        document.addEventListener('mouseup', (e) => {
            if (!stackDragging) return;
            stackDragging = false;
            const diffX = e.clientX - startStackX;
            if (Math.abs(diffX) > 60) {
                stackUserInteracted = true;
                goToStackedIndex(diffX > 0 ? currentStackIndex - 1 : currentStackIndex + 1);
            }
        });

        p3dContainer.addEventListener('touchstart', (e) => {
            startStackX = e.touches[0].clientX;
            stackDragging = true;
        }, { passive: true });

        p3dContainer.addEventListener('touchend', (e) => {
            if (!stackDragging) return;
            stackDragging = false;
            const diffX = e.changedTouches[0].clientX - startStackX;
            if (Math.abs(diffX) > 50) {
                stackUserInteracted = true;
                goToStackedIndex(diffX > 0 ? currentStackIndex - 1 : currentStackIndex + 1);
            }
        }, { passive: true });
    }

    // --- 6.6. Category Tabs Filtering ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabIndicator = document.querySelector('.tab-indicator');

    function updateTabIndicator(activeBtn) {
        if (!tabIndicator || !activeBtn) return;
        tabIndicator.style.width = `${activeBtn.offsetWidth}px`;
        gsap.to(tabIndicator, {
            x: activeBtn.offsetLeft - 4, // border/padding offset
            duration: 0.45,
            ease: "power3.out"
        });
    }

    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn) {
        setTimeout(() => updateTabIndicator(activeTabBtn), 150);
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateTabIndicator(btn);

            const filterValue = btn.getAttribute('data-filter');

            // transition stacked cards out and filter
            gsap.to(p3dContainer, {
                opacity: 0,
                y: 20,
                duration: 0.35,
                ease: "power2.in",
                onComplete: () => {
                    if (filterValue === 'all') {
                        activeStackedCards = [...stackedCards];
                    } else {
                        activeStackedCards = stackedCards.filter(card => card.getAttribute('data-category-tab') === filterValue);
                    }

                    currentStackIndex = 0;
                    layout3DStack();
                    goToStackedIndex(0);

                    gsap.to(p3dContainer, {
                        opacity: 1,
                        y: 0,
                        duration: 0.55,
                        ease: "power3.out"
                    });
                }
            });
        });
    });

    window.addEventListener('resize', () => {
        const activeBtn = document.querySelector('.tab-btn.active');
        if (activeBtn) updateTabIndicator(activeBtn);
    });

    // Initial Stack layout trigger
    layout3DStack();
    goToStackedIndex(0);

    // Pause all stacked videos when section scrolls out of view
    const stackSectionObserver = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) {
            stopAllStackedVideos();
        } else {
            // Restart active slide playback
            goToStackedIndex(currentStackIndex);
        }
    }, { threshold: 0.1 });
    const reelsSectionEl = document.getElementById('reels');
    if (reelsSectionEl) stackSectionObserver.observe(reelsSectionEl);


    // --- 9. Editorial Stats Counter ---
    function triggerStatsCounter() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const obj = { val: 0 };

            gsap.to(obj, {
                val: target,
                duration: 2,
                ease: "power2.out",
                onUpdate: () => {
                    stat.textContent = Math.floor(obj.val);
                }
            });
        });
    }


    // --- 10. Custom Consultation Appointment Scheduler ---
    let calendarDate = new Date();
    let selectedDateStr = "";
    let selectedTimeStr = "";

    const currentMonthYear = document.getElementById('currentMonthYear');
    const calendarDaysGrid = document.getElementById('calendarDaysGrid');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const slotsDateTitle = document.getElementById('slotsDateTitle');
    const timeSlotsGrid = document.getElementById('timeSlotsGrid');

    const hiddenDateInput = document.getElementById('selectedBookingDate');
    const hiddenTimeInput = document.getElementById('selectedBookingTime');
    const schedulerSummaryCard = document.getElementById('schedulerSummaryCard');
    const bookingSummaryText = document.getElementById('bookingSummaryText');
    const clearBookingBtn = document.getElementById('clearBookingBtn');

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function renderCalendar() {
        if (!calendarDaysGrid) return;

        calendarDaysGrid.innerHTML = '';

        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        if (currentMonthYear) {
            currentMonthYear.textContent = `${monthNames[month]} ${year}`;
        }

        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDay = document.createElement('span');
            emptyDay.className = 'calendar-day empty';
            calendarDaysGrid.appendChild(emptyDay);
        }

        for (let day = 1; day <= lastDay; day++) {
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.className = 'calendar-day valid-day';
            dayBtn.textContent = day;

            const checkDate = new Date(year, month, day);
            const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            if (checkDate < today || checkDate.getDay() === 0) {
                dayBtn.className = 'calendar-day disabled-day';
            } else {
                dayBtn.addEventListener('click', () => {
                    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected-day'));
                    dayBtn.classList.add('selected-day');

                    // Simple micro-scale pop on selected day button
                    gsap.fromTo(dayBtn, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "power2.out" });

                    selectDate(dateString, checkDate);
                });

                if (dateString === selectedDateStr) {
                    dayBtn.classList.add('selected-day');
                }
            }
            calendarDaysGrid.appendChild(dayBtn);
        }
    }

    function selectDate(dateString, dateObj) {
        selectedDateStr = dateString;
        hiddenDateInput.value = dateString;

        const formatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
        const displayDate = dateObj.toLocaleDateString('en-US', formatOptions);
        if (slotsDateTitle) slotsDateTitle.textContent = displayDate;

        selectedTimeStr = "";
        hiddenTimeInput.value = "";
        updateSchedulerSummary();

        renderTimeSlots(dateString);
    }

    async function renderTimeSlots(dateString) {
        if (!timeSlotsGrid) return;
        timeSlotsGrid.innerHTML = '<div class="no-date-selected-placeholder">Loading live slots...</div>';

        const slots = [
            "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
            "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
            "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
            "09:00 PM", "10:00 PM", "11:00 PM", "12:00 AM",
            "01:00 AM", "02:00 AM",
        ];

        // Fetch booked slots from live Firebase Firestore
        let bookedSlots = [];
        try {
            const bookingsRef = collection(db, "bookings");
            const q = query(bookingsRef, where("date", "==", dateString));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Treat missing status as normal, only ignore 'rejected' ones
                if (data.time && data.status !== 'rejected') {
                    bookedSlots.push(data.time);
                }
            });
        } catch (error) {
            console.error("Error fetching live bookings:", error);
        }

        timeSlotsGrid.innerHTML = '';

        // Animate staggered layout in slot cells
        slots.forEach((slot, index) => {
            const slotBtn = document.createElement('button');
            slotBtn.type = 'button';
            slotBtn.className = 'time-slot';
            slotBtn.textContent = slot;

            const isBooked = bookedSlots.includes(slot);

            if (isBooked) {
                slotBtn.classList.add('booked');
                slotBtn.textContent += " (Booked)";
            } else {
                slotBtn.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected-slot'));
                    slotBtn.classList.add('selected-slot');

                    // Micro spring-pop
                    gsap.fromTo(slotBtn, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });

                    selectTimeSlot(slot);
                });

                if (slot === selectedTimeStr) {
                    slotBtn.classList.add('selected-slot');
                }
            }

            timeSlotsGrid.appendChild(slotBtn);
        });
    }

    function selectTimeSlot(time) {
        selectedTimeStr = time;
        hiddenTimeInput.value = time;
        updateSchedulerSummary();
    }

    function updateSchedulerSummary() {
        if (!schedulerSummaryCard) return;

        if (selectedDateStr && selectedTimeStr) {
            schedulerSummaryCard.classList.add('selected');
            if (clearBookingBtn) clearBookingBtn.style.display = 'flex';

            const dateObj = new Date(selectedDateStr);
            const formatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
            const prettyDate = dateObj.toLocaleDateString('en-US', formatOptions);

            if (bookingSummaryText) {
                bookingSummaryText.textContent = `Consultation Selected: ${prettyDate} at ${selectedTimeStr}`;
            }

            // Scale and glow pop summary card
            gsap.fromTo(schedulerSummaryCard, { scale: 0.98 }, { scale: 1, duration: 0.4, ease: "power2.out" });
        } else {
            schedulerSummaryCard.classList.remove('selected');
            if (clearBookingBtn) clearBookingBtn.style.display = 'none';
            if (bookingSummaryText) {
                bookingSummaryText.textContent = "No consultation date selected yet (Use scheduler)";
            }
        }
    }

    if (clearBookingBtn) {
        clearBookingBtn.addEventListener('click', () => {
            selectedDateStr = "";
            selectedTimeStr = "";
            hiddenDateInput.value = "";
            hiddenTimeInput.value = "";

            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected-day'));
            if (slotsDateTitle) slotsDateTitle.textContent = "Select a date";

            if (timeSlotsGrid) {
                timeSlotsGrid.innerHTML = '<div class="no-date-selected-placeholder">Please select a valid date in the calendar above first.</div>';
            }

            updateSchedulerSummary();
        });
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();

            // Slide in animation
            gsap.from(calendarDaysGrid, { x: -20, opacity: 0, duration: 0.4, ease: "power2.out" });
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();

            // Slide in animation
            gsap.from(calendarDaysGrid, { x: 20, opacity: 0, duration: 0.4, ease: "power2.out" });
        });
    }

    renderCalendar();


    // --- 11. Form Submission & Custom Success Toast ---
    const contactForm = document.getElementById('portfolioContactForm');
    const successToast = document.getElementById('successToast');
    const toastCloseBtn = document.getElementById('toastCloseBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('clientName').value;
            const email = document.getElementById('clientEmail').value;
            const brief = document.getElementById('projectDetails').value;
            const dateStr = document.getElementById('selectedBookingDate').value;
            const timeStr = document.getElementById('selectedBookingTime').value;

            if (!name || !email || !brief) return;

            const submitBtn = contactForm.querySelector('#submitBtn');
            const submitBtnText = submitBtn.querySelector('.btn-text');
            const submitBtnIcon = submitBtn.querySelector('.btn-icon');

            if (submitBtn) {
                submitBtn.disabled = true;
                if (submitBtnText) submitBtnText.textContent = "TRANSMITTING BRIEF...";
                if (submitBtnIcon) submitBtnIcon.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            }

            try {
                // Save live booking to Firebase Firestore
                await addDoc(collection(db, "bookings"), {
                    name: name,
                    email: email,
                    brief: brief,
                    date: dateStr || "No date selected",
                    time: timeStr || "No time selected",
                    timestamp: new Date(),
                    status: 'pending'
                });

                // Call Vercel Backend to send the automated Thank You email to the client
                await fetch('/api/send-thank-you', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        date: dateStr || "No date",
                        time: timeStr || "No time"
                    })
                });

            } catch (error) {
                console.error("Error saving or sending booking:", error);
            }

            // Open Toast with GSAP elastic glide
            if (successToast) {
                successToast.classList.add('show');
                gsap.fromTo(successToast, { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" });
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                if (submitBtnText) submitBtnText.textContent = "TRANSMIT BRIEF";
                if (submitBtnIcon) submitBtnIcon.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
            }

            contactForm.reset();
            if (clearBookingBtn) clearBookingBtn.click();

            setTimeout(() => {
                closeToast();
            }, 6000);

        });
    }

    function closeToast() {
        if (successToast && successToast.classList.contains('show')) {
            gsap.to(successToast, {
                y: 100,
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    successToast.classList.remove('show');
                }
            });
        }
    }

    if (toastCloseBtn) {
        toastCloseBtn.addEventListener('click', closeToast);
    }


    // (Mobile drawer removed - pill-nav is fully self-responsive)

    // Anchor magnetic scroll navigation binding with Lenis integration
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                lenis.scrollTo(0);
                return;
            }

            const target = document.querySelector(targetId);
            if (target) {
                // Use Lenis smooth-scroller to transition to section anchor
                lenis.scrollTo(target, {
                    offset: -40,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other accordions
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherIcon = otherItem.querySelector('.faq-icon i');
                if (otherIcon) {
                    otherIcon.classList.remove('fa-minus');
                    otherIcon.classList.add('fa-plus');
                }
            });

            if (!isActive) {
                // Open clicked accordion
                item.classList.add('active');
                const icon = item.querySelector('.faq-icon i');
                if (icon) {
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                }
            }
        });
    });

});
