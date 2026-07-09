import { LuHammer } from "react-icons/lu";
import DashboardLayout from "../components/DashboardLayout.jsx";

export default function ComingSoon({ title, description }) {
  return (
    <DashboardLayout>
      <div className="vf-card p-10 text-center max-w-lg mx-auto mt-10">
        <div className="h-12 w-12 rounded-full bg-volt-500/10 text-volt-500 flex items-center justify-center mx-auto mb-4">
          <LuHammer size={22} />
        </div>
        <h1 className="font-display text-xl font-semibold mb-2">{title}</h1>
        <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
      </div>
    </DashboardLayout>
  );
}
