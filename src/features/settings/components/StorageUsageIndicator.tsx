import { useStorageEstimate } from "../api/useStorageEstimate";
import { formatBytes } from "@/lib/validation/sizeCap";

export function StorageUsageIndicator() {
  const { data, isLoading } = useStorageEstimate();

  if (isLoading || !data) {
    return <p className="text-xs text-muted-foreground">Checking storage…</p>;
  }

  if (!data.supported) {
    return (
      <p className="text-xs text-muted-foreground">
        Storage usage isn't available in this browser.
      </p>
    );
  }

  const pct =
    data.quota > 0 ? Math.min(100, (data.usage / data.quota) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">Storage</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatBytes(data.usage)} of {formatBytes(data.quota)} used
        {" — this is a browser estimate, not a hard guarantee"}
      </p>
    </div>
  );
}
