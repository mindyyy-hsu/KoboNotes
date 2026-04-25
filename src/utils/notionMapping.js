// Notion 映射管理：儲存和讀取 database ID 和 page IDs

const MAPPING_FILE_NAME = 'notion-mapping.csv';

export class NotionMappingManager {
  constructor() {
    this.mappings = new Map();
    this.databaseId = null;
  }

  // 從 CSV 載入映射
  async loadFromCSV(file) {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) return;

      // 第一行是 header: database_id,book_id,page_id,last_updated
      const header = lines[0];

      for (let i = 1; i < lines.length; i++) {
        const [databaseId, bookId, pageId, lastUpdated] = lines[i].split(',');

        if (databaseId && !this.databaseId) {
          this.databaseId = databaseId;
        }

        if (bookId && pageId) {
          this.mappings.set(bookId, {
            pageId: pageId.trim(),
            lastUpdated: lastUpdated ? new Date(lastUpdated.trim()) : null
          });
        }
      }
    } catch (error) {
      console.error('Error loading mapping:', error);
    }
  }

  // 從本地存儲載入
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('notion-mapping');
      if (stored) {
        const data = JSON.parse(stored);
        this.databaseId = data.databaseId;

        // 轉換日期字串回 Date 物件
        const mappings = Object.entries(data.mappings || {}).map(([key, value]) => {
          return [key, {
            pageId: value.pageId,
            lastUpdated: value.lastUpdated ? new Date(value.lastUpdated) : null
          }];
        });
        this.mappings = new Map(mappings);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  // 儲存到本地存儲
  saveToLocalStorage() {
    try {
      const data = {
        databaseId: this.databaseId,
        mappings: Object.fromEntries(this.mappings)
      };
      localStorage.setItem('notion-mapping', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // 設定 database ID
  setDatabaseId(databaseId) {
    this.databaseId = databaseId;
    this.saveToLocalStorage();
  }

  // 取得 database ID
  getDatabaseId() {
    return this.databaseId;
  }

  // 設定書籍的 page ID
  setPageId(bookId, pageId) {
    this.mappings.set(bookId, {
      pageId,
      lastUpdated: new Date()
    });
    this.saveToLocalStorage();
  }

  // 取得書籍的 page ID
  getPageId(bookId) {
    const mapping = this.mappings.get(bookId);
    return mapping ? mapping.pageId : null;
  }

  // 檢查書籍是否已存在
  hasPage(bookId) {
    return this.mappings.has(bookId);
  }

  // 匯出為 CSV
  exportToCSV() {
    const lines = ['database_id,book_id,page_id,last_updated'];

    for (const [bookId, data] of this.mappings.entries()) {
      let lastUpdated = '';
      if (data.lastUpdated) {
        try {
          const date = data.lastUpdated instanceof Date ? data.lastUpdated : new Date(data.lastUpdated);
          lastUpdated = date.toISOString();
        } catch (e) {
          console.error('Error converting date:', e);
        }
      }
      lines.push(`${this.databaseId || ''},${bookId},${data.pageId},${lastUpdated}`);
    }

    return lines.join('\n');
  }

  // 下載 CSV 檔案
  downloadCSV() {
    const csv = this.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', MAPPING_FILE_NAME);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 清除所有映射
  clear() {
    this.mappings.clear();
    this.databaseId = null;
    localStorage.removeItem('notion-mapping');
  }

  // 清除特定書籍的映射
  removePageId(bookId) {
    this.mappings.delete(bookId);
    this.saveToLocalStorage();
  }

  // 取得統計資訊
  getStats() {
    return {
      databaseId: this.databaseId,
      totalPages: this.mappings.size,
      mappings: Array.from(this.mappings.entries()).map(([bookId, data]) => ({
        bookId,
        pageId: data.pageId,
        lastUpdated: data.lastUpdated
      }))
    };
  }
}
