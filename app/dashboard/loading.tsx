/** Chargement d'une page du dashboard : le verre respire, un reflet le traverse. */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-label="Chargement">
      <div className="space-y-3">
        <div className="lk-skeleton h-3 w-40 rounded-full" />
        <div className="lk-skeleton h-9 w-72 rounded-xl" />
      </div>
      <div className="lk-skeleton h-[52vh] min-h-[360px] rounded-[28px]" />
      <div className="grid gap-6 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="lk-skeleton h-64 rounded-3xl" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </div>
  );
}
