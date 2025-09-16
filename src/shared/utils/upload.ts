import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

const baseDir = path.join(process.cwd(), 'uploads');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req: any, file: Express.Multer.File, cb: (error: any, destination: string) => void) => {
    const segment = (req as any).uploadSegment || 'misc';
    const dest = path.join(baseDir, segment);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req: any, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, unique + ext);
  }
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Autoriser tous les fichiers image + audio + quelques types communs, et fallback sur octet-stream
  const mime = file.mimetype || '';
  if (mime.startsWith('image/')) return cb(null, true);
  if (mime.startsWith('audio/')) return cb(null, true);
  const allowed = [
    'application/pdf','text/plain',
    'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream'
  ];
  if (allowed.includes(mime)) return cb(null, true);
  cb(new Error('Type de fichier non autorisé'));
}

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

export function setUploadSegment(segment: string) {
  return (req: any, _res: any, next: any) => { req.uploadSegment = segment; next(); };
}

export function publicUrl(filePath: string) {
  // Expose via /uploads
  const rel = path.relative(baseDir, filePath).replace(/\\/g, '/');
  return `/uploads/${rel}`;
}

// Upload en mémoire (pour Cloudinary uniquement, pas d'écriture disque)
const memoryStorage = multer.memoryStorage();
export const uploadMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});


