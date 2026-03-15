import * as React from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Upload, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { adminGetSiteContent, adminUpdateSiteContent, adminUploadSiteImage } from "@/api/admin";

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "image";
  group: string;
  placeholder?: string;
};

const FIELDS: FieldDef[] = [
  // ── Branding ──
  { key: "club_name", label: "Club Full Name", type: "text", group: "Branding", placeholder: "Infernals MC Israel" },
  { key: "club_name_short", label: "Club Short Name", type: "text", group: "Branding", placeholder: "Infernals MC" },
  { key: "club_country", label: "Country", type: "text", group: "Branding", placeholder: "Israel" },

  // ── Hero Section ──
  { key: "hero_image_url", label: "Hero Image URL", type: "image", group: "Hero Section" },
  { key: "hero_image_alt", label: "Hero Image Alt Text", type: "text", group: "Hero Section", placeholder: "Infernals MC Israel Logo" },

  // ── Background ──
  { key: "background_texture_url", label: "Background Texture Image URL", type: "image", group: "Background" },

  // ── About Section (Home) ──
  { key: "about_title", label: "About Section Title", type: "text", group: "Home — About Section", placeholder: "About Us" },
  { key: "about_text", label: "About Text", type: "textarea", group: "Home — About Section" },
  { key: "about_text_dir", label: "About Text Direction (ltr / rtl)", type: "text", group: "Home — About Section", placeholder: "rtl" },

  // ── Home — Next Event Banner ──
  { key: "home_next_event_label", label: "\"Next Event\" Label", type: "text", group: "Home — Next Event Banner", placeholder: "Next Event" },
  { key: "home_no_upcoming_title", label: "No Upcoming Events Title", type: "text", group: "Home — Next Event Banner", placeholder: "No upcoming events scheduled yet" },
  { key: "home_no_upcoming_text", label: "No Upcoming Events Text", type: "text", group: "Home — Next Event Banner", placeholder: "Check the calendar — we update it continuously." },

  // ── Home — Explore Section ──
  { key: "explore_title", label: "Explore Section Title", type: "text", group: "Home — Explore Section", placeholder: "Explore" },
  { key: "explore_subtitle", label: "Explore Section Subtitle", type: "text", group: "Home — Explore Section" },
  { key: "home_explore_1_title", label: "Card 1 Title", type: "text", group: "Home — Explore Section", placeholder: "Events" },
  { key: "home_explore_1_desc", label: "Card 1 Description", type: "text", group: "Home — Explore Section", placeholder: "Calendar + media pages" },
  { key: "home_explore_1_href", label: "Card 1 Link", type: "text", group: "Home — Explore Section", placeholder: "/events" },
  { key: "home_explore_2_title", label: "Card 2 Title", type: "text", group: "Home — Explore Section", placeholder: "Trainings" },
  { key: "home_explore_2_desc", label: "Card 2 Description", type: "text", group: "Home — Explore Section", placeholder: "Only training events" },
  { key: "home_explore_2_href", label: "Card 2 Link", type: "text", group: "Home — Explore Section", placeholder: "/trainings" },
  { key: "home_explore_3_title", label: "Card 3 Title", type: "text", group: "Home — Explore Section", placeholder: "Art Studio" },
  { key: "home_explore_3_desc", label: "Card 3 Description", type: "text", group: "Home — Explore Section", placeholder: "Clickable projects" },
  { key: "home_explore_3_href", label: "Card 3 Link", type: "text", group: "Home — Explore Section", placeholder: "/art-studio" },
  { key: "home_explore_4_title", label: "Card 4 Title", type: "text", group: "Home — Explore Section", placeholder: "Support" },
  { key: "home_explore_4_desc", label: "Card 4 Description", type: "text", group: "Home — Explore Section", placeholder: "Donate & help the club" },
  { key: "home_explore_4_href", label: "Card 4 Link", type: "text", group: "Home — Explore Section", placeholder: "/support" },

  // ── Home — Officers Section ──
  { key: "officers_title", label: "Officers Section Title", type: "text", group: "Home — Officers Section", placeholder: "Club Officers" },

  // ── Home — Upcoming Section ──
  { key: "upcoming_title", label: "Upcoming Section Title", type: "text", group: "Home — Upcoming Section", placeholder: "Upcoming" },
  { key: "upcoming_subtitle", label: "Upcoming Section Subtitle", type: "text", group: "Home — Upcoming Section" },
  { key: "home_upcoming_events_label", label: "Events Column Title", type: "text", group: "Home — Upcoming Section", placeholder: "Events" },
  { key: "home_upcoming_trainings_label", label: "Trainings Column Title", type: "text", group: "Home — Upcoming Section", placeholder: "Trainings" },
  { key: "home_no_upcoming_events", label: "No Upcoming Events Text", type: "text", group: "Home — Upcoming Section", placeholder: "No upcoming club events." },
  { key: "home_no_upcoming_trainings", label: "No Upcoming Trainings Text", type: "text", group: "Home — Upcoming Section", placeholder: "No upcoming trainings." },
  { key: "home_open_events_btn", label: "Open Events Button Text", type: "text", group: "Home — Upcoming Section", placeholder: "Open Events Calendar" },
  { key: "home_open_trainings_btn", label: "Open Trainings Button Text", type: "text", group: "Home — Upcoming Section", placeholder: "Open Trainings Calendar" },

  // ── Home — Gallery Section ──
  { key: "gallery_title", label: "Gallery Section Title", type: "text", group: "Home — Gallery Section", placeholder: "Gallery" },

  // ── Home — Contact Section ──
  { key: "contact_title", label: "Contact Section Title", type: "text", group: "Home — Contact Section", placeholder: "Contact Us" },

  // ── Contact Info ──
  { key: "contact_phone", label: "Phone", type: "text", group: "Contact Info", placeholder: "052-7490673" },
  { key: "contact_email", label: "Email", type: "text", group: "Contact Info", placeholder: "infernalsmcisrael@gmail.com" },
  { key: "contact_address_he", label: "Address (Hebrew)", type: "text", group: "Contact Info" },
  { key: "contact_address_en", label: "Address (English)", type: "text", group: "Contact Info" },

  // ── Social Links ──
  { key: "social_instagram_club", label: "Club Instagram URL", type: "url", group: "Social Links" },
  { key: "social_instagram_art_studio", label: "Art Studio Instagram URL", type: "url", group: "Social Links" },

  // ── Events Page ──
  { key: "events_page_title", label: "Page Title", type: "text", group: "Events Page", placeholder: "Events" },
  { key: "events_page_subtitle", label: "Page Subtitle", type: "text", group: "Events Page" },
  { key: "events_empty_text", label: "Empty State Text", type: "text", group: "Events Page", placeholder: "No events match the current filters." },

  // ── Trainings Page ──
  { key: "trainings_page_title", label: "Page Title", type: "text", group: "Trainings Page", placeholder: "Trainings" },
  { key: "trainings_page_subtitle", label: "Page Subtitle", type: "text", group: "Trainings Page" },
  { key: "trainings_empty_text", label: "Empty State Text", type: "text", group: "Trainings Page", placeholder: "No trainings match the current filters." },

  // ── Organized Page ──
  { key: "organized_page_title", label: "Page Title", type: "text", group: "Organized Page", placeholder: "Organized Events" },
  { key: "organized_page_subtitle", label: "Page Subtitle", type: "text", group: "Organized Page" },
  { key: "organized_empty_text", label: "Empty State Text", type: "text", group: "Organized Page", placeholder: "No organized events match the current filters." },

  // ── Event Details Page ──
  { key: "event_gallery_title", label: "Gallery Section Title", type: "text", group: "Event Details Page", placeholder: "Photos & Videos" },

  // ── Activities Page ──
  { key: "activities_title", label: "Page Title", type: "text", group: "Activities Page", placeholder: "Club Activities" },
  { key: "activities_subtitle", label: "Page Subtitle", type: "text", group: "Activities Page" },
  { key: "activities_card_1_title", label: "Card 1 Title", type: "text", group: "Activities Page", placeholder: "Events Organization" },
  { key: "activities_card_1_desc", label: "Card 1 Description", type: "text", group: "Activities Page" },
  { key: "activities_card_1_href", label: "Card 1 Link", type: "text", group: "Activities Page", placeholder: "/organized" },
  { key: "activities_card_2_title", label: "Card 2 Title", type: "text", group: "Activities Page", placeholder: "Club Events" },
  { key: "activities_card_2_desc", label: "Card 2 Description", type: "text", group: "Activities Page" },
  { key: "activities_card_2_href", label: "Card 2 Link", type: "text", group: "Activities Page", placeholder: "/events" },
  { key: "activities_card_3_title", label: "Card 3 Title", type: "text", group: "Activities Page", placeholder: "Trainings" },
  { key: "activities_card_3_desc", label: "Card 3 Description", type: "text", group: "Activities Page" },
  { key: "activities_card_3_href", label: "Card 3 Link", type: "text", group: "Activities Page", placeholder: "/trainings" },
  { key: "activities_card_4_title", label: "Card 4 Title", type: "text", group: "Activities Page", placeholder: "Infernals Art Studio" },
  { key: "activities_card_4_desc", label: "Card 4 Description", type: "text", group: "Activities Page" },
  { key: "activities_card_4_href", label: "Card 4 Link", type: "text", group: "Activities Page", placeholder: "/art-studio" },
  { key: "activities_card_5_title", label: "Card 5 Title", type: "text", group: "Activities Page", placeholder: "Everything Else" },
  { key: "activities_card_5_desc", label: "Card 5 Description", type: "text", group: "Activities Page" },
  { key: "activities_card_5_href", label: "Card 5 Link", type: "text", group: "Activities Page", placeholder: "/#gallery" },

  // ── Art Studio Page ──
  { key: "art_studio_page_title", label: "Page Title", type: "text", group: "Art Studio Page", placeholder: "Infernals Art Studio" },
  { key: "art_studio_page_subtitle", label: "Page Subtitle", type: "text", group: "Art Studio Page" },

  // ── Support Page ──
  { key: "support_page_title", label: "Page Title", type: "text", group: "Support Page", placeholder: "Support Infernals" },
  { key: "support_page_subtitle", label: "Page Subtitle", type: "text", group: "Support Page" },
  { key: "support_contacts_title", label: "Contacts Block Title", type: "text", group: "Support Page", placeholder: "Contacts" },
  { key: "support_ways_title", label: "Ways to Support Title", type: "text", group: "Support Page", placeholder: "Ways to support" },
  { key: "support_ways_subtitle", label: "Ways to Support Subtitle", type: "text", group: "Support Page" },
  { key: "support_thanks_title", label: "Thank You Title", type: "text", group: "Support Page", placeholder: "Thank you for your support" },
  { key: "support_thanks_subtitle", label: "Thank You Subtitle", type: "text", group: "Support Page" },

  // ── Footer ──
  { key: "footer_contact_label", label: "Contact Column Label", type: "text", group: "Footer", placeholder: "Contact" },
  { key: "footer_social_label", label: "Social Column Label", type: "text", group: "Footer", placeholder: "Social" },
  { key: "footer_copyright_suffix", label: "Copyright Suffix", type: "text", group: "Footer", placeholder: "All Rights Reserved." },
];

