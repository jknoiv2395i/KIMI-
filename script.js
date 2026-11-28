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

            if (typeof gsap !== 'undefined') {
                gsap.to(container, {
                    scrollLeft: targetScroll,
                    duration: 1.2,
                    ease: "power4.out",
                    overwrite: true
                });
            } else {
                container.scrollTo({ left: targetScroll, behavior: 'smooth' });
            }
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


    // Initialize Lenis Smooth Scroll & GSAP Safely
    if (typeof Lenis !== 'undefined' && typeof gsap !== 'undefined') {
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

        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.registerPlugin(ScrollTrigger);

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

            gsap.to(".priority-bg img", {
                y: -100,
                scrollTrigger: {
                    trigger: ".priority-section",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });

            window.addEventListener('load', () => {
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 500);
            });
        }

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }

    // 1. DATA INFRASTRUCTURE
    const KH = window.KimiHelpers || {};
    function buildListingSlug(prop) {
        if (typeof KH.slugifyProperty === 'function') return KH.slugifyProperty(prop);
        const id = String(prop._id || prop.id || '').trim();
        const base = String(prop.name || 'property')
            .toLowerCase()
            .replace(/[^\x00-\x7F]/g, ' ')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 60)
            .replace(/-+$/g, '') || 'property';
        return `${base}-${id}`;
    }

    const defaultContent = {
        hero: { title: "Trusted Properties in Nagpur", subtitle: "Verified MIDC sheds, warehouses, flats, and 7/12 agricultural land across Butibori, Hingna, and Wardha Road" },
        contact: { phone: "+91 96969 76950", email: "propkimi@gmail.com", address: "Nagpur, Maharashtra, India", facebook: "https://www.facebook.com/people/KIMI-Properties/61590282696335/", instagram: "https://www.instagram.com/_kimiproperties.in?igsh=MW41ZnJrcGRwdHQycA==" },
        locations: ["Butibori MIDC", "Hingna MIDC", "Wadi MIDC", "Wardha Road", "Manish Nagar", "Wanadongri", "Nagpur"],
        categories: ["Residential (Purchase)", "Residential Rental", "Commercial (Purchase)", "Commercial Rental", "Industrial", "Plots", "Agricultural Land"],
        properties: [
            { id: "prop-1", name: "Verified Industrial Godown & Shed", price: "₹62 Lakh", address: "Butibori MIDC, Nagpur", location: "Butibori MIDC", category: "Industrial", status: "Ready to Move", transactionType: "New", area: "6,000 Sq.Ft", image: "/assets/property-1.webp", isFeatured: true, description: "Ready industrial shed with clear MIDC title and wide container access road." },
            { id: "prop-2", name: "2 BHK Resale Flat Near Wardha Road", price: "₹53 Lakh", address: "Manish Nagar, Nagpur", location: "Manish Nagar", category: "Residential (Purchase)", status: "Ready to Move", transactionType: "Resale", area: "1,050 Sq.Ft", image: "/assets/property-2.webp", isFeatured: true, description: "Well-maintained residential flat in Manish Nagar with lift and parking.", beds: 2, baths: 2 },
            { id: "prop-3", name: "Commercial & Agricultural Plot Opportunity", price: "₹85 Lakh", address: "Butibori Umred Road, Nagpur", location: "Butibori MIDC", category: "Agricultural Land", status: "Ready Possession", transactionType: "New", area: "5 Acre", image: "/assets/property-3.webp", isFeatured: true, description: "Road-touch parcel with clear 7/12 extract and immediate access." }
        ]
    };

    // Universal Content Population Function
    function populatePageContent(content) {
        if (!content) return;
        console.log("populatePageContent: called with properties count =", content.properties ? content.properties.length : 0);

        // Update Social Links Dynamically
        if (content.contact) {
            if (content.contact.facebook) {
                document.querySelectorAll('.social-links a[title="Facebook"]').forEach(a => {
                    a.href = content.contact.facebook;
                });
            }
            if (content.contact.instagram) {
                document.querySelectorAll('.social-links a[title="Instagram"]').forEach(a => {
                    a.href = content.contact.instagram;
                });
            }
        }

        // Populate Location Dropdowns from true resolved Nagpur corridors
        const heroLocation = document.getElementById('hero-location');
        const propLocation = document.getElementById('location-filter');
        
        let dynamicLocations = [];
        if (content.properties && content.properties.length > 0) {
            const propLocs = content.properties
                .map(p => (typeof KH.resolveNagpurLocality === 'function' ? KH.resolveNagpurLocality(p) : p.location))
                .filter(Boolean);
            dynamicLocations = [...new Set(propLocs)].sort();
        } else if (content.locations && content.locations.length > 0) {
            dynamicLocations = content.locations;
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
            let allProps = isHomePage 
                ? [...content.properties.filter(p => p.isFeatured), ...content.properties.filter(p => !p.isFeatured)]
                : content.properties;
            let itemsPerPage = isHomePage ? 12 : 48;
            let currentPage = 1;

            const renderGrid = (page) => {
                const end = page * itemsPerPage;
                const propsToShow = allProps.slice(0, end);
                const gridHTML = propsToShow.map(prop => {
                    if (typeof KH.renderPropertyCardHTML === 'function') {
                        return KH.renderPropertyCardHTML(prop);
                    }
                    const propId = prop._id || prop.id || '';
                    const detailHref = `/listings/${buildListingSlug(prop)}`;
                    const imgSrc = (prop.images && prop.images[0]) || prop.image || '/assets/property-1.webp';
                    return `<div class="property-card" onclick="window.location.href='${detailHref}'" data-location="${prop.location || 'all'}" data-type="${prop.category || ''}" data-purpose="${prop.purpose || 'Buy'}" data-transaction="${prop.transactionType || 'New'}" data-status="${prop.status || ''}"><div class="card-image-box"><img src="${imgSrc}" alt="${(prop.name || 'Nagpur Property').replace(/"/g, '&quot;')}" width="400" height="250" loading="lazy" decoding="async"></div><div class="card-body"><h3 class="card-title">${prop.name || ''}</h3></div></div>`;
                }).join('');

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
                const rcEl = document.getElementById('result-count');
                if (rcEl) rcEl.textContent = propsToShow.length;
                if (typeof filterProperties === 'function') filterProperties();
                initScrollObserver();
            };
            renderGrid(currentPage);
        }

        // Populate Individual Details
        if (window.location.pathname.includes('property-detail')) {
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
        const hasSSR = document.querySelector('#properties-grid .property-card') !== null;
        // Step A: Preserve SSR cards if already baked in, or hydrate from localStorage cache
        const cached = localStorage.getItem('kimi_content');
        if (cached) {
            try {
                populatePageContent(JSON.parse(cached));
            } catch (e) {
                if (!hasSSR) populatePageContent(defaultContent);
            }
        } else if (!hasSSR) {
            populatePageContent(defaultContent);
        } else {
            // Even with SSR, sync filter dropdown options smoothly from defaults until API returns
            const heroLocation = document.getElementById('hero-location');
            const propLocation = document.getElementById('location-filter');
            if ((heroLocation || propLocation) && defaultContent.locations.length > 0) {
                const locOptions = `<option value="all">Any Location</option>` + defaultContent.locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
                if (heroLocation) heroLocation.innerHTML = locOptions;
                if (propLocation) propLocation.innerHTML = locOptions;
            }
        }

        function getApiUrl(path) {
            if (!path.startsWith('/')) path = '/' + path;
            const isLocalDev = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' || 
                               window.location.hostname === '';
            const isFileProtocol = window.location.protocol === 'file:';
            const isDifferentPort = window.location.port && window.location.port !== '3001';
            
            if (isFileProtocol || (isLocalDev && isDifferentPort)) {
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

    // Property Category Sub-Sections & Filter Logic
    const applyFiltersBtn = document.getElementById('apply-filters');
    const propertiesGrid = document.getElementById('properties-grid');
    const resultCountSpan = document.getElementById('result-count');
    const categoryTabBtns = document.querySelectorAll('.cat-tab-btn');
    const conditionPillBtns = document.querySelectorAll('.condition-pill-btn');

    let activeCategory = 'all';
    let activeCondition = 'all';

    function filterProperties() {
        if (!propertiesGrid) return;
        const locationSelect = document.getElementById('location-filter');
        const typeSelect = document.getElementById('type-filter');

        const locationValue = locationSelect ? locationSelect.value : 'all';
        const typeValue = typeSelect ? typeSelect.value : 'all';
        
        const cards = propertiesGrid.querySelectorAll('.property-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const cardLocation = card.getAttribute('data-location') || '';
            const cardType = card.getAttribute('data-type') || '';
            const cardTx = card.getAttribute('data-transaction') || 'New';
            const cardStatus = card.getAttribute('data-status') || '';

            // Match Location
            let matchLocation = (!locationValue || locationValue === 'all' || cardLocation === 'all' || locationValue === cardLocation || cardLocation.includes(locationValue));
            
            // Match Dropdown Type
            let matchDropdownType = (!typeValue || typeValue === 'all' || cardType === 'all' || typeValue === cardType || cardType.includes(typeValue) || typeValue.includes(cardType));

            // Match Category Tab (Residential, Commercial, Industrial, Agricultural)
            let matchCategoryTab = true;
            if (activeCategory && activeCategory !== 'all') {
                const searchCat = activeCategory.toLowerCase();
                const itemCat = cardType.toLowerCase();
                matchCategoryTab = itemCat.includes(searchCat);
            }

            // Match Condition Tab (New vs Resale)
            let matchConditionTab = true;
            if (activeCondition && activeCondition !== 'all') {
                if (activeCondition === 'New') {
                    matchConditionTab = (cardTx === 'New' || cardStatus === 'Ready to Move' || !cardTx.toLowerCase().includes('resale'));
                } else if (activeCondition === 'Resale') {
                    matchConditionTab = (cardTx === 'Resale' || cardTx === 'Old' || cardStatus === 'Under Construction' || cardTx.toLowerCase().includes('resale'));
                }
            }

            if (matchLocation && matchDropdownType && matchCategoryTab && matchConditionTab) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (resultCountSpan) {
            resultCountSpan.textContent = visibleCount;
        }
    }

    // Category Tab Button Click Handlers
    if (categoryTabBtns.length > 0) {
        categoryTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category') || 'all';

                // Sync Type Dropdown if matching option exists
                const typeSelect = document.getElementById('type-filter');
                if (typeSelect && activeCategory !== 'all') {
                    const matchOption = Array.from(typeSelect.options).find(opt => opt.value.toLowerCase().includes(activeCategory.toLowerCase()));
                    if (matchOption) typeSelect.value = matchOption.value;
                } else if (typeSelect && activeCategory === 'all') {
                    typeSelect.value = 'all';
                }

                filterProperties();

                if (window.history.pushState) {
                    const newUrl = window.location.pathname + (activeCategory !== 'all' ? '?category=' + encodeURIComponent(activeCategory) : '');
                    window.history.pushState({ path: newUrl }, '', newUrl);
                }
            });
        });
    }

    // Condition Pill Button Click Handlers (New vs Resale)
    if (conditionPillBtns.length > 0) {
        conditionPillBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                conditionPillBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCondition = btn.getAttribute('data-condition') || 'all';
                filterProperties();
            });
        });
    }

    if (applyFiltersBtn && propertiesGrid) {
        applyFiltersBtn.addEventListener('click', () => {
            filterProperties();
            
            // Visual feedback
            applyFiltersBtn.style.opacity = '0.7';
            applyFiltersBtn.textContent = 'Searching...';
            setTimeout(() => {
                applyFiltersBtn.style.opacity = '1';
                applyFiltersBtn.textContent = 'Browse Property';
            }, 400);
        });
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }

    // Handle URL parameters for category & filters
    const urlParams = new URLSearchParams(window.location.search);
    const paramLocation = urlParams.get('location');
    const paramType = urlParams.get('type');
    const paramCategory = urlParams.get('category');

    if (paramLocation || paramType || paramCategory) {
        if (paramLocation) {
            const locEl = document.getElementById('location-filter');
            if (locEl) locEl.value = paramLocation;
        }
        if (paramType) {
            const typeEl = document.getElementById('type-filter');
            if (typeEl) typeEl.value = paramType;
        }

        const targetCat = paramCategory || paramType;
        if (targetCat) {
            categoryTabBtns.forEach(btn => {
                const catVal = btn.getAttribute('data-category');
                if (catVal && targetCat.toLowerCase().includes(catVal.toLowerCase())) {
                    categoryTabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeCategory = catVal;
                }
            });
        }

        setTimeout(filterProperties, 150);
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
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            
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

// Free Property Valuation Lead Handler
window.handleValuationSubmit = function(event) {
    event.preventDefault();
    const nameEl = document.getElementById('val-name');
    const phoneEl = document.getElementById('val-phone');
    const locEl = document.getElementById('val-location');
    const form = document.getElementById('valuation-form');
    const successMsg = document.getElementById('valuation-success-msg');

    if (!nameEl || !phoneEl || !locEl) return;

    const leadData = {
        id: 'val-' + Date.now(),
        type: 'Free Property Valuation Request',
        name: nameEl.value.trim(),
        phone: phoneEl.value.trim(),
        location: locEl.value.trim(),
        timestamp: new Date().toISOString()
    };

    // Store lead locally for Admin Panel inspection
    try {
        const leads = JSON.parse(localStorage.getItem('kimi_valuation_leads') || '[]');
        leads.unshift(leadData);
        localStorage.setItem('kimi_valuation_leads', JSON.stringify(leads));
    } catch(err) {}

    // Post event to backend API and dispatch lead
    fetch(getApiUrl('/api/contact/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: leadData.name,
            phone: leadData.phone,
            requirement: 'Free Property Valuation in ' + leadData.location,
            location: leadData.location,
            type: 'Valuation Lead'
        })
    }).catch(err => console.log('Lead dispatch locally buffered'));

    fetch(getApiUrl('/api/analytics/events'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'valuation_lead', leadData })
    }).catch(err => console.log('Lead saved locally'));

    // Google Analytics 4 - Conversion Event Tracking
    if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
            event_category: 'Leads',
            event_label: 'Free Property Valuation - ' + (locEl.value.trim() || 'Nagpur'),
            value: 1,
            currency: 'INR',
            transport_type: 'beacon'
        });
        gtag('event', 'contact', {
            event_category: 'Leads',
            event_label: 'Free Property Valuation Form',
            method: 'valuation_form',
            transport_type: 'beacon'
        });
    }

    if (form) form.style.display = 'none';
    if (successMsg) successMsg.style.display = 'block';
};

