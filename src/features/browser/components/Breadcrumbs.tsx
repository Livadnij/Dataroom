import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon, HomeIcon } from "lucide-react";
import { useBreadcrumbs } from "../api/useBrowser";
import { MAX_VISIBLE_CRUMBS } from "@/lib/constants";

interface BreadcrumbsProps {
  dataroomId: string;
  dataroomName: string;
  folderId: string | null;
}

interface Crumb {
  key: string;
  label: string;
  href: string | null;
}

export function Breadcrumbs({
  dataroomId,
  dataroomName,
  folderId,
}: BreadcrumbsProps) {
  const { data: trail = [] } = useBreadcrumbs(dataroomId, folderId);
  const isAtRoot = folderId === null;

  const crumbs: Crumb[] = [
    {
      key: dataroomId,
      label: dataroomName,
      href: isAtRoot ? null : `/dataroom/${dataroomId}`,
    },
    ...trail.map((folder, index) => ({
      key: folder.id,
      label: folder.name,
      href:
        index === trail.length - 1
          ? null
          : `/dataroom/${dataroomId}/${folder.id}`,
    })),
  ];

  const depthCollapsed = crumbs.length > MAX_VISIBLE_CRUMBS;
  const depthVisible = depthCollapsed
    ? crumbs.slice(crumbs.length - MAX_VISIBLE_CRUMBS)
    : crumbs;
  const depthHidden = depthCollapsed
    ? crumbs.slice(0, crumbs.length - MAX_VISIBLE_CRUMBS)
    : [];

  const maxExtraHidden = Math.max(depthVisible.length - 1, 0);
  const [extraHidden, setExtraHidden] = useState(0);
  const clampedExtraHidden = Math.min(extraHidden, maxExtraHidden);

  const visibleCrumbs = depthVisible.slice(clampedExtraHidden);
  const hiddenCrumbs = [
    ...depthHidden,
    ...depthVisible.slice(0, clampedExtraHidden),
  ];
  const isCollapsed = hiddenCrumbs.length > 0;

  const navRef = useRef<HTMLElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    setExtraHidden(0);
  }, [dataroomId, folderId]);

  useLayoutEffect(() => {
    const el = currentRef.current;
    if (!el) return;
    if (
      el.scrollWidth > el.clientWidth &&
      clampedExtraHidden < maxExtraHidden
    ) {
      setExtraHidden(clampedExtraHidden + 1);
    }
  });

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(() => setExtraHidden(0));
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Breadcrumb"
      className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden text-sm text-muted-foreground"
    >
      <Link
        to="/"
        className="flex shrink-0 items-center hover:text-foreground"
        aria-label="All datarooms"
      >
        <HomeIcon className="size-4" />
      </Link>

      {isCollapsed && (
        <>
          <ChevronRightIcon className="size-3.5 shrink-0" />
          <span
            className="shrink-0"
            title={hiddenCrumbs.map((c) => c.label).join(" / ")}
            aria-label={`${hiddenCrumbs.length} hidden folder${hiddenCrumbs.length === 1 ? "" : "s"}`}
          >
            …
          </span>
        </>
      )}

      {visibleCrumbs.map((crumb) => {
        const isCurrent = crumb.href === null;
        return (
          <span
            key={crumb.key}
            className={`flex min-w-0 items-center gap-1 ${
              isCurrent ? "flex-1" : "shrink-0"
            }`}
          >
            <ChevronRightIcon className="size-3.5 shrink-0" />
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="min-w-0 max-w-[5rem] truncate hover:text-foreground sm:max-w-[8rem]"
                title={crumb.label}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                ref={currentRef}
                className="min-w-0 truncate font-medium text-foreground"
                title={crumb.label}
                aria-current="page"
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
