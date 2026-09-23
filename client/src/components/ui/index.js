import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

/* ---------- Image with graceful fallback ---------- */
export function Img({
  src,
  alt = "",
  className = "",
  style,
  fallbackLabel,
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  /*
   * Resolve image URLs correctly.
   *
   * Old database records may contain:
   *   /uploads/file.jpg
   *
   * Production frontend:
   *   https://gmmc.vercel.app
   *
   * Production backend:
   *   https://goswamipara-mansamata-club.onrender.com
   *
   * Therefore relative upload URLs are automatically
   * converted to the backend URL.
   */

  const resolveImageUrl = (value) => {
    if (!value || typeof value !== "string") {
      return "";
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    // Already a complete URL.
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }

    // /uploads/file.jpg
    if (trimmed.startsWith("/uploads/")) {
      const apiBase = process.env.REACT_APP_API_URL || "http://localhost:3000";

      return `${apiBase.replace(/\/$/, "")}${trimmed}`;
    }

    // uploads/file.jpg
    if (trimmed.startsWith("uploads/")) {
      const apiBase = process.env.REACT_APP_API_URL || "http://localhost:3000";

      return `${apiBase.replace(/\/$/, "")}/${trimmed}`;
    }

    return trimmed;
  };

  const imageUrl = resolveImageUrl(src);

  /*
   * Reset image error state whenever the source changes.
   */
  useEffect(() => {
    setFailed(false);
  }, [src]);

  /*
   * Show the club motif instead of a broken-image icon
   * when no image exists or the image cannot be loaded.
   */
  if (!imageUrl || failed) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--cream-3)",
          color: "var(--muted)",
          fontSize: "0.8rem",
          minHeight: 80,
          width: "100%",
          height: "100%",
          ...style,
        }}
        role="img"
        aria-label={alt || fallbackLabel || ""}
      >
        <MotifMark width={44} height={44} opacity={0.35} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}

/* ---------- Original club motif (alpana-inspired) ---------- */
export function MotifMark({ width = 32, height = 32, opacity = 1 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 64"
      opacity={opacity}
      aria-hidden="true"
    >
      <g fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round">
        <circle
          cx="32"
          cy="32"
          r="7"
          fill="#ffffff"
          stroke="none"
          opacity="0.95"
        />

        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;

          const x1 = 32 + Math.cos(a) * 12.5;
          const y1 = 32 + Math.sin(a) * 12.5;

          const x2 = 32 + Math.cos(a) * 22;
          const y2 = 32 + Math.sin(a) * 22;

          const cx = 32 + Math.cos(a + 0.32) * 18;
          const cy = 32 + Math.sin(a + 0.32) * 18;

          const cx2 = 32 + Math.cos(a - 0.32) * 18;
          const cy2 = 32 + Math.sin(a - 0.32) * 18;

          return (
            <g key={i}>
              <path
                d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2} Q${cx2} ${cy2} ${x1} ${y1}`}
                fill="#fff"
                fillOpacity="0.85"
                stroke="none"
              />
            </g>
          );
        })}

        <circle cx="32" cy="32" r="27" strokeDasharray="3 6" />
      </g>
    </svg>
  );
}

/* ---------- Section heading ---------- */
export function SectionHead({ eyebrow, title, text, center, tone }) {
  return (
    <div className={`section-head ${center ? "center" : ""}`}>
      {eyebrow && (
        <div
          className="section-eyebrow"
          style={tone === "light" ? { color: "var(--gold-soft)" } : undefined}
        >
          {eyebrow}
        </div>
      )}

      {center ? (
        <>
          <div className="alpana-divider" aria-hidden="true">
            <MotifMark width={18} height={18} opacity={0.9} color="#b08a3e" />
          </div>

          <h2>{title}</h2>
        </>
      ) : (
        <h2>{title}</h2>
      )}

      {text && <p>{text}</p>}
    </div>
  );
}

/* ---------- Loader / skeletons ---------- */
export function Spinner({ label }) {
  return (
    <div className="spinner-wrap" role="status" aria-label={label || "Loading"}>
      <div className="spinner" />
    </div>
  );
}

export function CardSkeletons({ count = 3 }) {
  return (
    <div className="grid grid-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton skel-card" key={i} />
      ))}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon = "❁", title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        {icon}
      </div>

      <h3>{title}</h3>

      {text && <p>{text}</p>}

      {action}
    </div>
  );
}

/* ---------- Error state ---------- */
export function ErrorState({ onRetry }) {
  const { t } = useLanguage();

  return (
    <div className="error-state">
      <p>{t("common.error")}</p>

      {onRetry && (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onRetry}
        >
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}

/* ---------- Pagination ---------- */
export function Pagination({ page, pages, onChange }) {
  const { t } = useLanguage();

  if (!pages || pages <= 1) {
    return null;
  }

  const nums = [];

  const start = Math.max(1, Math.min(page - 2, pages - 4));

  for (let i = start; i <= Math.min(pages, start + 4); i += 1) {
    nums.push(i);
  }

  return (
    <nav className="pager" aria-label="Pagination">
      <button
        type="button"
        className="btn btn-light btn-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t("common.previous")}
      </button>

      {nums.map((n) => (
        <button
          key={n}
          type="button"
          className={`btn btn-sm ${n === page ? "btn-primary" : "btn-light"}`}
          aria-current={n === page ? "page" : undefined}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        className="btn btn-light btn-sm"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        {t("common.next")}
      </button>
    </nav>
  );
}

/* ---------- Modal (accessible) ---------- */
export function Modal({ open, onClose, title, children, wide }) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKey = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", onKey);

    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => ref.current && ref.current.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKey);

      document.body.style.overflow = "";

      clearTimeout(timer);
    };

    // Runs only on open/close transitions.
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        tabIndex={-1}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <h3>{title}</h3>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* ---------- Confirm dialog ---------- */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  text,
  danger = true,
  busy,
}) {
  const { t } = useLanguage();

  return (
    <Modal open={open} onClose={onClose} title={title || t("common.confirm")}>
      {text && (
        <p
          style={{
            color: "var(--muted)",
          }}
        >
          {text}
        </p>
      )}

      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-light"
          onClick={onClose}
          disabled={busy}
        >
          {t("common.cancel")}
        </button>

        <button
          type="button"
          className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
          onClick={onConfirm}
          disabled={busy}
        >
          {t("common.confirm")}
        </button>
      </div>
    </Modal>
  );
}

/* ---------- Lightbox ---------- */
export function Lightbox({ photos, index, onClose, onNavigate, captionFor }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowLeft") {
        onNavigate(Math.max(0, index - 1));
      }

      if (e.key === "ArrowRight") {
        onNavigate(Math.min(photos.length - 1, index + 1));
      }
    };

    document.addEventListener("keydown", onKey);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);

      document.body.style.overflow = "";
    };
  }, [index, photos.length, onClose, onNavigate]);

  const go = useCallback(
    (dir) => onNavigate((index + dir + photos.length) % photos.length),
    [index, photos.length, onNavigate],
  );

  const photo = photos[index];

  if (!photo) {
    return null;
  }

  const caption = captionFor ? captionFor(photo) : photo.caption;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={caption || "Photo"}
    >
      <img src={photo.url} alt={caption || ""} />

      {caption && <div className="lightbox-caption">{caption}</div>}

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-btn lightbox-prev"
            onClick={() => go(-1)}
            aria-label="Previous photo"
          >
            ‹
          </button>

          <button
            type="button"
            className="lightbox-btn lightbox-next"
            onClick={() => go(1)}
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}

      <button
        type="button"
        className="lightbox-btn lightbox-close"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
