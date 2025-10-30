const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// POST /api/upload
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const filePath = req.file.path;
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file.');
        }
        // Print file content to console
        console.log('Uploaded file content:', data);
        // Optionally, send content back in response
        res.send({ content: data });
        // Clean up uploaded file
        fs.unlink(filePath, () => {});
    });
});

module.exports = router;
