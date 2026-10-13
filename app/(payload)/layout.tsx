import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap.js";
import "@payloadcms/next/css";
import "./custom.scss";

const serverFunction:ServerFunctionClient=async(args)=>{
  "use server";
  return handleServerFunctions({...args,config,importMap});
};
export default function Layout({children}:{children:React.ReactNode}){
  return RootLayout({children,config,importMap,serverFunction});
}
