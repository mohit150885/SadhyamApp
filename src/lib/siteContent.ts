// Default content for every page of the website.
//
// Firestore layout:  site_content/{pageKey}
//   global, home, about, courses, courseDetails, testSeries, testSeriesDetails,
//   studyMaterial, studyMaterialDetails, faculty, facultyDetails, results,
//   cart, auth, contact, help, faqs, legal
//
// The site reads each document live and deep-merges it over these defaults,
// so anything missing in Firestore falls back to the values below. The admin
// Website Settings page edits the same documents.

import type {
    Course,
    FacultyMember,
    StudyMaterial,
    TestSeries,
    Testimonial,
    Topper,
} from "./models";

const IMG = (id: string, w = 900) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

const courses: Course[] = [
    {
        id: "upsc-pre-mains", title: "UPSC Pre + Mains Complete Course 2025", category: "UPSC", type: "Foundation Course",
        language: "Hinglish", instructor: "Expert Faculty Team", lectures: "500+ Lectures", pdfs: "200+ PDFs", tests: "100+ Tests",
        validity: "1 Year Validity", rating: 4.8, reviews: "3.2k", price: 12999, oldPrice: 19999,
        image: IMG("photo-1585828068970-1b5e28230528"), badge: "Most Popular", bestseller: true, featured: true, published: true,
        features: ["Live Classes", "Recorded Lectures", "PDF Notes", "Test Series Included", "Doubt Support"],
        description: "A complete foundation programme covering the entire Prelims and Mains syllabus with live classes, recorded lectures, structured notes and regular tests.",
        highlights: ["Complete GS coverage for Prelims & Mains", "Weekly answer-writing practice", "Monthly current affairs compilations", "Personal mentorship sessions"],
        facultyIds: ["faculty-a-kumar", "faculty-n-singh", "faculty-s-sharma", "faculty-r-verma"],
    },
    {
        id: "uppsc-foundation", title: "UPPSC Foundation Course 2025", category: "UPPSC", type: "Foundation Course",
        language: "Hindi", instructor: "Dr. A. Kumar & Team", lectures: "300+ Lectures", pdfs: "150+ PDFs", tests: "80+ Tests",
        validity: "1 Year Validity", rating: 4.7, reviews: "1.8k", price: 8999, oldPrice: 14999,
        image: IMG("photo-1590050752117-238cb0fb12b1"), featured: true, published: true,
        features: ["Live Classes", "Recorded Lectures", "PDF Notes", "Test Series Included", "Mentorship"],
        description: "State-specific preparation for UPPSC with special focus on Uttar Pradesh GK, Hindi medium notes and exam-pattern tests.",
        facultyIds: ["faculty-a-kumar", "faculty-p-mishra"],
    },
    {
        id: "ras-complete", title: "RAS Complete Course 2025", category: "RAS", type: "Foundation Course",
        language: "Hinglish", instructor: "S. Sharma & Team", lectures: "350+ Lectures", pdfs: "180+ PDFs", tests: "90+ Tests",
        validity: "1 Year Validity", rating: 4.6, reviews: "1.2k", price: 9999, oldPrice: 15999,
        image: IMG("photo-1596522513974-98da69389e7c"), featured: true, published: true,
        features: ["Recorded Lectures", "PDF Notes", "Practice Tests", "Doubt Support"],
        description: "Rajasthan-focused course with Rajasthan GK, history and culture modules alongside the complete RAS syllabus.",
        facultyIds: ["faculty-s-sharma", "faculty-r-verma"],
    },
    {
        id: "current-affairs-2025", title: "Current Affairs 2025 (Pre + Mains)", category: "Other Exams", type: "Current Affairs",
        language: "English", instructor: "Editorial Team", lectures: "100+ Lectures", pdfs: "100+ PDFs", tests: "50+ Tests",
        validity: "1 Year Validity", rating: 4.8, reviews: "2.1k", price: 4999, oldPrice: 7999,
        image: IMG("photo-1504711434969-e33886168f5c"), featured: true, published: true,
        features: ["Recorded Lectures", "PDF Notes", "Test Series Included"],
        description: "Daily, weekly and monthly current affairs analysis linked to the static syllabus for Prelims and Mains.",
        facultyIds: ["faculty-p-mishra"],
    },
    {
        id: "upsc-optional-history", title: "UPSC Optional (History) 2025", category: "UPSC", type: "Optional Course",
        language: "English", instructor: "Prof. N. Singh", lectures: "250+ Lectures", pdfs: "100+ PDFs", tests: "40+ Tests",
        validity: "1 Year Validity", rating: 4.8, reviews: "980", price: 6999, oldPrice: 11999,
        image: IMG("photo-1524995997946-a1c2e315a42f"), published: true,
        features: ["Recorded Lectures", "PDF Notes", "Doubt Support"],
        facultyIds: ["faculty-s-sharma"],
    },
    {
        id: "uppsc-answer-writing", title: "UPPSC Mains Answer Writing Program", category: "UPPSC", type: "Answer Writing",
        language: "Hindi", instructor: "Dr. R. Verma", lectures: "200+ Lectures", pdfs: "50+ PDFs", tests: "60+ Tests",
        validity: "1 Year Validity", rating: 4.7, reviews: "860", price: 3999, oldPrice: 6999,
        image: IMG("photo-1456324504439-367cee3b3c32"), published: true,
        features: ["Live Classes", "PDF Notes", "Mentorship"],
        facultyIds: ["faculty-r-verma"],
    },
    {
        id: "ukpsc-complete", title: "UKPSC Complete Course 2025", category: "UKPSC", type: "Foundation Course",
        language: "Hindi", instructor: "Expert Faculty Team", lectures: "250+ Lectures", pdfs: "120+ PDFs", tests: "60+ Tests",
        validity: "1 Year Validity", rating: 4.6, reviews: "640", price: 7999, oldPrice: 12999,
        image: IMG("photo-1533130061792-64b345e4a833"), published: true,
        features: ["Live Classes", "Recorded Lectures", "PDF Notes", "Doubt Support"],
    },
    {
        id: "ssc-cgl-complete", title: "SSC CGL Complete Course 2025", category: "SSC", type: "Foundation Course",
        language: "Hindi", instructor: "P. Mishra & Team", lectures: "300+ Lectures", pdfs: "150+ PDFs", tests: "120+ Tests",
        validity: "1 Year Validity", rating: 4.8, reviews: "1.4k", price: 6499, oldPrice: 9999,
        image: IMG("photo-1516321318423-f06f85e504b3"), published: true,
        features: ["Live Classes", "Recorded Lectures", "PDF Notes", "Test Series Included"],
    },
    {
        id: "banking-po-complete", title: "Banking (IBPS PO / SBI PO) Complete Course", category: "Banking", type: "Foundation Course",
        language: "English", instructor: "A. Gupta & Team", lectures: "400+ Lectures", pdfs: "200+ PDFs", tests: "150+ Tests",
        validity: "1 Year Validity", rating: 4.7, reviews: "920", price: 5999, oldPrice: 9999,
        image: IMG("photo-1556761175-b413da4baf72"), published: true,
        features: ["Live Classes", "Recorded Lectures", "PDF Notes", "Test Series Included"],
    },
];

