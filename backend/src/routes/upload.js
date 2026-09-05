const express = require('express');
const router = express.Router();
const { upload, uploadDocument, getMyDocuments, deleteDocument } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', upload.single('document'), uploadDocument);
router.get('/my-documents', getMyDocuments);
router.delete('/:s3Key', deleteDocument);

module.exports = router;
