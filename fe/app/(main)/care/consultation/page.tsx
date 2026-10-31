"use client";

import { TypedTaskListPage } from "@/components/care/typed-task-list";

export default function ConsultationCarePage() {
  return (
    <TypedTaskListPage
      title="Nhật ký tư vấn (care)"
      description="Task type = consultation — ghi chú tư vấn chi tiết vẫn nằm ở Customer 360"
      taskType="consultation"
      createDefaultTitle="Tư vấn liệu trình / da / tóc"
    />
  );
}
