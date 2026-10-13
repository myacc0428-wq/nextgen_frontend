import { useState } from "react";
import { ArrowLeft, Check, Mail, Menu, ShieldCheck, X } from "lucide-react";
import "./LegalCenter.css";
import type { LegalPageKey } from "./legalRoutes";

type LegalSection = { heading: string; body?: string; items?: string[] };

const pages: Record<LegalPageKey, { title: string; intro: string; sections: LegalSection[] }> = {
  privacy: {
    title: "Privacy Policy",
    intro: "This policy explains what CineGen Digital collects, why it is needed, and how it is handled when you use CineGen.",
    sections: [
      { heading: "Information we collect", body: "When you create an account, we collect your name, email address, password credentials, account status, and information needed to manage access. When you use the service, we may collect viewing activity, saved items, reviews, and technical information such as device and browser details." },
      { heading: "Why we collect it", items: ["Create and secure your account", "Review access requests and manage subscriptions", "Provide the streaming library and remember your preferences", "Respond to support requests and keep the service reliable", "Meet legal, security, and fraud-prevention obligations"] },
      { heading: "Where it is stored", body: "Account and service data is stored in the application database and its configured infrastructure. Video files and thumbnails may be stored by the hosting or media-delivery services configured for CineGen. The exact provider and retention settings should be confirmed in the production environment before launch." },
      { heading: "Third-party services", body: "CineGen may share the minimum information needed with infrastructure, authentication, hosting, media delivery, analytics, or payment providers used to operate the service. Those providers process data under their own terms. We do not sell personal information." },
      { heading: "Your choices", body: "You may request access, correction, or deletion of your account information by contacting support. We may retain records when required for security, accounting, dispute resolution, or legal compliance." },
    ],
  },
  terms: {
    title: "Terms and Conditions",
    intro: "By using CineGen, creating an account, or purchasing an offered service, you agree to use the platform responsibly and follow these terms.",
    sections: [
      { heading: "Using CineGen", body: "You must provide accurate account information, keep your password private, and use the service only for lawful personal or business purposes. Do not share access without permission, bypass access controls, copy or redistribute content, interfere with the service, or use it to harm another person." },
      { heading: "Accounts and access", body: "You are responsible for activity under your account. Access may require approval, remain subject to an active subscription, or be suspended when an account violates these terms or creates a security risk." },
      { heading: "Content and availability", body: "CineGen and its licensors retain ownership of the service, branding, and media catalog unless stated otherwise. Availability, catalog titles, features, and supported devices may change. We do not guarantee uninterrupted access." },
      { heading: "Purchases", body: "If paid services become available, the checkout page will show the price, billing period, payment method, renewal terms, and applicable taxes or fees before you confirm. Additional purchase terms may apply." },
      { heading: "Termination", body: "You may stop using CineGen at any time. We may suspend or close accounts for misuse, non-payment, security concerns, or legal reasons. Terms that should continue by their nature, including ownership and limitation provisions, remain effective." },
    ],
  },
  about: {
    title: "About CineGen",
    intro: "CineGen Digital operates CineGen, a private streaming experience built around curated drama and story-led video content.",
    sections: [
      { heading: "What we offer", body: "CineGen gives approved members a focused place to discover, watch, save, and discuss selected dramas. The service includes account access, a content library, video playback, and community reviews where enabled." },
      { heading: "Our purpose", body: "We want the path from finding a story to settling into it to feel simple, intentional, and personal. That means clear access rules, a carefully managed catalog, and a viewing experience that respects the audience's time." },
      { heading: "Who operates the service", body: "CineGen Digital operates the CineGen website and manages its account, content, and member-support experience. Business registration, office, and billing details should be added here before commercial launch if they are required in your jurisdiction." },
    ],
  },
  contact: {
    title: "Contact Us",
    intro: "Need help with access, account details, payments, or a privacy request? Send a message and include the email on your CineGen account.",
    sections: [
      { heading: "Support email", body: "Email support@cinegen.digital. For account issues, write from your account email when possible and include a short description of what happened. Do not send your password or payment-card number." },
      { heading: "Support form", body: "Use the form below to open a pre-addressed support email in your mail app. If your device does not have a configured mail app, email support@cinegen.digital directly." },
    ],
  },
  refunds: {
    title: "Refund and Cancellation Policy",
    intro: "CineGen currently does not process payments or recurring subscriptions through this website. There are no active paid purchases to cancel in this frontend.",
    sections: [
      { heading: "If paid access is introduced", body: "The checkout flow will show whether a purchase is one-time or recurring, the renewal date, the cancellation method, and any applicable taxes or fees before payment. Cancellation will stop future renewals but normally will not reverse access already provided for the current period." },
      { heading: "Refund eligibility", body: "Refund requests will be reviewed for duplicate charges, unauthorized transactions, material service failure, or any consumer rights that apply to the purchase. Approved refunds will be sent to the original payment method when possible." },
      { heading: "Non-refundable purchases", body: "Any non-refundable item, digital access period, or processing fee will be identified clearly before checkout. No such paid purchase is currently enabled on this website." },
      { heading: "Requesting help", body: "Email support@cinegen.digital with your account email, transaction date, and order reference if one exists. Never send full card details." },
    ],
  },
  cookies: {
    title: "Cookie Policy and Consent",
    intro: "CineGen uses storage technologies only when they help the website work, keep an account signed in, remember preferences, or understand service reliability.",
    sections: [
      { heading: "Essential storage", body: "Session information and local storage may be used to keep you signed in, remember the intro state, and maintain basic application settings. These technologies are necessary for requested features." },
      { heading: "Optional measurement", body: "If analytics or advertising tools are enabled in production, they should be disclosed here and loaded only after the required consent is provided. This frontend does not add a separate analytics or advertising script." },
      { heading: "Your choices", body: "You can clear browser storage or block cookies through your browser settings. Blocking essential storage may sign you out or prevent account features from working." },
      { heading: "Consent", body: "Where local law requires consent for non-essential cookies or tracking, CineGen will ask before using them and will provide a way to change that choice. Consent records should be retained with the configured consent tool." },
    ],
  },
  pricing: {
    title: "Pricing and Payment",
    intro: "Current pricing: CineGen does not currently collect payment through this website. No recurring charge, checkout fee, or additional payment fee is active in this frontend.",
    sections: [
      { heading: "When purchasing is available", body: "The purchase screen will display the actual price, currency, billing period, taxes, fees, renewal date, cancellation terms, and the payment methods accepted before you confirm." },
      { heading: "Recurring charges", body: "No recurring billing is currently active. If subscriptions are introduced, you will receive clear renewal information and instructions for cancellation before completing payment." },
      { heading: "Payment support", body: "For a payment question, contact support@cinegen.digital and include the account email and order reference. Never share your password or full payment-card number." },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    intro: "Quick answers about registration, access, payments, support, and the CineGen service.",
    sections: [
      { heading: "How do I register?", body: "Choose Create an account on the sign-in screen, enter your email and a password of at least six characters, then wait for the access review described in the app." },
      { heading: "When can I watch?", body: "Streaming access is available after your account has been approved and the service is available for your account. Pending accounts may sign in but cannot stream yet." },
      { heading: "Does CineGen accept payment now?", body: "No. Payment and recurring billing are not currently enabled in this frontend." },
      { heading: "How do I get help?", body: "Email support@cinegen.digital. Include the email on your account and a description of the issue, but never include your password or full card number." },
      { heading: "Can I request a privacy change?", body: "Yes. Contact support with the request you want to make, such as access, correction, or deletion of account information." },
      { heading: "What can I watch?", body: "The catalog is managed by CineGen Digital and may change over time. Content availability depends on your account access and the current library." },
    ],
  },
};

const navItems: Array<{ key: LegalPageKey; label: string }> = [
  { key: "about", label: "About" },
  { key: "privacy", label: "Privacy" },
  { key: "terms", label: "Terms" },
  { key: "contact", label: "Contact" },
  { key: "refunds", label: "Refunds" },
  { key: "cookies", label: "Cookies" },
  { key: "pricing", label: "Pricing" },
  { key: "faq", label: "FAQ" },
];

const goTo = (path: string) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export default function LegalCenter({ page }: { page: LegalPageKey }) {
  const content = pages[page];
  const isContact = page === "contact";
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = (path: string) => {
    setMenuOpen(false);
    goTo(path);
  };

  return (
    <main className="legal-shell">
      <header className="legal-header">
        <button type="button" className="legal-brand" onClick={() => navigate("/")} aria-label="Return to CineGen sign in">
          <img src="/images/cinegen-logo.png" alt="CineGen Digital" />
        </button>
        <button type="button" className="legal-menu-toggle" aria-controls="legal-pages-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={17} /> : <Menu size={17} />}<span>{menuOpen ? "Close" : "Menu"}</span>
        </button>
        <nav id="legal-pages-nav" className={`legal-nav${menuOpen ? " open" : ""}`} aria-label="Information pages">
          {navItems.map((item) => <button type="button" className={item.key === page ? "active" : ""} aria-current={item.key === page ? "page" : undefined} key={item.key} onClick={() => navigate(`/legal/${item.key}`)}>{item.label}</button>)}
        </nav>
        <button type="button" className="legal-return" onClick={() => navigate("/")}><ArrowLeft size={16} /> Sign in</button>
      </header>

      <section className="legal-hero" aria-labelledby="legal-page-title">
        <div className="legal-hero-mark" aria-hidden="true"><ShieldCheck size={25} /></div>
        <p className="legal-kicker">CINEGEN DIGITAL</p>
        <h1 id="legal-page-title">{content.title}</h1>
        <p>{content.intro}</p>
        <small>Last updated October 10, 2026</small>
      </section>

      <div className="legal-layout">
        <aside className="legal-index" aria-label="On this page">
          <span>On this page</span>
          {content.sections.map((section) => <a href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={section.heading}>{section.heading}</a>)}
        </aside>
        <article className="legal-content">
          {content.sections.map((section) => {
            const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return <section className="legal-section" id={id} key={section.heading}><h2>{section.heading}</h2>{section.body && <p>{section.body}</p>}{section.items && <ul>{section.items.map((item) => <li key={item}><Check size={16} /> <span>{item}</span></li>)}</ul>}</section>;
          })}
          {isContact && <form className="support-form" action="mailto:support@cinegen.digital" method="post" encType="text/plain"><div className="support-form-heading"><Mail size={18} /><div><h2>Write to support</h2><p>Your mail app will open with the support address filled in.</p></div></div><label htmlFor="support-name">Name</label><input id="support-name" name="name" autoComplete="name" required /><label htmlFor="support-email">Account email</label><input id="support-email" name="email" type="email" autoComplete="email" required /><label htmlFor="support-message">How can we help?</label><textarea id="support-message" name="message" rows={5} required /><button type="submit">Open support email</button></form>}
        </article>
      </div>

      <footer className="legal-footer"><span>© 2026 CineGen Digital</span><span>Questions? <a href="mailto:support@cinegen.digital">support@cinegen.digital</a></span></footer>
    </main>
  );
}
