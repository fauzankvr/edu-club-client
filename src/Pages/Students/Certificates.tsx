import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { useState } from "react";
import CertificateModal from "@/components/studentComponents/CertificateModal"; 
import { Progress } from "./ProfilePage";  

interface CertificatesProps {
  progressData: Progress[];
  studentName: string;
  backgroundImage: string;
  signatureImage: string;
}

export default function Certificates({
  progressData,
  studentName,
  backgroundImage,
  signatureImage,
}: CertificatesProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Progress | null>(null);

  const handleViewCertificate = (progress: Progress) => {
    setSelectedCourse(progress);
    setShowModal(true);
  };

  return (
    <>
      <Card className="p-4 sm:p-6 shadow-md">
        <CardContent>
          <h2 className="text-2xl font-semibold mb-4">Certificates</h2>
          {progressData.length === 0 ? (
            <p className="text-gray-500">No certificates available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {progressData.map((progress) => (
                <Card
                  key={progress._id}
                  className={`p-4 shadow-sm border ${
                    progress.completed
                      ? "border-green-200"
                      : "border-gray-200 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {progress.courseId.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Instructor: {progress.courseId.instructor.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status:{" "}
                        {progress.completed ? "Completed" : "In Progress"}
                      </p>
                      {progress.completed && (
                        <p className="text-sm text-gray-500">
                          Issued:{" "}
                          {new Date(progress.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      {progress.completed ? (
                        <button
                          onClick={() => handleViewCertificate(progress)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium shadow transition"
                        >
                          View Certificate
                        </button>
                      ) : (
                        <span title="Certificate Locked">
                          <Icon
                            icon="mdi:lock"
                            width={24}
                            className="text-gray-400"
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && selectedCourse && (
        <CertificateModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCourse(null);
          }}
          studentName={studentName}
          courseName={selectedCourse.courseId.title}
          instructorName={selectedCourse.courseId.instructor.fullName}
          issuedDate={selectedCourse.updatedAt.split("T")[0]}
          certificateId={`EDU-${selectedCourse._id.slice(-6)}`} // Generate a simple certificate ID
          logoUrl={backgroundImage}
          signatureUrl={signatureImage}
        />
      )}
    </>
  );
}
