import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactElement } from "react";
import { Link } from "react-router";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import type { Article } from "../../data/articles";
import { ArticleCardSkeleton, FeaturedArticleSkeleton } from "../article/ArticleSkeleton";

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 4;

interface InfiniteArticleFeedProps {
  articles: Article[];
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link to={`/articulo/${article.slug}`} className="block group" style={{ textDecoration: "none" }}>
      <article>
        <div className="overflow-hidden rounded" style={{ aspectRatio: "16/9", background: "#111", marginBottom: "14px" }}>
          <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ opacity: 0.88 }} />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: article.categoryColor, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {article.category}
          </span>
          <span style={{ color: "#e0e0e0", fontSize: "13px" }}>·</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 500, color: "#bbb", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {article.type}
          </span>
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: "8px", transition: "color 0.2s" }} className="group-hover:text-gray-600">
          {article.title}
        </h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#777", lineHeight: 1.65, marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {article.abstract}
        </p>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa" }}>{article.authors[0].name.split(" ").slice(-1)[0]}, et al.</span>
          <span style={{ color: "#ddd", fontSize: "13px" }}>·</span>
          <div className="flex items-center gap-1">
            <Clock size={10} color="#bbb" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#aaa" }}>{article.readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function FeaturedFeedCard({ article }: { article: Article }) {
  return (
    <Link to={`/articulo/${article.slug}`} className="block group" style={{ textDecoration: "none" }}>
      <article className="grid overflow-hidden rounded" style={{ gridTemplateColumns: "1fr 1fr", border: "1px solid #f0f0f0", minHeight: "240px" }}>
        <div className="overflow-hidden" style={{ background: "#111", minHeight: "240px" }}>
          <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ opacity: 0.9 }} />
        </div>
        <div className="flex flex-col justify-center" style={{ padding: "28px 24px" }}>
          <div className="flex items-center gap-2 mb-3">
            <div style={{ width: "3px", height: "14px", background: article.categoryColor, borderRadius: "2px", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: article.categoryColor, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {article.type}
            </span>
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 600, color: "#0b0b0b", lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: "10px" }}>
            {article.title}
          </h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#666", lineHeight: 1.65, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.abstract}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#999" }}>{article.authors[0].name}</span>
            <span style={{ color: "#ddd" }}>·</span>
            <div className="flex items-center gap-1">
              <BookOpen size={10} color="#bbb" />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#999" }}>{article.readTime}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto" style={{ color: article.categoryColor, fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500 }}>
              Leer <ArrowRight size={11} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function InfiniteArticleFeed({ articles }: InfiniteArticleFeedProps) {
  const [displayed, setDisplayed] = useState<Article[]>(() => articles.slice(0, INITIAL_COUNT));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(articles.length > INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setTimeout(() => {
      setDisplayed((prev) => {
        const nextPage = Math.floor(prev.length / LOAD_MORE_COUNT);
        const start = INITIAL_COUNT + (nextPage - 1) * LOAD_MORE_COUNT;
        const newItems = articles.slice(start, start + LOAD_MORE_COUNT);
        if (newItems.length === 0) { setHasMore(false); setLoading(false); loadingRef.current = false; return prev; }
        setLoading(false);
        loadingRef.current = false;
        return [...prev, ...newItems];
      });
    }, 1100);
  }, [articles, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); }, { threshold: 0.1, rootMargin: "200px" });
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => { if (sentinel) observer.unobserve(sentinel); };
  }, [loadMore]);

  useEffect(() => {
    setDisplayed(articles.slice(0, INITIAL_COUNT));
    setHasMore(articles.length > INITIAL_COUNT);
  }, [articles]);

  const groups: ReactElement[] = [];
  let idx = 0;

  if (displayed.length > 0) {
    const firstBatch = displayed.slice(0, Math.min(3, displayed.length));
    groups.push(
      <div key="group-0" className="grid gap-5 md:gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(firstBatch.length, 3)}, 1fr)` }}>
        {firstBatch.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>
    );
    idx = firstBatch.length;
  }

  while (idx < displayed.length) {
    const groupId = `group-${idx}`;
    const batchSlice = displayed.slice(idx, idx + 5);
    if (batchSlice.length === 0) break;
    const groupElements: ReactElement[] = [];
    groupElements.push(<FeaturedFeedCard key={batchSlice[0].id} article={batchSlice[0]} />);
    if (batchSlice.length > 1) {
      const rest = batchSlice.slice(1);
      groupElements.push(
        <div key={`rest-${idx}`} className="grid gap-5 md:gap-6" style={{ gridTemplateColumns: rest.length >= 3 ? "repeat(3, 1fr)" : `repeat(${rest.length}, 1fr)` }}>
          {rest.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      );
    }
    groups.push(<div key={groupId} className="flex flex-col gap-6 md:gap-8">{groupElements}</div>);
    idx += batchSlice.length;
  }

  return (
    <div>
      <div className="flex flex-col gap-8 md:gap-10">{groups}</div>
      {loading && (
        <div className="mt-8">
          <div className="grid gap-5 mb-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <FeaturedArticleSkeleton /><FeaturedArticleSkeleton />
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <ArticleCardSkeleton /><ArticleCardSkeleton /><ArticleCardSkeleton />
          </div>
        </div>
      )}
      {hasMore && !loading && <div ref={sentinelRef} style={{ height: "20px", marginTop: "40px" }} />}
      {!hasMore && displayed.length > 0 && (
        <div className="text-center" style={{ marginTop: "48px", paddingTop: "28px", borderTop: "1px solid #f0f0f0" }}>
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "16px", fontStyle: "italic", color: "#bbb" }}>— Fin de las publicaciones disponibles —</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#ccc", marginTop: "6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Volumen 14 · CienciaEduc</p>
        </div>
      )}
    </div>
  );
}
