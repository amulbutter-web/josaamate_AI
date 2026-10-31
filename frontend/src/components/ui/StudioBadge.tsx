import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const TOOLTIP_TEXT =
  'All cutoff data shown is illustrative only. Import official data from josaa.nic.in for accurate results.';

const StudioBadge: React.FC = () => {
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = (): void => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTooltipVisible(true);
  };

  const hideTooltip = (): void => {
    timeoutRef.current = setTimeout(() => setTooltipVisible(false), 120);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby="studio-badge-tooltip"
        className="
          inline-flex items-center gap-1.5
          px-2.5 py-1 rounded-full
          bg-amber-100 border border-amber-300
          text-amber-700 text-[11px] font-bold
          tracking-wide uppercase
          cursor-default select-none
          hover:bg-amber-200 transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
        "
      >
        <span role="img" aria-label="warning">⚠️</span>
        DEMO DATA
      </button>

      <AnimatePresence>
        {tooltipVisible && (
          <motion.div
            id="studio-badge-tooltip"
            role="tooltip"
            key="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="
              absolute top-full right-0 mt-2 z-50
              w-72 rounded-xl
              bg-gray-900 text-white
              text-xs leading-relaxed
              px-4 py-3 shadow-xl
              pointer-events-none
            "
          >
            {/* Arrow */}
            <span
              className="absolute -top-[6px] right-5 w-3 h-3 bg-gray-900 rotate-45 rounded-sm"
              aria-hidden="true"
            />
            <span className="font-semibold text-amber-400 block mb-1">
              ⚠️ Illustrative Data Only
            </span>
            {TOOLTIP_TEXT}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudioBadge;
