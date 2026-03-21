"use client";

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
}

export function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  const src = `https://www.google.com/maps/embed/v1/place?key=MOCK_KEY&q=${lat},${lng}&zoom=15`;

  return (
    <div className="space-y-2">
      <h3 className="text-xs text-gray-400 uppercase">Location</h3>
      <div className="relative w-full aspect-video bg-gray-100 border border-gray-200 overflow-hidden">
        {/* Static placeholder — replace with real Google Maps embed when API key is available */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <svg className="size-12 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs mt-1">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-xs text-blue-500 hover:text-blue-600 underline underline-offset-2"
          >
            Open in Google Maps
          </a>
        </div>
        {/* Grid overlay to simulate map */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(to right, gray 1px, transparent 1px), linear-gradient(to bottom, gray 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
    </div>
  );
}
