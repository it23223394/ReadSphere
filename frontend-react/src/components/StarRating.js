import React from 'react';

export default function StarRating({ value, onChange }) {
  const set = (n) => onChange && onChange(n);
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => set(n)}
          aria-label={`Rate ${n}`}
          className="text-xl"
          style={{ color: n <= (value || 0) ? '#F59E0B' : '#CBD5E1' }}
        >
          ★
        </button>
      ))}
      <button type="button" className="text-xs btn btn-tertiary" onClick={() => set(null)}>Clear</button>
    </div>
  );
}
