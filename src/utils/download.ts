// CSV blob을 파일명에 오늘 날짜(YYMMDD)를 붙여 다운로드한다. 예: members_260610.csv
function dateStamp(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

export function downloadCsv(blob: Blob, baseName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}_${dateStamp()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
