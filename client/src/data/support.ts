export interface SupportMethod {
  id: string;
  title: string;
  description?: string;
  /** Link to open payment page/app. */
  link?: string;
  /** Optional QR image placed in /client/public/support-qr */
  qrImage?: string;
}

/**
 * Support methods for "Support Infernals" page.
 * Replace links + add real QR images (png/svg) into /client/public/support-qr.
 */
export const SUPPORT_METHODS: SupportMethod[] = [
  {
    id: "support-bit",
    title: "BIT / PayBox",
    description: "Fast support via local wallet.",
    link: "https://example.com",
    // Example: "/support-qr/bit.png"
    qrImage: "",
  },
  {
    id: "support-bank",
    title: "Bank Transfer",
    description: "Add bank details here.",
    link: "",
    qrImage: "",
  },
  {
    id: "support-paypal",
    title: "PayPal",
    description: "International support.",
    link: "https://paypal.me/",
    qrImage: "",
  },
];
