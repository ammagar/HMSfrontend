export default function Logo({ className = "leaf", style }) {
  // A stylised strand-and-droplet mark: a curling hair strand cradling a
  // dewdrop, echoing the clinic's skin + hair focus without leaning on a
  // literal medical cross.
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M24 4C15 8 9 16 9 25c0 8.3 6.7 15 15 15s15-6.7 15-15c0-5-2.3-9-6-12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M24 12c-5 3.4-8.5 8.5-8.5 13.5a8.5 8.5 0 0 0 17 0c0-3-1.3-5.6-3.4-7.7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="26" r="3.4" fill="currentColor" />
    </svg>
  );
}
