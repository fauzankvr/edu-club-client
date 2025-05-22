import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/InstructorCompontents/Navbar";
import Footer from "@/components/InstructorCompontents/Footer";
import Sidebar from "./Sidbar";
import courseDummy from "@/assets/instructor/couse_dummy.jpg";
import { useNavigate } from "react-router-dom";
import instructorAPI from "@/API/InstructorApi";

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await instructorAPI.getAllCourses();
        console.log(response,'tihs isresp')
        setCourses(response.data.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };

    fetchCourses();
  }, []);
  // const imageUrl = import.meta.env.VITE_BASE_URL

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar />
        <div className="flex-1 p-4">
          <h1 className="text-center text-xl font-semibold mb-12">Courses</h1>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <Button className="bg-indigo-500 text-white flex items-center gap-2">
              Sort By <ChevronDown size={16} />
            </Button>
            <Input
              className="w-full md:w-1/2 border px-4 py-2 rounded-xl"
              placeholder="Search your course.................."
            />
          </div>

          {/* Promo Card */}
          <Card className="mb-4">
            <CardContent className="flex flex-col md:flex-row items-center p-4 gap-4">
              <img
                src={courseDummy}
                alt="Course"
                className="w-35 h-35 object-contain mr-6"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  Create an Engaging Course
                </h3>
                <p className="text-sm text-gray-600">
                  Whether you’re a seasoned educator or teaching for the first
                  time, you can create an engaging course. We’ve gathered expert
                  resources and best practices to help you level up.
                </p>
                <Button
                  className="mt-2 bg-indigo-500"
                  onClick={() =>
                    navigate("/instructor/dashboard/courses/landingpage")
                  }
                >
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Course Cards */}
          {courses.map((course: any) => (
            <Card key={course._id} className="mb-4">
              <CardContent className="flex flex-col md:flex-row p-4 gap-4">
                <img
                  src={
                    course.courseImageId
                      ? course.courseImageId
                      : "/images/seo-course.png"
                  }
                  alt={course.title}
                  className="w-full md:w-48 rounded-xl"
                />

                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">{course.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
                    <span>Lesson {course.totalLectures || 0}</span>
                    <span>{course.duration || "0h"}</span>
                    <span>Students {course.students?.length || 0}</span>
                  </div>
                  {/* <div className="flex items-center gap-2 text-sm">
                    <img
                      src={
                        course.instructor?.image || "/images/default-user.png"
                      }
                      alt={course.instructor?.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{course.instructor?.name || "Unknown"}</span>
                  </div> */}
                </div>
                <div className="text-right">
                  {/* {course.discount && (
                    <p className="text-gray-400 line-through">
                      ₹{course.discount}
                    </p>
                  )} */}
                  <p className="text-lg text-indigo-600 font-bold">
                    ₹{course.price}
                  </p>
                  <Button
                    className="mt-2 bg-indigo-500"
                    onClick={() =>
                      navigate(
                        `/instructor/dashboard/courses/landingpage/${course._id}`
                      )
                    }
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Courses;
