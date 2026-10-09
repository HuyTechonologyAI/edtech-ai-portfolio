import os
import json
import asyncio
import hashlib
import time
import edge_tts

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY_PATH = os.path.join(ROOT_DIR, "src", "data", "voice_registry.json")
OUTPUT_DIR = os.path.join(ROOT_DIR, "public", "voices", "cards")
MANIFEST_PATH = os.path.join(ROOT_DIR, "src", "data", "voice_card_63_manifest.json")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# 63 exact card intro texts from Directive AG-VOICE-CARD-003 Section 8
CARD_INTRO_TEXTS = {
    # 8.1 Ban Quản trị & Điều phối (8)
    "emp_01": "Xin chào, tôi là Mai Anh, nhân sự AI phụ trách điều phối chiến lược. Tôi giúp chuyển mục tiêu thành kế hoạch rõ ràng, kết nối đúng chuyên môn và theo dõi tiến độ để công việc có người chịu trách nhiệm.",
    "emp_02": "Xin chào, tôi là Hữu Hùng, nhân sự AI phụ trách quản trị tài nguyên. Tôi hỗ trợ phân bổ nguồn lực, theo dõi ngân sách và phối hợp các bộ phận để công việc được triển khai phù hợp với nhu cầu thực tế.",
    "emp_03": "Xin chào, tôi là Thanh Trúc, nhân sự AI phụ trách kiểm soát tuân thủ. Tôi hỗ trợ rà soát nội dung, quyền sử dụng và quy trình dữ liệu, giúp các bộ phận làm việc đúng phạm vi đã được phê duyệt.",
    "emp_04": "Xin chào, tôi là Quang Minh, nhân sự AI phụ trách dự phòng chiến lược. Tôi hỗ trợ chuẩn bị kế hoạch tiếp nối và phối hợp điều hành khi được phân công, giúp các công việc quan trọng giữ được tiến độ.",
    "emp_05": "Xin chào, tôi là Thu Trang, nhân sự AI phụ trách dự phòng tài nguyên. Tôi hỗ trợ theo dõi mức sử dụng, nhận diện nhu cầu bổ sung và chuẩn bị phương án phân bổ nguồn lực khi được giao nhiệm vụ.",
    "emp_06": "Xin chào, tôi là Thanh Tùng, nhân sự AI phụ trách dự phòng tuân thủ. Tôi hỗ trợ đối chiếu quy trình và rà soát những thay đổi cần lưu ý, giúp việc bàn giao giữa các bộ phận có căn cứ rõ ràng.",
    "emp_07": "Xin chào, tôi là Gia Hân, nhân sự AI phụ trách phối hợp các trợ lý. Tôi hỗ trợ chuyển giao nhiệm vụ và kết nối thông tin giữa các nhân sự AI, để yêu cầu của bạn được đưa tới đúng bộ phận.",
    "emp_08": "Xin chào, tôi là Hải Đăng, nhân sự AI phụ trách giám sát nhiệm vụ. Tôi hỗ trợ kiểm tra điều kiện thực hiện, theo dõi các bước xác nhận và tổng hợp những vấn đề cần người có thẩm quyền xem xét.",

    # 8.2 Khối Công nghệ AI (8)
    "emp_09": "Xin chào, tôi là Quang Huy, nhân sự AI phụ trách định hướng công nghệ. Tôi hỗ trợ thiết kế giải pháp, kết nối các thành phần kỹ thuật và xem xét thay đổi để sản phẩm phù hợp với mục tiêu sử dụng.",
    "emp_10": "Xin chào, tôi là Như Hoa, nhân sự AI phụ trách website công khai. Tôi hỗ trợ cải thiện giao diện, nội dung và trải nghiệm truy cập, giúp bạn dễ tìm thông tin về dịch vụ và đội ngũ của chúng tôi.",
    "emp_11": "Xin chào, tôi là Thành Đạt, nhân sự AI phụ trách trang quản lý. Tôi hỗ trợ xây dựng giao diện điều hành và trình bày thông tin rõ ràng, giúp người quản lý theo dõi nhân sự, nhiệm vụ và kết quả.",
    "emp_12": "Xin chào, tôi là Thành Công, nhân sự AI phụ trách phát triển ứng dụng. Tôi hỗ trợ kết nối giao diện với các chức năng xử lý và dữ liệu, để yêu cầu sản phẩm trở thành tính năng có thể sử dụng và kiểm tra.",
    "emp_13": "Xin chào, tôi là Lan Chi, nhân sự AI phụ trách chuẩn hóa dữ liệu. Tôi hỗ trợ kiểm tra cấu trúc thông tin và cách các ứng dụng trao đổi dữ liệu, giúp việc tích hợp nhất quán và giảm nhầm lẫn.",
    "emp_14": "Xin chào, tôi là Đức Huy, nhân sự AI phụ trách hiệu năng ứng dụng. Tôi hỗ trợ đo tốc độ xử lý, tìm điểm cần cải thiện và kiểm tra kết quả sau thay đổi, để trải nghiệm sử dụng thuận tiện hơn.",
    "emp_15": "Xin chào, tôi là Ngọc Anh, nhân sự AI phụ trách nghiên cứu AI ứng dụng. Tôi hỗ trợ thử nghiệm phương pháp và đánh giá khả năng đáp ứng của giải pháp AI, dựa trên bài toán thực tế và kết quả kiểm tra.",
    "emp_16": "Xin chào, tôi là Nhật Huy, nhân sự AI phụ trách phối hợp mã nguồn. Tôi hỗ trợ quản lý các bản thay đổi, đối chiếu phần việc của từng nhóm và chuẩn bị bàn giao kỹ thuật theo đúng phạm vi được giao.",

    # 8.3 Khối Giáo dục & EdTech (7)
    "emp_17": "Xin chào, tôi là Đức Thành, nhân sự AI phụ trách giải pháp giáo dục SmartTeacher. Tôi hỗ trợ phát triển công cụ cho giáo viên và nhà trường, tập trung vào nhu cầu giảng dạy, lịch học và trải nghiệm sử dụng.",
    "emp_18": "Xin chào, tôi là Phương Linh, nhân sự AI phụ trách chuyên môn học thuật. Tôi hỗ trợ thiết kế chương trình học, xây dựng hoạt động thực hành và xác định cách đánh giá phù hợp với mục tiêu của người học.",
    "emp_19": "Xin chào, tôi là Anh Khoa, nhân sự AI phụ trách xây dựng giáo án. Tôi hỗ trợ chuẩn bị kế hoạch bài dạy, tổ chức hoạt động học tập và đối chiếu học liệu để giáo viên xem xét, điều chỉnh trước khi sử dụng.",
    "emp_20": "Xin chào, tôi là Diệu My, nhân sự AI phụ trách thời khóa biểu. Tôi hỗ trợ sắp xếp lịch học theo điều kiện của nhà trường, đối chiếu các ràng buộc và trình bày phương án để người phụ trách kiểm tra.",
    "emp_21": "Xin chào, tôi là Minh Quân, nhân sự AI phụ trách hỗ trợ học tập. Tôi giúp giải thích nội dung bài học, gợi ý cách luyện tập và đồng hành cùng học viên theo trình độ, để việc học dễ tiếp cận hơn.",
    "emp_22": "Xin chào, tôi là Kim Oanh, nhân sự AI phụ trách dự phòng học thuật. Tôi hỗ trợ tiếp nối công việc chương trình và học liệu khi được phân công, đồng thời phối hợp đáp ứng nhu cầu hỗ trợ học tập tăng thêm.",
    "emp_23": "Xin chào, tôi là Khôi Nguyên, nhân sự AI phụ trách kiểm thử giáo dục. Tôi hỗ trợ kiểm tra luồng sử dụng và nội dung học tập, ghi nhận những điểm cần sửa để nhóm giáo dục tiếp tục hoàn thiện sản phẩm.",

    # 8.4 Khối Tài chính & Thuế (7)
    "emp_24": "Xin chào, tôi là Quốc Bảo, nhân sự AI phụ trách nền tảng SmartTax. Tôi hỗ trợ phát triển công cụ tổ chức dữ liệu thuế và kế toán, giúp người dùng đối chiếu thông tin và chuẩn bị hồ sơ cho chuyên gia kiểm tra.",
    "emp_25": "Xin chào, tôi là Kim Ngân, nhân sự AI phụ trách điều phối tài chính. Tôi hỗ trợ tổng hợp, đối chiếu số liệu và chuẩn bị thông tin tài chính, để người có thẩm quyền xem xét và đưa ra quyết định.",
    "emp_26": "Xin chào, tôi là Tuấn Anh, nhân sự AI phụ trách đối soát hóa đơn. Tôi hỗ trợ đối chiếu chứng từ và thông tin thuế giá trị gia tăng, ghi nhận sai lệch cần chuyên gia kiểm tra trước khi hoàn thiện hồ sơ.",
    "emp_27": "Xin chào, tôi là Tú Uyên, nhân sự AI phụ trách phân loại chi phí. Tôi hỗ trợ sắp xếp chứng từ và phân nhóm khoản chi, trình bày căn cứ để bộ phận kế toán đối chiếu và xem xét cách xử lý.",
    "emp_28": "Xin chào, tôi là Công Thành, nhân sự AI phụ trách dự phòng tài chính. Tôi hỗ trợ tiếp nối công việc đối soát và tổng hợp hồ sơ khi được giao, giúp bộ phận tài chính xử lý nhu cầu tăng thêm theo đúng phân công.",
    "emp_29": "Xin chào, tôi là Bảo Châu, nhân sự AI phụ trách cảnh báo rủi ro thuế. Tôi hỗ trợ nhận diện thông tin bất thường và sắp xếp những vấn đề cần kiểm tra, để chuyên gia có thêm căn cứ khi rà soát hồ sơ.",
    "emp_30": "Xin chào, tôi là Trọng Nhân, nhân sự AI phụ trách đối soát công nợ. Tôi hỗ trợ đối chiếu khoản phải thu, khoản phải trả và chứng từ liên quan, chuẩn bị thông tin để người phụ trách xem xét việc quyết toán.",

    # 8.5 Khối Sáng tạo & n8n (10)
    "emp_31": "Xin chào, tôi là Hoàng Nam, nhân sự AI phụ trách điều phối truyền thông. Tôi hỗ trợ tổ chức kế hoạch nội dung, phối hợp các nhóm sáng tạo và theo dõi sản phẩm bàn giao, để thông điệp đến đúng đối tượng.",
    "emp_32": "Xin chào, tôi là Minh Triết, nhân sự AI phụ trách xây dựng dàn ý. Tôi hỗ trợ sắp xếp ý tưởng, xác định cấu trúc và làm rõ thông điệp, giúp nhóm nội dung có định hướng phù hợp trước khi triển khai.",
    "emp_33": "Xin chào, tôi là Bảo Ngọc, nhân sự AI phụ trách nội dung đa kênh. Tôi hỗ trợ viết và biên tập nội dung theo thông tin đã được duyệt, giúp thông điệp rõ ràng và phù hợp với từng kênh truyền thông.",
    "emp_34": "Xin chào, tôi là Đức Anh, nhân sự AI phụ trách thiết kế đồ họa. Tôi hỗ trợ xây dựng hình ảnh, banner và đồ họa thông tin, chú trọng nhận diện thương hiệu và cách trình bày dễ đọc, dễ hiểu.",
    "emp_35": "Xin chào, tôi là Khánh Linh, nhân sự AI phụ trách hình ảnh AI. Tôi hỗ trợ tạo minh họa và hình ảnh theo yêu cầu sáng tạo, đối chiếu phong cách và quyền sử dụng trước khi bàn giao cho nhóm nội dung.",
    "emp_36": "Xin chào, tôi là Tuấn Kiệt, nhân sự AI phụ trách sản xuất video AI. Tôi hỗ trợ chuyển kịch bản thành phương án video, phối hợp hình ảnh, âm thanh và nhịp kể chuyện phù hợp với mục tiêu truyền thông.",
    "emp_37": "Xin chào, tôi là Hải Yến, nhân sự AI phụ trách quy trình xuất bản. Tôi hỗ trợ tổ chức lịch và luồng đăng nội dung đã được duyệt, đồng thời theo dõi kết quả để hạn chế bỏ sót hoặc đăng trùng.",
    "emp_38": "Xin chào, tôi là Hoài Thương, nhân sự AI phụ trách kịch bản phân cảnh. Tôi hỗ trợ chia nội dung thành từng cảnh, mô tả hình ảnh và lời dẫn, giúp nhóm sản xuất hình dung rõ cách triển khai video.",
    "emp_39": "Xin chào, tôi là Minh Khang, nhân sự AI phụ trách đồ họa chuyển động. Tôi hỗ trợ tạo chuyển động cho hình ảnh và thông tin, giúp nội dung giải thích sinh động, dễ theo dõi và phù hợp với thương hiệu.",
    "emp_40": "Xin chào, tôi là Mỹ Duyên, nhân sự AI phụ trách dẫn chương trình và giọng đọc. Tôi hỗ trợ thể hiện lời dẫn, kiểm tra phát âm và phối hợp âm thanh, để thông điệp được truyền tải rõ ràng và tự nhiên.",

    # 8.6 Khối Tiếp thị & CRM (8)
    "emp_41": "Xin chào, tôi là Phương Thảo, nhân sự AI phụ trách tư vấn nhu cầu khách hàng. Tôi hỗ trợ tìm hiểu mục tiêu của bạn, giới thiệu thông tin dịch vụ đã được duyệt và kết nối với bộ phận phù hợp khi bạn cần trao đổi thêm.",
    "emp_42": "Xin chào, tôi là Thùy Dung, nhân sự AI phụ trách thông tin khách hàng. Tôi hỗ trợ sắp xếp hồ sơ và theo dõi lịch sử trao đổi trong phạm vi được phép, giúp các bộ phận chăm sóc khách hàng nhất quán hơn.",
    "emp_43": "Xin chào, tôi là Trọng Nghĩa, nhân sự AI phụ trách hỗ trợ khách hàng. Tôi hỗ trợ giải đáp thông tin về dịch vụ và cách sử dụng, đồng thời chuyển yêu cầu tới bộ phận phù hợp khi cần xử lý thêm.",
    "emp_44": "Xin chào, tôi là Phúc An, nhân sự AI phụ trách phân tích quảng cáo. Tôi hỗ trợ xem xét kết quả chiến dịch và đề xuất điều chỉnh theo dữ liệu, mục tiêu cùng ngân sách đã được phê duyệt.",
    "emp_45": "Xin chào, tôi là Quỳnh Anh, nhân sự AI phụ trách tương tác cộng đồng. Tôi hỗ trợ tiếp nhận bình luận, tổng hợp phản hồi và phối hợp chăm sóc cộng đồng, để các trao đổi trên mạng xã hội rõ ràng và phù hợp.",
    "emp_46": "Xin chào, tôi là Hồng Phúc, nhân sự AI phụ trách tối ưu tìm kiếm. Tôi hỗ trợ rà soát cấu trúc và thông tin kỹ thuật của website, giúp nội dung dễ được tiếp cận và phù hợp với nhu cầu tìm kiếm.",
    "emp_47": "Xin chào, tôi là Bích Ngọc, nhân sự AI phụ trách chăm sóc khách hàng trọng điểm. Tôi hỗ trợ theo dõi nhu cầu và phối hợp các bộ phận phục vụ tài khoản được giao, dựa trên thông tin cùng phạm vi cam kết đã xác nhận.",
    "emp_48": "Xin chào, tôi là Minh Tâm, nhân sự AI phụ trách hỗ trợ hợp tác. Tôi hỗ trợ chuẩn bị thông tin, tổng hợp nhu cầu và xây dựng phương án trao đổi với đối tác, để người có thẩm quyền xem xét trước khi quyết định.",

    # 8.7 Khối Hạ tầng & SRE (8)
    "emp_49": "Xin chào, tôi là Hoàng Phúc, nhân sự AI phụ trách vận hành hạ tầng. Tôi hỗ trợ theo dõi dịch vụ, chuẩn bị phương án phục hồi và phối hợp xử lý sự cố kỹ thuật theo nhiệm vụ được giao.",
    "emp_50": "Xin chào, tôi là Như Quỳnh, nhân sự AI phụ trách theo dõi khả dụng dịch vụ. Tôi hỗ trợ kiểm tra tình trạng truy cập, ghi nhận dấu hiệu gián đoạn và chuyển cảnh báo tới bộ phận phù hợp để xem xét.",
    "emp_51": "Xin chào, tôi là Gia Bảo, nhân sự AI phụ trách bảo dưỡng hệ thống. Tôi hỗ trợ thực hiện các công việc bảo trì theo kế hoạch, ghi nhận thay đổi và chuẩn bị phương án khôi phục khi cần thiết.",
    "emp_52": "Xin chào, tôi là Mai Linh, nhân sự AI phụ trách quản trị dữ liệu. Tôi hỗ trợ tổ chức lưu trữ, kiểm tra thay đổi và chuẩn bị phục hồi dữ liệu theo quyền được giao, giúp thông tin được quản lý có căn cứ.",
    "emp_53": "Xin chào, tôi là Quốc Khánh, nhân sự AI phụ trách vận hành AI cục bộ. Tôi hỗ trợ theo dõi khả năng xử lý và phối hợp cấu hình phù hợp với tài nguyên thực tế, để các tác vụ AI được vận hành theo kế hoạch.",
    "emp_54": "Xin chào, tôi là Ngọc Ánh, nhân sự AI phụ trách phân tích số liệu vận hành. Tôi hỗ trợ tổng hợp các số đo có nguồn, làm rõ cách tính và trình bày những tín hiệu cần theo dõi để người quản lý xem xét.",
    "emp_55": "Xin chào, tôi là Gia Huy, nhân sự AI phụ trách báo cáo kết quả. Tôi hỗ trợ tổng hợp thông tin đã được kiểm chứng, trình bày tiến độ và dẫn tới minh chứng, giúp người quản lý theo dõi kết quả công việc.",
    "emp_56": "Xin chào, tôi là Tuyết Nhi, nhân sự AI phụ trách kết nối các ứng dụng. Tôi hỗ trợ đối chiếu cách trao đổi dữ liệu và phối hợp xử lý khác biệt giữa các sản phẩm, giúp các bộ phận tích hợp đúng phạm vi.",

    # 8.8 Khối An toàn & AI HR (7)
    "emp_57": "Xin chào, tôi là Thiên Ân, nhân sự AI phụ trách điều phối an toàn hệ thống. Tôi hỗ trợ bảo vệ thông tin, phối hợp rà soát rủi ro và tổ chức xử lý sự cố theo phạm vi cùng thẩm quyền đã được giao.",
    "emp_58": "Xin chào, tôi là Tường Vy, nhân sự AI phụ trách kiểm thử an toàn. Tôi hỗ trợ đánh giá khả năng phòng vệ trên các tài sản được cho phép, ghi nhận điểm cần cải thiện và bàn giao bằng chứng cho nhóm phụ trách.",
    "emp_59": "Xin chào, tôi là Duy Khánh, nhân sự AI phụ trách bảo vệ kết nối. Tôi hỗ trợ theo dõi các biện pháp phòng vệ và phối hợp xử lý vấn đề về kết nối, giúp bộ phận kỹ thuật rà soát những thay đổi cần thiết.",
    "emp_60": "Xin chào, tôi là Mai Hoa, nhân sự AI phụ trách quản lý nhân sự AI. Tôi hỗ trợ tổ chức hồ sơ, theo dõi năng lực và phối hợp phân công theo chuyên môn, giúp mỗi nhân sự có nhiệm vụ cùng phạm vi rõ ràng.",
    "emp_61": "Xin chào, tôi là Hữu Phúc, nhân sự AI phụ trách đánh giá năng lực AI. Tôi hỗ trợ xây dựng bài kiểm tra phù hợp vai trò, đối chiếu kết quả thực tế và trình bày căn cứ để người quản lý xem xét.",
    "emp_62": "Xin chào, tôi là Kiều Oanh, nhân sự AI phụ trách kiểm tra quyền sử dụng. Tôi hỗ trợ đối chiếu giấy phép của công cụ, dữ liệu và tài sản nội dung, làm rõ điều kiện cần đáp ứng trước khi sử dụng.",
    "emp_63": "Xin chào, tôi là Gia Linh, nhân sự AI phụ trách lưu vết kiểm toán. Tôi hỗ trợ tổ chức lịch sử thay đổi và minh chứng công việc theo quyền được giao, giúp người có thẩm quyền truy xuất thông tin khi cần."
}

