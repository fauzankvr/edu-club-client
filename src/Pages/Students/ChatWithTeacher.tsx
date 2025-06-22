import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
  JSX,
  memo,
} from "react";
import { useNavigate } from "react-router-dom";
import { Video } from "lucide-react";
import studentAPI from "@/API/StudentApi";
import premiumImg from "../../assets/students/premiumicon.png";
import { Icon } from "@iconify/react";
import { useInView } from "react-intersection-observer";
import { getSocket } from "@/services/socketService";
import { debounce } from "lodash";
import { FixedSizeList as List } from "react-window";

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

interface ChatTutorInterfaceProps {
  chat: Chat | null;
  chatMessages: Message[];
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  studentId: string;
  instructorId: string;
  unseenCount: number;
  setUnseenCount: React.Dispatch<React.SetStateAction<number>>;
  instructorStatus: string;
  instructorLastSeen: string;
  isInstructorBlocked: boolean;
  socket: any;
}

interface Plan {
  _id: string;
  name: string;
  features: string[];
  [key: string]: unknown;
}

interface MessageListProps {
  messages: Message[];
  studentId: string;
  getTickColor: (msg: Message) => string;
  seenMessagesRef: React.MutableRefObject<Set<string>>;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  markMessagesAsSeen: (messages: Message[]) => void;
}

