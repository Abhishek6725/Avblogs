import React, { useState, useEffect, useRef } from 'react';
import { X as FiX } from 'lucide-react';

interface AddItemInputProps {
  type: 'file' | 'folder';
  parentId: string | null;
  onAdd: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
  onCancel: () => void;
  className?: string;
}

export const AddItemInput: React.FC<AddItemInputProps> = ({
  type,
  parentId,
  onAdd,
  onCancel,
  className = '',
}) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name, type, parentId);
      setName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`add-item-form ${className}`}>
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`New ${type} name...`}
          className="flex-1 px-2 py-1 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-gray-500 hover:text-gray-700 focus:outline-none"
          title="Cancel"
        >
          <FiX size={16} className="lucide-icon" />
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-2 py-1 bg-blue-500 text-white rounded-r hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          title={`Add ${type}`}
        >
          Add
        </button>
      </div>
    </form>
  );
};
