import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export const storageService = {
  /**
   * Upload an image to Firebase Storage
   * @param file - The file to upload
   * @param path - Storage path (e.g., 'games', 'profiles')
   * @returns The download URL of the uploaded file
   */
  uploadImage: async (file: File, path: string = 'games'): Promise<string> => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${path}/${filename}`);

    // Upload file
    await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  },

  /**
   * Delete an image from Firebase Storage
   * @param imageUrl - The full download URL of the image
   */
  deleteImage: async (imageUrl: string): Promise<void> => {
    try {
      // Extract path from URL
      const urlParts = imageUrl.split('/o/')[1]?.split('?')[0];
      if (!urlParts) return;

      const decodedPath = decodeURIComponent(urlParts);
      const storageRef = ref(storage, decodedPath);

      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw - deletion is not critical
    }
  },

  /**
   * Validate file type and size
   * @param file - The file to validate
   * @returns Error message if invalid, null if valid
   */
  validateImage: (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
    }

    if (file.size > maxSize) {
      return 'Image size must be less than 5MB';
    }

    return null;
  }
};