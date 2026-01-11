import React, { forwardRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  value?: string;
  error?: boolean;
  hint?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  value,
  defaultValue,
  error = false,
  hint,
  disabled,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  // Determine if we are controlled or uncontrolled
  const isControlled = value !== undefined;
  
  let selectClasses = `h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className} `;

  if (disabled) {
    selectClasses += ` border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:border-gray-700`;
  } else if (error) {
    selectClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:focus:border-error-800`;
  } else {
    selectClasses += ` border-gray-300 bg-transparent focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800`;
  }

  // Text color logic
  const currentValue = isControlled ? value : defaultValue;
  const hasValue = currentValue !== "" && currentValue !== undefined;
  
  selectClasses += hasValue 
    ? " text-gray-800 dark:text-white/90" 
    : " text-gray-400 dark:text-gray-400";

  return (
    <div className="relative">
      <select
        ref={ref}
        className={selectClasses}
        value={currentValue}
        defaultValue={!isControlled ? defaultValue : undefined}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      >
        <option value="" disabled className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>
      
      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
        <svg
          className="stroke-current"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
