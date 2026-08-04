// Echo mark — same pixel agent as the favicon, inline so it inherits
// no external asset and stays crisp at any size.
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect width="16" height="16" fill="#F5F2E8" />
      <rect x="7" y="1" width="2" height="1" fill="#4F6D5A" />
      <rect x="7" y="2" width="2" height="1" fill="#1E1E1E" />
      <rect x="3" y="3" width="10" height="1" fill="#1E1E1E" />
      <rect x="3" y="4" width="1" height="8" fill="#1E1E1E" />
      <rect x="12" y="4" width="1" height="8" fill="#1E1E1E" />
      <rect x="5" y="6" width="2" height="2" fill="#4F6D5A" />
      <rect x="9" y="6" width="2" height="2" fill="#4F6D5A" />
      <rect x="6" y="9" width="4" height="1" fill="#4F6D5A" />
      <rect x="3" y="12" width="10" height="1" fill="#1E1E1E" />
    </svg>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-pixel text-sm leading-none">Equix Ai</span>
    </span>
  );
}
