const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  secure: true
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'urbanbook',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

module.exports = storage;