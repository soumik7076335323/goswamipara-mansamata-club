import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useFetch } from "../../hooks/useFetch";
import Seo from "../../components/ui/Seo";
import PageHero from "../../components/ui/PageHero";
import {
  EmptyState,
  CardSkeletons,
  ErrorState,
  Pagination,
  Img,
} from "../../components/ui";
import { videoEmbedUrl, videoThumb } from "../../utils/format";

export function VideoCard({ video }) {
  const { L, t } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const isFile = video.provider === "file";
  const thumb =
    video.thumbnail ||
    (isFile ? "" : videoThumb(video.provider, video.videoId));
  return (
    <article className="card">
      {playing ? (
        isFile ? (
          <video
            className="video-embed"
            src={video.fileUrl}
            poster={video.thumbnail || undefined}
            controls
            autoPlay
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              aspectRatio: "16/9",
              background: "#14100c",
              display: "block",
            }}
            aria-label={L(video.title)}
          />
        ) : (
          <div className="video-embed">
            <iframe
              src={videoEmbedUrl(video.provider, video.videoId)}
              title={L(video.title)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      ) : (
        <button
          type="button"
          className="video-thumb"
          onClick={() => setPlaying(true)}
          aria-label={`${t("common.watchVideo")}: ${L(video.title)}`}
        >
          {thumb ? (
            <Img
              src={thumb}
              alt=""
              style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                background: "#14100c",
              }}
            />
          )}
          <span className="video-play" aria-hidden="true">
            ▶
          </span>
        </button>
      )}
      <div className="card-body">
        {video.category && (
          <span className="chip chip-gold">{video.category}</span>
        )}
        <h3 className="card-title">{L(video.title)}</h3>
        <p className="card-text">{L(video.description)}</p>
      </div>
    </article>
  );
}

export default function Videos() {
  const { t } = useLanguage();
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch("/api/videos", {
    params: { category: category || undefined, page, limit: 9 },
  });

  const categories = React.useMemo(() => {
    const set = new Set();
    (data?.items || []).forEach((i) => i.category && set.add(i.category));
    return Array.from(set);
  }, [data]);

  return (
    <>
      <Seo title={t("nav.videos")} description={t("videos.subtitle")} />
      <PageHero title={t("videos.title")} subtitle={t("videos.subtitle")} />
      <section className="section">
        <div className="container">
          {categories.length > 0 && (
            <div className="filter-bar">
              <select
                className="select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                aria-label={t("common.category")}
              >
                <option value="">{t("common.allCategories")}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
          {loading ? (
            <CardSkeletons count={6} />
          ) : error ? (
            <ErrorState onRetry={refetch} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon="🎬"
              title={t("videos.empty")}
              text={t("common.empty.admin")}
            />
          ) : (
            <>
              <div className="grid grid-3">
                {data.items.map((v) => (
                  <VideoCard key={v._id} video={v} />
                ))}
              </div>
              <Pagination
                page={data.pagination.page}
                pages={data.pagination.pages}
                onChange={setPage}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
