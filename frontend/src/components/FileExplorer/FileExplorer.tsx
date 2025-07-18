
import type { FileType, FolderType } from '../../types';
import { FileItem } from './FileItem';
import { FolderItem } from './FolderItem';

interface FileExplorerProps {
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
  parentId?: string | null;
  level?: number;
}

export const FileExplorer= ({
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
  parentId = null,
  level = 0,
}:FileExplorerProps) => {
  const items = [
    ...folders.filter(f => f.parentId === parentId),
    ...files.filter(f => f.parentId === parentId)
  ].sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });

  if (items.length === 0) return null;

  return (
    <div style={{ marginLeft: `${level * 10}px` }}>
      {items.map(item => (
        <div key={item._id}>
          {item.type === 'folder' ? (
            <FolderItem
              folder={item}
              isActive={currentFolder?._id === item._id}
              onClick={onFolderClick}
              onToggle={onToggleFolder}
              onDelete={onDeleteItem}
              onEdit={onEditItem}
              onAddItem={onAddItem}
            >
              <FileExplorer
                folders={folders}
                files={files}
                currentFile={currentFile}
                currentFolder={currentFolder}
                onFileClick={onFileClick}
                onFolderClick={onFolderClick}
                onToggleFolder={onToggleFolder}
                onDeleteItem={onDeleteItem}
                onEditItem={onEditItem}
                onAddItem={onAddItem}
                parentId={item._id}
                level={level + 1}
              />
            </FolderItem>
          ) : (
            <FileItem
              file={item}
              isActive={currentFile?._id === item._id}
              onClick={onFileClick}
              onDelete={onDeleteItem}
              onEdit={onEditItem}
            />
          )}
        </div>
      ))}
    </div>
  );
};
