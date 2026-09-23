import React, { useEffect, useRef, useState } from "react";
import api from "../../../services/api";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useToast } from "../../../contexts/ToastContext";
import { Modal, Img, Spinner, Pagination } from "../../../components/ui";

export const IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const MAX_IMAGE_MB = 5;
export const VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/mpeg",
];
export const MAX_VIDEO_MB = 200;

export async function uploadImages(files) {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("files", f));
  const { data } = await api.post("/api/media/upload", fd);
  return data.items;
}

export async function uploadPdf(file) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/api/media/upload-pdf", fd);
  return data;
}

/** Upload a single video file. onProgress receives 0–100. */
export async function uploadVideo(file, onProgress) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/api/media/upload-video", fd, {
    timeout: 10 * 60 * 1000, // large video uploads need a generous window
    onUploadProgress: (e) => {
      if (onProgress && e.total)
        onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
    },
  });
  return data;
}

/** Modal media picker: library grid + upload new + delete media. */
export function MediaPickerModal({ open, onClose, onSelect, kind = "image" }) {
  const { t } = useLanguage();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
  });

  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const fileRef = useRef(null);

  const load = React.useCallback(async () => {
    if (!open) return;

    setLoading(true);

    try {
      const { data } = await api.get("/api/media", {
        params: {
          page,
          limit: 24,
          kind,
          q: q || undefined,
        },
      });

      setItems(data.items || []);
      setPagination(
        data.pagination || {
          page: 1,
          pages: 1,
        },
      );
    } catch (err) {
      toast.error(
        err?.friendlyMessage ||
          err?.response?.data?.error ||
          "Failed to load media.",
      );
    } finally {
      setLoading(false);
    }
  }, [open, page, kind, q, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFiles = async (files) => {
    const list = Array.from(files || []);

    if (!list.length) return;

    if (kind === "image") {
      const bad = list.find((f) => !IMAGE_MIMES.includes(f.type));

      if (bad) {
        toast.error(t("admin.media.invalid"));
        return;
      }

      const big = list.find((f) => f.size > MAX_IMAGE_MB * 1024 * 1024);

      if (big) {
        toast.error(t("admin.media.tooLarge"));
        return;
      }
    }

    if (kind === "video") {
      if (!VIDEO_MIMES.includes(list[0].type)) {
        toast.error(t("admin.media.invalidVideo"));
        return;
      }

      if (list[0].size > MAX_VIDEO_MB * 2048 * 2048) {
        toast.error(t("admin.media.tooLarge"));
        return;
      }
    }

    setUploading(true);
    setProgress(0);

    try {
      const created =
        kind === "pdf"
          ? [await uploadPdf(list[0])]
          : kind === "video"
            ? [await uploadVideo(list[0], setProgress)]
            : await uploadImages(list);

      toast.success(t("common.saved"));

      if (created[0]) {
        setSelected(created[0]);
      }

      setPage(1);

      await load();
    } catch (err) {
      toast.error(
        err?.friendlyMessage || err?.response?.data?.error || "Upload failed.",
      );
    } finally {
      setUploading(false);
      setProgress(0);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  const handleDelete = async (media) => {
    if (!media?._id || deletingId) return;

    const fileName = media.originalName || media.filename || "this image";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileName}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(media._id);

    try {
      await api.delete(`/api/media/${media._id}`);

      if (selected?._id === media._id) {
        setSelected(null);
      }

      setItems((current) => current.filter((item) => item._id !== media._id));

      toast.success("Image deleted successfully.");

      await load();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 409 || data?.code === "IN_USE") {
        toast.error(
          data?.error ||
            "This image is currently being used on the website and cannot be deleted.",
        );
      } else {
        toast.error(
          err?.friendlyMessage || data?.error || "Failed to delete image.",
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        kind === "video" ? t("admin.form.pickVideo") : t("admin.form.pickImage")
      }
      wide
    >
      <div className="filter-bar">
        <input
          className="input search-input"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder={t("common.search") + "…"}
          aria-label={t("common.search")}
        />

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => fileRef.current && fileRef.current.click()}
          disabled={uploading || deletingId}
        >
          {uploading
            ? kind === "video"
              ? `${t("admin.form.uploading")} ${progress}%`
              : t("admin.form.uploading")
            : kind === "pdf"
              ? t("admin.media.uploadPdf")
              : kind === "video"
                ? t("admin.media.uploadVideo")
                : t("admin.media.upload")}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept={
            kind === "pdf"
              ? "application/pdf"
              : kind === "video"
                ? VIDEO_MIMES.join(",")
                : IMAGE_MIMES.join(",")
          }
          multiple={kind === "image"}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>{t("common.empty.generic")}</p>
        </div>
      ) : (
        <div className="media-grid">
          {items.map((m) => {
            const isSelected = selected && selected._id === m._id;

            const isDeleting = deletingId === m._id;

            return (
              <div
                key={m._id}
                className={`media-cell ${isSelected ? "selected" : ""}`}
                style={{
                  position: "relative",
                }}
              >
                {/* Select media */}
                <button
                  type="button"
                  onClick={() => setSelected(m)}
                  disabled={isDeleting}
                  style={{
                    display: "block",
                    width: "100%",
                    border: "0",
                    padding: 0,
                    background: "transparent",
                    cursor: isDeleting ? "default" : "pointer",
                    textAlign: "left",
                  }}
                >
                  {m.kind === "pdf" ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        aspectRatio: "1",
                        fontSize: "2rem",
                        background: "var(--cream-2)",
                      }}
                    >
                      📄
                    </div>
                  ) : m.kind === "video" ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        aspectRatio: "1",
                        fontSize: "2rem",
                        background: "#14100c",
                        color: "#fff",
                      }}
                    >
                      🎬
                    </div>
                  ) : (
                    <Img src={m.url} alt="" />
                  )}

                  <div className="media-name">
                    {m.originalName || m.filename}
                  </div>

                  {m.usageCount > 0 && (
                    <span className="media-usage">{m.usageCount}×</span>
                  )}
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(m);
                  }}
                  disabled={isDeleting || deletingId !== null}
                  title="Delete image"
                  aria-label={`Delete ${
                    m.originalName || m.filename || "image"
                  }`}
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "none",
                    background: isDeleting
                      ? "rgba(120,120,120,0.9)"
                      : "rgba(179,37,30,0.95)",
                    color: "#fff",
                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isDeleting ? "wait" : "pointer",
                    zIndex: 5,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  }}
                >
                  {isDeleting ? "…" : "×"}
                </button>

                {/* Usage indicator */}
                {m.usageCount > 0 && (
                  <span
                    title="This image is currently used on the website"
                    style={{
                      position: "absolute",
                      left: 7,
                      top: 7,
                      background: "rgba(36, 31, 26, 0.88)",
                      color: "#ffe9b8",
                      fontSize: "0.66rem",
                      padding: "3px 8px",
                      borderRadius: "999px",
                      zIndex: 4,
                    }}
                  >
                    Used {m.usageCount}×
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        onChange={setPage}
      />

      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-light"
          onClick={onClose}
          disabled={deletingId !== null}
        >
          {t("common.cancel")}
        </button>

        <button
          type="button"
          className="btn btn-primary"
          disabled={!selected || deletingId !== null}
          onClick={() => {
            onSelect(selected);
            setSelected(null);
          }}
        >
          {t("common.confirm")}
        </button>
      </div>
    </Modal>
  );
}