// Track Property Card Click in GA4
window.trackPropertyClick = function(id, name) {
    if (typeof gtag === 'function') {
        gtag('event', 'select_item', {
            item_list_name: 'Property Listings',
            items: [{
                item_id: id,
                item_name: name
            }],
            transport_type: 'beacon'
        });
    }
};

// WhatsApp Contact Form Lead Handler
window.handleContactSubmit = function(event) {
    event.preventDefault();
    const fnameEl = document.getElementById('contact-fname');
    const lnameEl = document.getElementById('contact-lname');
    const phoneEl = document.getElementById('contact-phone');
    const emailEl = document.getElementById('contact-email');
    const msgEl = document.getElementById('contact-message');

    if (!fnameEl || !phoneEl || !msgEl) return;

    const fname = fnameEl.value.trim();
    const lname = lnameEl ? lnameEl.value.trim() : '';
    const phone = phoneEl.value.trim();
    const email = emailEl ? emailEl.value.trim() : '';
    const message = msgEl.value.trim();

    // Format message layout nicely
    const waMessage = `*New Contact Inquiry on KIMI Properties*\n\n` +
                      `*Name:* ${fname} ${lname}\n` +
                      `*Phone:* ${phone}\n` +
                      `*Email:* ${email || 'Not provided'}\n\n` +
                      `*Message:* ${message}`;

    const encodedMsg = encodeURIComponent(waMessage);
    const waUrl = `https://wa.me/919696976950?text=${encodedMsg}`;

    // Dispatch lead to backend CRM endpoint
    fetch(getApiUrl('/api/contact/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: `${fname} ${lname}`.trim(),
            phone: phone,
            email: email,
            requirement: message,
            type: 'Contact Form Inquiry'
        })
    }).catch(err => console.log('Contact dispatch locally buffered'));

    // Google Analytics 4 - Conversion Event Tracking
    if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
            event_category: 'Contact Form',
            event_label: 'WhatsApp Contact Inquiry',
            value: 1,
            currency: 'INR',
            transport_type: 'beacon'
        });
        gtag('event', 'contact', {
            event_category: 'Contact Form',
            event_label: 'WhatsApp Contact Form Submit',
            method: 'whatsapp',
            transport_type: 'beacon'
        });
    }

    // Clear the form inputs
    event.target.reset();

    // Open WhatsApp URL
    window.open(waUrl, '_blank');
};

// Auto-track WhatsApp & Phone Call conversions in Google Analytics
document.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    if (!target) return;
    const href = target.getAttribute('href') || '';
    if (typeof gtag === 'function') {
        if (href.startsWith('tel:')) {
            gtag('event', 'contact', {
                event_category: 'Lead Engagement',
                event_label: 'Phone Call: ' + href.replace('tel:', ''),
                method: 'phone',
                transport_type: 'beacon'
            });
            gtag('event', 'generate_lead', {
                event_category: 'Lead Engagement',
                event_label: 'Phone Call Click',
                method: 'phone',
                value: 1,
                currency: 'INR',
                transport_type: 'beacon'
            });
        } else if (href.includes('wa.me') || href.includes('whatsapp.com')) {
            gtag('event', 'generate_lead', {
                event_category: 'Lead Engagement',
                event_label: 'WhatsApp Chat Click',
                method: 'whatsapp',
                value: 1,
                currency: 'INR',
                transport_type: 'beacon'
            });
            gtag('event', 'contact', {
                event_category: 'Lead Engagement',
                event_label: 'WhatsApp Chat Initiated',
                method: 'whatsapp',
                transport_type: 'beacon'
            });
        }
    }
}, { passive: true });


