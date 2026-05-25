import { slugify } from "./slug";

const allowedImageTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

export const maxImageUploadBytes = 5 * 1024 * 1024;

export function validateImageFile(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    return "Please choose a PNG, JPG, JPEG, or WEBP image.";
  }

  if (file.size > maxImageUploadBytes) {
    return "Please choose an image smaller than 5MB.";
  }

  return "";
}

export function createStorageFileName(source: string, file: File) {
  const safeSource = slugify(source) || "image";
  const extension =
    allowedImageTypes.get(file.type) ??
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ??
    "png";

  return `${safeSource}-${Date.now()}.${extension}`;
}
