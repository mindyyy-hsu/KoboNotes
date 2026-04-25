import { useState } from 'react';
import { ArrowLeft, Download, Highlighter, StickyNote } from 'lucide-react';
import { groupHighlightsByChapter, exportToMarkdown } from '../utils/koboParser';

function BookDetail({ book, onBack }) {
  const [activeTab, setActiveTab] = useState('highlights');
  const chapters = groupHighlightsByChapter(book.highlights);

  const handleExportMarkdown = () => {
    const markdown = exportToMarkdown(book);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          返回書架
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {book.title}
            </h1>
            <p className="text-xl text-gray-600 mb-4">{book.author}</p>
            
            {book.publisher && (
              <p className="text-gray-500 mb-2">出版社: {book.publisher}</p>
            )}

            {book.description && (
              <p className="text-gray-700 mt-4">{book.description}</p>
            )}
          </div>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            匯出 Markdown
          </button>
        </div>

        <div className="flex gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <Highlighter className="w-5 h-5 text-yellow-600" />
            <span className="text-gray-700">
              <strong>{book.highlightCount}</strong> 個畫線
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700">
              <strong>{book.annotationCount}</strong> 則筆記
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('highlights')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'highlights'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              畫線 ({book.highlightCount})
            </button>
            <button
              onClick={() => setActiveTab('annotations')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'annotations'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              筆記 ({book.annotationCount})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'highlights' && (
            <div className="space-y-8">
              {chapters.map((chapter, idx) => (
                <div key={idx}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {chapter.title}
                  </h3>
                  <div className="space-y-4">
                    {chapter.highlights.map((highlight, hIdx) => (
                      <div key={hIdx} className="border-l-4 border-yellow-400 pl-4 py-2">
                        <p className="text-gray-800 leading-relaxed">
                          {highlight.text}
                        </p>
                        {highlight.annotation && (
                          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900">
                              💡 {highlight.annotation}
                            </p>
                          </div>
                        )}
                        {highlight.dateCreated && (
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(highlight.dateCreated).toLocaleDateString('zh-TW')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {chapters.length === 0 && (
                <p className="text-gray-500 text-center py-8">此書沒有畫線</p>
              )}
            </div>
          )}

          {activeTab === 'annotations' && (
            <div className="space-y-4">
              {book.annotations.map((annotation, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {annotation.highlightText && (
                    <p className="text-gray-700 mb-2 italic">
                      「{annotation.highlightText}」
                    </p>
                  )}
                  <p className="text-blue-900 font-medium">
                    💡 {annotation.text}
                  </p>
                  {annotation.chapterTitle && (
                    <p className="text-xs text-gray-600 mt-2">
                      {annotation.chapterTitle}
                    </p>
                  )}
                  {annotation.dateCreated && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(annotation.dateCreated).toLocaleDateString('zh-TW')}
                    </p>
                  )}
                </div>
              ))}
              {book.annotations.length === 0 && (
                <p className="text-gray-500 text-center py-8">此書沒有筆記</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
