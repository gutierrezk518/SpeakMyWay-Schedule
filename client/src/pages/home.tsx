import { Link } from "wouter";
import { useAppContext } from "@/contexts/app-context";
import { useEffect } from "react";

export default function Home() {
  const { setCurrentPage } = useAppContext();

  useEffect(() => {
    setCurrentPage("/");
  }, [setCurrentPage]);

  return (
    <section className="p-4 flex flex-col h-full">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome to SpeakMyWay</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <Link href="/communication">
          <a className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center hover:bg-blue-50 active:bg-blue-100 transition-colors border-2 border-primary">
            <i className="ri-message-3-line text-5xl text-primary mb-4"></i>
            <span className="text-xl font-semibold">Communication Board</span>
            <p className="text-gray-600 text-center mt-2">Express yourself using words and phrases</p>
          </a>
        </Link>
        
        <Link href="/quick-mode">
          <a className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center hover:bg-purple-50 active:bg-purple-100 transition-colors border-2 border-secondary">
            <i className="ri-flashlight-line text-5xl text-secondary mb-4"></i>
            <span className="text-xl font-semibold">Quick Mode</span>
            <p className="text-gray-600 text-center mt-2">Access frequently used phrases</p>
          </a>
        </Link>
        
        <Link href="/schedule">
          <a className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center hover:bg-green-50 active:bg-green-100 transition-colors border-2 border-accent">
            <i className="ri-calendar-check-line text-5xl text-accent mb-4"></i>
            <span className="text-xl font-semibold">Today's Schedule</span>
            <p className="text-gray-600 text-center mt-2">Organize your daily activities</p>
          </a>
        </Link>
        
        <Link href="/customize">
          <a className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center hover:bg-yellow-50 active:bg-yellow-100 transition-colors border-2 border-yellow-500">
            <i className="ri-palette-line text-5xl text-yellow-500 mb-4"></i>
            <span className="text-xl font-semibold">Customize</span>
            <p className="text-gray-600 text-center mt-2">Personalize your SpeakMyWay experience</p>
          </a>
        </Link>
      </div>
    </section>
  );
}