/** Single-image field with preview + picker. */
export function ImageField({ value, onChange, label }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      {value ? (
        <div>
          <Img
            src={value}
            alt=""
            className="image-picker-preview"
            style={{ aspectRatio: "16/9", objectFit: "cover" }}
          />
          <div className="flex gap-2 mt-2 wrap">
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => setOpen(true)}
            >
              {t("admin.form.changeImage")}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onChange("")}
            >
              {t("admin.form.removeImage")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setOpen(true)}
        >
          🖼 {t("admin.form.pickImage")}
        </button>
      )}
      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(m) => {
          onChange(m.url);
          setOpen(false);
        }}
      />
    </div>
  );
}

/** Multi-image field. */
export function ImagesField({ value = [], onChange, label }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const move = (i, dir) => {
    const arr = [...value];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };
  return (
    <div className="field">
      <label>{label}</label>
      <div className="flex gap-2 wrap">
        {value.map((url, i) => (
          <div key={url + i} style={{ position: "relative", width: 110 }}>
            <Img
              src={url}
              alt=""
              style={{
                width: 110,
                height: 78,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid var(--line)",
              }}
            />
            <div className="flex" style={{ gap: 2, marginTop: 4 }}>
              <button
                type="button"
                className="icon-btn"
                onClick={() => move(i, -1)}
                aria-label="Move left"
              >
                ‹
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => move(i, 1)}
                aria-label="Move right"
              >
                ›
              </button>
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ alignSelf: "center" }}
          onClick={() => setOpen(true)}
        >
          ＋ {t("admin.form.addImages")}
        </button>
      </div>
      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(m) => {
          if (!value.includes(m.url)) onChange([...value, m.url]);
          setOpen(false);
        }}
      />
    </div>
  );
}

