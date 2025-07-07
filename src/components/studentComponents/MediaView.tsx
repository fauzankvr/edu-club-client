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
  const sentThresholdsRef = useRef<number[]>([]); // Track sent progress thresholds for the current lesson

  // Reset sentThresholdsRef when currentLesson changes
  useEffect(() => {
    sentThresholdsRef.current = [];
  }, [currentLesson?._id]);

  // Handle PDF load error
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
          const progressValue = Math.min((currentTime / duration) * 100, 100);
          const roundedProgress = Math.round(progressValue / 5) * 5; // Round to nearest 5%

          // Only call updateLessonProgress if this threshold hasn't been sent yet
          if (
            roundedProgress > 0 &&
            roundedProgress % 5 === 0 &&
            !sentThresholdsRef.current.includes(roundedProgress)
          ) {
            updateLessonProgress(
              sectionId,
              currentLesson._id,
              roundedProgress,
              duration,
              currentTime
            );
            sentThresholdsRef.current.push(roundedProgress); // Mark this threshold as sent
          }
        }
      }
    },
    [
      currentLesson?.videoPath,
      currentLesson?._id,
      studentId,
      updateLessonProgress,
    ]
  );

  // Mark lesson complete
  const markLessonComplete = useCallback(
    (sectionId: string, lectureId: string) => {
      if (!sentThresholdsRef.current.includes(100)) {
        updateLessonProgress(sectionId, lectureId, 100, 0, 0);
        sentThresholdsRef.current.push(100); // Mark 100% as sent
      }
    },
    [updateLessonProgress]
  );

  // Handle PDF view tracking
  const handlePdfView = useCallback(
    (sectionId: string, lectureId: string) => {
      if (!sentThresholdsRef.current.includes(50)) {
        updateLessonProgress(sectionId, lectureId, 50, 0, 0);
        sentThresholdsRef.current.push(50); // Mark 50% as sent
      }
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
  }, [
    currentLesson?.pdfPath,
    currentLesson?._id,
    carriculam.sections,
    handlePdfView,
  ]);

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
