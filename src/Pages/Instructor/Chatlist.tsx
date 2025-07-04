// import React, { memo } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { cn } from "@/lib/utils";
// import { Icon } from "@iconify/react";
// import dayjs from "dayjs";

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

// interface Message {
//   id: string;
//   text: string;
//   sender: string;
//   chatId: string;
//   createdAt: string;
//   seenBy: string[];
//   isPending?: boolean;
// }

// interface ChatListProps {
//   instructorId: string;
//   contacts: ChatContact[];
//   selectedContact: ChatContact | null;
//   setSelectedContact: (contact: ChatContact | null) => void;
//   setError: (error: string) => void;
//   handleContactClick: (contact: ChatContact) => void;
//   socket: Socket | null;
// }

// const SkeletonChatItem: React.FC = () => (
//   <div className="flex items-center space-x-3 p-2 animate-pulse">
//     <div className="w-10 h-10 rounded-full bg-gray-200"></div>
//     <div className="flex-1">
//       <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//       <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//     </div>
//     <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
//   </div>
// );

// const ChatList: React.FC<ChatListProps> = memo(
//   ({
//     instructorId,
//     contacts,
//     selectedContact,
//     setSelectedContact,
//     setError,
//     handleContactClick,
//   }) => {
//     return (
//       <Card className="w-1/3 border-r bg-white">
//         <CardContent className="p-2 h-full overflow-y-auto">
//           {contacts.length === 0 ? (
//             <div className="text-center text-gray-500 py-4">
//               No chats available
//             </div>
//           ) : (
//             contacts.map((contact) => (
//               <div
//                 key={contact.id}
//                 onClick={() => {
//                   handleContactClick(contact);
//                   setSelectedContact(contact);
//                 }}
//                 className={cn(
//                   "flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200",
//                   selectedContact?.id === contact.id && "bg-indigo-50"
//                 )}
//               >
//                 {contact.avatar ? (
//                   <img
//                     src={contact.avatar}
//                     alt={contact.name || "Student"}
//                     className="w-10 h-10 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
//                     <Icon
//                       icon="mdi:account"
//                       className="w-6 h-6 text-gray-500"
//                     />
//                   </div>
//                 )}
//                 <div className="flex-1 min-w-0">
//                   <p className="font-medium text-gray-900 truncate">
//                     {contact.name}
//                   </p>
//                   <p className="text-xs text-gray-500 truncate max-w-[200px]">
//                     {contact.lastMessage || "No messages yet"}
//                   </p>
//                   <p className="text-xs text-gray-400">
//                     {contact.lastMessageTime
//                       ? dayjs(contact.lastMessageTime).fromNow()
//                       : ""}
//                   </p>
//                 </div>
//                 {contact.unseenCount > 0 && (
//                   <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
//                     {contact.unseenCount}
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </CardContent>
//       </Card>
//     );
//   },
//   (prevProps, nextProps) => {
//     return (
//       prevProps.instructorId === nextProps.instructorId &&
//       prevProps.contacts === nextProps.contacts &&
//       prevProps.selectedContact?.id === nextProps.selectedContact?.id
//     );
//   }
// );

// export default ChatList;
