import React, { useState, useRef, useMemo, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import { 
  Plus, 
  List, 
  FileText, 
  Folder, 
  FolderOpen, 
  Tag, 
  ChevronDown, 
  Image as ImageIcon, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  Calendar,
  X,
  Sparkles,
  Share2,
  Check,
  Compass,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { blogApi, BlogPost, Category, Subcategory, getBlogImageUrl } from '../services/blogApi';
import { SEO } from './SEO';

// Re-export type
export type { BlogPost };

// ============================================================================
// 1. CAROUSEL COMPONENT (For Landing Page)
// ============================================================================

export interface BlogCarouselProps {
  theme: 'light' | 'dark';
  onSelectBlog?: (blog: BlogPost) => void;
  onViewAll?: () => void;
}

const DEFAULT_INITIAL_BLOGS: BlogPost[] = [
  {
    id: 1,
    title: 'The Power of Raj Yogas: Unlocking Wealth and Prosperity in Vedic Astrology',
    slug: 'the-power-of-raj-yogas-unlocking-wealth-and-prosperity-in-vedic-astrology',
    category: 'VEDIC ASTROLOGY',
    sub_category: 'Planetary Yogas',
    author: 'AstroJunction Masters',
    date: '2026-03-20',
    read_time: '5 min read',
    views: 1250,
    status: 'Published',
    tags: ['Raj Yoga', 'Kundli', 'Wealth', 'Jyotish'],
    image_url: '/blog_1.jpg',
    pinned: 1,
    preview: 'Understanding Raj Yogas in Your Birth Chart: In classical Vedic Astrology, a Raj Yoga represents a celestial alignment of supreme auspiciousness...',
    content: ''
  }
];

export const BlogCarousel: React.FC<BlogCarouselProps> = ({ theme, onSelectBlog, onViewAll }) => {
  const isDark = theme === 'dark';
  const [blogs, setBlogs] = useState<BlogPost[]>(DEFAULT_INITIAL_BLOGS);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await blogApi.getBlogs();
        if (Array.isArray(data) && data.length > 0) {
          const published = data.filter((b: any) => b.status === 'Published');
          setBlogs(published.length > 0 ? (published as BlogPost[]) : (data as BlogPost[]));
        }
      } catch (err) {
        console.error('Error fetching blogs for carousel:', err);
      }
    };

    fetchBlogs();
  }, []);

  const displayBlogs = useMemo(() => {
    if (blogs.length === 0) return [];
    if (blogs.length === 1) return [...blogs, ...blogs, ...blogs, ...blogs, ...blogs, ...blogs];
    if (blogs.length === 2) return [...blogs, ...blogs, ...blogs, ...blogs];
    if (blogs.length === 3) return [...blogs, ...blogs, ...blogs, ...blogs];
    return [...blogs, ...blogs];
  }, [blogs]);

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="w-full pt-16 pb-12 relative z-10 overflow-hidden">
      <div className="text-center mb-10 px-4">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <h2 className={`text-4xl md:text-5xl font-serif ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
            Cosmic &amp; <span className="italic font-light text-[#C9A050]">Insights</span>
          </h2>
        </div>
        <p className={`text-sm md:text-base text-center mx-auto max-w-lg ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
          Deep dives into authentic Vedic astrology, planetary yogas, and spiritual wisdom.
        </p>
      </div>

      <div 
        className="relative w-full overflow-hidden pb-8"
        style={{ 
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
        }}
      >
        <div className="flex w-max animate-marquee gap-6 px-4 hover:pause">
          {displayBlogs.map((blog, idx) => {
            const tagString = Array.isArray(blog.tags) && blog.tags.length > 0
              ? blog.tags.slice(0, 2).join(' • ')
              : blog.sub_category || 'VEDIC JYOTISH';

            const cleanExcerpt = blog.preview || 
              (blog.content ? blog.content.replace(/<[^>]*>?/gm, '').substring(0, 110) + '...' : '');

            return (
              <div 
                key={`${blog.id}-${idx}`}
                onClick={() => {
                  if (onSelectBlog) onSelectBlog(blog);
                  else if (onViewAll) onViewAll();
                }}
                style={{
                  backgroundColor: isDark ? '#141418' : '#FFFFFF',
                }}
                className={`shrink-0 w-[320px] md:w-[380px] rounded-[2rem] overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-2 duration-300 shadow-xl border-2 group ${
                  isDark 
                    ? 'border-[#2A2A2E] shadow-black/60 hover:border-[#C9A050]/60' 
                    : 'border-[#E2D9C8] shadow-amber-900/10 hover:border-[#C9A050]'
                }`}
              >
                <div className="relative h-[220px] w-full overflow-hidden bg-black/20">
                  <img 
                    src={getBlogImageUrl(blog.image_url)} 
                    alt={blog.title} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/blog_1.jpg';
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {blog.pinned === 1 && (
                    <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#C9A050] text-[#0D0D0F] text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      Featured
                    </span>
                  )}
                </div>
                
                <div 
                  style={{
                    backgroundColor: isDark ? '#141418' : '#FFFFFF',
                  }}
                  className="p-6 md:p-7 flex-1 flex flex-col"
                >
                  <div className="flex items-center space-x-2 mb-3 flex-wrap gap-y-1">
                    <span className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                      {blog.category || 'VEDIC ASTROLOGY'}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-[#50505A]' : 'text-[#A0988A]'}`}>•</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider truncate max-w-[170px] ${isDark ? 'text-[#9E9A90]' : 'text-[#5A544A]'}`}>
                      {tagString}
                    </span>
                  </div>

                  <h4 className={`text-lg md:text-xl font-serif font-bold mb-3 leading-snug line-clamp-2 ${
                    isDark ? 'text-[#F0ECE1]' : 'text-[#181614] group-hover:text-[#8C6218] transition-colors'
                  }`}>
                    {blog.title}
                  </h4>
                  
                  <p className={`text-xs md:text-sm leading-relaxed line-clamp-3 mb-4 mt-auto ${
                    isDark ? 'text-[#D0CCC2] font-normal' : 'text-[#4D473E] font-medium'
                  }`}>
                    {cleanExcerpt}
                  </p>

                  <div className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                    isDark ? 'border-white/10' : 'border-[#EAE3D4]'
                  }`}>
                    <span className={`font-black uppercase tracking-wider ${
                      isDark ? 'text-[#C9A050]' : 'text-[#8C6218] group-hover:text-[#63440B]'
                    }`}>
                      Read Article →
                    </span>
                    {blog.created_at && (
                      <span className={`text-[11px] font-semibold ${isDark ? 'text-gray-400' : 'text-[#7A7366]'}`}>
                        {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. PUBLIC BLOG READER & DIRECTORY
// ============================================================================

export interface BlogPageProps {
  theme: 'light' | 'dark';
  onBack: () => void;
  initialBlog?: BlogPost | null;
}

export function BlogPage({ theme, onBack, initialBlog = null }: BlogPageProps) {
  const isDark = theme === 'dark';
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(initialBlog);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (initialBlog) {
      setSelectedBlog(initialBlog);
    }
  }, [initialBlog]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    if (selectedBlog) {
      const slug = selectedBlog.slug || selectedBlog.id;
      const targetPath = `/blogs/${slug}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ blogSlug: slug }, '', targetPath);
      }
    } else {
      if (window.location.pathname.startsWith('/blogs/')) {
        window.history.pushState({}, '', '/blogs');
      }
    }
  }, [selectedBlog]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/blogs/')) {
        const slug = decodeURIComponent(path.replace(/^\/blogs\/?/, '').split('/')[0].split('?')[0]);
        if (slug) {
          const found = blogs.find((b: any) => b.slug === slug || String(b.id) === slug);
          if (found) {
            setSelectedBlog(found);
            return;
          }
        }
      } else if (path === '/blogs') {
        setSelectedBlog(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [blogs]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getBlogs();
        if (Array.isArray(data)) {
          const published = data.filter((b: BlogPost) => b.status === 'Published');
          const finalBlogs = published.length > 0 ? published : data;
          setBlogs(finalBlogs);

          // Support both /blogs/<slug> and legacy ?blog=<slug>
          let slugParam = '';
          const path = window.location.pathname;
          if (path.startsWith('/blogs/')) {
            slugParam = decodeURIComponent(path.replace(/^\/blogs\/?/, '').split('/')[0].split('?')[0]);
          } else {
            const params = new URLSearchParams(window.location.search);
            slugParam = params.get('blog') || '';
          }

          if (slugParam && !initialBlog) {
            const found = finalBlogs.find((b: any) => b.slug === slugParam || String(b.id) === slugParam);
            if (found) {
              setSelectedBlog(found);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching blogs in BlogPage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [initialBlog]);

  const handleShare = () => {
    if (selectedBlog) {
      const slug = selectedBlog.slug || selectedBlog.id;
      const shareUrl = `${window.location.origin}/blogs/${slug}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
      if (selectedBlog.id) {
        blogApi.shareBlog(selectedBlog.id).catch(() => {});
      }
    }
  };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const BLOGS_PER_PAGE = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    blogs.forEach((b) => {
      if (b.category && b.category.trim()) cats.add(b.category.trim());
    });
    return ['All', ...Array.from(cats)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchCat = selectedCategory === 'All' || blog.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCat;

      const titleMatch = blog.title.toLowerCase().includes(q);
      const excerptMatch = (blog.preview || '').toLowerCase().includes(q);
      const catMatch = (blog.category || '').toLowerCase().includes(q);
      const tagsMatch = Array.isArray(blog.tags) && blog.tags.some(t => t.toLowerCase().includes(q));

      return matchCat && (titleMatch || excerptMatch || catMatch || tagsMatch);
    });
  }, [blogs, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE);

  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
    return filteredBlogs.slice(startIndex, startIndex + BLOGS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  const currentBlogIndex = useMemo(() => {
    if (!selectedBlog) return -1;
    return blogs.findIndex((b) => b.id === selectedBlog.id);
  }, [blogs, selectedBlog]);

  const prevBlog = currentBlogIndex > 0 ? blogs[currentBlogIndex - 1] : null;
  const nextBlog = currentBlogIndex >= 0 && currentBlogIndex < blogs.length - 1 ? blogs[currentBlogIndex + 1] : null;

  const relatedBlogs = useMemo(() => {
    if (!selectedBlog) return [];
    return blogs
      .filter((b) => b.id !== selectedBlog.id)
      .slice(0, 3);
  }, [blogs, selectedBlog]);

  const readingTime = useMemo(() => {
    if (!selectedBlog?.content) return '4 min read';
    const wordCount = selectedBlog.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const minutes = Math.max(2, Math.ceil(wordCount / 180));
    return `${minutes} min read`;
  }, [selectedBlog]);

  if (selectedBlog) {
    const blogDescription = selectedBlog.preview || (selectedBlog.content ? selectedBlog.content.replace(/<[^>]*>?/gm, '').slice(0, 160) : selectedBlog.title);
    return (
      <div className={`min-h-[calc(100vh-5rem)] w-full pb-24 transition-colors ${
        isDark ? 'bg-[#0D0D0F] text-[#E5E1D8]' : 'bg-[#FAF8F5] text-[#0D0D0F]'
      }`}>
        <SEO
          title={`${selectedBlog.title} • ASTROJUNCTION`}
          description={blogDescription}
          keywords={Array.isArray(selectedBlog.tags) && selectedBlog.tags.length ? selectedBlog.tags : [selectedBlog.category || 'Vedic Astrology']}
          ogImage={selectedBlog.image_url || '/blog_1.jpg'}
          ogType="article"
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": selectedBlog.title,
            "description": blogDescription,
            "image": selectedBlog.image_url ? [selectedBlog.image_url] : [],
            "datePublished": selectedBlog.created_at || new Date().toISOString(),
            "author": {
              "@type": "Organization",
              "name": "ASTROJUNCTION Vedic Scholars"
            },
            "publisher": {
              "@type": "Organization",
              "name": "ASTROJUNCTION",
              "logo": {
                "@type": "ImageObject",
                "url": "https://astrojunction.com/jyotishveda_logo_standard.png"
              }
            }
          }}
        />
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          {/* Compact Back Button (No extra bulky navbar) */}
          <div className="mb-6 flex items-center justify-between">
            <button 
              onClick={() => setSelectedBlog(null)}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-black transition-all border-2 cursor-pointer group shadow-sm ${
                isDark 
                  ? 'text-[#F0ECE1] bg-[#18181C] hover:text-[#C9A050] border-[#C9A050]/60 hover:border-[#C9A050] hover:bg-[#202025]' 
                  : 'text-black bg-white hover:text-black hover:bg-amber-50/60 border-[#D4A328] hover:border-[#B88714] shadow-sm'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-black" />
              <span className="text-black font-black">Back</span>
            </button>

            {/* Compact Share Button */}
            <button
              onClick={handleShare}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-sm ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : isDark
                    ? 'bg-[#141418] text-[#9E9A90] hover:text-[#C9A050] border-[#2A2A2E] hover:border-[#C9A050]/40'
                    : 'bg-white text-gray-600 hover:text-amber-800 border-gray-200 hover:border-amber-400'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4 flex-wrap gap-y-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[#C9A050] text-[#0D0D0F] text-xs font-bold uppercase tracking-widest shadow-md shadow-[#C9A050]/20">
                {selectedBlog.category || 'Vedic Astrology'}
              </span>
              {selectedBlog.sub_category && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  isDark ? 'bg-[#18181C] text-[#C9A050] border-[#C9A050]/30' : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}>
                  {selectedBlog.sub_category}
                </span>
              )}
              <div className={`flex items-center space-x-1 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                <Clock className="w-3.5 h-3.5 text-[#C9A050]" />
                <span>{readingTime}</span>
              </div>
            </div>

            <h1 className={`text-2xl sm:text-3xl md:text-[32px] lg:text-[34px] font-serif font-bold leading-snug mb-4 sm:mb-5 ${
              isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'
            }`}>
              {selectedBlog.title}
            </h1>

            <div className={`flex items-center justify-between py-4 border-y flex-wrap gap-4 ${
              isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C9A050] to-[#E2BD68] flex items-center justify-center text-[#0D0D0F] font-serif font-bold shadow-md">
                  <Sparkles className="w-5 h-5 text-[#0D0D0F]" />
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center space-x-1.5">
                    <span className={isDark ? 'text-[#F0ECE1]' : 'text-gray-900'}>AstroJunction Masters</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-semibold">
                      Verified
                    </span>
                  </div>
                  <div className={`text-xs flex items-center space-x-2 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                    <Calendar className="w-3 h-3" />
                    <span>
                      {selectedBlog.created_at
                        ? new Date(selectedBlog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : 'Authentic Vedic Archive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#C9A050]/10 border border-[#C9A050]/30 text-[#C9A050] text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>Parashari & Jaimini Wisdom</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl border border-white/10 aspect-[16/9] sm:aspect-[21/9] bg-black/40">
            <img 
              src={getBlogImageUrl(selectedBlog.image_url)} 
              alt={selectedBlog.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/blog_1.jpg';
              }}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${
              isDark ? 'from-[#0D0D0F]/60 via-transparent' : 'from-black/40 via-transparent'
            } to-transparent pointer-events-none`}></div>
          </div>

          {Array.isArray(selectedBlog.tags) && selectedBlog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedBlog.tags.map((tag, i) => (
                <span 
                  key={i}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isDark 
                      ? 'bg-[#18181C] text-[#C9A050] border border-[#2A2A2E] hover:border-[#C9A050]/50' 
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <Tag className="w-3 h-3 text-[#C9A050]" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          <div 
            className={`article-content prose max-w-none space-y-6 leading-relaxed text-base sm:text-lg font-sans transition-colors ${
              isDark ? 'prose-invert text-[#E5E1D8]' : 'text-gray-900'
            }`}
            style={{
              lineHeight: '1.85',
            }}
            dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
          />

          <div className={`my-12 p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-r from-[#18181C] to-[#121215] border-[#C9A050]/30 shadow-xl' 
              : 'bg-gradient-to-r from-amber-50/80 to-white border-amber-200 shadow-md'
          }`}>
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-[#C9A050]/20 text-[#C9A050] shrink-0 mt-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`text-lg font-serif font-bold mb-1.5 ${isDark ? 'text-[#F0ECE1]' : 'text-amber-950'}`}>
                  Vedic Astrological Principle
                </h4>
                <p className={`text-sm sm:text-base italic leading-relaxed ${isDark ? 'text-[#9E9A90]' : 'text-gray-700'}`}>
                  "Yatha pinde tatha brahmande, yatha brahmande tatha pinde." — As is the individual, so is the universe; as is the microcosm, so is the macrocosm. Every planetary placement unfolds karmic blueprints for spiritual and worldly growth.
                </p>
              </div>
            </div>
          </div>

          {/* Previous & Next Article Navigation Cards */}
          {(prevBlog || nextBlog) && (
            <div className={`my-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t ${
              isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
            }`}>
              {prevBlog ? (
                <div
                  onClick={() => {
                    setSelectedBlog(prevBlog);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group shadow-md hover:shadow-lg ${
                    isDark 
                      ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/60' 
                      : 'bg-white border-[#E2D9C8] hover:border-[#C9A050]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider mb-2 text-[#C9A050]">
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Previous Article</span>
                  </div>
                  <h5 className={`text-sm sm:text-base font-serif font-bold line-clamp-2 ${
                    isDark ? 'text-[#F0ECE1] group-hover:text-[#C9A050]' : 'text-gray-900 group-hover:text-[#8C6218]'
                  } transition-colors`}>
                    {prevBlog.title}
                  </h5>
                </div>
              ) : (
                <div className="hidden sm:block"></div>
              )}

              {nextBlog ? (
                <div
                  onClick={() => {
                    setSelectedBlog(nextBlog);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between items-end text-right group shadow-md hover:shadow-lg ${
                    isDark 
                      ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/60' 
                      : 'bg-white border-[#E2D9C8] hover:border-[#C9A050]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider mb-2 text-[#C9A050]">
                    <span>Next Article</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                  <h5 className={`text-sm sm:text-base font-serif font-bold line-clamp-2 ${
                    isDark ? 'text-[#F0ECE1] group-hover:text-[#C9A050]' : 'text-gray-900 group-hover:text-[#8C6218]'
                  } transition-colors`}>
                    {nextBlog.title}
                  </h5>
                </div>
              ) : (
                <div className="hidden sm:block"></div>
              )}
            </div>
          )}

          <div className={`pt-8 pb-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
          }`}>
            <button
              onClick={() => setSelectedBlog(null)}
              style={{ backgroundColor: isDark ? '#141418' : '#FFFFFF' }}
              className={`w-full sm:w-auto px-7 py-3 rounded-full flex items-center justify-center space-x-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg border-2 group ${
                isDark 
                  ? 'border-[#C9A050] text-[#F0ECE1] hover:bg-[#C9A050] hover:text-[#0D0D0F]' 
                  : 'border-[#C9A050] text-[#0D0D0F] hover:bg-[#C9A050] hover:text-[#0D0D0F]'
              }`}
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#C9A050] group-hover:text-inherit" />
              <span className="font-bold tracking-wider">Back</span>
            </button>

            <button
              onClick={() => {
                setSelectedBlog(null);
                onBack();
              }}
              className="w-full sm:w-auto px-8 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer flex items-center justify-center space-x-2 bg-gradient-to-r from-[#D4AF37] via-[#C9A050] to-[#B89040] hover:from-[#E5C158] hover:to-[#C9A050] text-[#0D0D0F] border-2 border-[#E5C158] hover:scale-105 active:scale-95 group shadow-[#C9A050]/20"
            >
              <span className="text-[#0D0D0F] font-black tracking-wider">Explore Oracle &amp; Charts</span>
              <ArrowRight className="w-4 h-4 text-[#0D0D0F] transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Recommended Cosmic Insights Section (Commented out per user request)
          {relatedBlogs.length > 0 && (
            <div className="pt-8 border-t border-white/10">
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-serif font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  Recommended <span className="italic font-light text-[#C9A050]">Cosmic Insights</span>
                </h3>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                  Continue exploring divine astrological knowledge.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relBlog) => (
                  <div
                    key={relBlog.id}
                    onClick={() => setSelectedBlog(relBlog)}
                    style={{
                      backgroundColor: isDark ? '#141418' : '#FFFFFF',
                    }}
                    className={`rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-1.5 duration-300 border shadow-lg group ${
                      isDark 
                        ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/50' 
                        : 'bg-[#FFFFFF] border-[#E2D9C8] hover:border-[#C9A050] shadow-stone-900/10'
                    }`}
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-black/20">
                      <img 
                        src={getBlogImageUrl(relBlog.image_url)} 
                        alt={relBlog.title} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/blog_1.jpg';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className={`p-5 flex-1 flex flex-col ${isDark ? 'bg-[#141418]' : 'bg-[#FFFFFF]'}`}>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                        {relBlog.category || 'Vedic Wisdom'}
                      </span>
                      <h4 className={`text-sm font-semibold line-clamp-2 leading-snug mb-3 ${
                        isDark ? 'text-[#F0ECE1]' : 'text-[#181614] group-hover:text-[#8C6218] transition-colors'
                      }`}>
                        {relBlog.title}
                      </h4>
                      <span className={`mt-auto text-[11px] font-black uppercase tracking-wider ${
                        isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'
                      }`}>
                        Read Post →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          */}
        </article>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-5rem)] w-full pb-32 transition-colors ${
      isDark ? 'bg-[#0D0D0F] text-[#E5E1D8]' : 'bg-[#FAF8F5] text-[#0D0D0F]'
    }`}>
      <SEO
        title="Vedic Astrology Blogs, Articles & Ancient Wisdom • ASTROJUNCTION"
        description="Explore curated articles on planetary transits, zodiac compatibility, Vedic rituals, gemstones, and spiritual growth."
        keywords={["astrology blog", "vedic articles", "zodiac signs blog", "planetary transits", "vedic wisdom"]}
        ogImage="/blog_1.jpg"
        ogType="website"
      />
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <button 
            onClick={onBack}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all border shadow-sm cursor-pointer ${
              isDark 
                ? 'text-[#9E9A90] hover:text-[#C9A050] hover:bg-[#C9A050]/10 border-[#2A2A2E] hover:border-[#C9A050]/40' 
                : 'text-gray-700 hover:text-amber-800 hover:bg-amber-500/10 border-gray-200 hover:border-amber-600 bg-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold">Back to Home</span>
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics..."
              className={`w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-full border outline-none transition-all ${
                isDark 
                  ? 'bg-[#18181C] border-[#2A2A2E] text-white focus:border-[#C9A050]' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-amber-600 shadow-sm'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
            All <span className="italic font-light text-[#C9A050]">Blogs</span> & Insights
          </h1>
          <p className={`text-xs sm:text-sm max-w-3xl mx-auto mb-5 ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
            Explore authentic Vedic astrology, planetary yogas, kundli matching, and spiritual wisdom directly from our masters.
          </p>

          {categories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050] shadow-md shadow-[#C9A050]/20'
                      : isDark
                        ? 'bg-[#18181C] text-[#9E9A90] hover:text-white border-[#2A2A2E]'
                        : 'bg-white text-gray-700 hover:text-black border-gray-200 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C9A050] mb-3"></div>
            <p className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>Loading articles...</p>
          </div>
        )}

        {!loading && filteredBlogs.length === 0 && (
          <div className={`max-w-md mx-auto text-center py-16 px-6 rounded-3xl border ${
            isDark ? 'bg-[#18181C]/60 border-white/5' : 'bg-white border-gray-100'
          }`}>
            <BookOpen className="w-10 h-10 text-[#C9A050]/60 mx-auto mb-3" />
            <h3 className={`text-lg font-serif font-bold mb-2 ${isDark ? 'text-[#F0ECE1]' : 'text-gray-900'}`}>
              {searchQuery ? 'No Matching Articles' : 'No Blogs Published Yet'}
            </h3>
            <p className={`text-xs mb-5 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              {searchQuery 
                ? `No articles found matching "${searchQuery}". Try a different search term.` 
                : 'Blogs created and published from the Admin Panel will appear here.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-4 py-1.5 rounded-full bg-[#C9A050] text-[#0D0D0F] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!loading && filteredBlogs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedBlogs.map((blog) => {
                const tagString = Array.isArray(blog.tags) && blog.tags.length > 0
                  ? blog.tags.slice(0, 2).join(' • ')
                  : blog.sub_category || 'VEDIC JYOTISH';

                const cleanExcerpt = blog.preview || 
                  (blog.content ? blog.content.replace(/<[^>]*>?/gm, '').substring(0, 130) + '...' : '');

                return (
                  <div 
                    key={blog.id}
                    onClick={() => setSelectedBlog(blog)}
                    style={{
                      backgroundColor: isDark ? '#141418' : '#FFFFFF',
                    }}
                    className={`rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-1.5 duration-300 shadow-xl border group relative z-10 ${
                      isDark 
                        ? 'bg-[#141418] border-[#2A2A2E] shadow-black/60 hover:border-[#C9A050]/60' 
                        : 'bg-[#FFFFFF] border-[#E2D9C8] shadow-xl shadow-stone-900/10 hover:border-[#C9A050] hover:shadow-2xl'
                    }`}
                  >
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-black/20">
                      <img 
                        src={getBlogImageUrl(blog.image_url)} 
                        alt={blog.title} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/blog_1.jpg';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {blog.pinned === 1 && (
                        <span className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full bg-[#C9A050] text-[#0D0D0F] text-[10px] font-bold uppercase tracking-wider shadow-md">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <div 
                      style={{
                        backgroundColor: isDark ? '#141418' : '#FFFFFF',
                      }}
                      className={`p-6 flex-1 flex flex-col ${isDark ? 'bg-[#141418]' : 'bg-[#FFFFFF]'}`}
                    >
                      <div className="flex items-center space-x-2 mb-3 flex-wrap gap-y-1">
                        <span className={`text-[11px] font-extrabold uppercase tracking-[0.15em] ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                          {blog.category || 'VEDIC ASTROLOGY'}
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-[#50505A]' : 'text-[#A0988A]'}`}>•</span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider truncate max-w-[170px] ${isDark ? 'text-[#9E9A90]' : 'text-[#5A544A]'}`}>
                          {tagString}
                        </span>
                      </div>

                      <h3 className={`text-lg sm:text-xl font-serif font-bold mb-3 leading-snug line-clamp-2 ${
                        isDark ? 'text-[#F0ECE1]' : 'text-[#181614] group-hover:text-[#8C6218] transition-colors'
                      }`}>
                        {blog.title}
                      </h3>
                      
                      <p className={`text-xs sm:text-sm leading-relaxed mb-5 line-clamp-3 ${
                        isDark ? 'text-[#D0CCC2] font-normal' : 'text-[#4D473E] font-medium'
                      }`}>
                        {cleanExcerpt}
                      </p>

                      <div className={`mt-auto pt-3.5 border-t flex items-center justify-between ${
                        isDark ? 'border-white/10' : 'border-[#EAE3D4]'
                      }`}>
                        <span className={`text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 ${
                          isDark ? 'text-[#C9A050]' : 'text-[#8C6218] group-hover:text-[#63440B]'
                        }`}>
                          <span>Read Article</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                        {blog.created_at && (
                          <span className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
                            {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Numbered Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(prev => prev - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1 border transition-all ${
                    currentPage === 1
                      ? 'opacity-30 cursor-not-allowed border-gray-700/20'
                      : isDark
                        ? 'bg-[#141418] text-[#F0ECE1] hover:text-[#C9A050] border-[#2A2A2E] hover:border-[#C9A050]/60 cursor-pointer shadow-md'
                        : 'bg-white text-gray-800 hover:text-black border-gray-200 hover:border-amber-500 shadow-sm cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-[#F7D36D] via-[#F3C54E] to-[#EBB738] text-black shadow-md border border-[#D4A328] font-black scale-105'
                          : isDark
                            ? 'bg-[#141418] text-[#9E9A90] hover:text-white border border-[#2A2A2E] hover:border-[#C9A050]/40'
                            : 'bg-white text-gray-700 hover:text-black border border-gray-200 hover:border-amber-400 shadow-sm'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(prev => prev + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1 border transition-all ${
                    currentPage === totalPages
                      ? 'opacity-30 cursor-not-allowed border-gray-700/20'
                      : isDark
                        ? 'bg-[#141418] text-[#F0ECE1] hover:text-[#C9A050] border-[#2A2A2E] hover:border-[#C9A050]/60 cursor-pointer shadow-md'
                        : 'bg-white text-gray-800 hover:text-black border-gray-200 hover:border-amber-500 shadow-sm cursor-pointer'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. ADMIN BLOG MANAGEMENT COMPONENT
// ============================================================================

export interface AdminBlogsViewProps {
  theme?: 'dark' | 'light';
}

export const AdminBlogsView: React.FC<AdminBlogsViewProps> = ({ theme = 'dark' }) => {
  const editor = useRef(null);
  
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'categories'>('list');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    sub_category: '',
    status: 'Published',
    tags: '',
    image_url: '',
    pinned: false,
    content: ''
  });

  const config = useMemo(() => ({
    readonly: false, 
    theme: theme === 'dark' ? 'dark' : 'default',
    height: 500,
    toolbarAdaptive: false,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'video', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'fullsize'
    ],
    style: {
      background: theme === 'dark' ? '#0D0D0F' : '#FFFFFF',
      color: theme === 'dark' ? '#E5E1D8' : '#0D0D0F',
    }
  }), [theme]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blogsData, catsData, subCatsData] = await Promise.all([
        blogApi.getBlogs('All'),
        blogApi.getCategories(),
        blogApi.getSubcategories(),
      ]);
      setBlogs(blogsData || []);
      setCategories(catsData || []);
      setSubcategories(subCatsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableSubcategories = subcategories.filter(sub => {
    const parentCat = categories.find(c => c.name === formData.category);
    return parentCat && sub.category_id === parentCat.id;
  });

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      await blogApi.createCategory(newCategoryName.trim());
      setNewCategoryName('');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure? This may affect blogs assigned to this category.')) return;
    try {
      await blogApi.deleteCategory(id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim() || !selectedCategoryForSub) return;
    
    try {
      await blogApi.createSubcategory(newSubcategoryName.trim(), Number(selectedCategoryForSub));
      setNewSubcategoryName('');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create subcategory');
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await blogApi.deleteSubcategory(id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (newContent: string) => {
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      sub_category: '',
      status: 'Published',
      tags: '',
      image_url: '',
      pinned: false,
      content: ''
    });
    setEditingId(null);
    setImagePreviewUrl('');
  };

  const handleEditBlog = (blog: any) => {
    setEditingId(blog.id);
    setImagePreviewUrl(getBlogImageUrl(blog.image_url));
    setFormData({
      title: blog.title || '',
      category: blog.category || '',
      sub_category: blog.sub_category || '',
      status: blog.status || 'Published',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      image_url: blog.image_url || '',
      pinned: !!blog.pinned,
      content: blog.content || ''
    });
    setViewMode('create');
  };

  const handleDeleteBlog = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await blogApi.deleteBlog(id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete blog');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please provide both a Title and Content for the blog.');
      return;
    }

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formData.content;
      const rawText = tempDiv.textContent || tempDiv.innerText || '';
      const preview = rawText.slice(0, 160).trim() + (rawText.length > 160 ? '...' : '');

      const payload = {
        title: formData.title,
        content: formData.content,
        preview,
        image_url: formData.image_url,
        category: formData.category,
        sub_category: formData.sub_category,
        status: formData.status,
        tags: tagsArray,
        pinned: formData.pinned ? 1 : 0
      };

      if (editingId) {
        await blogApi.updateBlog(editingId, payload);
      } else {
        await blogApi.createBlog(payload);
      }

      resetForm();
      setViewMode('list');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save blog');
    }
  };

  const filteredBlogs = blogs.filter(b => 
    (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full min-h-[calc(100vh-5rem)] p-2 md:p-4 transition-colors`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2A2E]/40 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight">Blog Management</h1>
            <p className={`text-xs mt-1 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Create, edit, and organize editorial articles and astrological insights.
            </p>
          </div>
          <div className={`flex items-center space-x-2 p-1 rounded-xl border-2 shadow-sm ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-white border-[#E5E1D8]'}`}>
            <button
              onClick={() => { resetForm(); setViewMode('list'); }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow' 
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-black'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>All Blogs</span>
            </button>
            <button
              onClick={() => { resetForm(); setViewMode('create'); }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'create' 
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow' 
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-black'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Edit Blog' : 'Create Blog'}</span>
            </button>
            <button
              onClick={() => setViewMode('categories')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'categories' 
                  ? 'bg-[#C9A050] text-[#0D0D0F] shadow' 
                  : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-black'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>
          </div>
        </div>

        {viewMode === 'list' && (
          <div 
            style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
            className={`rounded-2xl border-2 overflow-hidden shadow-xl relative z-10 ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#DFC896]'}`}
          >
            <div className={`p-3.5 border-b-2 flex items-center justify-between gap-4 ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-white border-[#DFC896]'}`}>
              <div className="relative w-full max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9A90]" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#C9A050] ${
                    theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E] text-[#E5E1D8] placeholder-[#6C6960]' : 'bg-white border-[#DFC896] text-[#0D0D0F] shadow-xs'
                  }`}
                />
              </div>
              <div className={`text-xs font-semibold ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                Total: <span className="font-bold text-[#C9A050]">{filteredBlogs.length}</span> posts
              </div>
            </div>

            <div 
              style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
              className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-340px)] min-h-[220px] custom-scrollbar bg-white dark:bg-[#141418]"
            >
              <table 
                style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
                className="w-full text-left text-xs whitespace-nowrap border-collapse bg-white dark:bg-[#141418]"
              >
                <thead className={`sticky top-0 z-10 text-[11px] font-bold uppercase tracking-wider border-b-2 ${theme === 'dark' ? 'bg-[#0D0D0F] text-[#9E9A90] border-[#2A2A2E]' : 'bg-[#FAF8F2] text-gray-700 border-[#DFC896]'}`}>
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody 
                  style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
                  className={`divide-y ${theme === 'dark' ? 'divide-[#2A2A2E]/60 bg-[#141418]' : 'divide-gray-100 bg-white'}`}
                >
                  {loading && blogs.length === 0 ? (
                    <tr className={theme === 'dark' ? 'bg-[#141418]' : 'bg-white'}>
                      <td colSpan={9} className="px-4 py-12 text-center text-[#9E9A90]">Loading blogs...</td>
                    </tr>
                  ) : filteredBlogs.length === 0 ? (
                    <tr className={theme === 'dark' ? 'bg-[#141418]' : 'bg-white'}>
                      <td colSpan={9} className="px-4 py-12 text-center text-[#9E9A90]">No blogs found.</td>
                    </tr>
                  ) : filteredBlogs.map((blog) => (
                    <tr key={blog.id} className={`transition-colors ${theme === 'dark' ? 'bg-[#141418] hover:bg-[#1C1C22]' : 'bg-white hover:bg-[#FAF7F2]'}`}>
                      <td className={`px-4 py-3.5 font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{blog.id}</td>
                      <td className="px-4 py-3.5">
                        <div className={`font-semibold max-w-[200px] truncate ${theme === 'dark' ? 'text-[#F0ECE1]' : 'text-[#1A1816]'}`} title={blog.title}>{blog.title}</div>
                        {blog.slug && <div className="text-[10px] text-[#9E9A90] font-mono truncate max-w-[200px]" title={blog.slug}>/{blog.slug}</div>}
                        {blog.pinned === 1 && <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#C9A050]/20 text-[#C9A050] mt-0.5 inline-block font-bold">Pinned</span>}
                      </td>
                      <td className={`px-4 py-3.5 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
                        <div className="max-w-[200px] truncate text-[11px]" title={blog.preview}>{blog.preview}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        {blog.image_url ? (
                           <img 
                             src={getBlogImageUrl(blog.image_url)} 
                             alt="Thumb" 
                             className="w-7 h-7 rounded object-cover border border-[#DFC896]/50" 
                             onError={(e) => { (e.target as HTMLImageElement).src = '/blog_1.jpg'; }}
                           />
                        ) : (
                           <div className={`w-7 h-7 rounded flex items-center justify-center ${theme === 'dark' ? 'bg-[#2A2A2E]' : 'bg-[#FAF2DA] border border-[#DFC896]'}`}>
                             <ImageIcon className="w-3.5 h-3.5 text-[#9E9A90]" />
                           </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[#4A90E2] font-semibold">{blog.category}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 flex-wrap max-w-[150px]">
                          {blog.tags && blog.tags.map((tag: string) => (
                            <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${theme === 'dark' ? 'bg-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#FAF2DA] text-[#8C6218] border border-[#DFC896]'}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          blog.status === 'Published' 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3.5 text-[11px] font-medium ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
                        {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleEditBlog(blog)}
                            className="p-1.5 rounded-lg hover:bg-[#C9A050]/20 text-[#C9A050] transition-colors border border-transparent hover:border-[#C9A050]/40"
                            title="Edit Blog"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors border border-transparent hover:border-red-500/40"
                            title="Delete Blog"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Footer Bar matching User Management */}
            <div className={`px-4 py-3 border-t-2 flex items-center justify-between text-xs ${theme === 'dark' ? 'bg-[#0D0D0F] border-[#2A2A2E]' : 'bg-[#FAF8F2] border-[#DFC896]'}`}>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600 font-medium'}>
                Showing <span className="font-bold text-[#C9A050]">{filteredBlogs.length}</span> editorial posts
              </span>
              <span className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                AstroJunction Editorial CMS
              </span>
            </div>
          </div>
        )}

        {viewMode === 'create' && (
          <form 
            onSubmit={handleSubmit} 
            style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
            className={`p-6 rounded-2xl border-2 space-y-6 shadow-xl relative z-10 ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className={`block text-sm font-bold mb-1.5 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Blog Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Navigating Saturn Return: A Spiritual Guide"
                  style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'border-[#2A2A2E] text-[#E5E1D8] placeholder-[#6C6960]' 
                      : 'border-gray-300 text-black placeholder-[#9E9A90]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-1.5 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, sub_category: '' }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F]'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Subcategory</label>
                <select
                  name="sub_category"
                  value={formData.sub_category}
                  onChange={handleInputChange}
                  disabled={!formData.category || availableSubcategories.length === 0}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] disabled:opacity-50' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F] disabled:opacity-50'
                  }`}
                >
                  <option value="">Select Subcategory</option>
                  {availableSubcategories.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Publication Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F]'
                  }`}
                >
                  <option value="Published">Published (Public)</option>
                  <option value="Draft">Draft (Hidden)</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Tags (Comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g. Health, Anxiety, Recovery" 
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder-[#6C6960]' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F] placeholder-[#9E9A90]'
                  }`}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Featured Image</label>
                <div className={`flex items-center gap-2 p-3 rounded-lg border border-dashed transition-colors ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/50' : 'bg-[#F9F7F1] border-[#D5D1C8] hover:border-[#C9A050]/50'}`}>
                  <ImageIcon className="w-4 h-4 text-[#9E9A90] shrink-0" />
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="Enter image URL or upload..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm min-w-0"
                  />
                  <label className="shrink-0 cursor-pointer px-3 py-1.5 rounded-md text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#B89040] transition-colors">
                    Upload
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const localUrl = URL.createObjectURL(file);
                        setImagePreviewUrl(localUrl);
                        try {
                          const { url } = await blogApi.uploadBlogImage(file);
                          setFormData(prev => ({ ...prev, image_url: url }));
                          setImagePreviewUrl(getBlogImageUrl(url));
                          URL.revokeObjectURL(localUrl);
                        } catch {
                          setImagePreviewUrl('');
                          alert('Image upload failed. Please try again.');
                        }
                      }}
                    />
                  </label>
                </div>
                {(imagePreviewUrl || formData.image_url) && (
                  <div className="mt-3 relative w-fit group">
                    <img
                      src={imagePreviewUrl || getBlogImageUrl(formData.image_url)}
                      alt="preview"
                      className="h-28 w-auto max-w-xs rounded-lg object-cover border border-[#C9A050]/40 shadow-md"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => { setFormData(prev => ({ ...prev, image_url: '' })); setImagePreviewUrl(''); }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 shadow"
                      title="Remove image"
                    >✕</button>
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-2 pt-2 border-t border-[#2A2A2E]/50">
                <label className="flex items-center space-x-3 cursor-pointer group w-fit">
                  <input type="checkbox" name="pinned" checked={formData.pinned} onChange={handleInputChange} className="w-4 h-4 accent-[#C9A050] cursor-pointer" />
                  <span className={`text-sm font-medium transition-colors group-hover:text-[#C9A050] ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Pin this post to top</span>
                </label>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Full Article Content *</label>
              <div className="rounded-lg overflow-hidden border border-[#2A2A2E]">
                <JoditEditor
                  ref={editor}
                  value={formData.content}
                  config={config}
                  onBlur={handleContentChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#2A2A2E]/40">
              <button
                type="button"
                onClick={() => { resetForm(); setViewMode('list'); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  theme === 'dark' ? 'border-[#2A2A2E] hover:bg-[#2A2A2E]' : 'border-[#D5D1C8] hover:bg-[#E5E1D8]'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] transition-all shadow-md"
              >
                {editingId ? 'Update Blog Post' : 'Publish Blog Post'}
              </button>
            </div>
          </form>
        )}

        {viewMode === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
              className={`p-5 rounded-xl border-2 shadow-xl ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}
            >
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#C9A050] flex items-center space-x-2">
                <Folder className="w-4 h-4" />
                <span>Categories</span>
              </h2>
              <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="New Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] ${
                    theme === 'dark' ? 'border-[#2A2A2E] text-white' : 'border-gray-300 text-black'
                  }`}
                />
                <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#B89040]">
                  Add
                </button>
              </form>
              <ul className="divide-y divide-[#2A2A2E]/40 max-h-60 overflow-y-auto">
                {categories.map(c => (
                  <li key={c.id} className="py-2 flex items-center justify-between text-xs">
                    <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-900 font-medium'}>{c.name}</span>
                    <button onClick={() => handleDeleteCategory(c.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div 
              style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
              className={`p-5 rounded-xl border-2 shadow-xl ${theme === 'dark' ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'}`}
            >
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#C9A050] flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Subcategories</span>
              </h2>
              <form onSubmit={handleCreateSubcategory} className="space-y-2 mb-4">
                <select
                  value={selectedCategoryForSub}
                  onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                  style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
                  className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] ${
                    theme === 'dark' ? 'border-[#2A2A2E] text-white' : 'border-gray-300 text-black'
                  }`}
                >
                  <option value="">Select Parent Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New Subcategory Name"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    style={{ backgroundColor: theme === 'dark' ? '#141418' : '#FFFFFF' }}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] ${
                      theme === 'dark' ? 'border-[#2A2A2E] text-white' : 'border-gray-300 text-black'
                    }`}
                  />
                  <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C9A050] text-[#0D0D0F] hover:bg-[#B89040]">
                    Add
                  </button>
                </div>
              </form>
              <ul className="divide-y divide-[#2A2A2E]/40 max-h-60 overflow-y-auto">
                {subcategories.map(s => {
                  const parent = categories.find(c => c.id === s.category_id);
                  return (
                    <li key={s.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-900 font-medium'}>{s.name}</span>
                        {parent && <span className="ml-2 text-[10px] text-[#9E9A90]">({parent.name})</span>}
                      </div>
                      <button onClick={() => handleDeleteSubcategory(s.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;