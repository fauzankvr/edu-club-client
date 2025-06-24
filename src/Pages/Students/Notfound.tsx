import { Link } from "react-router-dom";
import animatedImage from "../../assets/404.gif";

const NotFoundPage = () => {
  console.log("iam ;fsdklf;")
  return (
    <div className="flex items-center justify-center min-h-screen bg-indigo-50 px-4">
      <div className="text-center">
        <img
          src={animatedImage}
          alt="404 Not Found"
          className="w-72 h-72 mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold text-indigo-800 mb-2">
          Oops! Page not found
        </h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
