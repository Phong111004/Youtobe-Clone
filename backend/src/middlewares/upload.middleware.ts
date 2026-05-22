import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Tạo thư mục tmp nếu chưa có
const tmpDir = path.join(__dirname, '../../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Cấu hình lưu trữ file tạm thời trên disk để tránh tràn RAM khi upload video lớn
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Kiểm tra loại file
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file video!'));
    }
  } else if (file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file hình ảnh cho thumbnail!'));
    }
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2000 * 1024 * 1024, // Tăng giới hạn lên 2000MB (2GB)
  },
});
