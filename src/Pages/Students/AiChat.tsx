import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import studentAPI from "@/API/StudentApi";

interface AiChatProps {
  courseId: string; 
}

const AiChat = ({ courseId }: AiChatProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { from: "user" | "ai"; text: string }[]
    >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await studentAPI.findAiChat(courseId);
        const loadedMessages: { from: "user" | "ai"; text: string }[] = [];
        const data = res.data.data
        data.forEach((msg: any) => {
          loadedMessages.push({ from: "user", text: msg.text });
          loadedMessages.push({ from: "ai", text: msg.reply });
        });

        setMessages(loadedMessages);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    fetchChatHistory();
  }, [courseId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: { from: "user"; text: string } = {
      from: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setLoading(true);

    try {
        const res = await studentAPI.chatApi({ message: input }, courseId);
      const aiReply = res.data.data.response;

      setMessages((prev) => [...prev, { from: "ai", text: aiReply }]);
    } catch (err) {
        console.log(err)
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Failed to get response from AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold mb-6 text-indigo-700">
        AI Chat Assistant
      </h2>

      <div className="bg-white shadow-md rounded-xl p-4 space-y-4 h-[500px] overflow-y-auto mb-4 border">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                msg.from === "user"
                  ? "bg-indigo-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
              Typing...
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center space-x-1 transition"
        >
          <Icon icon="mdi:send" className="w-5 h-5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};

export default AiChat;
