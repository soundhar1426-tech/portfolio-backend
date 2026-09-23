const express = require('express');
const router = express.Router();
const {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { uploadCertificateFiles } = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getCertificates)
  .post(protect, uploadCertificateFiles, createCertificate);

router.route('/:id')
  .get(getCertificateById)
  .put(protect, uploadCertificateFiles, updateCertificate)
  .delete(protect, deleteCertificate);

module.exports = router;
