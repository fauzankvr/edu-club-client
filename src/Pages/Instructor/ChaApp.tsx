import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import instructorAPI from "@/API/InstructorApi";
import io, { Socket } from "socket.io-client";
import Navbar from "@/components/InstructorCompontents/Navbar";
import Sidebar from "./Sidbar";
import { Icon } from "@iconify/react";
import { useInView } from "react-intersection-observer";
import { FixedSizeList as List } from "react-window";
import { debounce } from "lodash";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Trash2 } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

// Skeleton UI components
const SkeletonChatItem: React.FC = () => (
  <div className="flex items-center space-x-3 p-2 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
  </div>
);

dayjs.extend(relativeTime);

const baseUri = import.meta.env.VITE_BASE_URL;
const socket: Socket = io(baseUri, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

interface Reaction {
  userId: string;
  reaction: string;
}

interface Message {
  _id: string;
  text: string;
  sender: string;
  chatId: string;
  createdAt: string;
  seenBy: string[];
  reactions?: Reaction[];
  deleted?: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastSeen: string;
  lastMessage?: string;
  lastMessageTime?: string;
  messages: Message[];
  unseenCount: number;
  studentId: string;
}

interface MessageItemProps {
  msg: Message;
  instructorId: string;
  getTickColor: (msg: Message) => string;
  seenMessagesRef: React.MutableRefObject<Set<string>>;
  handleDeleteMessage: (messageId: string, chatId: string) => void;
  handleAddReaction: (
    messageId: string,
    chatId: string,
    reaction: string
  ) => void;
}

const MessageItem: React.FC<MessageItemProps> = memo(
  ({
    msg,
    instructorId,
    getTickColor,
    seenMessagesRef,
    handleDeleteMessage,
    handleAddReaction,
  }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const emitMessageSeen = debounce(
      (chatId: string, userId: string, messageId: string) => {
        socket.emit("messageSeen", { chatId, userId, messageId });
      },
      500
    );

    const { ref } = useInView({
      threshold: 0.6,
      onChange: (inView) => {
        if (
          inView &&
          !msg.seenBy.includes(instructorId) &&
          msg.sender !== instructorId &&
          !seenMessagesRef.current.has(msg._id)
        ) {
          if (!msg._id) {
            console.error(
              "Cannot emit messageSeen: messageId is undefined",
              msg
            );
            return;
          }
          emitMessageSeen(msg.chatId, instructorId, msg._id);
          seenMessagesRef.current.add(msg._id);
        }
      },
    });

    const isSender = msg.sender === instructorId;

    const reactionCounts =
      msg.reactions?.reduce((acc, r) => {
        acc[r.reaction] = (acc[r.reaction] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    const userReaction = msg.reactions?.find(
      (r) => r.userId === instructorId
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
                {dayjs(msg.createdAt).format("h:mm A")}
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
                </button>
              ))}
            </div>
          )}

          {/* Emoji Picker */}
          {showPicker && (
            <div className={`absolute z-50 ${isSender ? "right-0" : "left-0"}`}>
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

interface MessageListProps {
  messages: Message[];
  instructorId: string;
  getTickColor: (msg: Message) => string;
  seenMessagesRef: React.MutableRefObject<Set<string>>;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  handleDeleteMessage: (messageId: string, chatId: string) => void;
  handleAddReaction: (
    messageId: string,
    chatId: string,
    reaction: string
  ) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  instructorId,
  getTickColor,
  seenMessagesRef,
  scrollAreaRef,
  handleDeleteMessage,
  handleAddReaction,
}) => {
  useEffect(() => {
    messages.forEach((msg, index) => {
      if (!msg._id) {
        console.error(`Message at index ${index} has undefined id:`, msg);
      }
    });
  }, [messages]);

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
          key={msg._id || `message-${index}`}
          msg={msg}
          instructorId={instructorId}
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
      className="message-list"
      outerRef={scrollAreaRef}
    >
      {Row}
    </List>
  );
};

const ChatApp: React.FC = () => {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(
    null
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [instructorId, setInstructorId] = useState<string>("");
  const [isTyping, setIsTyping] = useState<{ [chatId: string]: boolean }>({});
  const [error, setError] = useState<string>("");
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const seenMessagesRef = useRef<Set<string>>(new Set());
  const joinedChatsRef = useRef<Set<string>>(new Set());
  const isTypingRef = useRef<boolean>(false);
  const sentMessagesRef = useRef<Map<string, Message>>(new Map());

  useEffect(() => {
    if (scrollAreaRef.current && selectedContact) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [selectedContact?.messages]);

  const handleDeleteMessage = useCallback(
    (messageId: string, chatId: string) => {
      if (!messageId || !chatId) {
        console.error("Invalid parameters for deleteMessage:", {
          messageId,
          chatId,
        });
        return;
      }
      socket.emit("deleteMessage", { chatId, messageId, userId: instructorId });
    },
    [instructorId]
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
        userId: instructorId,
        reaction,
      });
    },
    [instructorId]
  );

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const instructor = await instructorAPI.getProfile();
        setInstructorId(instructor.profile._id);
        socket.emit("set-role", {
          role: "instructor",
          userId: instructor.profile._id,
        });

        const res = await instructorAPI.getAllChats();
        interface ChatApiResponse {
          _id: string;
          studentDetails?: {
            firstName?: string;
            lastName?: string;
            profileImage?: string;
            _id?: string;
          };
          userLastSeen?: string;
          instructorLastSeen?: string;
          unreadCount?: number;
          lastMessage?: string;
          lastMessageTime?: string;
        }

        const formattedContacts: ChatContact[] = res.data.data.map(
          (chat: ChatApiResponse) => ({
            id: chat._id,
            name: `${chat.studentDetails?.firstName || ""}${
              chat.studentDetails?.lastName
                ? " " + chat.studentDetails.lastName
                : ""
            }`,
            avatar: chat.studentDetails?.profileImage || "",
            lastSeen: chat.userLastSeen || new Date().toISOString(),
            lastMessage: chat.lastMessage || "No messages yet",
            lastMessageTime: chat.lastMessageTime,
            messages: [],
            unseenCount: chat.unreadCount || 0,
            studentId: chat.studentDetails?._id || "",
          })
        );

        formattedContacts.sort((a, b) => {
          const aTime = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0;
          const bTime = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          return bTime - aTime;
        });

        setContacts(formattedContacts);

        formattedContacts.forEach((contact) => {
          if (!joinedChatsRef.current.has(contact.id)) {
            socket.emit("joinChat", contact.id);
            joinedChatsRef.current.add(contact.id);
          }
        });
      } catch {
        setError("Failed to load chats");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchChats();

    socket.on("connect_error", (err: Error) =>
      setError(`Chat server error: ${err.message}`)
    );
    socket.on("error", (err: { error: string }) =>
      setError(err.error || "An error occurred")
    );
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
        setContacts((prev) =>
          prev.map((contact) =>
            contact.studentId === userId
              ? {
                  ...contact,
                  lastSeen: status === "online" ? "online" : lastSeen,
                }
              : contact
          )
        );
      }
    );
    socket.on("newMessage", (message: Message) => {
      const tempMessage = Array.from(sentMessagesRef.current.entries()).find(
        ([, msg]) =>
          msg.chatId === message.chatId &&
          msg.text === message.text &&
          msg.sender === message.sender &&
          Math.abs(
            new Date(msg.createdAt).getTime() -
              new Date(message.createdAt).getTime()
          ) < 1000
      );

      if (tempMessage) {
        const [tempId] = tempMessage;
        sentMessagesRef.current.delete(tempId);

        setContacts((prev) =>
          prev
            .map((contact) =>
              contact.id === message.chatId
                ? {
                    ...contact,
                    messages: contact.messages.map((msg) =>
                      msg._id === tempId ? message : msg
                    ),
                    lastMessage: message.text,
                    lastMessageTime: message.createdAt,
                  }
                : contact
            )
            .sort((a, b) => {
              const aTime = a.lastMessageTime
                ? new Date(a.lastMessageTime).getTime()
                : 0;
              const bTime = b.lastMessageTime
                ? new Date(b.lastMessageTime).getTime()
                : 0;
              return bTime - aTime;
            })
        );

        if (selectedContact?.id === message.chatId) {
          setSelectedContact((prev) =>
            prev
              ? {
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg._id === tempId ? message : msg
                  ),
                  lastMessage: message.text,
                  lastMessageTime: message.createdAt,
                }
              : prev
          );
        }
        return;
      }

      setContacts((prev) =>
        prev
          .map((contact) =>
            contact.id === message.chatId
              ? {
                  ...contact,
                  messages: [...contact.messages, message],
                  lastMessage: message.text,
                  lastMessageTime: message.createdAt,
                }
              : contact
          )
          .sort((a, b) => {
            const aTime = a.lastMessageTime
              ? new Date(a.lastMessageTime).getTime()
              : 0;
            const bTime = b.lastMessageTime
              ? new Date(b.lastMessageTime).getTime()
              : 0;
            return bTime - aTime;
          })
      );
      if (selectedContact?.id === message.chatId) {
        setSelectedContact((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, message],
                lastMessage: message.text,
                lastMessageTime: message.createdAt,
              }
            : prev
        );
      }
    });
    socket.on("messageUpdated", (updatedMessage: Message) => {
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === updatedMessage.chatId
            ? {
                ...contact,
                messages: contact.messages.map((msg) =>
                  msg._id === updatedMessage._id ? updatedMessage : msg
                ),
              }
            : contact
        )
      );
      if (selectedContact?.id === updatedMessage.chatId) {
        setSelectedContact((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.map((msg) =>
                  msg._id === updatedMessage._id ? updatedMessage : msg
                ),
              }
            : prev
        );
      }
    });
    socket.on(
      "messageDeleted",
      ({ messageId, chatId }: { messageId: string; chatId: string }) => {
        if (!messageId || !chatId) {
          console.error("Invalid messageDeleted event:", { messageId, chatId });
          return;
        }
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === chatId
              ? {
                  ...contact,
                  messages: contact.messages.map((msg) =>
                    msg._id === messageId
                      ? {
                          ...msg,
                          deleted: true,
                          text: "This message was deleted",
                        }
                      : msg
                  ),
                }
              : contact
          )
        );
        if (selectedContact?.id === chatId) {
          setSelectedContact((prev) =>
            prev
              ? {
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg._id === messageId
                      ? {
                          ...msg,
                          deleted: true,
                          text: "This message was deleted",
                        }
                      : msg
                  ),
                }
              : prev
          );
        }
      }
    );
    socket.on(
      "unseenCount",
      ({ chatId, count }: { chatId: string; count: number }) => {
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === chatId ? { ...contact, unseenCount: count } : contact
          )
        );
      }
    );
    socket.on(
      "typing",
      ({ chatId, sender }: { chatId: string; sender: string }) => {
        if (sender !== instructorId)
          setIsTyping((prev) => ({ ...prev, [chatId]: true }));
      }
    );
    socket.on(
      "stopTyping",
      ({ chatId, sender }: { chatId: string; sender: string }) => {
        if (sender !== instructorId)
          setIsTyping((prev) => ({ ...prev, [chatId]: false }));
      }
    );
    socket.on(
      "chatUpdated",
      ({
        chatId,
        lastMessage,
        lastMessageTime,
      }: {
        chatId: string;
        lastMessage: string;
        lastMessageTime: string;
      }) => {
        setContacts((prev) =>
          [...prev]
            .map((contact) =>
              contact.id === chatId
                ? { ...contact, lastMessage, lastMessageTime }
                : contact
            )
            .sort((a, b) => {
              const aTime = a.lastMessageTime
                ? new Date(a.lastMessageTime).getTime()
                : 0;
              const bTime = b.lastMessageTime
                ? new Date(b.lastMessageTime).getTime()
                : 0;
              return bTime - aTime;
            })
        );
      }
    );

    return () => {
      socket.off("connect_error");
      socket.off("error");
      socket.off("userStatus");
      socket.off("newMessage");
      socket.off("messageUpdated");
      socket.off("messageDeleted");
      socket.off("unseenCount");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("chatUpdated");
    };
  }, [instructorId, selectedContact]);

  const handleContactClick = useCallback(async (contact: ChatContact) => {
    try {
      if (!joinedChatsRef.current.has(contact.id)) {
        socket.emit("joinChat", contact.id);
        joinedChatsRef.current.add(contact.id);
      }
      const res = await instructorAPI.getMessages(contact.id);
      interface ApiMessage {
        _id: string;
        chatId: string;
        text: string;
        sender: string;
        createdAt: string;
        seenBy?: string[];
        reactions?: Reaction[];
        deleted?: boolean;
      }
      const formattedMessages: Message[] = res.data.map((msg: ApiMessage) => ({
        _id: msg._id,
        chatId: msg.chatId,
        text: msg.text,
        sender: msg.sender,
        createdAt: msg.createdAt,
        seenBy: msg.seenBy || [],
        reactions: msg.reactions || [],
        deleted: msg.deleted || false,
      }));

      setSelectedContact({ ...contact, messages: formattedMessages });
      setError("");
    } catch {
      setError("Failed to load messages");
    }
  }, []);

  const handleTyping = useCallback(() => {
    if (!selectedContact || !instructorId || !newMessage.trim()) {
      if (isTypingRef.current) {
        socket.emit("stopTyping", {
          chatId: selectedContact?.id,
          sender: instructorId,
        });
        isTypingRef.current = false;
      }
      return;
    }
    if (!isTypingRef.current) {
      socket.emit("typing", {
        chatId: selectedContact.id,
        sender: instructorId,
      });
      isTypingRef.current = true;
    }
  }, [selectedContact, instructorId, newMessage]);

  const handleStopTyping = useCallback(() => {
    if (isTypingRef.current && selectedContact) {
      socket.emit("stopTyping", {
        chatId: selectedContact.id,
        sender: instructorId,
      });
      isTypingRef.current = false;
    }
  }, [selectedContact, instructorId]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedContact || !instructorId) {
      setError("Please select a contact and enter a message");
      return;
    }

    const tempMessageId = `temp-${Date.now()}`;
    const newMsg: Message = {
      _id: tempMessageId,
      chatId: selectedContact.id,
      text: newMessage.trim(),
      sender: instructorId,
      createdAt: new Date().toISOString(),
      seenBy: [instructorId],
      reactions: [],
      deleted: false,
    };

    sentMessagesRef.current.set(tempMessageId, newMsg);

    setSelectedContact((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, newMsg],
            lastMessage: newMsg.text,
            lastMessageTime: newMsg.createdAt,
          }
        : prev
    );
    setContacts((prev) =>
      prev
        .map((contact) =>
          contact.id === selectedContact.id
            ? {
                ...contact,
                lastMessage: newMsg.text,
                lastMessageTime: newMsg.createdAt,
              }
            : contact
        )
        .sort((a, b) => {
          const aTime = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0;
          const bTime = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          return bTime - aTime;
        })
    );

    setNewMessage("");
    handleStopTyping();

    try {
      socket.emit("sendMessage", {
        chatId: selectedContact.id,
        text: newMsg.text,
        sender: instructorId,
      });
      setError("");
    } catch {
      setError("Failed to send message");
      setSelectedContact((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((msg) => msg._id !== tempMessageId),
            }
          : prev
      );
      sentMessagesRef.current.delete(tempMessageId);
    }
  }, [newMessage, selectedContact, instructorId, handleStopTyping]);

  const getTickColor = useCallback(
    (msg: Message): string =>
      msg.seenBy.includes(selectedContact?.studentId || "")
        ? "text-blue-400"
        : "text-gray-400",
    [selectedContact]
  );

  return (
    <>
      <Navbar />
      <div className="flex h-[80vh] w-full border rounded-lg overflow-hidden bg-gray-50">
        <Sidebar />
        <Card className="w-1/3 border-r bg-white">
          <CardContent className="p-2 h-full overflow-y-auto">
            {isInitialLoading ? (
              <div className="space-y-2">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <SkeletonChatItem key={index} />
                  ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No chats available
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactClick(contact)}
                  className={cn(
                    "flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200",
                    selectedContact?.id === contact.id && "bg-indigo-50"
                  )}
                >
                  {contact.avatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.name || "Student"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Icon
                        icon="mdi:account"
                        className="w-6 h-6 text-gray-500"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {contact.lastMessage || "No messages yet"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {contact.lastMessageTime
                        ? dayjs(contact.lastMessageTime).fromNow()
                        : ""}
                    </p>
                  </div>
                  {contact.unseenCount > 0 && (
                    <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {contact.unseenCount}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="w-2/3 flex flex-col bg-white">
          {error && (
            <div className="bg-red-100 text-red-700 p-2 text-center">
              {error}
            </div>
          )}
          {selectedContact ? (
            <>
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <ScrollArea className="h-full pr-2" ref={scrollAreaRef}>
                  {selectedContact.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <MessageList
                      messages={selectedContact.messages}
                      instructorId={instructorId}
                      getTickColor={getTickColor}
                      seenMessagesRef={seenMessagesRef}
                      scrollAreaRef={scrollAreaRef}
                      handleDeleteMessage={handleDeleteMessage}
                      handleAddReaction={handleAddReaction}
                    />
                  )}
                  {isTyping[selectedContact.id] && (
                    <div className="text-sm text-gray-500 animate-pulse">
                      Student is typing...
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <Separator />
              <div className="p-4 flex items-center space-x-2 border-t bg-gray-50">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                    if (!e.target.value.trim()) handleStopTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-white transition-all duration-200"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                >
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a chat to start messaging.
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default ChatApp;
