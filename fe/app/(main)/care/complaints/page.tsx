"use client";

import { TypedTaskListPage } from "@/components/care/typed-task-list";

export default function ComplaintsPage() {
  return (
    <TypedTaskListPage
      title="Khiếu nại & phản hồi"
      description="Task type = complaint · ưu tiên khẩn khi tạo mới"
      taskType="complaint"
      createDefaultTitle="Xử lý phản hồi / khiếu nại khách"
    />
  );
}
