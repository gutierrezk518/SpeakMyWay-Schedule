import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import MessageWord from "@/components/ui/message-word";
import PredictionWord from "@/components/ui/prediction-word";
import CardButton from "@/components/ui/card-button";
import { categories, coreWords, subcategories, getCardsBySubcategory } from "@/data/vocabulary";
import { predictNextWords } from "@/lib/tts";
import { getBgClass } from "@/lib/utils";

export default function CommunicationBoard() {
  const {
    setCurrentPage,
    messageWords,
    clearMessageWords,
    speakMessage,
  } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState("people");
  const [selectedSubcategory, setSelectedSubcategory] = useState("favorites");
  const [visibleCategoriesStartIndex, setVisibleCategoriesStartIndex] = useState(0);
  const [cardPage, setCardPage] = useState(1);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [showPlural, setShowPlural] = useState(false);

  useEffect(() => {
    setCurrentPage("/communication");
  }, [setCurrentPage]);

  useEffect(() => {
    // Generate word predictions based on message words
    if (messageWords.length > 0) {
      const lastWord = messageWords[messageWords.length - 1].word;
      setPredictions(predictNextWords(lastWord));
    } else {
      setPredictions([]);
    }
  }, [messageWords]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategories[category][0]);
    setCardPage(1);
  };

  const handleSubcategoryClick = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setCardPage(1);
  };

  const handleNextCategories = () => {
    if (visibleCategoriesStartIndex + 6 < categories.length) {
      setVisibleCategoriesStartIndex(visibleCategoriesStartIndex + 1);
    }
  };

  const handlePrevCategories = () => {
    if (visibleCategoriesStartIndex > 0) {
      setVisibleCategoriesStartIndex(visibleCategoriesStartIndex - 1);
    }
  };

  const visibleCategories = categories.slice(
    visibleCategoriesStartIndex,
    visibleCategoriesStartIndex + 6
  );

  const cards = getCardsBySubcategory(selectedCategory, selectedSubcategory);
  const cardsPerPage = 12;
  const totalPages = Math.ceil(cards.length / cardsPerPage);
  const startIndex = (cardPage - 1) * cardsPerPage;
  const visibleCards = cards.slice(startIndex, startIndex + cardsPerPage);

  return (
    <section className="flex flex-col h-full max-h-full overflow-hidden">
      {/* Message Bar Area */}
      <div className="p-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center mb-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl mr-2">
            <i className="ri-delete-back-2-line text-xl"></i>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl mr-2">
            <i className="ri-keyboard-line text-xl"></i>
          </button>
          <div className="flex-grow min-h-[60px] border border-gray-300 rounded-xl p-2 bg-neutral-light flex flex-wrap items-center overflow-x-auto">
            {messageWords.map((word) => (
              <MessageWord key={word.id} id={word.id} word={word.word} />
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex">
            {/* Word Prediction */}
            <div className="flex space-x-2">
              {predictions.map((word, index) => (
                <PredictionWord key={index} word={word} />
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-blue-600 active:bg-blue-700 flex items-center"
              onClick={speakMessage}
            >
              <i className="ri-volume-up-line mr-1"></i> Speak
            </button>
            <button 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 active:bg-gray-400"
              onClick={clearMessageWords}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {/* Core Vocabulary Area */}
      <div className="bg-gray-50 p-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700">Core Words</h3>
          <div className="flex items-center">
            <button 
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-gray-200 text-sm font-semibold hover:bg-gray-300 mr-2"
              onClick={() => setShowPlural(!showPlural)}
            >
              (s)
            </button>
            <button className="flex items-center justify-center h-8 w-8 rounded-xl bg-gray-200 hover:bg-gray-300">
              <i className="ri-lock-line"></i>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1">
          {coreWords.map((word) => (
            <CardButton
              key={word.text}
              icon={word.icon}
              text={showPlural && word.canBePlural ? `${word.text}s` : word.text}
              color={word.color || "gray"}
            />
          ))}
        </div>
      </div>
      
      {/* Category Navigation */}
      <div className="p-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="category-nav flex space-x-2 overflow-x-auto scrollbar-hide">
          {visibleCategoriesStartIndex > 0 && (
            <button 
              className="min-w-[50px] h-16 flex items-center justify-center bg-gray-200 rounded-xl"
              onClick={handlePrevCategories}
            >
              <i className="ri-arrow-left-s-line text-xl"></i>
            </button>
          )}
          
          {visibleCategories.map((category) => (
            <CardButton
              key={category.id}
              icon={category.icon}
              text={category.name}
              color={category.color}
              isCategory={true}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
          
          {visibleCategoriesStartIndex + 6 < categories.length && (
            <button 
              className="min-w-[50px] h-16 flex items-center justify-center bg-gray-200 rounded-xl"
              onClick={handleNextCategories}
            >
              <i className="ri-arrow-right-s-line text-xl"></i>
            </button>
          )}
        </div>
      </div>
      
      {/* Subcategories and Cards */}
      <div className="flex-1 overflow-y-auto p-2 bg-white">
        {/* Subcategory Navigation */}
        <div className="mb-3 flex items-center">
          <h3 className="font-semibold text-gray-700 mr-4">
            {categories.find(c => c.id === selectedCategory)?.name}
          </h3>
          <div className="category-nav flex space-x-2 overflow-x-auto scrollbar-hide">
            {subcategories[selectedCategory]?.map((subcat) => (
              <button 
                key={subcat}
                className={`subcategory-btn px-3 py-1 ${getBgClass(categories.find(c => c.id === selectedCategory)?.color)} text-black rounded-lg flex items-center ${selectedSubcategory === subcat ? "" : "opacity-70"}`}
                onClick={() => handleSubcategoryClick(subcat)}
              >
                <i className={`${getSubcategoryIcon(subcat)} mr-1`}></i>
                <span>{subcat.charAt(0).toUpperCase() + subcat.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {visibleCards.map((card) => (
            <CardButton
              key={card.text}
              icon={card.icon}
              text={showPlural && card.canBePlural ? `${card.text}s` : card.text}
              color={categories.find(c => c.id === selectedCategory)?.color || "primary"}
              border={true}
            />
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end mt-3">
            <div className="inline-flex border rounded">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button 
                  key={page}
                  className={`px-3 py-1 ${page === cardPage ? "bg-gray-100" : ""} ${page !== totalPages ? "border-r" : ""}`}
                  onClick={() => setCardPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function getSubcategoryIcon(subcategory: string): string {
  const icons: Record<string, string> = {
    favorites: "ri-star-line",
    home: "ri-home-4-line",
    school: "ri-government-line",
    community: "ri-community-line",
    buildings: "ri-building-line",
    travel: "ri-road-map-line",
    lunch: "ri-restaurant-2-line",
    dinner: "ri-knife-line",
    snacks: "ri-cake-line",
    desserts: "ri-cake-3-line",
    flavors: "ri-palette-line",
    breakfast: "ri-cup-line",
    family: "ri-parent-line",
    friends: "ri-group-line",
    helpers: "ri-team-line",
  };
  
  return icons[subcategory] || "ri-folder-line";
}
