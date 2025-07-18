import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import type { FileType, FolderType } from "../types";

export const useFileSystem = () => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentFile, setCurrentFile] = useState<FileType | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load files and folders from API
  const loadFilesAndFolders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getFilesAndFolders();
      
      setFolders(response.folders);
      setFiles(response.files);
      
      // Set first file as current if none is selected
      if (!currentFile && response.files.length > 0) {
        setCurrentFile(response.files[0]);
      }
    } catch (error) {
      console.error('Failed to load files and folders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load files and folders');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadFilesAndFolders();
  }, []);

  const createFile = async (name: string, parentId: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newFile = await apiService.createFile(name, parentId);
      
      setFiles(prev => [...prev, newFile]);
      setCurrentFile(newFile);
      
      return newFile;
    } catch (error) {
      console.error('Failed to create file:', error);
      setError(error instanceof Error ? error.message : 'Failed to create file');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async (name: string, parentId: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newFolder = await apiService.createFolder(name, parentId);
      
      setFolders(prev => [...prev, newFolder]);
      
      return newFolder;
    } catch (error) {
      console.error('Failed to create folder:', error);
      setError(error instanceof Error ? error.message : 'Failed to create folder');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFile = async (id: string, updates: Partial<FileType>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedFile = await apiService.updateFile(id, updates);
      
      setFiles(prev => 
        prev.map(file => file._id === id ? updatedFile : file)
      );
      
      if (currentFile?._id === id) {
        setCurrentFile(updatedFile);
      }
      
      return updatedFile;
    } catch (error) {
      console.error('Failed to update file:', error);
      setError(error instanceof Error ? error.message : 'Failed to update file');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFolder = async (id: string, updates: Partial<FolderType>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedFolder = await apiService.updateFolder(id, updates);
      
      setFolders(prev => 
        prev.map(folder => folder._id === id ? updatedFolder : folder)
      );
      
      if (currentFolder?._id === id) {
        setCurrentFolder(updatedFolder);
      }
      
      return updatedFolder;
    } catch (error) {
      console.error('Failed to update folder:', error);
      setError(error instanceof Error ? error.message : 'Failed to update folder');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string, type: "file" | "folder") => {
    try {
      setIsLoading(true);
      setError(null);
      
      await apiService.deleteItem(id, type);
      
      if (type === "file") {
        setFiles(prev => prev.filter(file => file._id !== id));
        if (currentFile?._id === id) {
          const remainingFiles = files.filter(file => file._id !== id);
          setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
        }
      } else {
        // Find all items to be deleted (folder and its contents)
        const folderIds = [id];
        let i = 0;
        
        while (i < folderIds.length) {
          const currentId = folderIds[i];
          const subfolders = folders.filter(f => f.parentId === currentId);
          subfolders.forEach(f => folderIds.push(f._id));
          i++;
        }
        
        setFolders(prev => prev.filter(f => !folderIds.includes(f._id)));
        setFiles(prev => prev.filter(f => !folderIds.includes(f.parentId || "")));
        
        if (currentFolder?._id === id) {
          setCurrentFolder(null);
        }
        
        // Update current file if it was deleted
        if (currentFile && folderIds.includes(currentFile.parentId || "")) {
          const remainingFiles = files.filter(f => !folderIds.includes(f.parentId || ""));
          setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
        }
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    folders,
    files,
    currentFile,
    currentFolder,
    isLoading,
    error,
    setCurrentFile,
    setCurrentFolder,
    createFile,
    createFolder,
    updateFile,
    updateFolder,
    deleteItem,
    clearError,
    refreshData: loadFilesAndFolders,
  };
};
