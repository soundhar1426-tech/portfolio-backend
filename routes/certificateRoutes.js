const express = require('express');
const router = express.Router();
const {
  getCertificates,
  getCertificateById,
  getCertificateFile,
  createCertificate,
  updateCertificate,
  deleteCertificate
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { uploadCertificateFiles } = require('../middleware/uploadMiddleware');

// Public route to stream certificate file (PDF or Image)
router.get('/:id/file/:type', getCertificateFile);
router.get('/:id/pdf', (req, res) => {
  req.params.type = 'pdf';
  return getCertificateFile(req, res);
});
router.get('/:id/image', (req, res) => {
  req.params.type = 'image';
  return getCertificateFile(req, res);
});

router.route('/')
  .get(getCertificates)
  .post(protect, uploadCertificateFiles, createCertificate);

router.route('/:id')
  .get(getCertificateById)
  .put(protect, uploadCertificateFiles, updateCertificate)
  .delete(protect, deleteCertificate);

module.exports = router;
