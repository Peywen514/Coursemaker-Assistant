import React, { useState, useEffect } from 'react';
import { CourseInfo, PainPoint, AppState } from './types';
import CourseInput from './components/CourseInput';
import StrategySelector from './components/StrategySelector';
import ContentGenerator from './components/ContentGenerator';
import { analyzeCourseAndGetPainPoints, setCustomApiKey, hasStoredKey, removeCustomApiKey } from './services/geminiService';
import { Sparkles, AlertCircle, Settings, ExternalLink, Key, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT_COURSE);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Error State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiKeyError, setIsApiKeyError] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  
  // UI State for Key Management
  const [keyIsSaved, setKeyIsSaved] = useState(false);

  useEffect(() => {
    setKeyIsSaved(hasStoredKey());
  }, []);

  const handleCourseSubmit = async (info: CourseInfo) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsApiKeyError(false);
    setCourse(info);
    
    try {
      const results = await analyzeCourseAndGetPainPoints(info);
      setPainPoints(results);
      setAppState(AppState.SELECT_STRATEGY);
    } catch (error: any) {
      console.error("Analysis failed", error);
      
      let msg = "Analysis failed. Please try again later.";
      let isKeyError = false;

      // Detect API Key specific errors
      if (error.message?.includes('400') || error.message?.includes('403') || error.message?.includes('API key')) {
        msg = "API Key Configuration Missing or Invalid";
        isKeyError = true;
      } else if (error instanceof SyntaxError) {
        msg = "AI Response Error. The AI generated invalid data format. Please try again.";
      }
      
      setErrorMessage(msg);
      setIsApiKeyError(isKeyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempApiKey.trim()) return;
    
    setCustomApiKey(tempApiKey.trim());
    setKeyIsSaved(true);
    setErrorMessage(null);
    setIsApiKeyError(false);
    alert("API Key saved to browser! You can now use the app.");
  };

  const handleResetKey = () => {
    if(window.confirm("Are you sure you want to remove the saved API Key?")) {
        removeCustomApiKey();
        setKeyIsSaved(false);
        setTempApiKey("");
        window.location.reload();
    }
  };

  const handlePainPointSelect = (painPoint: PainPoint) => {
    setSelectedPainPoint(painPoint);
    setAppState(AppState.GENERATE_CONTENT);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">CourseMarketer <span className="text-orange-600">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
             {keyIsSaved && (
                 <button 
                   onClick={handleResetKey}
                   className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition"
                   title="Remove saved API Key"
                 >
                    <Trash2 size={14} /> Reset Key
                 </button>
             )}
             <div className="text-sm text-gray-500 font-medium hidden sm:block">
                For 104 Learning Platform
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 sm:p-8">
        {errorMessage && (
          <div className="max-w-3xl mx-auto mb-8 animate-fade-in-up">
            <div className={`border-l-4 p-4 rounded-r-lg flex items-start gap-4 shadow-sm ${isApiKeyError ? 'bg-orange-50 border-orange-500' : 'bg-red-50 border-red-500'}`}>
              <div className="flex-shrink-0 mt-1">
                {isApiKeyError ? <Settings className="text-orange-500 w-6 h-6" /> : <AlertCircle className="text-red-500 w-6 h-6" />}
              </div>
              <div className="flex-grow">
                <h3 className={`font-bold text-lg ${isApiKeyError ? 'text-orange-800' : 'text-red-800'}`}>
                  {errorMessage}
                </h3>
                
                {isApiKeyError ? (
                  <div className="mt-3 text-sm text-orange-800 space-y-3">
                    <p>The application cannot access the Google Gemini API.</p>
                    
                    {/* Manual Entry Fallback */}
                    <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm mt-3">
                        <h4 className="font-bold flex items-center gap-2 mb-2 text-orange-900">
                           <Key size={16} /> Enter API Key Once (Saved in Browser)
                        </h4>
                        <p className="mb-3 text-xs text-orange-700">
                           We will save this key to your browser's local storage so you don't have to enter it again.
                        </p>
                        <form onSubmit={handleManualKeySubmit} className="flex gap-2">
                           <input 
                             type="password" 
                             placeholder="Paste AIza... key here"
                             className="flex-grow border border-orange-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                             value={tempApiKey}
                             onChange={(e) => setTempApiKey(e.target.value)}
                           />
                           <button 
                             type="submit"
                             className="bg-orange-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-orange-700 transition"
                           >
                             Save Key
                           </button>
                        </form>
                    </div>

                    <div className="pt-2 border-t border-orange-200/50 mt-2">
                      <div className="flex items-center gap-2 mt-2">
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold underline hover:text-orange-950">
                              Get a Gemini API Key <ExternalLink size={12}/>
                          </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {appState === AppState.INPUT_COURSE && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-12">
               <h1 className="text-4xl font-extrabold text-gray-900 mb-4 sm:leading-tight">
                 Create Viral Marketing Content<br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600">
                   For Your Online Course
                 </span>
               </h1>
               <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                 Input your course details, and let our AI generate "Workplace Pain Point" lazy packs and video scripts optimized for social media.
               </p>
            </div>
            <CourseInput onSubmit={handleCourseSubmit} isLoading={isLoading} />
          </div>
        )}

        {appState === AppState.SELECT_STRATEGY && (
          <div className="animate-fade-in">
             <div className="mb-6">
                <button 
                  onClick={() => setAppState(AppState.INPUT_COURSE)}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    &larr; Edit Course Details
                </button>
             </div>
             <StrategySelector painPoints={painPoints} onSelect={handlePainPointSelect} />
          </div>
        )}

        {appState === AppState.GENERATE_CONTENT && course && selectedPainPoint && (
          <div className="animate-fade-in">
            <ContentGenerator 
              course={course} 
              painPoint={selectedPainPoint} 
              onBack={() => setAppState(AppState.SELECT_STRATEGY)} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;