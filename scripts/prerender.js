const fs = require('fs');
const path = require('path');
const {
    escapeHtml,
    slugifyProperty,
    renderPropertyCardHTML,
    renderPropertyDetailHTML,
    renderSitemapXML,
    normalizeImageFallback
} = require('../lib/cardRenderer');

const ROOT = path.join(__dirname, '..');
const API_BASE = process.env.SSR_API_BASE || 'http://localhost:3001';

const GUIDES_DATA = [
    {
        slug: 'nagpur-investment-guide',
        tag: 'Investment & MIDC Zones',
        title: 'Nagpur Property Investment Guide 2026: Wardha Road, Butibori & Hingna',
        metaDesc: 'Where industrial buyers and plot investors look in Nagpur during 2026: Hingna MIDC, Butibori Block C, MIHAN SEZ, and Samruddhi corridor rates.',
        lead: 'Industrial sheds, warehouse corridors, and residential townships around Nagpur have shifted toward three main infrastructure links: Butibori MIDC expansion, Samruddhi Mahamarg cargo connectivity, and Metro Phase 2 along Wardha Road.',
        sections: [
            {
                h2: '1. Butibori MIDC and Logistics Warehousing',
                p: 'Butibori remains the primary choice for manufacturing units and 3PL distribution godowns needing larger parcels (6,000 sq.ft. to 1 lakh+ sq.ft.). Buyers typically evaluate sanctioned power capacity (20 HP to 100+ HP), container road width, and existing MIDC transfer charges before negotiating price.',
                bullets: [
                    'Ready industrial sheds around 6,000 to 18,000 sq.ft. appeal to distributors who want immediate operation without 12-month construction delays.',
                    'Plots along internal 60 ft roads command higher resale liquidity than narrow secondary lanes.',
                    'Check whether the plot holds an existing Building Completion Certificate (BCC) and active MIDC water meter.'
                ]
            },
            {
                h2: '2. Hingna MIDC and Sangam Road Corridors',
                p: 'For lighter engineering shops, spare-part warehousing, and city-linked storage, Hingna MIDC and Hingna Sangam Road stay preferred because of proximity to central Nagpur markets and Wadi transport hubs.',
                bullets: [
                    'Smaller industrial units (1,800 to 5,000 sq.ft.) along Hingna Sangam Road offer easier staff commute.',
                    'Road-touch land parcels between Hingna and Wanadongri draw mixed commercial and warehouse interest.'
                ]
            },
            {
                h2: '3. Wardha Road, MIHAN & Amravati Highway',
                p: 'Residential plots and 2BHK to 3BHK apartments around Wardha Road, Manish Nagar, and Besa benefit from proximity to MIHAN SEZ, Dr. Babasaheb Ambedkar International Airport, and operational metro stations.',
                bullets: [
                    'Verify NMRDA or NIT layout sanctions on open residential plots before paying booking tokens.',
                    'Compare carpet area rates against bank-approved project limits in Wanadongri and Hingna belt.'
                ]
            }
        ],
        ctaHref: '/properties?category=Industrial',
        ctaLabel: 'Browse Active Industrial & Plot Listings',
        faqs: [
            {
                q: 'What affects industrial shed prices in Butibori MIDC?',
                a: 'Pricing depends on land area versus built-up shed ratio, road width (40 ft vs 60 ft container access), sanctioned MSEB power load, and whether MIDC transfer premiums have already been cleared.'
            },
            {
                q: 'Is Hingna MIDC better for smaller warehouses?',
                a: 'Yes. Businesses shipping daily inside Nagpur city prefer Hingna MIDC and Wadi because transit times to central markets stay lower than Butibori.'
            }
        ]
    },
    {
        slug: 'best-residential-areas-nagpur',
        tag: 'Residential Corridors',
        title: 'Best Residential Areas in Nagpur for Families & Working Buyers',
        metaDesc: 'Practical comparison of Manish Nagar, Dharampeth, Wardha Road, Sadar, and Wanadongri for 2BHK/3BHK flat buyers in Nagpur.',
        lead: 'Choosing a neighborhood in Nagpur comes down to commute time, school and hospital reach, water reliability, and resale liquidity. Here is how the city’s most active residential belts compare today.',
        sections: [
            {
                h2: '1. Manish Nagar and Besa-Pipla',
                p: 'Manish Nagar stays one of South Nagpur’s highest-volume resale and new apartment hubs. Proximity to Wardha Road, Airport South metro station, and retail streets makes 2BHK and 3BHK units easy to rent out if plans change.',
                bullets: [
                    'Strong demand for ready-to-move 2BHK resale flats around ₹48 Lakh to ₹65 Lakh.',
                    'Good connectivity toward MIHAN and Butibori industrial workplaces via Wardha Road.'
                ]
            },
            {
                h2: '2. Wanadongri and Hingna Road',
                p: 'Buyers looking under a tight ₹30 Lakh to ₹42 Lakh apartment budget often consider Wanadongri and Hingna Road, supported by engineering colleges, hospitals, and metro feeder routes.',
                bullets: [
                    'Check sanctioned building map (NMRDA / Gram Panchayat clearance) and lift occupancy status before purchase.',
                    'Confirm clear approach road width and dedicated parking allotment in the sale deed.'
                ]
            },
            {
                h2: '3. Dharampeth, Ramdaspeth & Sadar',
                p: 'Central-West Nagpur zones such as Dharampeth, Ramdaspeth, and Sadar suit buyers prioritizing walkability to established schools, clinics, and commercial offices, though ticket sizes and redevelopment costs sit higher.',
                bullets: [
                    'Preferred for larger 3BHK builder floors and long-term end-user occupation.',
                    'Commercial ground-floor plus residential mix works well along major internal cross roads.'
                ]
            }
        ],
        ctaHref: '/properties?category=Residential',
        ctaLabel: 'See Verified Flats & Homes in Nagpur',
        faqs: [
            {
                q: 'Which Nagpur area offers ready 2BHK flats under ₹55 Lakh?',
                a: 'Manish Nagar, Wanadongri, and pockets off Besa Road regularly have resale and new 2BHK apartments between ₹30 Lakh and ₹55 Lakh.'
            },
            {
                q: 'Where should MIHAN employees buy homes?',
                a: 'Wardha Road, Chinchbhavan, and Manish Nagar keep daily travel to MIHAN and AIIMS Nagpur within 15 to 25 minutes.'
            }
        ]
    },
    {
        slug: 'property-buying-checklist',
        tag: 'Legal & 7/12 Verification',
        title: 'Property Buying Checklist in Nagpur: 7/12, 8A, MIDC & Title Search',
        metaDesc: 'Step-by-step document checklist before buying agricultural land, MIDC sheds, plots, or flats in Nagpur district, Maharashtra.',
        lead: 'Most delays at the Nagpur sub-registrar desk happen when a missing link deed or pending mutation shows up late. Check these records before paying an earnest token.',
        sections: [
            {
                h2: '1. Land & Agricultural Parcel Records (7/12 & 8A)',
                p: 'For farmland around Umred Road, Parseoni, Dunda Khairi, or Amravati Highway, rely only on current revenue extracts.',
                bullets: [
                    'Updated 7/12 Extract (Satbara Utara): Verify current owner names, crop cultivation status, and any bank charge or loan in the "Other Rights" (Itar Adhikar) column.',
                    '8A Extract (Khata): Confirms the total holding consolidated under the seller’s account.',
                    'Shetkari (Farmer) Status: Under Maharashtra tenancy rules, agricultural land purchases require valid farmer status documentation.',
                    'Demarcation (Mojni) & Road Access: Verify on site that physical boundary pillars and right-of-way match village maps.'
                ]
            },
            {
                h2: '2. MIDC Industrial Plots & Factory Sheds',
                p: 'MIDC properties in Hingna, Butibori, and Wadi follow leasehold transfer rules controlled by Maharashtra Industrial Development Corporation rather than private freehold deeds.',
                bullets: [
                    'Confirm original Allotment Letter, Lease Agreement, and current Water/Service charge clearance with zero arrears.',
                    'Verify sanctioned built-up plan and existing MSEB power load capacity (HP / KVA).',
                    'Factor standard MIDC sub-leasing or transfer fee schedules into your total closing budget.'
                ]
            },
            {
                h2: '3. Residential Flats & Urban Plots',
                p: 'Before buying urban plots or resale apartments inside Nagpur Municipal Corporation (NMC) or NMRDA limits:',
                bullets: [
                    'Review a 30-year Search & Title Report covering the full chain of prior registered sale deeds.',
                    'Check RL (Regularization Letter) / Gunthewari or NIT/NMRDA layout sanction for plots.',
                    'Verify No Dues Certificate from the society and municipal property tax receipts for resale flats.'
                ]
            }
        ],
        ctaHref: '/contact',
        ctaLabel: 'Request Document Verification Support',
        faqs: [
            {
                q: 'Can non-farmers buy agricultural land in Maharashtra?',
                a: 'Under Maharashtra land laws, buying agricultural land generally requires existing farmer status (Shetkari dakhla) or converting the parcel to non-agricultural (NA) use where zoning permits.'
            },
            {
                q: 'What is the most important column on a 7/12 extract?',
                a: 'Besides the primary holder name column, always check the Other Rights (Itar Adhikar) section for active bank mortgages, court stays, or co-heir claims.'
            }
        ]
    },
    {
        slug: 'home-loan-guide-nagpur',
        tag: 'Financing & Bank Approvals',
        title: 'Home Loan & Commercial Property Finance Guide for Nagpur Buyers',
        metaDesc: 'Required legal papers for bank loan approval on Nagpur flats, NA plots, and industrial sheds in Butibori or Hingna MIDC.',
        lead: 'Banks in Nagpur run separate legal and technical valuations before releasing a sanction letter. Having the right file ready cuts processing time down from four weeks to ten days.',
        sections: [
            {
                h2: '1. Property Papers Banks Require in Nagpur',
                p: 'Whether applying with SBI, HDFC, ICICI, or local cooperative banks, technical clearance depends on municipal or MIDC status:',
                bullets: [
                    'Registered chain of previous Sale Deeds (last 13 to 30 years) and Nil Encumbrance Certificate.',
                    'For plots: Clear NA order and NIT, NMRDA, or NMC sanctioned layout plan with R.L. (Release Letter).',
                    'For flats: Sanctioned building plan, Commencement/Occupancy Certificate (or completion papers for older resale blocks), and MahaRERA registration number for under-construction projects.',
                    'Updated Property Tax receipt and Society NOC for resale apartments.'
                ]
            },
            {
                h2: '2. Income & Financial File for Salaried and Business Buyers',
                p: 'Industrial unit owners and self-employed professionals buying shops or sheds usually need 2 to 3 years of audited financials:',
                bullets: [
                    'Last 3 years ITR with computation of income and profit/loss statements (for business applicants).',
                    '6 months primary current and savings bank statements plus existing EMI repayment schedule.',
                    'Keep 15% to 25% down payment plus Maharashtra stamp duty and registration fees liquid outside loan proceeds.'
                ]
            }
        ],
        ctaHref: '/properties',
        ctaLabel: 'Browse Bank-Loan-Eligible Listings',
        faqs: [
            {
                q: 'Do banks approve loans on resale flats in Manish Nagar and Wanadongri?',
                a: 'Yes, provided the building holds proper sanctioned plans, clear sale deed chain, and updated municipal tax / property card records.'
            },
            {
                q: 'Are industrial plots in Butibori MIDC eligible for business loans?',
                a: 'Yes. Banks and NBFCs finance MIDC plots and running factory sheds through MSME term loans or Lease Rental Discounting against verified lease deeds.'
            }
        ]
    },
    {
        slug: 'maharera-rules-guide',
        tag: 'Maharashtra Regulations',
        title: 'MahaRERA Rules for Nagpur Plot & Flat Buyers: Practical Guide',
        metaDesc: 'How Nagpur property buyers use MahaRERA to check builder track records, possession dates, carpet area definitions, and escrow rules.',
        lead: 'Under Maharashtra Real Estate Regulatory Authority (MahaRERA) rules, plotted layouts above 500 sq. meters or projects over 8 units require public disclosure before marketing.',
        sections: [
            {
                h2: '1. What to Check on the MahaRERA Portal Before Booking',
                p: 'Every registered project in Nagpur displays a unique registration number starting with P505 (Nagpur district code). Always look up the live registration record before paying a token:',
                bullets: [
                    'Proposed Completion Date vs Revised Extensions: See whether the builder has repeatedly extended timelines.',
                    'Encumbrances & Litigation Disclosures: Check declared mortgages against the project land.',
                    'Sanctioned Plans & Amenities Committed: Cross-check brochure promises against filed architect certificates.'
                ]
            },
            {
                h2: '2. Carpet Area vs Super Built-up Area',
                p: 'MahaRERA requires agreements to specify RERA Carpet Area (net usable floor area within walls plus internal partition walls), preventing inflated loading percentages from masking usable room size.',
                bullets: [
                    'Always divide quoted flat cost by RERA carpet area when comparing two projects in Nagpur.',
                    'Verify allotment of open or covered parking explicitly in writing inside the registered Agreement for Sale.'
                ]
            }
        ],
        ctaHref: '/properties',
        ctaLabel: 'Explore Verified Nagpur Properties',
        faqs: [
            {
                q: 'What does P505 on a Nagpur MahaRERA number mean?',
                a: 'Project codes beginning with P505 identify projects registered under Nagpur district jurisdiction on the MahaRERA website.'
            },
            {
                q: 'Does MahaRERA cover agricultural land or individual resale flats?',
                a: 'Pure agricultural land transactions and single-owner secondary resale units are governed primarily by standard Transfer of Property and Maharashtra Land Revenue laws rather than new-project MahaRERA filings.'
            }
        ]
    }
];

