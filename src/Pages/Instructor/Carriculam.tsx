import Navbar from "@/components/InstructorCompontents/Navbar";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { toast, ToastContainer } from "react-toastify";
import instructorAPI from "@/API/InstructorApi";
import CoureseSideBar from "./CourseSideBar";
import * as Yup from "yup";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

// Define types for the curriculum structure
interface Lecture {
  title: string;
  video: File | null;
  pdf: File | null;
  videoPath?: string;
  pdfPath?: string;
}

interface Section {
  title: string;
  lectures: Lecture[];
}

interface CurriculumFormValues {
  sections: Section[];
}

// API response types
interface LectureResponse {
  title: string;
  videoPath?: string;
  pdfPath?: string;
  _id?: string;
}

interface SectionResponse {
  title: string;
  lectures: LectureResponse[];
  _id?: string;
}

interface CurriculumResponse {
  sections: SectionResponse[];
}

// Validation schema
const validationSchema = Yup.object().shape({
  sections: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().trim().required("Section title is required"),
      lectures: Yup.array().of(
        Yup.object().shape({
          title: Yup.string().trim().required("Lecture title is required"),
        })
      ),
    })
  ),
});

const Carricculam = () => {
  // Get course ID and path from URL params
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if in edit mode based on URL path
  const isEditMode = location.pathname.includes("editcarriculam");

  // Initial state for the form
  const defaultInitialValues: CurriculumFormValues = {
    sections: [
      { title: "", lectures: [{ title: "", video: null, pdf: null }] },
    ],
  };

  const [initialValues, setInitialValues] =
    useState<CurriculumFormValues>(defaultInitialValues);
  const [loading, setLoading] = useState<boolean>(isEditMode && !!id);

  // Get courseId from URL params
  const courseId: string = id || "";

  useEffect(() => {
    if (isEditMode && id) {
      // Fetch curriculum for edit mode
      instructorAPI
        .getCurriculumByCourseId(id)
        .then((res) => {
          console.log("Fetched curriculum:", res);
          const transformed: CurriculumFormValues = {
            sections: res.sections.map((section: SectionResponse) => ({
              title: section.title,
              lectures: section.lectures.map((lec: LectureResponse) => ({
                title: lec.title,
                video: null,
                pdf: null,
                videoPath: lec.videoPath,
                pdfPath: lec.pdfPath,
              })),
            })),
          };
          setInitialValues(transformed);
          setLoading(false);
        })
        .catch((error: Error) => {
          console.error("Error fetching curriculum:", error);
          toast.error("Failed to fetch curriculum.");
          setLoading(false);
        });
    }
  }, [id, isEditMode]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionIndex: number,
    lectureIndex: number,
    type: "video" | "pdf",
    values: CurriculumFormValues,
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  ): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid =
      (type === "video" && file.type === "video/mp4") ||
      (type === "pdf" && file.type === "application/pdf");

    if (!isValid) {
      toast.error(
        `Invalid file type. Please upload a ${
          type === "video" ? "MP4" : "PDF"
        } file.`
      );
      return;
    }

    const fieldPath = `sections[${sectionIndex}].lectures[${lectureIndex}].${type}`;
    const otherField = type === "video" ? "pdf" : "video";
    const pathField = `sections[${sectionIndex}].lectures[${lectureIndex}].${
      type === "video" ? "videoPath" : "pdfPath"
    }`;

    setFieldValue(fieldPath, file);
    // Clear the other field only if this is a new lecture (not an edit)
    if (
      !values.sections[sectionIndex].lectures[lectureIndex].videoPath &&
      !values.sections[sectionIndex].lectures[lectureIndex].pdfPath
    ) {
      setFieldValue(
        `sections[${sectionIndex}].lectures[${lectureIndex}].${otherField}`,
        null
      );
    }

    // Clear the path since we're uploading a new file
    setFieldValue(pathField, undefined);
  };

  const handleSubmit = async (values: CurriculumFormValues): Promise<void> => {
    try {
      const formData = new FormData();

      formData.append(
        "sections",
        JSON.stringify(
          values.sections.map((section) => ({
            title: section.title,
            lectures: section.lectures.map((lec) => ({
              title: lec.title,
              videoPath: lec.videoPath,
              pdfPath: lec.pdfPath,
            })),
          }))
        )
      );

      values.sections.forEach((section, sIndex) => {
        section.lectures.forEach((lecture, lIndex) => {
          if (lecture.video) {
            formData.append(
              "videos",
              lecture.video,
              `video_s${sIndex}_l${lIndex}.mp4`
            );
          }
          if (lecture.pdf) {
            formData.append(
              "pdfs",
              lecture.pdf,
              `pdf_s${sIndex}_l${lIndex}.pdf`
            );
          }
        });
      });

      let response;

      if (isEditMode && courseId) {
        // Update existing curriculum
        response = await instructorAPI.updateCurriculum(courseId, formData);
        toast.success("Curriculum updated successfully!");
        navigate(`/Instructor/dashboard/courses`);
      } else if (courseId) {
        // Create new curriculum
        response = await instructorAPI.postCarriculam(courseId, formData);
        console.log(response);
        toast.success("Curriculum created successfully!");
        navigate(`/Instructor/dashboard/courses`);
      } else {
        throw new Error("Course ID is required");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error saving curriculum:", errorMessage);
      toast.error(
        isEditMode
          ? "Failed to update curriculum."
          : "Failed to create curriculum."
      );
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col md:flex-row min-h-screen">
          <CoureseSideBar />
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="text-xl">Loading curriculum data...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="flex flex-col md:flex-row min-h-screen">
        <CoureseSideBar />
        <div className="flex-1 p-4">
          <h1 className="text-center text-xl font-semibold mb-12">
            {isEditMode ? "Edit your Curriculum" : "Add your Curriculum"}
          </h1>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form className="p-6 border border-indigo-300 rounded-xl max-w-4xl mx-auto">
                <FieldArray name="sections">
                  {({ push, remove }) => (
                    <>
                      {values.sections.map((section, sectionIndex) => (
                        <div
                          key={sectionIndex}
                          className="border p-4 mb-6 bg-gray-100 rounded-md shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Field
                              name={`sections[${sectionIndex}].title`}
                              placeholder="Section Title"
                              className="font-semibold text-lg w-full mr-4 px-2 py-1 rounded border"
                            />
                            <ErrorMessage
                              name={`sections[${sectionIndex}].title`}
                              component="div"
                              className="text-red-500 text-sm"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => remove(sectionIndex)}
                              disabled={values.sections.length <= 1}
                              type="button"
                            >
                              <Icon
                                icon="mdi:delete"
                                className="w-5 h-5 text-red-600"
                              />
                            </Button>
                          </div>

                          <FieldArray
                            name={`sections[${sectionIndex}].lectures`}
                          >
                            {({ push: pushLecture, remove: removeLecture }) => (
                              <>
                                {section.lectures.map(
                                  (lecture, lectureIndex) => (
                                    <div
                                      key={lectureIndex}
                                      className="border p-3 rounded-md mb-3 bg-white"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <Field
                                          name={`sections[${sectionIndex}].lectures[${lectureIndex}].title`}
                                          placeholder="Lecture Title"
                                          className="w-full px-2 py-1 border rounded mr-4"
                                        />
                                        <ErrorMessage
                                          name={`sections[${sectionIndex}].lectures[${lectureIndex}].title`}
                                          component="div"
                                          className="text-red-500 text-sm"
                                        />
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() =>
                                            removeLecture(lectureIndex)
                                          }
                                          disabled={
                                            section.lectures.length <= 1
                                          }
                                          type="button"
                                        >
                                          <Icon
                                            icon="mdi:delete"
                                            className="w-5 h-5 text-red-600"
                                          />
                                        </Button>
                                      </div>

                                      <div className="flex flex-col md:flex-row gap-4">
                                        {/* Video section  */}
                                        {(!lecture.pdf && !lecture.pdfPath) ||
                                        lecture.video ||
                                        lecture.videoPath ? (
                                          <div className="flex-1">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="w-full flex items-center gap-2"
                                              onClick={() => {
                                                const element =
                                                  document.getElementById(
                                                    `video-${sectionIndex}-${lectureIndex}`
                                                  ) as HTMLInputElement | null;
                                                element?.click();
                                              }}
                                            >
                                              <Icon
                                                icon="mdi:upload"
                                                className="w-5 h-5"
                                              />
                                              {lecture.videoPath
                                                ? "Replace Video"
                                                : "Upload Video"}
                                            </Button>
                                            <input
                                              type="file"
                                              id={`video-${sectionIndex}-${lectureIndex}`}
                                              accept="video/mp4"
                                              hidden
                                              onChange={(e) =>
                                                handleFileChange(
                                                  e,
                                                  sectionIndex,
                                                  lectureIndex,
                                                  "video",
                                                  values,
                                                  setFieldValue
                                                )
                                              }
                                            />
                                            {lecture.video ? (
                                              <div className="mt-2">
                                                <p className="text-sm text-gray-500 mb-1">
                                                  New video selected (not yet
                                                  uploaded)
                                                </p>
                                                <video
                                                  controls
                                                  className="rounded-md w-full"
                                                  src={URL.createObjectURL(
                                                    lecture.video
                                                  )}
                                                />
                                              </div>
                                            ) : lecture.videoPath ? (
                                              <div className="mt-2">
                                                <p className="text-sm text-gray-500 mb-1">
                                                  Current video
                                                </p>
                                                <video
                                                  controls
                                                  className="rounded-md w-full"
                                                  src={lecture.videoPath}
                                                />
                                              </div>
                                            ) : null}
                                          </div>
                                        ) : null}

                                        {/* PDF section */}
                                        {(!lecture.video &&
                                          !lecture.videoPath) ||
                                        lecture.pdf ||
                                        lecture.pdfPath ? (
                                          <div className="flex-1">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="w-full flex items-center gap-2"
                                              onClick={() => {
                                                const element =
                                                  document.getElementById(
                                                    `pdf-${sectionIndex}-${lectureIndex}`
                                                  ) as HTMLInputElement | null;
                                                element?.click();
                                              }}
                                            >
                                              <Icon
                                                icon="mdi:upload"
                                                className="w-5 h-5"
                                              />
                                              {lecture.pdfPath
                                                ? "Replace PDF"
                                                : "Upload PDF"}
                                            </Button>
                                            <input
                                              type="file"
                                              id={`pdf-${sectionIndex}-${lectureIndex}`}
                                              accept="application/pdf"
                                              hidden
                                              onChange={(e) =>
                                                handleFileChange(
                                                  e,
                                                  sectionIndex,
                                                  lectureIndex,
                                                  "pdf",
                                                  values,
                                                  setFieldValue
                                                )
                                              }
                                            />
                                            {lecture.pdf ? (
                                              <div className="mt-2">
                                                <p className="text-sm text-gray-500 mb-1">
                                                  New PDF selected (not yet
                                                  uploaded)
                                                </p>
                                                <iframe
                                                  src={URL.createObjectURL(
                                                    lecture.pdf
                                                  )}
                                                  className="w-full h-64 border rounded-md"
                                                  title={`PDF Preview ${sectionIndex}-${lectureIndex}`}
                                                />
                                              </div>
                                            ) : lecture.pdfPath ? (
                                              <div className="mt-2">
                                                <p className="text-sm text-gray-500 mb-1">
                                                  Current PDF
                                                </p>
                                                <iframe
                                                  src={lecture.pdfPath}
                                                  className="w-full h-64 border rounded-md"
                                                  title={`PDF Preview ${sectionIndex}-${lectureIndex}`}
                                                />
                                              </div>
                                            ) : null}
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  )
                                )}
                                <Button
                                  type="button"
                                  onClick={() =>
                                    pushLecture({
                                      title: "",
                                      video: null,
                                      pdf: null,
                                    })
                                  }
                                  variant="outline"
                                  className="w-full mt-2 bg-gray-200 hover:bg-gray-300"
                                >
                                  <Icon icon="mdi:plus" className="w-5 h-5" />{" "}
                                  Add new lecture
                                </Button>
                              </>
                            )}
                          </FieldArray>
                        </div>
                      ))}

                      <Button
                        type="button"
                        onClick={() =>
                          push({
                            title: "",
                            lectures: [{ title: "", video: null, pdf: null }],
                          })
                        }
                        variant="outline"
                        className="w-full mb-6 bg-gray-200 hover:bg-gray-300"
                      >
                        <Icon icon="mdi:plus" className="w-5 h-5" /> Add new
                        Section
                      </Button>
                    </>
                  )}
                </FieldArray>

                <Button
                  type="submit"
                  className="bg-indigo-600 text-white w-full hover:bg-indigo-700"
                >
                  {isEditMode ? "Update" : "Save"}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default Carricculam;
