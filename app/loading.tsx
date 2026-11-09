export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        aria-label="Chargement"
        className="size-8 animate-spin rounded-full border border-brand-blue/20 border-t-brand-blue"
      />
    </div>
  );
}
