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

const SkeletonMessageItem: React.FC = () => (
  <div className="flex mb-4 px-2 animate-pulse">
    <div className="px-4 py-2 max-w-xs bg-gray-200 rounded-2xl">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
    </div>
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

interface Message {
  id: string;
  text: string;
  sender: string;
  chatId: string;
  createdAt: string;
  seenBy: string[];
  isPending?: boolean; // Added to track optimistic updates
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
}

const MessageItem: React.FC<MessageItemProps> = memo(
  ({ msg, instructorId, getTickColor, seenMessagesRef }) => {
    const emitMessageSeen = debounce(
      (chatId: string, userId: string, messageId: string) => {
        socket.emit("messageSeen", { chatId, userId, messageId });
      },
      1000
    );

    const { ref } = useInView({
      threshold: 0.8,
      triggerOnce: true,
      onChange: (inView) => {
        if (
          inView &&
          !msg.seenBy.includes(instructorId) &&
          msg.sender !== instructorId &&
          !seenMessagesRef.current.has(msg.id)
        ) {
          emitMessageSeen(msg.chatId, instructorId, msg.id);
          seenMessagesRef.current.add(msg.id);
        }
      },
    });

    return (
      <div
        ref={ref}
        className={cn(
          "flex mb-4 px-2 transition-all duration-200",
          msg.sender === instructorId ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-2 max-w-xs relative text-sm shadow-md rounded-2xl transition-colors duration-200",
            msg.sender === instructorId
              ? "bg-indigo-100 text-indigo-900"
              : "bg-gray-100 text-gray-800",
            msg.isPending && "opacity-70" // Visual feedback for pending messages
          )}
        >
          {msg.text}
          <div
            className={cn(
              "text-xs flex items-center space-x-1 mt-1",
              msg.sender === instructorId
                ? "text-indigo-500 justify-end"
                : "text-gray-500"
            )}
          >
            <span>{dayjs(msg.createdAt).format("h:mm A")}</span>
            {msg.sender === instructorId && (
              <Icon
                icon="mdi:check-all"
                className={cn("w-4 h-4", getTickColor(msg))}
              />
            )}
          </div>
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
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  instructorId,
  getTickColor,
  seenMessagesRef,
  scrollAreaRef,
}) => {
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
          instructorId={instructorId}
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

const ChatApp: React.FC = () => {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(
    null
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [instructorId, setInstructorId] = useState<string>("");
  const [isTyping, setIsTyping] = useState<{ [chatId: string]: boolean }>({});
  const [error, setError] = useState<string>("");
  const [isChatListLoading, setIsChatListLoading] = useState<boolean>(true); // Separate state for chat list
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false); // Separate state for messages
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const seenMessagesRef = useRef<Set<string>>(new Set());
  const joinedChatsRef = useRef<Set<string>>(new Set());
  const isTypingRef = useRef<boolean>(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current && selectedContact) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [selectedContact?.messages]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsChatListLoading(true);
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
        setIsChatListLoading(false);
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
      setContacts((prev) =>
        prev
          .map((contact) =>
            contact.id === message.chatId
              ? {
                  ...contact,
                  messages: contact.messages.some(
                    (msg) => msg.id === message.id
                  )
                    ? contact.messages
                    : [...contact.messages, { ...message, isPending: false }],
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
                messages: prev.messages.some((msg) => msg.id === message.id)
                  ? prev.messages
                  : [...prev.messages, { ...message, isPending: false }],
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
                  msg.id === updatedMessage.id
                    ? { ...updatedMessage, isPending: false }
                    : msg
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
                  msg.id === updatedMessage.id
                    ? { ...updatedMessage, isPending: false }
                    : msg
                ),
              }
            : prev
        );
      }
    });
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
      socket.off("unseenCount");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("chatUpdated");
    };
  }, [instructorId, selectedContact]);

  const handleContactClick = useCallback(async (contact: ChatContact) => {
    try {
      setIsMessagesLoading(true);
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
      }
      const formattedMessages: Message[] = res.data.map((msg: ApiMessage) => ({
        id: msg._id,
        chatId: msg.chatId,
        text: msg.text,
        sender: msg.sender,
        createdAt: msg.createdAt,
        seenBy: msg.seenBy || [],
        isPending: false,
      }));

      setSelectedContact({ ...contact, messages: formattedMessages });
      setError("");
    } catch {
      setError("Failed to load messages");
    } finally {
      setIsMessagesLoading(false);
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

    // Optimistic update: Add the message locally before server response
    const tempMessageId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempMessageId,
      chatId: selectedContact.id,
      text: newMessage.trim(),
      sender: instructorId,
      createdAt: new Date().toISOString(),
      seenBy: [instructorId],
      isPending: true,
    };

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
      // Optionally, remove the optimistic message if the server fails
      setSelectedContact((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((msg) => msg.id !== tempMessageId),
            }
          : prev
      );
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
            {isChatListLoading ? (
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
                  {isMessagesLoading ? (
                    <div className="space-y-2">
                      {Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <SkeletonMessageItem key={index} />
                        ))}
                    </div>
                  ) : selectedContact.messages.length === 0 ? (
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