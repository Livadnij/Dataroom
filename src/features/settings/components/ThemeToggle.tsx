import { SunIcon, MoonIcon, MonitorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings/useSettings";
import type { Theme } from "@/lib/settings/store";

const OPTIONS: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
];

export function ThemeToggle() {
  const [{ theme }, updateSettings] = useSettings();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">Theme</span>
      <div className="flex gap-1">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            type="button"
            variant={theme === value ? "secondary" : "ghost"}
            size="sm"
            className="flex-1"
            aria-pressed={theme === value}
            onClick={() => updateSettings({ theme: value })}
          >
            <Icon className="size-3.5" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
