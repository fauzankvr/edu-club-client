import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import studentAPI from "@/API/StudentApi";
import { toast } from "react-toastify";

dayjs.extend(relativeTime);

interface Review {
  _id: string;
  userDetails: {
    firstName: string;
    lastName: string;
    profileImage: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
  dislikes: number;
}

interface CourseContentProps {
  courseId: string;
}

const ReviewCard: React.FC<CourseContentProps> = ({ courseId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<string>("0.0");
  const [ratingCounts, setRatingCounts] = useState<{ [key: string]: number }>({
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
  });
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const { data } = await studentAPI.getReviews(courseId);
        const reviews = data.data.reviews || [];

        // Compute avgRating and ratingCounts if not provided
        const totalReviews = reviews.length;
        const ratingCounts = reviews.reduce(
          (acc: { [key: string]: number }, review: Review) => {
            acc[review.rating] = (acc[review.rating] || 0) + 1;
            return acc;
          },
          { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }
        );
        const avgRating =
          totalReviews > 0
            ? (
                reviews.reduce(
                  (sum: number, review: Review) => sum + review.rating,
                  0
                ) / totalReviews
              ).toFixed(1)
            : "0.0";

        setReviews(reviews);
        setAvgRating(data.avgRating?.toFixed(1) || avgRating);
        setRatingCounts(data.ratingCounts || ratingCounts);
        setTotalReviews(data.totalReviews || totalReviews);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadReviews();
    }
  }, [courseId]);

  const handleReact = async (reviewId: string, type: "like" | "dislike") => {
    try {
      const data  = await studentAPI.reactToReview(reviewId, type);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                likes: data.data.data.reviews.likes,
                dislikes: data.data.data.reviews.dislikes,
              }
            : r
        )
      );
    } catch (error) {
      toast.error("Failed to react to review");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <p className="text-center py-10 text-gray-600">Loading reviews...</p>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Student Feedback
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Summary Section */}
        {reviews.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-indigo-600 mr-3">
                {avgRating}
              </span>
              <div>
                <p className="text-gray-500 text-sm">Course Rating</p>
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
        )}

        {/* Placeholder for Alignment (No Review Form) */}
        <div className="md:col-span-2"></div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-center py-10 text-gray-600">No reviews available.</p>
      ) : (
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
                    alt={`${review.userDetails.firstName} ${review.userDetails.lastName}`}
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
              <p className="text-gray-700 leading-relaxed text-sm">
                {review.comment}
              </p>
              <div className="flex items-center mt-4 text-gray-500 space-x-6">
                <button
                  onClick={() => handleReact(review._id, "like")}
                  className="flex items-center hover:text-indigo-600 transition"
                  title="Like"
                >
                  <Icon icon="mdi:thumb-up-outline" className="w-5 h-5 mr-1" />
                  <span className="text-sm">{review.likes}</span>
                </button>
                <button
                  onClick={() => handleReact(review._id, "dislike")}
                  className="flex items-center hover:text-indigo-600 transition"
                  title="Dislike"
                >
                  <Icon
                    icon="mdi:thumb-down-outline"
                    className="w-5 h-5 mr-1"
                  />
                  <span className="text-sm">{review.dislikes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewCard;
