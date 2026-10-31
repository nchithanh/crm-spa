"use client";

import { TypedTaskListPage } from "@/components/care/typed-task-list";

export default function AftercarePage() {
  return (
    <TypedTaskListPage
      title="Chăm sóc sau dịch vụ"
      description="Task type = post_service"
      taskType="post_service"
      createDefaultTitle="Follow-up aftercare sau buổi DV"
    />
  );
}
