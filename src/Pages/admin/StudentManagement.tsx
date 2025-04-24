import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import Navbar from "@/components/adminComponet/Navbar";
import Sidebar from "@/components/adminComponet/Sidebar";
import adminApi from "@/API/adminApi";

interface Student {
  email: string;
  isBlocked: boolean;
  firstName?: string;
  lastName?: string;
  phone?: number | null;
};

const StudentManagemnt = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const rowsPerPage = 5;
  const totalPages = Math.ceil((students?.length || 0) / rowsPerPage);
  const currentRows = students.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await adminApi.findStudentDatas();
        console.log("API Response:", res.data);
        // Adjust based on response format
        setStudents(res.data.studentsData || res.data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const toggleBlock = async (index: number) => {
    const student = students[index];
    try {
      await adminApi.blockStudent(student.email);
      const updatedStudents = [...students];
      updatedStudents[index].isBlocked = !updatedStudents[index].isBlocked;
      setStudents(updatedStudents);
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

          {/* Table or Loader */}
          {loading ? (
            <div className="text-center text-gray-500">Loading students...</div>
          ) : (
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
                  {currentRows.map((student, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3">{`${student.firstName ?? ""} ${
                        student.lastName ?? ""
                      }`}</td>
                      <td className="p-3">{student.email}</td>
                      <td className="p-3">{student.phone ?? "N/A"}</td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          className={`text-white ${
                            student.isBlocked ? "bg-blue-600" : "bg-yellow-500"
                          } hover:opacity-90`}
                          onClick={() =>
                            toggleBlock(idx + (currentPage - 1) * rowsPerPage)
                          }
                        >
                          {student.isBlocked ? "Unblock" : "Block"}
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
          )}
        </div>
      </div>
    </>
  );
};

export default StudentManagemnt;
