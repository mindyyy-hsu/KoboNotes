import { useState, useMemo } from 'react';
import { Search, BookOpen, Highlighter, StickyNote } from 'lucide-react';

function BookShelf({ books, onBookSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [showOnlyWithNotes, setShowOnlyWithNotes] = useState(true);
  const [showOnlyPurchased, setShowOnlyPurchased] = useState(true);
  const [searchInNotes, setSearchInNotes] = useState(false);

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books.filter(book => {
      let matchesSearch = false;

      if (searchInNotes && searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        matchesSearch = book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.highlights.some(h => h.text?.toLowerCase().includes(searchLower)) ||
          book.annotations.some(a => a.text?.toLowerCase().includes(searchLower));
      } else {
        matchesSearch = !searchTerm ||
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase());
      }

      const hasNotes = showOnlyWithNotes ? (book.highlightCount > 0 || book.annotationCount > 0) : true;
      const isPurchased = showOnlyPurchased ? book.isPurchased : true;

      return matchesSearch && hasNotes && isPurchased;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title, 'zh-TW');
        case 'author':
          return a.author.localeCompare(b.author, 'zh-TW');
        case 'highlights':
          return b.highlightCount - a.highlightCount;
        case 'annotations':
          return b.annotationCount - a.annotationCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [books, searchTerm, sortBy, showOnlyWithNotes, showOnlyPurchased, searchInNotes]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={searchInNotes ? "搜尋書名、作者或筆記內容..." : "搜尋書名或作者..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="title">依書名排序</option>
            <option value="author">依作者排序</option>
            <option value="highlights">依畫線數排序</option>
            <option value="annotations">依筆記數排序</option>
          </select>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-gray-600">
            共 {filteredAndSortedBooks.length} 本書籍
            {showOnlyWithNotes && <span className="text-sm ml-2">(有筆記)</span>}
            {showOnlyPurchased && <span className="text-sm ml-2">(已購買)</span>}
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyPurchased}
                onChange={(e) => setShowOnlyPurchased(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">只顯示購買的書籍</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyWithNotes}
                onChange={(e) => setShowOnlyWithNotes(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">只顯示有筆記</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={searchInNotes}
                onChange={(e) => setSearchInNotes(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">搜尋筆記內容</span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => onBookSelect(book)}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <BookOpen className="w-8 h-8 text-indigo-600 flex-shrink-0" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {book.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                {book.author}
              </p>

              {book.description && (
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {book.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-yellow-600">
                  <Highlighter className="w-4 h-4" />
                  <span>{book.highlightCount}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <StickyNote className="w-4 h-4" />
                  <span>{book.annotationCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedBooks.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">找不到符合的書籍</p>
        </div>
      )}
    </div>
  );
}

export default BookShelf;
