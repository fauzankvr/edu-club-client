import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // adjust path if needed
import studentAPI from "@/API/StudentApi";
import { toast, Toaster } from "react-hot-toast";

dayjs.extend(relativeTime);

export interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userDetails: {
    firstName: string,
    lastName: string,
    profileImage:string
  }
}

const FeedbackSection = ({ courseId }: { courseId: string }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState<Review | null>(null);


  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await studentAPI.getReviews(courseId);
        const res = await studentAPI.getMyReview(courseId);
        setMyReview(res.data.data.myReview); 
        setReviews(data.data.data.reviews);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [courseId]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;

    try {
       const response = await studentAPI.addReview(courseId, {
         rating,
         comment: comment.trim(),
       });
      const res = await studentAPI.getMyReview(courseId);
      setMyReview(res.data.data.myReview);
      console.log(response)
      toast.success("Review added successfully!");
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to add review");
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1
      )
    : "0.0";

  const ratingCounts = reviews.reduce((acc: { [key: number]: number }, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {});

  const totalReviews = reviews.length;

  if (loading) {
    return (
      <p className="text-center py-10 text-gray-600">Loading reviews...</p>
    );
  }

  const handleReact = async (reviewId: string, type: "like" | "dislike") => {
    try {
      const { data } = await studentAPI.reactToReview(reviewId, type);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                likes: data.data.reviews.likes,
                dislikes: data.data.reviews.dislikes,
              }
            : r
        )
      );
    } catch (error) {
      toast.error("Failed to react to review");
      console.error(error);
    }
  };


  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <section className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold mb-6">Student Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Summary & Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-indigo-600 mr-3">
                {avgRating}
              </span>
              <div>
                <p className="text-gray-500">Tutorial rating</p>
                <div className="flex mt-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Icon
                      key={idx}
                      icon={
                        idx < Math.round(parseFloat(avgRating))
                          ? "mdi:star"
                          : "mdi:star-outline"
                      }
                      className="w-5 h-5 text-indigo-500"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star] || 0;
                const pct = totalReviews ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center text-sm">
                    <span className="w-5 text-gray-600">{star}</span>
                    <Icon icon="mdi:star" className="w-4 h-4 text-indigo-400" />
                    <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-gray-700">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Form */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            {myReview ? (
              <div>
                <h3 className="text-xl font-medium mb-4">Your Review</h3>
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Icon
                      key={idx}
                      icon={
                        idx < myReview.rating ? "mdi:star" : "mdi:star-outline"
                      }
                      className="w-5 h-5 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{myReview.comment}</p>
                <div className="flex items-center text-gray-500 space-x-6">
                  <span>{dayjs(myReview.createdAt).fromNow()}</span>
                  <span>{myReview.likes} Likes</span>
                  <span>{myReview.dislikes} Dislikes</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col">
                <h3 className="text-xl font-medium mb-4">Add your review</h3>
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRating(idx + 1)}
                      className="mx-1 focus:outline-none"
                    >
                      <Icon
                        icon={idx < rating ? "mdi:star" : "mdi:star-outline"}
                        className="w-6 h-6"
                        style={{ color: idx < rating ? "#6366F1" : "#9CA3AF" }}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  rows={4}
                  placeholder="Write your valuable review"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  type="submit"
                  className="self-start bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition"
                >
                  Add Review
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="mt-10 space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-indigo-200 rounded-full overflow-hidden flex items-center justify-center mr-3">
                  <img
                    src={review.userDetails.profileImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {review.userDetails.firstName} {review.userDetails.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {dayjs(review.createdAt).fromNow()}
                  </p>
                </div>
              </div>
              <div className="flex items-center mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Icon
                    key={idx}
                    icon={idx < review.rating ? "mdi:star" : "mdi:star-outline"}
                    className="w-5 h-5 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              <div className="flex items-center mt-4 text-gray-500 space-x-6">
                <button
                  onClick={() => handleReact(review._id, "like")}
                  className="flex items-center hover:text-indigo-600 transition"
                >
                  <Icon icon="mdi:thumb-up-outline" className="w-5 h-5 mr-1" />
                  <span>{review.likes}</span>
                </button>
                <button
                  onClick={() => handleReact(review._id, "dislike")}
                  className="flex items-center hover:text-indigo-600 transition"
                >
                  <Icon
                    icon="mdi:thumb-down-outline"
                    className="w-5 h-5 mr-1"
                  />
                  <span>{review.dislikes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default FeedbackSection;
