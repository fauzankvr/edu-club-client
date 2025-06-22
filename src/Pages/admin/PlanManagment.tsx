import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import Navbar from "@/components/adminComponet/Navbar";
import Sidebar from "@/components/adminComponet/Sidebar";
import adminApi from "@/API/adminApi";
import toast, { Toaster } from "react-hot-toast";

interface Feature {
  description: string;
  icon: string;
  isAvailable: boolean;
}

export interface Plan {
  _id?: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: Feature[];
  isFeatured: boolean;
  isBlocked?: boolean;
}

const PlanManagement = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [newPlan, setNewPlan] = useState<Plan>({
    name: "",
    price: 0,
    billingPeriod: "month",
    features: [],
    isFeatured: false,
  });
  const [newFeature, setNewFeature] = useState({ description: "", icon: "" });

  const rowsPerPage = 5;
  const totalPages = Math.ceil(plans.length / rowsPerPage);
  const currentRows = plans.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await adminApi.getAllPlans();
      setPlans(res.data.data);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.description || !newFeature.icon) return;
    setNewPlan({
      ...newPlan,
      features: [...newPlan.features, { ...newFeature, isAvailable: true }],
    });
    setNewFeature({ description: "", icon: "" });
  };

  const handleAddPlan = async () => {
    if (!newPlan.name || newPlan.price < 0 || !newPlan.billingPeriod) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const res = await adminApi.addPlan(newPlan);
      setPlans((prev) => [...prev, res.data.data]);
      setNewPlan({
        name: "",
        price: 0,
        billingPeriod: "month",
        features: [],
        isFeatured: false,
      });
      setIsModalOpen(false);
      toast.success("Plan added successfully");
    } catch (err) {
      console.error("Failed to add plan:", err);
      toast.error("Failed to add plan");
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditPlan(plan);
    setNewPlan(plan);
    setIsModalOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (
      !editPlan ||
      !newPlan.name ||
      newPlan.price < 0 ||
      !newPlan.billingPeriod
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await adminApi.updatePlan(editPlan._id!, newPlan);
      setPlans((prev) =>
        prev.map((plan) =>
          plan._id === editPlan._id ? { ...plan, ...newPlan } : plan
        )
      );
      setIsModalOpen(false);
      setEditPlan(null);
      setNewPlan({
        name: "",
        price: 0,
        billingPeriod: "month",
        features: [],
        isFeatured: false,
      });
      toast.success("Plan updated successfully");
    } catch (err) {
      console.error("Failed to update plan:", err);
      toast.error("Failed to update plan");
    }
  };

  const toggleDisable = async (index: number) => {
    const plan = plans[index];
    try {
      await adminApi.togglePlanStatus(plan._id!);
      const updated = [...plans];
      updated[index].isBlocked = !plan.isBlocked;
      setPlans(updated);
      toast.success(
        `Plan ${plan.isBlocked ? "enabled" : "disabled"} successfully`
      );
    } catch (err) {
      console.error("Failed to toggle plan:", err);
      toast.error("Action failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-white">
        <Sidebar />
        <Toaster />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <Button
              onClick={() => {
                setEditPlan(null);
                setNewPlan({
                  name: "",
                  price: 0,
                  billingPeriod: "month",
                  features: [],
                  isFeatured: false,
                });
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 text-white"
            >
              Create New Plan
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500">Loading plans...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-b border-gray-200">
                <thead className="text-left bg-gray-50">
                  <tr>
                    <th className="p-3 font-medium text-gray-700">Plan Name</th>
                    <th className="p-3 font-medium text-gray-700">Price</th>
                    <th className="p-3 font-medium text-gray-700">
                      Billing Period
                    </th>
                    <th className="p-3 font-medium text-gray-700">Featured</th>
                    <th className="p-3 font-medium text-gray-700">Status</th>
                    <th className="p-3 font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((plan, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 capitalize">{plan.name}</td>
                      <td className="p-3">₹{plan.price}</td>
                      <td className="p-3 capitalize">{plan.billingPeriod}</td>
                      <td className="p-3">{plan.isFeatured ? "Yes" : "No"}</td>
                      <td className="p-3">
                        {plan.isBlocked ? "Disabled" : "Active"}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          className={`text-white ${
                            plan.isBlocked ? "bg-green-600" : "bg-red-500"
                          } hover:opacity-90`}
                          onClick={() =>
                            toggleDisable(idx + (currentPage - 1) * rowsPerPage)
                          }
                        >
                          {plan.isBlocked ? "Enable" : "Disable"}
                        </Button>
                        <Button
                          size="sm"
                          className="ml-3 bg-yellow-500 text-white hover:opacity-90"
                          onClick={() => handleEditPlan(plan)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <Icon icon="mdi:chevron-left" className="text-lg" />
            </Button>
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                size="sm"
                variant={currentPage === index + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
            <Button
              variant="ghost"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <Icon icon="mdi:chevron-right" className="text-lg" />
            </Button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editPlan ? "Edit Plan" : "Create New Plan"}
            </h2>
            <Input
              placeholder="Plan name"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              className="mb-4"
            />
            <Input
              type="number"
              placeholder="Price"
              value={newPlan.price}
              onChange={(e) =>
                setNewPlan({ ...newPlan, price: Number(e.target.value) })
              }
              className="mb-4"
            />
            <select
              value={newPlan.billingPeriod}
              onChange={(e) =>
                setNewPlan({ ...newPlan, billingPeriod: e.target.value })
              }
              className="mb-4 w-full border rounded p-2"
            >
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="forever">Forever</option>
            </select>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Feature description"
                value={newFeature.description}
                onChange={(e) =>
                  setNewFeature({ ...newFeature, description: e.target.value })
                }
              />
              <Input
                placeholder="Icon (e.g., mdi:video)"
                value={newFeature.icon}
                onChange={(e) =>
                  setNewFeature({ ...newFeature, icon: e.target.value })
                }
              />
              <Button
                onClick={handleAddFeature}
                className="bg-indigo-600 text-white"
              >
                Add Feature
              </Button>
            </div>
            <div className="mb-4">
              {newPlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Icon icon={feature.icon} className="text-lg" />
                  <span>{feature.description}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setNewPlan({
                        ...newPlan,
                        features: newPlan.features.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={newPlan.isFeatured}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, isFeatured: e.target.checked })
                }
              />
              Featured Plan
            </label>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={editPlan ? handleUpdatePlan : handleAddPlan}
                className="bg-indigo-600 text-white"
              >
                {editPlan ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlanManagement;
