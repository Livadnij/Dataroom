import { TableIcon, LayoutGridIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings/useSettings";
import type { ViewMode } from "@/lib/settings/store";

const OPTIONS: { value: ViewMode; label: string; icon: typeof TableIcon }[] = [
  { value: "table", label: "Table", icon: TableIcon },
  { value: "grid", label: "Grid", icon: LayoutGridIcon },
];

export function ViewModeToggle() {
  const [{ viewMode }, updateSettings] = useSettings();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">View</span>
      <div className="flex gap-1">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            type="button"
            variant={viewMode === value ? "secondary" : "ghost"}
            size="sm"
            className="flex-1"
            aria-pressed={viewMode === value}
            onClick={() => updateSettings({ viewMode: value })}
          >
            <Icon className="size-3.5" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
