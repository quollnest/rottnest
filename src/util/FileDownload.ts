

export function DownloadFile(name: string, blob: any) {
  const url = URL.createObjectURL(blob);
  const d = document.createElement("a");
  d.href = url;
  d.download = name;
  d.click();
  d.remove();
  window.URL.revokeObjectURL(url);
}
