import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { ICourseData } from "@/Interface/CourseData";
import studentAPI from "@/API/StudentApi";

const TopCourses = () => {
  const navigate = useNavigate();
   const [courses, setCourses] = useState<ICourseData[]>([]);
  
    useEffect(() => {
      const fetchCourses = async () => {
        try {
          const res = await studentAPI.getAllCourses();
          setCourses(res.courses);
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchCourses();
    }, []);

  return (
    <div className="bg-gray-50 py-16 px-6">
      <div className="container mx-auto px-12">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-indigo-600 font-semibold px-3 py-1 bg-indigo-100 rounded-md text-sm">
              CHOOSE COURSE
            </span>
            <h2 className="text-3xl font-bold mt-2">Top Courses</h2>
          </div>
          <div className="lg:w-1/3 text-right">
            <p className="text-gray-700 text-sm">
              Online learning offers a new way to explore subjects you're
              passionate about.
            </p>
            <Button
              className="mt-4"
              variant={"mystyle"}
              onClick={() => navigate("/courses")} // Navigate to "/courses" page
            >
              View All
            </Button>
          </div>
        </div>

        {/* Courses Grid - Show Only First 6 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {courses.slice(0, 3).map(
            (
              course // Show only first 6 courses
            ) => (
              <Card
                key={course._id}
                className="shadow-md relative border-2 border-indigo-400 border-dashed"
              >
                <CardContent className="px-4 py-3">
                  <div className="relative">
                    <img
                      src={course.courseImageId}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                    {/* Category Span Positioned at the Bottom of the Image */}
                    <span className="absolute bottom-2 left-2 bg-purple-200 text-purple-700 px-3 py-1 rounded-md text-sm">
                      {course.category}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center my-2">
                      <div className="lg:w-1/2 flex items-center">
                        <Icon
                          icon="mdi:star"
                          className="text-yellow-400 mr-1"
                        />
                        {/* <span className="font-semibold">{course.rating}</span> */}
                      </div>
                      <div className="lg:w-1/2 text-end pr-4">
                        <span className=" text-gray-400 ml-2 line-through  text-xl">
                          ₹{course.price + 200}
                        </span>
                        <span className="text-indigo-600 font-bold ml-2 text-xl">
                          ₹{course.price}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    {/* <div className="flex items-center text-gray-600 text-sm mt-3">
                      <Icon icon="mdi:book-open" className="mr-2" />
                      <span>{course.lessons} Lessons</span>
                      <Icon
                        icon="mdi:clock-time-three-outline"
                        className="ml-4 mr-2"
                      />
                      <span>{course.duration}</span>
                      <Icon icon="mdi:account-group" className="ml-4 mr-2" />
                      <span>{course.students} Students</span>
                    </div> */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarImage
                            src={course.instructor.profileImage}
                            alt="Instructor"
                          />
                        </Avatar>
                        <span className="ml-2">{course.instructor.name}</span>
                      </div>
                      <Button className="cursor-pointer"
                        onClick={() =>
                          navigate(`/courses/details/${course._id}`, {
                            state: { course }
                          })
                        }
                      >
                        Enroll
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default TopCourses;
