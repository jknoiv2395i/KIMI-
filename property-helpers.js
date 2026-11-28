/**
 * Shared Property Formatting, Locality Inference & SEO Copy Helpers.
 * UMD module loaded by both Node (lib/cardRenderer.js) and Browser (script.js, property-detail.html).
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.KimiHelpers = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

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

    /**
     * Infers the true Nagpur corridor from property title, address, and location.
     * Overrides accidental Admin defaults like "Dharampeth" or generic "Nagpur" when
     * the title/address explicitly names Butibori MIDC, Hingna MIDC, Wanadongri, etc.
     */
    function resolveNagpurLocality(prop) {
        if (!prop) return 'Nagpur';
        const primary = `${prop.name || ''} ${prop.address || ''}`.toLowerCase();
        const rawLoc = String(prop.location || '').trim();
        const combined = `${primary} ${rawLoc.toLowerCase()}`;

        function matchCorridor(text) {
            if (text.includes('butibori') && text.includes('umred')) return 'Butibori-Umred Road, Nagpur';
            if (text.includes('butibori')) return 'Butibori MIDC, Nagpur';
            if (text.includes('wanadongri') || text.includes('wanadongari')) return 'Wanadongri, Nagpur';
            if ((text.includes('hingna') && text.includes('sangam')) || text.includes('sawardhota')) return 'Hingna Sangam Road, Nagpur';
            if (text.includes('hingna')) return 'Hingna MIDC, Nagpur';
            if (text.includes('manish nagar')) return 'Manish Nagar, Nagpur';
            if (text.includes('parshivni') || text.includes('parshivini') || text.includes('dunda khairi')) return 'Parshivni, Nagpur';
            if (text.includes('amravati') || text.includes('amaravati') || text.includes('bajargaon')) return 'Amravati Road, Nagpur';
            if (text.includes('umred') || text.includes('jambhla') || text.includes('jamlapano')) return 'Umred Road, Nagpur';
            if (text.includes('mihan')) return 'MIHAN, Nagpur';
            if (text.includes('wardha road')) return 'Wardha Road, Nagpur';
            if (text.includes('besa')) return 'Besa, Nagpur';
            if (text.includes('wadi')) return 'Wadi, Nagpur';
            if (text.includes('sitabuldi')) return 'Sitabuldi, Nagpur';
            if (text.includes('ramdaspeth')) return 'Ramdaspeth, Nagpur';
            if (text.includes('sadar')) return 'Sadar, Nagpur';
            return '';
        }

        const specific = matchCorridor(primary);
        if (specific) return specific;
        if (primary.includes('dharampeth')) return 'Dharampeth, Nagpur';

        const fromCombined = matchCorridor(combined);
        if (fromCombined) return fromCombined;

        if (rawLoc && rawLoc.toLowerCase() !== 'all' && rawLoc.toLowerCase() !== 'nagpur') {
            return rawLoc.toLowerCase().includes('nagpur') ? rawLoc : `${rawLoc}, Nagpur`;
        }
        return 'Nagpur';
    }

    function smartTitleCase(str) {
        const keepUpper = new Set(['MIDC', 'MIHAN', 'SEZ', 'BHK', 'NH', 'NIT', 'NMRDA', 'HP', 'RERA']);
        const keepLower = new Set(['in', 'for', 'and', 'on', 'of', 'with', 'near', 'to', 'at', 'by', 'or', 'per']);
        return String(str || '').split(/\s+/).map((word, idx) => {
            if (!word) return '';
            const plain = word.replace(/[^a-zA-Z0-9]/g, '');
            if (keepUpper.has(plain.toUpperCase())) return word.toUpperCase();
            if (/^₹/.test(word)) return word;
            if (idx > 0 && keepLower.has(word.toLowerCase())) return word.toLowerCase();
            if (/^[0-9]+[a-zA-Z]+$/.test(word)) return word;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    /**
     * Formats clean, readable card/detail address text while preserving factual location details.
     */
    function formatCleanAddress(prop) {
        const locality = resolveNagpurLocality(prop);
        let addr = String((prop && prop.address) || '')
            .replace(/\b\d+\s*sq\.?ft\.?\s*for\s*sel+\s*/gi, '')
            .replace(/Prime Location:\s*/gi, '')
            .replace(/\bjamlapano\b/gi, 'Jambhla Pani')
            .replace(/\bkrisna\s+aapartment\b/gi, 'Krishna Apartment')
            .replace(/\bparshivini\b/gi, 'Parshivni')
            .replace(/\bmauza-/gi, 'Mauza ')
            .replace(/\bvillage-/gi, '')
            .replace(/\bb\s+zon\b/gi, 'Zone B')
            .replace(/\bblock\s+c\b/gi, 'Block C')
            .replace(/\bamaravati\b/gi, 'Amravati')
            .replace(/\s*\.\s*/g, ', ')
            .replace(/\s*,\s*/g, ', ')
            .replace(/\s{2,}/g, ' ')
            .replace(/^,|,$|\s+$/g, '')
            .trim();

        if (!addr) return locality;

        if (/Butibori MIDC Zone B/i.test(addr)) addr = 'Zone B, Butibori MIDC, Nagpur';
        else if (/Butibori MIDC Block C/i.test(addr)) addr = 'Block C, Butibori MIDC, Nagpur';
        else if (/^Sawardhota Sangam Road$/i.test(addr)) addr = 'Sawardhota, Hingna Sangam Road, Nagpur';
        else if (addr === addr.toLowerCase() || addr === addr.toUpperCase()) {
            addr = addr.split(',').map(part => smartTitleCase(part.trim())).filter(Boolean).join(', ');
        }

        const primaryCorridorToken = locality.split(',')[0].replace(/ Road| MIDC/gi, '').trim().toLowerCase();
        addr = addr.split(',').map(seg => {
            const s = seg.trim();
            if (!s) return '';
            return s[0] === s[0].toLowerCase() ? smartTitleCase(s) : s;
        }).filter(Boolean).join(', ');

        if (primaryCorridorToken && !addr.toLowerCase().includes(primaryCorridorToken)) {
            addr = `${addr}, ${locality}`;
        } else if (!addr.toLowerCase().includes('nagpur')) {
            addr = `${addr}, Nagpur`;
        } else {
            addr = addr.replace(/\s+(Nagpur)$/i, ', $1').replace(/,\s*,/g, ',');
        }
        return addr;
    }

    /**
     * Produces a clean, typo-free human heading for cards, H1s, and breadcrumbs.
     */
    function cleanPropertyTitle(prop) {
        if (!prop || !prop.name) return 'Verified Property in Nagpur';
        const locality = resolveNagpurLocality(prop);
        let raw = String(prop.name)
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, '')
            .trim();

        // Normalize bilingual Hindi/English mixed headline cleanly without losing facts
        if (/[^\x00-\x7F]/.test(raw) && /[\u0900-\u097F]/.test(raw)) {
            const cleanedAscii = raw
                .replace(/[\u0900-\u097F]+/g, ' ')
                .replace(/\s{2,}/g, ' ')
                .replace(/\s+!/g, '')
                .trim();
            const isRent = prop.purpose === 'Rent';
            const locShort = locality.replace(/,\s*Nagpur$/i, '');
            if (cleanedAscii.toLowerCase().includes('bhk')) {
                const matchBhk = cleanedAscii.match(/(\d+\s*BHK\s*Flat)/i);
                const priceMatch = raw.match(/₹\s*[\d.,]+/);
                const lakhMatch = /लाख/i.test(raw) ? ' Lakh' : '';
                const unitLabel = matchBhk ? matchBhk[1].toUpperCase().replace('FLAT', 'Flat') : 'Residential Flat';
                const priceSuffix = priceMatch ? ` (${priceMatch[0].replace(/\s+/g, '')}${lakhMatch})` : '';
                return `${unitLabel} for ${isRent ? 'Rent' : 'Sale'} in ${locShort}, Nagpur${priceSuffix}`;
            }
            return `${cleanedAscii || 'Property'} in ${locality}`;
        }

        let cleaned = raw
            .replace(/\bgodoun\b/gi, 'Godown')
            .replace(/\bfor\s+sell\b/gi, 'for Sale')
            .replace(/\bsell\b/gi, 'Sale')
            .replace(/\bmidc\b/gi, 'MIDC')
            .replace(/\bbhk\b/gi, 'BHK')
            .replace(/\bhp\b/gi, 'HP')
            .replace(/\bsq\.?\s*ft\.?(?=\s|$|[,\-|)])/gi, 'Sq.Ft.')
            .replace(/Sq\.Ft\.\.+/g, 'Sq.Ft.')
            .replace(/\bamaravati\b/gi, 'Amravati')
            .replace(/\bshed\s*$/i, 'Shed')
            .replace(/\s*,(?=\s*[A-Za-z])/g, ', ')
            .replace(/\s{2,}/g, ' ')
            .trim();

        // Format integer area numbers in titles cleanly (without splitting 25,000)
        cleaned = cleaned.replace(/\b(16000|13000|6000|1900)\b/g, m => Number(m).toLocaleString('en-IN'));

        if (/^Plot area 16,000 Factory/i.test(cleaned)) {
            cleaned = '16,000 Sq.Ft. Plot & 13,000 Sq.Ft. Factory Shed (20 HP) for Sale & Rent in Butibori MIDC';
        } else if (/^Jambhla pani/i.test(cleaned)) {
            cleaned = '2.5 Acre Agricultural Land near Jambhla Pani, Umred Road (1.5 km inside)';
        } else if (/^5 Acre Agriculture Land/i.test(cleaned)) {
            cleaned = '5 Acre Agricultural Land for Sale on Butibori-Umred Road Touch';
        } else if (/^6,000 Sq\.Ft\. Godown/i.test(cleaned)) {
            cleaned = '6,000 Sq.Ft. Industrial Godown for Sale in Butibori MIDC, Nagpur';
        } else if (cleaned === cleaned.toUpperCase()) {
            cleaned = smartTitleCase(cleaned.replace(/\s*\|\s*/g, ' | '));
        } else {
            cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }

        return cleaned;
    }

    function formatPrice(price) {
        if (!price) return '';
        const str = String(price)
            .replace(/\baced\b/gi, 'Acre')
            .replace(/\bsqft\b/gi, 'Sq.Ft.')
            .replace(/\s{2,}/g, ' ')
            .trim();
        const num = str.replace(/,/g, '');
        if (!isNaN(num) && num.trim() !== '') {
            return '₹' + Number(num).toLocaleString('en-IN');
        }
        return str.includes('₹') ? str : '₹' + str;
    }

    function formatShortPrice(prop) {
        const raw = String((prop && prop.price) || '').trim();
        if (!raw) return 'Price on Request';
        if (/2\.50\s*Crore/i.test(raw) && /1,50,000/i.test(raw)) return '₹2.50 Cr / ₹1.5L/mo';
        if (/(\d+(?:\.\d+)?)\s*cr/i.test(raw)) {
            const m = raw.match(/(\d+(?:\.\d+)?)\s*cr/i);
            return `₹${m[1]} Cr`;
        }
        if (/(\d+(?:\.\d+)?)\s*lakh\s*per\s*ac/i.test(raw)) {
            const m = raw.match(/(\d+(?:\.\d+)?)\s*lakh/i);
            return `₹${m[1]}L/Acre`;
        }
        if (/(\d+(?:\.\d+)?)\s*lakh/i.test(raw)) {
            const m = raw.match(/(\d+(?:\.\d+)?)\s*lakh/i);
            return `₹${m[1]} Lakh`;
        }
        if (/(\d+(?:,\d+)?)\s*per\s*sq/i.test(raw)) {
            const m = raw.match(/(\d+(?:,\d+)?)/);
            return `₹${Number(m[1].replace(/,/g, '')).toLocaleString('en-IN')}/Sq.Ft.`;
        }
        return formatPrice(raw).slice(0, 18);
    }

    function trimToMaxWords(str, maxLen) {
        if (str.length <= maxLen) return str;
        const cut = str.slice(0, maxLen - 1);
        const lastSpace = cut.lastIndexOf(' ');
        return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).replace(/[|,\-–\s]+$/, '');
    }

    /**
     * Crafts a concise ~52-64 character SEO <title> with Property Type + True Locality + Price.
     */
    function formatSeoTitle(prop) {
        const locality = resolveNagpurLocality(prop);
        const shortLoc = locality === 'Nagpur' ? 'Nagpur' : locality.replace(/,\s*Nagpur$/i, '');
        const priceShort = formatShortPrice(prop);
        const soldPrefix = prop.isSoldOut ? '[SOLD] ' : '';
        const isDual = /sale\s*&\s*rent/i.test(prop.name || '') || /Rent:.*Sale Price:/i.test(prop.price || '');
        const isRent = !isDual && (prop.purpose === 'Rent' ||
            (prop.category && prop.category.toLowerCase().includes('rental')) ||
            prop.transactionType === 'Rental');
        const txWord = isDual ? 'Sale & Rent' : (isRent ? 'for Rent' : 'for Sale');

        const titleClean = cleanPropertyTitle(prop);
        const catLower = String(prop.category || '').toLowerCase();

        const prep = /Road/i.test(shortLoc) ? 'on' : 'in';

        // Build clean focused subject phrase (area + asset type)
        let subject = '';
        if (/16,000\s*Sq\.Ft\. Plot & 13,000/i.test(titleClean)) {
            subject = '16,000 Sq.Ft. Factory Shed';
        } else if (/25,000\s*Sq\.Ft\. Industrial Property/i.test(titleClean)) {
            subject = '25,000 Sq.Ft. Industrial Shed';
        } else if (/1 Acre Industrial Plot.*6,?000/i.test(titleClean)) {
            subject = '1 Acre Plot & 6,000 Sq.Ft. Shed';
        } else if (/1,900\s*Sq\.Ft\./i.test(titleClean)) {
            subject = '1,900 Sq.Ft. Industrial Shed';
        } else if (/6,000\s*Sq\.Ft\. Industrial Godown/i.test(titleClean)) {
            subject = `6,000 Sq.Ft. Godown ${txWord}`;
        } else if (/BHK/i.test(titleClean)) {
            const bhkM = titleClean.match(/(\d+\s*BHK\s*Flat)/i);
            const prefix = /resale/i.test(titleClean) ? 'Resale ' : '';
            subject = `${prefix}${bhkM ? bhkM[1] : '2 BHK Flat'} ${txWord}`;
        } else if (/Commercial Plots/i.test(titleClean)) {
            subject = `Commercial Plots ${txWord}`;
        } else if (/Industrial Land.*3 Acre/i.test(titleClean)) {
            subject = `3 Acre Industrial Land`;
        } else if (/3\.41 Acre/i.test(titleClean)) {
            subject = `3.41 Acre Highway Land`;
        } else if (/8 Acre/i.test(titleClean)) {
            subject = `8 Acre Agricultural Land`;
        } else if (/2\.5 Acre/i.test(titleClean)) {
            subject = `2.5 Acre Agricultural Land`;
        } else if (/5 Acre/i.test(titleClean)) {
            subject = `5 Acre Agricultural Land`;
        } else {
            const fallbackType = catLower.includes('agri') ? 'Agricultural Land'
                : (catLower.includes('indust') ? 'Industrial Property'
                : (catLower.includes('resid') ? 'Residential Property' : 'Commercial Property'));
            subject = trimToMaxWords(titleClean.replace(new RegExp(shortLoc, 'ig'), '').trim(), 34) || `${fallbackType} ${txWord}`;
        }

        const withFullLoc = `${soldPrefix}${subject} ${prep} ${locality} | ${priceShort}`;
        if (withFullLoc.length <= 64) return withFullLoc;

        const withShortLoc = `${soldPrefix}${subject} ${prep} ${shortLoc} | ${priceShort}`;
        if (withShortLoc.length <= 64) return withShortLoc;

        const compactLoc = `${soldPrefix}${trimToMaxWords(subject, 30)} ${prep} ${shortLoc} | ${priceShort}`;
        if (compactLoc.length <= 64) return compactLoc;

        return `${trimToMaxWords(`${soldPrefix}${subject} ${prep} ${shortLoc}`, 46)} | ${priceShort}`;
    }

    /**
     * Generates a complete 120-158 char Google meta description without mid-word truncation.
     */
    function formatSeoDescription(prop) {
        const locality = resolveNagpurLocality(prop);
        const priceShort = formatShortPrice(prop);
        const cat = String(prop.category || 'Property').replace(/\(.*\)/g, '').trim();
        const isDual = /sale\s*&\s*rent/i.test(prop.name || '') || /Rent:.*Sale Price:/i.test(prop.price || '');
        const action = isDual ? 'sale & rent' : (prop.purpose === 'Rent' ? 'rent' : 'sale');
        const prep = /Road/i.test(locality) ? 'on' : 'in';
        const cleanHeading = cleanPropertyTitle(prop)
            .replace(/\s*\|\s*₹[^\n|]+$/i, '')
            .replace(/\s*\([^)]*\)$/, '')
            .trim();

        let core;
        if (/16,000\s*Sq\.Ft\. Plot & 13,000/i.test(cleanHeading)) {
            core = `16,000 Sq.Ft. industrial plot with 13,000 Sq.Ft. shed (20 HP power) for sale & rent in ${locality} at ${priceShort}.`;
        } else if (/25,000\s*Sq\.Ft\. Industrial Property/i.test(cleanHeading)) {
            core = `25,000 Sq.Ft. industrial premises with 18,000 Sq.Ft. shed for sale & rent in ${locality} (${priceShort}).`;
        } else if (cleanHeading.toLowerCase().includes(locality.split(',')[0].toLowerCase())) {
            core = `${cleanHeading} at ${priceShort}.`;
        } else {
            core = `${cleanHeading} ${prep} ${locality} at ${priceShort}.`;
        }
        core = core.replace(/\.\.+/g, '.');

        const proof = cat.toLowerCase().includes('agri')
            ? 'Clear 7/12 title & direct site visits. Call +91 96969 76950.'
            : 'Verified paperwork & direct site visits via KIMI Properties (+91 96969 76950).';
        const shortProof = 'Verified title & site visits via KIMI Properties (+91 96969 76950).';

        const full = `${core} ${proof}`;
        if (full.length <= 158) return full;
        const compact = `${core} ${shortProof}`;
        if (compact.length <= 158) return compact;
        return `${core} Call KIMI Properties +91 96969 76950.`;
    }

    function renderPropertyCardHTML(prop) {
        const propId = String(prop._id || prop.id || '');
        const slugUrl = `/listings/${slugifyProperty(prop)}`;
        const resolvedLoc = resolveNagpurLocality(prop);
        const cleanTitle = cleanPropertyTitle(prop);
        const cleanAddr = formatCleanAddress(prop);

        const phone = String(prop.ownerPhone || '+919696976950').replace(/\s+/g, '');
        const waNum = String(prop.ownerWhatsapp || prop.ownerPhone || '919696976950').replace(/[^0-9]/g, '') || '919696976950';
        const waMsg = encodeURIComponent(
            `Hello KIMI Properties! I am interested in details and site visit for: "${cleanTitle}" in ${resolvedLoc}. Please share price and inspection schedule.`
        );

        const isRentProp = prop.purpose === 'Rent' ||
            (prop.category && prop.category.toLowerCase().includes('rental')) ||
            prop.transactionType === 'Rental';

        const locLower = resolvedLoc.toLowerCase();
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
        const safeNameAttr = escapeHtml(cleanTitle);
        const safeNameJs = String(cleanTitle).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const safeLoc = escapeHtml(resolvedLoc);
        const safeAddr = escapeHtml(cleanAddr);

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
        <h3 class="card-title">${safeNameAttr}</h3>
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

    return {
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
    };
}));
