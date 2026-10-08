import React, { useState, useRef } from 'react';
import type { CurriculumTabItem } from '../config/content';
import { useLanguage } from '../context/LanguageContext';
import {
  TileAnalyticsIcon,
  TileBoltIcon,
  TileCompassIcon,
} from './svg/CurriculumTileIcons';
import { CheckSvgIcon } from './svg/NavIcons';

export interface TabsProps {
  items: CurriculumTabItem[];
}

export const Tabs: React.FC<TabsProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { t } = useLanguage();

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % items.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = items.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      setActiveIndex(nextIndex);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const activeItem = items[activeIndex] || items[0];

  return (
    <div className="w-full">
      {/* Main Purple Card */}
      <div className="rounded-[12px] bg-[#3d2fa9] text-[#fbf9ef] p-6 sm:p-8 lg:p-12 border-2 border-[#171412]">
        {/* Accessible Tablist */}
        <div
          role="tablist"
          aria-label="Dropshipping Academy curriculum stages"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-8 border-b border-[#fbf9ef]/20"
        >
          {items.map((tab, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                id={`tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveIndex(idx)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`min-h-[44px] px-5 py-2.5 rounded-[50px] text-[13px] font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#ffc765] text-[#171412] shadow-sm'
                    : 'bg-[#171412]/35 text-[#fbf9ef] hover:bg-[#171412]/55'
                }`}
              >
                <span className="tabular-nums mr-1.5 opacity-80">{tab.stepNumber}.</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tabpanel */}
        <div
          id={`panel-${activeItem.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeItem.id}`}
          tabIndex={0}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        >
          {/* Left Column: Headline, Description, Deliverables */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="text-[13px] font-bold text-[#ffc765] tracking-tight">
              {t('ধাপ', 'Stage')} {activeItem.stepNumber} · {activeItem.label}
            </div>

            <h3 className="font-display text-[28px] sm:text-[36px] lg:text-[42px] font-extrabold text-[#fbf9ef] leading-[1.08] tracking-[-0.02em] text-balance">
              {activeItem.headline}
            </h3>

            <p className="text-[16px] text-[#fbf9ef]/90 leading-[1.45] max-w-[60ch]">
              {activeItem.description}
            </p>

            <div className="pt-2 border-t border-[#fbf9ef]/15">
              <div className="text-[12px] font-bold text-[#fbc59d] mb-3">
                {t('অন্তর্ভুক্ত টেমপ্লেট ও সিস্টেমসমূহ:', 'Included Templates & Systems:')}
              </div>
              <ul className="flex flex-col gap-2.5">
                {activeItem.deliverables.map((deliv) => (
                  <li key={deliv} className="flex items-start gap-2.5 text-[15px] text-[#fbf9ef]">
                    <span className="w-5 h-5 rounded-full bg-[#ff7722] text-[#171412] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckSvgIcon className="w-3.5 h-3.5" />
                    </span>
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: 3 Tilted Illustrated SVG Tiles (Black, Orange-Soft, Yellow) */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-4 justify-center items-stretch py-2">
            {/* Tile 1: Black (#171412) */}
            <div className="rounded-[12px] bg-[#171412] text-[#fbf9ef] p-5 border border-[#fbf9ef]/20 flex items-center justify-between gap-4 transform -rotate-2 hover:rotate-0 transition-transform duration-200">
              <div>
                <div className="text-[12px] font-medium text-[#fbc59d]">
                  {activeItem.tiles.blackTitle}
                </div>
                <div className="font-display text-[24px] font-extrabold text-[#fbf9ef] leading-tight tabular-nums mt-1">
                  {activeItem.tiles.blackStat}
                </div>
              </div>
              <TileAnalyticsIcon className="w-11 h-11 shrink-0" />
            </div>

            {/* Tile 2: Orange-Soft (#fbc59d) */}
            <div className="rounded-[12px] bg-[#fbc59d] text-[#171412] p-5 border-2 border-[#171412] flex items-center justify-between gap-4 transform rotate-2 hover:rotate-0 transition-transform duration-200">
              <div>
                <div className="text-[12px] font-bold text-[#813502]">
                  {activeItem.tiles.orangeTitle}
                </div>
                <div className="font-display text-[24px] font-extrabold text-[#171412] leading-tight tabular-nums mt-1">
                  {activeItem.tiles.orangeStat}
                </div>
              </div>
              <TileCompassIcon className="w-11 h-11 shrink-0" />
            </div>

            {/* Tile 3: Yellow (#ffc765) */}
            <div className="rounded-[12px] bg-[#ffc765] text-[#171412] p-5 border-2 border-[#171412] flex items-center justify-between gap-4 transform -rotate-1 hover:rotate-0 transition-transform duration-200">
              <div>
                <div className="text-[12px] font-bold text-[#813502]">
                  {activeItem.tiles.yellowTitle}
                </div>
                <div className="font-display text-[24px] font-extrabold text-[#171412] leading-tight tabular-nums mt-1">
                  {activeItem.tiles.yellowStat}
                </div>
              </div>
              <TileBoltIcon className="w-11 h-11 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Reference Brown Shadow Bar sitting directly under the purple card */}
      <div
        aria-hidden="true"
        className="h-3.5 mx-4 sm:mx-8 rounded-b-[12px] bg-[#813502] border-x-2 border-b-2 border-[#171412]"
      />
    </div>
  );
};
