import dotenv from "dotenv";import{spawn}from"node:child_process";import{mkdirSync,appendFileSync,readFileSync}from"node:fs";import{randomBytes}from"node:crypto";
const mode=process.argv[2];if(!["export","import"].includes(mode))throw new Error("Choose export or import");mkdirSync("backups",{recursive:true});
const {parsed:local}=dotenv.config({path:".env.local",quiet:true});const{parsed:target}=dotenv.config({path:".env.migration.local",quiet:true});
if(!/^CRON_SECRET=/m.test(readFileSync(".env.migration.local","utf8")))appendFileSync(".env.migration.local",`\nCRON_SECRET="${randomBytes(32).toString("hex")}"\n`);
const env=mode==="export"?{...local,S3_BUCKET:"",S3_ACCESS_KEY_ID:"",S3_SECRET_ACCESS_KEY:""}:{...target,DATABASE_URL:target.NEON_DATABASE_URL};
const child=spawn(process.execPath,["node_modules/payload/bin.js","migrate-content"],{stdio:"inherit",env:{...process.env,...env,NODE_ENV:mode==="import"?"production":"development",CONTENT_MIGRATION:mode,RESEND_API_KEY:"",GEMINI_API_KEY:""}});child.on("exit",code=>process.exitCode=code||0);
