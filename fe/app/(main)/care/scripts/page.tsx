"use client";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const SCRIPTS = [
  {
    id: "sc1",
    name: "Aftercare facial 24h",
    type: "post_service",
    body: "Chào {{name}}, mình là {{staff}} từ Dolphin Glow. Da hôm qua ổn chứ ạ? Nhắc tránh nắng SPF và không dùng AHA 48h.",
  },
  {
    id: "sc2",
    name: "Sinh nhật + ưu đãi",
    type: "birthday",
    body: "Chúc mừng SN {{name}}! Spa tặng 10% liệu trình yêu thích trong tuần này — đặt lịch giúp mình nhé.",
  },
  {
    id: "sc3",
    name: "Win-back 60 ngày",
    type: "rebooking",
    body: "Lâu rồi không gặp {{name}}. Đang có slot cuối tuần — mình giữ giúp 1 khung giờ được không ạ?",
  },
  {
    id: "sc4",
    name: "Khiếu nại lắng nghe",
    type: "complaint",
    body: "Cảm ơn {{name}} đã góp ý. Mình xin lỗi vì trải nghiệm chưa tốt và muốn hiểu rõ hơn để khắc phục.",
  },
];

export default function CareScriptsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Kịch bản chăm sóc mẫu"
        description="Playbook copy — dùng kèm task / Zalo template (mock, không gửi thật)"
      />
      <div className="grid gap-3 md:grid-cols-2">
        {SCRIPTS.map((s) => (
          <Card key={s.id} className="p-4">
            <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
              {s.type}
            </p>
            <h2 className="mt-1 text-sm font-bold">{s.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {s.body}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
