
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 rounded-2xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]',
    secondary: 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:border-slate-600',
    danger: 'bg-rose-500 text-white hover:bg-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]',
    success: 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    ghost: 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
