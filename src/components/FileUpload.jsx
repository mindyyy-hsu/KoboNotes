import { useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';

function FileUpload({ onFileUpload, loading }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.sqlite')) {
      onFileUpload(file);
    } else {
      alert('請上傳 .sqlite 檔案');
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-4 border-dashed border-indigo-300 rounded-lg p-12 text-center bg-white hover:border-indigo-500 transition-colors cursor-pointer"
    >
      <input
        type="file"
        accept=".sqlite"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
        disabled={loading}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <p className="text-xl font-semibold text-gray-700">
              正在解析資料庫...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-16 h-16 text-indigo-600 mb-4" />
            <p className="text-xl font-semibold text-gray-700 mb-2">
              拖放 KoboReader.sqlite 檔案到這裡
            </p>
            <p className="text-gray-500">或點擊選擇檔案</p>
          </div>
        )}
      </label>
    </div>
  );
}

export default FileUpload;
