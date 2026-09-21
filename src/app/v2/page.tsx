import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CorporateHomePageV2 } from "@/components/v2/CorporateHomePageV2";

const isProduction = process.env.VERCEL_ENV === "production";

export const metadata: Metadata = {
  title: "HUY TECHNOLOGY AI GROUP | Kiến tạo hệ sinh thái vận hành bằng AI",
  description:
    "Hệ sinh thái công nghệ kết nối các giải pháp AI, Tự động hóa, Giáo dục số, Pháp lý thuế và Truyền thông đa phương tiện trên nền tảng điều phối đa tác tử bảo mật.",
  alternates: {
    canonical: "https://www.huycncdsai.io.vn/",
  },
  robots: { index: false, follow: false },
};

export default function V2PreviewPage() {
  if (isProduction) {
    redirect("/");
  }
  return <CorporateHomePageV2 />;
}
