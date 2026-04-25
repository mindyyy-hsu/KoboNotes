import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Upload, Download } from 'lucide-react';
import { NotionExporter } from '../utils/notionExporter';
import { NotionMappingManager } from '../utils/notionMapping';

function NotionExportModal({ books, onClose }) {
  const [step, setStep] = useState('config');
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [parentPageId, setParentPageId] = useState('');
  const [createNewDatabase, setCreateNewDatabase] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, bookTitle: '' });
  const [results, setResults] = useState([]);
  const [mappingManager] = useState(() => new NotionMappingManager());
  const [mappingStats, setMappingStats] = useState(null);

  useEffect(() => {
    // 從 localStorage 載入映射
    mappingManager.loadFromLocalStorage();
    updateMappingStats();

    // 如果有儲存的 database ID，自動填入
    const savedDatabaseId = mappingManager.getDatabaseId();
    if (savedDatabaseId) {
      setDatabaseId(savedDatabaseId);
      setCreateNewDatabase(false);
    }
  }, [mappingManager]);

  const updateMappingStats = () => {
    const stats = mappingManager.getStats();
    setMappingStats(stats);
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await mappingManager.loadFromCSV(file);
      updateMappingStats();

      const savedDatabaseId = mappingManager.getDatabaseId();
      if (savedDatabaseId) {
        setDatabaseId(savedDatabaseId);
        setCreateNewDatabase(false);
      }

      alert('CSV 映射檔案載入成功！');
    } catch (error) {
      alert(`載入 CSV 失敗: ${error.message}`);
    }
  };

  const handleCSVDownload = () => {
    mappingManager.downloadCSV();
  };

  const handleClearMapping = () => {
    if (confirm('確定要清除所有映射記錄嗎？下次匯出將建立全新的頁面。')) {
      mappingManager.clear();
      updateMappingStats();
      setDatabaseId('');
      setCreateNewDatabase(true);
      alert('映射記錄已清除！');
    }
  };

  const handleExport = async () => {
    if (!apiKey) {
      alert('請輸入 Notion API Key');
      return;
    }

    if (createNewDatabase && !parentPageId) {
      alert('請輸入 Notion 頁面 ID');
      return;
    }

    if (!createNewDatabase && !databaseId) {
      alert('請輸入 Notion 資料庫 ID');
      return;
    }

    setExporting(true);
    setStep('exporting');

    try {
      const exporter = new NotionExporter(apiKey, mappingManager);
      let targetDatabaseId = databaseId;

      if (createNewDatabase) {
        targetDatabaseId = await exporter.createCombinedDatabase(parentPageId);
        mappingManager.setDatabaseId(targetDatabaseId);
      }

      const exportResults = await exporter.exportBooksWithNotes(
        targetDatabaseId,
        books,
        (current, total, bookTitle) => {
          setProgress({ current, total, bookTitle });
        }
      );

      setResults(exportResults);
      updateMappingStats();
      setStep('complete');
    } catch (error) {
      alert(`匯出失敗: ${error.message}`);
      setStep('config');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">匯出到 Notion</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={exporting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'config' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notion API Key *
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="secret_xxxxxxxxxxxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  在 <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Notion Integrations</a> 建立 API Key
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium text-green-900">📋 映射管理</div>
                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-green-300 rounded-lg hover:bg-green-50 text-sm">
                        <Upload className="w-4 h-4" />
                        上傳 CSV
                      </div>
                    </label>
                    <button
                      onClick={handleCSVDownload}
                      disabled={!mappingStats || mappingStats.totalPages === 0}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-green-300 rounded-lg hover:bg-green-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      下載 CSV
                    </button>
                    <button
                      onClick={handleClearMapping}
                      disabled={!mappingStats || mappingStats.totalPages === 0}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      清除
                    </button>
                  </div>
                </div>
                {mappingStats && mappingStats.totalPages > 0 ? (
                  <div className="text-sm text-green-700">
                    <div>已記錄 <span className="font-bold">{mappingStats.totalPages}</span> 本書的頁面映射</div>
                    {mappingStats.databaseId && (
                      <div className="text-xs mt-1 font-mono bg-white px-2 py-1 rounded">
                        Database: {mappingStats.databaseId.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-green-600">
                    尚無映射記錄。首次匯出後會自動記錄，下次匯出將更新現有頁面。
                  </div>
                )}
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📚</div>
                  <div>
                    <div className="font-medium text-indigo-900">匯出內容</div>
                    <div className="text-sm text-indigo-700 mt-1">
                      將為每本書建立獨立頁面，包含：
                    </div>
                    <ul className="text-sm text-indigo-700 mt-2 space-y-1 list-disc list-inside">
                      <li>書籍資訊（書名、作者、出版社、閱讀進度）</li>
                      <li>完整的畫線與筆記內容</li>
                      <li>依章節自動分組</li>
                      <li className="font-bold">已存在的頁面會自動更新，不會重複建立</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={createNewDatabase}
                    onChange={(e) => setCreateNewDatabase(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    建立新的資料庫
                  </span>
                </label>

                {createNewDatabase ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notion 頁面 ID *
                    </label>
                    <input
                      type="text"
                      value={parentPageId}
                      onChange={(e) => setParentPageId(e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      在 Notion 頁面 URL 中找到頁面 ID（最後一段 32 字元）
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notion 資料庫 ID *
                    </label>
                    <input
                      type="text"
                      value={databaseId}
                      onChange={(e) => setDatabaseId(e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      在 Notion 資料庫 URL 中找到資料庫 ID
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">重要提醒</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>請確保已將 Integration 加入到目標頁面或資料庫</li>
                  <li>共將匯出 {books.length} 本書籍</li>
                  <li>每本書會建立一個獨立的頁面，包含所有畫線與筆記</li>
                </ul>
              </div>

              <button
                onClick={handleExport}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                開始匯出
              </button>
            </div>
          )}

          {step === 'exporting' && (
            <div className="space-y-6 text-center py-8">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  正在匯出到 Notion...
                </h3>
                <p className="text-gray-600">
                  {progress.current} / {progress.total}
                </p>
                {progress.bookTitle && (
                  <p className="text-sm text-gray-500 mt-2">
                    正在處理: {progress.bookTitle}
                  </p>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  匯出完成！
                </h3>
                <p className="text-gray-600">
                  成功匯出 {results.filter(r => r.success).length} / {results.length} 本書籍
                </p>
              </div>

              {results.some(r => !r.success) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-2">
                        以下書籍匯出失敗：
                      </h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        {results.filter(r => !r.success).map((result, idx) => (
                          <li key={idx}>
                            {result.book.title}: {result.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                完成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotionExportModal;
