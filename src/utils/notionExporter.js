import { NotionMappingManager } from './notionMapping.js';

const API_BASE_URL = 'http://localhost:3001/api';

export class NotionExporter {
  constructor(apiKey, mappingManager = null) {
    this.apiKey = apiKey;
    this.mappingManager = mappingManager || new NotionMappingManager();
  }

  async createCombinedDatabase(parentPageId, title = 'Kobo 閱讀筆記') {
    try {
      const response = await fetch(`${API_BASE_URL}/notion/create-database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: this.apiKey,
          parentPageId,
          mode: 'combined',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '建立資料庫失敗');
      }

      const data = await response.json();
      return data.databaseId;
    } catch (error) {
      console.error('Error creating combined database:', error);
      throw new Error('無法建立資料庫');
    }
  }

  async createBookListDatabase(parentPageId, title = 'Kobo 書籍列表') {
    try {
      const response = await fetch(`${API_BASE_URL}/notion/create-database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: this.apiKey,
          parentPageId,
          mode: 'booklist',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '建立資料庫失敗');
      }

      const data = await response.json();
      return data.databaseId;
    } catch (error) {
      console.error('Error creating book list database:', error);
      throw new Error('無法建立書籍列表資料庫');
    }
  }

  async createNotesDatabase(parentPageId, title = 'Kobo 閱讀筆記') {
    try {
      const response = await fetch(`${API_BASE_URL}/notion/create-database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: this.apiKey,
          parentPageId,
          mode: 'notes',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '建立資料庫失敗');
      }

      const data = await response.json();
      return data.databaseId;
    } catch (error) {
      console.error('Error creating notes database:', error);
      throw new Error('無法建立筆記資料庫');
    }
  }

  async _createOldDatabase(parentPageId, title = 'Kobo 書籍列表') {
    try {
      const response = await fetch(`${API_BASE_URL}/notion/create-database`, {
        parent: {
          type: 'page_id',
          page_id: parentPageId,
        },
        title: [
          {
            type: 'text',
            text: {
              content: title,
            },
          },
        ],
        properties: {
          '書名': {
            title: {},
          },
          '作者': {
            rich_text: {},
          },
          '出版社': {
            rich_text: {},
          },
          '閱讀進度': {
            number: {
              format: 'percent',
            },
          },
          '畫線數': {
            number: {},
          },
          '筆記數': {
            number: {},
          },
          '閱讀狀態': {
            select: {
              options: [
                { name: '已完成', color: 'green' },
                { name: '閱讀中', color: 'yellow' },
                { name: '未開始', color: 'gray' },
              ],
            },
          },
          '購買狀態': {
            select: {
              options: [
                { name: '已購買', color: 'blue' },
                { name: '樣本', color: 'orange' },
                { name: '推薦', color: 'purple' },
              ],
            },
          },
          '新增日期': {
            date: {},
          },
        },
      });

      return response.id;
    } catch (error) {
      console.error('Error creating book list database:', error);
      throw new Error('無法建立書籍列表資料庫');
    }
  }

  async exportBookToNotion(databaseId, book) {
    try {
      const properties = {
        '書名': {
          title: [{ text: { content: book.title } }],
        },
        '作者': {
          rich_text: [{ text: { content: book.author } }],
        },
        '出版社': {
          rich_text: book.publisher ? [{ text: { content: book.publisher } }] : [],
        },
        '畫線數': {
          number: book.highlightCount,
        },
        '筆記數': {
          number: book.annotationCount,
        },
      };

      if (book.dateCreated) {
        properties['閱讀日期'] = {
          date: {
            start: new Date(book.dateCreated).toISOString().split('T')[0],
          },
        };
      }

      const children = book.highlights.length > 0 ? this.buildHighlightBlocks(book) : [];

      const response = await fetch(`${API_BASE_URL}/notion/create-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: this.apiKey,
          databaseId,
          properties,
          children: children.slice(0, 100),
        }),
      });

      if (!response.ok) {
        throw new Error('建立頁面失敗');
      }

      const data = await response.json();
      return { id: data.pageId };
    } catch (error) {
      console.error('Error exporting book to Notion:', error);
      throw new Error(`無法匯出書籍到 Notion: ${error.message}`);
    }
  }

  buildHighlightBlocks(book) {
    const blocks = [];

    if (book.description) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '簡介' } }],
        },
      });
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: book.description } }],
        },
      });
    }

    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: '畫線與筆記' } }],
      },
    });

    const chapters = this.groupHighlightsByChapter(book.highlights);

    for (const chapter of chapters) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ text: { content: chapter.title } }],
        },
      });

      for (const highlight of chapter.highlights) {
        blocks.push({
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [{ text: { content: highlight.text } }],
          },
        });

        if (highlight.annotation) {
          blocks.push({
            object: 'block',
            type: 'callout',
            callout: {
              icon: { emoji: '💡' },
              rich_text: [{ text: { content: highlight.annotation } }],
            },
          });
        }

        blocks.push({
          object: 'block',
          type: 'divider',
          divider: {},
        });
      }
    }

    return blocks;
  }

  groupHighlightsByChapter(highlights) {
    const chapters = new Map();

    highlights.forEach(highlight => {
      const chapterTitle = highlight.chapterTitle || '未分類章節';
      if (!chapters.has(chapterTitle)) {
        chapters.set(chapterTitle, []);
      }
      chapters.get(chapterTitle).push(highlight);
    });

    return Array.from(chapters.entries()).map(([title, items]) => ({
      title,
      highlights: items
    }));
  }

  async exportBookList(databaseId, books, onProgress) {
    const results = [];
    const purchasedBooks = books.filter(book => book.isPurchased);

    for (let i = 0; i < purchasedBooks.length; i++) {
      try {
        const book = purchasedBooks[i];
        const percentRead = book.percentRead || 0;

        let readStatus = '未開始';
        if (percentRead >= 100) {
          readStatus = '已完成';
        } else if (percentRead > 0) {
          readStatus = '閱讀中';
        }

        let purchaseStatus = '已購買';
        if (book.isRelatedReads) {
          purchaseStatus = '推薦';
        } else if (book.isSample) {
          purchaseStatus = '樣本';
        }

        const properties = {
          '書名': {
            title: [{ text: { content: book.title } }],
          },
          '作者': {
            rich_text: [{ text: { content: book.author } }],
          },
          '出版社': {
            rich_text: book.publisher ? [{ text: { content: book.publisher } }] : [],
          },
          '閱讀進度': {
            number: percentRead / 100,
          },
          '畫線數': {
            number: book.highlightCount,
          },
          '筆記數': {
            number: book.annotationCount,
          },
          '閱讀狀態': {
            select: { name: readStatus },
          },
          '購買狀態': {
            select: { name: purchaseStatus },
          },
        };

        if (book.dateCreated) {
          properties['新增日期'] = {
            date: {
              start: new Date(book.dateCreated).toISOString().split('T')[0],
            },
          };
        }

        const response = await fetch(`${API_BASE_URL}/notion/create-page`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: this.apiKey,
            databaseId,
            properties,
          }),
        });

        if (!response.ok) {
          throw new Error('建立頁面失敗');
        }

        const data = await response.json();
        results.push({ success: true, book: book, pageId: data.pageId });

        if (onProgress) {
          onProgress(i + 1, purchasedBooks.length, book.title);
        }
      } catch (error) {
        results.push({ success: false, book: purchasedBooks[i], error: error.message });
      }
    }

    return results;
  }

  async exportBooksWithNotes(databaseId, books, onProgress) {
    const results = [];
    const purchasedBooks = books.filter(book => book.isPurchased);

    // 儲存 database ID
    this.mappingManager.setDatabaseId(databaseId);

    for (let i = 0; i < purchasedBooks.length; i++) {
      try {
        const book = purchasedBooks[i];
        const bookId = `${book.title}_${book.author}`.replace(/[^a-zA-Z0-9_]/g, '_');
        const percentRead = book.percentRead || 0;

        let readStatus = '未開始';
        if (percentRead >= 100) {
          readStatus = '已完成';
        } else if (percentRead > 0) {
          readStatus = '閱讀中';
        }

        const properties = {
          '書名': {
            title: [{ text: { content: book.title } }],
          },
          '作者': {
            rich_text: [{ text: { content: book.author } }],
          },
          '出版社': {
            rich_text: book.publisher ? [{ text: { content: book.publisher } }] : [],
          },
          '閱讀進度': {
            number: percentRead / 100,
          },
          '畫線數': {
            number: book.highlightCount,
          },
          '筆記數': {
            number: book.annotationCount,
          },
          '閱讀狀態': {
            select: { name: readStatus },
          },
        };

        if (book.dateCreated) {
          properties['新增日期'] = {
            date: {
              start: new Date(book.dateCreated).toISOString().split('T')[0],
            },
          };
        }

        const existingPageId = this.mappingManager.getPageId(bookId);
        let pageId;

        if (existingPageId) {
          // 更新現有頁面
          const updateResponse = await fetch(`${API_BASE_URL}/notion/update-page`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: this.apiKey,
              pageId: existingPageId,
              properties,
            }),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('Update page error:', errorData);
            throw new Error(`更新頁面失敗: ${errorData.error || errorData.details || '未知錯誤'}`);
          }

          pageId = existingPageId;

          // 更新筆記區塊（增量更新）
          if (book.highlights.length > 0) {
            await this.updatePageBlocks(existingPageId, book);
          }
        } else {
          // 建立新頁面
          const children = book.highlights.length > 0 ? this.buildHighlightBlocks(book) : [];

          const createResponse = await fetch(`${API_BASE_URL}/notion/create-page`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: this.apiKey,
              databaseId,
              properties,
              children: children.slice(0, 100),
            }),
          });

          if (!createResponse.ok) {
            throw new Error('建立頁面失敗');
          }

          const data = await createResponse.json();
          pageId = data.pageId;
        }

        // 儲存映射
        this.mappingManager.setPageId(bookId, pageId);

        results.push({ success: true, book: book, pageId: pageId, updated: !!existingPageId });

        if (onProgress) {
          onProgress(i + 1, purchasedBooks.length, book.title);
        }
      } catch (error) {
        results.push({ success: false, book: purchasedBooks[i], error: error.message });
      }
    }

    return results;
  }

  // 更新頁面的筆記區塊（完全替換）
  async updatePageBlocks(pageId, book) {
    try {
      // 1. 取得現有區塊
      const blocksResponse = await fetch(`${API_BASE_URL}/notion/get-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: this.apiKey,
          pageId,
        }),
      });

      if (!blocksResponse.ok) {
        throw new Error('取得區塊失敗');
      }

      const existingBlocks = await blocksResponse.json();

      // 2. 刪除所有現有區塊
      for (const block of existingBlocks) {
        try {
          await fetch(`${API_BASE_URL}/notion/delete-block`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: this.apiKey,
              blockId: block.id,
            }),
          });
        } catch (error) {
          console.warn('Failed to delete block:', block.id, error);
        }
      }

      // 3. 建立新的筆記區塊
      const newBlocks = this.buildHighlightBlocks(book);

      // 4. 附加新區塊
      if (newBlocks.length > 0) {
        const appendResponse = await fetch(`${API_BASE_URL}/notion/append-blocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: this.apiKey,
            pageId,
            children: newBlocks.slice(0, 100),
          }),
        });

        if (!appendResponse.ok) {
          throw new Error('附加區塊失敗');
        }
      }
    } catch (error) {
      console.error('Error updating blocks:', error);
      throw error;
    }
  }

  async exportAllNotes(databaseId, books, onProgress) {
    const results = [];
    const purchasedBooks = books.filter(book => book.isPurchased);

    for (let i = 0; i < purchasedBooks.length; i++) {
      try {
        const result = await this.exportBookToNotion(databaseId, purchasedBooks[i]);
        results.push({ success: true, book: purchasedBooks[i], page: result });

        if (onProgress) {
          onProgress(i + 1, purchasedBooks.length, purchasedBooks[i].title);
        }
      } catch (error) {
        results.push({ success: false, book: purchasedBooks[i], error: error.message });
      }
    }

    return results;
  }
}
