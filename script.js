document.addEventListener('DOMContentLoaded', () => {
    // Testimonial Carousel
    const grid = document.querySelector('.testimonials-grid');
    const nextBtn = document.querySelector('.control-btn.next');
    const prevBtn = document.querySelector('.control-btn.prev');

    if (grid && nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            grid.scrollBy({ left: 830, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            grid.scrollBy({ left: -830, behavior: 'smooth' });
        });
    }

    // Modular Property Slider Initialization Function
    function initSlider(containerId, nextBtnId, prevBtnId, autoPlay = true) {
        const container = document.getElementById(containerId);
        const nextBtn = document.getElementById(nextBtnId);
        const prevBtn = document.getElementById(prevBtnId);

        if (!container || !nextBtn || !prevBtn) return;

        const slideTo = (direction) => {
            const card = container.querySelector('.property-card');
            const scrollAmount = card ? card.offsetWidth + 30 : 460;
            const currentScroll = container.scrollLeft;
            let targetScroll = direction === 'next' ? currentScroll + scrollAmount : currentScroll - scrollAmount;
            
            // Handle loop logic
            const isAtEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth - 10;
            if (direction === 'next' && isAtEnd) {
                targetScroll = 0;
            } else if (direction === 'prev' && currentScroll <= 10) {
                targetScroll = container.scrollWidth;
            }

            gsap.to(container, {
                scrollLeft: targetScroll,
                duration: 1.2,
                ease: "power4.out",
                overwrite: true
            });
        };

        nextBtn.addEventListener('click', () => slideTo('next'));
        prevBtn.addEventListener('click', () => slideTo('prev'));

        if (autoPlay) {
            let autoPlayTimer = setInterval(() => slideTo('next'), 5000);
            container.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
            container.addEventListener('mouseleave', () => {
                autoPlayTimer = setInterval(() => slideTo('next'), 5000);
            });
        }
    }

    // Hero Slider Logic (Autonomous)
    function initHeroSlider() {
        const slider = document.getElementById('hero-slider');
        if (!slider) return;
        
        const slides = slider.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;
        
        let currentIndex = 0;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            currentIndex = (index + slides.length) % slides.length;
            slides[currentIndex].classList.add('active');
        }
        
        // Auto-play every 2 seconds
        setInterval(() => {
            showSlide(currentIndex + 1);
        }, 2000);
    }

    // Initialize all sliders
    initHeroSlider();
    initSlider('featured-slider-container', 'featured-next', 'featured-prev');
    initSlider('more-slider-container', 'more-next', 'more-prev');


    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // GSAP Scroll Animations (Framer Style Spring) - EXCEPT HERO SECTION
    gsap.registerPlugin(ScrollTrigger);

    // Benefit Cards Reveal (Priority Section) - Spring Slide
    gsap.to(".benefit-card", {
        x: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: "back.out(1.2)",
        scrollTrigger: {
            trigger: ".priority-section",
            start: "top 85%",
            toggleActions: "play none none none"
        }
    });

    // Categories Reveal - Spring Scale
    gsap.to(".category-card", {
        scale: 1,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: "back.out(1.5)",
        scrollTrigger: {
            trigger: ".categories-section",
            start: "top 80%",
            toggleActions: "play none none none"
        }
    });

    // City Cards Reveal - Smooth Float Up
    gsap.to(".city-card", {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out",
        scrollTrigger: {
            trigger: ".cities-grid",
            start: "top 85%",
            toggleActions: "play none none none"
        }
    });

    // Testimonials Title Reveal
    gsap.to(".testimonials-section .section-title", {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".testimonials-section",
            start: "top 90%"
        }
    });

    // CTA Box Reveal - Elegant Stretch
    gsap.to(".cta-box", {
        scaleX: 1,
        opacity: 1,
        duration: 1.4,
        ease: "power2.inOut",
        scrollTrigger: {
            trigger: ".cta-section",
            start: "top 80%"
        }
    });

    // Parallax for Buildings in Priority Section
    gsap.to(".priority-bg img", {
        y: -100,
        scrollTrigger: {
            trigger: ".priority-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // GSAP HERO ENTRANCE (ON PAGE LOAD)
    const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

    heroTl.to(".main-hero-image", {
        opacity: 1,
        scale: 1,
        duration: 1.8,
        ease: "power2.out",
        startAt: { scale: 1.05 }
    })
    .to(".hero-title span", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        startAt: { y: 40 }
    }, "-=1.2")
    .to(".hero-subtitle", {
        opacity: 1,
        y: 0,
        duration: 1,
        startAt: { y: 20 }
    }, "-=0.8")
    .to(".search-bar-container", {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: "back.out(1.2)",
        startAt: { y: 60 }
    }, "-=0.8");

    // Ensure ScrollTrigger refreshes after initial renders
    window.addEventListener('load', () => {
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);
    });

    // 1. DATA INFRASTRUCTURE
    const defaultContent = {
        hero: { title: "We help people to realize their dream property", subtitle: "We are creative people who provide the best way to you who want to have a new comfortable and suitable place to live" },
        contact: { phone: "+91 96969 76950", email: "hello@kimiproperties.in", address: "Nagpur, Maharashtra, India" },
        locations: ["Nagpur", "Mumbai", "Pune"],
        categories: ["Residential (Purchase)", "Residential Rental", "Commercial (Purchase)", "Commercial Rental", "Industrial", "Agriculture"],
        properties: [
            { id: "prop-1", name: "Riverbend Retreat", price: "$4,299", address: "3 Leame Close, Hull, HU3 6ND", location: "Mumbai", category: "Residential (Purchase)", status: "Ready to Move", transactionType: "New", area: "7x7 m²", image: "assets/property-1.png", isFeatured: true, description: "Experience the epitome of luxury living at Riverbend Retreat. This stunning residential masterpiece combines modern architecture with serene natural surroundings.", beds: 3, baths: 2 },
            { id: "prop-2", name: "Oakwood Cottage", price: "$2,095", address: "2699 Green Valley, Highland Lake, FL", location: "Pune", category: "Residential Rental", status: "Under Construction", transactionType: "Resale", area: "6x8 m²", image: "assets/property-2.png", isFeatured: true, description: "Perfect for families or those seeking a peaceful escape without compromising on urban convenience.", beds: 2, baths: 1 },
            { id: "prop-3", name: "Herringbone Realty", price: "$5,099", address: "28B Highgate Road, London, NW5 1NS", location: "Nagpur", category: "Commercial (Purchase)", status: "Ready to Move", transactionType: "New", area: "7x7 m²", image: "assets/property-3.png", isFeatured: true, description: "Located in the heart of Hull, with easy access to premium amenities and schools.", beds: 4, baths: 2 }
        ]
    };

    // Universal Content Population Function
    function populatePageContent(content) {
        if (!content) return;
        console.log("populatePageContent: called with properties count =", content.properties ? content.properties.length : 0);

        // Populate Location Dropdowns
        const heroLocation = document.getElementById('hero-location');
        const propLocation = document.getElementById('location-filter');
        
        let dynamicLocations = content.locations || [];
        if (content.properties && content.properties.length > 0) {
            const propLocs = content.properties.map(p => p.location).filter(Boolean);
            dynamicLocations = [...new Set([...dynamicLocations, ...propLocs])];
        }

        if (dynamicLocations.length > 0) {
            const locOptions = `<option value="all">Any Location</option>` + 
                              dynamicLocations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
            if (heroLocation) heroLocation.innerHTML = locOptions;
            if (propLocation) propLocation.innerHTML = locOptions;
        }

        // Populate Category Dropdowns
        const heroType = document.getElementById('hero-type');
        const typeFilter = document.getElementById('type-filter');
        if (content.categories && content.categories.length > 0) {
            const catOptions = `<option value="all">All Types</option>` + 
                              content.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            if (heroType) heroType.innerHTML = catOptions;
            if (typeFilter) typeFilter.innerHTML = catOptions;
        }

        // Populate Grids
        const grids = document.querySelectorAll('.dynamic-properties-grid, #properties-grid');
        if (grids.length > 0 && content.properties) {
            const path = window.location.pathname;
            const isHomePage = path.endsWith('index.html') || path.endsWith('/') || path === '' || path.split('/').pop() === '';
            let allProps = isHomePage ? content.properties.filter(p => p.isFeatured) : content.properties;
            let itemsPerPage = 12;
            let currentPage = 1;

            const renderGrid = (page) => {
                const end = page * itemsPerPage;
                const propsToShow = allProps.slice(0, end);
                const formatPrice = (price) => {
                    if (!price) return '';
                    const num = String(price).replace(/,/g, '');
                    if (!isNaN(num) && num.trim() !== '') {
                        return '₹' + Number(num).toLocaleString('en-IN');
                    }
                    return String(price).includes('₹') ? price : '₹' + price;
                };

                const gridHTML = propsToShow.map(prop => `
                    <div class="property-card" onclick="window.location.href='property-detail.html?id=${prop._id || prop.id}'" style="cursor: pointer;" data-location="${prop.location || 'all'}" data-type="${prop.category}">
                        <div class="card-image">
                            <img src="${(prop.images && prop.images[0]) || prop.image || 'assets/hero-illustration.png'}" alt="${prop.name}" loading="lazy">
                            <div class="card-overlay">
                                <span class="view-btn-hover">View Property <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px; display: inline-block; vertical-align: middle;"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></span>
                            </div>
                        </div>
                        <div class="card-content">
                            ${prop.isSoldOut ? '<span class="sold-tag">SOLD OUT</span>' : (prop.isFeatured ? '<span class="featured-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg> FEATURED</span>' : '')}
                            <p class="price">${formatPrice(prop.price)}<span>${prop.priceUnit || ''}</span></p>
                            <h3 class="property-name">${prop.name}</h3>
                            <p class="address">${prop.address} ${prop.location ? '(' + prop.location + ')' : ''}</p>
                            <div class="specs">
                                ${prop.beds ? `<span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2 2H5a2 2 0 0 0-2 2z"/></svg>${prop.beds} Beds</span>` : ''}
                                ${prop.baths ? `<span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20"/><path d="M4 12v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/><path d="M10 8h4"/><path d="M12 4v4"/></svg>${prop.baths} Baths</span>` : ''}
                                ${prop.area ? `<span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>${prop.area}</span>` : ''}
                            </div>
                            <div class="card-action">
                                <button class="btn-view-dream">View Dream <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px; display: inline-block; vertical-align: middle;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
                            </div>
                        </div>
                    </div>
                `).join('');

                grids.forEach(grid => {
                    grid.innerHTML = gridHTML;
                    
                    // Handle duplicate for marquee if it exists
                    if (grid.id === 'properties-grid') {
                        const duplicate = document.getElementById('properties-grid-duplicate');
                        if (duplicate) duplicate.innerHTML = gridHTML;
                    }

                    if (grid.id === 'properties-grid' && !document.querySelector('.detailed-marquee') && allProps.length > end) {
                        const loadMoreBtn = document.createElement('button');
                        loadMoreBtn.innerText = 'Load More Properties';
                        loadMoreBtn.className = 'btn-browse-action';
                        loadMoreBtn.style.gridColumn = '1 / -1';
                        loadMoreBtn.style.margin = '40px auto';
                        loadMoreBtn.onclick = () => { currentPage++; renderGrid(currentPage); };
                        grid.appendChild(loadMoreBtn);
                    }
                });
                initScrollObserver();
            };
            renderGrid(currentPage);
        }

        // Populate Individual Details
        if (window.location.pathname.includes('property-detail.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const propId = urlParams.get('id');
            if (propId && content.properties) {
                const prop = content.properties.find(p => (p._id || p.id) === propId);
                if (prop) {
                    const titleEl = document.querySelector('.property-detail-header h1');
                    const priceEl = document.querySelector('.detail-price strong');
                    if (titleEl) titleEl.innerText = prop.name;
                    if (priceEl) priceEl.innerText = prop.price;
                    const mainImg = document.querySelector('.main-image img');
                    if (mainImg && prop.images && prop.images.length > 0) mainImg.src = prop.images[0];
                    const descEl = document.querySelector('.description-box p');
                    if (descEl && prop.description) descEl.innerText = prop.description;
                }
            }
        }
    }

    // 2. DATA FETCHING (HYBRID INSTANT LOAD)
    async function fetchFrontendData() {
        console.log("fetchFrontendData: starting data load");
        // Step A: Immediate render from Cache/Defaults
        const cached = localStorage.getItem('kimi_content');
        if (cached) {
            try {
                console.log("fetchFrontendData: rendering from cache");
                populatePageContent(JSON.parse(cached));
            } catch (e) {
                console.error("Error parsing cached content:", e);
                populatePageContent(defaultContent);
            }
        } else {
            console.log("fetchFrontendData: rendering from defaults");
            populatePageContent(defaultContent);
        }

        function getApiUrl(path) {
            if (!path.startsWith('/')) path = '/' + path;
            if (window.location.protocol === 'file:' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && !window.location.port)) {
                return 'http://localhost:3001' + path;
            }
            return path;
        }

        // Step B: Background Fetch & Update
        try {
            console.log("fetchFrontendData: fetching fresh content from API");
            const res = await fetch(getApiUrl('/api/content'));
            if (res.ok) {
                const liveContent = await res.json();
                console.log("fetchFrontendData: fresh content loaded, properties count:", liveContent.properties ? liveContent.properties.length : 0);
                // Render first to ensure user sees the content immediately
                populatePageContent(liveContent);
                // Attempt to cache in localStorage, handle quota errors gracefully
                try {
                    localStorage.setItem('kimi_content', JSON.stringify(liveContent));
                    console.log("fetchFrontendData: cached fresh content in localStorage");
                } catch (storageError) {
                    console.warn("Storage quota exceeded or disabled. Renders live data without caching:", storageError);
                }
            } else {
                console.error("fetchFrontendData: API returned non-OK status:", res.status);
            }
        } catch (e) {
            console.error("Error fetching live content:", e);
        }
    }

    // Start the hybrid loading sequence
    fetchFrontendData();

    // Property Filtering Logic
    const applyFiltersBtn = document.getElementById('apply-filters');
    const propertiesGrid = document.getElementById('properties-grid');
    const resultCountSpan = document.getElementById('result-count');

    if (applyFiltersBtn && propertiesGrid) {
        applyFiltersBtn.addEventListener('click', () => {
            const locationValue = document.getElementById('location-filter').value;
            const typeValue = document.getElementById('type-filter').value;
            
            const cards = propertiesGrid.querySelectorAll('.property-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const cardLocation = card.getAttribute('data-location');
                const cardType = card.getAttribute('data-type');

                let matchLocation = (!locationValue || locationValue === 'all' || cardLocation === 'all' || locationValue === cardLocation || (cardLocation && cardLocation.includes(locationValue)));
                let matchType = (!typeValue || typeValue === 'all' || cardType === 'all' || typeValue === cardType || (cardType && typeValue && (cardType.includes(typeValue) || typeValue.includes(cardType))));

                if (matchLocation && matchType) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (resultCountSpan) {
                resultCountSpan.textContent = visibleCount;
            }
            
            // Visual feedback
            applyFiltersBtn.style.opacity = '0.7';
            applyFiltersBtn.textContent = 'Searching...';
            setTimeout(() => {
                applyFiltersBtn.style.opacity = '1';
                applyFiltersBtn.textContent = 'Browse';
            }, 400);
        });
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            // Toggle Nav
            navLinks.classList.toggle('nav-active');
            
            // Burger Animation
            hamburger.classList.toggle('toggle');
        });
    }

    // Handle URL parameters for filters
    const urlParams = new URLSearchParams(window.location.search);
    const paramLocation = urlParams.get('location');
    const paramType = urlParams.get('type');

    if (paramLocation || paramType) {
        if (paramLocation) {
            const locEl = document.getElementById('location-filter');
            if (locEl) locEl.value = paramLocation;
        }
        if (paramType) {
            const typeEl = document.getElementById('type-filter');
            if (typeEl) typeEl.value = paramType;
        }
        
        // Auto trigger click
        setTimeout(() => {
            if (applyFiltersBtn) applyFiltersBtn.click();
        }, 100);
    }
    function initScrollObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Handle mask-reveal children
                    const masks = entry.target.querySelectorAll('.mask-reveal-content');
                    masks.forEach((mask, i) => {
                        setTimeout(() => mask.classList.add('active'), i * 150);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-on-scroll, .mask-reveal').forEach(el => {
            observer.observe(el);
        });
    }

    // Magnetic Buttons Effect
    document.querySelectorAll('.contact-btn, .btn-browse-action, .btn-submit').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const position = btn.getBoundingClientRect();
            const x = e.pageX - position.left - position.width / 2;
            const y = e.pageY - position.top - position.height / 2;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    initScrollObserver();
});

/* ==========================================================================
   TOUCH & CLICK ANALYTICS ENGINE + VISUAL FEEDBACK TRACKER
   ========================================================================== */
(function() {
    let eventBuffer = [];
    let lastTapTime = 0;
    let lastTapTarget = null;

    function buildSelector(el) {
        if (!el || el === document.body) return 'body';
        if (el.id) return '#' + el.id;
        if (el.className && typeof el.className === 'string' && el.className.trim()) {
            return '.' + el.className.trim().split(/\s+/).join('.');
        }
        return el.tagName.toLowerCase();
    }

    function isInteractive(el) {
        if (!el) return false;
        const tag = el.tagName.toLowerCase();
        if (['a', 'button', 'input', 'select', 'textarea'].includes(tag)) return true;
        if (el.onclick || el.getAttribute('onclick') || el.getAttribute('role') === 'button') return true;
        if (el.closest('a, button, [onclick], .pd-spec, .pd-amenity-card, .pd-doc-card, .property-card, .btn-primary, .btn-outline')) return true;
        return false;
    }

    function createTouchRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            left: ${x - 15}px;
            top: ${y - 15}px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: rgba(124, 58, 237, 0.35);
            border: 2px solid rgba(196, 181, 253, 0.9);
            pointer-events: none;
            z-index: 999999;
            transform: scale(0.5);
            opacity: 1;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out;
        `;
        document.body.appendChild(ripple);
        requestAnimationFrame(() => {
            ripple.style.transform = 'scale(2.2)';
            ripple.style.opacity = '0';
        });
        setTimeout(() => ripple.remove(), 450);
    }

    function trackInteraction(e) {
        const isTouch = e.type === 'touchstart';
        const point = isTouch ? (e.touches[0] || e.changedTouches[0]) : e;
        if (!point) return;

        const x = point.clientX;
        const y = point.clientY;
        const pageY = window.scrollY + y;
        const xPercent = Math.round((x / window.innerWidth) * 100);

        const target = e.target;
        const interactive = isInteractive(target);
        
        // Detect dead clicks (rapid double/triple tap on non-interactive element)
        const now = Date.now();
        const isDead = !interactive && (now - lastTapTime < 500) && (lastTapTarget === target);
        lastTapTime = now;
        lastTapTarget = target;

        // Visual feedback ripple
        createTouchRipple(x, pageY);

        const eventData = {
            pageUrl: window.location.pathname || '/',
            elementTag: target.tagName.toLowerCase(),
            elementId: target.id || '',
            elementSelector: buildSelector(target),
            elementText: (target.innerText || target.value || '').trim().substring(0, 40),
            clickXPercent: xPercent,
            clickYPage: Math.round(pageY),
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            deviceType: isTouch ? 'Mobile Touch' : 'Desktop Mouse',
            isTouchDevice: isTouch || ('ontouchstart' in window),
            isDeadClick: isDead,
            timestamp: new Date().toISOString()
        };

        eventBuffer.push(eventData);

        // Store locally for admin heatmap rendering
        try {
            const localEvents = JSON.parse(localStorage.getItem('kimi_analytics_events') || '[]');
            localEvents.push(eventData);
            if (localEvents.length > 500) localEvents.shift();
            localStorage.setItem('kimi_analytics_events', JSON.stringify(localEvents));
        } catch(err) {}

        // Real-time parent window communication (if running inside admin heatmap iframe)
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'KIMI_TOUCH_EVENT', eventData }, '*');
            }
        } catch(err) {}

        flushBuffer();
    }

    async function flushBuffer() {
        if (eventBuffer.length === 0) return;
        const payload = [...eventBuffer];
        eventBuffer = [];
        try {
            await fetch('/api/analytics/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: payload })
            });
        } catch(e) {}
    }

    window.addEventListener('touchstart', trackInteraction, { passive: true });
    window.addEventListener('mousedown', trackInteraction, { passive: true });
    setInterval(flushBuffer, 3000);
})();


