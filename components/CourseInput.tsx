import React, { useState } from 'react';
import { CourseInfo } from '../types';
import { BookOpen, Target, FileText, List } from 'lucide-react';

interface Props {
  onSubmit: (info: CourseInfo) => void;
  isLoading: boolean;
}

const CourseInput: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [info, setInfo] = useState<CourseInfo>({
    title: '高效能職場溝通術',
    targetAudience: '剛晉升的新手主管，面臨向下管理與跨部門溝通的挑戰',
    description: '本課程旨在協助新手主管建立溝通自信，掌握非暴力溝通技巧，並學會如何進行有效的績效面談與衝突協調。',
    keyTakeaways: '1. 掌握DISC人格分析 2. 學習ORID焦點討論法 3. 建立三明治回饋技巧',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(info);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Step 1: Define Your Course</h2>
        <p className="opacity-90">Tell us about the course you are launching on 104 Learning Platform.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <BookOpen size={18} /> Course Title (課程名稱)
          </label>
          <input
            type="text"
            name="title"
            value={info.title}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
            required
            placeholder="e.g. Workplace Communication Mastery"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Target size={18} /> Target Audience (目標受眾)
          </label>
          <input
            type="text"
            name="targetAudience"
            value={info.targetAudience}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
            required
            placeholder="e.g. Junior Managers, Fresh Graduates"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={18} /> Description (課程簡介)
            </label>
            <textarea
              name="description"
              value={info.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
              required
              placeholder="Briefly describe the course content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <List size={18} /> Key Takeaways (重點收穫)
            </label>
            <textarea
              name="keyTakeaways"
              value={info.keyTakeaways}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
              required
              placeholder="List 3 main benefits..."
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition transform hover:-translate-y-1 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-600 to-pink-600 hover:shadow-orange-500/30'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Strategy...
              </span>
            ) : (
              'Analyze Marketing Strategy'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseInput;
