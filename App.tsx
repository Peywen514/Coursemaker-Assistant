import React, { useState } from 'react';
import { CourseInfo, PainPoint, AppState } from './types';
import CourseInput from './components/CourseInput';
import StrategySelector from './components/StrategySelector';
import ContentGenerator from './components/ContentGenerator';
import { analyzeCourseAndGetPainPoints } from './services/geminiService';
import { Sparkles, AlertCircle, Settings, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT_COURSE);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Error State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiKeyError, setIsApiKeyError] = useState(false);

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

      // Detect API Key specific errors (400 Bad Request usually means invalid key, 403 means permission)
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

  const handlePainPointSelect = (pp: PainPoint) => {
    setSelectedPainPoint(pp);
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
          <div className="text-sm text-gray-500 font-medium hidden sm:block">
             For 104 Learning Platform
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
                    <p>The application cannot access the Google Gemini API. This is usually because the environment variable is missing.</p>
                    
                    <div className="bg-white/60 p-3 rounded-md border border-orange-200">
                      <h4 className="font-bold mb-1">How to fix this (Deployment):</h4>
                      <ol className="list-decimal list-inside space-y-1 ml-1">
                        <li>Go to your host settings (e.g., Netlify, Vercel).</li>
                        <li>Find <strong>Environment Variables</strong> (Netlify: Site configuration {'>'} Environment variables).</li>
                        <li>Add a new variable named <code className="bg-orange-100 px-1 py-0.5 rounded font-mono text-orange-900">API_KEY</code>.</li>
                        <li>Paste your Google Gemini API Key as the value.</li>
                        <li><strong>Re-deploy</strong> your site for changes to take effect.</li>
                      </ol>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold underline hover:text-orange-950">
                            Get a Gemini API Key <ExternalLink size={12}/>
                        </a>
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
