import type { Metadata } from "next";
import { CorporateHomePageV2 } from "@/components/v2/CorporateHomePageV2";

export const metadata: Metadata = {
  title: "HUY TECHNOLOGY AI GROUP | Kiến tạo hệ sinh thái vận hành bằng AI",
  description: "Tập đoàn công nghệ kết nối các giải pháp AI, Tự động hóa, Giáo dục số, Pháp lý thuế và Truyền thông đa phương tiện trên nền tảng điều phối đa tác tử bảo mật.",
};

export default function V2PreviewPage() {
  return <CorporateHomePageV2 />;
}
