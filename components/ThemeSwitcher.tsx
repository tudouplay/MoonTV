'use client';

import { useTheme } from '@/app/theme-provider';
import { useState } from 'react';
import { FaSun, FaMoon, FaPalette, FaLeaf } from 'react-icons/fa';

const themeOptions = [
  { value: 'default', icon: <FaSun className="h-5 w-5" />, label: '默认主题' },
  { value: 'dark', icon: <FaMoon className="h-5 w-5" />, label: '深色主题' },
  { value: 'vibrant', icon: <FaPalette className="h-5 w-5" />, label: '活力主题' },
  { value: 'minimal', icon: <FaLeaf className="h-5 w-5" />, label: '极简主题' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
        aria-label="切换主题"
      >
        {themeOptions.find(opt => opt.value === theme)?.icon}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value as any);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-accent ${
                  theme === option.value ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
