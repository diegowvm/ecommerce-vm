import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "h-8 w-auto", width = 120, height = 32 }: LogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 120 32" 
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* EXEMPLO - Substitua pelo seu SVG real */}
      <text 
        x="10" 
        y="22" 
        className="text-2xl font-bold gradient-text fill-current"
        style={{ fontSize: '20px', fontWeight: 'bold' }}
      >
        XEGAI OUTLET
      </text>
      
      {/* Adicione aqui o conteúdo real do seu SVG */}
      {/* Exemplo de como seria um SVG customizado:
      <path 
        d="M10 5 L30 5 L30 25 L10 25 Z" 
        fill="url(#gradient)"
        stroke="currentColor"
        strokeWidth="2"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(220 100% 60%)' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(270 60% 50%)' }} />
        </linearGradient>
      </defs>
      */}
    </svg>
  );
} 