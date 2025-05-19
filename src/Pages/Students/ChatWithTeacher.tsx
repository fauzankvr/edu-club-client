import { useState, useEffect, KeyboardEvent, ChangeEvent, JSX } from "react";
import { useParams } from "react-router-dom";
import { Video, Phone } from "lucide-react";
import io from "socket.io-client";
import studentAPI from "@/API/StudentApi";

const baseUri = import.meta.env.VITE_BASE_URL;

const socket = io(baseUri, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

interface Chat {
  _id: string;
  userId: string;
  instructorId: string;
  lastMessageAt?: string;
  instructor: {
    fullName: string;
    profileImage: string;
  };
}

interface Message {
  id: string;
  text: string;
  sender: string;
  chatId: string;
  createdAt: string;
}
interface Msg {
  _id: string;
  text: string;
  sender: string;   
  chatId: string;
  createdAt: string; 
}


export default function ChatTutorInterface(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const { id } = useParams<{ id: string }>();
  const [studentId, setStudentId] = useState<string>("");
  const [instructorId, setInstructorId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
      setError("Failed to connect to chat server");
    });
    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const student = await studentAPI.getProfile();
        if (student?.profile?._id) {
          setStudentId(student.profile._id);
        } else {
          throw new Error("Student profile not found");
        }

        if (!id) throw new Error("Course ID not provided");

        const course = await studentAPI.findCoursByid(id);
        if (course?.data?.course?.instructorDetails?._id) {
          setInstructorId(course.data.course.instructorDetails._id);
        } else {
          throw new Error("Instructor not found for course");
        }
      } catch (error: unknown) {
        console.error("Error fetching profile or course:", error);
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
    const initializeChat = async () => {
      if (!studentId || !instructorId) return;

      try {
        const response = await studentAPI.getChat(studentId);
        let chatData = response.data.find(
          (chat: Chat) => chat.instructorId === instructorId
        );

        if (!chatData) {
          const createResponse = await studentAPI.postChat({
            userId: studentId,
            instructorId,
          });
          chatData = createResponse.data;
        }

        setChat(chatData);
      } catch (error: unknown) {
        console.error("Error initializing chat:", error);
        setError(
          error instanceof Error ? error.message : "Failed to initialize chat"
        );
      }
    };

    initializeChat();
  }, [studentId, instructorId]);

  useEffect(() => {
    if (!chat?._id) return;

    const fetchMessages = async () => {
      try {
        const response = await studentAPI.getMessage(chat._id);
        setChatMessages(
          response.data.map((msg: Msg) => ({
            id: msg._id,
            text: msg.text,
            sender: msg.sender,
            chatId: msg.chatId,
            createdAt: msg.createdAt,
          }))
        );
      } catch (error: unknown) {
        console.error("Error fetching messages:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch messages"
        );
      }
    };

    fetchMessages();
    socket.emit("joinChat", chat._id);

    socket.on("newMessage", (newMessage: Message) => {
      if (newMessage.chatId === chat._id) {
        setChatMessages((prev) => {
          if (prev.some((msg) => msg.id === newMessage.id)) {
            return prev.map((msg) =>
              msg.id === newMessage.id ? newMessage : msg
            );
          }
          return [...prev, newMessage];
        });
      }
    });

    socket.on("typing", (data: { chatId: string; sender: string }) => {
      if (data.chatId === chat._id && data.sender !== studentId) {
        setIsTyping(true);
      }
    });

    socket.on("stopTyping", (data: { chatId: string; sender: string }) => {
      if (data.chatId === chat._id && data.sender !== studentId) {
        setIsTyping(false);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      setError(err.error || "Socket error occurred");
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("error");
    };
  }, [chat, studentId]);

  const handleTyping = () => {
    if(!studentId || !chat?._id) return;
    if (!chat || !message.trim()) {
      if (typingTimeout) {
        socket.emit("stopTyping", { chatId: chat._id, sender: studentId });
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      return;
    }

    socket.emit("typing", { chatId: chat._id, sender: studentId });

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      socket.emit("stopTyping", { chatId: chat._id, sender: studentId });
      setTypingTimeout(null);
    }, 3000);
    setTypingTimeout(timeout);
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!message.trim() || !chat?._id || !studentId) {
      setError("Please ensure all fields are filled");
      return;
    }

    socket.emit("sendMessage", {
      chatId: chat._id,
      sender: studentId,
      text: message.trim(),
    });

    setMessage("");
    setError("");
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setMessage(e.target.value);
    handleTyping();
  };

  return (
    <div className="mx-auto bg-gray-100 shadow-lg rounded-lg overflow-hidden flex flex-col h-[90vh]">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 text-center">{error}</div>
      )}
      <div className="bg-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="/api/placeholder/50/50"
            alt="Premium"
            className="w-10 h-10"
          />
          <div>
            <h2 className="text-indigo-600 font-medium">
              Unlock Premium Features - Upgrade Your Plan Today!
            </h2>
            <p className="text-xs text-gray-600">
              Upgrade for video calls, chat support, premium assistance, and
              exclusive resources.
            </p>
          </div>
        </div>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded text-sm">
          Upgrade Now
        </button>
      </div>
      <div className="bg-gray-200 p-3 flex items-center justify-between border-t border-gray-300">
        <div className="flex-1 text-center">Make Video call to instructor</div>
        <div className="flex space-x-4">
          <button className="bg-blue-500 p-2 rounded-full">
            <Video size={20} className="text-white" />
          </button>
          <button className="bg-blue-500 p-2 rounded-full">
            <Phone size={20} className="text-white" />
          </button>
        </div>
      </div>
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center">
        {chat?.instructor?.profileImage ? (
          <img
            src={`${baseUri}/${chat.instructor.profileImage}`}
            alt="Instructor"
            className="w-8 h-8 rounded-full object-cover mr-3"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full mr-3" />
        )}
        <div className="font-medium">
          {chat?.instructor?.fullName
            ? `Mr. ${chat.instructor.fullName}`
            : "Loading..."}
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto flex flex-col space-y-3">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === studentId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.sender === studentId
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
              <div
                className={`text-xs ${
                  msg.sender === studentId ? "text-gray-200" : "text-gray-500"
                } mt-1`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-sm text-gray-500">Instructor is typing...</div>
        )}
      </div>
      <div className="p-3 border-t border-gray-300 flex">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Write your doubts here..."
          className="flex-1 py-2 px-3 bg-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          disabled={!chat}
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={!chat}
        >
          Send
        </button>
      </div>
    </div>
  );
}