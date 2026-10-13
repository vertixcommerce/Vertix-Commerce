import { BookOpen, Bot, Globe2, HelpCircle, ImageIcon, Inbox, Layers3, MessageSquare, Settings2, Store, Users } from "lucide-react";
const icons = { image: ImageIcon, store: Store, layers: Layers3, globe: Globe2, help: HelpCircle, inbox: Inbox, chat: MessageSquare, book: BookOpen, bot: Bot, settings: Settings2, users: Users };
export function AdminIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons] || Settings2;
  return <Icon size={21} strokeWidth={1.8} aria-hidden="true" />;
}
