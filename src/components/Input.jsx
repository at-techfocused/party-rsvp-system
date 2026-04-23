import { useId } from 'react';

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  autoComplete,
  inputMode,
  name,
  as = 'input',
  rows = 3,
}) {
  const id = useId();
  const commonProps = {
    id,
    name,
    value,
    onChange: (e) => onChange(e.target.value),
    placeholder,
    required,
    autoComplete,
    className: 'brick-input',
  };

  return (
    <div>
      {label && (
        <label className="brick-label" htmlFor={id}>
          {label}
          {required && <span aria-hidden="true" className="text-lego-red"> *</span>}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input {...commonProps} type={type} inputMode={inputMode} />
      )}
    </div>
  );
}
