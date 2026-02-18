import exifr from 'exifr';

export interface GpsData {
  latitude: number;
  longitude: number;
}

export interface ExifMetadata {
  gps: GpsData | null;
  cameraMake?: string;
  cameraModel?: string;
  takenAt?: Date;
  altitude?: number;
}

/**
 * Extract GPS coordinates from an image buffer.
 * Returns null if no GPS data is embedded.
 */
export async function extractGpsFromBuffer(
  buffer: Buffer
): Promise<GpsData | null> {
  try {
    const gps = await exifr.gps(buffer);
    if (
      gps &&
      typeof gps.latitude === 'number' &&
      typeof gps.longitude === 'number' &&
      Number.isFinite(gps.latitude) &&
      Number.isFinite(gps.longitude)
    ) {
      return { latitude: gps.latitude, longitude: gps.longitude };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract richer EXIF metadata (GPS, camera, date, altitude).
 */
export async function extractExifMetadata(
  buffer: Buffer
): Promise<ExifMetadata> {
  try {
    const data = await exifr.parse(buffer, {
      gps: true,
      pick: ['Make', 'Model', 'DateTimeOriginal', 'GPSAltitude'],
    });
    if (!data) return { gps: null };

    const gps = await extractGpsFromBuffer(buffer);

    return {
      gps,
      cameraMake: data.Make || undefined,
      cameraModel: data.Model || undefined,
      takenAt: data.DateTimeOriginal || undefined,
      altitude: typeof data.GPSAltitude === 'number' ? data.GPSAltitude : undefined,
    };
  } catch {
    return { gps: null };
  }
}
