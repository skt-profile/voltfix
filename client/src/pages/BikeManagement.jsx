import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuBike } from "react-icons/lu";
import DashboardLayout from "../components/DashboardLayout.jsx";
import BikeCard from "../components/BikeCard.jsx";
import Modal from "../components/Modal.jsx";
import api from "../api/axios.js";

const emptyForm = {
  brand: "",
  model: "",
  vin: "",
  color: "",
  motorType: "",
  motorPowerWatts: "",
  mileageKm: "",
  purchaseDate: "",
  warrantyExpiresAt: "",
  notes: "",
};

export default function BikeManagement() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadBikes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bikes");
      setBikes(data.bikes);
    } catch (err) {
      toast.error("Couldn't load your bikes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBikes();
  }, []);

  const openAddModal = () => {
    setEditingBike(null);
    setForm(emptyForm);
    setImageFile(null);
    setModalOpen(true);
  };

  const openEditModal = (bike) => {
    setEditingBike(bike);
    setForm({
      brand: bike.brand || "",
      model: bike.model || "",
      vin: bike.vin || "",
      color: bike.color || "",
      motorType: bike.motorType || "",
      motorPowerWatts: bike.motorPowerWatts || "",
      mileageKm: bike.mileageKm || "",
      purchaseDate: bike.purchaseDate ? bike.purchaseDate.slice(0, 10) : "",
      warrantyExpiresAt: bike.warrantyExpiresAt ? bike.warrantyExpiresAt.slice(0, 10) : "",
      notes: bike.notes || "",
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleDelete = async (bike) => {
    if (!confirm(`Delete ${bike.brand} ${bike.model}? This also removes its service history.`)) return;
    try {
      await api.delete(`/bikes/${bike._id}`);
      toast.success("Bike deleted");
      loadBikes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete bike");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "") formData.append(key, value);
      });
      if (imageFile) formData.append("image", imageFile);

      if (editingBike) {
        await api.put(`/bikes/${editingBike._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Bike updated");
      } else {
        await api.post("/bikes", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Bike added");
      }
      setModalOpen(false);
      loadBikes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save bike");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="vf-eyebrow mb-1">Fleet</p>
          <h1 className="font-display text-2xl font-semibold">My Bikes</h1>
        </div>
        <button onClick={openAddModal} className="vf-btn-primary">
          <LuPlus size={16} /> Add bike
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="vf-card h-72 animate-pulse" />
          ))}
        </div>
      ) : bikes.length === 0 ? (
        <div className="vf-card p-10 text-center">
          <LuBike className="mx-auto text-ink-faint mb-4" size={36} />
          <h3 className="font-display text-lg font-semibold mb-1.5">No bikes yet</h3>
          <p className="text-sm text-ink-muted mb-5">Add your first electric bike to get started.</p>
          <button onClick={openAddModal} className="vf-btn-primary inline-flex">
            <LuPlus size={16} /> Add bike
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bikes.map((bike) => (
            <BikeCard key={bike._id} bike={bike} onEdit={openEditModal} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingBike ? "Edit bike" : "Add a bike"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="vf-label">Brand</label>
              <input
                required
                className="vf-input"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Bosch"
              />
            </div>
            <div>
              <label className="vf-label">Model</label>
              <input
                required
                className="vf-input"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="Performance CX"
              />
            </div>
          </div>

          <div>
            <label className="vf-label">VIN</label>
            <input
              required
              className="vf-input"
              value={form.vin}
              onChange={(e) => setForm({ ...form, vin: e.target.value })}
              placeholder="Unique vehicle ID"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="vf-label">Color</label>
              <input
                className="vf-input"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
            <div>
              <label className="vf-label">Motor type</label>
              <input
                className="vf-input"
                value={form.motorType}
                onChange={(e) => setForm({ ...form, motorType: e.target.value })}
                placeholder="Mid-drive"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="vf-label">Motor power (W)</label>
              <input
                type="number"
                className="vf-input"
                value={form.motorPowerWatts}
                onChange={(e) => setForm({ ...form, motorPowerWatts: e.target.value })}
              />
            </div>
            <div>
              <label className="vf-label">Mileage (km)</label>
              <input
                type="number"
                className="vf-input"
                value={form.mileageKm}
                onChange={(e) => setForm({ ...form, mileageKm: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="vf-label">Purchase date</label>
              <input
                type="date"
                className="vf-input"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              />
            </div>
            <div>
              <label className="vf-label">Warranty expires</label>
              <input
                type="date"
                className="vf-input"
                value={form.warrantyExpiresAt}
                onChange={(e) => setForm({ ...form, warrantyExpiresAt: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="vf-label">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="vf-input file:mr-3 file:rounded-md file:border-0 file:bg-base-700 file:text-ink file:px-3 file:py-1.5 file:text-sm"
            />
          </div>

          <div>
            <label className="vf-label">Notes</label>
            <textarea
              className="vf-input min-h-[70px]"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <button type="submit" disabled={saving} className="vf-btn-primary w-full">
            {saving ? "Saving…" : editingBike ? "Save changes" : "Add bike"}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
