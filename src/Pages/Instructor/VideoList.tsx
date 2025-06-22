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

interface Message {
  id: string;
  chatId: string;
  sender: string;
  text: string;
  createdAt: string;
  seenBy: string[];
}

export default function InstructorVideoCallApp() {
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

  const createPeer = (targetUserId: string): RTCPeerConnection => {
    console.log("Creating peer connection for:", targetUserId);
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

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate generated:", {
          type: event.candidate.type,
          address: event.candidate.address,
          port: event.candidate.port,
          sdpMid: event.candidate.sdpMid,
          foundation: event.candidate.foundation,
          protocol: event.candidate.protocol,
        });
        const socket = getSocket(
          targetUserId.startsWith("instructor") ? instructorId : studentId
        );
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
        // endCall();
      }
    };

    peer.onconnectionstatechange = () => {
      console.log("Connection state:", peer.connectionState);
      if (peer.connectionState === "connected") {
        setCallStatus("connected");
      } else if (peer.connectionState === "failed") {
        setError("Failed to establish connection. Check network or try again.");
        // endCall();
      }
    };

    return peer;
  };

  const [isLocalVideoLoading, setIsLocalVideoLoading] = useState<boolean>(true);

  const setupLocalStream = async () => {
    try {
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
      console.log(
        "Local stream set up:",
        stream,
        "tracks:",
        stream.getTracks()
      );
      setIsLocalVideoLoading(false);
    } catch (err) {
      console.error("Error setting up stream:", err);
      setError("Please grant camera and microphone permissions.");
      setIsLocalVideoLoading(false);
    }
  };

  useEffect(() => {
    const socket = getSocket(instructorId);
    console.log("Connecting socket for instructor:", instructorId);
    socket.on("connect", () => {
      console.log(`Socket connected: ${socket.id}`);
      socket.emit("set-role", { role: "instructor", userId: instructorId });
      socket.emit("join-room", roomId);
      socket.emit("joinChat", chatId);
    });

    socket.on("signal", async ({ type, data, fromUserId }) => {
      console.log(
        `Received signal: ${type} from ${fromUserId}, roomId: ${roomId}`
      );
      if (!peerRef.current && type === "offer") {
        console.log("Processing offer, SDP:", data.sdp);
        peerRef.current = createPeer(fromUserId);
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(data)
        );
        if (!localStreamRef.current && localVideoRef.current) {
          await setupLocalStream();
        }
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            console.log(
              "Adding track (instructor):",
              track.kind,
              track.id,
              track.enabled
            );
            peerRef.current!.addTrack(track, localStreamRef.current!);
          });
        }
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        console.log("Answer SDP:", answer.sdp);
        socket.emit("signal", {
          type: "answer",
          data: answer,
          targetUserId: fromUserId,
          roomId,
        });
      } else if (peerRef.current && type === "ice-candidate") {
        console.log("Adding ICE candidate:", data);
        await peerRef.current
          .addIceCandidate(new RTCIceCandidate(data))
          .catch((e) => {
            console.error("Error adding ICE candidate:", e);
          });
      }
    });

    socket.on("user-left", () => {
      setError("Student left the call");
      // endCall();
    });
    

    socket.on("initialMessages", (msgs: Message[]) => {
      setMessages(msgs);
      socket.emit("messageSeen", { chatId, userId: instructorId });
    });

    socket.on("newMessage", (msg: Message) => {
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
      socket.emit("messageSeen", { chatId, userId: instructorId });
    });

    return () => {
      socket.off("connect");
      socket.off("signal");
      // socket.off("user-left");
      socket.off("initialMessages");
      socket.off("newMessage");
      // endCall();
    };
  }, [chatId, instructorId, studentId, roomId]);

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
      const socket = getSocket(instructorId);
      const newMsg: Message = {
        id: Date.now().toString(),
        chatId,
        sender: instructorId,
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
    const socket = getSocket(instructorId);
    socket.emit("leave-room", roomId);
    setCallStatus("waiting");
    setError("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
     
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
                  Student
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
                        msg.sender === instructorId
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.sender === instructorId
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
