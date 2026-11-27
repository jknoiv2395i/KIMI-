/**
 * Shared SSR & Pre-render HTML helper for KIMI Properties.
 * Used by both server.js (live Express SSR) and scripts/prerender.js (Vercel static SSR).
 */

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function slugifyProperty(prop) {
    const id = String((prop && (prop._id || prop.id)) || '').trim();
    const base = String((prop && prop.name) || 'property')
        .toLowerCase()
        .replace(/[^\x00-\x7F]/g, ' ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60)
        .replace(/-+$/g, '') || 'property';
    return id ? `${base}-${id}` : base;
}

function formatPrice(price) {
    if (!price) return '';
    const str = String(price);
    const num = str.replace(/,/g, '');
    if (!isNaN(num) && num.trim() !== '') {
        return '₹' + Number(num).toLocaleString('en-IN');
    }
    return str.includes('₹') ? str : '₹' + str;
}

function normalizeImageFallback(url) {
    if (!url || typeof url !== 'string') return '/assets/property-1.webp';
    const trimmed = url.trim();
    if (/^assets\/property-([1-6])\.(png|jpg|jpeg)$/i.test(trimmed)) {
        return '/' + trimmed.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    }
    if (trimmed === 'assets/hero-illustration.png') return '/assets/property-1.webp';
    if (!trimmed.startsWith('http') && !trimmed.startsWith('/') && !trimmed.startsWith('data:')) {
        return '/' + trimmed;
    }
    return trimmed;
}

function renderPropertyCardHTML(prop) {
    const propId = String(prop._id || prop.id || '');
    const slugUrl = `/listings/${slugifyProperty(prop)}`;
    const phone = String(prop.ownerPhone || '+919696976950').replace(/\s+/g, '');
    const waNum = String(prop.ownerWhatsapp || prop.ownerPhone || '919696976950').replace(/[^0-9]/g, '') || '919696976950';
    const waMsg = encodeURIComponent(
        `Hello KIMI Properties! I am interested in details and site visit for: "${prop.name || 'Property'}" in ${prop.location || 'Nagpur'}. Please share price and inspection schedule.`
    );

    const isRentProp = prop.purpose === 'Rent' ||
        (prop.category && prop.category.toLowerCase().includes('rental')) ||
        prop.transactionType === 'Rental';

    const locLower = String(prop.location || prop.address || '').toLowerCase();
    const catLower = String(prop.category || '').toLowerCase();

    let badgeTopRight = 'Ready Possession';
    if (locLower.includes('midc')) {
        badgeTopRight = 'MIDC Allotted';
    } else if (catLower.includes('agri') || locLower.includes('agri')) {
        badgeTopRight = '7/12 Clear';
    } else if (prop.transactionType === 'Resale' || prop.transactionType === 'Old') {
        badgeTopRight = 'Clear Title';
    } else if (prop.highlights && prop.highlights.length > 0) {
        badgeTopRight = prop.highlights[0];
    }

    let priceStatusTag = '';
    if (prop.isSoldOut) {
        priceStatusTag = '<span class="price-note note-sold">Sold Out</span>';
    } else if (prop.isNegotiable !== false) {
        priceStatusTag = '<span class="price-note note-neg">Negotiable</span>';
    } else {
        priceStatusTag = '<span class="price-note note-fixed">Fixed Price</span>';
    }

    let categoryShort = String(prop.category || 'Commercial');
    if (categoryShort.includes('(')) categoryShort = categoryShort.split('(')[0].trim();

    let spec3Label = 'Type';
    let spec3Val = prop.transactionType || 'Resale';
    if (prop.beds) {
        spec3Label = 'Layout';
        spec3Val = `${prop.beds} BHK`;
    } else if (prop.clearHeight) {
        spec3Label = 'Clear Height';
        spec3Val = prop.clearHeight;
    } else if (catLower.includes('agri')) {
        spec3Label = 'Zone';
        spec3Val = 'Agricultural';
    } else if (catLower.includes('indust')) {
        spec3Label = 'Type';
        spec3Val = 'Industrial Shed';
    }

    const photosCount = (Array.isArray(prop.images) && prop.images.length) || 4;
    const rawImg = (Array.isArray(prop.images) && prop.images[0]) || prop.image || '/assets/property-1.webp';
    const imgSrc = normalizeImageFallback(rawImg);
    const safeNameAttr = escapeHtml(prop.name || 'Nagpur Property');
    const safeNameJs = String(prop.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeLoc = escapeHtml(prop.location || 'Nagpur');
    const safeAddr = escapeHtml(prop.address || prop.location || 'Nagpur');

    return `<div class="property-card" onclick="if(typeof trackPropertyClick==='function'){trackPropertyClick('${escapeHtml(propId)}','${safeNameJs}');} window.location.href='${slugUrl}'" data-location="${safeLoc}" data-type="${escapeHtml(prop.category || '')}" data-purpose="${isRentProp ? 'Rent' : 'Buy'}" data-transaction="${escapeHtml(prop.transactionType || 'New')}" data-status="${escapeHtml(prop.status || '')}">
    <div class="card-image-box">
        <img src="${escapeHtml(imgSrc)}" alt="${safeNameAttr} in ${safeLoc}" width="400" height="250" loading="lazy" decoding="async">
        <div class="badge-top-left">
            <span class="dot-indicator"></span>
            ${isRentProp ? 'For Rent' : 'For Sale'}
        </div>
        <div class="badge-top-right">${escapeHtml(badgeTopRight)}</div>
        <div class="img-bottom-overlay">
            <div class="photo-count-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <span>${photosCount} Photos</span>
            </div>
        </div>
    </div>
    <div class="card-body">
        <div class="price-row">
            <span class="price-val">${escapeHtml(formatPrice(prop.price))}<span class="price-unit">${escapeHtml(prop.priceUnit || '')}</span></span>
            ${priceStatusTag}
        </div>
        <h3 class="card-title">${escapeHtml(prop.name || '')}</h3>
        <div class="card-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${safeAddr}</span>
        </div>
        <div class="specs-pill-grid">
            <div class="spec-chip">
                <span class="spec-label">Area</span>
                <span class="spec-val">${escapeHtml(prop.area || 'On Request')}</span>
            </div>
            <div class="spec-chip">
                <span class="spec-label">Category</span>
                <span class="spec-val">${escapeHtml(categoryShort)}</span>
            </div>
            <div class="spec-chip">
                <span class="spec-label">${escapeHtml(spec3Label)}</span>
                <span class="spec-val">${escapeHtml(spec3Val)}</span>
            </div>
        </div>
        <div class="actions-bar" onclick="event.stopPropagation()">
            <a href="${slugUrl}" class="btn-primary-view">
                <span>View Details</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <a href="https://wa.me/${escapeHtml(waNum)}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="btn-wa-direct" title="Instant WhatsApp" aria-label="Chat on WhatsApp about ${safeNameAttr}">
                <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l114.1-29.9c32.7 17.8 69.4 27.2 107.4 27.2h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.3-16.3-14.5-27.3-32.5-30.5-37.9-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.3 4.6-13 4.6-24.1 3.2-26.3-1.4-2.2-5-3.5-10.5-6.3z"/></svg>
            </a>
            <a href="tel:${escapeHtml(phone)}" class="btn-call-direct" title="Call Direct" aria-label="Call about ${safeNameAttr}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
        </div>
    </div>
</div>`;
}

function renderPropertyDetailHTML(prop, templateHtml) {
    const slug = slugifyProperty(prop);
    const canonicalUrl = `https://kimiproperties.in/listings/${slug}`;
    const isRent = prop.purpose === 'Rent' ||
        (prop.category && prop.category.toLowerCase().includes('rental')) ||
        prop.transactionType === 'Rental';

    const pageTitle = `${prop.isSoldOut ? '[SOLD] ' : ''}${prop.name || 'Property'} for ${isRent ? 'Rent' : 'Sale'} in ${prop.location || 'Nagpur'} | KIMI Properties`;
    const metaDesc = `${prop.name || 'Verified property'} (${prop.area || prop.category || 'Nagpur'}) for ${isRent ? 'rent' : 'sale'} in ${prop.location || 'Nagpur'}. Verified title & direct site visits via KIMI Properties.`.slice(0, 158);
    const images = (Array.isArray(prop.images) && prop.images.length > 0)
        ? prop.images.map(normalizeImageFallback)
        : [normalizeImageFallback(prop.image)];
    const primaryImg = images[0];
    const priceVal = formatPrice(prop.price) || 'Contact for Price';
    const priceUnitVal = prop.priceUnit || (isRent ? '/ month' : '');

    const listingSchema = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": prop.name || "Nagpur Property",
        "description": prop.description || metaDesc,
        "url": canonicalUrl,
        "image": primaryImg.startsWith('http') ? primaryImg : `https://kimiproperties.in${primaryImg}`,
        "datePosted": prop.createdAt || "2026-11-27T00:00:00.000Z",
        "offers": {
            "@type": "Offer",
            "price": String(prop.price || '').replace(/[^0-9]/g, '') || "0",
            "priceCurrency": "INR",
            "availability": prop.isSoldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": prop.location || "Nagpur",
            "addressRegion": "Maharashtra",
            "addressCountry": "IN"
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kimiproperties.in/" },
            { "@type": "ListItem", "position": 2, "name": "Properties", "item": "https://kimiproperties.in/properties" },
            { "@type": "ListItem", "position": 3, "name": prop.name || "Property Details", "item": canonicalUrl }
        ]
    };

    let out = templateHtml;
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);
    out = out.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapeHtml(metaDesc)}">`);
    out = out.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${canonicalUrl}">`);
    out = out.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${escapeHtml(pageTitle)}">`);
    out = out.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${escapeHtml(metaDesc)}">`);
    out = out.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${escapeHtml(primaryImg)}">`);
    out = out.replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${escapeHtml(pageTitle)}">`);
    out = out.replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${escapeHtml(metaDesc)}">`);
    out = out.replace(/<meta name="twitter:image" content="[^"]*">/i, `<meta name="twitter:image" content="${escapeHtml(primaryImg)}">`);

    out = out.replace(
        /<script type="application\/ld\+json">[\s\S]*?"BreadcrumbList"[\s\S]*?<\/script>/i,
        `<script type="application/ld+json">\n${JSON.stringify(breadcrumbSchema, null, 2)}\n</script>\n<script type="application/ld+json">\n${JSON.stringify(listingSchema, null, 2)}\n</script>`
    );

    // Pre-render property highlight pills on SSR so mobile & desktop have 0 layout shift on hydration
    const purposeTagDetail = isRent ? 'FOR RENT' : 'FOR SALE';
    const defaultPills = [
        purposeTagDetail,
        prop.category,
        prop.status,
        prop.location,
        prop.isCornerPlot ? 'Corner Plot' : '',
        prop.isNegotiable ? 'Negotiable' : ''
    ].filter(Boolean);
    const allPills = (Array.isArray(prop.highlights) && prop.highlights.length > 0)
        ? [purposeTagDetail, ...prop.highlights]
        : defaultPills;
    const pillsHtml = allPills.map(p => `<div class="pd-pill">${escapeHtml(p)}</div>`).join('');
    out = out.replace(
        /(<div class="pd-pills" id="pd-pills">)[\s\S]*?(<\/div>)/,
        `$1${pillsHtml}$2`
    );

    // Replace H1 title, breadcrumb, price, description, gallery in static HTML
    out = out.replace(
        /(<h1 class="pd-title" id="pd-name">)Loading\.\.\.(<\/h1>)/,
        `$1${escapeHtml(prop.name || 'Verified Nagpur Property')}$2`
    );
    out = out.replace(
        /(<span class="breadcrumb-current" id="pd-crumb-title">)Property Details(<\/span>)/,
        `$1${escapeHtml(prop.name || 'Property Details')}$2`
    );
    out = out.replace(/(<span class="pd-book-price" id="pd-book-price">)Loading\.\.\.(<\/span>)/, `$1${escapeHtml(priceVal)}$2`);
    out = out.replace(/(<span class="pd-book-unit" id="pd-book-unit">)(<\/span>)/, `$1${escapeHtml(priceUnitVal)}$2`);
    out = out.replace(/(<span class="pd-mobile-price" id="pd-mobile-price">)Loading\.\.\.(<\/span>)/, `$1${escapeHtml(priceVal)}$2`);
    out = out.replace(/(<span class="pd-mobile-unit" id="pd-mobile-unit">)(<\/span>)/, `$1${escapeHtml(priceUnitVal)}$2`);
    out = out.replace(/(<span id="pd-bd-rent"[^>]*>)-(<\/span>)/, `$1${escapeHtml(priceVal)}$2`);
    out = out.replace(/(<span id="pd-bd-total"[^>]*>)-(<\/span>)/, `$1${escapeHtml(priceVal)}$2`);

    const descText = prop.description || `${prop.category || 'Property'} in ${prop.location || 'Nagpur'} with verified documentation and road touch access. Contact KIMI Properties to inspect paperwork and visit the site.`;
    out = out.replace(/(<p class="pd-desc-text" id="pd-desc-text">)(<\/p>)/, `$1${escapeHtml(descText)}$2`);

    // Bake SSR primary image into gallery collage immediately for instant LCP without waiting on JS fetch
    let ssrGallery = `<div class="pd-gallery-hero" onclick="openLightbox(0)"><img src="${escapeHtml(primaryImg)}" alt="${escapeHtml(prop.name || 'Property Photo')}" width="900" height="560" fetchpriority="high" decoding="async"><div class="pd-mobile-gallery-badge"><span>View ${images.length} Photos &gt;</span></div></div>`;
    if (images.length > 1) {
        ssrGallery += `<div class="pd-gallery-grid">`;
        for (let i = 1; i < Math.min(5, images.length); i++) {
            ssrGallery += `<div class="pd-gallery-thumb" onclick="openLightbox(${i})"><img src="${escapeHtml(images[i])}" alt="${escapeHtml(prop.name || 'Property')} photo ${i + 1}" width="400" height="250" loading="lazy" decoding="async"></div>`;
        }
        ssrGallery += `</div>`;
    }
    out = out.replace(/(<div class="pd-gallery-collage" id="pd-gallery">)[\s\S]*?(<\/div>\s*<!-- Main 2-Column Layout -->)/, `$1\n${ssrGallery}\n</div>\n<!-- Main 2-Column Layout -->`);

    // Inject propertyId fallback marker so property-detail inline script always knows exact ID
    out = out.replace('<main class="pd-page">', `<main class="pd-page" data-ssr-id="${escapeHtml(String(prop._id || prop.id || ''))}">`);

    return out;
}

