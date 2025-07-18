import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Eye } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface PreviewProps {
  content: string;
  className?: string;
}

export const Preview = ({
  content,
  className = '',
}: PreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!previewRef.current) return;

    const element = previewRef.current;
    const opt = {
      margin: [10, 10],
      filename: 'document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className={`h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h2 className="text-sm font-medium text-gray-700">Preview</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            title="Download as PDF"
          >
            <Download size={14} />
            <span>PDF</span>
          </button>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="flex-1 relative bg-white">
        <div 
          ref={previewRef} 
          className="prose prose-sm max-w-none p-6 h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{
            fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
            lineHeight: '1.6',
          }}
        >
          <div className="prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:text-gray-700">
            <ReactMarkdown>{content || '# Welcome to BlogSpace\n\nStart typing in the editor to see your content rendered here!'}</ReactMarkdown>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
            <Eye size={12} className="inline mr-1" />
            Live Preview
          </div>
        </div>
      </div>
    </div>
  );
};
