import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InstructorRoutes from "./Routes/InstructorRoutes";
import StudentRoute from "./Routes/StudentRoute";
import AdiminRoutes from "./Routes/AdiminRoutes";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<StudentRoute />} />
        <Route path="/instructor/*" element={<InstructorRoutes />} />
        <Route path="/admin/*" element={<AdiminRoutes />} />
      </Routes>
    </Router>
  );
};

export default App;
