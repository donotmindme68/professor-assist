import {ChatBox} from "@/components/ChatBox.tsx";
import ThemeToggle from "@/components/ThemeToggle.tsx";
import {NavBar} from "@/components/NavBar.tsx";

export function ChatPage() {
  return <div className='flex flex-col w-full h-full'>
    <NavBar/>
    <div className='h-16'></div>
    <div className='flex justify-center items-center w-full h-full'>
      <ThemeToggle/>
      <ChatBox/>
    </div>
  </div>
}