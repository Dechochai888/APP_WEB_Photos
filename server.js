const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware รองรับข้อมูลฟอร์ม
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ตั้งค่า Multer สำหรับการอัพโหลด
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const albumName = req.body.album;
    if (!albumName) {
      return cb(new Error('Album name is required.'));
    }
    const dir = path.join(__dirname, 'uploads', albumName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload Endpoint
app.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Upload Error:', err.message);
      return res.status(500).send(err.message);
    }

    console.log('Request Body:', req.body); // Debug: ดูค่าที่ได้รับ
    console.log('Uploaded File:', req.file); // Debug: ตรวจสอบไฟล์ที่อัพโหลด

    if (!req.body.album) {
      return res.status(400).send('Album name is required.');
    }

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    res.send('File uploaded successfully.');
  });
});

// Fetch albums and files
app.get('/albums', (req, res) => {
  const albumsDir = path.join(__dirname, 'uploads');
  const albums = {};

  if (fs.existsSync(albumsDir)) {
    fs.readdirSync(albumsDir).forEach(album => {
      const albumPath = path.join(albumsDir, album);
      if (fs.statSync(albumPath).isDirectory()) {
        albums[album] = fs.readdirSync(albumPath);
      }
    });
  }

  res.json(albums);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
