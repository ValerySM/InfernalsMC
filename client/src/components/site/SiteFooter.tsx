import { Mail, MapPin, Phone } from "lucide-react";
import { useSiteContent } from "@/hooks/usePublicContent";

export function SiteFooter() {
  const { get } = useSiteContent();

  const phone = get("contact_phone", "");
  const email = get("contact_email", "");
  const addressHe = get("contact_address_he", "");
  const instagram = get("social_instagram_club", "");
  const clubName = get("club_name", "Infernals MC Israel");

  return (
    <footer className="bg-black py-10 text-center text-gray-400 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="text-left">
            <p className="font-heading uppercase text-red-500 mb-2">
              {get("footer_contact_label", "Contact")}
            </p>
            {phone && (
              <div className="flex items-center gap-3 mb-2">
                <Phone className="text-red-500" size={18} />
                <a href={`tel:${phone}`} className="hover:text-white">
                  {phone}
                </a>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3 mb-2">
                <Mail className="text-red-500" size={18} />
                <a href={`mailto:${email}`} className="hover:text-white break-all">
                  {email}
                </a>
              </div>
            )}
            {addressHe && (
              <div className="flex items-start gap-3" dir="rtl">
                <MapPin className="text-red-500 mt-1" size={18} />
                <p className="text-gray-300">{addressHe}</p>
              </div>
            )}
          </div>

          <div>
            <p className="font-heading uppercase text-red-500 mb-2">
              {get("footer_social_label", "Social")}
            </p>
            {instagram && (
              <a
                className="inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
                href={instagram}
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            )}
          </div>

          <div className="text-right">
            <p className="font-heading uppercase text-red-500 mb-2">{clubName}</p>
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()}{" "}
              {clubName}. {get("footer_copyright_suffix", "All Rights Reserved.")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
