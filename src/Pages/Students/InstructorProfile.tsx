import studentAPI from "@/API/StudentApi";
import Footer from "@/components/studentComponents/Footer";
import Navbar from "@/components/studentComponents/Navbar";
import { Instructor } from "@/Interface/Iinstructro";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
const ProfileCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id) return;
        const res = await studentAPI.findOneCourse(id);
        setInstructor(res.data.course.instructorDetails);
      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };

    fetchCourse();
  }, [id, navigate]);

  if (!instructor) return null; // Loading fallback can be added here

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={instructor.profileImage}
            alt="Profile"
            className="w-32 h-32 rounded-xl object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-2xl font-semibold">{instructor.fullName}</h2>
              <span className="text-2xl">🌍</span>
            </div>
            {/* <p className="text-gray-600 mt-1">
              Creative UI/UX Designer Crafting Engaging Experiences
            </p> */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {/* <div className="flex items-center gap-1">
                <Icon icon="mdi:translate" className="text-lg" />
                <span>{instructor. }</span>
              </div> */}
            </div>
          </div>
        </div>

        {/* Badges
        <div className="flex flex-wrap gap-4 mt-4">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Icon icon="mdi:star-check" className="text-base" />A highly rated
            and experienced tutor
          </span>
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Icon icon="mdi:trophy-award" className="text-base" />
            Top 1%
          </span>
        </div> */}

        {/* About Me */}
        <div className="mt-4">
          <h3 className="font-semibold text-lg mb-2">About Me</h3>
          <p
            className={`text-gray-700 text-sm whitespace-pre-line ${
              isBioExpanded ? "" : "line-clamp-3"
            }`}
          >
            {instructor.Biography}
          </p>
          {instructor.Biography.length > 150 && (
            <button
              onClick={() => setIsBioExpanded(!isBioExpanded)}
              className="mt-2 text-blue-600 text-sm font-medium hover:underline focus:outline-none"
            >
              {isBioExpanded ? "See Less" : "See More"}
            </button>
          )}
        </div>

        {/* Contact Details */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Contact Details</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-center gap-2">
              <Icon icon="mdi:email-outline" />
              <a
                href={`mailto:${instructor.email}`}
                className="text-blue-600 underline"
              >
                {instructor.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="mdi:phone-outline" />
              <span>{instructor.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="mdi:flag-outline" />
              <span>{instructor.nationality}</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="mdi:cake-variant-outline" />
              <span>{instructor.dateOfBirth}</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="mdi:school-outline" />
              <span>{instructor.eduQulification}</span>
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfileCard;
