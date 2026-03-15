import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { getPool } from "./pool";

function nowIso() {
  return new Date().toISOString();
}

export async function initDb() {
  const pool = getPool();

  // ── Admin users (existing — for admin panel access) ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','superadmin')),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── Site Users (public registration system) ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'pending' CHECK (role IN ('pending','observer','member','secretary','admin')),
      status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval','active','rejected','deactivated')),
      email_consent BOOLEAN NOT NULL DEFAULT FALSE,
      reason_for_registration TEXT,
      phone TEXT,
      address TEXT,
      notes TEXT,
      additional_info TEXT,
      reset_token TEXT,
      reset_token_expires TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);

  // ── Member Profiles (extra info for members) ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS member_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      phone TEXT,
      address TEXT,
      notes TEXT,
      additional_info TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── Groups (created by secretary for members) ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── Group Members ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS group_members (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(group_id, user_id)
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);`);

  // ── Member Events (internal events for members) ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS member_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      event_type TEXT NOT NULL DEFAULT 'member' CHECK (event_type IN ('public','member')),
      date DATE NOT NULL,
      time TEXT,
      location TEXT,
      target_group_id TEXT REFERENCES groups(id) ON DELETE SET NULL,
      created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_member_events_type ON member_events(event_type);`);

  // ── Email Logs ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      member_event_id TEXT,
      recipient_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT,
      send_type TEXT NOT NULL DEFAULT 'event_notification' CHECK (send_type IN ('event_notification','member_event','password_reset','registration_approved','registration_rejected','admin_notification')),
      send_status TEXT NOT NULL DEFAULT 'sent' CHECK (send_status IN ('sent','failed','pending')),
      sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_email_logs_event ON email_logs(event_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_email_logs_member_event ON email_logs(member_event_id);`);

  // ── Registration Requests (tracking approval flow) ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS registration_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason_for_registration TEXT,
      admin_decision TEXT CHECK (admin_decision IN ('approved','rejected')),
      assigned_role TEXT CHECK (assigned_role IN ('observer','member','secretary','admin')),
      decided_by TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
      decided_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_reg_requests_user ON registration_requests(user_id);`);

  // ── Admin Notifications ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id TEXT PRIMARY KEY,
      admin_user_id TEXT REFERENCES admin_users(id) ON DELETE CASCADE,
      notification_type TEXT NOT NULL DEFAULT 'new_registration' CHECK (notification_type IN ('new_registration','general')),
      title TEXT NOT NULL,
      message TEXT,
      related_user_id TEXT,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_admin_notif_admin ON admin_notifications(admin_user_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_admin_notif_read ON admin_notifications(is_read);`);

  // ── Events (existing) ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      time TEXT,
      location TEXT,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('event','training','organized')),
      tags TEXT[] NOT NULL DEFAULT '{}',
      cover_url TEXT,
      external_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_media (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('image','embed','video')),
      url TEXT NOT NULL,
      alt TEXT,
      title TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_event_media_event ON event_media(event_id);`);

  // ── Gallery ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('image','embed','video')),
      url TEXT NOT NULL,
      caption TEXT,
      alt TEXT,
      title TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── Site Content (key-value) ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── Club Members (display officers on homepage) ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS club_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      photo_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ── Art Projects ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS art_projects (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      cover_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS art_project_media (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES art_projects(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('image','embed','video')),
      url TEXT NOT NULL,
      alt TEXT,
      title TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_art_project_media_project ON art_project_media(project_id);`);

  // ── Support Methods ──
  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_methods (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      link TEXT,
      qr_image_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ═══════════════════════════════════════════════════════════════
  // Bootstrap superadmin if empty
  // ═══════════════════════════════════════════════════════════════
  const usersCount = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM admin_users"
  );
  const count = Number(usersCount.rows[0]?.count || 0);
  if (count === 0) {
    const email = process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@admin.local";
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "admin12345";
    const name = process.env.ADMIN_BOOTSTRAP_NAME || "Admin";
    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO admin_users (id, email, name, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, 'superadmin', true)`,
      [nanoid(16), email.toLowerCase(), name, password_hash]
    );

    console.log(`[${nowIso()}] ✅ Bootstrapped first superadmin: ${email}`);
    console.log(`[${nowIso()}] 🔒 Change ADMIN_BOOTSTRAP_PASSWORD in production!`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Seed default site_content if empty
  // ═══════════════════════════════════════════════════════════════
  const contentCount = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM site_content"
  );
  if (Number(contentCount.rows[0]?.count || 0) === 0) {
    const defaults: Record<string, string> = {
      // Hero
      "hero_image_url": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/RVKRdjdkguMSvyhL.png",
      "hero_image_alt": "Infernals MC Israel Logo",
      // About
      "about_title": "About Us",
      "about_text": "מועדון אופנוענים INFERNALS MC ISRAEL. מועדון חברים שאוהבים אופנועים, חופש וחיים שמחים! אנחנו אוהבים לרכב על אופנועים, לתקן ולשפר אותם, ללמד רוכבים חדשים על איך לטפל נכון באופנוע, איך לרכב בצורה בטיחותית ולגלות מקומות מטריפים בארץ ובחו\"ל! וכמובן אוהבים לעשות מסיבות ולהזמין המון חברים!",
      "about_text_dir": "rtl",
      // Explore section
      "explore_title": "Explore",
      "explore_subtitle": "Everything is structured into pages — events, trainings, art projects, and support.",
      // Officers section
      "officers_title": "Club Officers",
      // Upcoming section
      "upcoming_title": "Upcoming",
      "upcoming_subtitle": "Next club events and trainings.",
      // Gallery section
      "gallery_title": "Gallery",
      // Contact
      "contact_title": "Contact Us",
      "contact_phone": "052-7490673",
      "contact_email": "infernalsmcisrael@gmail.com",
      "contact_address_he": "אליהו איתן 3, ראשון לציון",
      "contact_address_en": "Eliyahu Eitan 3, Rishon LeZion",
      // Social
      "social_instagram_club": "https://instagram.com/",
      "social_instagram_art_studio": "https://instagram.com/",
      // Club info
      "club_name": "Infernals MC Israel",
      "club_name_short": "Infernals MC",
      "club_country": "Israel",
      // Support page
      "support_title": "Support Infernals",
      "support_subtitle": "Thank you for your support. Every contribution helps us keep building events, trainings and projects.",
      "support_thank_you_title": "Thank you for your support",
      "support_thank_you_text": "We appreciate every rider, friend, and supporter.",
      // Art Studio page
      "art_studio_title": "Infernals Art Studio",
      "art_studio_subtitle": "Clickable projects with photos/videos and a direct link to the studio Instagram.",
      // Activities page
      "activities_title": "Club Activities",
      "activities_subtitle": "Everything we do — organized in one place.",
      "activities_card_1_title": "Events Organization",
      "activities_card_1_desc": "We organize club meetups and large public events: shows, exhibitions, concerts and more.",
      "activities_card_1_href": "/organized",
      "activities_card_2_title": "Club Events",
      "activities_card_2_desc": "Parties, rides, brotherhood gatherings — updated with photos and videos.",
      "activities_card_2_href": "/events",
      "activities_card_3_title": "Trainings",
      "activities_card_3_desc": "Guided trainings for new and experienced riders. Filterable calendar and event pages.",
      "activities_card_3_href": "/trainings",
      "activities_card_4_title": "Infernals Art Studio",
      "activities_card_4_desc": "Custom paint, fabrication, and creative projects. Click projects to see details and media.",
      "activities_card_4_href": "/art-studio",
      "activities_card_5_title": "Everything Else",
      "activities_card_5_desc": "Trips, community, collaborations, and the club life — we keep building and sharing.",
      "activities_card_5_href": "/#gallery",
      // Events page
      "events_page_title": "Events",
      "events_page_subtitle": "Our club events in a calendar view. Click a date to open event pages with photos and videos.",
      "events_empty_text": "No events match the current filters.",
      // Trainings page
      "trainings_page_title": "Trainings",
      "trainings_page_subtitle": "Training events only. Same flow as events — calendar, tags, and detailed pages.",
      "trainings_empty_text": "No trainings match the current filters.",
      // Organized page
      "organized_page_title": "Organized Events",
      "organized_page_subtitle": "Concerts, exhibitions and other events we helped organize.",
      "organized_empty_text": "No organized events match the current filters.",
      // Home page explore cards
      "home_explore_1_title": "Events",
      "home_explore_1_desc": "Calendar + media pages",
      "home_explore_1_href": "/events",
      "home_explore_2_title": "Trainings",
      "home_explore_2_desc": "Only training events",
      "home_explore_2_href": "/trainings",
      "home_explore_3_title": "Art Studio",
      "home_explore_3_desc": "Clickable projects",
      "home_explore_3_href": "/art-studio",
      "home_explore_4_title": "Support",
      "home_explore_4_desc": "Donate & help the club",
      "home_explore_4_href": "/support",
      // Home page misc texts
      "home_next_event_label": "Next Event",
      "home_no_upcoming_title": "No upcoming events scheduled yet",
      "home_no_upcoming_text": "Check the calendar — we update it continuously.",
      "home_open_events_btn": "Open Events Calendar",
      "home_open_trainings_btn": "Open Trainings Calendar",
      "home_upcoming_events_label": "Events",
      "home_upcoming_trainings_label": "Trainings",
      "home_no_upcoming_events": "No upcoming club events.",
      "home_no_upcoming_trainings": "No upcoming trainings.",
      // Event details page
      "event_gallery_title": "Photos & Videos",
      // Footer
      "footer_contact_label": "Contact",
      "footer_social_label": "Social",
      "footer_copyright_suffix": "All Rights Reserved.",
      // Support page extra
      "support_contacts_title": "Contacts",
      "support_ways_title": "Ways to support",
      "support_ways_subtitle": "Choose any method below to support the club.",
      // Registration / Auth texts
      "register_consent_text": "I agree to receive email notifications about club events, updates, and related information based on my role.",
      "pending_approval_message": "Your registration is pending admin approval. You will be notified by email once your account is reviewed.",
    };

    for (const [key, value] of Object.entries(defaults)) {
      await pool.query(
        `INSERT INTO site_content (key, value, updated_at) VALUES ($1, $2, now())
         ON CONFLICT (key) DO NOTHING`,
        [key, value]
      );
    }
    console.log(`[${nowIso()}] ✅ Seeded default site_content`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Seed default club members if empty
  // ═══════════════════════════════════════════════════════════════
  const membersCount = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM club_members"
  );
  if (Number(membersCount.rows[0]?.count || 0) === 0) {
    const defaultMembers = [
      { role: "PRESIDENT", name: "STAS" },
      { role: "V.PRESIDENT", name: "PASHA" },
      { role: "SECRETARY", name: "SAGIF" },
      { role: "TREASURE", name: "YURI" },
      { role: "SGT AT ARMS", name: "VALERY" },
      { role: "ROAD CAPTAIN", name: "GIL" },
    ];
    let order = 0;
    for (const m of defaultMembers) {
      await pool.query(
        `INSERT INTO club_members (id, name, role, sort_order) VALUES ($1, $2, $3, $4)`,
        [nanoid(16), m.name, m.role, order++]
      );
    }
    console.log(`[${nowIso()}] ✅ Seeded default club members`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Seed default support methods if empty
  // ═══════════════════════════════════════════════════════════════
  const supportCount = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM support_methods"
  );
  if (Number(supportCount.rows[0]?.count || 0) === 0) {
    const defaultMethods = [
      { title: "BIT / PayBox", description: "Fast support via local wallet.", link: "https://example.com" },
      { title: "Bank Transfer", description: "Add bank details here.", link: "" },
      { title: "PayPal", description: "International support.", link: "https://paypal.me/" },
    ];
    let order = 0;
    for (const m of defaultMethods) {
      await pool.query(
        `INSERT INTO support_methods (id, title, description, link, sort_order) VALUES ($1, $2, $3, $4, $5)`,
        [nanoid(16), m.title, m.description || null, m.link || null, order++]
      );
    }
    console.log(`[${nowIso()}] ✅ Seeded default support methods`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Seed default art projects if empty
  // ═══════════════════════════════════════════════════════════════
  const artCount = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM art_projects"
  );
  if (Number(artCount.rows[0]?.count || 0) === 0) {
    const cdn = {
      artStudioHero: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/AZsxcuqqalwkzaGz.jpg",
      gallery1: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/efWBIqggoJqbobmN.jpg",
      gallery2: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/FIytYJKEeYafhQkU.jpg",
      gallery3: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/UEUcDWphnAVUUzYM.jpg",
    };

    const projects = [
      {
        slug: "helmet-fire-theme",
        title: "Helmet — Fire Theme",
        shortDescription: "Custom paint with infernal flames and matte finish.",
        description: "A custom helmet paint job with layered flames, matte clear coat, and subtle metallic highlights.",
        tags: ["paint", "helmet", "custom"],
        cover: cdn.artStudioHero,
        media: [
          { type: "image", url: cdn.artStudioHero, alt: "Helmet cover" },
          { type: "image", url: cdn.gallery1, alt: "Detail shot" },
        ],
      },
      {
        slug: "tank-hand-lettering",
        title: "Tank Hand Lettering",
        shortDescription: "Old-school lettering and pinstriping.",
        description: "Hand lettering with classic pinstriping. Clean lines, bold contrast.",
        tags: ["paint", "bike", "pinstripe"],
        cover: cdn.gallery2,
        media: [
          { type: "image", url: cdn.gallery2, alt: "Tank lettering" },
          { type: "image", url: cdn.gallery3, alt: "Pinstripe close-up" },
        ],
      },
      {
        slug: "metal-fabrication-brackets",
        title: "Metal Fabrication",
        shortDescription: "Custom brackets and small parts — built for the road.",
        description: "Fabrication work for riders who want something that fits perfectly.",
        tags: ["fabrication", "metal", "custom"],
        cover: cdn.gallery1,
        media: [
          { type: "image", url: cdn.gallery1, alt: "Workshop" },
        ],
      },
    ];

    let order = 0;
    for (const p of projects) {
      const projectId = nanoid(16);
      await pool.query(
        `INSERT INTO art_projects (id, slug, title, short_description, description, tags, cover_url, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [projectId, p.slug, p.title, p.shortDescription, p.description, p.tags, p.cover || null, order++]
      );
      let mOrder = 0;
      for (const m of p.media || []) {
        await pool.query(
          `INSERT INTO art_project_media (id, project_id, type, url, alt, title, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [nanoid(16), projectId, m.type, m.url, (m as any).alt || null, (m as any).title || null, mOrder++]
        );
      }
    }
    console.log(`[${nowIso()}] ✅ Seeded default art projects`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Seed demo events & gallery if empty
  // ═══════════════════════════════════════════════════════════════
  const eventsCount = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM events"
  );
  const eCount = Number(eventsCount.rows[0]?.count || 0);
  if (eCount === 0) {
    const demo = getDemoSeed();
    for (const e of demo.events) {
      await pool.query(
        `INSERT INTO events (id, slug, title, date, time, location, short_description, description, category, tags, cover_url, external_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          e.id, e.slug, e.title, e.date, e.time || null, e.location || null,
          e.shortDescription, e.description, e.category, e.tags,
          e.cover || null, e.externalUrl || null,
        ]
      );
      let mOrder = 0;
      for (const m of e.media || []) {
        await pool.query(
          `INSERT INTO event_media (id, event_id, type, url, alt, title, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [nanoid(16), e.id, m.type, m.url, (m as any).alt || null, (m as any).title || null, mOrder++]
        );
      }
    }

    let gOrder = 0;
    for (const g of demo.gallery) {
      await pool.query(
        `INSERT INTO gallery_items (id, type, url, caption, alt, title, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [nanoid(16), g.type, g.url, g.caption || null, (g as any).alt || null, (g as any).title || null, gOrder++]
      );
    }

    console.log(`[${nowIso()}] ✅ Seeded demo events & gallery`);
  }
}

type SeedEvent = {
  id: string;
  slug: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  shortDescription: string;
  description: string;
  category: "event" | "training" | "organized";
  tags: string[];
  cover?: string;
  media?: Array<
    | { type: "image"; url: string; alt?: string }
    | { type: "embed"; url: string; title?: string }
    | { type: "video"; url: string; title?: string }
  >;
  externalUrl?: string;
};

function getDemoSeed(): { events: SeedEvent[]; gallery: any[] } {
  const cdn = {
    artStudioHero: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/AZsxcuqqalwkzaGz.jpg",
    gallery1: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/efWBIqggoJqbobmN.jpg",
    gallery2: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/FIytYJKEeYafhQkU.jpg",
    gallery3: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/UEUcDWphnAVUUzYM.jpg",
  };

  const events: SeedEvent[] = [
    {
      id: "evt-2026-02-training-safety",
      slug: "training-safety-session-feb-2026",
      title: "Safety Training Session",
      date: "2026-02-22",
      time: "10:00",
      location: "Rishon LeZion",
      shortDescription: "Guided low-speed maneuvers, braking drills, and riding confidence boost.",
      description: "A focused training meetup for riders who want to sharpen control at low speeds and improve safety habits.",
      category: "training",
      tags: ["training", "safety", "beginners"],
      cover: cdn.gallery1,
      media: [
        { type: "image", url: cdn.gallery1, alt: "Training warm-up" },
        { type: "image", url: cdn.gallery2, alt: "Drill practice" },
      ],
    },
    {
      id: "evt-2026-03-ride-north",
      slug: "ride-to-the-north-march-2026",
      title: "Ride to the North",
      date: "2026-03-15",
      time: "08:30",
      location: "Meetup: Rishon LeZion",
      shortDescription: "Full-day club ride with scenic stops and a brotherhood lunch break.",
      description: "We start early, ride together in formation, stop for coffee, then hit the scenic routes.",
      category: "event",
      tags: ["ride", "open", "scenic"],
      cover: cdn.gallery3,
      media: [
        { type: "image", url: cdn.gallery3, alt: "Road ride" },
        { type: "image", url: cdn.gallery2, alt: "Group photo" },
      ],
    },
    {
      id: "evt-2026-01-new-year-party",
      slug: "new-year-party-2026",
      title: "Happy New Year Party",
      date: "2026-01-01",
      time: "21:00",
      location: "Club spot (Rishon LeZion)",
      shortDescription: "New year, new rides. Music, friends, and memories.",
      description: "A warm, loud, and friendly night with our people.",
      category: "event",
      tags: ["party", "club", "night"],
      cover: cdn.gallery2,
      media: [
        { type: "image", url: cdn.gallery2, alt: "Party vibes" },
        { type: "image", url: cdn.gallery1, alt: "Friends" },
      ],
    },
    {
      id: "evt-2025-11-exhibition",
      slug: "custom-bike-exhibition-2025",
      title: "Custom Bike Exhibition",
      date: "2025-11-20",
      time: "19:00",
      location: "Tel Aviv",
      shortDescription: "An organized event featuring custom builds, art, and community.",
      description: "An exhibition night we helped organize — builds, art pieces, and community meetups.",
      category: "organized",
      tags: ["organized", "exhibition", "community"],
      cover: cdn.artStudioHero,
      media: [
        { type: "image", url: cdn.artStudioHero, alt: "Exhibition preview" },
        { type: "image", url: cdn.gallery3, alt: "Custom build" },
      ],
    },
  ];

  const gallery = [
    { type: "image", url: cdn.gallery1, caption: "" },
    { type: "image", url: cdn.gallery2, caption: "" },
    { type: "image", url: cdn.gallery3, caption: "" },
  ];

  return { events, gallery };
}
