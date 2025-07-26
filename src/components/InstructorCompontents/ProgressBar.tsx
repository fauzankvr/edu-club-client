import { STEPS } from "@/Pages/types/instructor"; 

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {STEPS[currentStep]}
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {currentStep + 1} of {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between mt-2">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index <= currentStep ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  index <= currentStep
                    ? "bg-indigo-600 border-indigo-600"
                    : "bg-white border-gray-300"
                }`}
              />
              <span className="text-xs mt-1 hidden sm:block">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
