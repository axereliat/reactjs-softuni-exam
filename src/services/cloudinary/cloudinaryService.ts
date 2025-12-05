// Cloudinary upload service for image handling

// Try using the default unsigned preset, or create 'games_preset' in your dashboard
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const cloudinaryService = {
  /**
   * Upload an image to Cloudinary
   * @param file - The file to upload
   * @returns The secure URL of the uploaded image
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'games'); // Store in 'games' folder

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cloudinary error response:', errorData);
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url; // Returns the permanent image URL
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  },

  /**
   * Delete an image from Cloudinary (requires backend API)
   * Note: Deletion requires authentication, so we'll skip this for now
   * Images will remain in Cloudinary but won't be referenced
   */
  deleteImage: async (imageUrl: string): Promise<void> => {
    // Cloudinary deletion requires authenticated API call
    // For now, we'll just remove the reference
    console.log('Image URL removed from database:', imageUrl);
  },

  /**
   * Validate file type and size
   * @param file - The file to validate
   * @returns Error message if invalid, null if valid
   */
  validateImage: (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB (Cloudinary free tier supports this)

    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
    }

    if (file.size > maxSize) {
      return 'Image size must be less than 10MB';
    }

    return null;
  }
};