const GROUPS = [...new Set(FIELDS.map(f => f.group))];

export default function AdminSiteContent() {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const content = await adminGetSiteContent();
      setValues(content);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load site content");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const updated = await adminUpdateSiteContent(values);
      setValues(updated);
      toast.success("Site content saved successfully");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onUploadImage = async (key: string, file: File) => {
    try {
      const url = await adminUploadSiteImage(file);
      onChange(key, url);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  };

  const toggleGroup = (group: string) => {
    setCollapsed(prev => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div>
      <PageHeader
        title="Site Content"
        subtitle="Edit all texts, images, contacts, and links that appear on the public website. Organized by page."
      />

      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="border-2 border-gray-700 bg-black/30 p-6 text-gray-200">Loading…</div>
        ) : (
          <>
            <div className="space-y-4">
              {GROUPS.map(group => {
                const isCollapsed = collapsed[group];
                const fields = FIELDS.filter(f => f.group === group);
                return (
                  <div key={group} className="border-2 border-gray-700 bg-black/30">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className="w-full flex items-center justify-between p-4 hover:bg-black/20 transition-colors"
                    >
                      <h2 className="font-heading uppercase text-xl text-red-500">{group}</h2>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-sm">{fields.length} fields</span>
                        {isCollapsed ? <ChevronRight className="size-5" /> : <ChevronDown className="size-5" />}
                      </div>
                    </button>
                    {!isCollapsed && (
                      <div className="px-6 pb-6 space-y-4 border-t border-gray-800">
                        {fields.map(field => (
                          <div key={field.key} className="mt-4">
                            <label className="block text-sm text-gray-400 mb-1">
                              {field.label}{" "}
                              <code className="text-gray-600 text-xs">({field.key})</code>
                            </label>
                            {field.type === "textarea" ? (
                              <Textarea
                                value={values[field.key] || ""}
                                onChange={e => onChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="bg-black/40 border-gray-700 text-gray-200 min-h-[100px]"
                              />
                            ) : field.type === "image" ? (
                              <div className="flex gap-3 items-start">
                                <div className="flex-1">
                                  <Input
                                    value={values[field.key] || ""}
                                    onChange={e => onChange(field.key, e.target.value)}
                                    placeholder="https://..."
                                    className="bg-black/40 border-gray-700 text-gray-200"
                                  />
                                  {values[field.key] && (
                                    <img
                                      src={values[field.key]}
                                      alt="Preview"
                                      className="mt-2 max-h-32 object-contain border border-gray-700 bg-black/20"
                                    />
                                  )}
                                </div>
                                <label className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-3 py-2 font-heading uppercase text-gray-200 cursor-pointer text-sm shrink-0">
                                  <Upload className="size-4" /> Upload
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                      const f = e.target.files?.[0];
                                      if (f) onUploadImage(field.key, f);
                                      e.currentTarget.value = "";
                                    }}
                                  />
                                </label>
                              </div>
                            ) : (
                              <Input
                                value={values[field.key] || ""}
                                onChange={e => onChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="bg-black/40 border-gray-700 text-gray-200"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end sticky bottom-4">
              <Button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white font-heading uppercase px-8 py-3 shadow-lg shadow-red-500/20"
              >
                <Save className="size-4 mr-2" />
                {saving ? "Saving…" : "Save All Changes"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
