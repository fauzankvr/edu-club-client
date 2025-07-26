import { FormikProps } from "formik";
import PersonalDetails from "./steps/PersonalDetails"; 
import EducationalDetails from "./steps/EducationalDetails"; 
import AccountInformation from "./steps/AccountInformation"; 
import ProfessionalDetails from "./steps/ProfessionalDetails"; 
import ContactLocation from "./steps/ContactLocation";
import SocialMedia from "./steps/SocialMedia";
import { InstructorFormData } from "@/Pages/types/instructor";

interface StepContentProps {
  currentStep: number;
  formik: FormikProps<InstructorFormData>;
}

export default function StepContent({ currentStep, formik }: StepContentProps) {
  const stepComponents = [
    <AccountInformation key={0} formik={formik} />,
    <PersonalDetails key={1} formik={formik} />,
    <EducationalDetails key={2} formik={formik} />,
    <ProfessionalDetails key={3} formik={formik} />,
    <ContactLocation key={4} formik={formik} />,
    <SocialMedia key={5} formik={formik} />,
  ];

  return (
    <div className="bg-gray-50 rounded-2xl p-6 min-h-[400px]">
      {stepComponents[currentStep]}
    </div>
  );
}
