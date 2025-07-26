
import { FormikProps } from "formik";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { FormData } from "@/Pages/types/instructor"; 

interface SocialMediaProps {
  formik: FormikProps<FormData>;
}

interface SocialPlatform {
  name: string;
  key: keyof FormData["socialMedia"];
  icon: string;
  placeholder: string;
  color: string;
  description: string;
}

export default function SocialMedia({ formik }: SocialMediaProps) {
//   const validateUrl = (url: string): boolean => {
//     if (!url) return true;
//     try {
//       new URL(url.startsWith("http") ? url : `https://${url}`);
//       return true;
//     } catch {
//       return false;
//     }
//   };

  const validateSocialUrl = (url: string, platform: string): boolean => {
    if (!url) return true;

    const platformDomains: Record<string, string[]> = {
      twitter: ["twitter.com", "x.com"],
      facebook: ["facebook.com", "fb.me"],
      instagram: ["instagram.com"],
      youtube: ["youtube.com", "youtu.be"],
    };

    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      const allowedDomains = platformDomains[platform.toLowerCase()];

      if (allowedDomains) {
        return allowedDomains.some(
          (domain) =>
            urlObj.hostname === domain || urlObj.hostname === `www.${domain}`
        );
      }

      return true;
    } catch {
      return false;
    }
  };

  const socialPlatforms: SocialPlatform[] = [
    {
      name: "Twitter/X",
      key: "twitter",
      icon: "mdi:twitter",
      placeholder: "https://twitter.com/yourusername",
      color: "text-blue-400",
      description: "Share your thoughts and connect with the community",
    },
    {
      name: "Facebook",
      key: "facebook",
      icon: "mdi:facebook",
      placeholder: "https://facebook.com/yourprofile",
      color: "text-blue-600",
      description: "Connect with students and share your content",
    },
    {
      name: "Instagram",
      key: "instagram",
      icon: "mdi:instagram",
      placeholder: "https://instagram.com/yourusername",
      color: "text-pink-600",
      description: "Share visual content and behind-the-scenes moments",
    },
    {
      name: "YouTube",
      key: "youtube",
      icon: "mdi:youtube",
      placeholder: "https://youtube.com/c/yourchannel",
      color: "text-red-600",
      description: "Showcase your video content and tutorials",
    },
  ];

  const getFieldError = (
    fieldName: keyof FormData["socialMedia"]
  ): string | undefined => {
    return formik.touched.socialMedia?.[fieldName] &&
      formik.errors.socialMedia?.[fieldName]
      ? formik.errors.socialMedia[fieldName]
      : undefined;
  };

//   const isFieldTouched = (
//     fieldName: keyof FormData["socialMedia"]
//   ): boolean => {
//     return Boolean(formik.touched.socialMedia?.[fieldName]);
//   };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full mb-4">
          <Icon icon="mdi:share-variant" className="text-white text-2xl" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Social Media Presence
        </h3>
        <p className="text-gray-600">
          Connect your social profiles to build trust and reach more students
        </p>
      </div>

      {/* Optional Badge */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <Icon icon="mdi:information" className="text-pink-600 text-xl" />
          <div>
            <h4 className="text-pink-800 font-medium text-sm">Optional Step</h4>
            <p className="text-pink-700 text-sm">
              You can skip this step and add your social media profiles later
              from your dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Social Media Platforms */}
      <div className="space-y-6">
        {socialPlatforms.map((platform) => (
          <div key={platform.key} className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Icon
                icon={platform.icon}
                className={`text-lg ${platform.color}`}
              />
              {platform.name}
            </label>

            <div className="relative">
              <Input
                type="url"
                name={`socialMedia.${platform.key}`}
                placeholder={platform.placeholder}
                value={formik.values.socialMedia[platform.key]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 ${
                  formik.values.socialMedia[platform.key] &&
                  !validateSocialUrl(
                    formik.values.socialMedia[platform.key],
                    platform.key
                  )
                    ? "border-red-500 focus:ring-red-500"
                    : formik.values.socialMedia[platform.key] &&
                      validateSocialUrl(
                        formik.values.socialMedia[platform.key],
                        platform.key
                      )
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-indigo-500"
                }`}
              />
              <Icon
                icon={platform.icon}
                className={`absolute left-3 top-3 text-lg ${platform.color}`}
              />

              {formik.values.socialMedia[platform.key] &&
                validateSocialUrl(
                  formik.values.socialMedia[platform.key],
                  platform.key
                ) && (
                  <Icon
                    icon="mdi:check-circle"
                    className="absolute right-3 top-3 text-green-500 text-lg"
                  />
                )}
            </div>

            {getFieldError(platform.key) && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <Icon icon="mdi:alert-circle" className="text-sm" />
                {getFieldError(platform.key)}
              </div>
            )}

            <p className="text-xs text-gray-500">{platform.description}</p>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h4 className="text-indigo-800 font-medium text-lg mb-4 flex items-center gap-2">
          <Icon icon="mdi:star-circle" className="text-indigo-600" />
          Benefits of Adding Social Media
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon
                icon="mdi:account-multiple"
                className="text-indigo-600 text-sm"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-800">Build Trust</p>
              <p className="text-xs text-indigo-600 mt-1">
                Students can see your authentic presence and expertise
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon
                icon="mdi:trending-up"
                className="text-indigo-600 text-sm"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-800">
                Increase Visibility
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                Reach more students through social proof and recommendations
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon
                icon="mdi:message-text"
                className="text-indigo-600 text-sm"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-800">
                Better Engagement
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                Connect with students outside the classroom environment
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon
                icon="mdi:shield-check"
                className="text-indigo-600 text-sm"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-800">
                Enhanced Credibility
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                Showcase your professional network and accomplishments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon icon="mdi:lock" className="text-gray-600 text-lg mt-0.5" />
          <div>
            <h5 className="text-gray-800 font-medium text-sm">
              Privacy & Control
            </h5>
            <p className="text-gray-600 text-xs mt-1">
              You have full control over which social media profiles to display
              on your instructor profile. You can update or remove these links
              anytime from your dashboard settings.
            </p>
          </div>
        </div>
      </div>

      {/* Skip Option */}
      <div className="text-center pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            // Clear all social media fields
            formik.setFieldValue("socialMedia", {
              twitter: "",
              facebook: "",
              instagram: "",
              youtube: "",
            });
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <Icon icon="mdi:skip-next" className="mr-2" />
          Skip for now
        </Button>
        <p className="text-xs text-gray-400 mt-1">
          You can always add these later
        </p>
      </div>
    </div>
  );
}
