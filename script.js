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

    // Default Data for Fallback
    const defaultContent = {
        hero: { title: "We help people to realize their dream property", subtitle: "We are creative people who provide the best way to you who want to have a new comfortable and suitable place to live" },
        contact: { phone: "+91 96969 76950", email: "hello@kimiproperties.in", address: "Nagpur, Maharashtra, India" },
        locations: ["Nagpur", "Mumbai", "Pune"],
        categories: ["Residential (Purchase)", "Residential Rental", "Commercial (Purchase)", "Commercial Rental", "Industrial"],
        properties: [
            { id: "prop-1", name: "Riverbend Retreat", price: "$4,299", address: "3 Leame Close, Hull, HU3 6ND", location: "Mumbai", category: "Residential (Purchase)", status: "Ready to Move", transactionType: "New", area: "7x7 m²", image: "assets/property-1.png", isFeatured: true, description: "Experience the epitome of luxury living at Riverbend Retreat. This stunning residential masterpiece combines modern architecture with serene natural surroundings.", beds: 3, baths: 2 },
            { id: "prop-2", name: "Oakwood Cottage", price: "$2,095", address: "2699 Green Valley, Highland Lake, FL", location: "Pune", category: "Residential Rental", status: "Under Construction", transactionType: "Resale", area: "6x8 m²", image: "assets/property-2.png", isFeatured: true, description: "Perfect for families or those seeking a peaceful escape without compromising on urban convenience.", beds: 2, baths: 1 },
            { id: "prop-3", name: "Herringbone Realty", price: "$5,099", address: "28B Highgate Road, London, NW5 1NS", location: "Nagpur", category: "Commercial (Purchase)", status: "Ready to Move", transactionType: "New", area: "7x7 m²", image: "assets/property-3.png", isFeatured: true, description: "Located in the heart of Hull, with easy access to premium amenities and schools.", beds: 4, baths: 2 }
        ]
    };

    // Fetch Data for Frontend
    async function fetchFrontendData() {
        let content = null;
        try {
            const res = await fetch('/api/content');
            if (res.ok) {
                content = await res.json();
            }
        } catch (e) {
            // Fallback
        }

        if (!content) {
            const localData = localStorage.getItem('kimi_content');
            if (localData) {
                content = JSON.parse(localData);
            }
        }

        // Final Fallback to defaults if still no content
        if (!content) {
            content = defaultContent;
        }

        if (content) {
            // Populate Location Dropdowns
            const heroLocation = document.getElementById('hero-location');
            const propLocation = document.getElementById('location-filter');
            
            if (content.locations && content.locations.length > 0) {
                const locOptions = `<option value="all">Any Location</option>` + 
                                  content.locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
                if (heroLocation) heroLocation.innerHTML = locOptions;
                if (propLocation) propLocation.innerHTML = locOptions;
            }

            // Populate Category/Type Dropdowns
            const heroType = document.getElementById('hero-type');
            const typeFilter = document.getElementById('type-filter');
            
            if (content.categories && content.categories.length > 0) {
                const catOptions = `<option value="all">All Types</option>` + 
                                  content.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
                if (heroType) heroType.innerHTML = catOptions;
                if (typeFilter) typeFilter.innerHTML = catOptions;
            }

            // Update Footer & Contact Page
            if (content.contact) {
                // Update Footer
                const footerContact = document.querySelector('.footer-col .footer-links:last-child');
                if (footerContact) {
                    const paragraphs = footerContact.querySelectorAll('p');
                    if (paragraphs.length >= 3) {
                        paragraphs[0].innerText = content.contact.address || 'Nagpur, India';
                        paragraphs[1].innerText = content.contact.phone || '+91 96969 76950';
                        paragraphs[2].innerText = content.contact.email || 'hello@kimiproperties.in';
                    }
                }

                // Update Contact Page Fields
                const cpAddr = document.getElementById('contact-page-address');
                const cpPhone = document.getElementById('contact-page-phone');
                const cpEmail = document.getElementById('contact-page-email');
                if (cpAddr) cpAddr.innerText = content.contact.address || 'Nagpur, Maharashtra, India';
                if (cpPhone) cpPhone.innerText = content.contact.phone || '+91 96969 76950';
                if (cpEmail) cpEmail.innerText = content.contact.email || 'hello@kimiproperties.in';
            }

            // Populate Properties Grid
            const grid = document.getElementById('properties-grid');
            if (grid && content.properties) {
                const path = window.location.pathname;
                const isHomePage = path.endsWith('index.html') || path.endsWith('/') || path === '' || path.split('/').pop() === '';
                
                let allProps = isHomePage 
                    ? content.properties.filter(p => p.isFeatured) 
                    : content.properties;

                let itemsPerPage = 12;
                let currentPage = 1;

                const renderGrid = (page) => {
                    const end = page * itemsPerPage;
                    const propsToShow = allProps.slice(0, end);
                    
                    grid.innerHTML = propsToShow.map(prop => `
                        <div class="property-card" onclick="window.location.href='/property-detail?id=${prop._id || prop.id}'" style="cursor: pointer;" data-location="${prop.location || 'all'}" data-type="${prop.category}">
                            <div class="card-image">
                                <img src="${prop.image || 'assets/hero-illustration.png'}" alt="${prop.name}">
                                ${prop.isFeatured ? '<span class="featured-tag">✦ FEATURED</span>' : ''}
                            </div>
                            <div class="card-content">
                                <p class="price">${prop.price}<span>${prop.priceUnit || ''}</span></p>
                                <h3 class="property-name">${prop.name}</h3>
                                <p class="address">${prop.address} ${prop.location ? '(' + prop.location + ')' : ''}</p>
                                <div class="specs">
                                    ${prop.beds ? `<span><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8'/%3E%3Cpath d='M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4'/%3E%3Cpath d='M12 4v6'/%3E%3Cpath d='M2 18h20'/%3E%3C/svg%3E" alt="Bed"> ${prop.beds} Beds</span>` : ''}
                                    ${prop.baths ? `<span><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 6 6.5 3.5a1.5 1.5 0 0 0-2.12 0l-1.88 1.88a1.5 1.5 0 0 0 0 2.12L5 10'/%3E%3Cpath d='M10 5l10 10'/%3E%3Cpath d='M3 17l1 1a2 2 0 0 0 2.83 0L21 4'/%3E%3C/svg%3E" alt="Bath"> ${prop.baths} Baths</span>` : ''}
                                    ${prop.area ? `<span><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Cpath d='M3 9h18'/%3E%3Cpath d='M3 15h18'/%3E%3Cpath d='M9 3v18'/%3E%3Cpath d='M15 3v18'/%3E%3C/svg%3E" alt="Area"> ${prop.area}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('');

                    // Add Load More button if there are more items
                    if (allProps.length > end) {
                        const loadMoreBtn = document.createElement('button');
                        loadMoreBtn.innerText = 'Load More Properties';
                        loadMoreBtn.className = 'btn-browse-action';
                        loadMoreBtn.style.gridColumn = '1 / -1';
                        loadMoreBtn.style.margin = '40px auto';
                        loadMoreBtn.onclick = () => {
                            currentPage++;
                            renderGrid(currentPage);
                        };
                        grid.appendChild(loadMoreBtn);
                    }

                    // Update result count
                    const resultCountSpan = document.getElementById('result-count');
                    if (resultCountSpan && !isHomePage) {
                        resultCountSpan.textContent = allProps.length;
                    }
                };

                renderGrid(currentPage);
            }

            // Populate Individual Property Details (if on detail page)
            if (window.location.pathname.includes('property-detail.html')) {
                const urlParams = new URLSearchParams(window.location.search);
                const propId = urlParams.get('id');
                if (propId && content.properties) {
                    const prop = content.properties.find(p => (p._id || p.id) === propId);
                    if (prop) {
                        // Update basic info
                        const titleEl = document.querySelector('.property-detail-header h1');
                        const priceEl = document.querySelector('.detail-price strong');
                        const addrEl = document.querySelector('.detail-address');
                        const breadcrumbSpan = document.querySelector('.breadcrumb span');
                        
                        if (titleEl) titleEl.innerText = prop.name;
                        if (priceEl) priceEl.innerText = prop.price;
                        if (addrEl) addrEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${prop.address} ${prop.location ? '(' + prop.location + ')' : ''}`;
                        if (breadcrumbSpan) breadcrumbSpan.innerText = prop.name;

                        // Update gallery
                        const mainImg = document.querySelector('.main-image img');
                        if (mainImg && prop.image) mainImg.src = prop.image;

                        // Update specs
                        const specs = document.querySelectorAll('.spec-value');
                        if (specs.length >= 4) {
                            specs[0].innerText = (prop.beds || '3') + ' Beds';
                            specs[1].innerText = (prop.baths || '2') + ' Baths';
                            specs[2].innerText = prop.area || 'N/A';
                            specs[3].innerText = prop.category || 'Residential';
                        }

                        // Update description
                        const descEl = document.querySelector('.description-box p');
                        if (descEl && prop.description) descEl.innerText = prop.description;
                    }
                }
            }
        }
    }

    // Call the function
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

                let matchLocation = (locationValue === 'all' || locationValue === cardLocation);
                let matchType = (typeValue === 'all' || typeValue === cardType);

                if (matchLocation && matchType) {
                    card.style.display = 'flex'; // Use flex for the cards as per CSS (or row for mobile)
                    if(window.innerWidth > 768) {
                        card.style.display = 'flex';
                    }
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


