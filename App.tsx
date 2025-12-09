import React, { useState } from 'react';
import { CourseInfo, PainPoint, AppState } from './types';
import CourseInput from './components/CourseInput';
import StrategySelector from './components/StrategySelector';
import ContentGenerator from './components/ContentGenerator';
import { analyzeCourseAndGetPainPoints } from './services/geminiService';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT_COURSE);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCourseSubmit = async (info: CourseInfo) => {
    setIsLoading(true);
    setCourse(info);
    try {
      const results = await analyzeCourseAndGetPainPoints(info);
      setPainPoints(results);
      setAppState(AppState.SELECT_STRATEGY);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Analysis failed. Please try again.");
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
          <div className="text-sm text-gray-500 font-medium">
             For 104 Learning Platform
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 sm:p-8">
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
                  className="text-sm text-gray-500 hover:text-gray-900"
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
