
const Loading = () => {
  return (
    <div>
      <div className="text-center py-10 text-indigo-600 flex flex-col items-center justify-center animate-pulse">
        <svg
          className="animate-spin h-8 w-8 mb-3 text-indigo-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
          ></path>
        </svg>
      </div>
    </div>
  );
}

export default Loading;