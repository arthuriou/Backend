import { v2 as cloudinary } from 'cloudinary';

function getEnvConfig() {
  return {
    cloudinaryUrl: process.env.CLOUDINARY_URL || ''
  };
}

export function isCloudinaryEnabled(): boolean {
  const { cloudinaryUrl } = getEnvConfig();
  return Boolean(cloudinaryUrl);
}

export function configureCloudinary(): void {
  const { cloudinaryUrl } = getEnvConfig();
  if (!cloudinaryUrl) return;
  
  // Parser l'URL Cloudinary
  const url = new URL(cloudinaryUrl);
  const apiKey = url.username;
  const apiSecret = url.password;
  const cloudName = url.hostname;
  
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function uploadImageToCloudinary(localFilePathOrBuffer: any, folder = 'profile', filename?: string) {
  if (!isCloudinaryEnabled()) {
    throw new Error('Cloudinary non configuré');
  }
  configureCloudinary();

  const uploadOptions: any = {
    folder,
    resource_type: 'image',
    overwrite: true,
    access_mode: 'public', // Rendre les fichiers publics
    type: 'upload', // Type d'upload standard
  };
  if (filename) uploadOptions.public_id = filename.replace(/\.[^.]+$/, '');

  const isBufferLike = typeof localFilePathOrBuffer !== 'string';

  if (!isBufferLike) {
    const res = await cloudinary.uploader.upload(localFilePathOrBuffer as string, uploadOptions);
    return { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height, format: res.format };
  }

  const buffer: any = localFilePathOrBuffer;
  const res: any = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error: any, result: any) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
  return { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height, format: res.format };
}

export async function uploadToCloudinary(
  localFilePathOrBuffer: any, 
  folder = 'profile', 
  filename?: string, 
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
) {
  if (!isCloudinaryEnabled()) {
    throw new Error('Cloudinary non configuré');
  }
  configureCloudinary();

  const uploadOptions: any = {
    folder,
    resource_type: resourceType,
    overwrite: true,
    access_mode: 'public', // Rendre les fichiers publics
    type: 'upload', // Type d'upload standard
  };
  if (filename) uploadOptions.public_id = filename.replace(/\.[^.]+$/, '');

  const isBufferLike = typeof localFilePathOrBuffer !== 'string';

  if (!isBufferLike) {
    const res = await cloudinary.uploader.upload(localFilePathOrBuffer as string, uploadOptions);
    return { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height, format: res.format };
  }

  const buffer: any = localFilePathOrBuffer;
  const res: any = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error: any, result: any) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

  return { url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height, format: res.format };
}


