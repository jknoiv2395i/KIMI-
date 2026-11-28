/**
 * Shared SSR & Pre-render HTML helper for KIMI Properties.
 * Used by both server.js (live Express SSR) and scripts/prerender.js (Vercel static SSR).
 */
const {
    escapeHtml,
    slugifyProperty,
    normalizeImageFallback,
    resolveNagpurLocality,
    formatCleanAddress,
    cleanPropertyTitle,
    formatPrice,
    formatShortPrice,
    formatSeoTitle,
    formatSeoDescription,
    renderPropertyCardHTML
} = require('../property-helpers');

function renderPropertyDetailHTML(prop, templateHtml) {
    const slug = slugifyProperty(prop);
    const canonicalUrl = `https://kimiproperties.in/listings/${slug}`;
    const resolvedLoc = resolveNagpurLocality(prop);
    const cleanTitle = cleanPropertyTitle(prop);
    const isRent = prop.purpose === 'Rent' ||
        (prop.category && prop.category.toLowerCase().includes('rental')) ||
        prop.transactionType === 'Rental';

    const pageTitle = formatSeoTitle(prop);
    const metaDesc = formatSeoDescription(prop);
    const images = (Array.isArray(prop.images) && prop.images.length > 0)
        ? prop.images.map(normalizeImageFallback)
        : [normalizeImageFallback(prop.image)];
    const primaryImg = images[0];
    const priceVal = formatPrice(prop.price) || 'Contact for Price';
    const priceUnitVal = prop.priceUnit || (isRent ? '/ month' : '');

    const listingSchema = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": cleanTitle,
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
            "addressLocality": resolvedLoc,
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
            { "@type": "ListItem", "position": 3, "name": cleanTitle, "item": canonicalUrl }
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
        resolvedLoc,
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
        `$1${escapeHtml(cleanTitle)}$2`
    );
    out = out.replace(
        /(<span class="breadcrumb-current" id="pd-crumb-title">)Property Details(<\/span>)/,
        `$1${escapeHtml(cleanTitle)}$2`
    );
    out = out.replace(/(<span class="pd-book-price" id="pd-book-price">)Loading\.\.\.(<\/span>)/, `$1${escapeHtml(priceVal)}$2`);
    out = out.replace(/(<span class="pd-book-unit" id="pd-book-unit">)(<\/span>)/, `$1${escapeHtml(priceUnitVal)}$2`);
    out = out.replace(/(<span class="pd-mobile-price" id="pd-mobile-price">)Loading\.\.\.(<\/span>)/, `$1${escapeHtml(priceVal)}$2`);
    out = out.replace(/(<span class="pd-mobile-unit" id="pd-mobile-unit">)(<\/span>)/, `$1${escapeHtml(priceUnitVal)}$2`);
    out = out.replace(/(<span id="pd-bd-rent"[^>]*>)-(<\/span>)/, `$1${escapeHtml(priceVal)}$2`);
    out = out.replace(/(<span id="pd-bd-total"[^>]*>)-(<\/span>)/, `$1${escapeHtml(priceVal)}$2`);

    const descText = prop.description || `${prop.category || 'Property'} in ${resolvedLoc} with verified documentation and road touch access. Contact KIMI Properties to inspect paperwork and visit the site.`;
    out = out.replace(/(<p class="pd-desc-text" id="pd-desc-text">)(<\/p>)/, `$1${escapeHtml(descText)}$2`);

    // Bake SSR primary image into gallery collage immediately for instant LCP without waiting on JS fetch
    let ssrGallery = `<div class="pd-gallery-hero" onclick="openLightbox(0)"><img src="${escapeHtml(primaryImg)}" alt="${escapeHtml(cleanTitle)} in ${escapeHtml(resolvedLoc)}" width="900" height="560" fetchpriority="high" decoding="async"><div class="pd-mobile-gallery-badge"><span>View ${images.length} Photos &gt;</span></div></div>`;
    if (images.length > 1) {
        ssrGallery += `<div class="pd-gallery-grid">`;
        for (let i = 1; i < Math.min(5, images.length); i++) {
            ssrGallery += `<div class="pd-gallery-thumb" onclick="openLightbox(${i})"><img src="${escapeHtml(images[i])}" alt="${escapeHtml(cleanTitle)} photo ${i + 1}" width="400" height="250" loading="lazy" decoding="async"></div>`;
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
        const cleanTitle = cleanPropertyTitle(prop);
        const imgBlock = imgUrl ? `\n        <image:image>\n            <image:loc>${escapeHtml(imgUrl)}</image:loc>\n            <image:title>${escapeHtml(cleanTitle)}</image:title>\n        </image:image>` : '';
        urlBlocks.push(`    <url>\n        <loc>https://kimiproperties.in/listings/${slug}</loc>\n        <lastmod>${lastmod}</lastmod>\n        <changefreq>weekly</changefreq>\n        <priority>0.85</priority>${imgBlock}\n    </url>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlBlocks.join('\n')}\n</urlset>\n`;
}

module.exports = {
    escapeHtml,
    slugifyProperty,
    normalizeImageFallback,
    resolveNagpurLocality,
    formatCleanAddress,
    cleanPropertyTitle,
    formatPrice,
    formatShortPrice,
    formatSeoTitle,
    formatSeoDescription,
    renderPropertyCardHTML,
    renderPropertyDetailHTML,
    renderSitemapXML
};
