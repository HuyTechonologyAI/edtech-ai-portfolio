import type { Metadata } from "next";
import { CorporateHomePageV2 } from "@/components/v2/CorporateHomePageV2";

const isPreview = process.env.VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

export const metadata: Metadata = {
  title: "HUY TECHNOLOGY AI GROUP | Kiến tạo hệ sinh thái vận hành bằng AI",
  description: "Hệ sinh thái công nghệ kết nối các giải pháp AI, Tự động hóa, Giáo dục số, Pháp lý thuế và Truyền thông đa phương tiện trên nền tảng điều phối đa tác tử bảo mật.",
  robots: isPreview
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

export default function V2PreviewPage() {
  return <CorporateHomePageV2 />;
}
