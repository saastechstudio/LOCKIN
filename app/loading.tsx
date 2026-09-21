export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        aria-label="Chargement"
        className="size-8 animate-spin rounded-full border-2 border-brand-blue/20 border-t-brand-blue"
      />
    </div>
  );
}
