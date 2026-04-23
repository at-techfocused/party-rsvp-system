const VARIANTS = {
  green: 'brick-btn brick-btn--green',
  red: 'brick-btn brick-btn--red',
  blue: 'brick-btn brick-btn--blue',
  yellow: 'brick-btn brick-btn--yellow',
  outline: 'brick-btn brick-btn--outline',
};

export default function BrickButton({
  color = 'blue',
  type = 'button',
  onClick,
  disabled,
  children,
  as = 'button',
  href,
  target,
  rel,
}) {
  const className = VARIANTS[color] || VARIANTS.blue;

  if (as === 'a') {
    return (
      <a
        className={className}
        href={href}
        target={target}
        rel={rel}
        role="button"
      >
        {children}
      </a>
    );
  }

  return (
    <button className={className} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
