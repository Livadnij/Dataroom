import { CreateNameDialog } from "@/components/CreateNameDialog";
import { useCreateDataroom } from "../api/useDatarooms";

interface CreateDataroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDataroomDialog({
  open,
  onOpenChange,
}: CreateDataroomDialogProps) {
  const createDataroom = useCreateDataroom();

  return (
    <CreateNameDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New dataroom"
      label="Dataroom name"
      placeholder="Dataroom name"
      isPending={createDataroom.isPending}
      onCreate={(name) =>
        createDataroom.mutate(name, { onSuccess: () => onOpenChange(false) })
      }
    />
  );
}
