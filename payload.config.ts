import { ADMIN_PATH } from "./lib/admin-path";
import { withPublicCollectionCache, withPublicGlobalCache } from "./payload/public-content-hooks";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { resendAdapter } from "@payloadcms/email-resend";
import { s3Storage } from "@payloadcms/storage-s3";
import { Media } from "./payload/collections/Media";
import { Articles } from "./payload/collections/Articles";
import { AboutPage } from "./payload/globals/AboutPage";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import path from "node:path";
import { Users } from "./payload/collections/Users";
import { Services } from "./payload/collections/Services";
import { ServiceCategories } from "./payload/collections/ServiceCategories";
import { Countries } from "./payload/collections/Countries";
import { Knowledge } from "./payload/collections/Knowledge";
import { FAQs } from "./payload/collections/FAQs";
import { Leads } from "./payload/collections/Leads";
import { Conversations } from "./payload/collections/Conversations";
import { WebsiteSettings } from "./payload/globals/WebsiteSettings";
import { AssistantSettings } from "./payload/globals/AssistantSettings";

if (process.env.NODE_ENV === "production" && (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32 || process.env.PAYLOAD_SECRET === "development-only-secret-change-before-production")) throw new Error("A strong server-only PAYLOAD_SECRET is required in production.");
if (process.env.S3_BUCKET && (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY || !process.env.S3_REGION)) throw new Error("Complete the server-only S3 credentials and region before enabling remote media storage.");
export default buildConfig({
  routes: { admin: ADMIN_PATH },
  bin:[{key:"migrate-content",scriptPath:path.resolve(process.cwd(),"scripts/migrate-content.ts")},{key:"create-client-admins",scriptPath:path.resolve(process.cwd(),"scripts/create-client-admins.ts")},{key:"configure-us-market",scriptPath:path.resolve(process.cwd(),"scripts/configure-us-market.ts")},{key:"prepare-about-layout",scriptPath:path.resolve(process.cwd(),"scripts/prepare-about-layout.ts")},{key:"verify-service-layout",scriptPath:path.resolve(process.cwd(),"scripts/verify-service-layout.ts")},{key:"complete-launch",scriptPath:path.resolve(process.cwd(),"scripts/complete-launch.ts")},{key:"bootstrap-admin",scriptPath:path.resolve(process.cwd(),"scripts/bootstrap-admin.ts")},{key:"import-service-catalogue",scriptPath:path.resolve(process.cwd(),"scripts/import-service-catalogue.ts")},{key:"verify-homepage",scriptPath:path.resolve(process.cwd(),"scripts/verify-homepage.ts")}],
  admin:{
    user:"users",
    meta:{titleSuffix:" · Vertix Commerce"},
    components:{
      graphics:{Logo:"/components/admin/BrandLogo#BrandLogo",Icon:"/components/admin/BrandIcon#BrandIcon"},
      beforeLogin:["/components/admin/LoginIntro#LoginIntro"],
      afterLogin:["/components/admin/LoginHelp#LoginHelp"],
      Nav:"/components/admin/AdminNav#AdminNav",
      views:{dashboard:{Component:"/components/admin/DashboardWelcome#DashboardWelcome"}},
    },
  },
  collections:[Users,...[ServiceCategories,Services,Countries,FAQs,Media,Articles].map(withPublicCollectionCache),Knowledge,Leads,Conversations],
  upload: { limits: { fileSize: 4 * 1024 * 1024 } },
  plugins: [s3Storage({
    enabled: Boolean(process.env.S3_BUCKET), alwaysInsertFields: true,
    bucket: process.env.S3_BUCKET || "local-development",
    collections: { media: true },
    config: {
      region: process.env.S3_REGION || "us-east-1",
      ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || "", secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "" },
    },
  })],
  globals:[WebsiteSettings,AssistantSettings,AboutPage].map(withPublicGlobalCache),
  editor:lexicalEditor(),
  ...(process.env.RESEND_API_KEY?{email:resendAdapter({defaultFromAddress:process.env.RESEND_FROM_EMAIL_ADDRESS||"notifications@vertixcommerce.com",defaultFromName:"Vertix Commerce",apiKey:process.env.RESEND_API_KEY})}:{}),
  secret:process.env.PAYLOAD_SECRET||"development-only-secret-change-before-production",
  db:process.env.DATABASE_URL?.startsWith("file:")
    ?sqliteAdapter({client:{url:process.env.DATABASE_URL}})
    :postgresAdapter({pool:{connectionString:process.env.DATABASE_URL||"postgresql://postgres:postgres@127.0.0.1:5432/vertix"}}),
  sharp,
  typescript:{outputFile:"payload-types.ts"}
});