const MessageItem: React.FC<{
  msg: Message;
  studentId: string;
  getTickColor: (msg: Message) => string;
  seenMessagesRef: React.MutableRefObject<Set<string>>;
}> = memo(({ msg, studentId, getTickColor, seenMessagesRef }) => {
  const emitMessageSeen = debounce((chatId, userId, messageId) => {
    const socket = getSocket(studentId);
    if (socket.connected) {
      socket.emit("messageSeen", { chatId, userId, messageId });
    } else {
      console.warn("Socket not connected, cannot emit messageSeen");
    }
  }, 500);

  const { ref } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      if (
        inView &&
        !msg.seenBy.includes(studentId) &&
        msg.sender !== studentId &&
        !seenMessagesRef.current.has(msg.id)
      ) {
        emitMessageSeen(msg.chatId, studentId, msg.id);
        seenMessagesRef.current.add(msg.id);
      }
    },
  });

  return (
    <div
      ref={ref}
      className={`flex ${
        msg.sender === studentId ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 rounded-lg max-w-xs ${
          msg.sender === studentId
            ? "bg-indigo-200 text-indigo-900"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        {msg.text}
        <div
          className={`text-xs flex items-center space-x-1 ${
            msg.sender === studentId ? "text-indigo-400" : "text-gray-500"
          } mt-1`}
        >
          <span>
            {new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {msg.sender === studentId && (
            <Icon
              icon="mdi:check-all"
              className={`w-4 h-4 ${getTickColor(msg)}`}
            />
          )}
        </div>
      </div>
    </div>
  );
});

const MessageList: React.FC<MessageListProps> = ({
  messages,
  studentId,
  getTickColor,
  seenMessagesRef,
  scrollAreaRef,
  markMessagesAsSeen,
}) => {
  useEffect(() => {
    // Mark visible messages as seen on initial load
    markMessagesAsSeen(messages);
  }, [messages, markMessagesAsSeen]);

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const msg = messages[index];
    return (
      <div style={style}>
        <MessageItem
          key={msg.id}
          msg={msg}
          studentId={studentId}
          getTickColor={getTickColor}
          seenMessagesRef={seenMessagesRef}
        />
      </div>
    );
  };

  return (
    <List
      height={400}
      itemCount={messages.length}
      itemSize={60}
      width="100%"
      outerRef={scrollAreaRef}
    >
      {Row}
    </List>
  );
};

export default function ChatWithTeacher({
  chat,
  chatMessages,
  studentId,
  instructorId,
  setUnseenCount,
  instructorStatus,
  instructorLastSeen,
  isInstructorBlocked,
  socket,
}: ChatTutorInterfaceProps): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const seenMessagesRef = useRef<Set<string>>(new Set());
  const navigate = useNavigate();
  const isTypingRef = useRef<boolean>(false);

  const getTickColor = useCallback(
    (msg: Message) =>
      msg.seenBy.includes(instructorId) ? "text-blue-600" : "text-brown-600",
    [instructorId]
  );

  const markMessagesAsSeen = useCallback(
    (messages: Message[]) => {
      const socket = getSocket(studentId);
      if (!socket.connected) return;

      messages.forEach((msg) => {
        if (
          !msg.seenBy.includes(studentId) &&
          msg.sender !== studentId &&
          !seenMessagesRef.current.has(msg.id)
        ) {
          socket.emit("messageSeen", {
            chatId: msg.chatId,
            userId: studentId,
            messageId: msg.id,
          });
          seenMessagesRef.current.add(msg.id);
        }
      });
    },
    [studentId]
  );

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const plans = await studentAPI.getPlan();
        if (plans.data.success) setPlan(plans.data.data);
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch plan"
        );
      }
    };
    fetchPlan();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    // Clear seenMessagesRef when chat changes
    seenMessagesRef.current.clear();
    // Mark initial messages as seen
    markMessagesAsSeen(chatMessages);
  }, [chat?._id, chatMessages, markMessagesAsSeen]);
  useEffect(() => {
    setUnseenCount(0);
  },[])

  const handleTyping = useCallback(() => {
    if (!studentId || !chat?._id || isInstructorBlocked || !message.trim()) {
      if (isTypingRef.current) {
        socket.emit("stopTyping", { chatId: chat?._id, sender: studentId });
        isTypingRef.current = false;
      }
      return;
    }
    if (!isTypingRef.current) {
      socket.emit("typing", { chatId: chat._id, sender: studentId });
      isTypingRef.current = true;
    }
  }, [studentId, chat?._id, isInstructorBlocked, message, socket]);

  const handleStopTyping = useCallback(() => {
    if (isTypingRef.current) {
      socket.emit("stopTyping", { chatId: chat?._id, sender: studentId });
      isTypingRef.current = false;
    }
  }, [studentId, chat?._id, socket]);

  const handleSendMessage = async () => {
    if (!message.trim() || !chat?._id || !studentId || isInstructorBlocked) {
      setError("Cannot send message");
      return;
    }
    try {
      socket.emit("sendMessage", {
        chatId: chat._id,
        text: message.trim(),
        sender: studentId,
      });
      setMessage("");
      setError("");
      handleStopTyping();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleTyping();
    if (!e.target.value.trim()) handleStopTyping();
  };

  return (
    <div className="mx-auto bg-gray-100 shadow-lg rounded-lg overflow-hidden flex flex-col h-[90vh]">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 text-center">{error}</div>
      )}
      {!plan && (
        <div className="bg-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={premiumImg} alt="Premium" className="w-10 h-10" />
            <div>
              <h2 className="text-indigo-600 font-medium">
                Unlock Premium Features
              </h2>
              <p className="text-xs text-gray-600">
                Upgrade for video calls and more.
              </p>
            </div>
          </div>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded text-sm"
            onClick={() => navigate("/plans")}
          >
            Upgrade Now
          </button>
        </div>
      )}
      {plan && (
        <div className="bg-gray-200 p-3 flex items-center justify-between border-t border-gray-300">
          <div className="flex-1 text-center text-gray-700 font-medium">
            Make a video call
          </div>
          <div className="flex space-x-4">
            <button
              className="bg-blue-500 p-2 rounded-full transform hover:scale-90 active:scale-75 shadow-md"
              onClick={() => {
                const roomId = Math.random().toString(36).substring(2);
                window.open(
                  `/video-call?chatId=${chat?._id}&studentId=${studentId}&instructorId=${instructorId}&roomId=${roomId}`,
                  "_blank"
                );
              }}
              disabled={isInstructorBlocked}
            >
              <Video size={20} className="text-white animate-pulse" />
            </button>
          </div>
        </div>
      )}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center">
        {chat?.instructor?.profileImage ? (
          <img
            src={chat.instructor.profileImage}
            alt="Instructor"
            className="w-8 h-8 rounded-full object-cover mr-3"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center mr-3">
            <Icon icon="mdi:account" className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="font-medium">
          {chat?.instructor?.fullName
            ? `Mr. ${chat.instructor.fullName}`
            : "Loading..."}
          {isInstructorBlocked && (
            <span className="text-red-500 text-sm ml-2">(Blocked)</span>
          )}
          {/* <p className="text-sm text-muted-foreground">
            {instructorStatus === "online"
              ? "Online"
              : instructorLastSeen
              ? `Last seen: ${new Date(instructorLastSeen).toLocaleString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Unknown"}
          </p> */}
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto flex flex-col space-y-3">
        <MessageList
          messages={chatMessages}
          studentId={studentId}
          getTickColor={getTickColor}
          seenMessagesRef={seenMessagesRef}
          scrollAreaRef={scrollAreaRef}
          markMessagesAsSeen={markMessagesAsSeen}
        />
        {chat?.isTyping && (
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
          disabled={!chat || isInstructorBlocked}
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          disabled={!chat || isInstructorBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
}
