export function getPaginationPages(currentPage: number, totalPages: number): number[] {
  const blockStart = Math.floor((currentPage - 1) / 5) * 5 + 1;
  const blockEnd = Math.min(blockStart + 4, totalPages);
  return Array.from({ length: blockEnd - blockStart + 1 }, (_, i) => blockStart + i);
}
