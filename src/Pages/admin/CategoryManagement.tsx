import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import Navbar from "@/components/adminComponet/Navbar";
import Sidebar from "@/components/adminComponet/Sidebar";
import adminApi from "@/API/adminApi";
import toast from "react-hot-toast";

interface Category {
  _id?: string;
  name: string;
  isDisabled?: boolean;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;
  const totalPages = Math.ceil(categories.length / rowsPerPage);
  const currentRows = categories.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getAllCategories(); // Update this API method
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await adminApi.addCategory({ name: newCategory }); // Update this API method
      setCategories((prev) => [...prev, res.data]);
      setNewCategory("");
      toast.success("Category added successfully");
    } catch (err) {
      console.error("Failed to add category:", err);
      toast.error("Failed to add category");
    }
  };

  const toggleDisable = async (index: number) => {
    const category = categories[index];
    try {
      await adminApi.toggleCategoryStatus(category._id!); // Update this API method
      const updated = [...categories];
      updated[index].isDisabled = !category.isDisabled;
      setCategories(updated);
    } catch (err) {
      console.error("Failed to toggle category:", err);
      toast.error("Action failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-white">
        <Sidebar />
        <div className="flex-1 p-6">
          {/* Add New Category */}
          <div className="mb-6 flex gap-4 items-center">
            <Input
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="max-w-sm"
            />
            <Button
              onClick={handleAddCategory}
              className="bg-indigo-600 text-white"
            >
              Add Category
            </Button>
          </div>

          {/* Category Table */}
          {loading ? (
            <div className="text-center text-gray-500">
              Loading categories...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-b border-gray-200">
                <thead className="text-left bg-gray-50">
                  <tr>
                    <th className="p-3 font-medium text-gray-700">
                      Category Name
                    </th>
                    <th className="p-3 font-medium text-gray-700">Status</th>
                    <th className="p-3 font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((category, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 capitalize">{category.name}</td>
                      <td className="p-3">
                        {category.isDisabled ? "Disabled" : "Active"}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          className={`text-white ${
                            category.isDisabled ? "bg-green-600" : "bg-red-500"
                          } hover:opacity-90`}
                          onClick={() =>
                            toggleDisable(idx + (currentPage - 1) * rowsPerPage)
                          }
                        >
                          {category.isDisabled ? "Enable" : "Disable"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryManagement;
