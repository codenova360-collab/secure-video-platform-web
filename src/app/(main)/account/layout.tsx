import { SettingsNav } from "./settings-nav";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 mini:flex-row mini:gap-10">
      <aside className="mini:w-56 mini:shrink-0">
        <h1 className="mb-3 px-3 text-xl font-medium">Settings</h1>
        <SettingsNav />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
