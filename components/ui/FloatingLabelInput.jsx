'use client';

import React from 'react';

const FloatingLabelInput = ({ id, name, type = 'text', value, onChange, label, required = false, as = 'input', ...props }) => {
  const InputComponent = as;

  return (
    <div className="relative">
      <InputComponent
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={label}
        {...props}
        className={`
          peer w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
          focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500
          placeholder-transparent 
          transition-all
          ${as === 'textarea' ? 'min-h-[100px] resize-none' : ''}
        `}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-500
          transition-all duration-200 ease-in-out
          peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
          peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-orange-600
        `}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingLabelInput;