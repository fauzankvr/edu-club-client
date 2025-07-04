// import React, { useRef, useEffect, memo } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";
// import { Icon } from "@iconify/react";
// import { useInView } from "react-intersection-observer";
// import { FixedSizeList as List } from "react-window";
// import { debounce } from "lodash";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// import { Socket } from "socket.io-client";

// dayjs.extend(relativeTime);

// interface Message {
//   id: string;
//   text: string;
//   sender: string;
//   chatId: string;
//   createdAt: string;
//   seenBy: string[];
//   isPending?: boolean;
// }

// interface ChatContact {
//   id: string;
//   name: string;
//   avatar: string;
//   lastSeen: string;
//   lastMessage?: string;
//   lastMessageTime?: string;
//   messages: Message[];
//   unseenCount: number;
//   studentId: string;
// }

// interface MessageItemProps {
//   msg: Message;
//   instructorId: string;
//   getTickColor: (msg: Message) => string;
//   seenMessagesRef: React.MutableRefObject<Set<string>>;
//   socket: Socket | null;
// }

// const SkeletonMessageItem: React.FC = () => (
//   <div className="flex mb-4 px-2 animate-pulse">
//     <div className="px-4 py-2 max-w-xs bg-gray-200 rounded-2xl">
//       <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
//       <div className="h-3 bg-gray-300 rounded w-1/4"></div>
//     </div>
//   </div>
// );

// const MessageItem: React.FC<MessageItemProps> = memo(
//   ({ msg, instructorId, getTickColor, seenMessagesRef, socket }) => {
//     const emitMessageSeen = debounce(
//       (chatId: string, userId: string, messageId: string) => {
//         console.log("Emitting messageSeen:", { chatId, userId, messageId });
//         socket?.emit("messageSeen", { chatId, userId, messageId });
//       },
//       500
//     );

//     const { ref } = useInView({
//       threshold: 0.8,
//       triggerOnce: true,
//       onChange: (inView) => {
//         if (
//           inView &&
//           !msg.seenBy.includes(instructorId) &&
//           msg.sender !== instructorId &&
//           !seenMessagesRef.current.has(msg.id)
//         ) {
//           emitMessageSeen(msg.chatId, instructorId, msg.id);
//           seenMessagesRef.current.add(msg.id);
//         }
//       },
//     });

//     return (
//       <div
//         ref={ref}
//         className={cn(
//           "flex mb-4 px-2 transition-all duration-200",
//           msg.sender === instructorId ? "justify-end" : "justify-start"
//         )}
//       >
//         <div
//           className={cn(
//             "px-4 py-2 max-w-xs relative text-sm shadow-md rounded-2xl transition-colors duration-200",
//             msg.sender === instructorId
//               ? "bg-indigo-100 text-indigo-900"
//               : "bg-gray-100 text-gray-800",
//             msg.isPending && "opacity-70"
//           )}
//         >
//           {msg.text}
//           <div
//             className={cn(
//               "text-xs flex items-center space-x-1 mt-1",
//               msg.sender === instructorId
//                 ? "text-indigo-500 justify-end"
//                 : "text-gray-500"
//             )}
//           >
//             <span>{dayjs(msg.createdAt).format("h:mm A")}</span>
//             {msg.sender === instructorId && (
//               <Icon
//                 icon="mdi:check-all"
//                 className={cn("w-4 h-4", getTickColor(msg))}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// interface MessageListProps {
//   messages: Message[];
//   instructorId: string;
//   getTickColor: (msg: Message) => string;
//   seenMessagesRef: React.MutableRefObject<Set<string>>;
//   scrollAreaRef: React.RefObject<HTMLDivElement | null>;
//   socket: Socket | null;
// }

