import React from 'react';

interface InputProps {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  name?: string;
  id?: string;
}

export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
  name,
  id,
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${className}`}
      required={required}
      name={name}
      id={id}
    />
  );
}