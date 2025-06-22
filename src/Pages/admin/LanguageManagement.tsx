import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import Navbar from "@/components/adminComponet/Navbar";
import Sidebar from "@/components/adminComponet/Sidebar";
import adminApi from "@/API/adminApi";
import toast, { Toaster } from "react-hot-toast";

interface Language {
  _id?: string;
  name: string;
  isBlocked?: boolean;
}

const LanguageManagement = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editData, setEditData] = useState<Language>({name:""})
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const rowsPerPage = 5;
  const totalPages = Math.ceil(languages.length / rowsPerPage);
  const currentRows = languages.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
        const res = await adminApi.getAllLanguages();
      setLanguages(res.data.data);
    } catch (err) {
      console.error("Failed to fetch languages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;
    try {
      const res = await adminApi.addLanguage({ name: newLanguage });
      setLanguages((prev) => [...prev, res.data.data]);
      setNewLanguage("");
      toast.success("Language added successfully");
    } catch (err) {
      console.error("Failed to add language:", err);
      toast.error("Failed to add language");
    }
  };

  const toggleBlock = async (index: number) => {
    const language = languages[index];
    try {
      await adminApi.toggleLanguageStatus(language._id!);
      const updated = [...languages];
      updated[index].isBlocked = !language.isBlocked;
      setLanguages(updated);
    } catch (err) {
      console.error("Failed to toggle language status:", err);
      toast.error("Action failed");
    }
  };
  const handleEdit = (language: Language) => {
    setEditData(language);
    setIsEditModalOpen(true);
  };
    const handleUpdateLanguage = async () => {
      if (!editData.name.trim() || !editData._id) return;
  
      try {
        await adminApi.updateLanguage(editData._id, { name: editData.name });
        setLanguages((prev) =>
          prev.map((cat) =>
            cat._id === editData._id ? { ...cat, name: editData.name } : cat
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
        <Toaster/>
        <div className="flex-1 p-6">
          {/* Add New Language */}
          <div className="mb-6 flex gap-4 items-center">
            <Input
              placeholder="Enter new language"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="max-w-sm"
            />
            <Button
              onClick={handleAddLanguage}
              className="bg-indigo-600 text-white"
            >
              Add Language
            </Button>
          </div>

          {/* Language Table */}
          {loading ? (
            <div className="text-center text-gray-500">
              Loading languages...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-b border-gray-200">
                <thead className="text-left bg-gray-50">
                  <tr>
                    <th className="p-3 font-medium text-gray-700">
                      Language Name
                    </th>
                    <th className="p-3 font-medium text-gray-700">Status</th>
                    <th className="p-3 font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((language, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 capitalize">{language.name}</td>
                      <td className="p-3">
                        {language.isBlocked ? "Blocked" : "Active"}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          className={`text-white ${
                            language.isBlocked ? "bg-green-600" : "bg-red-500"
                          } hover:opacity-90`}
                          onClick={() =>
                            toggleBlock(idx + (currentPage - 1) * rowsPerPage)
                          }
                        >
                          {language.isBlocked ? "Unblock" : "Block"}
                        </Button>
                         <Button
                          size="sm"
                          className="ml-3 bg-yellow-500 text-white hover:opacity-90"
                          onClick={() => handleEdit(language)}
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
                      onClick={handleUpdateLanguage}
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

export default LanguageManagement;
