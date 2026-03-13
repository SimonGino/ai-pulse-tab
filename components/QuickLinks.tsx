const LINKS = [
  { name: 'Claude', url: 'https://claude.ai', letter: 'C', color: '#D97706' },
  { name: 'ChatGPT', url: 'https://chatgpt.com', letter: 'G', color: '#10A37F' },
  { name: 'Douyu', url: 'https://douyu.com', letter: 'D', color: '#FF6A00' },
  { name: 'X', url: 'https://x.com', letter: 'X', color: '#FFFFFF' },
];

export function QuickLinks() {
  return (
    <div className="w-full max-w-sm">
      <h3
        className="pixel-font text-xs mb-3"
        style={{ color: 'var(--pixel-pink)', fontSize: '9px' }}
      >
        QUICK LINKS
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {LINKS.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-link-card flex flex-col items-center gap-2 p-3 transition-all"
            style={{
              backgroundColor: 'var(--pixel-dark)',
              boxShadow: `
                -2px 0 0 0 var(--pixel-border),
                2px 0 0 0 var(--pixel-border),
                0 -2px 0 0 var(--pixel-border),
                0 2px 0 0 var(--pixel-border)
              `,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `
                -2px 0 0 0 ${link.color},
                2px 0 0 0 ${link.color},
                0 -2px 0 0 ${link.color},
                0 2px 0 0 ${link.color}
              `;
              e.currentTarget.style.backgroundColor = '#2a2a4e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `
                -2px 0 0 0 var(--pixel-border),
                2px 0 0 0 var(--pixel-border),
                0 -2px 0 0 var(--pixel-border),
                0 2px 0 0 var(--pixel-border)
              `;
              e.currentTarget.style.backgroundColor = 'var(--pixel-dark)';
            }}
          >
            <div
              className="pixel-font flex items-center justify-center"
              style={{
                width: '32px',
                height: '32px',
                fontSize: '16px',
                color: link.color,
              }}
            >
              {link.letter}
            </div>
            <span
              className="pixel-font"
              style={{ fontSize: '7px', color: 'var(--pixel-white)' }}
            >
              {link.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
