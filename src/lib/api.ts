import { fetchCourses } from "./content";
import type { Course } from "../types";

export async function getCourses(): Promise<Course[]> {
  return fetchCourses();
}