const testSeries: TestSeries[] = [
    {
        id: "upsc-prelims-tests", title: "UPSC CSE Prelims Test Series 2025", category: "UPSC", type: "Full Length", language: "Hinglish",
        instructor: "Expert Faculty Team", tests: "50 Tests", questions: "10,000+ Questions", validity: "1 Year Validity",
        rating: 4.8, reviews: "3.2k", price: 2999, oldPrice: 4999, image: IMG("photo-1582407947304-fd86f028f716"),
        badge: "Bestseller", tone: "red", featured: true, published: true,
        features: ["Detailed Solutions", "All India Ranking", "Performance Analysis", "Timer & Exam Interface"],
        description: "Sectional and full-length tests designed on the latest UPSC pattern with detailed explanations and all-India ranking.",
    },
    {
        id: "uppsc-prelims-tests", title: "UPPSC Prelims Test Series 2025", category: "UPPSC", type: "Full Length", language: "Hindi",
        instructor: "Dr. A. Kumar & Team", tests: "40 Tests", questions: "8,000+ Questions", validity: "1 Year Validity",
        rating: 4.7, reviews: "1.8k", price: 1999, oldPrice: 3499, image: IMG("photo-1564507592333-c60657eea523"),
        badge: "New", tone: "green", featured: true, published: true,
        features: ["Detailed Solutions", "Performance Analysis", "All India Ranking"],
    },
    {
        id: "ras-prelims-tests", title: "RAS Prelims Test Series 2025", category: "RAS", type: "Full Length", language: "Hinglish",
        instructor: "S. Sharma & Team", tests: "40 Tests", questions: "8,000+ Questions", validity: "1 Year Validity",
        rating: 4.6, reviews: "1.1k", price: 1999, oldPrice: 3499, image: IMG("photo-1434030216411-0b793f4b4173"),
        tone: "orange", featured: true, published: true,
        features: ["Detailed Solutions", "Rajasthan GK Focus", "Performance Analysis"],
    },
    {
        id: "current-affairs-tests", title: "Current Affairs Test Series 2025", category: "Other Exams", type: "Current Affairs", language: "English",
        instructor: "Editorial Team", tests: "30 Tests", questions: "6,000+ Questions", validity: "1 Year Validity",
        rating: 4.8, reviews: "2.4k", price: 999, oldPrice: 1999, image: IMG("photo-1504711434969-e33886168f5c"),
        tone: "blue", featured: true, published: true,
        features: ["Monthly Tests", "Detailed Solutions", "Performance Analysis"],
    },
    {
        id: "upsc-mains-tests", title: "UPSC Mains GS Answer Writing Tests", category: "UPSC", type: "Sectional", language: "English",
        instructor: "Prof. N. Singh & Team", tests: "24 Tests", questions: "480 Questions", validity: "1 Year Validity",
        rating: 4.7, reviews: "760", price: 3499, oldPrice: 5999, image: IMG("photo-1455390582262-044cdead277a"),
        tone: "purple", published: true,
        features: ["Evaluated Answers", "Model Answers", "Mentor Feedback"],
    },
    {
        id: "ssc-cgl-tests", title: "SSC CGL Tier I Mock Tests", category: "SSC", type: "Full Length", language: "Hindi",
        instructor: "P. Mishra & Team", tests: "60 Tests", questions: "6,000+ Questions", validity: "1 Year Validity",
        rating: 4.6, reviews: "1.3k", price: 799, oldPrice: 1499, image: IMG("photo-1501504905252-473c47e087f8"),
        tone: "teal", published: true,
        features: ["Detailed Solutions", "All India Ranking", "Timer & Exam Interface"],
    },
];

