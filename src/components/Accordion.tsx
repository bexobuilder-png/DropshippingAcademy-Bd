import React, { useState } from 'react';
import type { FaqItem } from '../config/content';
import { PlusMinusIcon } from './svg/NavIcons';

export interface AccordionProps {
  items: FaqItem[];
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="divide-y divide-white/10 border-t border-b border-white/10">
      {items.map((item, idx) => {
        const isExpanded = openId === item.id;
        const buttonId = `faq-btn-${item.id}`;
        const panelId = `faq-panel-${item.id}`;
        const indexNum = String(idx + 1).padStart(2, '0');

        return (
          <div key={item.id} className="py-5 md:py-6">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                className="w-full min-h-[44px] flex items-start justify-between gap-4 text-left group cursor-pointer"
              >
                <div className="flex items-baseline gap-4 md:gap-6">
                  <span className="font-display text-[14px] font-bold text-[#00d27a] tabular-nums shrink-0">
                    {indexNum}.
                  </span>
                  <span className="font-display text-[19px] md:text-[23px] font-extrabold text-white leading-[1.2] tracking-[-0.02em] group-hover:text-[#00d27a] transition-colors">
                    {item.question}
                  </span>
                </div>
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isExpanded
                      ? 'bg-[#00d27a] text-[#070f1a] border-[#00d27a] shadow-md shadow-[#00d27a]/30'
                      : 'bg-white/5 text-slate-300 border-white/15 group-hover:bg-[#00d27a]/20 group-hover:text-[#00d27a] group-hover:border-[#00d27a]/40'
                  }`}
                >
                  <PlusMinusIcon expanded={isExpanded} className="w-4 h-4" />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isExpanded}
              className={isExpanded ? 'mt-4 pl-9 md:pl-11 pr-4 md:pr-16' : 'hidden'}
            >
              <p className="text-[15px] md:text-[16px] text-slate-300 leading-[1.6] max-w-[68ch]">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
