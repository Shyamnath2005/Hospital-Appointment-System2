const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { s3Client } = require('../config/s3');
const Patient = require('../models/Patient');
const logger = require('../config/logger');

// Multer configuration (memory storage - file goes directly to S3)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed.'), false);
    }
  },
});

// @desc    Upload patient document to S3
// @route   POST /api/upload
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const s3Key = `patients/${req.patient._id}/documents/${uuidv4()}.${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: {
        patientId: req.patient._id.toString(),
        originalName: req.file.originalname,
      },
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate presigned URL (valid for 1 hour)
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    });
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

    // Save document reference in patient record
    const docRecord = {
      name: req.file.originalname,
      url: signedUrl,
      s3Key,
      uploadedAt: new Date(),
    };

    await Patient.findByIdAndUpdate(req.patient._id, {
      $push: { documents: docRecord },
    });

    logger.info(`Document uploaded: ${s3Key} by patient ${req.patient.email}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: docRecord,
    });
  } catch (error) {
    logger.error('uploadDocument error:', error);
    res.status(500).json({ success: false, message: 'File upload failed. Please try again.' });
  }
};

// @desc    Get patient's documents with fresh presigned URLs
// @route   GET /api/upload/my-documents
// @access  Private
const getMyDocuments = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient._id).select('documents');

    // Refresh presigned URLs
    const documents = await Promise.all(
      patient.documents.map(async (doc) => {
        const getCommand = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: doc.s3Key,
        });
        const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
        return { ...doc.toObject(), url: signedUrl };
      })
    );

    res.json({ success: true, documents });
  } catch (error) {
    logger.error('getMyDocuments error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete a patient document from S3
// @route   DELETE /api/upload/:s3Key
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const { s3Key } = req.params;

    await s3Client.send(
      new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: decodeURIComponent(s3Key) })
    );

    await Patient.findByIdAndUpdate(req.patient._id, {
      $pull: { documents: { s3Key: decodeURIComponent(s3Key) } },
    });

    res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    logger.error('deleteDocument error:', error);
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
};

module.exports = { upload, uploadDocument, getMyDocuments, deleteDocument };
