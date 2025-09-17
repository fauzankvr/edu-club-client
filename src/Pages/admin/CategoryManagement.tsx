import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/adminComponet/Navbar";
import Sidebar from "@/components/adminComponet/Sidebar";
import adminApi from "@/API/adminApi";
import toast, { Toaster } from "react-hot-toast";
import Pagination from "@/components/adminComponet/pagination";


interface Category {
  id?: string;
  name: string;
  isBlocked?: boolean;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Category>({ name: "" });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const limit = 10;
      const res = await adminApi.getAllCategories(currentPage, limit);
      setCategories(res.data.data.result);
      setTotalPages(res.data.data.pages);
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
      setCategories((prev) => [...prev, res.data.data]);
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
      await adminApi.toggleCategoryStatus(category.id!); // Update this API method
      const updated = [...categories];
      updated[index].isBlocked = !category.isBlocked;
      setCategories(updated);
    } catch (err) {
      console.error("Failed to toggle category:", err);
      toast.error("Action failed");
    }
  };
  const handleEdit = (category: Category) => {
    setEditData(category);
    setIsEditModalOpen(true);
  };
  
  const handleUpdateCategory = async () => {
    if (!editData.name.trim() || !editData.id) return;

    try {
      await adminApi.updateCategory(editData.id, { name: editData.name });
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editData.id ? { ...cat, name: editData.name } : cat
        )
      );
      toast.success("Category updated");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update category");
    }
  };
  

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-white">
        <Sidebar />
        <Toaster />
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
                  {categories.map((category, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 capitalize">{category.name}</td>
                      <td className="p-3">
                        {category.isBlocked ? "Disabled" : "Active"}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          className={`text-white ${
                            category.isBlocked ? "bg-green-600" : "bg-red-500"
                          } hover:opacity-90`}
                          onClick={() =>
                            toggleDisable(idx + (currentPage - 1) )
                          }
                        >
                          {category.isBlocked ? "Enable" : "Disable"}
                        </Button>
                        <Button
                          size="sm"
                          className="ml-3 bg-yellow-500 text-white hover:opacity-90"
                          onClick={() => handleEdit(category)}
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

          {/* Pagination */}
          {!loading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      </div>
      {isEditModalOpen && (
        <div className="fixed inset-0  backdrop-blur-xs z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Category</h2>

            <Input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              placeholder="Category name"
              className="mb-4"
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCategory}
                className="bg-indigo-600 text-white"
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryManagement;
