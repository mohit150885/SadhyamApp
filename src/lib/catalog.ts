// Normalises catalog items (courses, tests, materials, faculty) so older or
// partially-filled Firestore data always renders. Shared by client and server.

import type { Course, FacultyMember, StudyMaterial, TestSeries } from "./models";
import { toNumber } from "./utils";

/* ------------------------------------------------------------------ */
/* Catalog helpers — normalise legacy shapes and hide unpublished items */
/* ------------------------------------------------------------------ */

export function asArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}

function cleanStrings(value: unknown): string[] {
    return asArray<unknown>(value).filter((v): v is string => typeof v === "string" && v.trim() !== "");
}

export function normalizeCourse(c: Partial<Course> & Record<string, unknown>): Course {
    return {
        ...c,
        id: String(c.id ?? ""),
        title: String(c.title ?? "Untitled course"),
        category: String(c.category ?? "Other Exams"),
        type: String(c.type ?? "Course"),
        language: String(c.language ?? "Hinglish"),
        instructor: String(c.instructor ?? c.faculty ?? "Expert Faculty Team"),
        lectures: String(c.lectures ?? ""),
        pdfs: String(c.pdfs ?? ""),
        tests: c.tests ? String(c.tests) : undefined,
        validity: String(c.validity ?? "1 Year Validity"),
        rating: toNumber(c.rating, 4.5),
        reviews: String(c.reviews ?? "0"),
        price: toNumber(c.price),
        oldPrice: toNumber(c.oldPrice ?? c.old),
        image: String(c.image ?? ""),
        features: cleanStrings(c.features),
        highlights: cleanStrings(c.highlights),
        facultyIds: cleanStrings(c.facultyIds),
        syllabus: asArray(c.syllabus),
        faqs: asArray(c.faqs),
    } as Course;
}

export function normalizeTest(t: Partial<TestSeries> & Record<string, unknown>): TestSeries {
    return {
        ...t,
        id: String(t.id ?? ""),
        title: String(t.title ?? "Test Series"),
        category: String(t.category ?? "Other Exams"),
        type: String(t.type ?? "Full Length"),
        language: String(t.language ?? "Hinglish"),
        instructor: String(t.instructor ?? "Expert Faculty Team"),
        tests: String(t.tests ?? ""),
        questions: String(t.questions ?? ""),
        validity: String(t.validity ?? "1 Year Validity"),
        rating: toNumber(t.rating, 4.5),
        reviews: String(t.reviews ?? "0"),
        price: toNumber(t.price),
        oldPrice: toNumber(t.oldPrice ?? t.old),
        image: String(t.image ?? ""),
        features: cleanStrings(t.features),
        structure: asArray(t.structure),
        schedule: asArray(t.schedule),
        faqs: asArray(t.faqs),
    } as TestSeries;
}

export function normalizeMaterial(m: Partial<StudyMaterial> & Record<string, unknown>): StudyMaterial {
    return {
        ...m,
        id: String(m.id ?? ""),
        title: String(m.title ?? "Study Material"),
        category: String(m.category ?? "Other Exams"),
        pages: String(m.pages ?? ""),
        rating: toNumber(m.rating, 4.5),
        reviews: String(m.reviews ?? "0"),
        price: toNumber(m.price),
        oldPrice: toNumber(m.oldPrice ?? m.old),
        image: String(m.image ?? ""),
        tags: cleanStrings(m.tags),
        contents: asArray(m.contents),
        samplePages: cleanStrings(m.samplePages),
        faqs: asArray(m.faqs),
    } as StudyMaterial;
}

export function normalizeFaculty(f: Partial<FacultyMember> & Record<string, unknown>): FacultyMember {
    return {
        ...f,
        id: String(f.id ?? ""),
        name: String(f.name ?? ""),
        subject: String(f.subject ?? ""),
        experience: String(f.experience ?? f.exp ?? ""),
        bullets: cleanStrings(f.bullets),
        image: String(f.image ?? ""),
    } as FacultyMember;
}

