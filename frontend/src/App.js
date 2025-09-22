// Updated dark theme - force deploy
import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, RefreshCw, TrendingUp, Clock } from 'lucide-react';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSource, setSelectedSource] = useState('');

  // Mock data for demo (replace with your API call)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setArticles([
        {
          id: 1,
          title: "FDA Approves Upadacitinib for Rheumatoid Arthritis",
          source: "FDA",
          category: "Drug Approval",
          priority: "High",
          summary: "The FDA has approved upadacitinib (Rinvoq) for adults with moderately to severely active rheumatoid arthritis who have had an inadequate response to methotrexate. This JAK inhibitor represents a significant advancement in RA treatment options.",
          url: "https://www.fda.gov/news-events/press-announcements/fda-approves-rinvoq-upadacitinib",
          publishedDate: "2024-12-15",
          relevanceScore: 95,
          keywords: "FDA approval, upadacitinib, Rinvoq, JAK inhibitor, rheumatoid arthritis",
          saved: false
        },
        {
          id: 2,
          title: "Early Biologic Therapy Improves Long-term RA Outcomes",
          source: "PubMed",
          category: "Research",
          priority: "Medium",
          summary: "New research demonstrates that early intervention with biologic therapy significantly improves long-term disease outcomes in patients with rheumatoid arthritis. The study followed 500 patients over 5 years.",
          url: "https://pubmed.ncbi.nlm.nih.gov/example-study-123",
          publishedDate: "2024-12-10",
          relevanceScore: 87,
          keywords: "biologics, early intervention, disease outcomes, clinical study",
          saved: false
        },
        {
          id: 3,
          title: "ACR Updates Rheumatoid Arthritis Treatment Guidelines",
          source: "News Article",
          category: "Guidelines",
          priority: "Medium",
          summary: "The American College of Rheumatology has released updated guidelines for rheumatoid arthritis treatment, incorporating recent research on JAK inhibitors and biosimilars.",
          url: "https://rheumatology.org/guidelines-update-2024",
          publishedDate: "2024-12-05",
          relevanceScore: 82,
          keywords: "ACR, guidelines, treatment protocols, JAK inhibitors, biosimilars",
          saved: true
        },
        {
          id: 4,
          title: "New Biosimilar Shows Comparable Efficacy to Adalimumab",
          source: "PubMed",
          category: "Research",
          priority: "Medium",
          summary: "A recent clinical trial demonstrates that a new adalimumab biosimilar shows comparable efficacy and safety profile to the reference product in patients with rheumatoid arthritis.",
          url: "https://pubmed.ncbi.nlm.nih.gov/biosimilar-study",
          publishedDate: "2024-12-01",
          relevanceScore: 79,
          keywords: "biosimilar, adalimumab, efficacy, clinical trial",
          saved: false
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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
      case 'High': return 'bg-pink-200 text-pink-800 border border-pink-300';
      case 'Medium': return 'bg-amber-200 text-amber-800 border border-amber-300';
      case 'Low': return 'bg-green-200 text-green-800 border border-green-300';
      default: return 'bg-gray-200 text-gray-800 border border-gray-300';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Drug Approval': return 'bg-purple-200 text-purple-800 border border-purple-300';
      case 'Research': return 'bg-blue-200 text-blue-800 border border-blue-300';
      case 'Guidelines': return 'bg-emerald-200 text-emerald-800 border border-emerald-300';
      case 'Clinical Trial': return 'bg-cyan-200 text-cyan-800 border border-cyan-300';
      default: return 'bg-lavender-200 text-lavender-800 border border-lavender-300';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Matching rheumify.org with pastel accents */}
      <header className="py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Rheumatology News with{' '}
            <span className="text-purple-300">Rheumify</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Curated rheumatology content for medical professionals. 
            Stay updated with the latest research, guidelines, and FDA approvals.
          </p>
          
          {/* Simple Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-300 text-white placeholder-gray-300 text-lg"
              />
            </div>
          </div>

          {/* Simple Filters */}
          <div className="flex justify-center space-x-4 mb-8">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-300 text-white"
            >
              <option value="">All Categories</option>
              <option value="Drug Approval">Drug Approval</option>
              <option value="Research">Research</option>
              <option value="Guidelines">Guidelines</option>
              <option value="Clinical Trial">Clinical Trial</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-6 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-300 text-white"
            >
              <option value="">All Sources</option>
              <option value="FDA">FDA</option>
              <option value="PubMed">PubMed</option>
              <option value="News Article">News</option>
            </select>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-300 hover:bg-purple-400 text-purple-900 rounded-lg transition-colors font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-300 mx-auto mb-4" />
            <p className="text-gray-200 text-lg">Loading articles...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {filteredArticles.length} Articles Found
              </h2>
              <p className="text-gray-200">Latest rheumatology news and research</p>
            </div>

            <div className="space-y-8">
              {filteredArticles.map(article => (
                <article key={article.id} className="bg-gray-800 p-8 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                  {/* Article Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(article.priority)}`}>
                        {article.priority}
                      </span>
                      <span className={`px-3 py-1 text-sm rounded-full ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                      <span className="text-gray-300 text-sm bg-gray-700 px-3 py-1 rounded-full border border-gray-600">
                        {article.source}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1 text-purple-300">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">{article.relevanceScore}%</span>
                      </span>
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-300 hover:text-purple-200 transition-colors"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Article Content */}
                  <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                    {article.title}
                  </h3>

                  <p className="text-gray-200 text-lg leading-relaxed mb-6">
                    {article.summary}
                  </p>

                  {/* Article Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Published {article.publishedDate}</span>
                    </div>
                    <div className="text-gray-300 text-sm">
                      {article.keywords}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-white mb-4">No articles found</h3>
                <p className="text-gray-200 text-lg">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer - Simple like rheumify.org */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-300">
            Powered by{' '}
            <a 
              href="https://rheumify.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-200 transition-colors"
            >
              Rheumify
            </a>
            {' '}• Professional rheumatology education platform
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
