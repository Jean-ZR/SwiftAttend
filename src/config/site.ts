export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "SwiftAttend",
  description:
    "Mobile-first attendance tracking application for educational institutions.",
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Settings",
      href: "/settings",
    },
  ],
  links: {
    // Add any external links if needed
  },
}
