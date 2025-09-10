// Test direct de Cloudinary via CLOUDINARY_URL
// Usage: node scripts/test-cloudinary-upload.js <chemin_fichier>

require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');
const path = require('path');

async function main() {
  const filePathArg = process.argv[2];
  const filePath = filePathArg || path.join(process.cwd(), 'uploads', 'profile', '1757515692043-179239479.jpeg');

  if (!process.env.CLOUDINARY_URL) {
    console.error('CLOUDINARY_URL manquant dans les variables d\'environnement');
    process.exit(1);
  }

  cloudinary.config(process.env.CLOUDINARY_URL);

  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder: 'profile',
      resource_type: 'image',
      overwrite: true,
    });
    console.log('OK:', { url: res.secure_url, publicId: res.public_id });
    process.exit(0);
  } catch (e) {
    console.error('ECHEC:', e && e.message ? e.message : e);
    process.exit(2);
  }
}

main();


