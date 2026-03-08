import { useState } from 'react';

export default function ImageGallery({ photos }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  if (!photos || photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setSelectedIndex(idx)}
            className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition"
          >
            <img
              src={photo.image_url}
              alt="Vendor photo"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            onClick={() => setSelectedIndex(null)}
          >
            &times;
          </button>
          {selectedIndex > 0 && (
            <button
              className="absolute left-4 text-white text-3xl hover:text-gray-300"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); }}
            >
              &lsaquo;
            </button>
          )}
          {selectedIndex < photos.length - 1 && (
            <button
              className="absolute right-12 text-white text-3xl hover:text-gray-300"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); }}
            >
              &rsaquo;
            </button>
          )}
          <img
            src={photos[selectedIndex].image_url}
            alt="Full size"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
