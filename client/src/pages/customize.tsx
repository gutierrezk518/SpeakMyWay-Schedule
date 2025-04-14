import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { voiceTypes, speak } from "@/lib/tts";

export default function Customize() {
  const { 
    setCurrentPage, 
    userName, 
    setUserName, 
    language, 
    setLanguage,
    voiceSettings,
    setVoiceSettings,
    displaySettings,
    setDisplaySettings
  } = useAppContext();
  
  // State for the test phrase
  const [testPhrase, setTestPhrase] = useState("Hello, this is a test of the voice settings.");
  // State to track whether we're testing a voice or not
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    setCurrentPage("/customize");
  }, [setCurrentPage]);

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setUserName(name);
    localStorage.setItem("speakMyWayUser", name);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // Also update the language in voice settings
    if (newLanguage === 'en') {
      setVoiceSettings(prev => ({
        ...prev,
        language: "en-US"
      }));
      setTestPhrase("Hello, this is a test of the voice settings.");
    } else if (newLanguage === 'es') {
      setVoiceSettings(prev => ({
        ...prev,
        language: "es-ES"
      }));
      setTestPhrase("Hola, esta es una prueba de la configuración de voz.");
    }
  };

  const handleVoiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVoiceSettings(prev => ({
      ...prev,
      voiceType: e.target.value
    }));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoiceSettings(prev => ({
      ...prev,
      rate: parseFloat(e.target.value)
    }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoiceSettings(prev => ({
      ...prev,
      volume: parseFloat(e.target.value)
    }));
  };

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    speak(testPhrase);
    // Reset testing state after a delay
    setTimeout(() => setIsTestingVoice(false), 3000);
  };

  const handleTextSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplaySettings(prev => ({
      ...prev,
      textSize: parseFloat(e.target.value)
    }));
  };

  const handleHighContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplaySettings(prev => ({
      ...prev,
      highContrast: e.target.checked
    }));
  };

  const handleReduceAnimationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplaySettings(prev => ({
      ...prev,
      reduceAnimations: e.target.checked
    }));
  };

  return (
    <section className="h-full flex flex-col">
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-center mb-2">Customize</h2>
        <p className="text-center text-gray-600 mb-4">Personalize your SpeakMyWay experience</p>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-lg mb-4">Profile Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={handleUserNameChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Preferred Language</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Voice Settings */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-lg mb-4">Voice Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Voice Type</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={voiceSettings.voiceType}
                  onChange={handleVoiceTypeChange}
                >
                  <option value="default">System Default</option>
                  
                  {/* English Voices */}
                  <optgroup label="English Voices">
                    <option value="en-US-female-warm">Warm & Friendly Female</option>
                    <option value="en-US-female-professional">Professional Female</option>
                    <option value="en-US-male-warm">Warm & Friendly Male</option>
                    <option value="en-US-male-deep">Deep & Clear Male</option>
                    <option value="en-GB-female">British Female</option>
                    <option value="en-GB-male">British Male</option>
                    <option value="en-US-child">Child Voice</option>
                  </optgroup>
                  
                  {/* Spanish Voices */}
                  <optgroup label="Spanish Voices">
                    <option value="es-ES-female">Spanish Female</option>
                    <option value="es-ES-male">Spanish Male</option>
                    <option value="es-MX-female">Mexican Female</option>
                    <option value="es-MX-male">Mexican Male</option>
                  </optgroup>
                  
                  {/* Simple Options (for backward compatibility) */}
                  <optgroup label="Basic Options">
                    <option value="female">Generic Female</option>
                    <option value="male">Generic Male</option>
                    <option value="child">Generic Child</option>
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Test Voice</label>
                <div className="flex flex-col space-y-2">
                  <input 
                    type="text" 
                    value={testPhrase}
                    onChange={(e) => setTestPhrase(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter text to test the voice"
                  />
                  <button 
                    className={`w-full py-2 px-4 rounded-md ${
                      isTestingVoice 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                    onClick={handleTestVoice}
                    disabled={isTestingVoice}
                  >
                    {isTestingVoice ? 'Playing...' : 'Test Voice'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Try different voices to find the one that works best for you
                </p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Speaking Rate</label>
                <div className="flex items-center">
                  <span className="mr-2">Slow</span>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1" 
                    value={voiceSettings.rate}
                    onChange={handleRateChange}
                    className="flex-grow"
                  />
                  <span className="ml-2">Fast</span>
                </div>
                <div className="text-center text-sm mt-1 text-gray-500">
                  {voiceSettings.rate}x
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Speaking Volume</label>
                <div className="flex items-center">
                  <span className="mr-2">Quiet</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={voiceSettings.volume}
                    onChange={handleVolumeChange}
                    className="flex-grow"
                  />
                  <span className="ml-2">Loud</span>
                </div>
                <div className="text-center text-sm mt-1 text-gray-500">
                  {Math.round(voiceSettings.volume * 100)}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Display Settings */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-lg mb-4">Display Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Text Size</label>
                <div className="flex items-center">
                  <span className="mr-2">Small</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.5" 
                    value={displaySettings.textSize}
                    onChange={handleTextSizeChange}
                    className="flex-grow"
                  />
                  <span className="ml-2">Large</span>
                </div>
              </div>
              
              <div>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={displaySettings.highContrast}
                    onChange={handleHighContrastChange}
                  />
                  <span className="ml-2">High Contrast Mode</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={displaySettings.reduceAnimations}
                    onChange={handleReduceAnimationsChange}
                  />
                  <span className="ml-2">Reduce Animations</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Create Custom Cards */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-lg mb-4">Create Custom Cards</h3>
            
            <p className="text-gray-600 mb-4">Upload your own images and create custom vocabulary cards.</p>
            
            <button className="w-full py-3 bg-primary text-white rounded-md flex items-center justify-center">
              <i className="ri-add-circle-line mr-2"></i>
              Create New Card
            </button>
          </div>
          
          {/* Help & Support */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-lg mb-4">Help & Support</h3>
            
            <div className="space-y-2">
              <button className="w-full py-2 px-4 text-left flex items-center hover:bg-gray-50 rounded-md">
                <i className="ri-video-line mr-2 text-primary"></i>
                <span>Tutorial Videos</span>
              </button>
              
              <button className="w-full py-2 px-4 text-left flex items-center hover:bg-gray-50 rounded-md">
                <i className="ri-question-line mr-2 text-primary"></i>
                <span>Frequently Asked Questions</span>
              </button>
              
              <button className="w-full py-2 px-4 text-left flex items-center hover:bg-gray-50 rounded-md">
                <i className="ri-mail-line mr-2 text-primary"></i>
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
