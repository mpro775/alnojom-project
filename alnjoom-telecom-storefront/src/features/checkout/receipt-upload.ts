import type { MediaAsset, PresignedUpload } from "@/lib/api/contracts";
import { apiClient } from "@/lib/api/client";
import { publicEndpoints, toStorefrontBff } from "@/lib/api/endpoints";

export async function uploadPaymentReceipt(file: File, onProgress: (value: number) => void): Promise<MediaAsset> {
  if (!file.type.startsWith("image/")) throw new Error("Receipt must be an image");
  if (file.size <= 0 || file.size > 5 * 1024 * 1024) throw new Error("Receipt must be 5 MB or smaller");
  const presigned = await apiClient<PresignedUpload>(toStorefrontBff(publicEndpoints.paymentReceiptPresign), {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, contentType: file.type, fileSizeBytes: file.size }),
  });
  if (file.size > presigned.maxFileSizeBytes) throw new Error("File exceeds the server upload limit");
  const etag = await putFile(presigned, file, onProgress);
  return apiClient<MediaAsset>(toStorefrontBff(publicEndpoints.paymentReceipts), {
    method: "POST",
    body: JSON.stringify({ objectKey: presigned.objectKey, contentType: file.type, fileSizeBytes: file.size, fileName: file.name, ...(etag ? { etag } : {}) }),
  });
}

function putFile(presigned: PresignedUpload, file: File, onProgress: (value: number) => void): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", presigned.uploadUrl, true);
    Object.entries(presigned.uploadHeaders).forEach(([key, value]) => request.setRequestHeader(key, value));
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)); };
    request.onerror = () => reject(new Error("Receipt upload failed"));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve(request.getResponseHeader("etag"));
      else reject(new Error(`Receipt upload failed (${request.status})`));
    };
    request.send(file);
  });
}