function renderSharedHead({ title, metaDesc, canonicalUrl, ogImage = 'https://kimiproperties.in/assets/logo.png', schemas = [], depthPrefix = '/' }) {
    const schemaScripts = schemas.map(s => `    <script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n    </script>`).join('\n');
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <meta name="description" content="${escapeHtml(metaDesc)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="author" content="KIMI Properties Advisory Desk">
    <meta name="geo.region" content="IN-MH">
    <meta name="geo.placename" content="Nagpur">
    <link rel="icon" type="image/png" href="/assets/logo.png">
    <link rel="manifest" href="/manifest.json">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(metaDesc)}">
    <meta property="og:image" content="${escapeHtml(ogImage)}">
    <meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="KIMI Properties">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(metaDesc)}">
${schemaScripts}
    <link rel="stylesheet" href="/style.css?v=3.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
    <script defer src="https://unpkg.com/@studio-freight/lenis@1.0.33/dist/lenis.min.js"></script>
    <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-EQCD673C8D"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-EQCD673C8D');
    </script>
</head>`;
}

function renderSharedHeader(activeSlug = 'guides') {
    return `    <div class="container">
        <nav class="navbar">
            <div class="logo">
                <a href="/" class="brand-link" aria-label="KIMI Properties Home">
                    <img src="/assets/logo.webp" alt="KIMI Properties" class="brand-logo-img" width="194" height="118">
                </a>
            </div>
            <div class="nav-links">
                <div class="mobile-nav-header">
                    <a href="/" class="brand-link" aria-label="KIMI Properties Home">
                        <img src="/assets/logo.webp" alt="KIMI Properties" class="brand-logo-img" width="194" height="118" style="filter: brightness(0) invert(1); height: 40px;">
                    </a>
                </div>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/properties">Properties</a></li>
                    <li><a href="/guides"${activeSlug === 'guides' ? ' class="active"' : ''}>Guides</a></li>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/contact">Contact Us</a></li>
                </ul>
                <div class="mobile-nav-footer"><a href="/contact">Contact Us</a></div>
            </div>
            <div class="nav-actions">
                <a href="/contact" class="contact-btn">Contact Us</a>
            </div>
            <div class="hamburger"><span></span><span></span><span></span></div>
        </nav>
    </div>`;
}

function renderAuthorBioBox() {
    return `
        <aside class="author-bio-card" aria-label="About the Author">
            <img src="/assets/founder.webp" alt="Founder and Principal Property Advisor at KIMI Properties Nagpur" class="author-bio-avatar" width="720" height="1280" loading="lazy" decoding="async">
            <div>
                <span class="author-bio-eyebrow">Written &amp; Reviewed by Field Advisory Desk</span>
                <h3 class="author-bio-name">Founder &amp; Principal Property Advisor, KIMI Properties</h3>
                <p class="author-bio-text">15+ years advising buyers, logistics tenants, and investors across Hingna MIDC, Butibori MIDC, Wardha Road, and Nagpur rural registries on 7/12 extracts, MIDC transfers, and MahaRERA compliance.</p>
                <div class="author-bio-meta">
                    <a href="/about">About KIMI Properties →</a>
                    <a href="/properties">View Verified Listings →</a>
                    <a href="tel:+919696976950">Call +91 96969 76950</a>
                </div>
            </div>
        </aside>`;
}

function renderSharedFooterAndScripts() {
    return `    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand-col">
                    <div class="logo">
                        <a href="/" class="brand-link" aria-label="KIMI Properties Home">
                            <img src="/assets/logo.webp" alt="KIMI Properties" class="brand-logo-img" width="194" height="118" style="height: 70px;" loading="lazy" decoding="async">
                        </a>
                    </div>
                    <p class="footer-desc">KIMI Properties is a Nagpur real estate agency handling Industrial, Commercial, Residential, and Agricultural properties across Hingna MIDC, Wadi, Butibori, and Wardha Road.</p>
                    <div class="social-links">
                        <a href="https://www.facebook.com/people/KIMI-Properties/61590282696335/" target="_blank" rel="noopener noreferrer" title="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
                        <a href="https://www.instagram.com/_kimiproperties.in?igsh=MW41ZnJrcGRwdHQycA==" target="_blank" rel="noopener noreferrer" title="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
                    </div>
                </div>
                <div class="footer-col">
                    <h4>Localities</h4>
                    <div class="footer-links">
                        <a href="/properties?location=Hingna">Hingna Properties</a>
                        <a href="/properties?location=Hingna+MIDC">Hingna MIDC Properties</a>
                        <a href="/properties?location=Wadi+MIDC">Wadi MIDC Properties</a>
                        <a href="/properties?location=Butibori+MIDC">Butibori MIDC Properties</a>
                        <a href="/properties?location=Wanadongri">Wanadongri Properties</a>
                        <a href="/properties?location=Sangam+Road">Sangam Road Properties</a>
                        <a href="/properties?location=Nagpur+Agricultural+Land">Nagpur Agricultural Land</a>
                    </div>
                </div>
                <div class="footer-col">
                    <h4>Pages</h4>
                    <div class="footer-links">
                        <a href="/">Home</a>
                        <a href="/properties">Properties in Nagpur</a>
                        <a href="/about">About Us</a>
                        <a href="/guides">Nagpur Property Guides</a>
                        <a href="/#faq">FAQ</a>
                        <a href="/contact">Contact Us</a>
                        <a href="/properties?featured=true">Featured Homes</a>
                        <a href="/#testimonials">Client Reviews</a>
                    </div>
                </div>
                <div class="footer-col">
                    <h4>Real Estate Guides</h4>
                    <div class="footer-links">
                        <a href="/guides/nagpur-investment-guide">Nagpur Investment Guide 2026</a>
                        <a href="/guides/best-residential-areas-nagpur">Best Residential Areas in Nagpur</a>
                        <a href="/guides/property-buying-checklist">Property Buying Checklist India</a>
                        <a href="/guides/home-loan-guide-nagpur">Home Loan Guide for Nagpur</a>
                        <a href="/guides/maharera-rules-guide">RERA Rules in Maharashtra</a>
                    </div>
                </div>
                <div class="footer-col">
                    <h4>Utility</h4>
                    <div class="footer-links">
                        <a href="/admin">Admin Panel</a>
                        <p>Nagpur, India</p>
                        <p>+91 96969 76950</p>
                        <p>propkimi@gmail.com</p>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 KIMI Properties. All rights reserved.</p>
            </div>
        </div>
    </footer>
    <a href="tel:+919696976950" class="call-float" aria-label="Call KIMI Properties">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    </a>
    <a href="https://wa.me/919696976950" class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp KIMI Properties">
        <svg viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l114.1-29.9c32.7 17.8 69.4 27.2 107.4 27.2h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.3-16.3-14.5-27.3-32.5-30.5-37.9-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.3 4.6-13 4.6-24.1 3.2-26.3-1.4-2.2-5-3.5-10.5-6.3z"/></svg>
    </a>
    <div class="mobile-sticky-action-bar">
        <a href="tel:+919696976950" class="mobile-bar-btn btn-call-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>Call Directly</span>
        </a>
        <a href="https://wa.me/919696976950?text=Hello%20KIMI%20Properties%21%20I%20am%20interested%20in%20Nagpur%20properties." target="_blank" rel="noopener noreferrer" class="mobile-bar-btn btn-wa-bar">
            <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l114.1-29.9c32.7 17.8 69.4 27.2 107.4 27.2h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.3-16.3-14.5-27.3-32.5-30.5-37.9-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.3 4.6-13 4.6-24.1 3.2-26.3-1.4-2.2-5-3.5-10.5-6.3z"/></svg>
            <span>WhatsApp Agent</span>
        </a>
    </div>
    <script defer src="/script.js?v=3.0"></script>
