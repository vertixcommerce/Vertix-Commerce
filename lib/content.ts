export type KnowledgeItem = { id:string; title:string; body:string; locale:"en"|"de"; tags:string[]; approved:boolean };

export type PublicService={slug:string;title:string;text:string;category:string;categorySlug:string;featured?:boolean;servicePage?:import("@/payload-types").Service["servicePage"];countryAvailability?:import("@/payload-types").Service["countryAvailability"];fullDescription?:import("@/payload-types").Service["fullDescription"];seo?:import("@/payload-types").Service["seo"];benefits?:{text:string}[];processSteps?:{title:string;description?:string|null}[]};
export type ServiceGroup={name:string;slug:string;services:PublicService[]};

export const services:PublicService[] = [
  {slug:"amazon-seller-central-management",title:"Amazon Seller Central Management",text:"Structured marketplace operations and catalog support for Amazon sellers.",category:"E-commerce Services",categorySlug:"ecommerce-services",featured:true},
  {slug:"ebay-account-management",title:"eBay Seller Account Management",text:"Day-to-day store operations, catalog quality, and performance review.",category:"E-commerce Services",categorySlug:"ecommerce-services",featured:true},
  {slug:"walmart-seller-central-management",title:"Walmart Seller Central Management",text:"Marketplace setup, catalog operations, and ongoing account support.",category:"E-commerce Services",categorySlug:"ecommerce-services",featured:true},
  {slug:"tiktok-shop-management",title:"TikTok Shop Management",text:"Shop setup, product catalog coordination, and marketplace operations.",category:"E-commerce Services",categorySlug:"ecommerce-services"},
  {slug:"android-app-development",title:"Android App Development",text:"Purpose-built Android applications for commerce and business workflows.",category:"Mobile App Development",categorySlug:"mobile-app-development"},
  {slug:"ios-app-development",title:"iOS App Development",text:"Responsive iOS product experiences designed around business requirements.",category:"Mobile App Development",categorySlug:"mobile-app-development"},
  {slug:"hybrid-app-development",title:"Hybrid App Development",text:"Cross-platform applications with a shared, maintainable foundation.",category:"Mobile App Development",categorySlug:"mobile-app-development"},
  {slug:"shopify-development",title:"Shopify",text:"Shopify storefront setup, configuration, and ongoing improvements.",category:"Web Development",categorySlug:"web-development",featured:true},
  {slug:"custom-development",title:"Custom Development",text:"Custom web systems shaped around specific operational needs.",category:"Web Development",categorySlug:"web-development"},
  {slug:"ecommerce-website-development",title:"E-commerce Website Development",text:"Responsive storefronts with clear product discovery and conversion paths.",category:"Web Development",categorySlug:"web-development",featured:true},
  {slug:"api-integrations",title:"API Integrations",text:"Reliable connections between commerce platforms and business systems.",category:"API Integration",categorySlug:"api-integration"},
  {slug:"packaging-design",title:"Packaging Design",text:"Commerce-ready packaging concepts and production design support.",category:"Graphic Design",categorySlug:"graphic-design"},
  {slug:"product-catalogue-design",title:"Product Catalogue Design",text:"Clear, branded catalogues for digital and print product presentation.",category:"Graphic Design",categorySlug:"graphic-design"}
];

export const serviceGroups:ServiceGroup[]=Array.from(new Set(services.map(s=>s.categorySlug))).map(slug=>({slug,name:services.find(s=>s.categorySlug===slug)?.category||slug,services:services.filter(s=>s.categorySlug===slug)}));

