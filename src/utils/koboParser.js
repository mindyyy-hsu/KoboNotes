let sqlJsPromise = null;

async function loadSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sql.js.org/dist/sql-wasm.js';
      script.onload = () => {
        if (window.initSqlJs) {
          resolve(window.initSqlJs);
        } else {
          reject(new Error('Failed to load SQL.js'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load SQL.js script'));
      document.head.appendChild(script);
    });
  }
  return sqlJsPromise;
}

export async function parseKoboDatabase(file) {
  const initSqlJs = await loadSqlJs();
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });

  const arrayBuffer = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(arrayBuffer));

  const books = [];
  const bookMap = new Map();

  try {
    const booksQuery = `
      SELECT DISTINCT
        content.ContentID,
        content.Title,
        content.Attribution as Author,
        content.Description,
        content.Publisher,
        content.DateCreated,
        content.___UserID,
        content.___SyncTime,
        content.IsDownloaded,
        content.FeedbackType,
        content.Accessibility,
        content.___PercentRead,
        content.ReadStatus
      FROM content
      WHERE content.ContentType = 6
      AND content.Title IS NOT NULL
      ORDER BY content.Title
    `;

    const booksResult = db.exec(booksQuery);

    if (booksResult.length > 0) {
      const columns = booksResult[0].columns;
      const values = booksResult[0].values;

      values.forEach(row => {
        const userId = row[6];
        const syncTime = row[7];
        const isDownloaded = row[8];
        const feedbackType = row[9];
        const accessibility = row[10];
        const percentRead = row[11];
        const readStatus = row[12];

        const isPurchased = accessibility === 1;
        const isRelatedReads = accessibility === 6;
        const isSample = accessibility === 4 || accessibility === 9;

        const book = {
          id: row[0],
          title: row[1] || '未知書名',
          author: row[2] || '未知作者',
          description: row[3],
          publisher: row[4],
          dateCreated: row[5],
          isPurchased: isPurchased,
          accessibility: accessibility,
          percentRead: percentRead,
          isRelatedReads: isRelatedReads,
          isSample: isSample,
          highlights: [],
          annotations: []
        };
        books.push(book);
        bookMap.set(book.id, book);
      });
    }

    const highlightsQuery = `
      SELECT
        Bookmark.VolumeID,
        Bookmark.Text,
        Bookmark.Annotation,
        Bookmark.DateCreated,
        Bookmark.ChapterProgress,
        content.Title as ChapterTitle
      FROM Bookmark
      LEFT JOIN content ON Bookmark.ContentID = content.ContentID
      WHERE Bookmark.Text IS NOT NULL
      ORDER BY Bookmark.VolumeID, Bookmark.ChapterProgress
    `;

    const highlightsResult = db.exec(highlightsQuery);

    if (highlightsResult.length > 0) {
      const values = highlightsResult[0].values;

      values.forEach(row => {
        const volumeId = row[0];
        const book = bookMap.get(volumeId);

        if (book) {
          const highlight = {
            text: row[1],
            annotation: row[2],
            dateCreated: row[3],
            chapterProgress: row[4],
            chapterTitle: row[5]
          };

          if (highlight.text) {
            book.highlights.push(highlight);
          }

          if (highlight.annotation) {
            book.annotations.push({
              text: highlight.annotation,
              highlightText: highlight.text,
              dateCreated: highlight.dateCreated,
              chapterTitle: highlight.chapterTitle
            });
          }
        }
      });
    }

    books.forEach(book => {
      book.highlightCount = book.highlights.length;
      book.annotationCount = book.annotations.length;
    });

  } catch (error) {
    console.error('Error parsing Kobo database:', error);
    throw new Error('無法解析 Kobo 資料庫檔案');
  } finally {
    db.close();
  }

  return books;
}

export function groupHighlightsByChapter(highlights) {
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

export function exportToMarkdown(book) {
  let markdown = `# ${book.title}\n\n`;
  markdown += `**作者**: ${book.author}\n\n`;

  if (book.publisher) {
    markdown += `**出版社**: ${book.publisher}\n\n`;
  }

  if (book.description) {
    markdown += `## 簡介\n\n${book.description}\n\n`;
  }

  markdown += `## 統計\n\n`;
  markdown += `- 畫線數: ${book.highlightCount}\n`;
  markdown += `- 筆記數: ${book.annotationCount}\n\n`;

  if (book.highlights.length > 0) {
    markdown += `## 畫線與筆記\n\n`;

    const chapters = groupHighlightsByChapter(book.highlights);

    chapters.forEach(chapter => {
      markdown += `### ${chapter.title}\n\n`;

      chapter.highlights.forEach((highlight, index) => {
        markdown += `> ${highlight.text}\n\n`;

        if (highlight.annotation) {
          markdown += `**筆記**: ${highlight.annotation}\n\n`;
        }

        markdown += `---\n\n`;
      });
    });
  }

  return markdown;
}
