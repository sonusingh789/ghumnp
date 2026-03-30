'use client';

import { useState } from 'react';

const PROVINCES = [
  {
    id: 'p7',
    name: 'Sudurpashchim',
    num: 7,
    color: 'rgba(199,210,254,0.22)',
    hover: 'rgba(199,210,254,0.42)',
    districts: ['Kanchanpur','Kailali','Dadeldhura','Doti','Achham','Bajura','Bajhang','Darchula','Baitadi'],
    // polygon points — west end of Nepal
    points: '10,195 10,88 48,54 88,28 128,20 143,92 148,158 128,195',
    labelX: 65, labelY: 130,
  },
  {
    id: 'p6',
    name: 'Karnali',
    num: 6,
    color: 'rgba(253,224,71,0.18)',
    hover: 'rgba(253,224,71,0.36)',
    districts: ['Humla','Mugu','Dolpa','Jumla','Kalikot','Dailekh','Jajarkot','Rukum (West)','Salyan','Surkhet'],
    points: '88,28 128,20 143,92 148,158 238,168 282,156 298,88 278,12 196,4 124,8',
    labelX: 192, labelY: 95,
  },
  {
    id: 'p5',
    name: 'Lumbini',
    num: 5,
    color: 'rgba(134,239,172,0.2)',
    hover: 'rgba(134,239,172,0.38)',
    districts: ['Nawalparasi (W)','Rupandehi','Kapilvastu','Palpa','Gulmi','Arghakhanchi','Pyuthan','Rolpa','Rukum (E)','Dang','Banke','Bardiya'],
    points: '128,195 148,158 238,168 282,156 298,88 372,98 382,168 388,195 310,208 196,208',
    labelX: 250, labelY: 175,
  },
  {
    id: 'p4',
    name: 'Gandaki',
    num: 4,
    color: 'rgba(167,243,208,0.2)',
    hover: 'rgba(167,243,208,0.38)',
    districts: ['Mustang','Manang','Gorkha','Lamjung','Tanahun','Kaski','Myagdi','Baglung','Parbat','Syangja','Nawalparasi (E)'],
    points: '278,12 298,88 372,98 382,168 442,162 458,88 438,8 358,4',
    labelX: 368, labelY: 88,
  },
  {
    id: 'p3',
    name: 'Bagmati',
    num: 3,
    color: 'rgba(252,165,165,0.18)',
    hover: 'rgba(252,165,165,0.36)',
    districts: ['Rasuwa','Sindhupalchok','Nuwakot','Dhading','Kathmandu','Bhaktapur','Lalitpur','Kavrepalanchok','Sindhuli','Ramechhap','Dolkha','Chitwan','Makwanpur'],
    points: '358,4 438,8 458,88 442,162 568,156 578,78 556,8',
    labelX: 480, labelY: 80,
  },
  {
    id: 'p2',
    name: 'Madhesh',
    num: 2,
    color: 'rgba(216,180,254,0.2)',
    hover: 'rgba(216,180,254,0.38)',
    districts: ['Parsa','Bara','Rautahat','Sarlahi','Mahottari','Dhanusha','Siraha','Saptari'],
    points: '310,208 388,195 382,168 442,162 568,156 672,162 678,195 560,210 410,212',
    labelX: 490, labelY: 192,
  },
  {
    id: 'p1',
    name: 'Koshi',
    num: 1,
    color: 'rgba(253,186,116,0.18)',
    hover: 'rgba(253,186,116,0.36)',
    districts: ['Taplejung','Panchthar','Ilam','Jhapa','Sankhuwasabha','Terhathum','Dhankuta','Sunsari','Morang','Bhojpur','Khotang','Udayapur','Okhaldhunga','Solukhumbu'],
    points: '556,8 578,78 568,156 672,162 678,195 780,198 800,88 792,8 700,4 638,0',
    labelX: 688, labelY: 100,
  },
];

export default function NepalMap() {
  const [active, setActive] = useState(null);
  const activeProvince = PROVINCES.find(p => p.id === active);

  return (
    <div style={{ width: '100%', userSelect: 'none' }}>
      {/* SVG Map */}
      <svg
        viewBox="0 0 810 220"
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        {/* Drop shadow filter */}
        <defs>
          <filter id="glow">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(134,239,172,0.5)" />
          </filter>
        </defs>

        {/* Nepal outer stroke */}
        <polygon
          points="10,195 10,88 48,54 88,28 128,20 196,4 278,12 358,4 438,8 556,8 638,0 700,4 792,8 800,88 780,198 678,195 560,210 410,212 310,208 196,208 128,195"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />

        {/* Province polygons */}
        {PROVINCES.map((p) => (
          <polygon
            key={p.id}
            points={p.points}
            fill={active === p.id ? p.hover : p.color}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
            style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
            onMouseEnter={() => setActive(p.id)}
            onMouseLeave={() => setActive(null)}
            onTouchStart={() => setActive(active === p.id ? null : p.id)}
          />
        ))}

        {/* Province number labels */}
        {PROVINCES.map((p) => (
          <g key={`label-${p.id}`} pointerEvents="none">
            <circle
              cx={p.labelX}
              cy={p.labelY}
              r="11"
              fill={active === p.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)'}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />
            <text
              x={p.labelX}
              y={p.labelY + 4.5}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="rgba(255,255,255,0.9)"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {p.num}
            </text>
          </g>
        ))}

        {/* Everest marker */}
        <g pointerEvents="none">
          <circle cx="516" cy="20" r="3" fill="#86efac" />
          <text x="522" y="16" fontSize="8" fill="rgba(134,239,172,0.9)" fontFamily="system-ui" fontWeight="600">Everest</text>
        </g>
      </svg>

      {/* Province info panel — shows on hover/touch */}
      <div style={{
        minHeight: 52,
        marginTop: 10,
        padding: '10px 14px',
        borderRadius: 14,
        background: activeProvince ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.15)',
        transition: 'all 0.2s ease',
      }}>
        {activeProvince ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {activeProvince.num}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                {activeProvince.name} Province
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(134,239,172,0.9)', background: 'rgba(134,239,172,0.12)', borderRadius: 999, padding: '2px 8px', marginLeft: 'auto' }}>
                {activeProvince.districts.length} districts
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 6px' }}>
              {activeProvince.districts.map(d => (
                <span key={d} style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', borderRadius: 999, padding: '2px 7px' }}>
                  {d}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: 0, lineHeight: '32px' }}>
            Tap a province to see its districts
          </p>
        )}
      </div>
    </div>
  );
}
