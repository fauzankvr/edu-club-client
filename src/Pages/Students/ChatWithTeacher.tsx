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
import { Video, Trash2 } from "lucide-react";
import studentAPI from "@/API/StudentApi";
import premiumImg from "../../assets/students/premiumicon.png";
import { Icon } from "@iconify/react";
import { useInView } from "react-intersection-observer";
import { getSocket } from "@/services/socketService";
import { debounce } from "lodash";
import { FixedSizeList as List } from "react-window";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Socket } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import { Message } from "./SingleCourse";


interface Chat {
  _id: string;
  userId: string;
  instructorId: string;
  lastMessageAt?: string;
  instructor: { fullName: string; profileImage: string; email?: string };
  isTyping?: boolean;
}

interface ChatTutorInterfaceProps {
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
  handleDeleteMessage: (messageId: string, chatId: string) => void;
  handleAddReaction: (
    messageId: string,
    chatId: string,
    reaction: string
  ) => void;
}
const MessageItem: React.FC<{
  msg: Message;
  studentId: string;
  getTickColor: (msg: Message) => string;
  seenMessagesRef: React.MutableRefObject<Set<string>>;
  handleDeleteMessage: (messageId: string, chatId: string) => void;
  handleAddReaction: (
    messageId: string,
    chatId: string,
    reaction: string
  ) => void;
}> = memo(
  ({
    msg,
    studentId,
    getTickColor,
    seenMessagesRef,
    handleDeleteMessage,
    handleAddReaction,
  }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const emitMessageSeen = debounce((chatId, userId, messageId) => {
      const socket = getSocket(studentId);
      if (socket.connected) {
        socket.emit("messageSeen", { chatId, userId, messageId });
      } else {
        console.warn("Socket not connected, cannot emit messageSeen");
      }
    }, 500);

    const { ref } = useInView({
      threshold: 0.6,
      onChange: (inView) => {
        if (
          inView &&
          !msg.seenBy.includes(studentId) &&
          msg.sender !== studentId &&
          !seenMessagesRef.current.has(msg._id)
        ) {
          if (!msg._id) {
            console.error(
              "Cannot emit messageSeen: messageId is undefined",
              msg
            );
            return;
          }
          emitMessageSeen(msg.chatId, studentId, msg._id);
          seenMessagesRef.current.add(msg._id);
        }
      },
    });

    useEffect(() => {
      if (!msg._id) {
        console.error("Message _id is undefined for message:", msg);
      }
    }, [msg]);

    const isSender = msg.sender === studentId;

    const reactionCounts =
      msg.reactions?.reduce((acc, r) => {
        acc[r.reaction] = (acc[r.reaction] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    const userReaction = msg.reactions?.find(
      (r) => r.userId === studentId
    )?.reaction;

    const onReactionClick = (emojiObject: { emoji: string }) => {
      if (!msg._id || !msg.chatId) {
        console.error("Cannot add reaction: messageId or chatId is undefined", {
          messageId: msg._id,
          chatId: msg.chatId,
        });
        return;
      }
      handleAddReaction(msg._id, msg.chatId, emojiObject.emoji);
      setShowPicker(false);
    };

    const handleDeleteClick = () => {
      if (confirm("Delete this message?")) {
        handleDeleteMessage(msg._id, msg.chatId);
      }
    };

    if (msg.deleted) {
      return (
        <div
          ref={ref}
          className={`flex mb-3 px-4 ${
            isSender ? "justify-end" : "justify-start"
          }`}
        >
          <div className="flex items-center space-x-2 py-2 px-3 bg-gray-50 rounded-xl border border-gray-200 max-w-xs">
            <Icon icon="mdi:delete-outline" className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 italic">
              This message was deleted
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`flex mb-3 px-4 group ${
          isSender ? "justify-end" : "justify-start"
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="relative max-w-[70%] sm:max-w-sm">
          {/* Message Actions - Desktop Only */}
          {showActions && (
            <div
              className={`absolute -top-8 z-10 hidden sm:flex items-center space-x-1 bg-white shadow-lg border border-gray-200 rounded-lg px-2 py-1 ${
                isSender ? "right-0" : "left-0"
              }`}
            >
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={!msg._id || !msg.chatId}
                title="Add reaction"
              >
                <Icon icon="mdi:emoticon-outline" className="w-3 h-3" />
              </button>
              {isSender && (
                <button
                  onClick={handleDeleteClick}
                  className="p-1 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete message"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`relative px-3 py-2 rounded-lg shadow-sm ${
              isSender
                ? "bg-indigo-100 text-indigo-900 ml-6 rounded-br-sm"  
                : "bg-white text-gray-800 border border-gray-200 mr-6 rounded-bl-sm"
            }`}
          >
            {/* Message Text */}
            <div className="whitespace-pre-wrap break-words text-sm leading-snug">
              {msg.text}
            </div>

            {/* Timestamp and Status */}
            <div className="flex items-center justify-end mt-1 space-x-1">
              <span
                className={`text-[10px] ${
                  isSender ? "text-indigo-400" : "text-gray-400"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {isSender && (
                <Icon
                  icon="mdi:check-all"
                  className={`w-3 h-3 ${getTickColor(msg)}`}
                />
              )}
            </div>

            {/* Mobile Actions - Touch Optimized */}
            <div className="sm:hidden absolute -bottom-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className={`p-1.5 rounded-full shadow-sm transition-colors ${
                  isSender
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"
                }`}
                disabled={!msg._id || !msg.chatId}
              >
                <Icon icon="mdi:emoticon-outline" className="w-3 h-3" />
              </button>
              {isSender && (
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 rounded-full bg-white hover:bg-red-50 text-red-500 shadow-sm border border-gray-200 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Reactions */}
          {Object.keys(reactionCounts).length > 0 && (
            <div
              className={`flex flex-wrap gap-1 ${
                isSender ? "justify-end mr-1" : "justify-start ml-1"
              }`}
            >
              {Object.entries(reactionCounts).map(([emoji]) => (
                <button
                  key={emoji}
                  onClick={() => onReactionClick({ emoji })}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] border transition-all duration-200 ${
                    userReaction === emoji
                      ? "bg-blue-100 border-blue-300 text-blue-800 shadow-md scale-105"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-1">{emoji}</span>
                  {/* <span className="font-medium text-xs">{count}</span> */}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Picker */}
          {showPicker && (
            <div
              className={`absolute z-50 ${
                isSender ? "right-0" : "left-0"
              }`}
            >
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                <EmojiPicker
                  onEmojiClick={onReactionClick}
                  searchDisabled
                  skinTonesDisabled
                  height={300}
                  width={280}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);


const MessageList: React.FC<MessageListProps> = ({
  messages,
  studentId,
  getTickColor,
  seenMessagesRef,
  scrollAreaRef,
  markMessagesAsSeen,
  handleDeleteMessage,
  handleAddReaction,
}) => {
  // Debug messages for missing _ids
  useEffect(() => {
    messages.forEach((msg, index) => {
      if (!msg._id) {
        console.error(`Message at index ${index} has undefined _id:`, msg);
      }
    });
  }, [messages]);

  useEffect(() => {
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
          key={msg._id || `message-${index}`} // Fallback key if _id is undefined
          msg={msg}
          studentId={studentId}
          getTickColor={getTickColor}
          seenMessagesRef={seenMessagesRef}
          handleDeleteMessage={handleDeleteMessage}
          handleAddReaction={handleAddReaction}
        />
      </div>
    );
  };

  return (
    <List
      height={400}
      itemCount={messages.length}
      itemSize={80}
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
  setChatMessages,
  studentId,
  instructorId,
  setUnseenCount,
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

  // Debug chatMessages
  useEffect(() => {
    console.log("Current chatMessages:", chatMessages);
  }, [chatMessages]);

  const getTickColor = useCallback(
    (msg: Message) =>
      msg.seenBy.includes(instructorId) ? "text-blue-400" : "text-gray-400",
    [instructorId]
  );

  const markMessagesAsSeen = useCallback(
    (messages: Message[]) => {
      const socket = getSocket(studentId);
      if (!socket.connected) {
        console.warn("Socket not connected, cannot mark messages as seen");
        return;
      }

      messages.forEach((msg) => {
        if (
          !msg.seenBy.includes(studentId) &&
          msg.sender !== studentId &&
          !seenMessagesRef.current.has(msg._id)
        ) {
          if (!msg._id) {
            console.error("Cannot mark message as seen: messageId is undefined", msg);
            return;
          }
          socket.emit("messageSeen", {
            chatId: msg.chatId,
            userId: studentId,
            messageId: msg._id,
          });
          seenMessagesRef.current.add(msg._id);
        }
      });
    },
    [studentId]
  );

  const handleDeleteMessage = useCallback(
    (messageId: string, chatId: string) => {
      if (!messageId || !chatId) {
        console.error("Invalid parameters for deleteMessage:", { messageId, chatId });
        return;
      }
      socket.emit("deleteMessage", { chatId, messageId, userId: studentId });
    },
    [socket, studentId]
  );

  const handleAddReaction = useCallback(
    (messageId: string, chatId: string, reaction: string) => {
      if (!messageId || !chatId || !reaction) {
        console.error("Invalid parameters for addReaction:", {
          messageId,
          chatId,
          reaction,
        });
        return;
      }
      socket.emit("addReaction", {
        chatId,
        messageId,
        userId: studentId,
        reaction,
      });
    },
    [socket, studentId]
  );

  useEffect(() => {
    socket.on("messageUpdated", (updatedMessage: Message) => {
      if (!updatedMessage._id) {
        console.error("Received messageUpdated with undefined _id:", updatedMessage);
        return;
      }
      setChatMessages(
        chatMessages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    socket.on(
      "messageDeleted",
      ({ messageId, chatId }: { messageId: string; chatId: string }) => {
        if (!messageId || !chatId) {
          console.error("Invalid messageDeleted event:", { messageId, chatId });
          return;
        }
        setChatMessages(
          chatMessages.map((msg) =>
            msg._id === messageId
              ? { ...msg, deleted: true, text: "This message was deleted" }
              : msg
          )
        );
      }
    );

    return () => {
      socket.off("messageUpdated");
      socket.off("messageDeleted");
    };
  }, [socket, chatMessages, setChatMessages]);

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
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 100);
  }, [chatMessages]);

  useEffect(() => {
    seenMessagesRef.current.clear();
    markMessagesAsSeen(chatMessages);
  }, [chat?._id, chatMessages, markMessagesAsSeen]);

  useEffect(() => {
    setUnseenCount(0);
  }, [setUnseenCount]);

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
    <div className="bg-gray-100 shadow-lg rounded-lg overflow-hidden flex flex-col h-[90vh]">
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
        </div>
      </div>
      {!chat ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a chat to start messaging.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <MessageList
              messages={chatMessages}
              studentId={studentId}
              getTickColor={getTickColor}
              seenMessagesRef={seenMessagesRef}
              scrollAreaRef={scrollAreaRef}
              markMessagesAsSeen={markMessagesAsSeen}
              handleDeleteMessage={handleDeleteMessage}
              handleAddReaction={handleAddReaction}
            />
            {chat?.isTyping && (
              <div className="text-sm text-gray-500">
                Instructor is typing...
              </div>
            )}
          </ScrollArea>
        </div>
      )}
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
