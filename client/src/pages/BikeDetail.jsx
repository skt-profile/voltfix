import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LuArrowLeft, LuBike, LuCalendar, LuShield, LuHistory } from "react-icons/lu";
import DashboardLayout from "../components/DashboardLayout.jsx";
import StatCard from "../components/StatCard.jsx";
import api from "../api/axios.js";

export default function BikeDetail() {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/bikes/${id}`);
        setBike(data.bike);
        setServiceHistory(data.serviceHistory || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="vf-card h-48 animate-pulse" />
      </DashboardLayout>
    );
  }

  if (!bike) {
    return (
      <DashboardLayout>
        <p className="text-ink-muted">Bike not found.</p>
      </DashboardLayout>
    );
  }

  const health = bike.battery?.lastPrediction?.healthPercent;

  return (
    <DashboardLayout>
      <Link to="/bikes" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-5">
        <LuArrowLeft size={15} /> Back to bikes
      </Link>

      <div className="vf-card overflow-hidden mb-6">
        <div className="h-48 bg-base-700 relative">
          {bike.imageUrl ? (
            <img src={bike.imageUrl} alt={`${bike.brand} ${bike.model}`} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-ink-faint">
              <LuBike size={48} />
            </div>
          )}
        </div>
        <div className="p-6">
          <p className="vf-eyebrow mb-1">{bike.status?.replace("_", " ").toUpperCase()}</p>
          <h1 className="font-display text-2xl font-semibold">
            {bike.brand} {bike.model}
          </h1>
          <p className="text-sm text-ink-faint font-mono mt-1">VIN {bike.vin}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Mileage" value={bike.mileageKm?.toLocaleString() || 0} unit="km" icon={LuHistory} accent="charge" />
        <StatCard label="Battery health" value="" chargePercent={health ?? 0} />
        <div className="vf-card p-5">
          <p className="text-xs uppercase tracking-wider text-ink-muted font-mono mb-3">Ownership</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-ink-muted">
              <LuCalendar size={14} />
              Purchased {bike.purchaseDate ? new Date(bike.purchaseDate).toLocaleDateString() : "—"}
            </div>
            <div className="flex items-center gap-2 text-ink-muted">
              <LuShield size={14} />
              Warranty until {bike.warrantyExpiresAt ? new Date(bike.warrantyExpiresAt).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>
      </div>

      {bike.notes && (
        <div className="vf-card p-5 mb-6">
          <p className="text-xs uppercase tracking-wider text-ink-muted font-mono mb-2">Notes</p>
          <p className="text-sm text-ink leading-relaxed">{bike.notes}</p>
        </div>
      )}

      <div className="vf-card p-5">
        <h3 className="font-display font-semibold mb-4">Service history</h3>
        {serviceHistory.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No service records yet. Service logging is coming in the next phase of the build.
          </p>
        ) : (
          <ul className="space-y-3">
            {serviceHistory.map((s) => (
              <li key={s._id} className="vf-trace pt-4 first:pt-0 first:before:hidden">
                <p className="text-sm font-medium text-ink">{s.description}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {new Date(s.serviceDate).toLocaleDateString()} · {s.serviceType} · ₹{s.cost}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
