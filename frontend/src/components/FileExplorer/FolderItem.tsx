import React, { useState } from 'react';
import { 
  ChevronDown as FiChevronDown, 
  ChevronRight as FiChevronRight, 
  Folder as FiFolder, 
  Plus as FiPlus, 
  Trash2 as FiTrash2, 
  Edit2 as FiEdit2 
} from 'lucide-react';
import type { FolderType } from '../../types';
import { AddItemInput } from '../UI';

interface FolderItemProps {
  folder: FolderType;
  isActive: boolean;
  onClick: (folder: FolderType) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string, type: 'folder') => void;
  onEdit: (id: string, name: string) => void;
  onAddItem: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
  children?: React.ReactNode;
}

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  isActive,
  onClick,
  onToggle,
  onDelete,
  onEdit,
  onAddItem,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim()) {
      onEdit(folder._id, editName);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(folder.name);
    }
  };

  const handleAddSubmit = (name: string, type: 'file' | 'folder', parentId: string | null) => {
    if (name.trim()) {
      onAddItem(name.trim(), type, parentId);
    }
    setIsAdding(false);
  };

  const handleAddCancel = () => {
    setIsAdding(false);
  };

  return (
    <div>
      <div 
        className={`group flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 ${
          isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onClick(folder)}
      >
        <span 
          onClick={(e) => { e.stopPropagation(); onToggle(folder._id); }}
          className="p-0.5 hover:bg-gray-200 rounded mr-1"
        >
          {folder.isOpen ? 
            <FiChevronDown size={14} className="text-gray-600" /> : 
            <FiChevronRight size={14} className="text-gray-600" />
          }
        </span>
        <FiFolder className="flex-shrink-0 mr-2 text-gray-600" size={16} />
        
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
          <span className="flex-1 truncate text-sm">{folder.name}</span>
        )}
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              handleEdit();
            }}
            title="Rename"
            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
          >
            <FiEdit2 size={14} />
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete(folder._id, 'folder');
            }}
            title="Delete"
            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
          >
            <FiTrash2 size={14} />
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation();
              setIsAdding(!isAdding);
            }}
            title="Add item"
            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>
      
      {isAdding && (
        <div className="pl-6 pr-2 mt-1">
          <AddItemInput 
            type="file" 
            parentId={folder._id} 
            onAdd={handleAddSubmit} 
            onCancel={handleAddCancel}
          />
        </div>
      )}
      
      <div className="pl-4">
        {folder.isOpen && children}
      </div>
    </div>
  );
};
