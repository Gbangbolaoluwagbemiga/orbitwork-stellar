"use client";

interface OrbitLogoProps {
  size?: number;
  className?: string;
}

export function OrbitLogo({ size = 160, className = "" }: OrbitLogoProps) {
  const cx = 100;
  const cy = 100;
  const pr = 40; // planet radius
  const orx = 82; // orbit x-radius
  const ory = 26; // orbit y-radius (flat ellipse for tilt effect)
  const sr = 5.5; // satellite radius

  // Full ellipse path for animateMotion (counterclockwise so it goes over top)
  const orbitPath = `M ${cx + orx},${cy} A ${orx},${ory} 0 0,0 ${cx - orx},${cy} A ${orx},${ory} 0 0,0 ${cx + orx},${cy}`;

  // Back half: from left to right going through top of ellipse (sweep=0 CCW)
  const backHalf = `M ${cx - orx},${cy} A ${orx},${ory} 0 0,0 ${cx + orx},${cy}`;

  // Front half: from right to left going through bottom (or left→right sweep=1)
  const frontHalf = `M ${cx - orx},${cy} A ${orx},${ory} 0 0,1 ${cx + orx},${cy}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OrbitWork logo — planet with orbiting satellite"
    >
      <defs>
        {/* Planet surface gradient */}
        <radialGradient id="planetGrad" cx="36%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="40%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>

        {/* Atmosphere radial glow */}
        <radialGradient id="atmoGrad" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.4" />
        </radialGradient>

        {/* Planet outer ring glow */}
        <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.15" />
        </radialGradient>

        {/* Satellite glow filter */}
        <filter id="satGlow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Planet soft glow */}
        <filter id="planetGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Orbit ring gradient */}
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#818cf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Outer atmosphere glow */}
      <circle cx={cx} cy={cy} r={pr + 34} fill="url(#outerGlow)" />

      {/* Close atmosphere */}
      <circle cx={cx} cy={cy} r={pr + 10} fill="url(#atmoGrad)" />

      {/* ── Orbit ring BACK half (drawn behind planet) ── */}
      <path
        d={backHalf}
        stroke="#818cf8"
        strokeWidth="1.2"
        strokeOpacity="0.22"
        strokeDasharray="6 4"
      />

      {/* ── Planet ── */}
      <circle cx={cx} cy={cy} r={pr} fill="url(#planetGrad)" filter="url(#planetGlow)" />

      {/* Planet specular highlight */}
      <ellipse
        cx={cx - pr * 0.32}
        cy={cy - pr * 0.32}
        rx={pr * 0.38}
        ry={pr * 0.22}
        fill="rgba(255,255,255,0.16)"
        transform={`rotate(-30 ${cx - pr * 0.32} ${cy - pr * 0.32})`}
      />

      {/* Surface continent patches */}
      <ellipse
        cx={cx + 10}
        cy={cy - 6}
        rx={9}
        ry={5.5}
        fill="rgba(255,255,255,0.055)"
        transform={`rotate(12 ${cx + 10} ${cy - 6})`}
      />
      <ellipse
        cx={cx - 10}
        cy={cy + 10}
        rx={7}
        ry={4.5}
        fill="rgba(255,255,255,0.05)"
        transform={`rotate(-20 ${cx - 10} ${cy + 10})`}
      />
      <ellipse
        cx={cx + 4}
        cy={cy + 16}
        rx={5}
        ry={3}
        fill="rgba(255,255,255,0.04)"
      />

      {/* ── Orbit ring FRONT half (drawn in front of planet) ── */}
      <path
        d={frontHalf}
        stroke="url(#ringGrad)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* ── Orbiting satellite ── */}
      <circle r={sr} fill="#06b6d4" filter="url(#satGlow)">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore – path is a valid SVG animateMotion attribute */}
        <animateMotion
          dur="3.8s"
          repeatCount="indefinite"
          calcMode="linear"
          path={orbitPath}
        />
      </circle>

      {/* Satellite trail (fading copy slightly behind) */}
      <circle r={sr * 0.6} fill="#67e8f9" opacity="0.4">
        {/* @ts-ignore */}
        <animateMotion
          dur="3.8s"
          repeatCount="indefinite"
          calcMode="linear"
          path={orbitPath}
          begin="0.12s"
        />
      </circle>
    </svg>
  );
}

/* ── Compact inline logo for the navbar ── */
export function OrbitLogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="pmg" cx="36%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="45%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="40" fill="url(#pmg)" />
      <ellipse cx="100" cy="100" rx="82" ry="26" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeOpacity="0.5" />
      <circle r="6" fill="#06b6d4">
        {/* @ts-ignore */}
        <animateMotion
          dur="3.8s"
          repeatCount="indefinite"
          calcMode="linear"
          path="M 182,100 A 82,26 0 0,0 18,100 A 82,26 0 0,0 182,100"
        />
      </circle>
    </svg>
  );
}
