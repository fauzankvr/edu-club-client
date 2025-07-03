import { Instructor } from "@/Interface/Iinstructro";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface InstructorProfileProps {
  instructor: Instructor;
}

const InstructorProfile: React.FC<InstructorProfileProps> = ({
  instructor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate()
  const { id } = useParams();
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  return (
    <div className="max-w-4xl mx-auto  p-6 md:p-10">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Profile Image */}
        <img
          src={instructor.profileImage}
          alt="Instructor"
          className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
        />

        {/* Info */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 cursor-pointer" onClick={()=>navigate(`/instructor-profile/${id}`)}>
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

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md mt-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Icon icon="mdi:account" className="text-blue-600 w-6 h-6" />
          About Me
        </h2>

        <div
          className={`text-gray-700 text-sm md:text-base leading-relaxed ${
            isExpanded ? "" : "line-clamp-3"
          }`}
        >
          {instructor.Biography}
        </div>

        {instructor.Biography?.length > 150 && (
          <button
            onClick={toggleExpand}
            className="mt-2 text-blue-600 text-sm font-medium hover:underline focus:outline-none"
          >
            {isExpanded ? "See Less" : "See More"}
          </button>
        )}
      </div>
    </div>
  );
};

export default InstructorProfile;
