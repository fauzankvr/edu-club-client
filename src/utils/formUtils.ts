// utils/formUtils.ts
import { Teacher } from "@/Pages/types/instructor"; 

export const cleanTeacherValues = (teacher: Teacher): Partial<Teacher> => {
  const cleaned: Partial<Teacher> = {};
  
  cleaned.id = teacher.id;
  cleaned.email = teacher.email;
  cleaned.fullName = teacher.fullName;
  cleaned.isBlocked = teacher.isBlocked;
  cleaned.isApproved = teacher.isApproved;

  // Handle optional fields exactly as defined in your interface
  if (teacher.phone !== undefined && teacher.phone !== null) {
    cleaned.phone = String(teacher.phone).trim();
  }
  if (teacher.profileImage) cleaned.profileImage = teacher.profileImage;
  if (teacher.dateOfBirth?.trim()) cleaned.dateOfBirth = teacher.dateOfBirth;
  if (teacher.Biography?.trim()) cleaned.Biography = teacher.Biography.trim();
  if (teacher.eduQulification?.trim())
    cleaned.eduQulification = teacher.eduQulification.trim();
  if (teacher.currentPosition?.trim())
    cleaned.currentPosition = teacher.currentPosition.trim();
  if (teacher.workPlace?.trim()) cleaned.workPlace = teacher.workPlace.trim();
  if (teacher.linkedInProfile?.trim())
    cleaned.linkedInProfile = teacher.linkedInProfile.trim();
  if (teacher.website?.trim()) cleaned.website = teacher.website.trim();
  if (teacher.paypalEmail?.trim())
    cleaned.paypalEmail = teacher.paypalEmail.trim();

  // Handle optional number fields
  if (typeof teacher.experience === "number")
    cleaned.experience = teacher.experience;
  if (typeof teacher.teachingExperience === "number")
    cleaned.teachingExperience = teacher.teachingExperience;

  // Handle optional array fields
  if (teacher.expertise?.length) {
    const filtered = teacher.expertise.filter((item) => item?.trim());
    if (filtered.length > 0) cleaned.expertise = filtered;
  }

  if (teacher.languages?.length) {
    const filtered = teacher.languages.filter((item) => item?.trim());
    if (filtered.length > 0) cleaned.languages = filtered;
  }

  if (teacher.certifications?.length)
    cleaned.certifications = teacher.certifications;

  // Handle optional nested objects
  if (teacher.address) {
    const addressCleaned: any = {};
    if (teacher.address.street?.trim())
      addressCleaned.street = teacher.address.street.trim();
    if (teacher.address.city?.trim())
      addressCleaned.city = teacher.address.city.trim();
    if (teacher.address.state?.trim())
      addressCleaned.state = teacher.address.state.trim();
    if (teacher.address.country?.trim())
      addressCleaned.country = teacher.address.country.trim();
    if (teacher.address.zipCode?.trim())
      addressCleaned.zipCode = teacher.address.zipCode.trim();

    if (Object.keys(addressCleaned).length > 0)
      cleaned.address = addressCleaned;
  }

  if (teacher.socialMedia) {
    const socialCleaned: any = {};
    if (teacher.socialMedia.twitter?.trim())
      socialCleaned.twitter = teacher.socialMedia.twitter.trim();
    if (teacher.socialMedia.facebook?.trim())
      socialCleaned.facebook = teacher.socialMedia.facebook.trim();
    if (teacher.socialMedia.instagram?.trim())
      socialCleaned.instagram = teacher.socialMedia.instagram.trim();
    if (teacher.socialMedia.youtube?.trim())
      socialCleaned.youtube = teacher.socialMedia.youtube.trim();

    if (Object.keys(socialCleaned).length > 0)
      cleaned.socialMedia = socialCleaned;
  }

  // Handle optional timestamp fields
  if (teacher.createdAt) cleaned.createdAt = teacher.createdAt;
  if (teacher.updatedAt) cleaned.updatedAt = teacher.updatedAt;

  return cleaned;
};
