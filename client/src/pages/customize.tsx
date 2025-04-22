import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { voiceTypes, speak, setVoicePreferences } from "@/lib/tts";

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
    
    // Apply current voice settings on component load
    setVoicePreferences(voiceSettings);
  }, [setCurrentPage, voiceSettings]);

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setUserName(name);
    localStorage.setItem("speakMyWayUser", name);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // Also update the language in voice settings
    let newVoiceLanguage = "en-US";
    if (newLanguage === 'en') {
      newVoiceLanguage = "en-US";
      setTestPhrase("Hello, this is a test of the voice settings.");
    } else if (newLanguage === 'es') {
      newVoiceLanguage = "es-ES";
      setTestPhrase("Hola, esta es una prueba de la configuración de voz.");
    }

    // Update app context
    setVoiceSettings(prev => {
      const newSettings = {
        ...prev,
        language: newVoiceLanguage
      };
      
      // Apply settings to TTS system
      setVoicePreferences(newSettings);
      return newSettings;
    });
  };

  const handleVoiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoiceType = e.target.value;
    setVoiceSettings(prev => {
      const newSettings = {
        ...prev,
        voiceType: newVoiceType
      };
      
      // Apply settings to TTS system
      setVoicePreferences(newSettings);
      return newSettings;
    });
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setVoiceSettings(prev => {
      const newSettings = {
        ...prev,
        rate: newRate
      };
      
      // Apply settings to TTS system
      setVoicePreferences(newSettings);
      return newSettings;
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVoiceSettings(prev => {
      const newSettings = {
        ...prev,
        volume: newVolume
      };
      
      // Apply settings to TTS system
      setVoicePreferences(newSettings);
      return newSettings;
    });
  };

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    
    // Ensure the current voice settings are applied before testing
    setVoicePreferences(voiceSettings);
    
    // Speak the test phrase
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
      <div className="p-6 bg-white border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-2xl font-bold text-center mb-2">My Settings</h2>
        <p className="text-center text-gray-600 mb-2">Make SpeakMyWay work just right for you!</p>
        <div className="flex justify-center">
          <div className="flex space-x-2 items-center text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            <i className="ri-information-line"></i>
            <span>Parents can help with these settings</span>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-purple-200">
            <div className="flex items-center mb-4">
              <i className="ri-user-smile-line text-2xl mr-2 text-purple-500"></i>
              <h3 className="font-bold text-lg">About Me</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">My Name</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={handleUserNameChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="What should we call you?"
                />
              </div>
            </div>
          </div>
          
          {/* Voice Settings */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-green-200">
            <div className="flex items-center mb-4">
              <i className="ri-volume-up-line text-2xl mr-2 text-green-500"></i>
              <h3 className="font-bold text-lg">My Voice Helper</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Voice Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`relative flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-green-50 ${(voiceSettings.voiceType === "female" || voiceSettings.voiceType === "default") ? 'bg-green-100 border-green-500' : ''}`}>
                    <input
                      type="radio"
                      name="voiceType"
                      value="female"
                      className="absolute opacity-0"
                      checked={voiceSettings.voiceType === "female" || voiceSettings.voiceType === "default"}
                      onChange={() => {
                        handleVoiceTypeChange({ target: { value: "female" } } as React.ChangeEvent<HTMLSelectElement>);
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <i className="ri-user-voice-line text-3xl text-green-500 mb-2"></i>
                      <span className="font-medium">Female Voice</span>
                      <span className="text-xs text-gray-500">(Default)</span>
                    </div>
                  </label>
                  
                  <label className={`relative flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-blue-50 ${voiceSettings.voiceType === "male" ? 'bg-blue-100 border-blue-500' : ''}`}>
                    <input
                      type="radio"
                      name="voiceType"
                      value="en-US-male-warm"
                      className="absolute opacity-0"
                      checked={voiceSettings.voiceType === "male"}
                      onChange={() => {
                        handleVoiceTypeChange({ target: { value: "en-US-male-warm" } } as React.ChangeEvent<HTMLSelectElement>);
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <i className="ri-user-voice-line text-3xl text-blue-500 mb-2"></i>
                      <span className="font-medium">Warm & Friendly Male Voice</span>
                    </div>
                  </label>
                </div>
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
          <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-orange-200">
            <div className="flex items-center mb-4">
              <i className="ri-eye-line text-2xl mr-2 text-orange-500"></i>
              <h3 className="font-bold text-lg">How I See Things</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Text Size</label>
                <div className="flex items-center">
                  <span className="mr-2 text-sm">Small</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.5" 
                    value={displaySettings.textSize}
                    onChange={handleTextSizeChange}
                    className="flex-grow"
                  />
                  <span className="ml-2 text-sm">Large</span>
                </div>
                <div className="mt-2 text-center">
                  <span className="inline-block px-4 py-1 bg-gray-100 rounded-md" style={{fontSize: `${displaySettings.textSize}rem`}}>
                    Sample Text
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    checked={displaySettings.highContrast}
                    onChange={handleHighContrastChange}
                  />
                  <span className="ml-2 font-medium">High Contrast Mode</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  Makes cards and buttons easier to see with stronger colors
                </p>
              </div>
            </div>
          </div>
          

          
          {/* Help & Support */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-purple-200">
            <div className="flex items-center mb-4">
              <i className="ri-question-answer-line text-2xl mr-2 text-purple-500"></i>
              <h3 className="font-bold text-lg">Help Center</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button className="p-4 text-left flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <i className="ri-video-line text-2xl text-purple-500 mb-2"></i>
                <span className="font-medium">Watch How-To Videos</span>
                <p className="text-xs text-gray-500 mt-1">Learn with fun videos</p>
              </button>
              
              <button className="p-4 text-left flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <i className="ri-question-line text-2xl text-green-500 mb-2"></i>
                <span className="font-medium">Questions & Answers</span>
                <p className="text-xs text-gray-500 mt-1">Find solutions fast</p>
              </button>
              
              <button className="p-4 text-left flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <i className="ri-shield-line text-2xl text-blue-500 mb-2"></i>
                <span className="font-medium">Privacy Rules</span>
                <p className="text-xs text-gray-500 mt-1">How we protect you</p>
              </button>
              
              <button className="p-4 text-left flex flex-col items-center justify-center bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <i className="ri-mail-line text-2xl text-yellow-500 mb-2"></i>
                <span className="font-medium">Talk to a Helper</span>
                <p className="text-xs text-gray-500 mt-1">Get extra help when needed</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
