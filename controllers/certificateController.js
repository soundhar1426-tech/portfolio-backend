const Certificate = require('../models/Certificate');
const fs = require('fs');
const path = require('path');

// Helper to remove legacy file from disk safely if present
const safelyDeleteFile = (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
  try {
    const filename = fileUrl.replace('/uploads/', '');
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
};

// Helper to format certificate response (exclude heavy binary data from list/detail JSON)
const formatCertificate = (cert) => {
  const obj = cert.toObject ? cert.toObject() : { ...cert };
  
  const hasPdfBuffer = Boolean(obj.pdfData && obj.pdfData.data);
  const hasImageBuffer = Boolean(obj.imageData && obj.imageData.data);

  const pdfUrl = hasPdfBuffer
    ? `/api/certificates/${obj._id}/file/pdf`
    : (obj.pdfUrl || '');

  const imageUrl = hasImageBuffer
    ? `/api/certificates/${obj._id}/file/image`
    : (obj.imageUrl || '');

  delete obj.pdfData;
  delete obj.imageData;

  return {
    ...obj,
    pdfUrl,
    imageUrl,
    hasPdf: Boolean(hasPdfBuffer || pdfUrl),
    hasImage: Boolean(hasImageBuffer || imageUrl)
  };
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .select('-pdfData.data -imageData.data')
      .sort({ createdAt: -1 });

    const formattedCertificates = certificates.map(cert => formatCertificate(cert));

    return res.status(200).json({
      success: true,
      count: formattedCertificates.length,
      data: formattedCertificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return res.status(500).json({ success: false, message: 'Unable to load certificates' });
  }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Public
const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .select('-pdfData.data -imageData.data');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    return res.status(200).json({
      success: true,
      data: formatCertificate(certificate)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving certificate' });
  }
};

// @desc    Stream certificate file (PDF or Image) directly from persistent MongoDB storage
// @route   GET /api/certificates/:id/file/:type
// @access  Public
const getCertificateFile = async (req, res) => {
  try {
    const { id, type } = req.params;
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).send('Certificate not found');
    }

    if (type === 'pdf') {
      if (certificate.pdfData && certificate.pdfData.data) {
        res.set({
          'Content-Type': certificate.pdfData.contentType || 'application/pdf',
          'Content-Disposition': `inline; filename="${certificate.pdfData.originalName || 'certificate.pdf'}"`,
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
        return res.send(certificate.pdfData.data);
      }

      // Fallback for legacy disk files
      if (certificate.pdfUrl && certificate.pdfUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', certificate.pdfUrl);
        if (fs.existsSync(filePath)) {
          return res.sendFile(filePath);
        }
      }

      return res.status(404).send('PDF file not found');
    }

    if (type === 'image') {
      if (certificate.imageData && certificate.imageData.data) {
        res.set({
          'Content-Type': certificate.imageData.contentType || 'image/png',
          'Content-Disposition': `inline; filename="${certificate.imageData.originalName || 'certificate.png'}"`,
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
        return res.send(certificate.imageData.data);
      }

      // Fallback for legacy disk files
      if (certificate.imageUrl && certificate.imageUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', certificate.imageUrl);
        if (fs.existsSync(filePath)) {
          return res.sendFile(filePath);
        }
      }

      return res.status(404).send('Image file not found');
    }

    return res.status(400).send('Invalid file type requested');
  } catch (error) {
    console.error('Error serving certificate file:', error);
    return res.status(500).send('Error retrieving certificate file');
  }
};

// @desc    Create new certificate
// @route   POST /api/certificates
// @access  Protected (Management Password required)
const createCertificate = async (req, res) => {
  try {
    const { certificateTitle, organization, date } = req.body;

    if (!certificateTitle || !organization || !date) {
      return res.status(400).json({
        success: false,
        message: 'Certificate Title, Organization, and Date are required'
      });
    }

    const certificate = new Certificate({
      certificateTitle: certificateTitle.trim(),
      organization: organization.trim(),
      date: date.trim()
    });

    if (req.files) {
      if (req.files.pdf && req.files.pdf.length > 0) {
        const pdf = req.files.pdf[0];
        certificate.pdfData = {
          data: pdf.buffer,
          contentType: pdf.mimetype || 'application/pdf',
          originalName: pdf.originalname,
          size: pdf.size
        };
        certificate.pdfUrl = `/api/certificates/${certificate._id}/file/pdf`;
      }
      if (req.files.image && req.files.image.length > 0) {
        const image = req.files.image[0];
        certificate.imageData = {
          data: image.buffer,
          contentType: image.mimetype || 'image/png',
          originalName: image.originalname,
          size: image.size
        };
        certificate.imageUrl = `/api/certificates/${certificate._id}/file/image`;
      }
    }

    await certificate.save();

    return res.status(201).json({
      success: true,
      message: 'Certificate added successfully',
      data: formatCertificate(certificate)
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    return res.status(500).json({ success: false, message: 'Unable to add certificate: ' + error.message });
  }
};

// @desc    Update certificate
// @route   PUT /api/certificates/:id
// @access  Protected (Management Password required)
const updateCertificate = async (req, res) => {
  try {
    const { certificateTitle, organization, date, removePdf, removeImage } = req.body;

    let certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (certificateTitle) certificate.certificateTitle = certificateTitle.trim();
    if (organization) certificate.organization = organization.trim();
    if (date) certificate.date = date.trim();

    // Handle new uploaded files into MongoDB buffers
    if (req.files) {
      if (req.files.pdf && req.files.pdf.length > 0) {
        safelyDeleteFile(certificate.pdfUrl);
        const pdf = req.files.pdf[0];
        certificate.pdfData = {
          data: pdf.buffer,
          contentType: pdf.mimetype || 'application/pdf',
          originalName: pdf.originalname,
          size: pdf.size
        };
        certificate.pdfUrl = `/api/certificates/${certificate._id}/file/pdf`;
      }
      if (req.files.image && req.files.image.length > 0) {
        safelyDeleteFile(certificate.imageUrl);
        const image = req.files.image[0];
        certificate.imageData = {
          data: image.buffer,
          contentType: image.mimetype || 'image/png',
          originalName: image.originalname,
          size: image.size
        };
        certificate.imageUrl = `/api/certificates/${certificate._id}/file/image`;
      }
    }

    // Handle removal flags if specified
    if (removePdf === 'true' || removePdf === true) {
      safelyDeleteFile(certificate.pdfUrl);
      certificate.pdfData = undefined;
      certificate.pdfUrl = '';
    }
    if (removeImage === 'true' || removeImage === true) {
      safelyDeleteFile(certificate.imageUrl);
      certificate.imageData = undefined;
      certificate.imageUrl = '';
    }

    await certificate.save();

    return res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data: formatCertificate(certificate)
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    return res.status(500).json({ success: false, message: 'Unable to update certificate: ' + error.message });
  }
};

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Protected (Management Password required)
const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Safely delete associated legacy disk files if any
    safelyDeleteFile(certificate.pdfUrl);
    safelyDeleteFile(certificate.imageUrl);

    await Certificate.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return res.status(500).json({ success: false, message: 'Unable to delete certificate' });
  }
};

module.exports = {
  getCertificates,
  getCertificateById,
  getCertificateFile,
  createCertificate,
  updateCertificate,
  deleteCertificate
};
