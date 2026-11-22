export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`text-xl font-bold tracking-tight ${className}`}>
      repbook<span className="text-orange">.</span>
    </span>
  );
}
