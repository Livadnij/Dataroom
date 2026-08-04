export function resolveNameCollision(
  desiredName: string,
  existingNames: string[],
): string {
  if (!existingNames.includes(desiredName)) return desiredName;

  const dotIndex = desiredName.lastIndexOf(".");
  const hasExt = dotIndex > 0 && dotIndex < desiredName.length - 1;
  const base = hasExt ? desiredName.slice(0, dotIndex) : desiredName;
  const ext = hasExt ? desiredName.slice(dotIndex) : "";

  let n = 1;
  let candidate = `${base} (${n})${ext}`;
  while (existingNames.includes(candidate)) {
    n += 1;
    candidate = `${base} (${n})${ext}`;
  }
  return candidate;
}
