export function ArticleCardSkeleton() {
  return (
    <div style={{ border: "1px solid #f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
      <style>{`
        @keyframes shimmerMove {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .shimmer-block {
          background: linear-gradient(
            90deg,
            #f4f4f4 0%,
            #ececec 40%,
            #f4f4f4 80%
          );
          background-size: 600px 100%;
          animation: shimmerMove 1.4s ease-in-out infinite;
          border-radius: 3px;
        }
      `}</style>

      {/* Image placeholder */}
      <div
        className="shimmer-block"
        style={{ width: "100%", aspectRatio: "16/9" }}
      />

      {/* Content */}
      <div style={{ padding: "16px" }}>
        {/* Category badge */}
        <div
          className="shimmer-block"
          style={{ width: "72px", height: "9px", marginBottom: "12px" }}
        />

        {/* Title lines */}
        <div
          className="shimmer-block"
          style={{ width: "100%", height: "14px", marginBottom: "8px" }}
        />
        <div
          className="shimmer-block"
          style={{ width: "80%", height: "14px", marginBottom: "14px" }}
        />

        {/* Abstract lines */}
        <div
          className="shimmer-block"
          style={{ width: "100%", height: "11px", marginBottom: "6px" }}
        />
        <div
          className="shimmer-block"
          style={{ width: "90%", height: "11px", marginBottom: "6px" }}
        />
        <div
          className="shimmer-block"
          style={{ width: "65%", height: "11px", marginBottom: "16px" }}
        />

        {/* Meta row */}
        <div className="flex items-center gap-3">
          <div
            className="shimmer-block"
            style={{ width: "80px", height: "9px" }}
          />
          <div
            className="shimmer-block"
            style={{ width: "50px", height: "9px" }}
          />
        </div>
      </div>
    </div>
  );
}

export function ArticleListSkeleton() {
  return (
    <div
      className="flex gap-4 py-4"
      style={{ borderBottom: "1px solid #f4f4f4" }}
    >
      <style>{`
        @keyframes shimmerMove {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .shimmer-block {
          background: linear-gradient(
            90deg,
            #f4f4f4 0%,
            #ececec 40%,
            #f4f4f4 80%
          );
          background-size: 600px 100%;
          animation: shimmerMove 1.4s ease-in-out infinite;
          border-radius: 3px;
        }
      `}</style>

      {/* Thumbnail */}
      <div
        className="shimmer-block flex-shrink-0"
        style={{ width: "96px", height: "72px", borderRadius: "4px" }}
      />

      {/* Text */}
      <div className="flex-1">
        <div
          className="shimmer-block"
          style={{ width: "60px", height: "9px", marginBottom: "8px" }}
        />
        <div
          className="shimmer-block"
          style={{ width: "100%", height: "13px", marginBottom: "6px" }}
        />
        <div
          className="shimmer-block"
          style={{ width: "70%", height: "13px", marginBottom: "10px" }}
        />
        <div
          className="shimmer-block"
          style={{ width: "50px", height: "9px" }}
        />
      </div>
    </div>
  );
}

export function FeaturedArticleSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", border: "1px solid #f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
      <style>{`
        @keyframes shimmerMove {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .shimmer-block {
          background: linear-gradient(
            90deg,
            #f4f4f4 0%,
            #ececec 40%,
            #f4f4f4 80%
          );
          background-size: 600px 100%;
          animation: shimmerMove 1.4s ease-in-out infinite;
          border-radius: 3px;
        }
      `}</style>

      {/* Image */}
      <div className="shimmer-block" style={{ minHeight: "240px" }} />

      {/* Content */}
      <div style={{ padding: "28px" }}>
        <div className="shimmer-block" style={{ width: "80px", height: "9px", marginBottom: "14px" }} />
        <div className="shimmer-block" style={{ width: "100%", height: "18px", marginBottom: "8px" }} />
        <div className="shimmer-block" style={{ width: "85%", height: "18px", marginBottom: "8px" }} />
        <div className="shimmer-block" style={{ width: "60%", height: "18px", marginBottom: "16px" }} />
        <div className="shimmer-block" style={{ width: "100%", height: "11px", marginBottom: "6px" }} />
        <div className="shimmer-block" style={{ width: "90%", height: "11px", marginBottom: "6px" }} />
        <div className="shimmer-block" style={{ width: "75%", height: "11px", marginBottom: "20px" }} />
        <div className="shimmer-block" style={{ width: "80px", height: "9px" }} />
      </div>
    </div>
  );
}