</body>
</html>`;
}

function buildGuidesPages() {
    const hubSchema = [
        {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Nagpur Real Estate Buying & Investment Guides",
            "url": "https://kimiproperties.in/guides",
            "description": "Practical checklists and corridor guides for MIDC industrial sheds, commercial leasing, homes, home loans, and 7/12 agricultural land in Nagpur."
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kimiproperties.in/" },
                { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://kimiproperties.in/guides" }
            ]
        }
    ];

    const guideCardsHtml = GUIDES_DATA.map(g => `
        <a href="/guides/${g.slug}" class="guide-card">
            <span class="guide-tag">${escapeHtml(g.tag)}</span>
            <h2>${escapeHtml(g.title)}</h2>
            <p>${escapeHtml(g.metaDesc)}</p>
            <span class="guide-read-more">Read Practical Guide →</span>
        </a>`).join('\n');

    const guidesHubHtml = `${renderSharedHead({
        title: 'Nagpur Property Buying & MIDC Investment Guides | KIMI Properties',
        metaDesc: 'Practical Nagpur real estate guides covering Butibori & Hingna MIDC investments, 7/12 land verification, residential areas, home loans, and MahaRERA.',
        canonicalUrl: 'https://kimiproperties.in/guides',
        schemas: hubSchema
    })}
