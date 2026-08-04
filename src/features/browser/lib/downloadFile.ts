import { toast } from "sonner";
import { dataroomStorage } from "@/lib/storage";
import { getErrorMessage } from "@/lib/errors";

export async function downloadFile(id: string, name: string): Promise<void> {
  try {
    const blob = await dataroomStorage.getFileBlob(id);
    if (!blob) throw new Error("File not found.");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
}
