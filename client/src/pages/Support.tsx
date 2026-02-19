import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { SUPPORT_METHODS } from "@/data/support";
import { contacts, social } from "@/site/content";

function QrBox({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      <a href={src} target="_blank" rel="noreferrer" className="block border-2 border-gray-700 bg-black/30 p-2">
        <img src={src} alt={alt} className="w-full h-44 object-contain bg-white" loading="lazy" />
      </a>
    );
  }

  return (
    <div className="border-2 border-gray-700 bg-black/30 p-2">
      <div className="w-full h-44 bg-white/90 grid grid-cols-6 grid-rows-6 gap-0.5 p-2">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className={i % 3 === 0 ? "bg-black/70" : "bg-black/10"} />
        ))}
      </div>
      <p className="mt-2 text-center text-gray-500 text-xs">
        Add QR image in <code className="text-gray-300">/client/public/support-qr</code>
      </p>
    </div>
  );
}

export default function Support() {
  return (
    <div>
      <PageHeader
        title="Support Infernals"
        subtitle="Thank you for your support. Every contribution helps us keep building events, trainings and projects."
      />

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts */}
          <div className="border-2 border-gray-700 bg-black/30 p-6">
            <h2 className="font-heading uppercase text-2xl text-red-500">
              Contacts
            </h2>
            <div className="mt-6 text-gray-300">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="text-red-500" size={18} />
                <a href={`tel:${contacts.phone}`} className="hover:text-white">
                  {contacts.phone}
                </a>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="text-red-500" size={18} />
                <a
                  href={`mailto:${contacts.email}`}
                  className="hover:text-white break-all"
                >
                  {contacts.email}
                </a>
              </div>
              <div className="flex items-start gap-3" dir="rtl">
                <MapPin className="text-red-500 mt-1" size={18} />
                <p>{contacts.addressHe}</p>
              </div>

              <div className="mt-6">
                <a
                  href={social.instagramClub}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
                >
                  Instagram <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Support Methods */}
          <div className="lg:col-span-2 border-2 border-gray-700 bg-black/30 p-6">
            <h2 className="font-heading uppercase text-2xl text-red-500">
              Ways to support
            </h2>
            <p className="mt-2 text-gray-300 max-w-2xl">
              Choose any method below. You can update links and QR images in
              <code className="mx-1 text-gray-200">src/data/support.ts</code>.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {SUPPORT_METHODS.map(m => (
                <div
                  key={m.id}
                  className="border-2 border-gray-800 bg-black/40 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading uppercase text-xl text-white">
                        {m.title}
                      </h3>
                      {m.description ? (
                        <p className="mt-2 text-gray-300">{m.description}</p>
                      ) : null}
                    </div>
                    {m.link ? (
                      <Button
                        asChild
                        variant="outline"
                        className="border-gray-700 text-gray-200 hover:bg-black/40"
                      >
                        <a href={m.link} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </Button>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <QrBox src={m.qrImage || undefined} alt={`${m.title} QR`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-gray-800 pt-6 text-center">
              <p className="font-heading uppercase text-gray-200">
                Thank you for your support
              </p>
              <p className="mt-2 text-gray-500">
                We appreciate every rider, friend, and supporter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
