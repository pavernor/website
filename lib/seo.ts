/*
 * Konstanta SEO + builder structured data (JSON-LD, schema.org).
 * Dipakai oleh layout (Organization/WebSite) dan halaman blog (BlogPosting).
 */

export const SITE_URL = "https://pavernor.tech";
export const SITE_NAME = "Pavernor";
export const CONTACT_EMAIL = "alvin@pavernor.site";
export const DEFAULT_OG_IMAGE = { url: "/images/hero-port-1376.webp", width: 1376, height: 768 };

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        email: CONTACT_EMAIL,
        description:
          "Agentic AI consultancy in Jakarta that designs, builds, and operates AI agent systems for companies across Indonesia and Southeast Asia.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Jakarta",
          addressCountry: "ID",
        },
        areaServed: ["Indonesia", "Southeast Asia"],
        knowsAbout: [
          "Agentic AI",
          "AI agents",
          "AI integration",
          "LLM evaluation",
          "Workflow automation",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          email: CONTACT_EMAIL,
          availableLanguage: ["English", "Indonesian"],
        },
        // TODO: isi dengan profil resmi (LinkedIn, GitHub, dll.) saat sudah ada.
        // sameAs: ["https://www.linkedin.com/company/pavernor"],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "en",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function blogPostingJsonLd(post: {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  cover: string | null;
}) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en",
    image: `${SITE_URL}${post.cover ?? DEFAULT_OG_IMAGE.url}`,
    author: { "@type": "Person", name: post.author },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}
