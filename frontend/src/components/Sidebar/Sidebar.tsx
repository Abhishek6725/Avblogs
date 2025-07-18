import React, { useState } from 'react';
import { 
  Folder as FiFolder, 
  File as FiFile, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';
import { FileExplorer } from '../FileExplorer/FileExplorer';
import { useDebounce } from '../../hooks/useDebounce';
import type { FileType, FolderType } from '../../types';
import { Button } from '../UI/Button';

interface SidebarProps {
  folders: FolderType[];
  files: FileType[];
  currentFile: FileType | null;
  currentFolder: FolderType | null;
  onFileClick: (file: FileType) => void;
  onFolderClick: (folder: FolderType) => void;
  onToggleFolder: (id: string) => void;
  onDeleteItem: (id: string, type: 'file' | 'folder') => void;
  onEditItem: (id: string, name: string) => void;
  onAddItem: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  files,
  currentFile,
  currentFolder,
  onFileClick,
  onFolderClick,
  onToggleFolder,
  onDeleteItem,
  onEditItem,
  onAddItem,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addType, setAddType] = useState<'file' | 'folder'>('file');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <div className="w-16 h-full bg-white border-r border-gray-200 flex flex-col items-center py-4 transition-all duration-300">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg mb-4"
          title="Expand sidebar"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </Button>
        
        <div className="flex flex-col space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAddType('folder');
              setIsAdding(!isAdding);
            }}
            title="Add Folder"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiFolder size={18} className="text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAddType('file');
              setIsAdding(!isAdding);
            }}
            title="Add File"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiFile size={18} className="text-gray-600" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Files</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-1.5 hover:bg-gray-200 rounded-lg"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setAddType('folder');
              setIsAdding(!isAdding);
            }}
            className="flex-1 justify-center"
          >
            <FiFolder size={16} className="mr-2" />
            Folder
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setAddType('file');
              setIsAdding(!isAdding);
            }}
            className="flex-1 justify-center"
          >
            <FiFile size={16} className="mr-2" />
            File
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {isAdding && (
          <div className="m-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Plus size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                New {addType}
              </span>
            </div>
            <input
              type="text"
              autoFocus
              placeholder={`Enter ${addType} name...`}
              className="w-full p-2 text-sm bg-white border border-blue-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  const value = target.value.trim();
                  if (value) {
                    onAddItem(value, addType, null);
                    setIsAdding(false);
                  }
                } else if (e.key === 'Escape') {
                  setIsAdding(false);
                }
              }}
              onBlur={(e) => {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  onAddItem(value, addType, null);
                }
                setIsAdding(false);
              }}
            />
          </div>
        )}
        
        <div className="p-3">
          <FileExplorer
            folders={debouncedSearchTerm ? filteredFolders : folders}
            files={debouncedSearchTerm ? filteredFiles : files}
            currentFile={currentFile}
            currentFolder={currentFolder}
            onFileClick={onFileClick}
            onFolderClick={onFolderClick}
            onToggleFolder={onToggleFolder}
            onDeleteItem={onDeleteItem}
            onEditItem={onEditItem}
            onAddItem={onAddItem}
          />
        </div>
        
        {/* Stats */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Files:</span>
              <span>{files.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Folders:</span>
              <span>{folders.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
