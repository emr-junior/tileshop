import { MessageCircle } from 'lucide-react';

const WHATSAPP = import.meta.env.VITE_WHATSAPP || '237600000000';

export default function WhatsAppButton({ message = "Hello! I'm interested in your tiles." }) {
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} fill="white" />
    </a>
  );
}
