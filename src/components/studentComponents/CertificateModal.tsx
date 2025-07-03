import { useState } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import CertificatePDF from "@/Pages/Students/CertificatePdf";

interface CertificateModalProps {
  show: boolean;
  onClose: () => void;
  studentName: string;
  courseName: string;
  instructorName: string;
  issuedDate: string;
  certificateId: string;
  logoUrl: string;
  signatureUrl: string;
}

export default function CertificateModal({
  show,
  onClose,
  studentName,
  courseName,
  instructorName,
  issuedDate,
  certificateId,
  logoUrl,
  signatureUrl,
}: CertificateModalProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] p-6 border border-gray-200 overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
        >
          ×
        </button>

        {/* Modal content */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-purple-700 mb-2">
            🎉 Congratulations!
          </h2>
          <p className="text-gray-700 mb-4">
            <strong>{studentName}</strong> You have successfully completed the
            <strong>{courseName} </strong> course and earned your certificate.
          </p>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow transition"
            >
              {showPreview ? "Hide Preview" : "View PDF"}
            </button>
            <PDFDownloadLink
              document={
                <CertificatePDF
                  studentName={studentName}
                  courseName={courseName}
                  issuedDate={issuedDate}
                  certificateId={certificateId}
                  signatureUrl={signatureUrl}
                  instructorName={instructorName}
                  backgroundImage={logoUrl}
                />
              }
              fileName={`Certificate_${studentName}.pdf`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium shadow transition"
            >
              {({ loading }) =>
                loading ? "Preparing..." : "Download Certificate"
              }
            </PDFDownloadLink>
          </div>

          {/* PDF Preview */}
          {showPreview && (
            <div className="mt-6 border border-gray-300 rounded-md overflow-hidden">
              <PDFViewer width="100%" height="500px" style={{ border: "none" }}>
                <CertificatePDF
                  studentName={studentName}
                  courseName={courseName}
                  issuedDate={issuedDate}
                  certificateId={certificateId}
                  signatureUrl={signatureUrl}
                  instructorName={instructorName}
                  backgroundImage={logoUrl}
                />
              </PDFViewer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}