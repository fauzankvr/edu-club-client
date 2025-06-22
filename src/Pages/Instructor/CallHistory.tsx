// src/components/CallHistory.tsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Sidebar from "./Sidbar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Navbar from "@/components/InstructorCompontents/Navbar";
import { getSocket } from "@/services/socketService";
import instructorAPI from "@/API/InstructorApi";
// import { v4 as uuidv4 } from "uuid";
// import { useNavigate } from "react-router-dom";

interface Call {
  _id: string;
  callerName: string;
  callerId: string;
  receiverId: string;
  startedAt: string;
  roomId: string;
  avatar?: string;
}

interface IncomingCall {
  fromUserId: string;
  name: string;
  chatId: string;
  roomId: string;
}

export default function CallHistory() {
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [instructorId, setInstructorId] = useState<string>("");
  // const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();

    const setupSocket = async () => {
      try {
        const instructor = await instructorAPI.getProfile();
        setInstructorId(instructor.profile._id);
        socket.emit("set-role", {
          role: "instructor",
          userId: instructor.profile._id,
        });

        const callHistoryData = await instructorAPI.getCallhistory(
          instructor.profile._id
        );
        setCallHistory(callHistoryData.data);

        socket.on(
          "incoming-call",
          ({ fromUserId, name, chatId, roomId }: IncomingCall) => {
            setIncomingCall({ fromUserId, name, chatId, roomId });
            
          }
        );

        socket.on("connect_error", (err) =>
          console.error("Socket connection error:", err.message)
        );
      } catch (err) {
        console.error("Failed to set up socket:", err);
      }
    };

    socket.on("connect", () => {
      console.log(`Socket connected: ${socket.id}`);
      setupSocket();
    });

    return () => {
      // socket.off("incoming-call");
      // socket.off("connect_error");
      // socket.off("connect");
    };
  }, []);

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    const { fromUserId, chatId, roomId } = incomingCall;
    const socket = getSocket();
    socket.emit("call-accepted", { toUserId: fromUserId, roomId });
    const videoCallUrl = `/Instructor/dashboard/video-call?chatId=${chatId}&instructorId=${instructorId}&studentId=${fromUserId}&roomId=${roomId}`;
    window.open(videoCallUrl, "_blank");
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    const socket = getSocket();
    socket.emit("reject-call", { toUserId: incomingCall.fromUserId });
    setIncomingCall(null);
  };

  // const handleRecall = (callerId: string) => {
  //   const socket = getSocket();
  //   const newRoomId = uuidv4();
  //   socket.emit("recall", { targetUserId: callerId, roomId: newRoomId });
  // };

  return (
    <>
      <Navbar />
      <div className="flex h-screen">
        <Sidebar />
        <Card className="w-1/3 border-r">
          <CardContent className="p-2 h-full overflow-y-auto">
            {incomingCall && (
              <div className="p-4 mb-2 bg-blue-100 rounded-md border border-blue-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                      <Icon icon="mdi:account" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">
                        {incomingCall.name} is calling...
                      </p>
                      <p className="text-sm text-blue-600">Incoming Call</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAcceptCall}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Accept
                    </Button>
                    <Button onClick={handleRejectCall} variant="destructive">
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {callHistory.map((call) => (
              <div
                key={call._id}
                onClick={() => setSelectedCallId(call._id)}
                className={cn(
                  "flex items-center justify-between space-x-2 p-2 cursor-pointer hover:bg-muted rounded-md",
                  selectedCallId === call._id && "bg-muted"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <Icon icon="mdi:account" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{call.callerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(call.startedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                {/* <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRecall(call.callerId)}
                >
                  Recall
                </Button> */}
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex-1 p-4">
          {selectedCallId ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Call Details</h2>
              {callHistory
                .filter((call) => call._id === selectedCallId)
                .map((call) => (
                  <div key={call._id}>
                    <p>
                      Name: <strong>{call.callerName}</strong>
                    </p>
                    <p>
                      Time:{" "}
                      {formatDistanceToNow(new Date(call.startedAt), {
                        addSuffix: true,
                      })}
                    </p>
                    {/* <Button onClick={() => handleRecall(call.callerId)}>
                      Recall Again
                    </Button> */}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Select a call to view details
            </p>
          )}
        </div>
      </div>
    </>
  );
}
