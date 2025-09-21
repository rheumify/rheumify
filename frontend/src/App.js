import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, TrendingUp, ExternalLink, Bookmark, Filter, Calendar } from 'lucide-react';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [viewMode, setViewMode] = useState('bullets');

  // Fetch articles from your backend
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
      case 'High': return 'bg-red-600 text-white';
      case 'Medium': return 'bg-orange-500 text-white';
      case 'Low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'News Article': return '📰';
      case 'PubMed': return '🔬';
      case 'Substack': return '📝';
      case 'Bluesky': return '🦋';
      case 'Reddit': return '🤖';
      case 'FDA': return '⚖️';
      default: return '📄';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Drug Approval': return 'bg-purple-600 text-white';
      case 'Research': return 'bg-blue-600 text-white';
      case 'Guidelines': return 'bg-indigo-600 text-white';
      case 'Clinical Trial': return 'bg-violet-600 text-white';
      case 'Biologics': return 'bg-fuchsia-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Dark Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-purple-300">Rheumify</h1>
                  <p className="text-sm text-purple-400">News</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-purple-300">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live Updates</span>
                </div>
              </div>
              
              <button
                onClick={fetchArticles}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dark Filters Bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-purple-200 placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-purple-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              <option value="Drug Approval">Drug Approval</option>
              <option value="Research">Research</option>
              <option value="Guidelines">Guidelines</option>
              <option value="Clinical Trial">Clinical Trial</option>
              <option value="Biologics">Biologics</option>
            </select>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-purple-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Sources</option>
              <option value="FDA">⚖️ FDA</option>
              <option value="PubMed">🔬 PubMed</option>
              <option value="News Article">📰 News</option>
              <option value="Substack">📝 Substack</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-gray-700 rounded overflow-hidden">
              {['headlines', 'bullets', 'full'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm transition-colors ${
                    viewMode === mode
                      ? 'bg-purple-600 text-white'
                      : 'text-purple-300 hover:bg-gray-600'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dark Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2 text-purple-300">Loading articles...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-purple-200 mb-2">
                Latest Rheumatology News
              </h2>
              <p className="text-purple-400">
                {filteredArticles.length} articles found
              </p>
            </div>

            <div className="space-y-6">
              {filteredArticles.map(article => (
                <article key={article.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 hover:border-purple-600 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getSourceIcon(article.source)}</span>
                      <div>
                        <span className="text-sm font-medium text-purple-300">{article.source}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded font-medium ${getPriorityColor(article.priority)}`}>
                            {article.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded font-medium ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-sm text-purple-400">
                        <TrendingUp className="h-4 w-4" />
                        <span>{article.relevanceScore}%</span>
                      </span>
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-purple-400 hover:text-purple-300 hover:bg-gray-700 rounded transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {article.saved && (
                        <span className="text-purple-400">
                          <Bookmark className="h-4 w-4 fill-current" />
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-purple-100 mb-3 hover:text-purple-200 transition-colors">
                    {article.title}
                  </h3>

                  {viewMode !== 'headlines' && (
                    <p className="text-purple-300 mb-4 leading-relaxed">
                      {article.summary}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-4 text-sm text-purple-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Published: {article.publishedDate}</span>
                      </div>
                      {viewMode === 'full' && (
                        <div className="flex items-center space-x-1">
                          <span>Keywords: {article.keywords}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-purple-600 text-6xl mb-4">📰</div>
                <h3 className="text-lg font-medium text-purple-200 mb-2">No articles found</h3>
                <p className="text-purple-400 mb-6">Try adjusting your search terms or filters.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedSource('');
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Dark Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-purple-400">
            <p>© 2024 Rheumify News. Curating rheumatology research and updates.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
