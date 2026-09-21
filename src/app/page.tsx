import type { Metadata } from "next";
import { CorporateHomePageV2 } from "@/components/v2/CorporateHomePageV2";

export const metadata: Metadata = {
  title: "HUY TECHNOLOGY AI GROUP | Hệ sinh thái AI Agency & Tự động hóa",
  description:
    "Hệ sinh thái công nghệ kết nối các giải pháp AI, Tự động hóa, Giáo dục số, Pháp lý thuế và Truyền thông chuyên biệt trên nền tảng điều phối đa tác tử an toàn theo chuẩn HAIP/1.0.",
  alternates: {
    canonical: "https://www.huycncdsai.io.vn/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return <CorporateHomePageV2 />;
}
