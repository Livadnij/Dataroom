import { useParams } from "react-router-dom";
import { useDatarooms } from "@/features/datarooms/api/useDatarooms";
import { Breadcrumbs } from "@/features/browser/components/Breadcrumbs";
import { FileBrowser } from "@/features/browser/components/FileBrowser";

export function DataroomPage() {
  const { dataroomId, folderId } = useParams<{
    dataroomId: string;
    folderId?: string;
  }>();
  const { data: datarooms } = useDatarooms();
  const dataroom = datarooms?.find((d) => d.id === dataroomId);

  if (!dataroomId) return null;

  const currentFolderId = folderId ?? null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
      <Breadcrumbs
        dataroomId={dataroomId}
        dataroomName={dataroom?.name ?? "…"}
        folderId={currentFolderId}
      />
      <FileBrowser dataroomId={dataroomId} folderId={currentFolderId} />
    </div>
  );
}
