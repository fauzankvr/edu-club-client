import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import studentAPI from "@/API/StudentApi";
import { Review } from "@/Pages/Students/FeedbackSection";
import { toast } from "react-toastify";

dayjs.extend(relativeTime);

const baseUrl = import.meta.env.VITE_BASE_URL;

interface CourseContentProps {
  courseId: string;
}

const ReviewCard: React.FC<CourseContentProps> = ({ courseId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await studentAPI.getReviews(courseId);
        setReviews(data.data.reviews);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadReviews();
    }
  }, [courseId]);

  if (loading) {
    return (
      <p className="text-center py-10 text-gray-600">Loading reviews...</p>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-center py-10 text-gray-600">No reviews available.</p>
    );
  }

  const handleReact = async (reviewId: string, type: "like" | "dislike") => {
      try {
        const { data } = await studentAPI.reactToReview(reviewId, type);
        console.log(data)
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  likes: data.reviews.likes,
                  dislikes: data.reviews.dislikes,
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
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-white shadow-md rounded-xl p-6 md:p-8 max-w-3xl mx-auto hover:shadow-lg transition"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <img
              src={`${baseUrl}/${review.userDetails.profileImage}`}
              alt={`${review.userDetails.firstName} ${review.userDetails.lastName}`}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {review.userDetails.firstName} {review.userDetails.lastName}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-indigo-600">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        icon={
                          i < review.rating ? "mdi:star" : "mdi:star-outline"
                        }
                        className="text-indigo-600"
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-400 mt-2 sm:mt-0">
                  {dayjs(review.createdAt).fromNow()}
                </span>
              </div>
              <p className="text-gray-700 mt-4 text-sm leading-relaxed">
                {review.comment}
              </p>
              <div className="mt-6 flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-medium text-gray-800">
                  Was this review helpful?
                </p>
                <div className="flex gap-4 text-xl text-gray-500">
                  <button
                    className="hover:text-indigo-600 transition"
                    onClick={() => handleReact(review._id, "like")}
                  >
                    <Icon icon="mdi:thumb-up-outline" />
                    <span className="ml-1 text-sm">{review.likes}</span>
                  </button>
                  <button
                    className="hover:text-indigo-600 transition"
                    onClick={() => handleReact(review._id, "dislike")}
                  >
                    <Icon icon="mdi:thumb-down-outline" />
                    <span className="ml-1 text-sm">{review.dislikes}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewCard;
