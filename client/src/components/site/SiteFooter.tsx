import { Mail, MapPin, Phone } from "lucide-react";
import { contacts, social } from "@/site/content";

export function SiteFooter() {
  return (
    <footer className="bg-black py-10 text-center text-gray-400 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="text-left">
            <p className="font-heading uppercase text-red-500 mb-2">Contact</p>
            <div className="flex items-center gap-3 mb-2">
              <Phone className="text-red-500" size={18} />
              <a href={`tel:${contacts.phone}`} className="hover:text-white">
                {contacts.phone}
              </a>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Mail className="text-red-500" size={18} />
              <a href={`mailto:${contacts.email}`} className="hover:text-white break-all">
                {contacts.email}
              </a>
            </div>
            <div className="flex items-start gap-3" dir="rtl">
              <MapPin className="text-red-500 mt-1" size={18} />
              <p className="text-gray-300">{contacts.addressHe}</p>
            </div>
          </div>

          <div>
            <p className="font-heading uppercase text-red-500 mb-2">Social</p>
            <a
              className="inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
              href={social.instagramClub}
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>

          <div className="text-right">
            <p className="font-heading uppercase text-red-500 mb-2">Infernals MC Israel</p>
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} {" "}
              Infernals MC Israel. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
