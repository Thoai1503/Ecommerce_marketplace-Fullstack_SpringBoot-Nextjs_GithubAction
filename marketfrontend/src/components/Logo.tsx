import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'user' | 'seller' | 'admin' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 40, 
  variant = 'user' 
}) => {
  // Define colors based on portal type
  const colors = {
    user: 'text-sky-600',
    seller: 'text-blue-700',
    admin: 'text-slate-900',
    white: 'text-white'
  };

  const activeColor = colors[variant];

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${activeColor} ${className}`}
    >
      {/* Outer Ring / Hub connectivity points */}
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" opacity="0.3" />
      
      {/* Central Hub Circles */}
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Connection Nodes */}
      <circle cx="50" cy="12" r="4" fill="currentColor" />
      <circle cx="88" cy="50" r="4" fill="currentColor" />
      <circle cx="50" cy="88" r="4" fill="currentColor" />
      <circle cx="12" cy="50" r="4" fill="currentColor" />
      
      {/* The Styled "V" */}
      <path 
        d="M30 35L50 75L70 35" 
        stroke="currentColor" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Accent Node in the center of the V */}
      <circle cx="50" cy="50" r="6" fill="white" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

export default Logo;
