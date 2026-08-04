import { Link } from "react-router-dom";
import { FolderIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dataroom } from "@/types/entities";

interface DataroomCardProps {
  dataroom: Dataroom;
  onDeleteRequest: (dataroom: Dataroom) => void;
}

export function DataroomCard({ dataroom, onDeleteRequest }: DataroomCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50">
      <Link
        to={`/dataroom/${dataroom.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <FolderIcon className="size-8 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate font-medium">{dataroom.name}</p>
          <p className="text-xs text-muted-foreground">
            Created {new Date(dataroom.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${dataroom.name}`}
        onClick={() => onDeleteRequest(dataroom)}
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  );
}
