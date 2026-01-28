export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Classical Column Base */}
      <rect x="6" y="26" width="20" height="2" rx="1" fill="currentColor"/>
      
      {/* Column Shafts */}
      <path d="M10 10 L10 26 L14 26 L14 10 Z" fill="currentColor" opacity="0.9"/>
      <path d="M18 10 L18 26 L22 26 L22 10 Z" fill="currentColor" opacity="0.9"/>
      
      {/* Capitals */}
      <rect x="8" y="8" width="6" height="2" rx="1" fill="currentColor"/>
      <rect x="18" y="8" width="6" height="2" rx="1" fill="currentColor"/>
      
      {/* Laurel Crown */}
      <path 
        d="M16 2 Q12 3 10 6 Q11 4 13 3.5 Q14.5 3 16 3 Q17.5 3 19 3.5 Q21 4 22 6 Q20 3 16 2 Z" 
        fill="currentColor"
      />
      <circle cx="16" cy="5" r="2" fill="currentColor"/>
      
      {/* Decorative Dots */}
      <circle cx="12" cy="13" r="0.8" fill="currentColor" opacity="0.5"/>
      <circle cx="20" cy="13" r="0.8" fill="currentColor" opacity="0.5"/>
      <circle cx="12" cy="17" r="0.8" fill="currentColor" opacity="0.5"/>
      <circle cx="20" cy="17" r="0.8" fill="currentColor" opacity="0.5"/>
      <circle cx="12" cy="21" r="0.8" fill="currentColor" opacity="0.5"/>
      <circle cx="20" cy="21" r="0.8" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}
