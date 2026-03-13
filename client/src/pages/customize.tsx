import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import * as tts from "@/lib/tts";

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
    tts.setVoicePreferences(voiceSettings);
  }, [setCurrentPage, voiceSettings]);

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
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
      tts.setVoicePreferences(newSettings);
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
      tts.setVoicePreferences(newSettings);
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
      tts.setVoicePreferences(newSettings);
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
      tts.setVoicePreferences(newSettings);
      return newSettings;
    });
  };

  const handleTestVoice = () => {
    setIsTestingVoice(true);

    // Ensure the current voice settings are applied before testing
    tts.setVoicePreferences(voiceSettings);

    // Speak the test phrase
    tts.speak(testPhrase);

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

  const handleDarkModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplaySettings(prev => ({
      ...prev,
      darkMode: e.target.checked
    }));
  };

  return (
    <section className="h-full flex flex-col">
      <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <h2 className="text-2xl font-bold text-center mb-2 dark:text-white">My Settings</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-2">Make SpeakMyWay work just right for you!</p>
        <div className="flex justify-center">
          <div className="flex space-x-2 items-center text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full">
            <i className="ri-information-line"></i>
            <span>Parents can help with these settings</span>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-2 border-purple-200 dark:border-purple-900">
            <div className="flex items-center mb-4">
              <i className="ri-user-smile-line text-2xl mr-2 text-purple-500 dark:text-purple-400"></i>
              <h3 className="font-bold text-lg dark:text-white">About Me</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">My Name</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={handleUserNameChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="What should we call you?"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Language / Idioma</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`relative flex items-center justify-center p-4 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 ${language === "en" ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-600 dark:text-blue-300' : 'dark:text-gray-300'}`}>
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      className="absolute opacity-0"
                      checked={language === "en"}
                      onChange={() => {
                        handleLanguageChange({ target: { value: "en" } } as React.ChangeEvent<HTMLSelectElement>);
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <span className="text-xl mb-1">🇺🇸</span>
                      <span className="font-medium">English</span>
                    </div>
                  </label>

                  <label className={`relative flex items-center justify-center p-4 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900 ${language === "es" ? 'bg-red-100 dark:bg-red-900 border-red-500 dark:border-red-600 dark:text-red-300' : 'dark:text-gray-300'}`}>
                    <input
                      type="radio"
                      name="language"
                      value="es"
                      className="absolute opacity-0"
                      checked={language === "es"}
                      onChange={() => {
                        handleLanguageChange({ target: { value: "es" } } as React.ChangeEvent<HTMLSelectElement>);
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <span className="text-xl mb-1">🇪🇸</span>
                      <span className="font-medium">Español</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-2 border-green-200 dark:border-green-900">
            <div className="flex items-center mb-4">
              <i className="ri-volume-up-line text-2xl mr-2 text-green-500 dark:text-green-400"></i>
              <h3 className="font-bold text-lg dark:text-white">My Voice Helper</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Voice Type</label>
                <div className={`grid ${language === 'es' ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                  {/* Only show female voice for English */}
                  {language !== 'es' && (
                    <label className={`relative flex items-center justify-center p-4 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-green-900 ${(voiceSettings.voiceType === "female" || voiceSettings.voiceType === "default") ? 'bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-600 dark:text-green-300' : 'dark:text-gray-300'}`}>
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
                        <i className="ri-user-voice-line text-3xl text-green-500 dark:text-green-400 mb-2"></i>
                        <span className="font-medium">Female Voice</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">(Default)</span>
                      </div>
                    </label>
                  )}

                  <label className={`relative flex items-center justify-center p-4 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 ${voiceSettings.voiceType === "male" || voiceSettings.voiceType === "en-US-male-warm" ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-600 dark:text-blue-300' : 'dark:text-gray-300'}`}>
                    <input
                      type="radio"
                      name="voiceType"
                      value="male"
                      className="absolute opacity-0"
                      checked={voiceSettings.voiceType === "male" || voiceSettings.voiceType === "en-US-male-warm"}
                      onChange={() => {
                        handleVoiceTypeChange({ target: { value: "male" } } as React.ChangeEvent<HTMLSelectElement>);
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <i className="ri-user-voice-line text-3xl text-blue-500 dark:text-blue-400 mb-2"></i>
                      <span className="font-medium">Male Voice</span>
                      {language === 'es' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">(Only available)</span>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Test Voice</label>
                <div className="flex flex-col space-y-2">
                  <input 
                    type="text" 
                    value={testPhrase}
                    onChange={(e) => setTestPhrase(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="Try: Hello, today we're going to the park"
                  />
                  <button 
                    className={`w-full py-2 px-4 rounded-md ${
                      isTestingVoice 
                        ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-primary-dark dark:hover:bg-primary-light'
                    }`}
                    onClick={handleTestVoice}
                    disabled={isTestingVoice}
                  >
                    {isTestingVoice ? 'Playing...' : 'Test Voice'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Click the "Test Voice" button to hear how the selected voice sounds
                </p>
              </div>

            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-2 border-blue-200 dark:border-blue-900">
            <div className="flex items-center mb-4">
              <i className="ri-settings-2-line text-2xl mr-2 text-blue-500 dark:text-blue-400"></i>
              <h3 className="font-bold text-lg dark:text-white">Display Settings</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Theme Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`relative flex items-center justify-center p-4 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 ${!displaySettings.darkMode ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-600 dark:text-blue-300' : 'dark:text-gray-300'}`}>
                    <input
                      type="radio"
                      name="themeMode"
                      value="light"
                      className="absolute opacity-0"
                      checked={!displaySettings.darkMode}
                      onChange={() => handleDarkModeChange({ target: { checked: false } } as React.ChangeEvent<HTMLInputElement>)}
                    />
                    <div className="flex flex-col items-center">
                      <i className="ri-sun-line text-3xl text-yellow-500 dark:text-yellow-400 mb-2"></i>
                      <span className="font-medium">Light Mode</span>
                    </div>
                  </label>

                  <label className={`relative flex items-center justify-center p-4 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 ${displaySettings.darkMode ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-600 dark:text-blue-300' : 'dark:text-gray-300'}`}>
                    <input
                      type="radio"
                      name="themeMode"
                      value="dark"
                      className="absolute opacity-0"
                      checked={displaySettings.darkMode}
                      onChange={() => handleDarkModeChange({ target: { checked: true } } as React.ChangeEvent<HTMLInputElement>)}
                    />
                    <div className="flex flex-col items-center">
                      <i className="ri-moon-line text-3xl text-blue-500 dark:text-blue-400 mb-2"></i>
                      <span className="font-medium">Dark Mode</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-2 border-purple-200 dark:border-purple-900">
            <div className="flex items-center mb-4">
              <i className="ri-question-answer-line text-2xl mr-2 text-purple-500 dark:text-purple-400"></i>
              <h3 className="font-bold text-lg dark:text-white">Help Center</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button className="p-4 text-left flex flex-col items-center justify-center bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors">
                <i className="ri-video-line text-2xl text-purple-500 dark:text-purple-400 mb-2"></i>
                <span className="font-medium dark:text-purple-200">Watch How-To Videos</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Learn with fun videos</p>
              </button>

              <button className="p-4 text-left flex flex-col items-center justify-center bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg transition-colors">
                <i className="ri-question-line text-2xl text-green-500 dark:text-green-400 mb-2"></i>
                <span className="font-medium dark:text-green-200">Questions & Answers</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Find solutions fast</p>
              </button>

              <button className="p-4 text-left flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors">
                <i className="ri-shield-line text-2xl text-blue-500 dark:text-blue-400 mb-2"></i>
                <span className="font-medium dark:text-blue-200">Privacy Rules</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">How we protect you</p>
              </button>

              <button className="p-4 text-left flex flex-col items-center justify-center bg-yellow-50 dark:bg-yellow-900 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded-lg transition-colors">
                <i className="ri-mail-line text-2xl text-yellow-500 dark:text-yellow-400 mb-2"></i>
                <span className="font-medium dark:text-yellow-200">Talk to a Helper</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get extra help when needed</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}