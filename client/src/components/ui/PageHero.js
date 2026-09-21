import React from 'react';
import { Link } from 'react-router-dom';
import { MotifMark } from './index';

/** Inner-page hero band with optional breadcrumb. */
export default function PageHero({ title, subtitle, crumbLabel }) {
  return (
    <div className="page-hero">
      <div className="container">
        <div className="alpana-divider" aria-hidden="true" style={{ margin: '0 0 14px' }}>
          <MotifMark width={20} height={20} opacity={0.85} />
        </div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">⌂</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{crumbLabel || title}</span>
        </nav>
      </div>
    </div>
  );
}
