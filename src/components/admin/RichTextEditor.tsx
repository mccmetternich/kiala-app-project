'use client';

import { useState, useRef, useCallback } from 'react';
import { Bold, Italic, List, ListOrdered, Link, Code, Eye, Heading1, Heading2, Quote } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Update the value after command execution
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        execCommand('bold');
        break;
      case 'italic':
        execCommand('italic');
        break;
      case 'ul':
        execCommand('insertUnorderedList');
        break;
      case 'ol':
        execCommand('insertOrderedList');
        break;
      case 'h2':
        execCommand('formatBlock', '<h2>');
        break;
      case 'h3':
        execCommand('formatBlock', '<h3>');
        break;
      case 'blockquote':
        execCommand('formatBlock', '<blockquote>');
        break;
      case 'paragraph':
        execCommand('formatBlock', '<p>');
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          execCommand('createLink', url);
        }
        break;
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const toggleMode = () => {
    setIsHtmlMode(!isHtmlMode);
  };

  const ToolbarButton = ({ icon: Icon, onClick, title, active }: { icon: any; onClick: () => void; title: string; active?: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${active ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        {!isHtmlMode && (
          <>
            <ToolbarButton icon={Bold} onClick={() => handleFormat('bold')} title="Bold (Ctrl+B)" />
            <ToolbarButton icon={Italic} onClick={() => handleFormat('italic')} title="Italic (Ctrl+I)" />
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <ToolbarButton icon={Heading1} onClick={() => handleFormat('h2')} title="Heading 2" />
            <ToolbarButton icon={Heading2} onClick={() => handleFormat('h3')} title="Heading 3" />
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <ToolbarButton icon={List} onClick={() => handleFormat('ul')} title="Bullet List" />
            <ToolbarButton icon={ListOrdered} onClick={() => handleFormat('ol')} title="Numbered List" />
            <ToolbarButton icon={Quote} onClick={() => handleFormat('blockquote')} title="Quote" />
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <ToolbarButton icon={Link} onClick={() => handleFormat('link')} title="Insert Link" />
          </>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={toggleMode}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
            isHtmlMode
              ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          {isHtmlMode ? 'Rich Text' : 'HTML'}
        </button>
      </div>

      {/* Editor Area */}
      {isHtmlMode ? (
        <textarea
          value={value}
          onChange={handleHtmlChange}
          placeholder={placeholder || 'Enter HTML content...'}
          className="w-full p-3 min-h-[200px] font-mono text-sm text-gray-900 placeholder-gray-400 focus:outline-none resize-y"
          spellCheck={false}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorChange}
          onBlur={handleEditorChange}
          dangerouslySetInnerHTML={{ __html: value }}
          className="w-full p-3 min-h-[200px] text-gray-900 focus:outline-none prose prose-sm max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-primary-600 [&_a]:underline"
          data-placeholder={placeholder || 'Start typing...'}
        />
      )}

      {/* Mode indicator */}
      <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>{isHtmlMode ? 'HTML Source Mode' : 'Rich Text Mode'}</span>
        <span>Toggle with button above</span>
      </div>
    </div>
  );
}
