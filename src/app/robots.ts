import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zentratech.io";

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
