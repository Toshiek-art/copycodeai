import type {LogoProps} from 'sanity';

export default function StudioLogo(_props: LogoProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontFamily: '"Space Grotesk Variable", "Inter Variable", system-ui, sans-serif',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        color: '#111827',
      }}
    >
      <div
        style={{
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          display: 'grid',
          placeItems: 'center',
          color: '#f9fafb',
          fontSize: '1.125rem',
        }}
      >
        CC
      </div>
      <div style={{display: 'flex', flexDirection: 'column', lineHeight: 1}}>
        <span style={{fontSize: '1rem'}}>CopyCodeAI Studio</span>
        <span style={{fontSize: '0.75rem', fontWeight: 500, color: '#4b5563'}}>Astro × Sanity CMS</span>
      </div>
    </div>
  );
}
