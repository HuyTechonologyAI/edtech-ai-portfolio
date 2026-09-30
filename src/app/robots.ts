import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.huycncdsai.io.vn";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/checkout/",
        "/api/",
        "/auth/callback"
      ]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
