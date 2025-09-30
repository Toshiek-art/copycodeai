import type {NavbarProps} from 'sanity';
import type {CSSProperties} from 'react';

const barStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.75rem 1.25rem',
  background: '#0f172a',
  color: '#f9fafb',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
};

const linksStyle: CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  fontFamily: '"Inter Variable", system-ui, sans-serif',
};

const linkStyle: CSSProperties = {
  color: '#f9fafb',
  fontSize: '0.85rem',
  fontWeight: 600,
  textDecoration: 'none',
};

const badgeStyle: CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  opacity: 0.8,
};

export default function StudioNavbar(props: NavbarProps) {
  return (
    <div style={{boxShadow: '0 1px 0 rgba(15, 23, 42, 0.06)'}}>
      <div style={barStyle}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.2rem'}}>
          <span style={badgeStyle}>CopyCodeAI Internal</span>
          <span style={{fontSize: '1.05rem', fontWeight: 600, letterSpacing: '-0.01em'}}>Control Center · Studio</span>
        </div>
        <div style={linksStyle}>
          <a href="/" rel="noopener noreferrer" target="_blank" style={linkStyle}>
            Apri sito ↗
          </a>
          <a href="/admin" rel="noopener noreferrer" target="_blank" style={linkStyle}>
            Dashboard ↗
          </a>
          <a href="/admin/_debug" rel="noopener noreferrer" target="_blank" style={linkStyle}>
            Headers ↗
          </a>
        </div>
      </div>
      {props.renderDefault(props)}
    </div>
  );
}
