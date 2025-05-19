import { Instructor } from "@/Interface/Iinstructro";
// import { Icon } from "@iconify/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

interface InstructorProfileProps {
  instructor: Instructor;
}

const InstructorProfile: React.FC<InstructorProfileProps> = ({
  instructor,
}) => {
  return (
    <div className="max-w-4xl mx-auto  p-6 md:p-10">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Profile Image */}
        <img
          src={`${baseUrl}/${instructor.profileImage}`}
          alt="Instructor"
          className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
        />

        {/* Info */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {instructor.fullName}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {instructor.eduQulification}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 text-sm text-gray-700">
            {/* <div className="flex items-center gap-2">
              <Icon icon="mdi:star" className="text-indigo-600" />
              <span>4.7 Instructor Rating</span>
            </div> */}
            {/* <div className="flex items-center gap-2">
              <Icon icon="mdi:account-group" className="text-indigo-600" />
              <span>2,120,788 Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:book-open-variant" className="text-indigo-600" />
              <span>7 Courses</span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="mt-6 space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>
          I'm Jonas, one of Udemy’s Top Instructors and all my premium courses
          have earned the best-selling status for outstanding performance.
        </p>
      </div>
    </div>
  );
};

export default InstructorProfile;
