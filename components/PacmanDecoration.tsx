import './PacmanDecoration.css';

export function PacmanDecoration() {
  return (
    <div className="pacman-scene" aria-hidden="true">
      {/* Dots trail */}
      <div className="pacman-dots">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="pac-dot" />
        ))}
      </div>
      {/* Pac-Man character */}
      <div className="pacman-character" />
      {/* Ghost */}
      <div className="ghost" />
    </div>
  );
}
