import { courses } from "../data/courses";
import type { Course } from "../types";

/**
 * طبقة البيانات.
 * حالياً تقرأ من ملف محلي. لاحقاً استبدل الجسم بنداء Supabase دون تغيير أي مكوّن:
 *
 *   import { createClient } from "@supabase/supabase-js";
 *   const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
 *
 *   export async function getCourses(): Promise<Course[]> {
 *     const { data, error } = await supabase.from("courses").select("*").order("sort_order");
 *     if (error) throw error;
 *     return data as Course[];
 *   }
 */
export async function getCourses(): Promise<Course[]> {
  return courses;
}
