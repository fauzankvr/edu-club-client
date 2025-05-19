import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import studentAPI from "@/API/StudentApi"; 
import { toast } from "react-toastify"; 
import { ICarriculam, ILecture} from "@/Interface/CourseData";

interface CourseContentProps {
  courseId: string;
}

const CourseContent: React.FC<CourseContentProps> = ({ courseId }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [curriculum, setCurriculum] = useState<ICarriculam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (courseId) {
      setLoading(true);
      studentAPI
        .findCarriculam(courseId)
        .then((response) => {
          console.log("Course Data:", response.curriculum);
          const curriculumData = response.curriculum; 
          if (curriculumData) {
            setCurriculum(curriculumData);
          } else {
            setError("No curriculum data found for this course.");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching course:", error);
          setError("Failed to load course content.");
          setLoading(false);
          toast.error("Failed to load course content."); 
        });
    }
  }, [courseId]);


  const getLectureType = (lecture: ILecture): "video" | "document" | "quiz" => {
    // if (lecture.type) return lecture.type; 
    if (lecture.videoPath) return "video";
    if (lecture.pdfPath) return "document";
    return "video"; 
  };


  // const getLectureDuration = (lecture :ILecture ): string => {
  //   return lecture.duration || "N/A";
  // };

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return "mdi:play-circle-outline";
      case "document":
        return "mdi:file-document-outline";
      case "quiz":
        return "mdi:check-circle-outline";
      default:
        return "mdi:play-circle-outline";
    }
  };


  const calculateMetaInfo = () => {
    if (!curriculum)
      return { totalSections: 0, totalLectures: 0, totalDuration: "0 min" };

    const totalSections = curriculum.sections.length;
    const totalLectures = curriculum.sections.reduce(
      (sum, section) => sum + section.lectures.length,
      0
    );

    // const totalDuration = curriculum.sections.reduce((sum, section) => {
    //   // const sectionDuration = section.lectures.reduce((lecSum, lecture) => {
    //   //   // const duration = lecture.duration
    //   //   //   ? parseFloat(lecture.duration) || 0
    //   //   //   : 0;
    //   //   // return lecSum + duration;
    //   // }, 0);
    //   // return sum + sectionDuration;
    // }, 0);

    return {
      totalSections,
      totalLectures,
      // totalDuration: `${Math.round(totalDuration)} min`,
    };
  };

  if (loading) {
    return <div>Loading course content...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!curriculum || curriculum.sections.length === 0) {
    return <div>No content available for this course.</div>;
  }

  const { totalSections, totalLectures, totalDuration } = calculateMetaInfo();

  return (
    <div>
      {/* Meta Info */}
      <div className="text-sm text-gray-700 mb-6">
        <span className="mr-4">{totalSections} sections</span>
        <span className="mr-4">{totalLectures} lectures</span>
        <span>{totalDuration} total length</span>
      </div>

      {/* Accordion */}
      <div className="space-y-4">
        {curriculum.sections.map((section, idx) => (
          <div
            key={idx}
            className="border border-indigo-200 rounded-md overflow-hidden"
          >
            <button
              onClick={() => setActiveIndex(idx === activeIndex ? -1 : idx)}
              className="w-full flex items-center justify-between px-4 py-3 bg-indigo-100 text-indigo-800 font-medium text-left"
            >
              <div className="flex items-center gap-2">
                <Icon
                  icon={
                    activeIndex === idx
                      ? "mdi:chevron-down"
                      : "mdi:chevron-right"
                  }
                  className="text-xl"
                />
                {section.title}
              </div>
              <div className="text-xs flex gap-4 text-indigo-700 font-normal">
                <span>{section.lectures.length} lectures</span>
                {/* <span>
                  {section.lectures.reduce(
                    // (sum, lec) => sum + (parseFloat(lec.duration || "0") || 0),
                    0
                  ) || "N/A"}{" "}
                  min
                </span> */}
              </div>
            </button>

            {/* Collapsible Content */}
            {activeIndex === idx && section.lectures.length > 0 && (
              <div className="bg-white px-4 py-2 text-sm text-gray-700">
                {section.lectures.map((lecture, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b last:border-none"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={getIcon(getLectureType(lecture))}
                        className="text-indigo-600 text-lg"
                      />
                      <span>{lecture.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {/* {getLectureDuration(lecture)} */}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseContent;
