const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');

// Generate sample certificate SVG/PNG or minimal valid PDF if not present
const createInitialCertificateAssets = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const certImgPath = path.join(uploadsDir, 'udemy-c-developer-certificate.png');
  const certPdfPath = path.join(uploadsDir, 'udemy-c-developer-certificate.pdf');

  // If image does not exist, create a clean certificate PNG placeholder / SVG base
  if (!fs.existsSync(certImgPath)) {
    // We can write an SVG or minimal valid PNG buffer
    // A clean SVG wrapped or 1x1 png or high-res base64 PNG
    const svgCert = `<svg width="1000" height="700" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  
  <!-- Outer Border -->
  <rect x="20" y="20" width="960" height="660" rx="16" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="4"/>
  <rect x="35" y="35" width="930" height="630" rx="10" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="8 6"/>

  <!-- Udemy Header Badge -->
  <rect x="425" y="65" width="150" height="38" rx="19" fill="#a21caf" />
  <text x="500" y="90" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">UDEMY</text>
  
  <!-- Title -->
  <text x="500" y="150" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#94a3b8" text-anchor="middle" letter-spacing="4">CERTIFICATE OF COMPLETION</text>
  <text x="500" y="200" font-family="'Georgia', serif" font-size="28" font-weight="bold" fill="#f8fafc" text-anchor="middle">This is to certify that</text>
  
  <!-- Recipient -->
  <text x="500" y="270" font-family="'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="800" fill="url(#goldGrad)" text-anchor="middle">Soundhar D M</text>
  <line x1="300" y1="290" x2="700" y2="290" stroke="#475569" stroke-width="1.5"/>

  <!-- Course Name -->
  <text x="500" y="340" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" fill="#cbd5e1" text-anchor="middle">has successfully completed the online course</text>
  <text x="500" y="400" font-family="'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="bold" fill="#38bdf8" text-anchor="middle">The Complete C Developer Course</text>

  <!-- Details -->
  <text x="500" y="460" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">Demonstrating foundational programming, memory management &amp; algorithm design in C</text>

  <!-- Footer Info -->
  <g transform="translate(120, 560)">
    <text x="0" y="0" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#f8fafc">Date Issued:</text>
    <text x="0" y="22" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#94a3b8">January 30, 2024</text>
  </g>
  
  <!-- Stamp / Seal -->
  <g transform="translate(500, 570)">
    <circle cx="0" cy="0" r="38" fill="#1e293b" stroke="url(#goldGrad)" stroke-width="3"/>
    <text x="0" y="-8" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="bold" fill="#fbbf24" text-anchor="middle">VERIFIED</text>
    <text x="0" y="10" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">UDEMY</text>
  </g>

  <g transform="translate(740, 560)">
    <text x="0" y="0" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#f8fafc">Organization:</text>
    <text x="0" y="22" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#38bdf8">Udemy Inc.</text>
  </g>
</svg>`;
    // Save SVG file and PNG copy
    fs.writeFileSync(path.join(uploadsDir, 'udemy-c-developer-certificate.svg'), svgCert);
    fs.writeFileSync(certImgPath, svgCert); // Modern browsers render SVG seamlessly even with image tag
  }

  // Create minimal valid PDF if not present
  if (!fs.existsSync(certPdfPath)) {
    const minimalPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 280 >>
stream
BT
/F1 24 Tf
100 700 Td
(Certificate of Completion) Tj
/F1 16 Tf
0 -40 Td
(This certifies that Soundhar D M) Tj
0 -30 Td
(has successfully completed:) Tj
/F1 20 Tf
0 -40 Td
(The Complete C Developer Course) Tj
/F1 14 Tf
0 -40 Td
(Organization: Udemy) Tj
0 -25 Td
(Date: January 30, 2024) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000574 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
654
%%EOF`;
    fs.writeFileSync(certPdfPath, minimalPdf);
  }
};

const seedInitialData = async () => {
  try {
    createInitialCertificateAssets();

    // Seed Initial Project if empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.create({
        projectName: 'Food Munch – Responsive Food Ordering Website',
        shortDescription: 'A responsive food and restaurant website that showcases food categories, healthy food options, delivery and payment information, special offers, and social media links. The website uses a structured single-page layout with responsive navigation and Bootstrap-based styling for different screen sizes.',
        techStack: ['HTML5', 'CSS3', 'Bootstrap 4.5.2', 'Font Awesome 6.5.1', 'JavaScript'],
        keyFeatures: [],
        projectYear: '2024',
        githubUrl: 'https://github.com/soundhar1426-tech/Foodmunch',
        liveWebsiteUrl: 'https://foodmunchh-phi.vercel.app/'
      });
      console.log('[Seed] Initial project "Food Munch" seeded successfully.');
    }

    // Seed Initial Certificate if empty
    const certCount = await Certificate.countDocuments();
    if (certCount === 0) {
      await Certificate.create({
        certificateTitle: 'The Complete C Developer Course',
        organization: 'Udemy',
        date: 'January 30, 2024',
        pdfUrl: '/uploads/udemy-c-developer-certificate.pdf',
        imageUrl: '/uploads/udemy-c-developer-certificate.svg'
      });
      console.log('[Seed] Initial certificate "The Complete C Developer Course" seeded successfully.');
    }
  } catch (error) {
    console.error('[Seed] Error during seeding:', error.message);
  }
};

module.exports = { seedInitialData };
