import type { Metadata } from "next";
import { AdminClient } from "./AdminClient";

export const metadata: Metadata = {
  title: "Physician Admin Portal | National Urology Center",
  description: "Direct physician login and Markdown content manager for Dr. Arun Shah.",
  robots: "noindex, nofollow",
};

export default function AdminPage() {
  return <AdminClient />;
}
