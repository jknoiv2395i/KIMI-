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

                let matchLocation = (locationValue === 'all' || locationValue === cardLocation);
                let matchType = (typeValue === 'all' || typeValue === cardType);

                if (matchLocation && matchType) {
                    card.style.display = 'block';
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
});


