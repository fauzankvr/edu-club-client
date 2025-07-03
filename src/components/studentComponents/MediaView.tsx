import { useRef, useEffect, useState, useCallback } from "react";
import {
  MediaPlayer,
  MediaProvider,
  MediaPlayerInstance,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { ICarriculam, ILecture } from "@/Interface/CourseData";

interface MediaViewerProps {
  currentLesson: ILecture | null;
  carriculam: ICarriculam;
  studentId: string;
  courseId: string | undefined;
  updateLessonProgress: (
    sectionId: string,
    lectureId: string,
    progressValue: number,
    totalSeconds: number,
    actualSecondsWatched: number
  ) => void;
}

export default function MediaViewer({
  currentLesson,
  carriculam,
  studentId,
  updateLessonProgress,
}: MediaViewerProps) {
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Handle PDF load error (e.g., invalid PDF URL)
  const handlePdfError = useCallback(() => {
    setPdfError("Failed to load PDF. Please try again.");
  }, []);

  // Handle video time updates
  const handleTimeUpdate = useCallback(
    (sectionId: string) => {
      if (playerRef.current && currentLesson?.videoPath && studentId) {
        const currentTime = playerRef.current.currentTime;
        const duration = playerRef.current.duration;
        if (duration > 0) {
          const progressValue = Math.min((currentTime / duration) * 100);
          updateLessonProgress(
            sectionId,
            currentLesson._id,
            progressValue,
            duration,
            currentTime
          );
        }
      }
    },
    [currentLesson?.videoPath, studentId, updateLessonProgress]
  );

  // Mark lesson complete
  const markLessonComplete = useCallback(
    (sectionId: string, lectureId: string) => {
      updateLessonProgress(sectionId, lectureId, 100, 0, 0);
    },
    [updateLessonProgress]
  );

  // Handle PDF view tracking (basic implementation)
  const handlePdfView = useCallback(
    (sectionId: string, lectureId: string) => {
      // For simplicity, assume 50% progress when PDF is loaded, 100% when marked complete
      updateLessonProgress(sectionId, lectureId, 50, 0, 0);
    },
    [updateLessonProgress]
  );

  // Trigger PDF view tracking when PDF is loaded
  useEffect(() => {
    if (currentLesson?.pdfPath) {
      const sectionId =
        carriculam.sections.find((sec) =>
          sec.lectures.some((lec) => lec._id === currentLesson._id)
        )?._id || "";
      handlePdfView(sectionId, currentLesson._id);
    }
  }, [currentLesson?.pdfPath, carriculam.sections, handlePdfView]);

  return (
    <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center relative">
      {pdfError && <p className="text-red-500 p-4">{pdfError}</p>}
      {currentLesson ? (
        currentLesson.videoPath ? (
          <MediaPlayer
            ref={playerRef}
            title={currentLesson.title}
            src={currentLesson.videoPath}
            onTimeUpdate={() =>
              handleTimeUpdate(
                carriculam.sections.find((sec) =>
                  sec.lectures.some((lec) => lec._id === currentLesson._id)
                )?._id || ""
              )
            }
          >
            <MediaProvider />
            <DefaultVideoLayout
              thumbnails={currentLesson.videoPath}
              icons={defaultLayoutIcons}
            />
          </MediaPlayer>
        ) : currentLesson.pdfPath ? (
          <div className="relative w-full h-full overflow-auto">
            <iframe
              src={currentLesson.pdfPath}
              className="w-full h-full"
              title={currentLesson.title}
              onError={handlePdfError}
            />
            <button
              onClick={() =>
                markLessonComplete(
                  carriculam.sections.find((sec) =>
                    sec.lectures.some((lec) => lec._id === currentLesson._id)
                  )?._id || "",
                  currentLesson._id
                )
              }
              className="absolute bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Mark as Complete
            </button>
          </div>
        ) : (
          <p className="text-white">No media available</p>
        )
      ) : (
        <p className="text-white">Select a lesson</p>
      )}
    </div>
  );
}