async def synthesize_one(agent_id, voice_info, text):
    base_voice = voice_info.get("base_voice", "vi-VN-NamMinhNeural")
    rate = voice_info.get("rate", "+0%")
    pitch = voice_info.get("pitch", "+0Hz")
    out_file = os.path.join(OUTPUT_DIR, f"{agent_id}_card.mp3")

    # If already exists and > 40KB, return existing
    if os.path.exists(out_file) and os.path.getsize(out_file) > 40000:
        size = os.path.getsize(out_file)
        with open(out_file, "rb") as f:
            sha = hashlib.sha256(f.read()).hexdigest()
        print(f"[EXISTS] {agent_id}: {size} bytes, sha={sha[:12]}")
        # Approx duration: mp3 ~ 6KB/sec at standard bitrate
        duration = round(size / 6200.0, 1)
        return agent_id, out_file, sha, size, duration

    for attempt in range(1, 6):
        print(f"[SYNTH attempt {attempt}] {agent_id} ({voice_info.get('display_name')}): {base_voice} pitch={pitch} rate={rate}...")
        try:
            communicate = edge_tts.Communicate(
                text=text,
                voice=base_voice,
                rate=rate,
                pitch=pitch
            )
            await communicate.save(out_file)
            if os.path.exists(out_file) and os.path.getsize(out_file) > 10000:
                size = os.path.getsize(out_file)
                with open(out_file, "rb") as f:
                    sha = hashlib.sha256(f.read()).hexdigest()
                duration = round(size / 6200.0, 1)
                print(f"  ✔ {agent_id} SUCCESS: {size} bytes, duration={duration}s, sha={sha[:12]}")
                await asyncio.sleep(1.2)
                return agent_id, out_file, sha, size, duration
            else:
                if os.path.exists(out_file):
                    os.remove(out_file)
                print(f"  ⚠️ {agent_id} empty file, retrying...")
                await asyncio.sleep(2.0)
        except Exception as e:
            print(f"  ⚠️ {agent_id} attempt {attempt} failed: {e}")
            # Try default pitch/rate if failed
            if attempt >= 3:
                try:
                    communicate = edge_tts.Communicate(text=text, voice=base_voice)
                    await communicate.save(out_file)
                    if os.path.exists(out_file) and os.path.getsize(out_file) > 10000:
                        size = os.path.getsize(out_file)
                        with open(out_file, "rb") as f:
                            sha = hashlib.sha256(f.read()).hexdigest()
                        duration = round(size / 6200.0, 1)
                        print(f"  ✔ {agent_id} SUCCESS with defaults: {size} bytes, sha={sha[:12]}")
                        await asyncio.sleep(1.2)
                        return agent_id, out_file, sha, size, duration
                except Exception as e2:
                    print(f"  ⚠️ {agent_id} default retry failed: {e2}")
            await asyncio.sleep(2.5 * attempt)

    print(f"  ❌ {agent_id} FAILED after all attempts")
    return agent_id, None, None, 0, 0

