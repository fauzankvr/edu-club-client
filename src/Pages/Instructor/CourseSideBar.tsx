import { useNavigate } from "react-router-dom";

const CoureseSideBar = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); 
  };

  return (
    <div className="w-full md:w-60 border-r p-4 space-y-2">
      <button
        onClick={handleGoBack}
        className="block w-full text-center py-2 px-4 rounded-xl hover:bg-indigo-100"
      >
        Go Back
      </button>
    </div>
  );
};

export default CoureseSideBar;