<body>
${renderSharedHeader('guides')}
    <main id="main-content" class="guides-section">
        <div class="container">
            <nav aria-label="Breadcrumb" class="breadcrumb-nav">
                <a href="/">Home</a>
                <span class="breadcrumb-sep">/</span>
                <span class="breadcrumb-current">Nagpur Real Estate Guides</span>
            </nav>
            <h1 style="font-size: 40px; font-weight: 800; color: #0F172A; margin: 0 0 12px; letter-spacing: -0.5px;">Nagpur Property &amp; MIDC Buying Guides</h1>
            <p style="font-size: 17px; color: #475569; max-width: 720px; line-height: 1.6;">Field-verified checklists prepared by our Nagpur brokerage team covering MIDC transfers, 7/12 extracts, neighborhood pricing, and MahaRERA rules.</p>
            <div class="guides-grid">
                ${guideCardsHtml}
            </div>
            ${renderAuthorBioBox()}
        </div>
    </main>
${renderSharedFooterAndScripts()}`;

    fs.writeFileSync(path.join(ROOT, 'guides.html'), guidesHubHtml, 'utf8');
    const guidesDir = path.join(ROOT, 'guides');
    fs.mkdirSync(guidesDir, { recursive: true });

    for (const g of GUIDES_DATA) {
        const canonical = `https://kimiproperties.in/guides/${g.slug}`;
        const schemas = [
            {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": g.title,
                "description": g.metaDesc,
                "mainEntityOfPage": canonical,
                "datePublished": "2026-11-27",
                "dateModified": new Date().toISOString().slice(0, 10),
                "author": {
                    "@type": "Person",
                    "name": "Founder & Principal Property Advisor, KIMI Properties",
                    "url": "https://kimiproperties.in/about"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "KIMI Properties",
                    "logo": { "@type": "ImageObject", "url": "https://kimiproperties.in/assets/logo.png" }
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kimiproperties.in/" },
                    { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://kimiproperties.in/guides" },
                    { "@type": "ListItem", "position": 3, "name": g.title, "item": canonical }
                ]
            },
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": g.faqs.map(f => ({
                    "@type": "Question",
                    "name": f.q,
                    "acceptedAnswer": { "@type": "Answer", "text": f.a }
                }))
            }
        ];

        const sectionsHtml = g.sections.map(s => `
            <h2>${escapeHtml(s.h2)}</h2>
            <p>${escapeHtml(s.p)}</p>
            <ul>
                ${s.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('\n                ')}
            </ul>`).join('\n');

        const faqsHtml = g.faqs.map((f, idx) => `
            <details class="faq-item"${idx === 0 ? ' open' : ''} style="background: white; border: 1px solid #E5E7EB; border-radius: 14px; padding: 18px 22px; margin-bottom: 12px; cursor: pointer;">
                <summary style="font-size: 17px; font-weight: 600; color: #0F172A; list-style: none; display: flex; justify-content: space-between;">
                    <span>${escapeHtml(f.q)}</span>
                    <span style="color: #2563EB; font-weight: 700;">+</span>
                </summary>
                <p style="margin: 12px 0 0; font-size: 15px; line-height: 1.65; color: #475569;">${escapeHtml(f.a)}</p>
            </details>`).join('\n');

        const pageHtml = `${renderSharedHead({
            title: `${g.title} | KIMI Properties`,
            metaDesc: g.metaDesc,
            canonicalUrl: canonical,
            schemas
        })}
<body>
${renderSharedHeader('guides')}
    <main id="main-content" style="background: #FFFFFF;">
        <article class="guide-article-shell">
            <nav aria-label="Breadcrumb" class="breadcrumb-nav">
                <a href="/">Home</a>
                <span class="breadcrumb-sep">/</span>
                <a href="/guides">Guides</a>
                <span class="breadcrumb-sep">/</span>
                <span class="breadcrumb-current">${escapeHtml(g.tag)}</span>
            </nav>
            <span class="guide-tag">${escapeHtml(g.tag)}</span>
            <h1>${escapeHtml(g.title)}</h1>
            <p class="guide-lead">${escapeHtml(g.lead)}</p>
            <div class="guide-article-body">
                ${sectionsHtml}
            </div>
            <section aria-label="Guide FAQ" style="margin-top: 40px;">
                <h2 style="font-size: 24px; font-weight: 700; color: #0F172A; margin-bottom: 16px;">Common Questions</h2>
                ${faqsHtml}
            </section>
            <div style="margin: 32px 0; padding: 24px; background: #0F172A; color: #FFFFFF; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h3 style="margin: 0 0 6px; font-size: 20px; color: #FFFFFF;">Need Site Verification or Custom Shortlists?</h3>
                    <p style="margin: 0; font-size: 14px; color: #CBD5E1;">Call or WhatsApp +91 96969 76950 for active Nagpur property pricing.</p>
                </div>
                <a href="${g.ctaHref}" style="background: #25D366; color: #FFFFFF; padding: 12px 20px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none;">${escapeHtml(g.ctaLabel)} →</a>
            </div>
            ${renderAuthorBioBox()}
        </article>
    </main>
${renderSharedFooterAndScripts()}`;

        fs.writeFileSync(path.join(guidesDir, `${g.slug}.html`), pageHtml, 'utf8');
    }
    console.log(`Built guides.html and ${GUIDES_DATA.length} guide pages in guides/.`);
}

