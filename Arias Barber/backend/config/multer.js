const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../frontend/assets/img');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const MIME_MAP = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = MIME_MAP[file.mimetype];
        if (!ext) return cb(new Error('Tipo de archivo no permitido'));
        cb(null, `${crypto.randomUUID()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (MIME_MAP[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Formato no válido. Solo se permiten imágenes JPG, PNG y WEBP.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 } 
});

module.exports = upload;