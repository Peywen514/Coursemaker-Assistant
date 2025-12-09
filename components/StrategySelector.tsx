import React from 'react';
import { PainPoint } from '../types';
import { ArrowRight, Zap, Users, Search } from 'lucide-react';

interface Props {
  painPoints: PainPoint[];
  onSelect: (painPoint: PainPoint) => void;
}

const StrategySelector: React.FC<Props> = ({ painPoints, onSelect }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Marketing Strategy</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We analyzed your course and identified 3 high-potential segments. 
          Each strategy targets a specific demographic with optimized SEO keywords for maximum reach.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {painPoints.map((pp, index) => (
          <div 
            key={pp.id}
            onClick={() => onSelect(pp)}
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-orange-400 flex flex-col h-full"
          >
            {/* Header: Target Group */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                    <Users size={12} /> {pp.targetGroup}
                 </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{pp.title}</h3>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed">{pp.description}</p>
            
            {/* SEO Keywords */}
            <div className="mb-6">
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                    <Search size={12} /> Target SEO Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                    {pp.seoKeywords?.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">
                            #{kw}
                        </span>
                    ))}
                </div>
            </div>

            {/* Hook */}
            <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-100">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-800 font-medium italic">"{pp.marketingHook}"</p>
              </div>
            </div>

            <button className="w-full py-3 bg-white text-orange-600 border border-orange-200 font-bold rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm">
              Generate Content <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategySelector;
