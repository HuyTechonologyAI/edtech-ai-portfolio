import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Đọc site URL từ biến môi trường hoặc fallback về domain mặc định
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zentratech.io";

  // 1. Danh sách các trang tĩnh cốt lõi
  const staticRoutes = [
    "",
    "/pricing",
    "/roadmap",
    "/rewards",
    "/videos",
    "/resources",
    "/contact",
    "/auth"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8
  }));

  // 2. Lấy danh sách Ebooks/Slides từ CSDL để index trực tiếp các tài nguyên
  let resourceRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: resources } = await supabase
      .from("resources")
      .select("id, created_at")
      .order("created_at", { ascending: false });

    if (resources) {
      resourceRoutes = resources.map((res) => ({
        url: `${baseUrl}/resources?id=${res.id}`,
        lastModified: res.created_at ? new Date(res.created_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6
      }));
    }
  } catch (err) {
    console.error("Error generating sitemap for resources:", err);
  }

  // 3. Lấy danh sách Video bài giảng từ CSDL để index trực tiếp video
  let videoRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: videos } = await supabase
      .from("videos")
      .select("id, created_at")
      .order("created_at", { ascending: false });

    if (videos) {
      videoRoutes = videos.map((vid) => ({
        url: `${baseUrl}/videos?id=${vid.id}`,
        lastModified: vid.created_at ? new Date(vid.created_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6
      }));
    }
  } catch (err) {
    console.error("Error generating sitemap for videos:", err);
  }

  return [...staticRoutes, ...resourceRoutes, ...videoRoutes];
}
