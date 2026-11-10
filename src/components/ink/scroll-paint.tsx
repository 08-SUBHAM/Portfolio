/** Static decorative timeline brush line. Nothing here reacts to scroll. */
export function TimelineStroke() {
  return <div className="timeline-stroke" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 20 300" preserveAspectRatio="none">
    <path d="M10 0Q4 55 11 105T9 205T10 300" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M5 15v70M14 115v50M5 206v55" fill="none" stroke="currentColor" strokeWidth="0.5" />
  </svg></div>;
}
