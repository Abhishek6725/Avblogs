import React, { useState } from 'react';
import { File as FiFile, Trash2 as FiTrash2, Edit2 as FiEdit2 } from 'lucide-react';
import type { FileType } from '../../types';

interface FileItemProps {
  file: FileType;
  isActive: boolean;
  onClick: (file: FileType) => void;
  onDelete: (id: string, type: 'file') => void;
  onEdit: (id: string, name: string) => void;
}

export const FileItem = ({
  file,
  isActive,
  onClick,
  onDelete,
  onEdit,
}: FileItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(file.name);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim()) {
      onEdit(file._id, editName);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(file.name);
    }
  };

  return (
    <div 
      className={`group flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 ${
        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
      }`}
      onClick={() => onClick(file)}
    >
      <FiFile className="flex-shrink-0 mr-2" size={16} />
      
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-white text-gray-900 px-2 py-1 text-sm rounded border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <span className="flex-1 truncate text-sm">{file.name}</span>
      )}
      
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleEdit}
          title="Rename"
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
        >
          <FiEdit2 size={14} />
        </button>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(file._id, 'file');
          }}
          title="Delete"
          className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
};
