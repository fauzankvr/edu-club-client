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
  Maximize2,
} from "lucide-react";
import io, { Socket } from "socket.io-client";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
}

const baseUrl = import.meta.env.VITE_BASE_URL;

const socket: Socket = io(baseUrl);

export default function StudentVideoCallApp() {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const role = "student";
  const roomId = "video-call-room";

  useEffect(() => {
    const setRoleAndStartCall = async () => {
      await new Promise<void>((resolve) => {
        socket.emit("set-role", role);
        socket.once("role-set", () => {
          console.log(`Role set for student: ${role}`);
          resolve();
        });
      });

      const startCall = async () => {
        try {
          const localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = localStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }

          console.log("Emitting join-room for Student");
          socket.emit("join-room", "Student", roomId);

          socket.on("user-joined", async (userId: string) => {
            console.log(`User joined: ${userId}, creating peer connection`);
            peerRef.current = createPeer(userId);
            const localStream = localStreamRef.current;
            if (localStream) {
              localStream.getTracks().forEach((track) => {
                peerRef.current?.addTrack(track, localStream);
              });
              const offer = await peerRef.current.createOffer();
              await peerRef.current.setLocalDescription(offer);
              console.log("Sending offer to", userId);
              socket.emit("offer", offer, userId);
            }
          });

          socket.on(
            "offer",
            async (offer: RTCSessionDescriptionInit, senderId: string) => {
              console.log(`Received offer from ${senderId}`);
              peerRef.current = createPeer(senderId);
              await peerRef.current.setRemoteDescription(offer);
              const localStream = localStreamRef.current;
              if (localStream) {
                localStream.getTracks().forEach((track) => {
                  peerRef.current?.addTrack(track, localStream);
                });
                const answer = await peerRef.current.createAnswer();
                await peerRef.current.setLocalDescription(answer);
                console.log("Sending answer to", senderId);
                socket.emit("answer", answer, senderId);
              }
            }
          );

          socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
            console.log("Received answer");
            await peerRef.current?.setRemoteDescription(answer);
          });

          socket.on("ice-candidate", async (candidate: RTCIceCandidateInit) => {
            console.log("Received ICE candidate");
            try {
              await peerRef.current?.addIceCandidate(candidate);
            } catch (err) {
              console.error("Error adding received ice candidate", err);
            }
          });

          socket.on("recall", async (roomId: string) => {
            console.log("Received recall, rejoining room");
            if (peerRef.current) {
              peerRef.current.close();
              peerRef.current = null;
            }
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
            socket.emit("join-room", "Student", roomId);
          });

          socket.on("user-left", (userId: string) => {
            console.log(`User left: ${userId}`);
            if (peerRef.current) {
              peerRef.current.close();
              peerRef.current = null;
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
              }
            }
          });
        } catch (err) {
          console.error("Error starting call:", err);
        }
      };

      startCall();
    };

    setRoleAndStartCall();

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const createPeer = (targetId: string): RTCPeerConnection => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate, targetId);
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return peer;
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMsg: Message = {
        id: Date.now(),
        sender: "You",
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, newMsg]);
      socket.emit("chat-message", newMsg);
      setMessage("");
    }
  };

  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    socket.emit("leave-room", roomId);
    socket.disconnect();
    // Optionally navigate away
    // window.location.href = "/";
  };

  useEffect(() => {
    socket.on("chat-message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat-message");
      socket.off("recall");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="relative bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-medium text-gray-600 text-center">
          Video Session
        </h1>
        <a href="/" className="flex items-center">
          <img
            src="/logos/educlub_logo_nav.png"
            alt="EduClub Logo"
            className="w-29"
          />
        </a>
        <div className="flex items-center gap-2 ml-auto">
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Connected
          </span>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Maximize2 size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden relative">
            <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-70 text-white px-2 py-1 rounded text-sm">
              You (Student)
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
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "You" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.sender === "You"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <span className="font-medium mr-1">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-center items-center gap-4">
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

          <button className="p-3 rounded-full bg-blue-500 text-white">
            <Monitor size={20} />
          </button>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3 rounded-full ${
              isChatOpen ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            <MessageSquare size={20} />
          </button>

          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-500 text-white"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
