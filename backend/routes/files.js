const express = require('express');
const auth = require('../middleware/auth');
const {
  getFilesAndFolders,
  createFile,
  createFolder,
  updateFile,
  updateFolder,
  deleteItem
} = require('../controllers/fileController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/files - Get all files and folders
router.get('/', getFilesAndFolders);

// POST /api/files/file - Create a new file
router.post('/file', createFile);

// POST /api/files/folder - Create a new folder
router.post('/folder', createFolder);

// PUT /api/files/file/:id - Update a file
router.put('/file/:id', updateFile);

// PUT /api/files/folder/:id - Update a folder
router.put('/folder/:id', updateFolder);

// DELETE /api/files/:id - Delete a file or folder
router.delete('/:id', deleteItem);

module.exports = router; 