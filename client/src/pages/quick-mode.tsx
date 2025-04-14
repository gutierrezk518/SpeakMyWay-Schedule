import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { quickPhrases } from "@/data/quickPhrases";
import { speak } from "@/lib/tts";

export default function QuickMode() {
  const { setCurrentPage } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCurrentPage("/quick-mode");
  }, [setCurrentPage]);

  const filteredPhrases = searchTerm
    ? quickPhrases.map(category => ({
        ...category,
        phrases: category.phrases.filter(phrase => 
          phrase.text.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.phrases.length > 0)
    : quickPhrases;

  const handleSpeakPhrase = (text: string) => {
    speak(text);
  };

  return (
    <section className="h-full flex flex-col">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-center mb-4">Quick Mode</h2>
        <p className="text-center text-gray-600 mb-4">Tap a phrase to speak it immediately</p>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Search phrases..." 
            className="w-full p-3 pl-10 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="ri-search-line absolute left-3 top-3.5 text-gray-400"></i>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {filteredPhrases.map((category) => (
            <div key={category.id}>
              <h3 className="font-bold text-gray-700 mb-2">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {category.phrases.map((phrase) => (
                  <button 
                    key={phrase.id}
                    className="flex items-center p-3 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                    onClick={() => handleSpeakPhrase(phrase.text)}
                  >
                    <i className={`${phrase.icon} text-xl text-${category.iconColor} mr-3`}></i>
                    <span>{phrase.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filteredPhrases.length === 0 && (
            <div className="text-center py-8">
              <i className="ri-search-line text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-500">No phrases found. Try a different search term.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