async function loadLiveCatalog() {
    const contentJsonPath = path.join(ROOT, 'data', 'content.json');
    let content = JSON.parse(fs.readFileSync(contentJsonPath, 'utf8'));

    // Normalize local content.json asset extensions to WebP
    if (Array.isArray(content.properties)) {
        content.properties = content.properties.map(p => ({
            ...p,
            image: normalizeImageFallback(p.image),
            images: Array.isArray(p.images) ? p.images.map(normalizeImageFallback) : p.images
        }));
        fs.writeFileSync(contentJsonPath, JSON.stringify(content, null, 4), 'utf8');
    }

    try {
        const res = await fetch(`${API_BASE}/api/content`);
        if (res.ok) {
            const live = await res.json();
            if (Array.isArray(live.properties) && live.properties.length > 0) {
                console.log(`Fetched ${live.properties.length} live properties from ${API_BASE}/api/content`);
                // Fetch gallery photos per property for static SSR detail pages
                for (const prop of live.properties) {
                    const id = prop._id || prop.id;
                    try {
                        const mRes = await fetch(`${API_BASE}/api/properties/${id}/media`);
                        if (mRes.ok) {
                            const mData = await mRes.json();
                            if (Array.isArray(mData.images) && mData.images.length > 0) {
                                prop.images = mData.images;
                            }
                            if (Array.isArray(mData.videos) && mData.videos.length > 0) {
                                prop.videos = mData.videos;
                            }
                        }
                    } catch (e) {}
                }
                return live.properties;
            }
        }
    } catch (e) {
        console.warn('Live API unavailable, falling back to data/content.json:', e.message);
    }
    return content.properties || [];
}

