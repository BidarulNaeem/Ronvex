import React from 'react';
import { Headphones, Watch, Keyboard, Zap, Home, Grid } from 'lucide-react';

interface CategoryChipsProps {
  categories: { id: string; name: string; slug: string; icon: string }[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Headphones: <Headphones className="w-4 h-4" />,
  Watch: <Watch className="w-4 h-4" />,
  Keyboard: <Keyboard className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
};

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="py-4 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0066ff] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0066ff] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {iconMap[cat.icon] || <Zap className="w-3.5 h-3.5" />}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
