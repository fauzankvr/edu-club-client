import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import teacherImage from "@/assets/students/teacherimage.png"
import studentImg from "@/assets/students/studetnimage.png"

const LookingFor = () => {
  return (
    <div className="bg-gray-50 py-16 px-6">
      <div className="container mx-auto text-center">
        {/* Section Header */}
        <h2 className="text-3xl font-bold text-gray-900">
          What You Looking For?
        </h2>
        <p className="text-gray-600 mt-2 max-w-lg mx-auto">
          Our dynamic platform offers you the best education experience. Join as
          a student to learn or as a teacher to inspire!
        </p>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {/* Teacher Card */}
          <Card className="relative bg-purple-500 text-white overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="pl-4 lg:w-1/2">
                <h3 className="text-2xl font-semibold text-start">
                  Do You Want To Teach Here
                </h3>
                <p className="mt-2 font-lg text-start">
                  Join Our Teaching Team & Inspire The Next Generation.
                </p>
              </div>
              <div className="flex justify-between items-center mt-6">
                <Button className="bg-yellow-400 text-black hover:bg-yellow-500 ml-4">
                  Get Start <Icon icon="mdi:arrow-right" className="ml-2" />
                </Button>
                <img
                  src={teacherImage}
                  alt="Teacher"
                  className="absolute bottom-0 right-5"
                  width="370px"
                />
              </div>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card className="relative bg-yellow-400 text-white overflow-hidden">
            <CardContent className="p-8 flex flex-col justify-between h-full">
              <div className="pl-4 lg:w-1/2">
                <h3 className="text-2xl font-semibold text-start">
                  Do You Want To Learn Here
                </h3>
                <p className="mt-2 font-lg text-start">
                  Enhance Your Knowledge & Achieve Your Goals.
                </p>
              </div>
              <div className="flex justify-between items-center mt-6">
                <Button className="bg-purple-500 text-white hover:bg-purple-600">
                  Enroll Now <Icon icon="mdi:arrow-right" className="ml-2" />
                </Button>
                <img
                  src={studentImg}
                  alt="Student"
                  className="absolute bottom-0 right-5"
                  width="370px"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LookingFor;
