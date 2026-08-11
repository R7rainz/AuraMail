const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Max size (bytes) for which an image/PDF attachment gets an inline preview
// button instead of only a download button.
export const MAX_PREVIEW_SIZE = 5 * 1024 * 1024;

export function isPreviewable(mimeType: string, size: number): boolean {
  const isPreviewableType =
    mimeType.startsWith("image/") || mimeType === "application/pdf";
  return isPreviewableType && size <= MAX_PREVIEW_SIZE;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fetchAttachmentBlob(
  gmailMessageId: string,
  attachmentId: string,
): Promise<Blob> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(
    `${API_URL}/emails/${gmailMessageId}/attachments/${attachmentId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error("Failed to fetch attachment");
  return res.blob();
}

export async function downloadAttachment(
  gmailMessageId: string,
  attachmentId: string,
  filename: string,
): Promise<void> {
  const blob = await fetchAttachmentBlob(gmailMessageId, attachmentId);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function openAttachment(
  gmailMessageId: string,
  attachmentId: string,
): Promise<void> {
  const tab = window.open("about:blank", "_blank");
  if (!tab) throw new Error("Popup blocked");
  tab.opener = null;

  try {
    const blob = await fetchAttachmentBlob(gmailMessageId, attachmentId);
    const url = URL.createObjectURL(blob);
    tab.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
  } catch (error) {
    tab.close();
    throw error;
  }
}