/** Video file field: direct upload (with progress) or pick from the media library. */
export function VideoFileField({ value, onChange, label, hint }) {
  const { t } = useLanguage();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!VIDEO_MIMES.includes(file.type)) {
      toast.error(t("admin.media.invalidVideo"));
      return;
    }
    if (file.size > MAX_VIDEO_MB * 2048 * 2048) {
      toast.error(t("admin.media.tooLarge"));
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const media = await uploadVideo(file, setProgress);
      onChange(media.url);
      toast.success(t("common.saved"));
    } catch (err) {
      toast.error(err.friendlyMessage);
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const fileName = value
    ? decodeURIComponent(String(value).split("/").pop())
    : "";

  return (
    <div className="field">
      <label>{label}</label>
      {value ? (
        <div>
          <video
            key={value}
            controls
            playsInline
            preload="metadata"
            src={value}
            style={{
              width: "100%",
              maxHeight: 220,
              borderRadius: 8,
              background: "#14100c",
            }}
          />
          <div
            className="flex gap-2 mt-2 wrap"
            style={{ alignItems: "center" }}
          >
            <span
              className="chip chip-gold"
              style={{
                maxWidth: 260,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              🎬 {fileName}
            </span>
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => setOpen(true)}
              disabled={uploading}
            >
              {t("admin.form.changeImage")}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onChange("")}
              disabled={uploading}
            >
              {t("admin.form.removeImage")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 wrap">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => fileRef.current && fileRef.current.click()}
            disabled={uploading}
          >
            {uploading
              ? `${t("admin.form.uploading")} ${progress}%`
              : `⬆ ${t("admin.media.uploadVideo")}`}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setOpen(true)}
            disabled={uploading}
          >
            🎬 {t("admin.form.pickVideo")}
          </button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={VIDEO_MIMES.join(",")}
        hidden
        onChange={(e) => handleFile(e.target.files && e.target.files[0])}
      />
      {uploading && (
        <div
          style={{
            marginTop: 8,
            height: 6,
            borderRadius: 6,
            background: "var(--cream-2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "var(--red-primary, #b3251e)",
              transition: "width 200ms ease",
            }}
          />
        </div>
      )}
      {hint && (
        <p
          className="field-hint"
          style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 6 }}
        >
          {hint}
        </p>
      )}
      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        kind="video"
        onSelect={(m) => {
          onChange(m.url);
          setOpen(false);
        }}
      />
    </div>
  );
}

/** PDF field using media library. */
export function PdfField({ value, name, onChange, label }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      {value ? (
        <div className="flex gap-2 wrap" style={{ alignItems: "center" }}>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="chip chip-gold"
          >
            📄 {name || "PDF"}
          </a>
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={() => setOpen(true)}
          >
            {t("admin.form.changeImage")}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChange("", "")}
          >
            {t("admin.form.removeImage")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setOpen(true)}
        >
          📄 {t("admin.media.uploadPdf")}
        </button>
      )}
      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        kind="pdf"
        onSelect={(m) => {
          onChange(m.url, m.originalName || m.filename);
          setOpen(false);
        }}
      />
    </div>
  );
}