function renderSitemapXML(properties = [], today = new Date().toISOString().slice(0, 10)) {
    const staticPages = [
        { loc: 'https://kimiproperties.in/', changefreq: 'daily', priority: '1.0', img: 'https://kimiproperties.in/assets/property-4.webp', title: 'KIMI Properties Nagpur' },
        { loc: 'https://kimiproperties.in/properties', changefreq: 'daily', priority: '0.9', img: 'https://kimiproperties.in/assets/property-1.webp', title: 'Verified Properties in Nagpur' },
        { loc: 'https://kimiproperties.in/guides', changefreq: 'weekly', priority: '0.8' },
        { loc: 'https://kimiproperties.in/guides/nagpur-investment-guide', changefreq: 'monthly', priority: '0.8' },
        { loc: 'https://kimiproperties.in/guides/best-residential-areas-nagpur', changefreq: 'monthly', priority: '0.8' },
        { loc: 'https://kimiproperties.in/guides/property-buying-checklist', changefreq: 'monthly', priority: '0.8' },
        { loc: 'https://kimiproperties.in/guides/home-loan-guide-nagpur', changefreq: 'monthly', priority: '0.8' },
        { loc: 'https://kimiproperties.in/guides/maharera-rules-guide', changefreq: 'monthly', priority: '0.8' },
        { loc: 'https://kimiproperties.in/about', changefreq: 'monthly', priority: '0.7' },
        { loc: 'https://kimiproperties.in/contact', changefreq: 'monthly', priority: '0.7' }
    ];

    const urlBlocks = staticPages.map(p => {
        const imgTag = p.img ? `\n        <image:image>\n            <image:loc>${escapeHtml(p.img)}</image:loc>\n            <image:title>${escapeHtml(p.title)}</image:title>\n        </image:image>` : '';
        return `    <url>\n        <loc>${escapeHtml(p.loc)}</loc>\n        <lastmod>${today}</lastmod>\n        <changefreq>${p.changefreq}</changefreq>\n        <priority>${p.priority}</priority>${imgTag}\n    </url>`;
    });

    for (const prop of properties) {
        const slug = slugifyProperty(prop);
        const rawImg = (Array.isArray(prop.images) && prop.images[0]) || prop.image;
        const imgUrl = rawImg && rawImg.startsWith('http') ? rawImg : (rawImg ? `https://kimiproperties.in${normalizeImageFallback(rawImg)}` : '');
        const lastmod = prop.createdAt ? new Date(prop.createdAt).toISOString().slice(0, 10) : today;
        const imgBlock = imgUrl ? `\n        <image:image>\n            <image:loc>${escapeHtml(imgUrl)}</image:loc>\n            <image:title>${escapeHtml(prop.name || 'Nagpur Property')}</image:title>\n        </image:image>` : '';
        urlBlocks.push(`    <url>\n        <loc>https://kimiproperties.in/listings/${slug}</loc>\n        <lastmod>${lastmod}</lastmod>\n        <changefreq>weekly</changefreq>\n        <priority>0.85</priority>${imgBlock}\n    </url>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlBlocks.join('\n')}\n</urlset>\n`;
}

module.exports = {
    escapeHtml,
    slugifyProperty,
    formatPrice,
    normalizeImageFallback,
    renderPropertyCardHTML,
    renderPropertyDetailHTML,
    renderSitemapXML
};
