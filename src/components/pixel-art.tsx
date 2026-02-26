interface PixelArtProps {
  className?: string;
}

export function PixelHouse({ className }: PixelArtProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Chimney */}
      <rect x="11" y="1" width="2" height="3" fill="#8B7D72" />
      {/* Roof */}
      <rect x="7" y="2" width="2" height="1" fill="#A0705A" />
      <rect x="5" y="3" width="6" height="1" fill="#A0705A" />
      <rect x="3" y="4" width="10" height="1" fill="#A0705A" />
      <rect x="2" y="5" width="12" height="1" fill="#A0705A" />
      {/* Walls */}
      <rect x="3" y="6" width="10" height="8" fill="#D5CBBA" />
      {/* Left window */}
      <rect x="4" y="8" width="2" height="2" fill="#7A9AAF" />
      {/* Right window */}
      <rect x="10" y="8" width="2" height="2" fill="#7A9AAF" />
      {/* Door */}
      <rect x="7" y="10" width="2" height="4" fill="#8B7D72" />
      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill="#C4BEB5" />
    </svg>
  );
}

export function PixelApartment({ className }: PixelArtProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Roof */}
      <rect x="2" y="1" width="12" height="1" fill="#8B8680" />
      {/* Building body */}
      <rect x="3" y="2" width="10" height="12" fill="#D5CBBA" />
      {/* Floor 1 windows */}
      <rect x="4" y="3" width="2" height="2" fill="#7A9AAF" />
      <rect x="10" y="3" width="2" height="2" fill="#7A9AAF" />
      {/* Floor 2 windows */}
      <rect x="4" y="6" width="2" height="2" fill="#7A9AAF" />
      <rect x="10" y="6" width="2" height="2" fill="#7A9AAF" />
      {/* Floor 3 windows */}
      <rect x="4" y="9" width="2" height="2" fill="#7A9AAF" />
      <rect x="10" y="9" width="2" height="2" fill="#7A9AAF" />
      {/* Door */}
      <rect x="7" y="11" width="2" height="3" fill="#8B7D72" />
      {/* Ground */}
      <rect x="0" y="14" width="16" height="2" fill="#C4BEB5" />
    </svg>
  );
}
