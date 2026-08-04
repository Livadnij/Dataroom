import { DataroomList } from "@/features/datarooms/components/DataroomList";
import { DataroomToolbar } from "@/features/datarooms/components/DataroomToolbar";

export function DataroomsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <DataroomToolbar />
      <DataroomList />
    </div>
  );
}
