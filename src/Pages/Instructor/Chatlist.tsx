import React, { useEffect, useState } from "react";
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

const baseUri = import.meta.env.VITE_BASE_URL;

const socket = io(baseUri, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

type Message = {
  id: string;
  text: string;
  sender: string;
  chatId: string;
  createdAt: string;
};

type ChatContact = {
  id: string;
  name: string;
  avatar: string;
  lastSeen: string;
  messages: Message[];
};

const ChatApp: React.FC = () => {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");
  const [instructorId, setInstructorId] = useState<string>("");
  const [isTyping, setIsTyping] = useState<{ [chatId: string]: boolean }>({});
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const instructor = await instructorAPI.getProfile();
        setInstructorId(instructor.profile._id);
        const res = await instructorAPI.getAllChats();
        const formattedContacts = res.data.data.map((chat: any) => ({
          id: chat._id,
          name: `${chat.studentDetails?.firstName} ${chat.studentDetails?.lastName}`,
          avatar: chat?.studentDetails?.profileImage || "/default-avatar.png",
          lastSeen: chat.student?.lastSeen || "online",
          messages: [],
        }));
        setContacts(formattedContacts);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("newMessage", (message: Message) => {
      if (!selectedContact || selectedContact.id !== message.chatId) return;
      setSelectedContact((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.some((msg) => msg.id === message.id)
                ? prev.messages.map((msg) =>
                    msg.id === message.id ? message : msg
                  )
                : [...prev.messages, message],
            }
          : prev
      );
    });

    socket.on("typing", (data: { chatId: string; sender: string }) => {
      if (data.chatId === selectedContact?.id && data.sender !== instructorId) {
        setIsTyping((prev) => ({ ...prev, [data.chatId]: true }));
      }
    });

    socket.on("stopTyping", (data: { chatId: string; sender: string }) => {
      if (data.chatId === selectedContact?.id && data.sender !== instructorId) {
        setIsTyping((prev) => ({ ...prev, [data.chatId]: false }));
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("connect");
      socket.off("error");
    };
  }, [selectedContact, instructorId]);

  const handleContactClick = async (contact: ChatContact) => {
    socket.emit("joinChat", contact.id);
    try {
      const res = await instructorAPI.getMessages(contact.id);
      const formattedMessages = res.data.map((msg: any) => ({
        id: msg._id,
        chatId: msg._id,
        text: msg.text,
        sender: msg.sender,
        createdAt: msg.createdAt,
      }));
      setSelectedContact({ ...contact, messages: formattedMessages });
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleTyping = () => {
    if (!selectedContact || !newMessage.trim()) {
      if (typingTimeout) {
        socket.emit("stopTyping", {
          chatId: selectedContact?.id,
          sender: instructorId,
        });
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      return;
    }

    socket.emit("typing", { chatId: selectedContact.id, sender: instructorId });

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedContact.id,
        sender: instructorId,
      });
      setTypingTimeout(null);
    }, 3000);
    setTypingTimeout(timeout);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !instructorId) return;

    socket.emit("sendMessage", {
      chatId: selectedContact.id,
      sender: instructorId,
      text: newMessage,
    });

    setNewMessage("");
  };

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
                <img
                  src={`${baseUri}/${contact.avatar}`}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {contact.lastSeen}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="w-2/3 flex flex-col">
          {selectedContact ? (
            <>
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <ScrollArea className="h-full pr-2">
                  {selectedContact.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === instructorId
                          ? "justify-end"
                          : "justify-start"
                      } mb-2`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-xs ${
                          msg.sender === instructorId
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.text}
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
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
