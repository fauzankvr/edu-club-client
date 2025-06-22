import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import Navbar from "@/components/adminComponet/Navbar";
import Sidebar from "@/components/adminComponet/Sidebar";
import adminApi from "@/API/adminApi";

interface Teacher {
  fullName: string;
  email: string;
  phone?: string;
  isBlocked: boolean;
}

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const totalPages = Math.ceil(teachers.length / rowsPerPage);
  const currentRows = teachers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await adminApi.getAllTeachers(); 
        setTeachers(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  const toggleBlock = async (index: number) => {
    const teacher = teachers[index];
    try {
      await adminApi.blockTeacher( teacher.email )
      const updatedTeachers = [...teachers];
      updatedTeachers[index].isBlocked = !teacher.isBlocked;
      setTeachers(updatedTeachers);
    } catch (error) {
      console.error("Failed to toggle block:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-white">
        <Sidebar />
        <div className="flex-1 p-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Input
                placeholder="Search..."
                className="pl-10 border-indigo-300 focus:ring-indigo-500"
              />
              <Icon
                icon="mdi:magnify"
                className="absolute left-3 top-2.5 text-xl text-gray-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-b border-gray-200">
              <thead className="text-left bg-gray-50">
                <tr>
                  <th className="p-3 font-medium text-gray-700">Name</th>
                  <th className="p-3 font-medium text-gray-700">Email</th>
                  <th className="p-3 font-medium text-gray-700">Phone</th>
                  <th className="p-3 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((teacher, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">{teacher.fullName}</td>
                    <td className="p-3">{teacher.email}</td>
                    <td className="p-3">{teacher.phone ?? "N/A"}</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        className={`text-white ${
                          teacher.isBlocked ? "bg-blue-600" : "bg-yellow-500"
                        } hover:opacity-90`}
                        onClick={() =>
                          toggleBlock(idx + (currentPage - 1) * rowsPerPage)
                        }
                      >
                        {teacher.isBlocked ? "Unblock" : "Block"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2"
            >
              <Icon icon="mdi:chevron-left" className="text-lg" />
            </Button>

            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                size="sm"
                variant={currentPage === index + 1 ? "default" : "outline"}
                className={`rounded ${
                  currentPage === index + 1 ? "bg-indigo-600 text-white" : ""
                }`}
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
              className="px-2"
            >
              <Icon icon="mdi:chevron-right" className="text-lg" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherManagement;