const studyMaterials: StudyMaterial[] = [
    {
        id: "upsc-material", title: "Complete UPSC Study Material", category: "UPSC", subject: "General Studies", language: "English",
        format: "PDF + Printed", pages: "12,000+ Pages", rating: 4.8, reviews: "4.2k", price: 2499, oldPrice: 3999,
        image: IMG("photo-1497633762265-9d179a990aa6"), badge: "Bestseller", featured: true, published: true,
        tags: ["UPSC", "PDF Notes", "Current Affairs"],
        description: "Subject-wise notes covering the full GS syllabus with maps, flowcharts, PYQ analysis and monthly current affairs.",
    },
    {
        id: "uppsc-material", title: "UPPSC Complete Study Material", category: "UPPSC", subject: "General Studies", language: "Hindi",
        format: "PDF", pages: "9,500+ Pages", rating: 4.7, reviews: "2.1k", price: 1999, oldPrice: 3499,
        image: IMG("photo-1532094349884-543bc11b234d"), featured: true, published: true,
        tags: ["UPPSC", "State Specific", "PDF Notes"],
    },
    {
        id: "ras-material", title: "RAS Study Material with Rajasthan GK", category: "RAS", subject: "General Studies", language: "Hindi",
        format: "PDF", pages: "8,000+ Pages", rating: 4.6, reviews: "1.2k", price: 1799, oldPrice: 2999,
        image: IMG("photo-1512820790803-83ca734da794"), published: true,
        tags: ["RAS", "Rajasthan GK", "PDF Notes"],
    },
    {
        id: "polity-notes", title: "Indian Polity Notes", category: "UPSC", subject: "Indian Polity", language: "English",
        format: "PDF", pages: "850+ Pages", rating: 4.9, reviews: "3.1k", price: 499, oldPrice: 899,
        image: IMG("photo-1589829545856-d10d557cf95f"), featured: true, published: true,
        tags: ["Polity", "PDF Notes"],
    },
    {
        id: "current-affairs-compilation", title: "Current Affairs Yearly Compilation", category: "Other Exams", subject: "Current Affairs", language: "English",
        format: "PDF", pages: "1,200+ Pages", rating: 4.8, reviews: "2.6k", price: 699, oldPrice: 1199,
        image: IMG("photo-1495020689067-958852a7765e"), published: true,
        tags: ["Current Affairs", "Monthly PDFs"],
    },
    {
        id: "ssc-material", title: "SSC CGL Complete Notes", category: "SSC", subject: "Quant, Reasoning, English, GA", language: "Hindi",
        format: "PDF", pages: "3,500+ Pages", rating: 4.6, reviews: "940", price: 999, oldPrice: 1799,
        image: IMG("photo-1456513080510-7bf3a84b82f8"), published: true,
        tags: ["SSC", "PDF Notes"],
    },
];

const faculty: FacultyMember[] = [
    {
        id: "faculty-a-kumar", name: "Dr. A. Kumar", subject: "Polity & Governance", experience: "15+ Years",
        bullets: ["Ex-Civil Servant", "5000+ Students Guided", "Specialist in Polity & Ethics", "Known for Concept Clarity"],
        image: IMG("photo-1568602471122-7832951cc4c5", 600), students: "50,000+", rating: "4.9", featured: true, published: true,
        bio: "Dr. A. Kumar has taught Indian Polity and Governance for over fifteen years. His classes connect constitutional concepts to current events and previous-year questions.",
        quote: "Understand the Constitution as a living document, and every question becomes easier.",
    },
    {
        id: "faculty-n-singh", name: "Prof. N. Singh", subject: "Geography", experience: "12+ Years",
        bullets: ["NTA & State Exams Expert", "Maps & Diagrams Specialist", "Interactive Teaching Style", "Mentored Many Toppers"],
        image: IMG("photo-1573496359142-b8d87734a5a2", 600), students: "35,000+", rating: "4.8", featured: true, published: true,
        bio: "Prof. N. Singh makes physical and human geography visual with maps, diagrams and case studies.",
    },
    {
        id: "faculty-s-sharma", name: "S. Sharma", subject: "History & Culture", experience: "10+ Years",
        bullets: ["In-depth Subject Knowledge", "Story-based Learning", "Focus on PYQs & Trends", "Guided 1000+ Selections"],
        image: IMG("photo-1506794778202-cad84cf45f1d", 600), students: "30,000+", rating: "4.8", featured: true, published: true,
    },
    {
        id: "faculty-r-verma", name: "R. Verma", subject: "Economy", experience: "14+ Years",
        bullets: ["Concept-driven Approach", "Current Affairs Integration", "Simplified Economic Concepts", "Regular Answer Writing Practice"],
        image: IMG("photo-1519085360753-af0119f7cbe7", 600), students: "40,000+", rating: "4.8", featured: true, published: true,
    },
    {
        id: "faculty-p-mishra", name: "P. Mishra", subject: "Current Affairs", experience: "10+ Years",
        bullets: ["Daily News Analysis", "Editorial Discussions", "Monthly Compilations", "Prelims-focused MCQs"],
        image: IMG("photo-1580489944761-15a19d654956", 600), students: "25,000+", rating: "4.7", featured: true, published: true,
    },
    {
        id: "faculty-s-tiwari", name: "S. Tiwari", subject: "Environment & Ecology", experience: "8+ Years",
        bullets: ["Environment Specialist", "Case-study Approach", "Science & Tech Integration"],
        image: IMG("photo-1500648767791-00dcc994a43e", 600), students: "15,000+", rating: "4.7", published: true,
    },
];

const toppers: Topper[] = [
    { id: "topper-aditi", name: "Aditi Sharma", exam: "UPSC CSE 2023", rank: "AIR 45", category: "UPSC", quote: "SadhyamIAS test series helped me identify my weak areas.", image: IMG("photo-1573496359142-b8d87734a5a2", 300), color: "amber", featured: true },
    { id: "topper-rohit", name: "Rohit Yadav", exam: "UPPSC 2023", rank: "Rank 12", category: "UPPSC", quote: "Structured notes and tests made a huge difference.", image: IMG("photo-1506794778202-cad84cf45f1d", 300), color: "blue", featured: true },
    { id: "topper-priya", name: "Priya Singh", exam: "RAS 2022", rank: "Rank 8", category: "RAS", quote: "The faculty guidance and current affairs material was excellent.", image: IMG("photo-1580489944761-15a19d654956", 300), color: "emerald", featured: true },
    { id: "topper-neha", name: "Neha Joshi", exam: "UKPSC 2023", rank: "Rank 15", category: "UKPSC", quote: "Regular practice tests gave me the confidence to succeed.", image: IMG("photo-1567532939604-b6b5b0db2604", 300), color: "teal", featured: true },
    { id: "topper-aman", name: "Aman Verma", exam: "SSC CGL 2023", rank: "Rank 3", category: "SSC", quote: "Quality content and analysis reports were really helpful.", image: IMG("photo-1519085360753-af0119f7cbe7", 300), color: "purple" },
    { id: "topper-kavya", name: "Kavya Mehta", exam: "IBPS PO 2023", rank: "Rank 21", category: "Banking", quote: "Mock tests with all-India ranking kept me exam-ready.", image: IMG("photo-1544005313-94ddf0286df2", 300), color: "rose" },
];

