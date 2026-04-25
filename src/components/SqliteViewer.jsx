import { useState } from 'react';
import { X, Database, Table, FileJson } from 'lucide-react';

function SqliteViewer({ onClose }) {
  const [file, setFile] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);

    try {
      const sqlJs = await import('sql.js');
      const SQL = await sqlJs.default({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });

      const arrayBuffer = await uploadedFile.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(arrayBuffer));

      const tablesResult = db.exec(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `);

      if (tablesResult.length > 0) {
        const tableNames = tablesResult[0].values.map(row => row[0]);
        setTables(tableNames);
      }

      db.close();
    } catch (error) {
      console.error('Error loading database:', error);
      alert('無法載入資料庫檔案');
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName) => {
    setSelectedTable(tableName);
    setLoading(true);

    try {
      const initSqlJs = await loadSqlJs();
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });

      const arrayBuffer = await file.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(arrayBuffer));

      const schemaResult = db.exec(`PRAGMA table_info(${tableName})`);
      const dataResult = db.exec(`SELECT * FROM ${tableName} LIMIT 100`);

      const schema = schemaResult[0]?.values.map(row => ({
        cid: row[0],
        name: row[1],
        type: row[2],
        notnull: row[3],
        dflt_value: row[4],
        pk: row[5]
      })) || [];

      const columns = dataResult[0]?.columns || [];
      const rows = dataResult[0]?.values || [];

      setTableData({ schema, columns, rows });
      db.close();
    } catch (error) {
      console.error('Error loading table:', error);
      alert('無法載入表格資料');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">SQLite 資料庫檢視器</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* 左側：檔案上傳和表格列表 */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上傳 SQLite 檔案
              </label>
              <input
                type="file"
                accept=".sqlite,.db,.sqlite3"
                onChange={handleFileUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            {file && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">已載入檔案</div>
                <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
              </div>
            )}

            {tables.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  表格列表 ({tables.length})
                </div>
                <div className="space-y-1">
                  {tables.map(table => (
                    <button
                      key={table}
                      onClick={() => loadTableData(table)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedTable === table
                        ? 'bg-indigo-100 text-indigo-900 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      <Table className="w-4 h-4 inline mr-2" />
                      {table}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右側：表格資料 */}
          <div className="flex-1 overflow-auto p-6">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">載入中...</div>
              </div>
            )}

            {!loading && !selectedTable && (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <div>請上傳 SQLite 檔案並選擇表格</div>
                </div>
              </div>
            )}

            {!loading && tableData && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedTable}</h3>

                {/* Schema */}
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileJson className="w-4 h-4" />
                    表格結構
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">欄位名稱</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">類型</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">主鍵</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">非空</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.schema.map((col, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 font-mono text-indigo-600">{col.name}</td>
                            <td className="px-3 py-2 text-gray-600">{col.type}</td>
                            <td className="px-3 py-2">{col.pk ? '✓' : ''}</td>
                            <td className="px-3 py-2">{col.notnull ? '✓' : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Data */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    資料預覽 (前 100 筆)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {tableData.columns.map((col, idx) => (
                            <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.rows.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-gray-50">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-3 py-2 text-gray-600 max-w-xs truncate">
                                {cell === null ? <span className="text-gray-400 italic">null</span> : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SqliteViewer;
