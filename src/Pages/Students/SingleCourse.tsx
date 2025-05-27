import Footer from "@/components/studentComponents/Footer";
import Navbar from "@/components/studentComponents/Navbar";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import FeedbackSection from "./FeedbackSection";
import { useParams } from "react-router-dom";
import studentAPI from "@/API/StudentApi";
import { ICarriculam, ICourseData } from "@/Interface/CourseData";
import AiChat from "./AiChat";
import Discussion from "./Discussion";
import ChatTutorInterface from "./ChatWithTeacher";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import NotesApp from "./Notebook";

const TABS = [
  "Overview",
  "Not Book",
  "Reviews",
  "Discussion",
  "Contact Tutor",
  "Ai Chat"
] as const;
type Tab = (typeof TABS)[number];

export default function SingleCourse() {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [currentTab, setCurrentTab] = useState<Tab>("Overview");
  const { id } = useParams();

  const [course, setCourse] = useState<ICourseData>();
  const [carriculam, setCarriculam] = useState<ICarriculam>();
  const [currentLesson, setCurrentLesson] = useState<any>(null);

  
  useEffect(() => {
    const saved = localStorage.getItem("completedLessons");
    if (saved) setCompletedLessons(new Set(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    if (id) {
      studentAPI
        .findFullCourse(id)
        .then((response) => {
          console.log("Course Data:", response.data);
          setCourse(response.data.course);
          setCarriculam(response.data.carriculam[0]);
          // set first lesson by default
          const firstLesson =
            response.data.carriculam[0]?.sections[0]?.lectures[0];
          setCurrentLesson(firstLesson);
        })
        .catch((error) => {
          console.error("Error fetching course:", error);
        });
    }
  }, [id]);

  useEffect(() => {
    localStorage.setItem(
      "completedLessons",
      JSON.stringify(Array.from(completedLessons))
    );
  }, [completedLessons]);

  const toggleSection = (i: number) =>
    setOpenSection(openSection === i ? null : i);

  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  const handleLessonClick = (lesson: any, lessonId: string) => {
    setCurrentLesson(lesson); // set selected lesson to show in center
    toggleLessonCompleted(lessonId);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Video/PDF + Tabs + Content */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center relative">
              {currentLesson ? (
                currentLesson.videoPath ? (
                  <MediaPlayer
                    title="Sprite Fight"
                    src={currentLesson.videoPath}
                  >
                    <MediaProvider />
                    <DefaultVideoLayout
                      thumbnails={currentLesson.videoPath}
                      icons={defaultLayoutIcons}
                    />
                  </MediaPlayer>
                ) : currentLesson.pdfPath ? (
                  <iframe
                    src={currentLesson.pdfPath}
                    className="w-full h-full"
                    title="PDF Viewer"
                  />
                ) : (
                  <p className="text-white">No media available</p>
                )
              ) : (
                <p className="text-white">Select a lesson</p>
              )}
            </div>

            {/* Tabs */}
            {/* (Your tab code remains SAME) */}
            <div className="flex space-x-12 mt-6 border-b">
              {TABS.map((tab) => {
                const isActive = tab === currentTab;
                return (
                  <button
                    key={tab}
                    onClick={() => setCurrentTab(tab)}
                    className={
                      "py-2 text-lg font-medium transition " +
                      (isActive
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-700 border-b-2 border-transparent hover:text-indigo-600 hover:border-indigo-600")
                    }
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            <div className="mt-6">
              {currentTab === "Overview" && (
                <>
                  <h1 className="text-2xl font-bold mb-4">{course?.title}</h1>
                  <div className="flex items-center gap-6 mb-4 text-gray-600">
                    {/* Your Rating, Students, Clock etc */}
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">
                    {course?.description}
                  </p>
                </>
              )}
              {currentTab === "Reviews" && (
                <FeedbackSection courseId={course?._id ?? ""} />
              )}
              {currentTab === "Discussion" && <Discussion />}
              {currentTab === "Contact Tutor" && <ChatTutorInterface />}
              {currentTab === "Not Book" && <NotesApp course={course} />}
              {currentTab === "Ai Chat" && <AiChat />}
            </div>
          </div>

          {/* Right: Course Content */}
          <div className="bg-white border rounded-xl p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Course content
            </h2>

            <div className="space-y-3">
              {carriculam?.sections.map((section, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(idx)}
                    className={`w-full flex justify-between items-center p-4 text-sm font-medium transition ${
                      openSection === idx
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {section.title}
                    <Icon
                      icon={
                        openSection === idx
                          ? "mdi:chevron-up"
                          : "mdi:chevron-down"
                      }
                      className="text-lg"
                    />
                  </button>

                  {openSection === idx && section.lectures.length > 0 && (
                    <div className="bg-white">
                      {section.lectures.map((lesson, i) => {
                        const lessonId = `${idx}-${i}`;
                        const done = completedLessons.has(lessonId);
                        return (
                          <div
                            key={i}
                            onClick={() => handleLessonClick(lesson, lessonId)}
                            className="flex justify-between items-center px-6 py-3 text-gray-700 text-sm hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                  done
                                    ? "bg-indigo-500 border-indigo-500"
                                    : "border-gray-400"
                                }`}
                              >
                                {done && (
                                  <Icon
                                    icon="mdi:check"
                                    className="text-white text-sm"
                                  />
                                )}
                              </div>
                              <span>{lesson.title}</span>
                            </div>

                            {/* <span className="text-xs text-gray-500">
                              {lesson.videoPath
                                ? `${lesson.duration} min`
                                : lesson.pdfPath
                                ? "PDF"
                                : ""}
                            </span> */}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
