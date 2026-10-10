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
      {/* Main Warm Stone Card */}
      <div className="rounded-[24px] bg-[#f2f0e7] text-[#171412] p-6 sm:p-8 lg:p-12 border-2 border-[#171412] shadow-md">
        {/* Accessible Tablist */}
        <div
          role="tablist"
          aria-label="Dropshipping Academy curriculum stages"
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-4 mb-8 border-b border-[#171412]/15"
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
                className={`min-h-[44px] px-5 py-2.5 rounded-[50px] text-[13px] font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#171412] text-[#fbf9ef] font-extrabold shadow-sm'
                    : 'bg-[#fbf9ef] text-[#171412]/80 hover:bg-[#ffc765]/40 hover:text-[#171412] border border-[#171412]/20'
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
            <div className="text-[13px] font-extrabold text-[#813502] tracking-wide inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff7722]"></span>
              <span>{t('ধাপ', 'Stage')} {activeItem.stepNumber} · {activeItem.label}</span>
            </div>

            <h3 className="font-display text-[28px] sm:text-[36px] lg:text-[42px] font-extrabold text-[#171412] leading-[1.1] tracking-[-0.02em] text-balance">
              {activeItem.headline}
            </h3>

            <p className="text-[16px] text-[#171412]/80 leading-[1.6] max-w-[60ch]">
              {activeItem.description}
            </p>

            <div className="pt-4 border-t border-[#171412]/15">
              <div className="text-[13px] font-bold text-[#813502] mb-3 uppercase tracking-wider">
                {t('অন্তর্ভুক্ত টেমপ্লেট ও সিস্টেমসমূহ:', 'Included Templates & Systems:')}
              </div>
              <ul className="flex flex-col gap-3">
                {activeItem.deliverables.map((deliv) => (
                  <li key={deliv} className="flex items-start gap-3 text-[15px] text-[#171412]">
                    <span className="w-5 h-5 rounded-full bg-[#ff7722] text-[#171412] border border-[#171412] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckSvgIcon className="w-3.5 h-3.5" />
                    </span>
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: 3 Metric Cards (Black, Orange, Yellow matching original design) */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-center py-2">
            {/* Tile 1: Black */}
            <div className="rounded-[16px] bg-[#171412] text-[#fbf9ef] border-2 border-[#171412] p-5 flex items-center justify-between gap-4 transition-all shadow-sm group">
              <div>
                <div className="text-[12px] font-semibold text-[#fbc59d]">
                  {activeItem.tiles.blackTitle}
                </div>
                <div className="font-display text-[24px] font-extrabold text-[#fbf9ef] leading-tight tabular-nums mt-1">
                  {activeItem.tiles.blackStat}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#fbf9ef]/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <TileAnalyticsIcon className="w-6 h-6" />
              </div>
            </div>

            {/* Tile 2: Orange */}
            <div className="rounded-[16px] bg-[#ff7722] text-[#171412] border-2 border-[#171412] p-5 flex items-center justify-between gap-4 transition-all shadow-sm group">
              <div>
                <div className="text-[12px] font-bold text-[#171412]/80">
                  {activeItem.tiles.orangeTitle}
                </div>
                <div className="font-display text-[24px] font-extrabold text-[#171412] leading-tight tabular-nums mt-1">
                  {activeItem.tiles.orangeStat}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#fbf9ef]/30 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <TileCompassIcon className="w-6 h-6" />
              </div>
            </div>

            {/* Tile 3: Yellow */}
            <div className="rounded-[16px] bg-[#ffc765] text-[#171412] border-2 border-[#171412] p-5 flex items-center justify-between gap-4 transition-all shadow-sm group">
              <div>
                <div className="text-[12px] font-bold text-[#813502]">
                  {activeItem.tiles.yellowTitle}
                </div>
                <div className="font-display text-[24px] font-extrabold text-[#171412] leading-tight tabular-nums mt-1">
                  {activeItem.tiles.yellowStat}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#fbf9ef]/40 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <TileBoltIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
