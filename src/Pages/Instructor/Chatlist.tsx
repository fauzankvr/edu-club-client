import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import instructorAPI from "@/API/InstructorApi";
import io from "socket.io-client";
import Navbar from "@/components/InstructorCompontents/Navbar";
import Sidebar from "./Sidbar";
import { Icon } from "@iconify/react";
import { useInView } from "react-intersection-observer";
import { FixedSizeList as List } from "react-window";
import { debounce } from "lodash";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";


dayjs.extend(relativeTime);

const baseUri = import.meta.env.VITE_BASE_URL;
const socket = io(baseUri, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export type Message = {
  id: string;
  text: string;
  sender: string;
  chatId: string;
  createdAt: string;
  seenBy: string[];
};

type ChatContact = {
  id: string;
  name: string;
  avatar: string;
  lastSeen: string;
  messages: Message[];
  unseenCount: number;
  studentId: string;
};

interface MessageItemProps {
  msg: Message;
  instructorId: string;
  getTickColor: (msg: Message) => string;
  seenMessagesRef: React.MutableRefObject<Set<string>>;
}

const MessageItem: React.FC<MessageItemProps> = memo(
  ({ msg, instructorId, getTickColor, seenMessagesRef }) => {
    const emitMessageSeen = debounce((chatId, userId, messageId) => {
      socket.emit("messageSeen", { chatId, userId, messageId });
    }, 1000);

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
        className={`flex mb-4 px-2 ${
          msg.sender === instructorId ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`px-4 py-2 max-w-xs relative text-sm shadow-md ${
            msg.sender === instructorId
              ? "bg-indigo-200 text-indigo-900 rounded-tl-2xl rounded-bl-2xl rounded-br-sm"
              : "bg-gray-200 text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-bl-sm"
          }`}
        >
          {msg.text}
          <div
            className={`text-xs flex items-center space-x-1 mt-1 ${
              msg.sender === instructorId
                ? "text-indigo-500 justify-end"
                : "text-gray-500"
            }`}
          >
            <span>
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {msg.sender === instructorId && (
              <Icon
                icon="mdi:check-all"
                className={`w-4 h-4 ${getTickColor(msg)}`}
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
  const [newMessage, setNewMessage] = useState("");
  const [instructorId, setInstructorId] = useState<string>("");
  const [isTyping, setIsTyping] = useState<{ [chatId: string]: boolean }>({});
  const [error, setError] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const seenMessagesRef = useRef<Set<string>>(new Set());
  const joinedChatsRef = useRef<Set<string>>(new Set());
  const isTypingRef = useRef<boolean>(false);

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
        type ChatApiResponse = {
          _id: string;
          studentDetails?: {
            firstName?: string;
            lastName?: string;
            profileImage?: string;
            _id?: string;
          };
          userLastSeen?: string;
          unreadCount?: number;
        };

        const formattedContacts = res.data.data.map((chat: ChatApiResponse) => ({
          id: chat._id,
          name: `${chat.studentDetails?.firstName || ""}${
            chat.studentDetails?.lastName
              ? " " + chat.studentDetails.lastName
              : ""
          }`,
          avatar: chat?.studentDetails?.profileImage || "",
          lastSeen: chat?.userLastSeen || new Date().toISOString(),
          messages: [],
          unseenCount: chat.unreadCount || 0,
          studentId: chat.studentDetails?._id || "",
        }));
        setContacts(formattedContacts);

        formattedContacts.forEach((contact: ChatContact) => {
          if (!joinedChatsRef.current.has(contact.id)) {
            socket.emit("joinChat", contact.id);
            joinedChatsRef.current.add(contact.id);
          }
        });
      } catch {
        setError("Failed to load chats");
      }
    };

    fetchChats();

    socket.on("connect_error", (err) =>
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
        prev.map((contact) =>
          contact.id === message.chatId
            ? {
                ...contact,
                messages: contact.messages.some((msg) => msg.id === message.id)
                  ? contact.messages
                  : [...contact.messages, message],
              }
            : contact
        )
      );
      if (selectedContact?.id === message.chatId) {
        setSelectedContact((prev) =>
          prev ? { ...prev, messages: [...prev.messages, message] } : prev
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
                  msg.id === updatedMessage.id ? updatedMessage : msg
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
                  msg.id === updatedMessage.id ? updatedMessage : msg
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

    return () => {
      socket.off("connect_error");
      socket.off("error");
      socket.off("userStatus");
      socket.off("newMessage");
      socket.off("messageUpdated");
      socket.off("unseenCount");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [instructorId, selectedContact]);

  const handleContactClick = async (contact: ChatContact) => {
    try {
      if (!joinedChatsRef.current.has(contact.id)) {
        socket.emit("joinChat", contact.id);
        joinedChatsRef.current.add(contact.id);
      }
      const res = await instructorAPI.getMessages(contact.id);
      type ApiMessage = {
        _id: string;
        chatId: string;
        text: string;
        sender: string;
        createdAt: string;
        seenBy?: string[];
      };
      const formattedMessages = res.data.map((msg: ApiMessage) => ({
        id: msg._id,
        chatId: msg.chatId,
        text: msg.text,
        sender: msg.sender,
        createdAt: msg.createdAt,
        seenBy: msg.seenBy || [],
      }));
      setSelectedContact({ ...contact, messages: formattedMessages });
      setError("");
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    } catch {
      setError("Failed to load messages");
    }
  };

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !instructorId) {
      setError("Please select a contact and enter a message");
      return;
    }
    try {
      socket.emit("sendMessage", {
        chatId: selectedContact.id,
        text: newMessage.trim(),
        sender: instructorId,
      });
      setNewMessage("");
      setError("");
      handleStopTyping();
    } catch {
      setError("Failed to send message");
    }
  };

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
      <div className="flex h-[80vh] w-full border rounded-lg overflow-hidden">
        <Sidebar />
        <Card className="w-1/3 border-r">
          <CardContent className="p-2 h-full overflow-y-auto">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactClick(contact)}
                className={cn(
                  "flex items-center space-x-3 p-2 cursor-pointer hover:bg-muted rounded-md",
                  selectedContact?.id === contact.id && "bg-muted"
                )}
              >
                {contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.name || "Student"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <Icon icon="mdi:account" className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{contact.name}</p>
                  {/* <p className="text-sm text-muted-foreground">
                    {contact.lastSeen === "online"
                      ? "Online"
                      : dayjs(contact.lastSeen).fromNow()}
                  </p> */}
                </div>
                {contact.unseenCount > 0 && (
                  <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {contact.unseenCount}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="w-2/3 flex flex-col">
          {error && (
            <div className="bg-red-100 text-red-700 p-2 text-center">
              {error}
            </div>
          )}
          {selectedContact ? (
            <>
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <ScrollArea className="h-full pr-2" ref={scrollAreaRef}>
                  <MessageList
                    messages={selectedContact.messages}
                    instructorId={instructorId}
                    getTickColor={getTickColor}
                    seenMessagesRef={seenMessagesRef}
                    scrollAreaRef={scrollAreaRef}
                  />
                  {isTyping[selectedContact.id] && (
                    <div className="text-sm text-gray-500">
                      Student is typing...
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <Separator />
              <div className="p-4 flex items-center space-x-2 border-t">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                    if (!e.target.value.trim()) handleStopTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a chat to start messaging.
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default ChatApp;
