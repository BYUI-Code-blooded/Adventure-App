// Animated 2D scene for the login page: a trail draws itself to the summit, then a map pin drops.
// Pure SVG; the animations live in app/globals.css (classes starting with "adv-").
export default function AdventureScene() {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className="adv-scene absolute inset-0 h-full w-full"
    >
      <defs>
        <mask id="adv-trail-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="500">
          <path
            d="M250 462C300 440 340 440 330 410S380 380 360 350 410 320 400 276"
            pathLength="1"
            fill="none"
            stroke="white"
            strokeWidth="14"
            strokeLinecap="round"
            className="adv-trail-reveal"
          />
        </mask>
        <g id="adv-pine">
          <rect x="-2.5" y="4" width="5" height="9" />
          <polygon points="0,-40 14,-14 7,-14 18,6 -18,6 -7,-14 -14,-14" />
        </g>
      </defs>

      {/* Sun */}
      <g className="adv-sun">
        <g className="adv-rays" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="0" y1="-48" x2="0" y2="-60" transform={`rotate(${i * 30})`} />
          ))}
        </g>
        <circle r="34" className="fill-amber-300" />
      </g>

      {/* Clouds and birds */}
      <g className="adv-cloud fill-amber-50" opacity="0.14">
        <ellipse cx="150" cy="96" rx="52" ry="12" />
        <ellipse cx="184" cy="84" rx="30" ry="12" />
      </g>
      <g className="adv-cloud adv-cloud-slow fill-amber-50" opacity="0.1">
        <ellipse cx="640" cy="170" rx="46" ry="10" />
        <ellipse cx="666" cy="160" rx="26" ry="10" />
      </g>
      <g className="adv-bird" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <path d="M0 0q6-7 12 0q6-7 12 0" />
      </g>
      <g className="adv-bird adv-bird-late" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4">
        <path d="M0 34q6-7 12 0q6-7 12 0" />
      </g>

      {/* Mountains */}
      <path
        className="adv-layer adv-layer-1 fill-emerald-800"
        d="M0 330L110 250L200 310L330 190L450 300L560 230L680 310L800 260V500H0Z"
      />
      <path
        className="adv-layer adv-layer-2 fill-emerald-700"
        d="M0 390L130 310L240 370L400 270L540 370L640 320L800 380V500H0Z"
      />
      <path
        className="adv-layer adv-layer-3 fill-emerald-950"
        d="M0 450Q200 400 400 440T800 420V500H0Z"
      />

      {/* Trees */}
      <g className="fill-emerald-900">
        <use href="#adv-pine" className="adv-tree" transform="translate(70 452) scale(1.5)" />
        <use href="#adv-pine" className="adv-tree adv-tree-b" transform="translate(120 462) scale(1.1)" />
        <use href="#adv-pine" className="adv-tree adv-tree-c" transform="translate(40 470) scale(0.9)" />
        <use href="#adv-pine" className="adv-tree adv-tree-b" transform="translate(660 440) scale(1.4)" />
        <use href="#adv-pine" className="adv-tree" transform="translate(712 452) scale(1.9)" />
        <use href="#adv-pine" className="adv-tree adv-tree-c" transform="translate(764 446) scale(1.2)" />
      </g>

      {/* Camp: tent and fire */}
      <g transform="translate(250 462)">
        <path d="M-24 0L0-30L24 0Z" className="fill-amber-300" />
        <path d="M-6 0L0-15L6 0Z" className="fill-emerald-950" />
        <path d="M30 0q-7-9-2-19q3 7 7 6q4 4-5 13Z" className="adv-flame fill-amber-300" />
      </g>

      {/* Trail: dotted path revealed by the mask above */}
      <g className="adv-trail-group" mask="url(#adv-trail-mask)">
        <path
          d="M250 462C300 440 340 440 330 410S380 380 360 350 410 320 400 276"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1 10"
          className="stroke-amber-200"
        />
      </g>

      {/* Pin that drops on the summit */}
      <g transform="translate(400 276)">
        <g className="adv-pin-group">
          <ellipse className="adv-ripple fill-none stroke-amber-300" strokeWidth="2" rx="16" ry="6" />
          <ellipse className="adv-ripple adv-ripple-late fill-none stroke-amber-300" strokeWidth="2" rx="16" ry="6" />
          <g className="adv-pin">
            <path
              d="M0 0C-14-22-22-32-22-44a22 22 0 1 1 44 0C22-32 14-22 0 0Z"
              className="fill-amber-300"
            />
            <circle cy="-44" r="8" className="fill-emerald-900" />
          </g>
        </g>
      </g>
    </svg>
  );
}
