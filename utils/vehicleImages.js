const { randomUUID } = require('crypto');

const bucket = 'vehicles';
let bucketInitialization;

function createStorageError(message) {
  const error = new Error(message);
  error.code = 'VEHICLE_IMAGE_STORAGE_ERROR';
  return error;
}

function getStorageConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw createStorageError(
      'Vehicle image storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the backend environment.'
    );
  }

  return { supabaseUrl: supabaseUrl.replace(/\/$/, ''), serviceRoleKey };
}

async function ensureVehicleBucket(config) {
  if (!bucketInitialization) {
    bucketInitialization = (async () => {
      const response = await fetch(`${config.supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          Authorization: `******`,
          apikey: config.serviceRoleKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: bucket, name: bucket, public: true })
      });

      if (response.ok) return;

      const detail = await response.text();
      if (/already exists/i.test(detail)) return;

      console.error('Supabase vehicle bucket initialization failed:', response.status, detail);
      throw createStorageError(
        'Vehicle image storage could not be initialized. Check the backend Supabase service-role key and Storage permissions.'
      );
    })();
  }

  try {
    await bucketInitialization;
  } catch (error) {
    bucketInitialization = null;
    throw error;
  }
}

async function saveVehicleImages(images) {
  if (!Array.isArray(images) || images.length > 10) {
    throw new Error('Vehicle photos must be an array containing no more than 10 images');
  }

  const persistedImages = [];

  for (const image of images) {
    if (typeof image !== 'string') {
      throw new Error('Each vehicle photo must be an image data URL or HTTPS URL');
    }

    if (/^https:\/\//i.test(image)) {
      persistedImages.push(image);
      continue;
    }

    const match = image.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
    if (!match) {
      throw new Error('Vehicle photos must be optimized JPEG images');
    }

    const buffer = Buffer.from(match[1], 'base64');
    if (buffer.length < 3 || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
      throw new Error('Vehicle photos must contain valid JPEG data');
    }
    if (buffer.length > 3 * 1024 * 1024) {
      throw new Error('Each optimized vehicle photo must be 3 MB or smaller');
    }

    const { supabaseUrl, serviceRoleKey } = getStorageConfig();
    await ensureVehicleBucket({ supabaseUrl, serviceRoleKey });
    const objectPath = `${randomUUID()}.jpg`;
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'image/jpeg',
          'x-upsert': 'false'
        },
        body: buffer
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase image upload failed:', response.status, detail);
      throw createStorageError(
        'Vehicle photo upload failed. Check the Supabase Storage bucket and backend service-role permissions.'
      );
    }

    persistedImages.push(`${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`);
  }

  return persistedImages;
}

function sendVehicleImageError(res, error) {
  if (error?.code !== 'VEHICLE_IMAGE_STORAGE_ERROR') return false;
  res.status(503).json({ message: error.message });
  return true;
}

module.exports = { saveVehicleImages, sendVehicleImageError };
