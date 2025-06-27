import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/InstructorCompontents/Navbar";
import Footer from "@/components/InstructorCompontents/Footer";
import CoureseSideBar from "./CourseSideBar";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import instructorAPI from "@/API/InstructorApi";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const CourseSchema = Yup.object().shape({
  title: Yup.string().trim().required("Course title is required").max(50),
  description: Yup.string()
    .trim()
    .required("Course description is required")
    .min(200, "Description must be at least 200 characters")
    .max(1700, "Description cannot exceed 1500 characters"),
  language: Yup.string().trim().required("Language is required"),
  category: Yup.string().trim().required("Category is required"),
  price: Yup.number().required("Actual price is required"),
  discount: Yup.number().required("Discount price is required"),
  points: Yup.array()
    .of(
      Yup.object().shape({
        text: Yup.string().trim().required("This field is required"),
      })
    )
    .min(1, "At least one point is required"),
});

const LandingPage = () => {
  const { id } = useParams();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [languages, setLanguages] = useState<{ _id: string; name: string }[]>(
    []
  );

  interface CourseValues {
    title: string;
    description: string;
    language: string;
    category: string;
    price: number | string;
    discount: number | string;
    points: { text: string }[];
    courseImgeId: File | null;
  }

  const emptyInitialValues: CourseValues = {
    title: "",
    description: "",
    language: "",
    category: "",
    price: "",
    discount: "",
    points: [{ text: "" }],
    courseImgeId: null,
  };

  const [initialValues, setInitialValues] =
    useState<CourseValues>(emptyInitialValues);

  useEffect(() => {
    const fetchCourseAndOptions = async () => {
      try {
        // Fetch categories
        const categoryResponse = await instructorAPI.getAllCategories();
        setCategories(categoryResponse.data.data); // Adjust based on actual response structure

        // Fetch languages
        const languageResponse = await instructorAPI.getAllLanguages();
        setLanguages(languageResponse.data.data); // Adjust based on actual response structure

        // Fetch course if id exists
        if (id) {
          const course = await instructorAPI.getCourseById(id);
          const parsedPoints = Array.isArray(course.points[0])
            ? course.points
            : JSON.parse(course.points || "[]");

          setInitialValues({
            title: course.title,
            description: course.description,
            language: course.language,
            category: course.category,
            price: Number(course.price),
            discount: Number(course.discount),
            points: parsedPoints,
            courseImgeId: null,
          });

          const imageUrl = course.courseImageId;
          setImagePreview(imageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("This Course is Blocked Contact Admin");
        setTimeout(() => {
          navigate("/Instructor/dashboard/courses");
        },3000)
      }
    };

    fetchCourseAndOptions();
  }, [id]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("courseImgeId", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values: CourseValues) => {
    try {
      const sendData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "points") {
          sendData.append("points", JSON.stringify(value));
        } else if (key === "courseImgeId" && value instanceof File) {
          sendData.append("courseImgeId", value);
        } else {
          sendData.append(key, value as string);
        }
      });

      let response;
      if (id) {
        response = await instructorAPI.updateCourse(id, sendData);
        toast.success(response.message);
        navigate(`/Instructor/dashboard/courses/editcarriculam/${id}`);
      } else {
        response = await instructorAPI.createCourse(sendData);
        toast.success(response.message);
        navigate(
          `/Instructor/dashboard/courses/addcarriculam/${response.data._id}`
        );
      }
    } catch (err) {
      console.error("Error submitting course:", err);
      toast.error("Failed to submit course");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="flex flex-col md:flex-row min-h-screen">
        <CoureseSideBar />
        <div className="flex-1 p-4">
          <h1 className="text-center text-xl font-semibold mb-12">
            {id ? "Edit Course" : "Create Course"}
          </h1>
          <div className="max-w-5xl mx-auto p-6 md:p-8 border rounded-xl shadow-sm bg-white">
            <p className="text-sm text-gray-600 mb-6">
              Your course landing page is crucial to your success on EduClub. If
              done right, it can also boost your visibility on search engines
              like Google.
            </p>

            <Formik<CourseValues>
              initialValues={initialValues}
              validationSchema={CourseSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, errors, touched, handleChange, setFieldValue }) => (
                <Form encType="multipart/form-data">
                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-indigo-600 font-semibold mb-1">
                      Course title
                    </label>
                    <Input
                      name="title"
                      onChange={handleChange}
                      value={values.title}
                      placeholder="Enter course title"
                    />
                    {touched.title && errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-indigo-600 font-semibold mb-1">
                      Course Description
                    </label>
                    <textarea
                      name="description"
                      onChange={handleChange}
                      value={values.description}
                      placeholder="Enter course description"
                      className="w-full p-2 border rounded-md min-h-[120px] resize-y"
                    />
                    {touched.description && errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Language & Category Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-indigo-600 font-semibold mb-1">
                        Language
                      </label>
                      <select
                        name="language"
                        onChange={handleChange}
                        value={values.language}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="" disabled>
                          Select Language
                        </option>
                        {languages.map((lang) => (
                          <option key={lang._id} value={lang.name}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                      {touched.language && errors.language && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.language}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-indigo-600 font-semibold mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        onChange={handleChange}
                        value={values.category}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="" disabled>
                          Select Category
                        </option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {touched.category && errors.category && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing Info */}
                  <div className="mb-2 text-sm text-gray-600">
                    When you sell a course on our platform, we deduct a 15%
                    service fee, and the remaining amount will be paid to you.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-indigo-600 font-semibold mb-1">
                        Actual Price
                      </label>
                      <Input
                        name="price"
                        type="number"
                        onChange={handleChange}
                        value={values.price}
                        placeholder="₹"
                      />
                      {touched.price && errors.price && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.price}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-indigo-600 font-semibold mb-1">
                        Discount %
                      </label>
                      <Input
                        name="discount"
                        type="number"
                        onChange={handleChange}
                        value={values.discount}
                        placeholder="%"
                      />
                      {touched.discount && errors.discount && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.discount}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Course Image */}
                  <div className="mb-6">
                    <label className="block text-indigo-600 font-semibold mb-2">
                      Course Image
                    </label>
                    <div className="grid md:grid-cols-2 gap-4 items-start">
                      <Card className="flex items-center justify-center h-52 w-full border-dashed border-2 border-indigo-300 overflow-hidden">
                        <CardContent className="flex items-center justify-center w-full h-full">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center text-center">
                              <img
                                src="/icons/image-placeholder.svg"
                                className="w-12 h-12 mb-2"
                              />
                              <p className="text-sm text-gray-500">
                                Upload your course image here
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-600">
                          Upload must be 750x422 px; .jpg, .jpeg, .gif, or .png;
                          no text.
                        </p>
                        <Input
                          type="file"
                          name="courseImgeId"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, setFieldValue)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* What You Will Learn */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-indigo-600 underline mb-4">
                      What you Will Learn
                    </h2>
                    <FieldArray name="points">
                      {({ push, remove }) => (
                        <>
                          {values.points.map((point, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 mb-3 border border-indigo-300 rounded-md p-2"
                            >
                              <Input
                                name={`points[${index}].text`}
                                placeholder="Write what they'll learn"
                                value={point.text}
                                onChange={handleChange}
                                className="flex-1 border border-indigo-400 rounded-md"
                              />
                              {values.points.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="border border-black rounded p-1 hover:bg-red-100"
                                >
                                  <Icon icon="mdi:minus" className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => push({ text: "" })}
                                className="border border-black rounded p-1 hover:bg-indigo-100"
                              >
                                <Icon icon="mdi:plus" className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {typeof errors.points === "string" && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.points}
                            </p>
                          )}
                        </>
                      )}
                    </FieldArray>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center mt-6">
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-md"
                    >
                      Save
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LandingPage;
