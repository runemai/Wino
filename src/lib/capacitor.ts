import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Check if the app is running on a native platform (iOS/Android)
 */
export const isNative = () => Capacitor.isNativePlatform();

/**
 * Check if the app is running on iOS
 */
export const isIOS = () => Capacitor.getPlatform() === 'ios';

/**
 * Check if the app is running on Android
 */
export const isAndroid = () => Capacitor.getPlatform() === 'android';

/**
 * Take a photo using the native camera
 */
export const takePhoto = async (options?: {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
}): Promise<Photo> => {
  const image = await Camera.getPhoto({
    quality: options?.quality ?? 90,
    allowEditing: options?.allowEditing ?? false,
    resultType: options?.resultType ?? CameraResultType.Base64,
    source: options?.source ?? CameraSource.Camera,
  });
  return image;
};

/**
 * Pick an image from the photo library
 */
export const pickFromLibrary = async (options?: {
  quality?: number;
  allowEditing?: boolean;
}): Promise<Photo> => {
  const image = await Camera.getPhoto({
    quality: options?.quality ?? 90,
    allowEditing: options?.allowEditing ?? false,
    resultType: CameraResultType.Base64,
    source: CameraSource.Photos,
  });
  return image;
};

/**
 * Convert a Capacitor Photo to a Blob
 */
export const photoToBlob = async (photo: Photo): Promise<Blob> => {
  if (photo.base64String) {
    // Convert base64 to blob
    const response = await fetch(`data:${photo.format};base64,${photo.base64String}`);
    return await response.blob();
  } else if (photo.webPath) {
    // Fetch from web path
    const response = await fetch(photo.webPath);
    return await response.blob();
  } else if (photo.path) {
    // Read from filesystem
    const file = await Filesystem.readFile({
      path: photo.path,
    });
    const response = await fetch(`data:${photo.format};base64,${file.data}`);
    return await response.blob();
  }
  throw new Error('Unable to convert photo to blob');
};

/**
 * Convert a Capacitor Photo to a data URL
 */
export const photoToDataUrl = (photo: Photo): string => {
  if (photo.base64String) {
    return `data:${photo.format};base64,${photo.base64String}`;
  } else if (photo.webPath) {
    return photo.webPath;
  }
  throw new Error('Unable to convert photo to data URL');
};

/**
 * Save a photo to the device's filesystem
 */
export const savePhotoToFilesystem = async (
  photo: Photo,
  filename: string
): Promise<string> => {
  if (!photo.base64String) {
    throw new Error('Photo must have base64String to save to filesystem');
  }

  const savedFile = await Filesystem.writeFile({
    path: filename,
    data: photo.base64String,
    directory: Directory.Data,
  });

  return savedFile.uri;
};
