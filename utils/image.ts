import { useEffect, useState } from "react";
/**
 * Utility functions for handling image URLs in Expo
 */

// ============================================
// CONFIGURATION
// ============================================

// Get the base URL from environment variables
const getBaseUrl = (): string => {
  // For Android Emulator: http://10.0.2.2:8000
  // For iOS Simulator: http://localhost:8000
  // For Physical Device: http://192.168.1.100:8000
  return (
    process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
    // "http://10.0.2.2:8000"
    "http://localhost:8000"
  );
};

// ============================================
// MAIN HELPER FUNCTIONS
// ============================================

/**
 * Get the full image URL from a path
 * @param imagePath - The image path from the API (can be full URL, relative path, or null)
 * @param options - Optional configuration
 * @returns Full image URL or null if invalid
 */
export const getImageUrl = (
  imagePath: string | null | undefined,
  options?: {
    fallback?: string;
    useThumbnail?: boolean;
  },
): string | null => {
  if (!imagePath) {
    return options?.fallback || null;
  }

  // If it's already a full URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    // Replace localhost with correct IP for emulator
    if (imagePath.includes("localhost")) {
      const baseUrl = getBaseUrl();
      return imagePath.replace("http://localhost:8000", baseUrl);
    }
    return imagePath;
  }

  // Get base URL
  const baseUrl = getBaseUrl();

  // If path starts with slash, prepend base URL
  if (imagePath.startsWith("/")) {
    return `${baseUrl}${imagePath}`;
  }

  // Otherwise add storage prefix
  // This handles paths like "promotions/posters/filename.jpg"
  return `${baseUrl}/storage/${imagePath}`;
};

/**
 * Get the thumbnail version of an image URL
 */
export const getThumbnailUrl = (
  imagePath: string | null | undefined,
  options?: {
    fallback?: string;
  },
): string | null => {
  if (!imagePath) {
    return options?.fallback || null;
  }

  // Check if it's already a thumbnail
  if (imagePath.includes("-thumb.") || imagePath.includes("_thumb.")) {
    return getImageUrl(imagePath);
  }

  // Try to generate thumbnail path
  const lastDotIndex = imagePath.lastIndexOf(".");
  if (lastDotIndex > 0) {
    const baseName = imagePath.substring(0, lastDotIndex);
    const extension = imagePath.substring(lastDotIndex);
    const thumbnailPath = `${baseName}-thumb${extension}`;
    return getImageUrl(thumbnailPath);
  }

  return getImageUrl(imagePath);
};

/**
 * Get image URL with size parameters
 * Useful for resizing images
 */
export const getResizedImageUrl = (
  imagePath: string | null | undefined,
  width: number,
  height?: number,
): string | null => {
  const url = getImageUrl(imagePath);
  if (!url) return null;

  // If it's a full URL, add resize parameters
  if (url.includes("?")) {
    return `${url}&w=${width}${height ? `&h=${height}` : ""}`;
  }
  return `${url}?w=${width}${height ? `&h=${height}` : ""}`;
};

/**
 * Check if an image exists
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get a placeholder image based on type
 */
export const getPlaceholderImage = (
  type: "promotion" | "merchant" | "user" = "promotion",
): string => {
  const placeholders = {
    promotion: "🛍️",
    merchant: "🏪",
    user: "👤",
  };
  return placeholders[type] || "🔄";
};

/**
 * Get image source object for React Native Image component
 */
export const getImageSource = (
  imagePath: string | null | undefined,
  options?: {
    fallback?: string;
    useThumbnail?: boolean;
  },
): { uri: string } | null => {
  const url = options?.useThumbnail
    ? getThumbnailUrl(imagePath, options)
    : getImageUrl(imagePath, options);

  if (!url) return null;
  return { uri: url };
};

// ============================================
// IMAGE COMPONENT HELPER
// ============================================

/**
 * Image source type for React Native
 */
export interface ImageSource {
  uri: string;
}

/**
 * Hook to safely load image with fallback
 * Usage: const { uri, loading, error } = useImageUrl(poster_image);
 */
export const useImageUrl = (imagePath: string | null | undefined) => {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        const url = getImageUrl(imagePath);
        if (url) {
          // Check if image exists
          const exists = await checkImageExists(url);
          if (exists) {
            setUri(url);
          } else {
            setUri(null);
          }
        } else {
          setUri(null);
        }
        setError(null);
      } catch (err) {
        setError(err as Error);
        setUri(null);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  return { uri, loading, error };
};
