const Certificate = require('../models/Certificate');
const fs = require('fs');
const path = require('path');

// Helper to remove file from disk safely
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

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
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
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    return res.status(200).json({ success: true, data: certificate });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving certificate' });
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

    let pdfUrl = '';
    let imageUrl = '';

    if (req.files) {
      if (req.files.pdf && req.files.pdf.length > 0) {
        pdfUrl = `/uploads/${req.files.pdf[0].filename}`;
      }
      if (req.files.image && req.files.image.length > 0) {
        imageUrl = `/uploads/${req.files.image[0].filename}`;
      }
    }

    const certificate = await Certificate.create({
      certificateTitle: certificateTitle.trim(),
      organization: organization.trim(),
      date: date.trim(),
      pdfUrl,
      imageUrl
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate added successfully',
      data: certificate
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

    const updateData = {};
    if (certificateTitle) updateData.certificateTitle = certificateTitle.trim();
    if (organization) updateData.organization = organization.trim();
    if (date) updateData.date = date.trim();

    // Handle new uploaded files
    if (req.files) {
      if (req.files.pdf && req.files.pdf.length > 0) {
        safelyDeleteFile(certificate.pdfUrl);
        updateData.pdfUrl = `/uploads/${req.files.pdf[0].filename}`;
      }
      if (req.files.image && req.files.image.length > 0) {
        safelyDeleteFile(certificate.imageUrl);
        updateData.imageUrl = `/uploads/${req.files.image[0].filename}`;
      }
    }

    // Handle removal flags if specified
    if (removePdf === 'true' || removePdf === true) {
      safelyDeleteFile(certificate.pdfUrl);
      updateData.pdfUrl = '';
    }
    if (removeImage === 'true' || removeImage === true) {
      safelyDeleteFile(certificate.imageUrl);
      updateData.imageUrl = '';
    }

    certificate = await Certificate.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data: certificate
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

    // Safely delete associated media files
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
  createCertificate,
  updateCertificate,
  deleteCertificate
};
