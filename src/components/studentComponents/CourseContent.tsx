import { Icon } from "@iconify/react";
import { ICarriculam, ILecture, IProgress } from "@/Interface/CourseData";

interface CourseContentProps {
  carriculam: ICarriculam;
  progress: IProgress | null;
  openSection: number | null;
  currentLesson: ILecture | null;
  toggleSection: (index: number) => void;
  handleLessonClick: (lesson: ILecture, sectionId: string) => void;
}

export default function CourseContent({
  carriculam,
  progress,
  openSection,
  currentLesson,
  toggleSection,
  handleLessonClick,
}: CourseContentProps) {
  return (
    <div className="bg-white border rounded-xl p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Course Content
      </h2>
      <div className="space-y-3">
        {carriculam.sections.map((section, idx) => {
          const sectionProgress = progress?.sections?.find(
            (sec) => sec.sectionId === section._id
          );
          const sectionProgressPercentage = sectionProgress?.lectures
            ? (sectionProgress.lectures.reduce(
                (sum, lecture) =>
                  sum + (parseInt(lecture.progress) >= 95 ? 1 : 0),
                0
              ) /
                (section.lectures.length || 1)) *
              100
            : 0;
          return (
            <div
              key={section._id}
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(idx)}
                className={`w-full flex justify-between items-center p-4 text-sm font-medium transition ${
                  openSection === idx
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{section.title}</span>
                  <span className="text-xs text-gray-500">
                    ({Math.round(sectionProgressPercentage)}% complete)
                    {sectionProgress?.completed && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </span>
                </div>
                <Icon
                  icon={openSection === idx ? "mdi:chevron-up" : "mdi:chevron-down"}
                  className="text-lg"
                />
              </button>
              {openSection === idx &&
                section.lectures.length > 0 &&
                section.lectures.map((lesson) => {
                  const lectureProgress = sectionProgress?.lectures.find(
                    (lec) => lec.lectureId === lesson._id
                  );
                  const progressValue = parseInt(lectureProgress?.progress || "0");
                  const isSelected = lesson._id === currentLesson?._id;

                  return (
                    <div
                      key={lesson._id}
                      onClick={() => handleLessonClick(lesson, section._id)}
                      className={`px-6 py-3 cursor-pointer transition-colors duration-200 rounded-md ${
                        isSelected
                          ? "bg-gray-100 border-l-4 border-indigo-600"
                          : "hover:bg-indigo-50"
                      }`}
                      role="button"
                      aria-label={`Select lesson: ${lesson.title}, ${progressValue}% complete`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            progressValue >= 95
                              ? "bg-indigo-600 border-indigo-600"
                              : "border-gray-300"
                          } transition-colors duration-200`}
                        >
                          {progressValue >= 95 && (
                            <Icon icon="mdi:check" className="text-white text-sm" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-800 font-medium truncate block">
                            {lesson.title}
                          </span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 font-medium">
                              {progressValue}% Complete
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressValue}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
