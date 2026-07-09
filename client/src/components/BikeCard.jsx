import { motion } from "framer-motion";
import { LuBike, LuGauge, LuBatteryCharging, LuPencil, LuTrash2 } from "react-icons/lu";
import { Link } from "react-router-dom";

const statusStyles = {
  active: "bg-ok/10 text-ok",
  in_service: "bg-warn/10 text-warn",
  retired: "bg-ink-faint/10 text-ink-faint",
};

const statusLabels = {
  active: "Active",
  in_service: "In Service",
  retired: "Retired",
};

export default function BikeCard({ bike, onEdit, onDelete }) {
  const health = bike.battery?.lastPrediction?.healthPercent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="vf-card overflow-hidden group"
    >
      <div className="h-36 bg-base-700 relative overflow-hidden">
        {bike.imageUrl ? (
          <img src={bike.imageUrl} alt={`${bike.brand} ${bike.model}`} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-ink-faint">
            <LuBike size={40} />
          </div>
        )}
        <span
          className={`absolute top-3 right-3 vf-badge ${statusStyles[bike.status] || statusStyles.active}`}
        >
          {statusLabels[bike.status] || "Active"}
        </span>
      </div>

      <div className="p-4">
        <Link to={`/bikes/${bike._id}`} className="hover:text-volt-500 transition-colors">
          <h3 className="font-display font-semibold text-lg leading-tight">
            {bike.brand} {bike.model}
          </h3>
        </Link>
        <p className="text-xs text-ink-faint font-mono mt-0.5">VIN {bike.vin}</p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <LuGauge size={15} className="text-charge-400" />
            {bike.mileageKm?.toLocaleString() || 0} km
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <LuBatteryCharging size={15} className="text-volt-500" />
            {health != null ? `${health}%` : "—"}
          </div>
        </div>

        <div className="vf-trace my-4" />

        <div className="flex items-center justify-between">
          <Link to={`/bikes/${bike._id}`} className="text-sm text-charge-400 hover:text-charge-300 font-medium">
            View details →
          </Link>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(bike)}
              className="h-8 w-8 flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-white/5"
              aria-label="Edit bike"
            >
              <LuPencil size={14} />
            </button>
            <button
              onClick={() => onDelete(bike)}
              className="h-8 w-8 flex items-center justify-center rounded-md text-ink-muted hover:text-danger hover:bg-danger/10"
              aria-label="Delete bike"
            >
              <LuTrash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
