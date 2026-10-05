/**
 * Utility functions for parsing and sanitizing Google Drive links.
 * PDR Section 3 & 5: Regex Extraction & Sanitization
 */

export interface ExtractedDriveInfo {
  fileId: string;
  previewUrl: string;
  thumbnailUrl: string;
  isValid: boolean;
  error?: string;
}

const DRIVE_REGEX_PATTERNS = [
  /\/file\/d\/([a-zA-Z0-9_-]+)/,
  /id=([a-zA-Z0-9_-]+)/,
  /\/document\/d\/([a-zA-Z0-9_-]+)/,
  /\/presentation\/d\/([a-zA-Z0-9_-]+)/,
  /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
];

export function extractGoogleDriveId(url: string): ExtractedDriveInfo {
  if (!url || typeof url !== "string") {
    return {
      fileId: "",
      previewUrl: "",
      thumbnailUrl: "",
      isValid: false,
      error: "URL string is required",
    };
  }

  const trimmed = url.trim();

  // If user pasted raw file ID directly
  if (/^[a-zA-Z0-9_-]{25,60}$/.test(trimmed)) {
    return {
      fileId: trimmed,
      previewUrl: `https://drive.google.com/file/d/${trimmed}/preview`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${trimmed}&sz=w500`,
      isValid: true,
    };
  }

  for (const pattern of DRIVE_REGEX_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      const fileId = match[1];
      return {
        fileId,
        previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`,
        isValid: true,
      };
    }
  }

  return {
    fileId: "",
    previewUrl: "",
    thumbnailUrl: "",
    isValid: false,
    error: "Invalid Google Drive link structure. Please paste a standard Google Drive share link.",
  };
}