// const MessageList: React.FC<MessageListProps> = ({
//   messages,
//   instructorId,
//   getTickColor,
//   seenMessagesRef,
//   scrollAreaRef,
//   socket,
// }) => {
//   const Row = ({
//     index,
//     style,
//   }: {
//     index: number;
//     style: React.CSSProperties;
//   }) => {
//     const msg = messages[index];
//     return (
//       <div style={style}>
//         <MessageItem
//           key={msg.id}
//           msg={msg}
//           instructorId={instructorId}
//           getTickColor={getTickColor}
//           seenMessagesRef={seenMessagesRef}
//           socket={socket}
//         />
//       </div>
//     );
//   };

//   return (
//     <List
//       height={400}
//       itemCount={messages.length}
//       itemSize={60}
//       width="100%"
//       outerRef={scrollAreaRef}
//     >
//       {Row}
//     </List>
//   );
// };

// interface MessageAreaProps {
//   selectedContact: ChatContact | null;
//   instructorId: string;
//   newMessage: string;
//   setNewMessage: (value: string) => void;
//   isTyping: { [chatId: string]: boolean };
//   error: string;
//   isMessagesLoading: boolean;
//   handleSendMessage: () => void;
//   handleTyping: () => void;
//   handleStopTyping: () => void;
//   getTickColor: (msg: Message) => string;
//   seenMessagesRef: React.MutableRefObject<Set<string>>;
//   socket: Socket | null;
// }

// const MessageArea: React.FC<MessageAreaProps> = ({
//   selectedContact,
//   instructorId,
//   newMessage,
//   setNewMessage,
//   isTyping,
//   error,
//   isMessagesLoading,
//   handleSendMessage,
//   handleTyping,
//   handleStopTyping,
//   getTickColor,
//   seenMessagesRef,
//   socket,
// }) => {
//   const scrollAreaRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (scrollAreaRef.current && selectedContact?.messages) {
//       scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
//     }
//   }, [selectedContact?.messages]);

//   return (
//     <Card className="w-2/3 flex flex-col bg-white">
//       {error && (
//         <div className="bg-red-100 text-red-700 p-2 text-center">{error}</div>
//       )}
//       {selectedContact ? (
//         <>
//           <CardContent className="flex-1 p-4 overflow-y-auto">
//             <ScrollArea className="h-full pr-2" ref={scrollAreaRef}>
//               {isMessagesLoading ? (
//                 <div className="space-y-2">
//                   {Array(5)
//                     .fill(0)
//                     .map((_, index) => (
//                       <SkeletonMessageItem key={index} />
//                     ))}
//                 </div>
//               ) : selectedContact.messages.length === 0 ? (
//                 <div className="text-center text-gray-500 py-4">
//                   No messages yet. Start the conversation!
//                 </div>
//               ) : (
//                 <MessageList
//                   messages={selectedContact.messages}
//                   instructorId={instructorId}
//                   getTickColor={getTickColor}
//                   seenMessagesRef={seenMessagesRef}
//                   scrollAreaRef={scrollAreaRef}
//                   socket={socket}
//                 />
//               )}
//               {isTyping[selectedContact.id] && (
//                 <div className="text-sm text-gray-500 animate-pulse">
//                   Student is typing...
//                 </div>
//               )}
//             </ScrollArea>
//           </CardContent>
//           <Separator />
//           <div className="p-4 flex items-center space-x-2 border-t bg-gray-50">
//             <Input
//               placeholder="Type your message..."
//               value={newMessage}
//               onChange={(e) => {
//                 setNewMessage(e.target.value);
//                 handleTyping();
//                 if (!e.target.value.trim()) handleStopTyping();
//               }}
//               onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//               className="flex-1 bg-white transition-all duration-200"
//             />
//             <Button
//               onClick={handleSendMessage}
//               className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
//             >
//               Send
//             </Button>
//           </div>
//         </>
//       ) : (
//         <div className="flex items-center justify-center h-full text-gray-500">
//           Select a chat to start messaging.
//         </div>
//       )}
//     </Card>
//   );
// };

// export default MessageArea;
