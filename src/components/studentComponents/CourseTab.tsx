import FeedbackSection from "@/Pages/Students/FeedbackSection";
import AiChat from "@/Pages/Students/AiChat";
import Discussion from "@/Pages/Students/Discussion";
import ChatWithTeacher from "@/Pages/Students/ChatWithTeacher";
import NotesApp from "@/Pages/Students/Notebook";
import { ICourseData } from "@/Interface/CourseData";
import { Socket } from "socket.io-client";

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

const TABS = [
  "Overview",
  "Not Book",
  "Reviews",
  "Discussion",
  "Contact Tutor",
  "Ai Chat",
] as const;
type Tab = (typeof TABS)[number];

interface CourseTabsProps {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
  course: ICourseData | undefined;
  chat: Chat | null;
  chatMessages: Message[];
  setChatMessages: (messages: Message[]) => void;
  studentId: string;
  instructorId: string;
  unseenCount: number;
  setUnseenCount: (count: number) => void;
  instructorStatus: string;
  instructorLastSeen: string;
  isInstructorBlocked: boolean;
  socket: Socket;
}

export default function CourseTabs({
  currentTab,
  setCurrentTab,
  course,
  chat,
  chatMessages,
  setChatMessages,
  studentId,
  instructorId,
  unseenCount,
  setUnseenCount,
  instructorStatus,
  instructorLastSeen,
  isInstructorBlocked,
  socket,
}: CourseTabsProps) {
  return (
    <>
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
          <ChatWithTeacher
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
            socket={socket}
          />
        )}
        {currentTab === "Not Book" && <NotesApp course={course} />}
        {currentTab === "Ai Chat" && <AiChat courseId={course?._id ?? ""} />}
      </div>
    </>
  );
}
