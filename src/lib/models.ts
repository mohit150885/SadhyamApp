// Shared data shapes used by the public site and the admin panel.
// Catalog items live in Firestore inside site_content/{page}.items.

export type Tone = "red" | "blue" | "green" | "purple" | "teal" | "orange" | "amber" | "rose" | "emerald" | "slate";

export interface LinkItem {
    label: string;
    href: string;
}

export interface TitledDetail {
    title: string;
    details: string;
}

export interface Faq {
    question: string;
    answer: string;
}

/** Optional scheduling + countdown settings shared by courses, tests and material. */
export interface Schedulable {
    /** ISO date-time: batch start / test date / launch. */
    startsAt?: string;
    /** ISO date-time: offer or enrolment end. */
    endsAt?: string;
    showCountdown?: boolean;
    countdownTo?: "Start date" | "End date" | string;
    countdownLabel?: string;
}

export interface Course extends Schedulable {
    id: string;
    title: string;
    category: string;
    type: string;
    language: string;
    instructor: string;
    lectures: string;
    pdfs: string;
    tests?: string;
    validity: string;
    rating: number;
    reviews: string;
    price: number;
    oldPrice: number;
    image: string;
    badge?: string;
    bestseller?: boolean;
    featured?: boolean;
    published?: boolean;
    features: string[];
    description?: string;
    highlights?: string[];
    syllabus?: TitledDetail[];
    faqs?: Faq[];
    facultyIds?: string[];
    previewVideo?: string;
}

export interface TestSeries extends Schedulable {
    id: string;
    title: string;
    category: string;
    type: string;
    language: string;
    instructor: string;
    tests: string;
    questions: string;
    validity: string;
    rating: number;
    reviews: string;
    price: number;
    oldPrice: number;
    image: string;
    badge?: string;
    tone?: Tone;
    featured?: boolean;
    published?: boolean;
    features: string[];
    description?: string;
    structure?: TitledDetail[];
    schedule?: { date: string; title: string; topic: string; startsAt?: string; showCountdown?: boolean }[];
    faqs?: Faq[];
    sampleUrl?: string;
}

export interface StudyMaterial extends Schedulable {
    id: string;
    title: string;
    category: string;
    subject?: string;
    language?: string;
    format?: string;
    pages: string;
    rating: number;
    reviews: string;
    price: number;
    oldPrice: number;
    image: string;
    badge?: string;
    featured?: boolean;
    published?: boolean;
    tags: string[];
    description?: string;
    contents?: TitledDetail[];
    samplePages?: string[];
    faqs?: Faq[];
    sampleUrl?: string;
}

export interface FacultyMember {
    id: string;
    name: string;
    subject: string;
    experience: string;
    bullets: string[];
    image: string;
    bio?: string;
    quote?: string;
    students?: string;
    rating?: string;
    videoUrl?: string;
    featured?: boolean;
    published?: boolean;
}

export interface Topper {
    id: string;
    name: string;
    exam: string;
    rank: string;
    quote: string;
    image: string;
    color?: Tone;
    category?: string;
    featured?: boolean;
    videoUrl?: string;
}

export interface Testimonial {
    name: string;
    role: string;
    quote: string;
    image: string;
    rating?: number;
}

export type ProductKind = "course" | "test" | "material";

export interface CartLine {
    kind: ProductKind;
    id: string;
}

export interface OrderLine {
    kind: ProductKind;
    id: string;
    title: string;
    price: number;
    oldPrice: number;
    image: string;
}

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    userMobile?: string;
    items: OrderLine[];
    subtotal: number;
    discount: number;
    couponCode?: string;
    total: number;
    status: OrderStatus;
    paymentMethod?: string;
    paymentReference?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    note?: string;
    createdAt: number;
    updatedAt?: number;
}

export interface Coupon {
    id: string;
    code: string;
    description?: string;
    type: "percent" | "flat";
    value: number;
    minAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    used?: number;
    validFrom?: string;
    validTo?: string;
    active: boolean;
    appliesTo?: "all" | ProductKind;
}

export interface Review {
    id: string;
    kind: ProductKind | "faculty";
    itemId: string;
    itemTitle?: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    status: "pending" | "approved" | "rejected";
    createdAt: number;
}

export interface SiteNotification {
    id: string;
    title: string;
    message: string;
    link?: string;
    type?: "info" | "offer" | "exam" | "result";
    published: boolean;
    createdAt: number;
}

export interface SupportQuery {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    subject: string;
    message: string;
    status: "open" | "in-progress" | "resolved";
    reply?: string;
    createdAt: number;
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    mobile: string;
    exam: string;
    photoURL?: string;
    city?: string;
    blocked?: boolean;
    createdAt?: unknown;
}
