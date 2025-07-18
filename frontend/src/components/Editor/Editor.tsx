import React from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  placeholder = 'Write your markdown here...',
  className = '',
}) => {
  return (
    <div className={`h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h2 className="text-sm font-medium text-gray-700">Editor</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">Markdown</div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="flex-1 relative">
        <textarea
          className="w-full h-full p-6 bg-gray-900 text-gray-100 font-mono text-sm leading-relaxed focus:outline-none resize-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck="false"
          style={{
            fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
            tabSize: 2,
          }}
        />
        {/* Line numbers could be added here */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
          {content.split('\n').length} lines
        </div>
      </div>
    </div>
  );
};
