import { useState } from 'react';
import FileUpload from './components/FileUpload';
import BookShelf from './components/BookShelf';
import BookDetail from './components/BookDetail';
import NotionExportModal from './components/NotionExportModal';
import DatabaseViewer from './components/DatabaseViewer';
import SqliteViewer from './components/SqliteViewer';
import { parseKoboDatabase } from './utils/koboParser';
import { BookOpen, Database } from 'lucide-react';

function App() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNotionModal, setShowNotionModal] = useState(false);
  const [showDatabaseViewer, setShowDatabaseViewer] = useState(false);
  const [showSqliteViewer, setShowSqliteViewer] = useState(false);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);

    try {
      const parsedBooks = await parseKoboDatabase(file);
      setBooks(parsedBooks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
  };

  const handleBackToShelf = () => {
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                KoboNotes
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSqliteViewer(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Database className="w-4 h-4" />
                SQLite 檢視器
              </button>
              {books.length > 0 && (
                <>
                  <button
                    onClick={() => setShowDatabaseViewer(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Database className="w-4 h-4" />
                    查看資料庫
                  </button>
                  <button
                    onClick={() => setShowNotionModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    匯出到 Notion
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="mt-2 text-gray-600">
            上傳你的 Kobo 資料庫，整理所有閱讀筆記
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {books.length === 0 ? (
          <div className="space-y-6">
            <FileUpload onFileUpload={handleFileUpload} loading={loading} />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                如何使用
              </h2>
              <ol className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    1
                  </span>
                  <div>
                    <strong>安裝 Kobo 桌面版</strong>
                    <p className="text-gray-600">
                      到 kobo.com/desktop 下載並安裝桌面應用程式
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    2
                  </span>
                  <div>
                    <strong>登入並同步</strong>
                    <p className="text-gray-600">
                      打開 Kobo 桌面版，登入你的帳號並同步所有書籍與筆記
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    3
                  </span>
                  <div>
                    <strong>找到資料庫檔案</strong>
                    <p className="text-gray-600 mb-2">
                      根據你的作業系統，找到 KoboReader.sqlite 檔案：
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Windows: <code className="bg-gray-100 px-2 py-1 rounded">%LOCALAPPDATA%\Kobo\Kobo Desktop Edition</code></li>
                      <li>macOS: <code className="bg-gray-100 px-2 py-1 rounded">~/Library/Application Support/Kobo/Kobo Desktop Edition</code></li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    4
                  </span>
                  <div>
                    <strong>上傳檔案</strong>
                    <p className="text-gray-600">
                      將 KoboReader.sqlite 檔案拖放到上方的上傳區域
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        ) : selectedBook ? (
          <BookDetail
            book={selectedBook}
            onBack={handleBackToShelf}
          />
        ) : (
          <BookShelf
            books={books}
            onBookSelect={handleBookSelect}
          />
        )}
      </main>

      {showNotionModal && (
        <NotionExportModal
          books={books}
          onClose={() => setShowNotionModal(false)}
        />
      )}

      {showDatabaseViewer && (
        <DatabaseViewer
          books={books}
          onClose={() => setShowDatabaseViewer(false)}
        />
      )}

      {showSqliteViewer && (
        <SqliteViewer
          onClose={() => setShowSqliteViewer(false)}
        />
      )}

      <footer className="mt-16 py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>KoboNotes - 開源 Kobo 筆記整理工具</p>
          <p className="text-sm mt-2">與 Kobo / Rakuten 無任何關聯</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