function injectSSRBlock(html, containerRegex, cardsHtml) {
    return html.replace(containerRegex, `$1\n<!-- SSR:START -->\n${cardsHtml}\n<!-- SSR:END -->\n$3`);
}

async function main() {
    const properties = await loadLiveCatalog();

    // 1. Build Real Estate Guides Hub & 5 Articles
    buildGuidesPages();

    // 2. Build static SSR property pages under listings/<slug>.html
    const listingsDir = path.join(ROOT, 'listings');
    fs.mkdirSync(listingsDir, { recursive: true });
    const pdTemplate = fs.readFileSync(path.join(ROOT, 'property-detail.html'), 'utf8');
    const activeFiles = new Set();

    for (const prop of properties) {
        const slug = slugifyProperty(prop);
        const filename = `${slug}.html`;
        activeFiles.add(filename);
        const detailHtml = renderPropertyDetailHTML(prop, pdTemplate);
        fs.writeFileSync(path.join(listingsDir, filename), detailHtml, 'utf8');
    }

    // Remove obsolete listing files no longer in DB
    for (const existing of fs.readdirSync(listingsDir)) {
        if (existing.endsWith('.html') && !activeFiles.has(existing)) {
            fs.unlinkSync(path.join(listingsDir, existing));
        }
    }
    console.log(`Pre-rendered ${properties.length} property detail pages in listings/.`);

    // 3. Inject SSR cards into index.html
    let indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const featured = properties.filter(p => p.isFeatured);
    const homeProps = [...featured, ...properties.filter(p => !p.isFeatured)].slice(0, 12);
    const homeCardsHtml = homeProps.map(renderPropertyCardHTML).join('\n');

    indexHtml = injectSSRBlock(
        indexHtml,
        /(<div\s+id="properties-grid"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/,
        homeCardsHtml
    );
    indexHtml = injectSSRBlock(
        indexHtml,
        /(<div\s+id="properties-grid-3"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/,
        homeCardsHtml
    );
    fs.writeFileSync(path.join(ROOT, 'index.html'), indexHtml, 'utf8');
    console.log(`Injected ${homeProps.length} SSR cards into index.html.`);

    // 4. Inject SSR cards & result count into properties.html
    let propsHtml = fs.readFileSync(path.join(ROOT, 'properties.html'), 'utf8');
    const allCardsHtml = properties.map(renderPropertyCardHTML).join('\n');
    propsHtml = injectSSRBlock(
        propsHtml,
        /(<div\s+class="listings-grid"\s+id="properties-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/,
        allCardsHtml
    );
    propsHtml = propsHtml.replace(
        /<span id="result-count">\d*<\/span>/,
        `<span id="result-count">${properties.length}</span>`
    );
    fs.writeFileSync(path.join(ROOT, 'properties.html'), propsHtml, 'utf8');
    console.log(`Injected ${properties.length} SSR cards and count into properties.html.`);

    // 5. Generate rich sitemap.xml
    const sitemap = renderSitemapXML(properties);
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
    console.log(`Generated sitemap.xml with ${10 + properties.length} total indexed URLs.`);
}

main().catch(err => {
    console.error('Prerender error:', err);
    process.exit(1);
});
