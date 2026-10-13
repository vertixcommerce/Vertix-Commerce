import { getPayload, type SanitizedConfig } from "payload";
// Explicit launch preparation, never executed on startup. Existing text is retained.
const rich = (paragraphs: string[]) => ({root:{type:"root",format:"" as const,indent:0,version:1,direction:"ltr" as const,children:paragraphs.map(value=>({type:"paragraph",format:"" as const,indent:0,version:1,direction:"ltr" as const,children:[{type:"text",text:value,format:0,detail:0,mode:"normal",style:"",version:1}]}))}});
export async function script(config: SanitizedConfig) {
  const payload = await getPayload({ config });
  if (!process.env.DATABASE_URL?.startsWith("file:")) throw new Error("This preparation script is for the existing local SQLite workspace only.");
  const existing = await payload.find({collection:"services",pagination:false,depth:0});
  let ebay = existing.docs.find(doc=>doc.slug==="ebay-account-management");
  if (!ebay) throw new Error("The existing eBay service must be present; removed services are not restored.");
  for (const doc of existing.docs) {
    if (!/ebay/i.test(`${doc.slug} ${doc.name}`) && (doc.status==="published" || doc._status==="published")) {
      await payload.update({collection:"services",id:doc.id,data:{status:"draft",_status:"draft"},draft:false});
      console.log(`Retained as unpublished draft: ${doc.slug}`);
    }
  }
  ebay = await payload.update({collection:"services",id:ebay.id,data:{
    status:"published",_status:"published",featured:true,
    ...(!ebay.countryAvailability?.length ? {countryAvailability:["usa","uk","australia","germany"]} : {}),
    ...(!ebay.fullDescription ? {fullDescription:rich([
      "Keep your eBay store organised with a clear plan for listings, routine account tasks and performance review. Start by sharing your store priorities and the markets you want to serve.",
      "The scope can cover listing information, catalogue maintenance, order workflow review and regular reporting. Activities, access arrangements, timing and pricing are agreed before work begins. Marketplace decisions and sales outcomes cannot be guaranteed.",
    ])} : {}),
    ...(!ebay.benefits?.length ? {benefits:[{text:"A defined scope based on your store and target markets."},{text:"Consistent product information and catalogue organisation."},{text:"A practical review of your account and order workflows."},{text:"Reporting priorities agreed around your business questions."}]} : {}),
    ...(!ebay.processSteps?.length ? {processSteps:[{title:"Share your priorities",description:"Tell us about your products, current workflow and target market."},{title:"Review the scope",description:"Discuss the activities, reporting and access arrangements you need."},{title:"Agree the plan",description:"Confirm responsibilities, timing and pricing before starting."},{title:"Review progress",description:"Assess completed activities and decide the next priorities together."}]} : {}),
    ...(!ebay.servicePage?.packages?.length ? {servicePage:{...ebay.servicePage,packages:[
      {title:"Listing & catalogue support",description:"Organise the product information shoppers use to understand your listings.",items:[{text:"Review titles and item specifics"},{text:"Identify missing product information"},{text:"Discuss variations and catalogue consistency"}]},
      {title:"Store operations",description:"Define a manageable routine for the store activities included in your service scope.",items:[{text:"Review account and order workflows"},{text:"Agree task ownership and access"},{text:"Coordinate catalogue maintenance"}]},
      {title:"Performance review",description:"Choose the reporting questions that matter for your next decisions.",items:[{text:"Discuss available account reporting"},{text:"Review listing and workflow priorities"},{text:"Agree follow-up activities"}]},
    ],faqs:ebay.servicePage?.faqs?.length ? ebay.servicePage.faqs : [
      {question:"Which eBay markets can I discuss?",answer:"The initial service scope covers the USA, UK, Australia and Germany. Tell us which market you sell in or plan to evaluate."},
      {question:"How are pricing and timing confirmed?",answer:"Share your requirements through the inquiry form. The team confirms scope, responsibilities, pricing and timing before work begins."},
      {question:"Should I send my account password?",answer:"No. Do not submit passwords, one-time codes or payment details. Appropriate access arrangements are discussed separately."},
    ]}} : {}),
  },draft:false});
  const markets = [
    {slug:"usa",name:"United States",intro:"eBay account support for sellers targeting the United States. Discuss your catalogue, store workflows and reporting priorities for the US market.",guidance:"For a US-focused scope, start with product information, USD pricing, delivery destinations and your existing fulfilment arrangements. Review listing consistency, shipping information and returns wording against your current business policies."},
    {slug:"uk",name:"United Kingdom",intro:"eBay account support for sellers targeting the United Kingdom. Build a clear scope for listing information, catalogue upkeep and store operations.",guidance:"For a UK-focused scope, review GBP pricing, product terminology, delivery coverage and your dispatch arrangements. Identify where listing information or order workflows need attention. Tax and regulatory questions should be confirmed with an appropriately qualified adviser."},
    {slug:"australia",name:"Australia",intro:"eBay account support for sellers targeting Australia. Discuss catalogue quality, delivery information and day-to-day operational priorities.",guidance:"For an Australian scope, review AUD pricing, delivery areas, estimated dispatch times and product information. Clearly describe any regional shipping limitations based on your actual fulfilment arrangements."},
    {slug:"germany",name:"Germany",intro:"eBay account support for sellers targeting Germany. Discuss listing language, product information and the workflows your store needs.",guidance:"For a Germany-focused scope, review EUR pricing, German-language product information and delivery coverage. Agree who provides and approves translations. Business, consumer, tax and product compliance questions require business review and qualified local advice where appropriate."},
  ];
  for (const market of markets) {
    const found = await payload.find({collection:"countries",where:{slug:{equals:market.slug}},limit:1,depth:0});
    const doc=found.docs[0];
    const data={name:doc?.name || market.name,slug:market.slug,locale:doc?.locale || "en" as const,introduction:doc?.introduction || market.intro,localGuidance:doc?.localGuidance || rich([market.guidance,"Share your current setup and the activities you need. Service scope, pricing and timing are confirmed with the team; no sales outcome or marketplace approval is promised."]),services:doc?.services?.length ? doc.services : [ebay.id],ctaLabel:doc?.ctaLabel || "Discuss this market",ctaURL:doc?.ctaURL || `/contact?country=${encodeURIComponent(market.name)}&service=${ebay.slug}`,status:"published" as const,_status:"published" as const};
    if(doc)await payload.update({collection:"countries",id:doc.id,data,draft:false});else await payload.create({collection:"countries",data,draft:false});
    console.log(`Published market: ${market.slug}`);
  }
  const about=await payload.findGlobal({slug:"about-page"});
  await payload.updateGlobal({slug:"about-page",data:{
    ...(!about.heroIntroduction ? {heroIntroduction:"Commerce support starts with understanding your store. Explore our initial eBay services across the USA, UK, Australia and Germany, then discuss the practical support your business needs."} : {}),
    ...(!about.cardContent ? {cardContent:rich(["Vertix Commerce brings your marketplace requirements into a clear service conversation. The website’s initial published services focus on eBay; the catalogue can support additional marketplaces as their services are prepared for publication.","Share your store priorities, catalogue challenges and preferred reporting. Responsibilities, access arrangements, timing and pricing are agreed with the team. This website does not claim marketplace endorsement or guarantee business results."])} : {}),
  }});
  const faqs=await payload.count({collection:"faqs"});
  if(faqs.totalDocs===0)for(const [index,row] of (ebay.servicePage?.faqs || []).entries())await payload.create({collection:"faqs",data:{question:row.question,answer:row.answer,locale:"en",displayOrder:index*10,status:"published",assistantApproved:false}});
  console.log("Launch content prepared. No reviews, client logos, performance figures, legal approvals or assistant approvals were invented.");
}


