import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Img } from "./ui";
import { useLanguage } from "../contexts/LanguageContext";
import { dateParts, formatDate, num } from "../utils/format";

export function EventCard({ event }) {
  const { L, lang } = useLanguage();
  const dp = dateParts(event.date, lang);

  return (
    <Link
      to={`/events/${event._id}`}
      className="card"
      style={{ color: "inherit" }}
      aria-label={L(event.title)}
    >
      <div className="card-media">
        <Img
          src={event.coverImage}
          alt={L(event.title)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {event.date && (
          <div className="card-date" aria-hidden="true">
            <b>{dp.day}</b>
            <span>{dp.month}</span>
          </div>
        )}
      </div>

      <div className="card-body">
        {event.category && (
          <span className="chip chip-gold">{event.category}</span>
        )}

        <h3 className="card-title">{L(event.title)}</h3>

        <p className="card-text">{L(event.description)}</p>

        <div className="card-meta">
          {event.time && <span>🕒 {event.time}</span>}

          {L(event.location) && <span>📍 {L(event.location)}</span>}
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   COMMITTEE / PERSON CARD
   ========================================================= */

export function PersonCard({ person, committee }) {
  const { L, t } = useLanguage();

  const [expanded, setExpanded] = useState(false);

  const name = L(person.name);
  const initial = name ? name.trim().charAt(0) : "?";
  const bio = L(person.bio);

  /*
   * Bio যদি যথেষ্ট বড় হয় তাহলেই
   * "আরও পড়ুন" button দেখাবে।
   */
  const hasMoreText = bio && bio.length > 120;

  return (
    <article className="card person-card">
      {/* PROFILE PHOTO */}
      <div className="avatar">
        {person.photo ? (
          <Img src={person.photo} alt={name} />
        ) : (
          <span className="avatar-fallback" aria-hidden="true">
            {initial}
          </span>
        )}
      </div>

      {/* NAME */}
      <h3 className="card-title">{name}</h3>

      {/* DESIGNATION */}
      {L(person.designation) && (
        <div className="role">{L(person.designation)}</div>
      )}

      {/* PHONE */}
      {!committee && person.phone && (
        <div className="contact-line">
          <a
            href={`tel:${person.phone}`}
            className="btn btn-light btn-sm mt-2"
            aria-label={`${t("common.call")} ${name}`}
          >
            ☎ {t("common.call")}
          </a>
        </div>
      )}

      {/* ADDRESS */}
      {!committee && person.address && L(person.address) && (
        <div className="contact-line">📍 {L(person.address)}</div>
      )}

      {/* BIO */}
      {bio && (
        <div className="person-bio-wrapper">
          <p
            className={`bio card-text ${
              expanded ? "bio-expanded" : "bio-collapsed"
            }`}
          >
            {bio}
          </p>

          {/* READ MORE / SHOW LESS */}
          {hasMoreText && (
            <button
              type="button"
              className="bio-toggle"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
            >
              {expanded ? "সংক্ষেপে দেখুন" : "আরও পড়ুন"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

/* =========================================================
   ALBUM CARD
   ========================================================= */

export function AlbumCard({ album }) {
  const { L, t, lang } = useLanguage();

  return (
    <Link
      to={`/gallery/${album._id}`}
      className="card"
      style={{ color: "inherit" }}
    >
      <div className="card-media">
        <Img
          src={
            album.coverImage ||
            (album.images && album.images[0] && album.images[0].url)
          }
          alt={L(album.title)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div className="card-body">
        <h3 className="card-title">{L(album.title)}</h3>

        <div className="card-meta">
          <span>
            ❏{" "}
            {num(
              album.imageCount ?? (album.images ? album.images.length : 0),
              lang,
            )}{" "}
            {t("gallery.photos")}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   SOUVENIR CARD
   ========================================================= */

export function SouvenirCard({ item }) {
  const { L, t, lang } = useLanguage();

  return (
    <article className="card">
      <div className="card-media" style={{ aspectRatio: "16/11" }}>
        <Img
          src={item.coverImage}
          alt={L(item.title)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div className="card-body">
        <span className="chip chip-vermilion">
          {t("souvenir.edition")} {num(item.editionYear, lang)}
        </span>

        <h3 className="card-title">{L(item.title)}</h3>

        <p className="card-text">{L(item.description)}</p>

        {item.pdfUrl && (
          <div className="card-meta">
            <a
              className="btn btn-outline btn-sm"
              href={item.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              ⤓ {t("souvenir.viewPdf")}
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   NOTICE LINE
   ========================================================= */

export function NoticeLine({ notice, onOpen }) {
  const { L, lang } = useLanguage();

  return (
    <article className="notice-item">
      {notice.pinned && (
        <span className="notice-pin" title="Pinned" aria-label="Pinned">
          📌
        </span>
      )}

      <div className="grow">
        <h3>
          <button
            type="button"
            onClick={() => onOpen(notice)}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              color: "inherit",
              font: "inherit",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {L(notice.title)}
          </button>
        </h3>

        <time dateTime={notice.date}>{formatDate(notice.date, lang)}</time>

        {L(notice.content) && <p>{L(notice.content)}</p>}

        {notice.attachmentUrl && (
          <a
            className="btn btn-light btn-sm mt-2"
            href={notice.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            ⤓{" "}
            {L({
              bn: notice.attachmentName || "সংযুক্তি",
              en: notice.attachmentName || "Attachment",
            })}
          </a>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   ACTIVITY CARD
   ========================================================= */

export function ActivityCard({ item, basePath }) {
  const { L, lang } = useLanguage();

  const link = basePath ? `${basePath}/${item._id}` : null;

  const inner = (
    <>
      <div className="card-media">
        <Img
          src={
            item.coverImage ||
            (item.photos && item.photos[0] && item.photos[0].url)
          }
          alt={L(item.title)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div className="card-body">
        {item.category && (
          <span className="chip chip-gold">{item.category}</span>
        )}

        {item.year ? (
          <span className="chip chip-vermilion">{item.year}</span>
        ) : null}

        <h3 className="card-title">{L(item.title)}</h3>

        <p className="card-text">{L(item.description)}</p>

        <div className="card-meta">
          {item.date && <span>🗓 {formatDate(item.date, lang)}</span>}

          {L(item.location) && <span>📍 {L(item.location)}</span>}
        </div>
      </div>
    </>
  );

  return link ? (
    <Link to={link} className="card" style={{ color: "inherit" }}>
      {inner}
    </Link>
  ) : (
    <article className="card">{inner}</article>
  );
}
