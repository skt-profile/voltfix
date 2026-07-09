import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { LuBike, LuGauge, LuBatteryCharging, LuWrench, LuArrowRight } from "react-icons/lu";
import DashboardLayout from "../components/DashboardLayout.jsx";
import StatCard from "../components/StatCard.jsx";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/bikes/summary/dashboard");
        setSummary(data.summary);
      } catch {
        // dashboard shows empty state below if this fails
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = {
    labels: summary?.bikes?.map((b) => `${b.brand} ${b.model}`) || [],
    datasets: [
      {
        label: "Battery health %",
        data: summary?.bikes?.map((b) => b.batteryHealth ?? 0) || [],
        borderColor: "#C8FF3D",
        backgroundColor: "rgba(200,255,61,0.12)",
        pointBackgroundColor: "#C8FF3D",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#8A96A3" }, grid: { color: "rgba(255,255,255,0.04)" } },
      y: {
        min: 0,
        max: 100,
        ticks: { color: "#8A96A3" },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="vf-eyebrow mb-1">Overview</p>
          <h1 className="font-display text-2xl font-semibold">Welcome back, {user?.name?.split(" ")[0]}</h1>
        </div>
        <Link to="/bikes" className="vf-btn-primary hidden sm:inline-flex">
          Add a bike <LuArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="vf-card h-24 animate-pulse" />
          ))}
        </div>
      ) : !summary || summary.totalBikes === 0 ? (
        <div className="vf-card p-10 text-center">
          <LuBike className="mx-auto text-ink-faint mb-4" size={36} />
          <h3 className="font-display text-lg font-semibold mb-1.5">No bikes yet</h3>
          <p className="text-sm text-ink-muted mb-5 max-w-sm mx-auto">
            Add your first e-bike to start tracking mileage, battery health, and service history.
          </p>
          <Link to="/bikes" className="vf-btn-primary inline-flex">
            Add your first bike
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total bikes" value={summary.totalBikes} icon={LuBike} />
            <StatCard label="Total mileage" value={summary.totalMileage.toLocaleString()} unit="km" icon={LuGauge} accent="charge" />
            <StatCard label="Avg. battery health" value="" chargePercent={summary.avgBatteryHealth} />
            <StatCard label="In service" value={summary.inService} icon={LuWrench} accent="charge" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="vf-card p-5 lg:col-span-2">
              <h3 className="font-display font-semibold mb-4">Battery health by bike</h3>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="vf-card p-5">
              <h3 className="font-display font-semibold mb-4">Upcoming service</h3>
              {summary.upcomingServices?.length > 0 ? (
                <ul className="space-y-3">
                  {summary.upcomingServices.map((s) => (
                    <li key={s._id} className="flex items-start gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-warn mt-1.5 shrink-0" />
                      <div>
                        <p className="text-ink font-medium">
                          {s.bike?.brand} {s.bike?.model}
                        </p>
                        <p className="text-ink-muted text-xs">
                          Due {new Date(s.nextDueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-muted">Nothing scheduled. You're all caught up.</p>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
