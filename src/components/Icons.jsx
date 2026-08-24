const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ size = 20, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      {children}
    </svg>
  );
}

export function IconOverview(props) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

export function IconStethoscope(props) {
  return (
    <Svg {...props}>
      <path d="M6 4v5.5a4.5 4.5 0 0 0 9 0V4" />
      <path d="M6 4H4.6" />
      <path d="M15 4h1.4" />
      <path d="M19 9.5v2.5a5 5 0 0 1-9.6 1.9" />
      <circle cx="19.5" cy="8.5" r="1.6" />
    </Svg>
  );
}

export function IconHeadset(props) {
  return (
    <Svg {...props}>
      <path d="M4 13.5v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19v.5a3 3 0 0 1-3 3h-3" />
    </Svg>
  );
}

export function IconUsers(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 19c.7-3.2 3.2-5 6.2-5s5.5 1.8 6.2 5" />
      <circle cx="17.2" cy="8.6" r="2.4" />
      <path d="M15.5 14.3c2.4.4 4.2 1.9 4.8 4.7" />
    </Svg>
  );
}

export function IconCalendar(props) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4M16 3v4" />
      <path d="M8.5 13.5l2 2 4-4" />
    </Svg>
  );
}

export function IconRupee(props) {
  return (
    <Svg {...props}>
      <path d="M6 4.5h12" />
      <path d="M6 9h12" />
      <path d="M6 4.5c4 0 6.5 1.3 6.5 4S10 12.5 6 12.5" />
      <path d="M6 12.5h4.5L18 20" />
    </Svg>
  );
}

export function IconPlus(props) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconArrowRight(props) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}
