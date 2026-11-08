/**
 * Un template est recréé à chaque navigation : la page qui arrive se pose
 * avec un fondu, un flou qui se dissipe et un glissement de 10 px.
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="lk-page">{children}</div>;
}
