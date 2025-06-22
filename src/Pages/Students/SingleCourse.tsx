import Footer from "@/components/studentComponents/Footer";
import Navbar from "@/components/studentComponents/Navbar";
import { Icon } from "@iconify/react";
import { useState, useEffect, useRef } from "react";
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
import { getSocket } from "@/services/socketService";

const TABS = [
  "Overview",
  "Not Book",
  "Reviews",
  "Discussion",
  "Contact Tutor",
  "Ai Chat",
] as const;
type Tab = (typeof TABS)[number];

interface Chat {
  _id: string;
  userId: string;
  instructorId: string;
  lastMessageAt?: string;
  instructor: { fullName: string; profileImage: string; email?: string };
  isTyping?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  chatId: string;
  createdAt: string;
  seenBy: string[];
}

interface ILesson {
  title: string;
  videoPath?: string;
  pdfPath?: string;
}

export default function SingleCourse() {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [currentTab, setCurrentTab] = useState<Tab>("Overview");
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<ICourseData | undefined>();
  const [carriculam, setCarriculam] = useState<ICarriculam | undefined>();
  const [unseenCount, setUnseenCount] = useState<number>(0);
  const [studentId, setStudentId] = useState<string>("");
  const [instructorId, setInstructorId] = useState<string>("");
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [instructorStatus, setInstructorStatus] = useState<string>("offline");
  const [instructorLastSeen, setInstructorLastSeen] = useState<string>("");
  const [isInstructorBlocked, setIsInstructorBlocked] =
    useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentLesson, setCurrentLesson] = useState<ILesson | null>(null);
  const chatJoinedRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const student = await studentAPI.getProfile();
        if (student?.profile?._id) setStudentId(student.profile._id);
        else throw new Error("Student profile not found");
        if (!id) throw new Error("Course ID not provided");
        const course = await studentAPI.findCoursByid(id);
        if (course.data?.data?.course?.instructorDetails?._id)
          setInstructorId(course.data.data.course.instructorDetails._id);
        else throw new Error("Instructor not found for course");
      } catch (error: unknown) {
        console.error(error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load profile or course"
        );
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!studentId || !instructorId) return;
    const socket = getSocket(studentId);
    socket.emit("set-role", { role: "student", userId: studentId });

    socket.on("connect_error", (err) =>
      setError(`Chat server error: ${err.message}`)
    );
    socket.on("error", (data: { error: string }) => setError(data.error));
    socket.on(
      "userStatus",
      ({
        userId,
        status,
        lastSeen,
      }: {
        userId: string;
        status: string;
        lastSeen: string;
      }) => {
        if (userId === instructorId) {
          setInstructorStatus(status);
          setInstructorLastSeen(lastSeen);
        }
      }
    );
    socket.on(
      "blockStatus",
      ({
        instructorId: blockedId,
        isBlocked,
      }: {
        instructorId: string;
        isBlocked: boolean;
      }) => {
        if (blockedId === instructorId) {
          setIsInstructorBlocked(isBlocked);
          setError(isBlocked ? "Instructor is blocked" : "");
        }
      }
    );
    socket.on("newMessage", (message: Message) => {
      if (message.chatId === chat?._id) {
        setChatMessages((prev) =>
          prev.some((msg) => msg.id === message.id) ? prev : [...prev, message]
        );
        if (
          message.sender !== studentId &&
          !message.seenBy.includes(studentId) &&
          currentTab !== "Contact Tutor"
        ) {
          setUnseenCount((prev) => prev + 1);
        }
      }
    });
    socket.on("messageUpdated", (updatedMessage: Message) => {
      if (updatedMessage.chatId === chat?._id) {
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      }
    });
    socket.on(
      "unseenCount",
      ({ chatId, count }: { chatId: string; count: number }) => {
        if (chatId === chat?._id) setUnseenCount(count);
      }
    );
    socket.on(
      "typing",
      ({ chatId, sender }: { chatId: string; sender: string }) => {
        if (chatId === chat?._id && sender !== studentId)
          setChat((prev) => prev && { ...prev, isTyping: true });
      }
    );
    socket.on(
      "stopTyping",
      ({ chatId, sender }: { chatId: string; sender: string }) => {
        if (chatId === chat?._id && sender !== studentId)
          setChat((prev) => prev && { ...prev, isTyping: false });
      }
    );

    const initializeChat = async () => {
      try {
        const response = await studentAPI.getChat(studentId);
        let chatData = response.data.data.find(
          (c: Chat) => c.instructorId === instructorId
        );
        if (!chatData) {
          const createResponse = await studentAPI.postChat({
            userId: studentId,
            instructorId,
          });
          chatData = createResponse.data;
        }
        setChat(chatData);
        if (chatJoinedRef.current !== chatData._id) {
          socket.emit("joinChat", chatData._id);
          chatJoinedRef.current = chatData._id;
        }
        const messages = await studentAPI.getMessage(chatData._id);
        setChatMessages(
          messages.data.data.map((msg: Message) => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            chatId: msg.chatId,
            createdAt: msg.createdAt,
            seenBy: msg.seenBy || [],
          }))
        );
        setUnseenCount(
          messages.data.data.filter(
            (msg: Message) =>
              msg.sender !== studentId && !msg.seenBy.includes(studentId)
          ).length
        );
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : "Failed to initialize chat"
        );
      }
    };
    initializeChat();

    return () => {
      socket.off("connect_error");
      socket.off("error");
      socket.off("userStatus");
      socket.off("blockStatus");
      socket.off("newMessage");
      socket.off("messageUpdated");
      socket.off("unseenCount");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [studentId, instructorId, chat?._id, currentTab]);

  useEffect(() => {
    if (id) {
      studentAPI
        .findFullCourse(id)
        .then((response) => {
          setCourse(response.data.data.course);
          setCarriculam(response.data.data.curriculum);
          setCurrentLesson(
            response.data.data.curriculum?.sections[0]?.lectures[0]
          );
        })
        .catch(() => setError("Failed to fetch course"));
    }
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem("completedLessons");
    if (saved) setCompletedLessons(new Set(JSON.parse(saved)));
  }, []);

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
  const handleLessonClick = (lesson: ILesson, lessonId: string) => {
    setCurrentLesson(lesson);
    toggleLessonCompleted(lessonId);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {error && (
          <div className="bg-red-100 text-red-700 p-2 text-center mb-4">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <div className="flex space-x-12 mt-6 border-b">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`py-2 text-lg font-medium transition ${
                    tab === currentTab
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-700 border-b-2 border-transparent hover:text-indigo-600 hover:border-indigo-600"
                  }`}
                >
                  <span>{tab}</span>
                  {tab === "Contact Tutor" && unseenCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unseenCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6">
              {currentTab === "Overview" && (
                <>
                  <h1 className="text-2xl font-bold mb-4">{course?.title}</h1>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {course?.description}
                  </p>
                </>
              )}
              {currentTab === "Reviews" && (
                <FeedbackSection courseId={course?._id ?? ""} />
              )}
              {currentTab === "Discussion" && <Discussion />}
              {currentTab === "Contact Tutor" && (
                <ChatTutorInterface
                  chat={chat}
                  chatMessages={chatMessages}
                  setChatMessages={setChatMessages}
                  studentId={studentId}
                  instructorId={instructorId}
                  unseenCount={unseenCount}
                  setUnseenCount={setUnseenCount}
                  instructorStatus={instructorStatus}
                  instructorLastSeen={instructorLastSeen}
                  isInstructorBlocked={isInstructorBlocked}
                  socket={getSocket(studentId)}
                />
              )}
              {currentTab === "Not Book" && <NotesApp course={course} />}
              {currentTab === "Ai Chat" && <AiChat courseId={course?._id ?? ""} />}
            </div>
          </div>
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
                  {openSection === idx &&
                    section.lectures.length > 0 &&
                    section.lectures.map((lesson, i) => {
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
                        </div>
                      );
                    })}
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
