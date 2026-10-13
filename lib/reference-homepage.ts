export const referenceDefaults = {
  heroChecks: [{ text: "Your store & priorities" }, { text: "Your time & resources" }, { text: "Your commerce goals" }],
  heroBadges: [{ title: "Service requirements", description: "Focused on your business" }, { title: "Your next steps", description: "From ideas to a clear scope" }, { title: "A clearer conversation", description: "Discuss priorities and reporting" }, { title: "Market requirements", description: "USA, UK, Australia & Germany" }],
  markets: [
    { country: "usa" as const, title: "United States", description: "Discuss your requirements for the US marketplace." },
    { country: "uk" as const, title: "United Kingdom", description: "Explore your priorities in the UK marketplace." },
    { country: "australia" as const, title: "Australia", description: "Share your Australian marketplace goals." },
    { country: "germany" as const, title: "Germany", description: "Discuss your German marketplace requirements." },
  ],
  whyCards: [{ title: "Your priorities", description: "Start with what matters to you" }, { title: "A tailored scope", description: "Discuss your business requirements" }, { title: "Reporting needs", description: "Agree what you want to understand" }, { title: "Your next steps", description: "Confirm arrangements with the team" }],
  steps: [{ title: "Introduce", description: "Tell us about your business and goals." }, { title: "Discuss", description: "Explore your requirements and service scope." }, { title: "Agree", description: "Confirm timing, terms and next steps." }, { title: "Review", description: "Discuss progress against your agreed plan." }],
};
export const marketInfo = {
  usa: { flag: "🇺🇸", short: "USA", contactCountry: "United States" },
  uk: { flag: "🇬🇧", short: "UK", contactCountry: "United Kingdom" },
  australia: { flag: "🇦🇺", short: "Australia", contactCountry: "Australia" },
  germany: { flag: "🇩🇪", short: "Germany", contactCountry: "Germany" },
};
