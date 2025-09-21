import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ExternalLink, Bookmark, Filter, Calendar, Tag, TrendingUp } from 'lucide-react';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [viewMode, setViewMode] = useState('summaries');

  // Fetch articles from backend
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news');
      const data = await response.json();
      if (data.success) {
        // Filter out empty articles
        const validArticles = data.data.filter(article => article.title && article.title.trim() !== '');
        setArticles(validArticles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter articles based on search and selections
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchTerm ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.keywords.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    const matchesSource = !selectedSource || article.source === selectedSource;

    return matchesSearch && matchesCategory && matchesSource;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Drug Approval': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Research': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Guidelines': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Clinical Trial': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Biologics': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'News Article': return '📰';
      case 'PubMed': return '🔬';
      case 'Substack': return '📝';
      case 'Bluesky': return '🦋';
      case 'Reddit': return '💬';
      case 'FDA': return '🏛️';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Rheumify</h1>
              <span className="text-sm text-gray-500 hidden sm:inline">News</span>
            </div>
            <button
              onClick={fetchArticles}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Drug Approval">Drug Approval</option>
                <option value="Research">Research</option>
                <option value="Guidelines">Guidelines</option>
                <option value="Clinical Trial">Clinical Trial</option>
                <option value="Biologics">Biologics</option>
                <option value="General">General</option>
              </select>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sources</option>
                <option value="FDA">FDA</option>
                <option value="PubMed">PubMed</option>
                <option value="News Article">News</option>
                <option value="Reddit">Reddit</option>
                <option value="Substack">Substack</option>
              </select>

              <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
                {['headlines', 'summaries', 'full'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-sm font-medium ${
                      viewMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading articles...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredArticles.length} articles found
              </h2>
            </div>

            <div className="space-y-6">
              {filteredArticles.map(article => (
                <article key={article.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getSourceIcon(article.source)}</span>
                      <div>
                        <div className="text-sm text-gray-500">{article.source}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(article.priority)}`}>
                            {article.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <TrendingUp className="h-4 w-4" />
                        <span>{article.relevanceScore}%</span>
                      </div>
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {article.saved && (
                        <span className="text-yellow-500">
                          <Bookmark className="h-4 w-4 fill-current" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    {article.title}
                  </h3>

                  {viewMode !== 'headlines' && (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {article.summary}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{article.publishedDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Tag className="h-4 w-4" />
                        <span className="truncate max-w-xs">{article.keywords}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📰</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
