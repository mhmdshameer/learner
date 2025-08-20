// Cloudinary configuration and utilities
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  apiSecret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  uploadFolder: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER,
};

// Generate optimized image URL with transformations
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    gravity?: string;
  } = {}
): string {
  const {
    width = 400,
    height = 400,
    crop = "fill",
    quality = "auto",
    format = "auto",
    gravity = "face"
  } = options;

  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  const transformations = `w_${width},h_${height},c_${crop},g_${gravity},q_${quality},f_${format}`;
  
  return `${baseUrl}/${transformations}/${publicId}`;
}

// Validate Cloudinary configuration
export function validateCloudinaryConfig(): boolean {
  return !!(
    cloudinaryConfig.cloudName &&
    cloudinaryConfig.uploadPreset
  );
}
