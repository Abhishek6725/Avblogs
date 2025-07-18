const File = require('../models/File');
const Folder = require('../models/Folder');

const getFilesAndFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user._id });
    const files = await File.find({ userId: req.user._id });

    res.json({ folders, files });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createFile = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    const file = new File({
      name: name.endsWith('.md') ? name : `${name}.md`,
      content: '# New Document\n\nStart writing here...',
      parentId: parentId || null,
      userId: req.user._id
    });

    await file.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    const folder = new Folder({
      name,
      parentId: parentId || null,
      userId: req.user._id,
      isOpen: false
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const file = await File.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const folder = await Folder.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (type === 'file') {
      await File.findOneAndDelete({ _id: id, userId: req.user._id });
    } else if (type === 'folder') {
      // Delete folder and all its contents recursively
      await deleteNestedItems(id, req.user._id);
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteNestedItems = async (folderId, userId) => {
  // Find all subfolders
  const subfolders = await Folder.find({ parentId: folderId, userId });
  
  // Recursively delete subfolders
  for (const subfolder of subfolders) {
    await deleteNestedItems(subfolder._id, userId);
  }
  
  // Delete all files in this folder
  await File.deleteMany({ parentId: folderId, userId });
  
  // Delete the folder itself
  await Folder.findByIdAndDelete(folderId);
};

module.exports = {
  getFilesAndFolders,
  createFile,
  createFolder,
  updateFile,
  updateFolder,
  deleteItem
}; 