"use client";

import { useCallback, useState } from 'react';
import { CameraResultType } from '@capacitor/camera';
import {
  isNative,
  takePhoto,
  pickFromLibrary,
  photoToBlob,
  photoToDataUrl,
} from '@/lib/capacitor';

export const useNativeCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capturePhoto = useCallback(async () => {
    if (!isNative()) {
      throw new Error('Native camera is only available on mobile devices');
    }

    setIsLoading(true);
    setError(null);

    try {
      const photo = await takePhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
      });

      const blob = await photoToBlob(photo);
      const dataUrl = photoToDataUrl(photo);

      return { blob, dataUrl };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to capture photo';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pickPhoto = useCallback(async () => {
    if (!isNative()) {
      throw new Error('Native photo picker is only available on mobile devices');
    }

    setIsLoading(true);
    setError(null);

    try {
      const photo = await pickFromLibrary({
        quality: 90,
        allowEditing: false,
      });

      const blob = await photoToBlob(photo);
      const dataUrl = photoToDataUrl(photo);

      return { blob, dataUrl };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to pick photo';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    capturePhoto,
    pickPhoto,
    isLoading,
    error,
    isAvailable: isNative(),
  };
};
