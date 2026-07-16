export function CyberCorrLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer dashed orbit ring */}
      <circle cx="22" cy="22" r="20" stroke="#00E5FF" strokeWidth="1" strokeDasharray="3 2.5" strokeOpacity="0.6" />
      {/* Vault / Shield */}
      <path d="M22 5 L33 10 L33 22 Q33 31 22 39 Q11 31 11 22 L11 10 Z"
        fill="#0B1220" stroke="#00E5FF" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Inner glow fill */}
      <path d="M22 8 L31 12.5 L31 22 Q31 29.5 22 36.5 Q13 29.5 13 22 L13 12.5 Z"
        fill="#00E5FF" fillOpacity="0.06" />
      {/* Central hub node */}
      <circle cx="22" cy="19" r="2.5" fill="#00E5FF" />
      <circle cx="22" cy="19" r="4" stroke="#00E5FF" strokeWidth="0.5" strokeOpacity="0.3" />
      {/* Satellite nodes */}
      <circle cx="16" cy="25" r="1.8" fill="#7C4DFF" />
      <circle cx="28" cy="25" r="1.8" fill="#7C4DFF" />
      <circle cx="22" cy="30" r="1.8" fill="#ffffff" fillOpacity="0.85" />
      {/* Neural connection lines */}
      <line x1="22" y1="19" x2="16" y2="25" stroke="#00E5FF" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="22" y1="19" x2="28" y2="25" stroke="#00E5FF" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="16" y1="25" x2="22" y2="30" stroke="#7C4DFF" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="28" y1="25" x2="22" y2="30" stroke="#7C4DFF" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="16" y1="25" x2="28" y2="25" stroke="#00E5FF" strokeWidth="0.6" strokeOpacity="0.4" />
      {/* Outer AI nodes on ring */}
      <circle cx="22" cy="2" r="1.5" fill="#00E5FF" />
      <circle cx="36.6" cy="11" r="1.1" fill="#7C4DFF" />
      <circle cx="36.6" cy="33" r="1.1" fill="#7C4DFF" />
      <circle cx="22" cy="42" r="1.5" fill="#00E5FF" />
      <circle cx="7.4" cy="33" r="1.1" fill="#7C4DFF" />
      <circle cx="7.4" cy="11" r="1.1" fill="#7C4DFF" />
      {/* Connecting spokes from outer nodes to shield edge */}
      <line x1="22" y1="3.5" x2="22" y2="5" stroke="#00E5FF" strokeWidth="0.7" strokeOpacity="0.5" />
      <line x1="35.5" y1="11.5" x2="32.5" y2="13" stroke="#7C4DFF" strokeWidth="0.7" strokeOpacity="0.4" />
      <line x1="8.5" y1="11.5" x2="11.5" y2="13" stroke="#7C4DFF" strokeWidth="0.7" strokeOpacity="0.4" />
    </svg>
  );
}
