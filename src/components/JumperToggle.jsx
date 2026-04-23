export default function JumperToggle({ value, onChange, ariaLabel }) {
  return (
    <div
      className="seg"
      role="group"
      aria-label={ariaLabel || 'Jumper or non-jumper'}
    >
      <button
        type="button"
        className="seg-btn"
        aria-pressed={value === true}
        onClick={() => onChange(true)}
      >
        <span aria-hidden="true">🦘</span> Jumper
      </button>
      <button
        type="button"
        className="seg-btn"
        aria-pressed={value === false}
        onClick={() => onChange(false)}
      >
        Non-jumper
      </button>
    </div>
  );
}
