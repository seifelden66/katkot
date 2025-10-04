import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  asChild?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  asChild = false,
}: ButtonProps) {
  const baseStyles = 'rounded-full font-medium transition-colors';
  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
  };
  const sizeStyles = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base',
  };
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  const Comp = (asChild ? 'div' : 'button') as React.ElementType;
  return (
    <Comp
      type={asChild ? undefined : type}
      onClick={onClick}
      className={styles}
      disabled={asChild ? undefined : disabled}
    >
      {children}
    </Comp>
  );
}