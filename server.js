const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const albumName = req.body.album;
    if (!albumName) return cb(new Error('Album name is required.'));
    const dir = path.join(__dirname, 'uploads', albumName);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  res.send('File uploaded successfully.');
});

app.get('/albums', (req, res) => {
  const albums = fs.readdirSync('uploads').filter(dir => fs.statSync(path.join('uploads', dir)).isDirectory());
  res.json(Object.fromEntries(albums.map(album => [album, fs.readdirSync(path.join('uploads', album))])));
});

app.get('/albums/:albumName', (req, res) => {
  const albumPath = path.join('uploads', req.params.albumName);
  if (!fs.existsSync(albumPath)) return res.status(404).send('Album not found.');
  res.json(fs.readdirSync(albumPath));
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
