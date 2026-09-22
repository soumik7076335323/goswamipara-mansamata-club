import React from "react";
import { Img } from "../../components/ui";
import { formatDate } from "../../utils/format";
import { parseVideoUrl, videoThumb } from "../../utils/format";

const thumb = (url) => (
  <Img
    src={url}
    alt=""
    className="thumb"
    style={{ width: 52, height: 40, objectFit: "cover", borderRadius: 6 }}
  />
);
const loc = (v, L) => L(v, "—");
const dateCell = (d, L) => (d ? formatDate(d, "bn") : "—");

const publishedOpts = [
  { value: "", labelKey: "common.all" },
  { value: "true", labelKey: "common.published" },
  { value: "false", labelKey: "common.unpublished" },
];
const activeOpts = [
  { value: "", labelKey: "common.all" },
  { value: "true", labelKey: "common.active" },
  { value: "false", labelKey: "common.inactive" },
];

export const crudConfigs = {
  events: {
    endpoint: "/api/events",
    titleKey: "admin.nav.events",
    toggles: ["published", "featured"],
    filters: [
      { param: "published", labelKey: "common.status", options: publishedOpts },
    ],
    columns: [
      { labelKey: "common.image", render: (i) => thumb(i.coverImage) },
      {
        labelKey: "common.title",
        render: (i, L) => <strong>{loc(i.title, L)}</strong>,
      },
      { labelKey: "common.date", render: (i) => dateCell(i.date) },
      { labelKey: "common.category", render: (i) => i.category || "—" },
    ],
    fields: [
      {
        name: "title",
        type: "localized",
        label: "Title / শিরোনাম",
        required: true,
      },
      {
        name: "description",
        type: "localizedText",
        label: "Description / বিবরণ",
      },
      { name: "date", type: "date", label: "Date / তারিখ", required: true },
      { name: "time", type: "text", label: "Time / সময়" },
      { name: "location", type: "localized", label: "Location / স্থান" },
      { name: "category", type: "text", label: "Category / বিভাগ" },
      { name: "coverImage", type: "image", label: "Cover image / কভার ছবি" },
      { name: "gallery", type: "images", label: "Gallery / আরও ছবি" },
      {
        name: "displayOrder",
        type: "number",
        label: "Order / ক্রম",
        hint: "Lower first / ছোট সংখ্যা আগে",
      },
      { name: "featured", type: "checkbox", label: "Featured / বিশেষ" },
      {
        name: "published",
        type: "checkbox",
        label: "Published / প্রকাশিত",
        default: true,
      },
    ],
    defaultItem: { published: true, gallery: [] },
  },

  notices: {
    endpoint: "/api/notices",
    titleKey: "admin.nav.notices",
    toggles: ["pinned", "published"],
    filters: [
      { param: "published", labelKey: "common.status", options: publishedOpts },
    ],
    columns: [
      {
        labelKey: "common.title",
        render: (i, L) => <strong>{loc(i.title, L)}</strong>,
      },
      { labelKey: "common.date", render: (i) => dateCell(i.date) },
      {
        labelKey: "field.attachment",
        render: (i) => (i.attachmentUrl ? "📄 PDF" : "—"),
      },
    ],
    fields: [
      {
        name: "title",
        type: "localized",
        label: "Title / শিরোনাম",
        required: true,
      },
      { name: "content", type: "localizedText", label: "Content / বিষয়বস্তু" },
      { name: "date", type: "date", label: "Date / তারিখ" },
      {
        name: "attachmentUrl",
        type: "pdf",
        nameField: "attachmentName",
        label: "Attachment (PDF) / সংযুক্তি",
      },
      { name: "pinned", type: "checkbox", label: "Pin to top / উপরে পিন করুন" },
      {
        name: "published",
        type: "checkbox",
        label: "Published / প্রকাশিত",
        default: true,
      },
    ],
    defaultItem: {
      published: true,
      date: new Date().toISOString().slice(0, 10),
    },
  },

  videos: {
    endpoint: "/api/videos",
    titleKey: "admin.nav.videos",
    toggles: ["published", "featured"],
    columns: [
      {
        labelKey: "common.image",
        render: (i) =>
          i.provider === "file" ? (
            i.thumbnail ? (
              thumb(i.thumbnail)
            ) : (
              <span style={{ fontSize: "1.6rem" }} aria-hidden="true">
                🎬
              </span>
            )
          ) : (
            thumb(i.thumbnail || videoThumb(i.provider, i.videoId))
          ),
      },
      {
        labelKey: "common.title",
        render: (i, L) => <strong>{loc(i.title, L)}</strong>,
      },
      {
        labelKey: "field.provider",
        render: (i) => (i.provider === "file" ? "📁 File / ফাইল" : i.provider),
      },
      { labelKey: "common.category", render: (i) => i.category || "—" },
    ],
    fields: [
      {
        name: "title",
        type: "localized",
        label: "Title / শিরোনাম",
        required: true,
      },
      {
        name: "description",
        type: "localizedText",
        label: "Description / বিবরণ",
      },
      {
        name: "fileUrl",
        type: "videoFile",
        label: "ভিডিও ফাইল আপলোড করুন / Upload video file",
        hint: "MP4, WebM, MOV, MKV — সর্বোচ্চ 2GB। ফাইল দিলে নিচের URL লাগবে না। / If a file is set, the URL below is ignored.",
      },
      {
        name: "url",
        type: "text",
        label: "YouTube / Vimeo URL — অথবা লিংক (ঐচ্ছিক)",
        hint: "ফাইল আপলোড না করলে এখানে YouTube বা Vimeo লিংক দিন। / Only needed when no file is uploaded.",
      },
      {
        name: "thumbnail",
        type: "image",
        label: "Thumbnail / থাম্বনেইল (ঐচ্ছিক)",
      },
      { name: "category", type: "text", label: "Category / বিভাগ" },
      { name: "displayOrder", type: "number", label: "Order / ক্রম" },
      { name: "featured", type: "checkbox", label: "Featured / বিশেষ" },
      {
        name: "published",
        type: "checkbox",
        label: "Published / প্রকাশিত",
        default: true,
      },
    ],
    defaultItem: { published: true },
    mapForEdit: (item) => ({
      ...item,
      fileUrl: item.fileUrl || "",
      url:
        item.url ||
        (item.provider === "youtube"
          ? `https://youtu.be/${item.videoId}`
          : item.provider === "vimeo"
            ? `https://vimeo.com/${item.videoId}`
            : ""),
    }),
    toPayload: (form) => {
      const base = {
        title: form.title,
        description: form.description,
        thumbnail: form.thumbnail,
        category: form.category,
        featured: form.featured,
        published: form.published,
        displayOrder: Number(form.displayOrder) || 0,
      };
      const fileUrl = String(form.fileUrl || "").trim();
      if (fileUrl) {
        return { ...base, provider: "file", fileUrl, videoId: "", url: "" };
      }
      const parsed = parseVideoUrl(form.url);
      if (!parsed) {
        throw Object.assign(
          new Error(
            "ভিডিও ফাইল আপলোড করুন অথবা সঠিক YouTube/Vimeo লিংক দিন / Upload a video file or provide a valid YouTube/Vimeo URL",
          ),
          {
            friendlyMessage:
              "ভিডিও ফাইল আপলোড করুন অথবা সঠিক YouTube/Vimeo লিংক দিন / Upload a video file or provide a valid YouTube/Vimeo URL",
          },
        );
      }
      return {
        ...base,
        provider: parsed.provider,
        videoId: parsed.videoId,
        url: form.url,
        fileUrl: "",
      };
    },
  },

  gallery: {
    endpoint: "/api/gallery",
    titleKey: "admin.nav.gallery",
    toggles: ["published", "featured"],
    columns: [
      {
        labelKey: "common.image",
        render: (i) => thumb(i.coverImage || (i.images[0] && i.images[0].url)),
      },
      {
        labelKey: "common.title",
        render: (i, L) => <strong>{loc(i.title, L)}</strong>,
      },
      { labelKey: "common.images", render: (i) => (i.images || []).length },
    ],
    fields: [
      {
        name: "title",
        type: "localized",
        label: "Album title / অ্যালবামের নাম",
        required: true,
      },
      {
        name: "description",
        type: "localizedText",
        label: "Album description / বিবরণ",
      },
      { name: "coverImage", type: "image", label: "Cover image / কভার ছবি" },
      { name: "photoUrls", type: "images", label: "Photos / ছবিসমূহ" },
      { name: "displayOrder", type: "number", label: "Order / ক্রম" },
      { name: "featured", type: "checkbox", label: "Featured / বিশেষ" },
      {
        name: "published",
        type: "checkbox",
        label: "Published / প্রকাশিত",
        default: true,
      },
    ],
    defaultItem: { published: true, photoUrls: [] },
    mapForEdit: (item) => ({
      ...item,
      photoUrls: (item.images || [])
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((p) => p.url),
    }),
    toPayload: (form) => ({
      title: form.title,
      description: form.description,
      coverImage: form.coverImage || form.photoUrls[0] || "",
      images: (form.photoUrls || []).map((url, i) => ({
        url,
        caption: {},
        displayOrder: i,
      })),
      featured: form.featured,
      published: form.published,
      displayOrder: Number(form.displayOrder) || 0,
    }),
  },

  committee: {
    endpoint: "/api/committee",
    titleKey: "admin.nav.committee",
    toggles: ["active", "featured"],
    filters: [
      { param: "active", labelKey: "common.status", options: activeOpts },
    ],
    columns: [
      { labelKey: "common.image", render: (i) => thumb(i.photo) },
      {
        labelKey: "common.title",
        render: (i, L) => <strong>{loc(i.name, L)}</strong>,
      },
      { label: "Designation / পদবি", render: (i, L) => loc(i.designation, L) },
      { labelKey: "common.order", render: (i) => i.displayOrder },
    ],
    fields: [
      { name: "name", type: "localized", label: "Name / নাম", required: true },
      { name: "designation", type: "localized", label: "Designation / পদবি" },
      { name: "photo", type: "image", label: "Photo / ছবি" },
      { name: "bio", type: "localizedText", label: "Bio / পরিচিতি" },
      { name: "displayOrder", type: "number", label: "Order / ক্রম" },
      { name: "featured", type: "checkbox", label: "Featured / বিশেষ" },
      {
        name: "active",
        type: "checkbox",
        label: "Active / সক্রিয়",
        default: true,
      },
    ],
    defaultItem: { active: true },
  },

  members: {
    endpoint: "/api/members",
    titleKey: "admin.nav.members",
    toggles: ["active", "featured"],
    filters: [
      { param: "active", labelKey: "common.status", options: activeOpts },
    ],
    columns: [
      { labelKey: "common.image", render: (i) => thumb(i.photo) },
      {
        labelKey: "common.title",
        render: (i, L) => <strong>{loc(i.name, L)}</strong>,
      },
      { label: "Designation / পদবি", render: (i, L) => loc(i.designation, L) },
      {
        labelKey: "common.phone",
        render: (i) => (i.showPhone && i.phone ? i.phone : "🔒"),
      },
      { labelKey: "common.order", render: (i) => i.displayOrder },
    ],
    fields: [
      { name: "name", type: "localized", label: "Name / নাম", required: true },
      { name: "designation", type: "localized", label: "Designation / পদবি" },
      { name: "phone", type: "text", label: "Phone / ফোন" },
      { name: "photo", type: "image", label: "Photo / ছবি" },
      { name: "address", type: "localizedText", label: "Address / ঠিকানা" },
      { name: "bio", type: "localizedText", label: "Bio / পরিচিতি" },
      {
        name: "showPhone",
        type: "checkbox",
        label: "Show phone publicly / ফোন প্রকাশ",
      },
      {
        name: "showAddress",
        type: "checkbox",
        label: "Show address publicly / ঠিকানা প্রকাশ",
      },
      { name: "displayOrder", type: "number", label: "Order / ক্রম" },
      { name: "featured", type: "checkbox", label: "Featured / বিশেষ" },
      {
        name: "active",
        type: "checkbox",
        label: "Active / সক্রিয়",
        default: true,
      },
    ],
    defaultItem: { active: true, showPhone: false, showAddress: false },
  },

  socialActivities: {
    endpoint: "/api/social-activities",
    titleKey: "admin.nav.social",
    toggles: ["published", "featured"],
    columns: [
      { labelKey: "common.image", render: (i) => thumb(i.coverImage) },
      {
        labelKey: "common.title",
        render: (i, L) => <strong>{loc(i.title, L)}</strong>,
      },
      { labelKey: "common.date", render: (i) => dateCell(i.date) },
      { labelKey: "common.category", render: (i) => i.category || "—" },
    ],
    fields: [
      {
        name: "title",
        type: "localized",
        label: "Title / শিরোনাম",
        required: true,
      },
      {
        name: "description",
        type: "localizedText",
        label: "Description / বিবরণ",
      },
      { name: "date", type: "date", label: "Date / তারিখ" },
      { name: "location", type: "localized", label: "Location / স্থান" },
      { name: "category", type: "text", label: "Category / বিভাগ" },
      { name: "coverImage", type: "image", label: "Cover image / কভার ছবি" },
      { name: "gallery", type: "images", label: "Gallery / আরও ছবি" },
      { name: "displayOrder", type: "number", label: "Order / ক্রম" },
      { name: "featured", type: "checkbox", label: "Featured / বিশেষ" },
      {
        name: "published",
        type: "checkbox",
        label: "Published / প্রকাশিত",
        default: true,
      },
    ],
    defaultItem: { published: true, gallery: [] },
  },

  memories: {
    endpoint: "/api/memories",
    titleKey: "admin.nav.memories",
    toggles: ["published", "featured"],
    columns: [
      {
        labelKey: "common.image",
        render: (i) => thumb(i.photos && i.photos[0] && i.photos[0].url),
      },
      {
        labelKey: "common.title",
        render: (i, L) => <strong>{loc(i.title, L)}</strong>,
      },
      { labelKey: "common.year", render: (i) => i.year || "—" },
    ],
    fields: [
      {
        name: "title",
        type: "localized",
        label: "Title / শিরোনাম",
        required: true,
      },
      {
        name: "description",
        type: "localizedText",
        label: "Description / বিবরণ",
      },
      { name: "year", type: "number", label: "Year / বছর" },
      { name: "date", type: "date", label: "Date / তারিখ (ঐচ্ছিক)" },
      { name: "photoUrls", type: "images", label: "Photos / ছবিসমূহ" },
      { name: "videoIds", type: "videosSelect", label: "Videos / ভিডিও" },
      { name: "displayOrder", type: "number", label: "Order / ক্রম" },
      { name: "featured", type: "checkbox", label: "Featured / বিশেষ" },
      {
        name: "published",
        type: "checkbox",
        label: "Published / প্রকাশিত",
        default: true,
      },
    ],
    defaultItem: { published: true, photoUrls: [], videoIds: [] },
    mapForEdit: (item) => ({
      ...item,
      videoIds: (item.videoIds || []).map((v) => (v && v._id ? v._id : v)),
      photoUrls: (item.photos || [])
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((p) => p.url),
    }),
    toPayload: (form) => ({
      title: form.title,
      description: form.description,
      year: form.year ? Number(form.year) : undefined,
      date: form.date || undefined,
      photos: (form.photoUrls || []).map((url, i) => ({
        url,
        caption: {},
        displayOrder: i,
      })),
      videoIds: form.videoIds || [],
      featured: form.featured,
      published: form.published,
      displayOrder: Number(form.displayOrder) || 0,
    }),
  },

  souvenirs: {
    endpoint: "/api/souvenir",
    titleKey: "admin.nav.souvenir",
    toggles: ["published", "featured"],
    columns: [
      { labelKey: "common.image", render: (i) => thumb(i.coverImage) },
      {
        labelKey: "common.title",
        render: (i, L) => <strong>{loc(i.title, L)}</strong>,
      },
      { labelKey: "common.year", render: (i) => i.editionYear },
      { labelKey: "field.pdf", render: (i) => (i.pdfUrl ? "📄" : "—") },
    ],
    fields: [
      {
        name: "editionYear",
        type: "number",
        label: "Edition year / সংস্করণ বর্ষ",
        required: true,
      },
      {
        name: "title",
        type: "localized",
        label: "Title / শিরোনাম",
        required: true,
      },
      {
        name: "description",
        type: "localizedText",
        label: "Description / বিবরণ",
      },
      { name: "coverImage", type: "image", label: "Cover image / কভার ছবি" },
      {
        name: "pdfUrl",
        type: "pdf",
        nameField: "pdfName",
        label: "PDF file / পিডিএফ",
      },
      { name: "displayOrder", type: "number", label: "Order / ক্রম" },
      { name: "featured", type: "checkbox", label: "Featured / বিশেষ" },
      {
        name: "published",
        type: "checkbox",
        label: "Published / প্রকাশিত",
        default: true,
      },
    ],
    defaultItem: { published: true },
    toPayload: (form) => ({
      editionYear: Number(form.editionYear),
      title: form.title,
      description: form.description,
      coverImage: form.coverImage,
      pdfUrl: form.pdfUrl,
      featured: form.featured,
      published: form.published,
      displayOrder: Number(form.displayOrder) || 0,
    }),
  },
};
