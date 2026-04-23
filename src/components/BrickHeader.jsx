export default function BrickHeader({ color, studColor }) {
  return (
    <div
      className="w-full flex items-center justify-around px-6"
      style={{ backgroundColor: color, height: 56 }}
      aria-hidden="true"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="brick-stud"
          style={{ backgroundColor: studColor }}
        />
      ))}
    </div>
  );
}
