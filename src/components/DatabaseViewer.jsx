import { useState } from 'react';
import { Database, X, ChevronDown, ChevronRight } from 'lucide-react';

function DatabaseViewer({ books, onClose }) {
  const [expandedBook, setExpandedBook] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  const toggleBook = (bookId) => {
    setExpandedBook(expandedBook === bookId ? null : bookId);
  };

  const totalHighlights = books.reduce((sum, book) => sum + book.highlightCount, 0);
  const totalAnnotations = books.reduce((sum, book) => sum + book.annotationCount, 0);
  const purchasedBooks = books.filter(b => b.isPurchased).length;
  const relatedReadsBooks = books.filter(b => b.isRelatedReads).length;
  const sampleBooks = books.filter(b => b.isSample).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">資料庫檢視器</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 font-medium ${activeTab === 'summary'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              統計摘要
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`px-6 py-3 font-medium ${activeTab === 'books'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              書籍詳細資料
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-6 py-3 font-medium ${activeTab === 'raw'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              原始 JSON
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">總書籍數</div>
                  <div className="text-3xl font-bold text-blue-900 mt-2">{books.length}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">已購買書籍</div>
                  <div className="text-3xl font-bold text-green-900 mt-2">{purchasedBooks}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-600 font-medium">推薦書籍</div>
                  <div className="text-3xl font-bold text-purple-900 mt-2">{relatedReadsBooks}</div>
                  <div className="text-xs text-purple-600 mt-1">Related Reads</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-sm text-orange-600 font-medium">樣本書</div>
                  <div className="text-3xl font-bold text-orange-900 mt-2">{sampleBooks}</div>
                  <div className="text-xs text-orange-600 mt-1">試閱內容</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-sm text-yellow-600 font-medium">總畫線數</div>
                  <div className="text-3xl font-bold text-yellow-900 mt-2">{totalHighlights}</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="text-sm text-indigo-600 font-medium">總筆記數</div>
                  <div className="text-3xl font-bold text-indigo-900 mt-2">{totalAnnotations}</div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">資料庫欄位說明</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">id</span>
                    <span className="text-gray-700">書籍唯一識別碼 (ContentID)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">title</span>
                    <span className="text-gray-700">書名</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">author</span>
                    <span className="text-gray-700">作者 (Attribution)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">isPurchased</span>
                    <span className="text-gray-700">是否為購買的書籍 (根據 UserID, SyncTime, IsDownloaded 判斷)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">highlights</span>
                    <span className="text-gray-700">畫線列表 (來自 Bookmark 表)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-gray-200 px-2 py-1 rounded">annotations</span>
                    <span className="text-gray-700">筆記列表 (來自 Bookmark.Annotation)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'books' && (
            <div className="space-y-3">
              {books.map((book) => (
                <div key={book.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    onClick={() => toggleBook(book.id)}
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {expandedBook === book.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div>
                        <div className="font-bold text-gray-900">{book.title}</div>
                        <div className="text-sm text-gray-600">{book.author}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      {book.isRelatedReads && (
                        <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs">
                          推薦書籍
                        </span>
                      )}
                      {book.isSample && (
                        <span className="px-2 py-1 rounded bg-orange-100 text-orange-800 text-xs">
                          樣本
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded ${book.isPurchased ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {book.isPurchased ? '已購買' : '未購買'}
                      </span>
                      <span className="text-yellow-600">📝 {book.highlightCount}</span>
                      <span className="text-blue-600">💡 {book.annotationCount}</span>
                    </div>
                  </div>

                  {expandedBook === book.id && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto">
                        {JSON.stringify(book, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'raw' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  完整的 JSON 資料，可以複製用於分析或備份
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(books, null, 2));
                    alert('已複製到剪貼簿！');
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  複製 JSON
                </button>
              </div>
              <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto border border-gray-200">
                {JSON.stringify(books, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DatabaseViewer;
