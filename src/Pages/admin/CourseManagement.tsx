import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import Navbar from "@/components/adminComponet/Navbar";
import Sidebar from "@/components/adminComponet/Sidebar";
import adminApi from "@/API/adminApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Instructor {
    _id: string;
    email: string;
    name: string;
    profileImage?: string;
}
  
interface Course {
  _id: string;
  title: string;
  category: string;
  instructor: Instructor;
  isBlocked: boolean;
  description: string;
  language: string;
  courseImageId?: string;
  points: string[];
  price: number;
  discount?: string;
  students: string[];
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const rowsPerPage = 5;
  const totalPages = Math.ceil((courses?.length || 0) / rowsPerPage);
  const currentRows = courses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
          const res = await adminApi.findCourseDatas();
          console.log("Fetched courses:", res.data.data.courses);
        setCourses(res.data.data.courses);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const toggleBlock = async (index: number) => {
    const course = courses[index];
    try {
      await adminApi.blockCourse(course._id);
      const updatedCourses = [...courses];
      updatedCourses[index].isBlocked = !updatedCourses[index].isBlocked;
      setCourses(updatedCourses);
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
            <div className="text-center text-gray-500">Loading courses...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-b border-gray-200">
                <thead className="text-left bg-gray-50">
                  <tr>
                    <th className="p-3 font-medium text-gray-700">Name</th>
                    <th className="p-3 font-medium text-gray-700">Category</th>
                    <th className="p-3 font-medium text-gray-700">
                      Instructor
                    </th>
                    <th className="p-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((course, idx) => (
                    <tr key={course._id} className="border-t">
                      <td className="p-3">{course.title}</td>
                      <td className="p-3">{course.category}</td>
                      <td className="p-3">
                        {course.instructor?.name ?? "N/A"}
                      </td>
                      <td className="p-3 flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedCourse(course)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          {selectedCourse && (
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>
                                  {selectedCourse.title}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div>
                                  <strong>Description:</strong>{" "}
                                  {selectedCourse.description}
                                </div>
                                <div>
                                  <strong>Category:</strong>{" "}
                                  {selectedCourse.category}
                                </div>
                                <div>
                                  <strong>Instructor:</strong>{" "}
                                  {selectedCourse?.instructor?.name ?? "N/A"}
                                </div>
                                <div>
                                  <strong>Language:</strong>{" "}
                                  {selectedCourse.language}
                                </div>
                                <div>
                                  <strong>Price:</strong> $
                                  {selectedCourse.price}
                                </div>
                                <div>
                                  <strong>Discount:</strong>{" "}
                                  {selectedCourse.discount || "None"}
                                </div>
                                <div>
                                  <strong>Points:</strong>
                                  <ul className="list-disc pl-5">
                                    {selectedCourse.points.map((point, i) => (
                                      <li key={i}>{point}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <strong>Students Enrolled:</strong>{" "}
                                  {selectedCourse.students.length}
                                </div>
                                {selectedCourse.courseImageId && (
                                  <div>
                                    <strong>Image:</strong> Image Available
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                        <Button
                          size="sm"
                          className={`text-white ${
                            course.isBlocked ? "bg-blue-600" : "bg-yellow-500"
                          } hover:opacity-90`}
                          onClick={() =>
                            toggleBlock(idx + (currentPage - 1) * rowsPerPage)
                          }
                        >
                          {course.isBlocked ? "Unblock" : "Block"}
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

export default CourseManagement;
