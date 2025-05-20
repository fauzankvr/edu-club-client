import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import Navbar from "@/components/adminComponet/Navbar";
import Sidebar from "@/components/adminComponet/Sidebar";
import adminApi from "@/API/adminApi";
import toast from "react-hot-toast";

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
      setLanguages(res.data);
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
      setLanguages((prev) => [...prev, res.data]);
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-white">
        <Sidebar />
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

export default LanguageManagement;
