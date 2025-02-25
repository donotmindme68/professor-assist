import {ChatBox} from "@/components/ChatBox.tsx";
import ThemeToggle from "@/components/ThemeToggle.tsx";

export function ChatPage() {
  return <div className='flex justify-center items-center w-full h-full'>
    <ThemeToggle/>
    <ChatBox/>
  </div>
}