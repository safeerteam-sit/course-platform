import { courses as defaultCourses } from "../data/courses";
import { siteConfig as defaultSiteConfig } from "../config";
import { faqs as defaultFaqs } from "../data/content";
import { supabase } from "./supabase";
import { readJSON, writeJSON } from "./storage";
import type { Course, Testimonial } from "../types";

export interface FAQItem {
  q: string;
  a: string;
}

export type SiteConfigType = typeof defaultSiteConfig;

const COURSES_CACHE_KEY = "cp.cache.courses";
const CONFIG_CACHE_KEY = "cp.cache.config";
const FAQS_CACHE_KEY = "cp.cache.faqs";
const TESTIMONIALS_CACHE_KEY = "cp.cache.testimonials";

export const CONTENT_UPDATED_EVENT = "cp:content_updated";

function notifyUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));
  }
}

/* ───────────── الكورسات ───────────── */

export async function fetchCourses(): Promise<Course[]> {
  if (!supabase) {
    return readJSON<Course[]>(COURSES_CACHE_KEY, defaultCourses);
  }

  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "courses")
      .maybeSingle();

    if (error || !data?.value) {
      // Fallback to cached or defaults
      return readJSON<Course[]>(COURSES_CACHE_KEY, defaultCourses);
    }

    const fetched = data.value as Course[];
    writeJSON(COURSES_CACHE_KEY, fetched);
    return fetched;
  } catch {
    return readJSON<Course[]>(COURSES_CACHE_KEY, defaultCourses);
  }
}

export async function saveCoursesToDB(courses: Course[]): Promise<void> {
  writeJSON(COURSES_CACHE_KEY, courses);
  notifyUpdated();

  if (!supabase) return;

  const { error } = await supabase
    .from("site_content")
    .upsert({ key: "courses", value: courses, updated_at: new Date().toISOString() });

  if (error) {
    console.error("Failed to save courses to Supabase:", error);
    throw new Error("تعذّر حفظ الكورسات في قاعدة البيانات.");
  }
}

/* ───────────── إعدادات الموقع ───────────── */

export async function fetchSiteConfig(): Promise<SiteConfigType> {
  if (!supabase) {
    return readJSON<SiteConfigType>(CONFIG_CACHE_KEY, defaultSiteConfig);
  }

  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "site_config")
      .maybeSingle();

    if (error || !data?.value) {
      return readJSON<SiteConfigType>(CONFIG_CACHE_KEY, defaultSiteConfig);
    }

    const fetched = { ...defaultSiteConfig, ...(data.value as Partial<SiteConfigType>) };
    writeJSON(CONFIG_CACHE_KEY, fetched);
    return fetched;
  } catch {
    return readJSON<SiteConfigType>(CONFIG_CACHE_KEY, defaultSiteConfig);
  }
}

export async function saveSiteConfigToDB(config: SiteConfigType): Promise<void> {
  writeJSON(CONFIG_CACHE_KEY, config);
  notifyUpdated();

  if (!supabase) return;

  const { error } = await supabase
    .from("site_content")
    .upsert({ key: "site_config", value: config, updated_at: new Date().toISOString() });

  if (error) {
    console.error("Failed to save site config to Supabase:", error);
    throw new Error("تعذّر حفظ إعدادات الموقع.");
  }
}

/* ───────────── آراء وتقييمات الطلاب ───────────── */

export async function fetchTestimonials(): Promise<Testimonial[]> {
  if (!supabase) {
    return readJSON<Testimonial[]>(TESTIMONIALS_CACHE_KEY, defaultSiteConfig.testimonials);
  }

  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "testimonials")
      .maybeSingle();

    if (error || !data?.value) {
      return readJSON<Testimonial[]>(TESTIMONIALS_CACHE_KEY, defaultSiteConfig.testimonials);
    }

    const fetched = data.value as Testimonial[];
    writeJSON(TESTIMONIALS_CACHE_KEY, fetched);
    return fetched;
  } catch {
    return readJSON<Testimonial[]>(TESTIMONIALS_CACHE_KEY, defaultSiteConfig.testimonials);
  }
}

export async function saveTestimonialsToDB(testimonials: Testimonial[]): Promise<void> {
  writeJSON(TESTIMONIALS_CACHE_KEY, testimonials);
  notifyUpdated();

  if (!supabase) return;

  const { error } = await supabase
    .from("site_content")
    .upsert({ key: "testimonials", value: testimonials, updated_at: new Date().toISOString() });

  if (error) {
    console.error("Failed to save testimonials to Supabase:", error);
    throw new Error("تعذّر حفظ آراء الطلاب.");
  }
}

/* ───────────── الأسئلة الشائعة ───────────── */

export async function fetchFaqs(): Promise<FAQItem[]> {
  if (!supabase) {
    return readJSON<FAQItem[]>(FAQS_CACHE_KEY, defaultFaqs);
  }

  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", "faqs")
      .maybeSingle();

    if (error || !data?.value) {
      return readJSON<FAQItem[]>(FAQS_CACHE_KEY, defaultFaqs);
    }

    const fetched = data.value as FAQItem[];
    writeJSON(FAQS_CACHE_KEY, fetched);
    return fetched;
  } catch {
    return readJSON<FAQItem[]>(FAQS_CACHE_KEY, defaultFaqs);
  }
}

export async function saveFaqsToDB(faqs: FAQItem[]): Promise<void> {
  writeJSON(FAQS_CACHE_KEY, faqs);
  notifyUpdated();

  if (!supabase) return;

  const { error } = await supabase
    .from("site_content")
    .upsert({ key: "faqs", value: faqs, updated_at: new Date().toISOString() });

  if (error) {
    console.error("Failed to save faqs to Supabase:", error);
    throw new Error("تعذّر حفظ الأسئلة الشائعة.");
  }
}
