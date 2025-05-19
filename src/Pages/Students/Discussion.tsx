import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import studentAPI from "@/API/StudentApi";
import { useParams } from "react-router-dom";

interface User {
  firstName: string;
  lastName: string;
}

interface CommentProps {
  userId: User;
  text: string;
}

const Comment: React.FC<CommentProps> = ({ userId, text }) => (
  <div className="flex gap-2 rounded-xl border border-gray-300 w-full p-2">
    <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
      {userId.firstName[0]}
    </div>
    <div>
      <p className="font-semibold">
        {userId.firstName} {userId.lastName}
      </p>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  </div>
);

interface DiscussionItem {
  _id: string;
  studentId: User & { profileImage: string };
  text: string;
  likes: number;
  dislikes: number;
}

const Discussion: React.FC = () => {
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [newText, setNewText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [discussionReplies, setDiscussionReplies] = useState<{
    [key: string]: { replies: CommentProps[]; isOpen: boolean };
  }>({});
  const { id } = useParams();

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        if (!id) throw new Error("Discussion ID is not defined.");
        const res = await studentAPI.getDiscussion(id);
        setDiscussions(res.data.data);
      } catch (error) {
        console.error("Failed to fetch discussions:", error);
      }
    };

    fetchDiscussions();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!newText.trim()) return;
      if (!id) throw new Error("Course ID not provided");

      const res = await studentAPI.createDiscussion(id, { text: newText });
      console.log('diss',res.data.data)
      setDiscussions([res.data.data, ...discussions]);
      setNewText("");
    } catch (error) {
      console.error("Failed to submit discussion:", error);
    }
  };

  const handleReact = async (
    discussionId: string,
    type: "like" | "dislike"
  ) => {
    try {
      await studentAPI.reactHandle(discussionId, type);
      if (!id) throw new Error("id not provided");
      const updated = await studentAPI.getDiscussion(id);
      setDiscussions(updated.data.data);
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  const handleShowReplies = async (discussionId: string) => {
    const isOpen = discussionReplies[discussionId]?.isOpen || false;
    setDiscussionReplies((prev) => ({
      ...prev,
      [discussionId]: { ...prev[discussionId], isOpen: !isOpen },
    }));

    if (discussionReplies[discussionId]?.replies) return; // Already loaded

    try {
      const res = await studentAPI.getReplies(discussionId);
      setDiscussionReplies((prev) => ({
        ...prev,
        [discussionId]: { replies: res.data, isOpen: true },
      }));
    } catch (err) {
      console.error("Failed to load replies:", err);
    }
  };

  const handleReplySubmit = async (discussionId: string) => {
    if (!replyText.trim()) return;
    try {
       await studentAPI.addReply(discussionId, { text: replyText });
      
      const newReply: CommentProps = {
        userId: {
          firstName: "You",
          lastName: "",
        },
        text: replyText,
      };
      setDiscussionReplies((prev) => ({
        ...prev,
        [discussionId]: {
          replies: [newReply, ...(prev[discussionId]?.replies || [])],
          isOpen: true,
        },
      }));
      setReplyText("");
      setActiveReplyId(null);
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      {/* Input section */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Write your discussion..."
          className="flex-grow border border-gray-300 rounded-lg px-4 py-2"
        />
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          onClick={handleSubmit}
        >
          Send
        </button>
      </div>

      {/* Discussion List */}
      {discussions.map((d) => (
        <div key={d._id} className="flex gap-4 items-start mb-4">
          <div className="w-12 h-12 bg-indigo-700 rounded-full flex items-center justify-center text-white text-lg font-bold">
            {d.studentId.firstName[0]}
          </div>
          <div className="flex-1">
            <p className="font-bold">
              {d.studentId.firstName} {d.studentId.lastName}
            </p>
            <p className="text-sm text-gray-700">{d.text}</p>

            {/* Actions */}
            <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
              <div className="flex gap-2 items-center">
                <Icon
                  icon="mdi:thumb-up-outline"
                  className="cursor-pointer"
                  onClick={() => handleReact(d._id, "like")}
                />
                {d.likes}
                <Icon
                  icon="mdi:thumb-down-outline"
                  className="cursor-pointer"
                  onClick={() => handleReact(d._id, "dislike")}
                />
                {d.dislikes}
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-indigo-600"
                onClick={() => handleShowReplies(d._id)}
              >
                <Icon icon="mdi:comment-outline" />
                <span>
                  {discussionReplies[d._id]?.isOpen
                    ? "Hide replies"
                    : "Show replies"}
                </span>
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-indigo-600"
                onClick={() =>
                  setActiveReplyId(activeReplyId === d._id ? null : d._id)
                }
              >
                <Icon icon="mdi:reply" />
                <span>Reply</span>
              </div>
            </div>

            {/* Reply Input */}
            {activeReplyId === d._id && (
              <div className="ml-10 mt-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-1 mb-2"
                />
                <button
                  onClick={() => handleReplySubmit(d._id)}
                  className="bg-indigo-500 text-white px-4 py-1 rounded hover:bg-indigo-600"
                >
                  Send Reply
                </button>
              </div>
            )}

            {/* Replies */}
            {discussionReplies[d._id]?.isOpen && (
              <div className="ml-10 mt-3 flex flex-col gap-2">
                {discussionReplies[d._id]?.replies?.length ? (
                  discussionReplies[d._id].replies.map((r, i) => (
                    <Comment key={i} userId={r.userId} text={r.text} />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No replies yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Discussion;
