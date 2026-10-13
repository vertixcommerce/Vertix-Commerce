import { ExternalLink, UserCircle } from "lucide-react";
import Link from "next/link";
export function NavUtilities() {
  return <div className="vx-nav-utilities">
    <Link href="/admin/account"><UserCircle size={17} aria-hidden="true" /> My account</Link>
    <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={17} aria-hidden="true" /> View website</a>
    <p>Owners manage team roles in Settings.</p>
  </div>;
}
