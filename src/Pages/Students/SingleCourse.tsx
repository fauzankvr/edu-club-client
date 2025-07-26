  import { useState, useEffect, useRef } from "react";
  import { useParams } from "react-router-dom";
  import Navbar from "@/components/studentComponents/Navbar";
  import Footer from "@/components/studentComponents/Footer";
  import studentAPI from "@/API/StudentApi";
  import { getSocket } from "@/services/socketService";
  import CourseContent from "@/components/studentComponents/CourseContent";
  import MediaViewer from "@/components/studentComponents/MediaView";
  import CourseTabs from "@/components/studentComponents/CourseTab";
  import SkeletonLoader from "@/components/studentComponents/SingleCourseSkelton";
  import {
    ICourseData,
    ICarriculam,
    ILecture,
    IProgress,
  } from "@/Interface/CourseData";
  import CertificateModal from "@/components/studentComponents/CertificateModal";

  import backgroundImage from "../../assets/students/cetificate.jpg";
  import signatureImage from "../../assets/students/signature.png";


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

  type Tab =
    | "Overview"
    | "Not Book"
    | "Reviews"
    | "Discussion"
    | "Contact Tutor"
    | "Ai Chat";

  export default function SingleCourse() {
    const [openSection, setOpenSection] = useState<number | null>(0);
    const [currentTab, setCurrentTab] = useState<Tab>("Overview");
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<ICourseData | undefined>();
    const [carriculam, setCarriculam] = useState<ICarriculam | undefined>();
    const [progress, setProgress] = useState<IProgress | null>(null);
    const [unseenCount, setUnseenCount] = useState<number>(0);
    const [studentId, setStudentId] = useState<string>("");
    const [studentName, setStudentName] = useState<string>("");
    const [instructorId, setInstructorId] = useState<string>("");
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [instructorStatus, setInstructorStatus] = useState<string>("offline");
    const [instructorLastSeen, setInstructorLastSeen] = useState<string>("");
    const [isInstructorBlocked, setIsInstructorBlocked] =
      useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [currentLesson, setCurrentLesson] = useState<ILecture | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [overallProgress, setOverallProgress] = useState<number>(0);
    const [showModal, setShowModal] = useState(false);
    const chatJoinedRef = useRef<string | null>(null);
    const sentThresholdsRef = useRef<{ [lectureId: string]: number[] }>({});


    useEffect(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const student = await studentAPI.getProfile();
          setStudentName(`${student.profile.firstName} ${student.profile.lastName}`);
          if (student?.profile?._id) setStudentId(student.profile._id);
          else throw new Error("Student profile not found");
          if (!id) throw new Error("Course ID not provided");

          const courseResponse = await studentAPI.findFullCourse(id);
          const courseData = courseResponse.data.data.course;
          const curriculum = courseResponse.data.data.curriculum;

          const courseId = courseData?._id;
          if (!courseId || !student?.profile?._id)
            throw new Error("Missing course ID or student ID");

          const progressResponse = await studentAPI.getProgress(
            student.profile._id,
            courseId
          );
          setCourse(courseData);
          setCarriculam(curriculum);
          setProgress(progressResponse.data.data.progress || null);
          setCurrentLesson(curriculum?.sections[0]?.lectures[0] || null);

          if (courseData?.instructorDetails?._id)
            setInstructorId(courseData.instructorDetails._id);
          else throw new Error("Instructor not found for course");
        } catch (error: unknown) {
          console.error("Fetch Error:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load profile or course"
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [id]);

    useEffect(() => {
      if (progress?.sections) {
        const totalLectures = progress.sections.reduce(
          (sum, section) => sum + section.lectures.length,
          0
        );
        const completedLectures = progress.sections.reduce(
          (sum, section) =>
            sum +
            section.lectures.filter((lecture) => parseInt(lecture.progress) >= 95)
              .length,
          0
        );
        setOverallProgress(
          totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0
        );
      } else {
        setOverallProgress(0);
      }
    }, [progress]);

    useEffect(() => {
      if (progress?.completed) {
        setShowModal(true);
      }
    }, [progress]);

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

    const updateLessonProgress = async (
      sectionId: string,
      lectureId: string,
      progressValue: number,
      totalSeconds: number,
      actualSecondsWatched: number
    ) => {
      try {
        if (!studentId || !course?._id) {
          throw new Error("Missing studentId or courseId");
        }
        const response = await studentAPI.updateProgress(
          studentId,
          course._id,
          sectionId,
          lectureId,
          progressValue.toString(),
          totalSeconds,
          actualSecondsWatched
        );
        if (response.data.data.updated) {
          setProgress(response.data.data.updated);

          // Emit notification if lecture is completed (progress >= 99)
          if (
            progressValue >= 99 &&
            !sentThresholdsRef.current[lectureId]?.includes(99)
          ) {
            console.log('iam inside the 99 condition');
            const socket = getSocket(studentId);
            const notification = {
              studentId: studentId,
              instructorId: instructorId,
              type: "achievement",
              title: "Lecture Completed",
              message: `You have completed the lecture in ${
                course?.title || "the course"
              }!`,
              read: false,
            };
            studentAPI.sendNotification(notification);
            console.log("socket", socket);
            console.log("notification", notification);
            socket.emit("newNotification", notification);
            sentThresholdsRef.current[lectureId] = [
              ...(sentThresholdsRef.current[lectureId] || []),
              95,
            ];
          }
        } else {
          setError("Failed to update progress: Invalid response from server");
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to update lesson progress"
        );
      }
    };
    const handleLessonClick = (lesson: ILecture, sectionId: string) => {
      setCurrentLesson(lesson);
      if (lesson._id !== currentLesson?._id) {
        sentThresholdsRef.current[lesson._id] = [];
      }
      if (lesson.pdfPath && !lesson.videoPath && studentId) {
        const sectionProgress = progress?.sections?.find(
          (sec) => sec.sectionId === sectionId
        );
        const lectureProgress = sectionProgress?.lectures.find(
          (lec) => lec.lectureId === lesson._id
        );
        if (lectureProgress && parseInt(lectureProgress.progress) < 5) {
          updateLessonProgress(sectionId, lesson._id, 5,0,0);
        }
      }
    };

    const toggleSection = (i: number) =>
      setOpenSection(openSection === i ? null : i);

    if (isLoading || !carriculam || !progress) {
      return (
        <>
          <Navbar />
          <SkeletonLoader />
          <Footer />
        </>
      );
    }

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
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {currentLesson?.title || "Select a Lesson"}
              </h3>
              <MediaViewer
                currentLesson={currentLesson}
                carriculam={carriculam}
                studentId={studentId}
                courseId={course?._id}
                updateLessonProgress={updateLessonProgress}
              />
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Course Progress</h2>
                  <div className="text-sm font-medium text-indigo-600">
                    {Math.round(overallProgress)}% Complete
                    {progress.completed && (
                      <span className="ml-2 text-green-600">
                        ✓ Course Completed
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>
              <CourseTabs
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                course={course}
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
            </div>
            <CourseContent
              carriculam={carriculam}
              progress={progress}
              openSection={openSection}
              currentLesson={currentLesson}
              toggleSection={toggleSection}
              handleLessonClick={handleLessonClick}
            />
          </div>
        </div>
        <Footer />
        {showModal && (
          <CertificateModal
            show={showModal}
            onClose={() => setShowModal(false)}
            studentName={studentName}
            courseName={course?.title || "basic React"}
            instructorName={course?.instructorDetails.fullName || "Jhone"}
            issuedDate={progress.updatedAt.split("T")[0]}
            certificateId="EDU-123456"
            logoUrl={backgroundImage}
            signatureUrl={signatureImage}
          />
        )}
      </>
    );
  }
