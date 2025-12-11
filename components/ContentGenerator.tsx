import React, { useState, useEffect } from 'react';
import { CourseInfo, PainPoint, SlideData, VideoScriptScene, SlideContent } from '../types';
import { generateLazyPackContent, generateSlideBackground, generateVideoScript, generateMarketingVideo } from '../services/geminiService';
import { Image as ImageIcon, Video, Download, RefreshCw, Layers, Film, FileText, Copy, TrendingUp, Check, Edit3 } from 'lucide-react';

interface Props {
  course: CourseInfo;
  painPoint: PainPoint;
  onBack: () => void;
}

const ContentGenerator: React.FC<Props> = ({ course, painPoint, onBack }) => {
  const [activeTab, setActiveTab] = useState<'lazypack' | 'video'>('lazypack');
  
  // Lazy Pack State
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  
  // Video Script State
  const [script, setScript] = useState<VideoScriptScene[]>([]);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  
  // Veo State
  const [veoPrompt, setVeoPrompt] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isVeoGenerating, setIsVeoGenerating] = useState(false);
  const [veoError, setVeoError] = useState<string | null>(null);

  // Initialize Lazy Pack Text
  useEffect(() => {
    let isMounted = true;
    const initText = async () => {
      setIsGeneratingText(true);
      try {
        const content = await generateLazyPackContent(course, painPoint);
        if (isMounted) {
          setSlides(content.map(c => ({ content: c, isGeneratingImage: false })));
        }
      } catch (error) {
        console.error("Failed to generate text", error);
      } finally {
        if (isMounted) setIsGeneratingText(false);
      }
    };
    if (activeTab === 'lazypack' && slides.length === 0) {
        initText();
    }
    return () => { isMounted = false; };
  }, [activeTab, course, painPoint, slides.length]);

  // Initialize Video Script
  useEffect(() => {
    let isMounted = true;
    const initScript = async () => {
        setIsScriptLoading(true);
        try {
            const scenes = await generateVideoScript(course, painPoint);
            if (isMounted) setScript(scenes);
        } catch (e) {
            console.error(e);
        } finally {
            if (isMounted) setIsScriptLoading(false);
        }
    }
    if (activeTab === 'video' && script.length === 0) {
        initScript();
    }
    return () => { isMounted = false; };
  }, [activeTab, course, painPoint, script.length]);


  const handleGenerateImage = async (index: number) => {
    const slide = slides[index];
    if (slide.isGeneratingImage) return;

    const newSlides = [...slides];
    newSlides[index].isGeneratingImage = true;
    setSlides(newSlides);

    try {
      const base64Image = await generateSlideBackground(slide.content.visualPrompt);
      setSlides(prev => {
        const updated = [...prev];
        updated[index].backgroundImage = base64Image;
        updated[index].isGeneratingImage = false;
        return updated;
      });
    } catch (error) {
      console.error(error);
      alert("Image generation skipped (Free Tier limit or error). Using gradient fallback.");
      setSlides(prev => {
        const updated = [...prev];
        updated[index].isGeneratingImage = false;
        return updated;
      });
    }
  };

  // Allow users to edit slide text
  const handleSlideTextChange = (index: number, field: keyof SlideContent, value: string) => {
      const newSlides = [...slides];
      newSlides[index].content = {
          ...newSlides[index].content,
          [field]: value
      };
      setSlides(newSlides);
  };

  const handleDownloadImage = (base64: string | undefined, index: number) => {
    if (!base64) return;
    const link = document.createElement('a');
    link.href = base64;
    link.download = `104-course-slide-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCaption = () => {
    const caption = slides.map((s, i) => `【Slide ${i+1}】${s.content.headline}\n${s.content.subtext}`).join('\n\n') 
      + `\n\n👇 立即搜尋課程：${course.title}\n`
      + `\n#${painPoint.seoKeywords.join(' #')} #104學習精靈 #職涯發展`;
    
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyScript = () => {
    const text = script.map(s => `[${s.scene}] (Visual: ${s.visual}) -> Audio: ${s.audio}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleGenerateVeoVideo = async () => {
      if (!veoPrompt) {
          setVeoPrompt(`Professional cinematic shot representing: ${painPoint.title}`);
      }
      setIsVeoGenerating(true);
      setGeneratedVideoUrl(null);
      setVeoError(null);
      try {
          const promptToUse = veoPrompt || `Professional cinematic shot representing: ${painPoint.title}`;
          const url = await generateMarketingVideo(promptToUse);
          setGeneratedVideoUrl(url);
      } catch (e: any) {
          console.error("Video generation failed", e);
          if (e.message.includes('403') || e.message.includes('permission')) {
              setVeoError("This feature requires a Paid Google Cloud Project Key. Please stick to the Video Script (above) for free usage.");
          } else {
              setVeoError("Generation failed. Veo models are currently in preview and may require specific access.");
          }
      } finally {
          setIsVeoGenerating(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-medium">
          &larr; Back to Strategy
        </button>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('lazypack')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'lazypack' ? 'bg-orange-100 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Layers size={18} /> Lazy Pack
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'video' ? 'bg-purple-100 text-purple-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Video size={18} /> Video Script
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Context Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <span className="inline-block px-2 py-1 mb-2 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                Target: {painPoint.targetGroup}
            </span>
            <h3 className="text-lg font-bold text-gray-800 mb-3">{painPoint.title}</h3>
            <p className="text-gray-600 mb-4">{painPoint.description}</p>
            
            <div className="mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">SEO Strategy</h4>
                <div className="flex flex-wrap gap-1">
                    {painPoint.seoKeywords?.map(k => (
                        <span key={k} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                            #{k}
                        </span>
                    ))}
                </div>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg text-sm text-gray-700 italic border-l-4 border-orange-400">
              "{painPoint.marketingHook}"
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <TrendingUp size={20} />
                Traffic Tips
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm opacity-90">
              <li>Include the keyword <b>"{painPoint.seoKeywords?.[0]}"</b> in your first 3 seconds of video.</li>
              <li>Use the generated hashtags in your post description.</li>
              <li>Post during commute hours (8am/6pm) for this demographic.</li>
            </ul>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {activeTab === 'lazypack' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <div>
                    <h3 className="font-bold text-orange-900">Instagram/FB Carousel</h3>
                    <p className="text-xs text-orange-700">5 slides. <span className="font-bold">Click text on image to edit!</span></p>
                  </div>
                  <button 
                    onClick={handleCopyCaption}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-100 transition shadow-sm"
                  >
                    {copiedCaption ? <Check size={16} /> : <Copy size={16} />}
                    {copiedCaption ? 'Copied!' : 'Copy Full Caption'}
                  </button>
               </div>

               {isGeneratingText ? (
                 <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl">
                    <RefreshCw className="animate-spin text-orange-500 w-10 h-10 mb-4" />
                    <p className="text-gray-500">Crafting high-conversion slides...</p>
                 </div>
               ) : (
                 slides.map((slide, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <span className="font-bold text-gray-700 flex items-center gap-2">
                            Slide {index + 1}
                            <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-500 font-normal flex items-center gap-1">
                                <Edit3 size={10} /> Editable
                            </span>
                        </span>
                        <div className="flex gap-2">
                          {slide.backgroundImage && (
                            <button
                              onClick={() => handleDownloadImage(slide.backgroundImage, index)}
                              className="flex items-center gap-1 text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-300 transition"
                              title="Download Image"
                            >
                                <Download size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleGenerateImage(index)}
                            disabled={slide.isGeneratingImage}
                            className="flex items-center gap-1 text-sm bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-200 transition disabled:opacity-50"
                          >
                            <ImageIcon size={14} /> 
                            {slide.backgroundImage ? 'Regenerate' : 'Generate Art'}
                          </button>
                        </div>
                      </div>

                      {/* Slide Preview / Canvas */}
                      <div className="aspect-square relative bg-gray-900 flex items-center justify-center text-center overflow-hidden group">
                        {slide.backgroundImage ? (
                          <img 
                            src={slide.backgroundImage} 
                            alt="Background" 
                            className="absolute inset-0 w-full h-full object-cover opacity-60 transition group-hover:scale-105 duration-700 pointer-events-none"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-100" />
                        )}

                        {slide.isGeneratingImage && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                              <RefreshCw className="animate-spin text-white w-8 h-8" />
                           </div>
                        )}
                        
                        {/* Text Overlay - Editable Inputs */}
                        <div className="relative z-10 p-8 max-w-md w-full flex flex-col items-center">
                          <textarea
                            value={slide.content.headline}
                            onChange={(e) => handleSlideTextChange(index, 'headline', e.target.value)}
                            rows={2}
                            placeholder="Enter Headline..."
                            className="bg-transparent w-full text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg leading-tight text-center resize-none focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1 overflow-hidden"
                          />
                          
                          <textarea
                            value={slide.content.subtext}
                            onChange={(e) => handleSlideTextChange(index, 'subtext', e.target.value)}
                            rows={3}
                            placeholder="Enter description..."
                            className="bg-transparent w-full text-lg md:text-xl text-gray-100 font-medium drop-shadow-md text-center resize-none focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
                          />

                          {index === slides.length - 1 && (
                            <div className="mt-8">
                                <span className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                                  Search on 104 Learning
                                </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Branding Footer */}
                        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 opacity-80 pointer-events-none">
                           <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                           <span className="text-white text-xs font-bold tracking-widest uppercase">104 Learning</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 text-xs text-gray-400 border-t border-gray-100 flex justify-between">
                         <span>Visual Concept: {slide.content.visualPrompt}</span>
                      </div>
                    </div>
                 ))
               )}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-8">
               {/* 1. Script Generator (Main Free Feature) */}
               <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <FileText size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Short Video Script</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            High-retention script designed for <b>{painPoint.targetGroup}</b>.
                        </p>
                      </div>
                      <button 
                         onClick={handleCopyScript}
                         className="flex items-center gap-2 text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200 transition"
                      >
                         {copiedScript ? <Check size={16} /> : <Copy size={16} />}
                         {copiedScript ? 'Copied' : 'Copy Script'}
                      </button>
                  </div>

                  <div className="p-6">
                      {isScriptLoading ? (
                          <div className="flex flex-col items-center justify-center py-10">
                              <RefreshCw className="animate-spin text-purple-500 w-8 h-8 mb-4" />
                              <p className="text-gray-500">Writing your video script...</p>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {script.map((scene, idx) => (
                                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-purple-50 transition">
                                      <div className="flex-shrink-0 w-16 pt-1 font-bold text-gray-400 text-sm uppercase">
                                          {scene.scene}
                                      </div>
                                      <div className="flex-grow space-y-2">
                                          <div>
                                              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Visual</span>
                                              <p className="text-gray-800 text-sm font-medium">{scene.visual}</p>
                                          </div>
                                          <div>
                                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Audio / Text</span>
                                              <p className="text-gray-600 text-sm italic">"{scene.audio}"</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
               </div>

               {/* 2. Optional Veo Generation */}
               <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 opacity-90">
                   <div className="flex items-center gap-2 mb-4">
                       <Film size={20} className="text-gray-400" />
                       <h3 className="text-lg font-bold text-gray-700">AI Video Background (Veo)</h3>
                       <span className="px-2 py-0.5 rounded text-[10px] bg-gray-200 text-gray-600 font-bold uppercase">Paid Key Only</span>
                   </div>
                   
                   {generatedVideoUrl ? (
                        <div className="mb-4">
                            <video src={generatedVideoUrl} autoPlay loop muted className="w-full max-w-xs rounded-lg shadow-lg" />
                            <button 
                                onClick={() => setGeneratedVideoUrl(null)}
                                className="mt-2 text-sm text-gray-500 hover:text-gray-900"
                            >
                                Clear Video
                            </button>
                        </div>
                   ) : (
                       <div className="flex gap-2">
                           <input 
                              type="text" 
                              placeholder={`e.g. Cinematic office shot for ${painPoint.title}`}
                              className="flex-grow p-2 border border-gray-300 rounded-lg text-sm"
                              value={veoPrompt}
                              onChange={(e) => setVeoPrompt(e.target.value)}
                           />
                           <button 
                              onClick={handleGenerateVeoVideo}
                              disabled={isVeoGenerating}
                              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition disabled:opacity-50"
                           >
                               {isVeoGenerating ? '...' : 'Generate'}
                           </button>
                       </div>
                   )}
                   {veoError && (
                       <p className="mt-3 text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
                           {veoError}
                       </p>
                   )}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;