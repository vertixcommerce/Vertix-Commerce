import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
export const metadata: Metadata = {
  title: "Page Not Found | Vertix Commerce",
  description: "Find your way back to Vertix Commerce services or contact our team.",
  robots: { index: false, follow: false },
};
export default function GlobalNotFound() {
  return <html lang="en"><body className="bg-slate-50 text-slate-900"><main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
    <Link href="/" prefetch={false} aria-label="Vertix Commerce home"><Image src="/icon.png" alt="Vertix Commerce" width={80} height={80} className="mb-8 rounded-xl"/></Link>
    <p className="font-bold uppercase tracking-widest text-blue-700">404 · Page not found</p>
    <h1 className="mb-5 mt-4 text-4xl font-black">Let’s get you back on track.</h1>
    <p className="mb-8 leading-7 text-slate-600">This page may have moved or is no longer available. Explore our services or contact the team for help.</p>
    <nav aria-label="Find your next page" className="flex flex-wrap justify-center gap-4"><Link prefetch={false} href="/" className="button button-primary">Back to Home</Link><Link prefetch={false} href="/services" className="button button-secondary">Explore Services</Link><Link prefetch={false} href="/contact" className="button button-secondary">Contact Us</Link></nav>
  </main></body></html>;
}