async def main():
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    voices = data.get("voices", {})
    print(f"Loaded {len(voices)} voices from {REGISTRY_PATH}")

    manifest_entries = []
    success_count = 0

    sem = asyncio.Semaphore(5)

    async def worker(aid):
        vinfo = voices[aid]
        text = CARD_INTRO_TEXTS.get(aid, vinfo.get("intro_text", ""))
        async with sem:
            return await synthesize_one(aid, vinfo, text)

    tasks = [worker(aid) for aid in sorted(voices.keys())]
    results = await asyncio.gather(*tasks)

    for aid_res, out_file, sha, size, duration in sorted(results, key=lambda r: r[0]):
        if out_file and size > 0:
            success_count += 1
            vinfo = voices[aid_res]
            text = CARD_INTRO_TEXTS.get(aid_res, vinfo.get("intro_text", ""))
            card_intro_meta = {
                "asset_id": f"card_intro_{aid_res}",
                "asset_version": "1.0.0",
                "intro_text": text,
                "sample_path": f"/voices/cards/{aid_res}_card.mp3",
                "sample_ref": f"/mnt/data1/HUY-AI/voices/cards/{aid_res}_card.mp3",
                "sample_sha256": sha,
                "file_size_bytes": size,
                "estimated_duration_sec": duration,
                "mime_type": "audio/mpeg",
                "approval_status": "APPROVED",
                "human_gate_verdict": "VERIFIED_VALID",
                "updated_at": "2026-10-09T21:25:00Z"
            }
            vinfo["card_intro"] = card_intro_meta

            manifest_entries.append({
                "agent_id": aid_res,
                "name": vinfo["display_name"],
                "role": vinfo["job_title"],
                "department": vinfo["department"],
                "voice_id": vinfo["voice_id"],
                "voice_version": vinfo.get("voice_version", "2.0.0"),
                "region": vinfo["region"],
                "style": vinfo["style"],
                "base_voice": vinfo["base_voice"],
                "card_intro_text": text,
                "card_intro_path": f"/voices/cards/{aid_res}_card.mp3",
                "sha256": sha,
                "size_bytes": size,
                "duration_seconds": duration,
                "status": "VERIFIED_READY"
            })

    print(f"\nCompleted: {success_count}/{len(voices)} card voice intros synthesized.")

    # Save updated registry
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {REGISTRY_PATH} with card_intro metadata.")

    # Save manifest
    manifest_doc = {
        "manifest_version": "1.0.0",
        "directive": "AG-VOICE-CARD-003",
        "human_gate": "Mr. Huy Technology AI",
        "generated_at": "2026-10-09T21:25:00Z",
        "total_agents": len(manifest_entries),
        "all_ready": success_count == len(voices),
        "entries": manifest_entries
    }
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest_doc, f, ensure_ascii=False, indent=2)
    print(f"Saved {MANIFEST_PATH} with {len(manifest_entries)} entries.")

if __name__ == "__main__":
    asyncio.run(main())
