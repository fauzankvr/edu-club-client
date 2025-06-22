import { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Monitor,
  X,
  Send,
} from "lucide-react";
import { getSocket } from "@/services/socketService";
import { useLocation } from "react-router-dom";
import studentAPI from "@/API/StudentApi";

interface Message {
  id: string;
  chatId: string;
  sender: string;
  text: string;
  createdAt: string;
  seenBy: string[];
}

export default function StudentVideoCallApp() {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [callStatus, setCallStatus] = useState<string>("waiting");
  const [error, setError] = useState<string>("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const chatId = query.get("chatId") || "";
  const instructorId = query.get("instructorId") || "";
  const studentId = query.get("studentId") || "";
  const roomId = query.get("roomId") || "";

  useEffect(() => {
    console.log(callStatus);
  });

  // In both StudentVideoCallApp.tsx and InstructorVideoCallApp.tsx
  const createPeer = (targetUserId: string): RTCPeerConnection => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun.relay.metered.ca:80" },
        {
          urls: "turn:standard.relay.metered.ca:80",
          username: "1009fa62ff7ee0fdc5253fcc",
          credential: "s2qiXZ0zUiDytEZS",
        },
        {
          urls: "turn:standard.relay.metered.ca:80?transport=tcp",
          username: "1009fa62ff7ee0fdc5253fcc",
          credential: "s2qiXZ0zUiDytEZS",
        },
        {
          urls: "turn:standard.relay.metered.ca:443",
          username: "1009fa62ff7ee0fdc5253fcc",
          credential: "s2qiXZ0zUiDytEZS",
        },
        {
          urls: "turns:standard.relay.metered.ca:443?transport=tcp",
          username: "1009fa62ff7ee0fdc5253fcc",
          credential: "s2qiXZ0zUiDytEZS",
        },
      ],
    });

    peer.onicecandidate = async(event) => {
      if (event.candidate) {
        console.log("ICE candidate generated:", {
          type: event.candidate.type,
          address: event.candidate.address,
          port: event.candidate.port,
          sdpMid: event.candidate.sdpMid,
          foundation: event.candidate.foundation,
          protocol: event.candidate.protocol,
        });
        console.log("Sending ICE candidate to:", targetUserId);
        const socket = getSocket(studentId);
        await new Promise((resolve) => setTimeout(resolve, 2200));
        socket.emit("signal", {
          type: "ice-candidate",
          data: event.candidate,
          targetUserId,
          roomId,
        });
      } else {
        console.log("ICE candidate gathering complete");
      }
    };

    peer.onicecandidateerror = (event: RTCPeerConnectionIceErrorEvent) => {
      console.error("ICE candidate error:", {
        errorCode: event.errorCode,
        errorText: event.errorText,
        url: event.url,
        address: event.address,
        port: event.port,
      });
      setError("Network issue detected. Trying to connect via relay server...");
    };

    peer.ontrack = (event) => {
      if (event.streams[0] && remoteVideoRef.current) {
        console.log(
          "Received remote stream:",
          event.streams[0],
          "tracks:",
          event.streams[0].getTracks()
        );
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch((e) => {
          console.error("Remote video play error:", e);
          setError(
            "Failed to play remote video. Click 'Start Video' to try again."
          );
        });
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peer.iceConnectionState);
      if (peer.iceConnectionState === "connected") {
        setCallStatus("connected");
      } else if (
        peer.iceConnectionState === "disconnected" ||
        peer.iceConnectionState === "failed"
      ) {
        setError("Connection lost. Please try again.");
        endCall();
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("Connection state:", peer.connectionState);
      if (peer.connectionState === "connected") {
        setCallStatus("connected");
      } else if (peer.connectionState === "failed") {
        setError("Failed to establish connection. Check network or try again.");
        endCall();
      }
    };

    return peer;
  };

  const startCall = async () => {
    try {
      peerRef.current = createPeer(instructorId);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((e) => {
          console.error("Local video play error:", e);
          setError("Failed to play local video. Check permissions.");
        });
      }
      stream.getTracks().forEach((track) => {
        console.log(
          "Adding track (student):",
          track.kind,
          track.id,
          track.enabled
        );
        peerRef.current!.addTrack(track, stream);
      });
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      console.log("Offer SDP:", offer.sdp);
      const socket = getSocket(studentId);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      socket.emit("signal", {
        type: "offer",
        data: offer,
        targetUserId: instructorId,
        roomId,
      });
    } catch (err) {
      console.error("Error starting call:", err);
      setError(
        "Failed to start call. Check camera and microphone permissions."
      );
      setCallStatus("waiting");
    }
  };

  useEffect(() => {
    const socket = getSocket(studentId);

    socket.on("connect", async () => {
      console.log(`Socket connected: ${socket.id}`);
      socket.emit("set-role", { role: "student", userId: studentId });
      socket.emit("join-room", roomId);
      socket.emit("joinChat", chatId);
      try {
        const student = await studentAPI.getProfile();
        socket.emit("start-call", {
          callerName: student.profile.lastName || `Student-${studentId}`,
          callerId: studentId,
          receiverUserId: instructorId,
          chatId,
          roomId,
        });
        // startCall();
      } catch (err) {
        console.error("Error initiating call:", err);
        setError("Failed to initiate call");
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
      setError(`Failed to connect to server: ${err.message}`);
    });

    socket.on("call-accepted", () => {
      setCallStatus("accepted");
      startCall(); 
    });
    

    socket.on("instructor-offline", () => {
      setError("Instructor is offline");
      setCallStatus("waiting");
    });

    socket.on("call-rejected", ({ message }) => {
      setError(message);
      setCallStatus("waiting");
      endCall();
    });

    socket.on("signal", async ({ type, data }) => {
      if (!peerRef.current) return;
      try {
        if (type === "answer")
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(data)
          );
        else if (type === "ice-candidate")
          await peerRef.current.addIceCandidate(new RTCIceCandidate(data));
      } catch (err) {
        console.error(`Error handling ${type}:`, err);
        setError("Connection error");
      }
    });

    socket.on("user-left", () => {
      setError("Instructor left the call");
      endCall();
    });

    socket.on("initialMessages", (msgs: Message[]) => {
      setMessages(msgs);
      socket.emit("messageSeen", { chatId, userId: studentId });
    });

    socket.on("newMessage", (msg: Message) => {
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
      socket.emit("messageSeen", { chatId, userId: studentId });
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("call-accepted");
      socket.off("instructor-offline");
      socket.off("call-rejected");
      socket.off("signal");
      socket.off("user-left");
      socket.off("initialMessages");
      socket.off("newMessage");
      endCall();
    };
  }, [chatId, studentId, instructorId, roomId]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isMuted));
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isVideoOn));
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        localStreamRef.current
          ?.getVideoTracks()
          .forEach((track) => track.stop());
        localStreamRef.current = screenStream;
        if (localVideoRef.current)
          localVideoRef.current.srcObject = screenStream;
        if (peerRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerRef.current
            .getSenders()
            .find((s) => s.track?.kind === "video");
          sender?.replaceTrack(videoTrack);
        }
        screenStream.getVideoTracks()[0].onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } else {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        localStreamRef.current
          ?.getVideoTracks()
          .forEach((track) => track.stop());
        localStreamRef.current = cameraStream;
        if (localVideoRef.current)
          localVideoRef.current.srcObject = cameraStream;
        if (peerRef.current) {
          const videoTrack = cameraStream.getVideoTracks()[0];
          const sender = peerRef.current
            .getSenders()
            .find((s) => s.track?.kind === "video");
          sender?.replaceTrack(videoTrack);
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error("Error toggling screen share:", err);
      setError("Failed to toggle screen share");
    }
  };

  const sendMessage = () => {
    if (message.trim() && chatId) {
      const socket = getSocket(studentId);
      const newMsg: Message = {
        id: Date.now().toString(),
        chatId,
        sender: studentId,
        text: message,
        createdAt: new Date().toISOString(),
        seenBy: [],
      };
      socket.emit("sendMessage", newMsg);
      setMessages((prev) => [...prev, newMsg]);
      setMessage("");
    }
  };

  const endCall = () => {
    if (peerRef.current) peerRef.current.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    const socket = getSocket(studentId);
    socket.emit("leave-room", roomId);
    setCallStatus("waiting");
    setError("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 p-4 rounded-md">
          {error}
        </div>
      )}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
         
          <>
            <div className="flex-1 flex flex-col md:flex-row gap-4 p-4">
              <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden relative">
                <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  You
                </div>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden relative">
                <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  Instructor
                </div>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            {isChatOpen && (
              <div className="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-700">Chat</h2>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === studentId ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.sender === studentId
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200 flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-md py-2 px-4 focus:outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-blue-500 text-white rounded-md"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        
      </div>
      <div className="bg-white border-t p-4 flex justify-center gap-4">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${
            isMuted ? "bg-gray-200" : "bg-blue-500 text-white"
          }`}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            !isVideoOn ? "bg-gray-200" : "bg-blue-500 text-white"
          }`}
        >
          {!isVideoOn ? <VideoOff size={20} /> : <Video size={20} />}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full ${
            isScreenSharing ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <Monitor size={20} />
        </button>
        {/* <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-3 rounded-full ${
            isChatOpen ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          <MessageSquare size={20} />
        </button> */}
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-500 text-white"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
}
