import React from 'react';
import SARWhite from '../../SAR/SAR_White.png';
import SARBlack from '../../SAR/SAR_Black.png';

interface CurrencyIconProps {
  className?: string;
  theme?: 'dark' | 'light';
  style?: React.CSSProperties;
}

export default function CurrencyIcon({ className = "w-auto object-contain mx-1", theme = "light", style }: CurrencyIconProps) {
  const isDarkThemeContext = document.documentElement.classList.contains('dark') || theme === 'dark';
  
  const src = isDarkThemeContext ? SARWhite : SARBlack;

  return (
    <img 
      src={src} 
      alt="SAR" 
      className={`inline-block align-middle ${className}`}
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle', 
        height: '1.15em', 
        ...style 
      }}
    />
  );
}

