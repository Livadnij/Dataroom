import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "./ThemeToggle";
import { ViewModeToggle } from "./ViewModeToggle";
import { StorageUsageIndicator } from "./StorageUsageIndicator";
import { ClearDataButton } from "./ClearDataButton";

export function SettingsMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Settings"
        >
          <SettingsIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex flex-col gap-4">
        <ThemeToggle />
        <ViewModeToggle />
        <StorageUsageIndicator />
        <div className="border-t pt-3">
          <ClearDataButton />
        </div>
      </PopoverContent>
    </Popover>
  );
}