const testimonials: Testimonial[] = [
    { name: "Rohit Yadav", role: "UPSC Aspirant", quote: "SadhyamIAS test series really helped me understand my weak areas. The solutions are detailed.", image: IMG("photo-1506794778202-cad84cf45f1d", 150), rating: 5 },
    { name: "Neha Tiwari", role: "Selected - UPPSC", quote: "Best platform for UPPSC preparation. The video lectures and PDF notes are excellent.", image: IMG("photo-1573496359142-b8d87734a5a2", 150), rating: 5 },
    { name: "Aman Verma", role: "RAS Aspirant", quote: "The current affairs series is amazing. Highly recommended for all competitive exam aspirants.", image: IMG("photo-1519085360753-af0119f7cbe7", 150), rating: 5 },
];

const examTabs = ["UPSC", "UPPSC", "UKPSC", "RAS", "SSC", "Banking", "Other Exams"];

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

export const defaultSiteContent = {
    global: {
        siteName: "SadhyamIAS",
        logoImage: "",
        logoHeight: 40,
        showSiteName: true,
        tagline: "Prepare. Practice. Perform.",
        favicon: "",
        announcement: { enabled: false, text: "Admissions open for the 2025 batch — get up to 40% off.", link: "/courses", showCountdown: false, countdownAt: "" },
        navLinks: [
            { label: "Home", href: "/" },
            { label: "Courses", href: "/courses" },
            { label: "Test Series", href: "/test-series" },
            { label: "Study Material", href: "/study-material" },
            { label: "Faculty", href: "/faculty" },
            { label: "Results", href: "/results" },
            { label: "About", href: "/about" },
        ],
        showSearch: true,
        exams: examTabs,
        footerDescription: "Your trusted partner for competitive exam preparation. Quality content, expert guidance and real practice for your success.",
        footerQuickLinks: [
            { label: "About Us", href: "/about" },
            { label: "Courses", href: "/courses" },
            { label: "Test Series", href: "/test-series" },
            { label: "Study Material", href: "/study-material" },
            { label: "Faculty", href: "/faculty" },
            { label: "Results", href: "/results" },
            { label: "Contact Us", href: "/contact" },
        ],
        footerSupportLinks: [
            { label: "Help Center", href: "/help-center" },
            { label: "FAQs", href: "/faqs" },
            { label: "Refund Policy", href: "/refund-policy" },
            { label: "Terms & Conditions", href: "/terms-and-conditions" },
            { label: "Privacy Policy", href: "/privacy-policy" },
        ],
        copyright: "© {year} SadhyamIAS. All rights reserved.",
        contact: {
            phone: "+91 98765 43210",
            email: "support@sadhyamias.com",
            whatsapp: "919876543210",
            address: "Sadhyam Learning Centre, Mukherjee Nagar, New Delhi - 110009",
            hours: "Mon – Sat, 9:00 AM – 7:00 PM",
        },
        socials: { youtube: "", telegram: "", instagram: "", twitter: "", facebook: "", linkedin: "" },
        apps: { title: "Download Our App", subtitle: "Learn anytime, anywhere.", playStore: "", appStore: "" },
        payment: {
            upiId: "",
            payeeName: "SadhyamIAS",
            qrImage: "",
            instructions: "Pay using the UPI ID or QR code below and enter your UPI transaction ID. Your access is activated once our team confirms the payment (usually within a few hours).",
        },
        seo: {
            title: "SadhyamIAS — Prepare. Practice. Perform.",
            description: "Competitive exam preparation platform for UPSC, UPPSC, UKPSC, RAS and more.",
            keywords: "UPSC, UPPSC, UKPSC, RAS, SSC, test series, study material, IAS coaching",
        },
        theme: {
            brandColor: "#f97316",
            navyColor: "#021424",
            fontFamily: "Inter",
            typography: {} as Record<string, string>,
        },
    },

    home: {
        hero: {
            badge: "India's Trusted Platform for Competitive Exam Preparation",
            headingLine1: "Prepare. Practice.",
            headingLine2: "Perform.",
            featuresLine: "Structured Courses | Real Exam Tests | Expert Guidance",
            description: "Your one-stop platform for UPSC, UPPSC, UKPSC, RAS and other competitive examinations.",
            primaryBtnText: "Start Free Test",
            primaryBtnLink: "/test-series",
            secondaryBtnText: "Explore Courses",
            secondaryBtnLink: "/courses",
            banners: ["/banner1.png", "/banner2.png"],
            examTabs: examTabs.slice(0, 5).map((name, i) => ({ id: i + 1, name, link: `/courses?exam=${encodeURIComponent(name)}`, active: i === 0 })),
            settings: { autoSlideInterval: 5, showArrows: true, showIndicators: true },
        },
        stats: {
            items: [
                { iconName: "Award", big: "50,000+", small: "Students Learning" },
                { iconName: "GraduationCap", big: "10,000+", small: "Practice Tests" },
                { iconName: "Play", big: "2,500+", small: "Video Lectures" },
                { iconName: "BookOpen", big: "5,000+", small: "Study Materials" },
                { iconName: "Trophy", big: "500+", small: "Selections & Counting" },
            ],
        },
        features: {
            title: "Why Choose SadhyamIAS?",
            description: "A complete ecosystem to help you crack your dream exam.",
            decoration: "Sapna Taiyaari Prayas Seva",
            items: [
                { iconName: "ClipboardList", tone: "red", title: "Exam-Focused Content", text: "Designed by experts as per latest pattern" },
                { iconName: "BookOpen", tone: "blue", title: "Real Exam Tests", text: "Chapter-wise, sectional and full-length tests" },
                { iconName: "Users", tone: "green", title: "Expert Faculty", text: "Learn from experienced mentors" },
                { iconName: "Sparkles", tone: "purple", title: "Detailed Solutions", text: "Step-by-step explanations" },
                { iconName: "ShieldCheck", tone: "teal", title: "Performance Analysis", text: "AI-powered insights to track your growth" },
                { iconName: "FileText", tone: "orange", title: "Study Material", text: "High-quality PDFs, notes and resources" },
            ],
        },
        courses: { title: "Popular Courses", description: "Comprehensive courses designed for your exam success.", actionText: "View All Courses", actionLink: "/courses", count: 4 },
        tests: { title: "Test Series", description: "Practice with real exam level questions and improve your rank.", actionText: "View All Test Series", actionLink: "/test-series", count: 4 },
        materials: { title: "Study Material", description: "Exam-oriented notes and PDFs prepared by subject experts.", actionText: "View All Study Material", actionLink: "/study-material", count: 4 },
        faculty: { title: "Learn from the Best Faculty", description: "Experienced mentors to guide you at every step.", actionText: "View All Faculty", actionLink: "/faculty", count: 5 },
        results: { title: "Our Results Speak for Themselves", description: "Join thousands of successful students.", actionText: "View Success Stories", actionLink: "/results", count: 4 },
        testimonials: { title: "What Our Students Say", description: "Real stories from real aspirants.", items: testimonials },
        cta: {
            title: "Start Your Preparation Today",
            description: "Join SadhyamIAS and get access to premium courses, test series,\nstudy material and expert guidance.",
            btnText: "Create Free Account",
            btnLink: "/signup",
            secondaryBtnText: "Explore Courses",
            secondaryBtnLink: "/courses",
            tagline: "Ek Behtar Kal Ke Liye",
            image: "/parliament.jpg",
        },
        sectionVisibility: { hero: true, stats: true, features: true, courses: true, tests: true, materials: false, faculty: true, results: true, testimonials: true, cta: true },
    },

    about: {
        hero: {
            eyebrow: "ABOUT SADHYAMIAS",
            title: "Your Journey. Our Commitment.",
            description: "A complete ecosystem to help you prepare for competitive examinations with confidence.",
            bannerImages: [] as string[],
            primaryButton: { text: "Explore Courses", link: "/courses" },
            secondaryButton: { text: "Meet Our Faculty", link: "/faculty" },
        },
        story: {
            title: "Our Story",
            paragraphs: [
                "SadhyamIAS began with a simple belief: every aspirant deserves clear guidance, quality material and honest practice — wherever they live and whatever their background.",
                "What started as handwritten notes and small test groups has grown into a complete learning platform trusted by thousands of students preparing for UPSC, State PSCs and other competitive exams.",
            ],
            image: "/parliament.jpg",
        },
        mission: { title: "Our Mission", text: "To make high-quality, exam-focused preparation accessible and affordable for every aspirant in India." },
        vision: { title: "Our Vision", text: "To build India's most trusted learning community for public-service examinations." },
        stats: [
            { value: "50,000+", label: "Students Learning" },
            { value: "2,500+", label: "Video Lectures" },
            { value: "1,000+", label: "Practice Tests" },
            { value: "500+", label: "Selections & Success Stories" },
        ],
        whyChoose: [
            { title: "Exam-Focused Content", description: "Curated notes, PDFs and test series as per the latest exam pattern.", tone: "orange" },
            { title: "Expert Guidance", description: "Learn from experienced faculty and successful candidates.", tone: "purple" },
            { title: "Practice & Performance", description: "Regular tests with detailed analysis to track your growth.", tone: "green" },
            { title: "Affordable & Accessible", description: "High-quality resources at accessible prices.", tone: "blue" },
            { title: "Community Support", description: "Learn alongside a motivated community of aspirants.", tone: "rose" },
        ],
        timeline: [
            { year: "2020", title: "The Beginning", description: "Started with handwritten notes and small test series for students." },
            { year: "2021", title: "Growing Community", description: "Expanded online with more subjects and practice tests." },
            { year: "2022", title: "Trusted by Thousands", description: "Introduced additional learning resources and video lectures." },
            { year: "2024", title: "Pan India Reach", description: "Growing a learning community across India." },
            { year: "Future", title: "Bigger Impact", description: "Continuing to support aspirants on their journey to success." },
        ],
        values: [
            { title: "Student First", description: "Every decision is made with students in mind." },
            { title: "Quality Learning", description: "Clear explanations and structured learning resources." },
            { title: "Consistency", description: "Build strong preparation habits through regular practice." },
            { title: "Integrity", description: "Honest guidance, transparent pricing and real results." },
        ],
        sectionVisibility: { hero: true, story: true, stats: true, whyChoose: true, timeline: true, values: true, cta: true },
    },

    courses: {
        hero: {
            eyebrow: "COURSES",
            title: "All Courses",
            description: "Comprehensive, structured and exam-focused courses to help you achieve your goals.",
            bannerImages: [] as string[],
            highlights: ["Expert Faculty", "Enhanced Learning", "Updated Content", "Doubt Support"],
        },
        examTabs: ["All Courses", ...examTabs],
        items: courses,
        sectionVisibility: { hero: true, filters: true, items: true, cta: true },
    },

    courseDetails: {
        heroLabel: "COURSE DETAILS",
        primaryButtonText: "Enroll Now",
        secondaryButtonText: "Add to Cart",
        whyChoose: [
            { title: "Structured Learning", text: "Step-by-step coverage of the entire syllabus." },
            { title: "Expert Faculty", text: "Learn from experienced mentors and subject experts." },
            { title: "Regular Tests", text: "Chapter-wise, sectional and full-length tests." },
            { title: "Doubt Support", text: "Get your doubts resolved by our faculty team." },
        ],
        defaultSyllabus: [
            { title: "Indian Polity", details: "68 Lectures • 20 PDFs • 15 Tests" },
            { title: "Modern History", details: "72 Lectures • 18 PDFs • 20 Tests" },
            { title: "Ancient & Medieval History", details: "60 Lectures • 16 PDFs • 12 Tests" },
            { title: "Geography", details: "80 Lectures • 25 PDFs • 18 Tests" },
            { title: "Indian Economy", details: "65 Lectures • 20 PDFs • 15 Tests" },
            { title: "Environment & Ecology", details: "40 Lectures • 14 PDFs • 12 Tests" },
        ],
        sections: {
            overview: { title: "Why Choose This Course", visible: true },
            includes: { title: "What You Will Get", visible: true },
            syllabus: { title: "Course Syllabus", visible: true },
            faculty: { title: "Meet Your Faculty", visible: true },
            testimonials: { title: "Student Reviews", visible: true },
            faqs: { title: "Frequently Asked Questions", visible: true },
        },
        faqs: [
            { question: "What is the validity of this course?", answer: "The course is valid for the duration mentioned in the course highlights, starting from the date your payment is confirmed." },
            { question: "Are the lectures live or recorded?", answer: "Most courses include a mix of live interactive classes and recorded lectures. The included features are listed on each course." },
            { question: "Can I access the course on mobile?", answer: "Yes. Sign in with your SadhyamIAS account on any device to access your enrolled courses." },
            { question: "Is there doubt-clearing support?", answer: "Yes, courses that list Doubt Support include dedicated doubt-clearing sessions." },
        ],
        help: { title: "Need help choosing?", text: "Talk to our academic counsellors for free guidance." },
    },

    testSeries: {
        hero: {
            eyebrow: "TEST SERIES",
            title: "Practice. Analyse. Improve.",
            description: "Practice with exam-level questions and improve your performance.",
            bannerImages: [] as string[],
            highlights: ["Real Exam Interface", "Detailed Solutions", "All India Ranking", "Performance Analysis"],
        },
        examTabs: ["All Test Series", ...examTabs],
        items: testSeries,
        sectionVisibility: { hero: true, filters: true, items: true, cta: true },
    },

    testSeriesDetails: {
        primaryButtonText: "Enroll Now",
        secondaryButtonText: "Add to Cart",
        whyTake: [
            { title: "Latest Pattern", text: "Questions framed on the latest exam pattern and trends." },
            { title: "Detailed Solutions", text: "Every question comes with a step-by-step explanation." },
            { title: "All India Ranking", text: "Compare your performance with aspirants across India." },
            { title: "Deep Analysis", text: "Topic-wise strengths and weaknesses after every test." },
        ],
        defaultStructure: [
            { title: "Sectional Tests", details: "Subject-wise tests to build concepts" },
            { title: "Full Length Tests", details: "Complete papers in real exam conditions" },
            { title: "Current Affairs Tests", details: "Monthly tests on recent events" },
            { title: "Revision Tests", details: "Final revision before the exam" },
        ],
        sections: {
            overview: { title: "About This Test Series", visible: true },
            structure: { title: "Test Series Structure", visible: true },
            whyTake: { title: "Why Take This Test Series?", visible: true },
            schedule: { title: "Test Schedule", visible: true },
            testimonials: { title: "Student Reviews", visible: true },
            faqs: { title: "Frequently Asked Questions", visible: true },
        },
        faqs: [
            { question: "Are solutions provided?", answer: "Yes, every test includes detailed solutions and explanations." },
            { question: "Can I attempt tests later?", answer: "Tests remain available for the validity of the series once they are released." },
            { question: "Will I get an all-India rank?", answer: "Yes, test series that list All India Ranking show your rank after each test." },
        ],
    },

    studyMaterial: {
        hero: {
            eyebrow: "STUDY MATERIAL",
            title: "Quality Notes. Focused Preparation.",
            description: "Exam-oriented notes, PDFs and resources for your preparation.",
            bannerImages: [] as string[],
            highlights: ["Expert-written Notes", "Updated Regularly", "PDF & Printed", "Exam-oriented"],
        },
        examTabs: ["All Study Material", ...examTabs],
        subjects: [
            { id: "polity", title: "Indian Polity", details: "12 PDFs • 850+ Pages" },
            { id: "modern-history", title: "Modern History", details: "14 PDFs • 900+ Pages" },
            { id: "ancient-medieval-history", title: "Ancient & Medieval History", details: "12 PDFs • 780+ Pages" },
            { id: "geography", title: "Geography", details: "16 PDFs • 950+ Pages" },
            { id: "economy", title: "Indian Economy", details: "14 PDFs • 820+ Pages" },
            { id: "environment", title: "Environment & Ecology", details: "10 PDFs • 600+ Pages" },
            { id: "science-tech", title: "Science & Technology", details: "10 PDFs • 550+ Pages" },
            { id: "current-affairs", title: "Current Affairs", details: "Monthly PDFs • Year-wise Compilation" },
        ],
        whyChoose: [
            { title: "Written by Experts", text: "Prepared by experienced faculty and toppers." },
            { title: "Always Updated", text: "Revised for the latest syllabus and current affairs." },
            { title: "Exam-oriented", text: "Focused on what is asked in the exam." },
            { title: "Easy to Revise", text: "Maps, flowcharts and summaries for quick revision." },
        ],
        items: studyMaterials,
        sectionVisibility: { hero: true, subjects: true, filters: true, items: true, whyChoose: true, cta: true },
    },

    studyMaterialDetails: {
        primaryButtonText: "Buy Now",
        secondaryButtonText: "Add to Cart",
        defaultContents: [
            { title: "Indian Polity", details: "Constitution, Parliament, Judiciary, Governance" },
            { title: "History", details: "Ancient, Medieval, Modern and Post-independence" },
            { title: "Geography", details: "Physical, Indian and World Geography with maps" },
            { title: "Economy", details: "Concepts, Budget, Survey and Schemes" },
            { title: "Environment", details: "Ecology, Biodiversity, Climate Change" },
        ],
        benefits: [
            { title: "Concise & Complete", text: "Everything you need without the clutter." },
            { title: "PYQ Integrated", text: "Previous-year questions mapped to every topic." },
            { title: "Revision Friendly", text: "Summaries and mind-maps at the end of each chapter." },
            { title: "Lifetime PDF Access", text: "Download and study anytime, on any device." },
        ],
        sections: {
            overview: { title: "About This Material", visible: true },
            contents: { title: "Subjects Covered", visible: true },
            samplePages: { title: "Preview Sample Pages", visible: true },
            benefits: { title: "Key Benefits", visible: true },
            testimonials: { title: "Student Reviews", visible: true },
            faqs: { title: "Frequently Asked Questions", visible: true },
        },
        faqs: [
            { question: "What format is the material?", answer: "The format (PDF, printed or both) is shown on each product." },
            { question: "Can I download the material?", answer: "Yes. Purchased material appears in My Study Material right after payment, where you can read it online." },
            { question: "Is printed material shipped?", answer: "Printed material is shipped to the address in your profile within 7 working days." },
        ],
    },

    faculty: {
        hero: {
            eyebrow: "OUR FACULTY",
            title: "Learn from the Best Faculty",
            description: "Experienced mentors to guide you at every step.",
            bannerImages: [] as string[],
            highlights: ["Subject Experts", "Ex-Civil Servants", "Toppers as Mentors", "Personal Guidance"],
        },
        stats: [
            { value: "50+", label: "Expert Faculty" },
            { value: "15+", label: "Years Avg. Experience" },
            { value: "50,000+", label: "Students Mentored" },
            { value: "500+", label: "Selections" },
        ],
        subjects: ["All Faculty", "Polity", "Geography", "History", "Economy", "Environment", "Current Affairs"],
        intro: {
            title: "Mentors Who Care",
            text: "Our faculty bring years of classroom experience, deep subject knowledge and a genuine commitment to each student's success. Every course is designed and taught by people who know the exam inside out.",
            image: "/parliament.jpg",
            badge: "Guiding Aspirants Since 2020",
        },
        items: faculty,
        sectionVisibility: { hero: true, stats: true, subjects: true, items: true, intro: true, cta: true },
    },

    facultyDetails: {
        sections: {
            profile: { title: "About the Faculty", visible: true },
            approach: { title: "Teaching Approach", visible: true },
            courses: { title: "Courses by This Faculty", visible: true },
            testimonials: { title: "What Students Say", visible: true },
        },
        approach: [
            { title: "Concept Clarity", text: "Builds strong fundamentals before moving to advanced topics." },
            { title: "PYQ Focus", text: "Every topic is linked to previous-year questions." },
            { title: "Answer Writing", text: "Regular practice with feedback and model answers." },
        ],
    },

    results: {
        hero: {
            eyebrow: "SUCCESS STORIES",
            title: "Our Results Speak for Themselves",
            description: "Join thousands of successful students.",
            bannerImages: [] as string[],
            highlights: ["500+ Selections", "Top Ranks Every Year", "All State PSCs", "Proven Strategy"],
        },
        stats: [
            { value: "500+", label: "Total Selections" },
            { value: "45", label: "Best AIR (UPSC 2023)" },
            { value: "120+", label: "State PSC Selections" },
            { value: "50,000+", label: "Students Trained" },
        ],
        examTabs: ["All Exams", ...examTabs],
        toppers,
        videos: [
            { title: "How I cleared UPSC in my second attempt", name: "Aditi Sharma", rank: "AIR 45", thumbnail: IMG("photo-1573496359142-b8d87734a5a2", 600), videoUrl: "" },
            { title: "My UPPSC strategy and booklist", name: "Rohit Yadav", rank: "Rank 12", thumbnail: IMG("photo-1506794778202-cad84cf45f1d", 600), videoUrl: "" },
            { title: "Cracking RAS while working full-time", name: "Priya Singh", rank: "Rank 8", thumbnail: IMG("photo-1580489944761-15a19d654956", 600), videoUrl: "" },
        ],
        yearly: [
            { year: "2023", selections: "180+", note: "Selections across UPSC & State PSCs" },
            { year: "2022", selections: "140+", note: "Selections across UPSC & State PSCs" },
            { year: "2021", selections: "95+", note: "Selections across UPSC & State PSCs" },
            { year: "2020", selections: "60+", note: "Selections across UPSC & State PSCs" },
        ],
        sectionVisibility: { hero: true, stats: true, toppers: true, videos: true, yearlyResults: true, testimonials: true, cta: true },
    },

    cart: {
        title: "Your Learning Cart",
        description: "Review your selected courses, test series and study material.",
        emptyState: { title: "Your cart is waiting", description: "Explore courses and add resources to begin your preparation.", buttonText: "Explore Courses", buttonLink: "/courses" },
        trustBadges: ["Secure Checkout", "Expert Support", "Instant Confirmation", "Trusted by 50,000+ Students"],
    },

    auth: {
        showSideBanner: true,
        sideImages: [] as string[],
        showGoogle: true,
        login: {
            title: "Welcome",
            highlight: "Back!",
            subtitle: "Log in to continue your preparation journey.",
            buttonText: "Log In",
            googleText: "Continue with Google",
            forgotText: "Forgot password?",
            signupPrompt: "New to SadhyamIAS?",
            signupLinkText: "Create an account",
        },
        signup: {
            title: "Create Your",
            highlight: "Account",
            subtitle: "Join thousands of aspirants preparing with SadhyamIAS.",
            buttonText: "Create Account",
            googleText: "Sign up with Google",
            askMobile: true,
            askExam: true,
            loginPrompt: "Already have an account?",
            loginLinkText: "Log in",
        },
        forgot: {
            title: "Reset Your",
            highlight: "Password",
            subtitle: "Enter your registered email and we'll send you a reset link.",
            buttonText: "Send Reset Link",
            successText: "If an account exists for this email, a password reset link is on its way. Check your inbox and spam folder.",
        },
        checkoutPrompt: {
            title: "Log in to place your order",
            description: "Log in or create a free account to continue. Your cart is saved.",
        },
    },

    contact: {
        hero: { eyebrow: "CONTACT US", title: "We're Here to Help", description: "Questions about courses, payments or your account? Reach out and our team will get back to you within 24 hours.", bannerImages: [] as string[] },
        formTitle: "Send Us a Message",
        subjects: ["Course Enquiry", "Payment / Order", "Technical Issue", "Feedback", "Other"],
        mapEmbedUrl: "",
    },

    help: {
        hero: { eyebrow: "HELP CENTER", title: "How Can We Help You?", description: "Find quick answers about your account, purchases and learning.", bannerImages: [] as string[] },
        topics: [
            { iconName: "UserRound", title: "Account & Login", text: "Creating an account, signing in and resetting your password.", link: "/faqs" },
            { iconName: "ShoppingCart", title: "Orders & Payments", text: "Placing orders, payment confirmation and invoices.", link: "/faqs" },
            { iconName: "PlayCircle", title: "Courses & Classes", text: "Accessing lectures, notes and live classes.", link: "/faqs" },
            { iconName: "ClipboardList", title: "Test Series", text: "Attempting tests, results and rankings.", link: "/faqs" },
            { iconName: "FileText", title: "Study Material", text: "Downloading PDFs and printed material delivery.", link: "/faqs" },
            { iconName: "RefreshCcw", title: "Refunds", text: "Our refund policy and how to raise a request.", link: "/refund-policy" },
        ],
    },

    faqs: {
        hero: { eyebrow: "FAQS", title: "Frequently Asked Questions", description: "Everything you need to know about SadhyamIAS.", bannerImages: [] as string[] },
        items: [
            { category: "General", question: "What is SadhyamIAS?", answer: "SadhyamIAS is an online learning platform for UPSC, State PSC and other competitive examinations, offering courses, test series and study material." },
            { category: "General", question: "Which exams do you cover?", answer: "We cover UPSC CSE, UPPSC, UKPSC, RAS, SSC, Banking and other competitive exams." },
            { category: "Account", question: "How do I create an account?", answer: "Click Sign Up at the top of any page and register with your email or Google account." },
            { category: "Account", question: "I forgot my password. What should I do?", answer: "Use the 'Forgot password?' link on the login page to receive a reset link by email." },
            { category: "Payments", question: "How do I pay for a course?", answer: "Add items to your cart, apply any coupon and place your order. Follow the payment instructions shown after checkout." },
            { category: "Payments", question: "When will my course be activated?", answer: "Instantly. As soon as your online payment succeeds, courses appear in My Courses, test series in My Test Series and study material in My Study Material." },
            { category: "Courses", question: "Can I watch lectures on my phone?", answer: "Yes, all content works on mobile, tablet and desktop browsers." },
            { category: "Test Series", question: "Do tests have negative marking?", answer: "Tests follow the marking scheme of the actual exam, including negative marking where applicable." },
        ],
    },

    legal: {
        refund: {
            title: "Refund Policy",
            updatedOn: "1 January 2025",
            content: "## Overview\nWe want you to be satisfied with your purchase. This policy explains when refunds are available.\n\n## Eligibility\n- Refund requests must be raised within 7 days of payment confirmation.\n- Less than 20% of the course content should have been accessed.\n- Printed study material that has been shipped is not eligible for refund.\n\n## How to request a refund\nWrite to us from the Contact page with your order number and the reason for the request. Approved refunds are processed to the original payment method within 7–10 working days.",
        },
        terms: {
            title: "Terms & Conditions",
            updatedOn: "1 January 2025",
            content: "## Acceptance of terms\nBy using SadhyamIAS you agree to these terms.\n\n## Accounts\n- You are responsible for keeping your login details secure.\n- Accounts are for individual use and may not be shared.\n\n## Content\nAll course content, notes and tests are the intellectual property of SadhyamIAS and may not be copied, recorded or redistributed.\n\n## Payments\nPrices are shown in Indian Rupees and include applicable taxes unless stated otherwise.",
        },
        privacy: {
            title: "Privacy Policy",
            updatedOn: "1 January 2025",
            content: "## Information we collect\nWe collect your name, email, mobile number and exam preference when you create an account, and order details when you make a purchase.\n\n## How we use it\n- To provide access to the courses you purchase.\n- To send important updates about your account and orders.\n- To improve our content and services.\n\n## Your choices\nYou can update your profile at any time from My Profile, or contact us to delete your account.",
        },
    },
};

export type AllSiteContent = typeof defaultSiteContent;
export type ContentKey = keyof AllSiteContent;

export const CONTENT_KEYS = Object.keys(defaultSiteContent) as ContentKey[];
