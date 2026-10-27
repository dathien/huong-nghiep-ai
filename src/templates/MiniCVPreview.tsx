import React from 'react';
import { CVTemplateMeta } from '../types';

interface MiniCVPreviewProps {
  template: CVTemplateMeta;
  primaryColor?: string;
  candidateName?: string;
}

export const MiniCVPreview: React.FC<MiniCVPreviewProps> = ({
  template,
  primaryColor = template.defaultThemeColor,
  candidateName = 'NGUYỄN MINH ANH',
}) => {
  const isTwoColumn = template.layoutType === 'two-column-left' || template.layoutType === 'two-column-right';
  const isTimeline = template.layoutType === 'timeline';
  const isGrid = template.layoutType === 'grid';
  const isAts = template.category === 'ats' || template.layoutType === 'single-column';

  return (
    <div className="w-full aspect-[210/297] bg-white rounded-lg border border-slate-200 overflow-hidden shadow-inner flex flex-col p-2.5 text-[6px] select-none pointer-events-none relative">
      {/* Mini Layout Archetypes */}
      {isTwoColumn ? (
        <div className="flex gap-1.5 h-full">
          {/* Left mini sidebar */}
          <div
            className="w-[32%] rounded p-1 flex flex-col gap-1 text-[5px]"
            style={{ backgroundColor: `${primaryColor}12`, borderTop: `2px solid ${primaryColor}` }}
          >
            {template.supportsPhoto && (
              <div
                className="w-5 h-5 rounded-full mx-auto border"
                style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}30` }}
              />
            )}
            <div className="h-1 bg-slate-300 rounded w-3/4 mx-auto" />
            <div className="h-0.5 bg-slate-200 rounded w-full mt-1" />
            <div className="h-0.5 bg-slate-200 rounded w-4/5" />
            <div className="h-0.5 bg-slate-200 rounded w-2/3" />
            <div className="mt-1 pt-1 border-t border-slate-200 flex flex-wrap gap-0.5">
              <span className="w-2.5 h-1 rounded" style={{ backgroundColor: primaryColor }} />
              <span className="w-3 h-1 bg-slate-300 rounded" />
              <span className="w-2 h-1 bg-slate-300 rounded" />
            </div>
          </div>

          {/* Right mini main area */}
          <div className="flex-1 flex flex-col gap-1.5 pt-0.5">
            <div>
              <div
                className="font-bold tracking-tight text-[6.5px] truncate"
                style={{ color: primaryColor }}
              >
                {candidateName}
              </div>
              <div className="h-1 bg-slate-400 rounded w-1/2 mt-0.5" />
            </div>
            {/* Section 1 */}
            <div className="space-y-0.5">
              <div className="h-1 rounded w-1/3" style={{ backgroundColor: primaryColor }} />
              <div className="h-0.5 bg-slate-200 rounded w-full" />
              <div className="h-0.5 bg-slate-200 rounded w-5/6" />
            </div>
            {/* Section 2 */}
            <div className="space-y-0.5">
              <div className="h-1 rounded w-2/5" style={{ backgroundColor: primaryColor }} />
              <div className="h-0.5 bg-slate-300 rounded w-full" />
              <div className="h-0.5 bg-slate-200 rounded w-4/5" />
              <div className="h-0.5 bg-slate-200 rounded w-3/4" />
            </div>
            {/* Section 3 */}
            <div className="space-y-0.5">
              <div className="h-1 rounded w-1/4" style={{ backgroundColor: primaryColor }} />
              <div className="h-0.5 bg-slate-200 rounded w-full" />
            </div>
          </div>
        </div>
      ) : isTimeline ? (
        <div className="flex flex-col gap-1.5 h-full">
          {/* Top Banner */}
          <div
            className="rounded p-1 text-white flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div>
              <div className="font-bold text-[6.5px] text-white truncate">{candidateName}</div>
              <div className="h-0.5 bg-white/70 rounded w-12 mt-0.5" />
            </div>
            {template.supportsPhoto && (
              <div className="w-4 h-4 rounded-full bg-white/30 border border-white" />
            )}
          </div>

          {/* Timeline Nodes */}
          <div className="flex-1 pl-2.5 relative before:content-[''] before:absolute before:left-1 before:top-1 before:bottom-1 before:w-[0.5px] before:bg-slate-300 flex flex-col justify-between py-1">
            <div className="relative">
              <div
                className="absolute -left-[5px] top-0.5 w-1.5 h-1.5 rounded-full border border-white"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="h-1 rounded w-1/3" style={{ backgroundColor: primaryColor }} />
              <div className="h-0.5 bg-slate-200 rounded w-4/5 mt-0.5" />
            </div>
            <div className="relative">
              <div
                className="absolute -left-[5px] top-0.5 w-1.5 h-1.5 rounded-full border border-white"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="h-1 rounded w-2/5" style={{ backgroundColor: primaryColor }} />
              <div className="h-0.5 bg-slate-200 rounded w-3/4 mt-0.5" />
            </div>
            <div className="relative">
              <div
                className="absolute -left-[5px] top-0.5 w-1.5 h-1.5 rounded-full border border-white"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="h-1 rounded w-1/4" style={{ backgroundColor: primaryColor }} />
              <div className="h-0.5 bg-slate-200 rounded w-2/3 mt-0.5" />
            </div>
          </div>
        </div>
      ) : isGrid ? (
        <div className="flex flex-col gap-1.5 h-full">
          <div className="border-b pb-1" style={{ borderColor: primaryColor }}>
            <div className="font-bold text-[6.5px] truncate" style={{ color: primaryColor }}>
              {candidateName}
            </div>
            <div className="h-0.5 bg-slate-400 rounded w-2/5 mt-0.5" />
          </div>

          {/* Grid project cards */}
          <div className="grid grid-cols-2 gap-1 flex-1">
            <div className="border rounded p-1 flex flex-col justify-between" style={{ borderColor: `${primaryColor}40` }}>
              <div className="h-1 rounded w-3/4" style={{ backgroundColor: primaryColor }} />
              <div className="h-0.5 bg-slate-200 rounded w-full" />
              <div className="h-0.5 bg-slate-200 rounded w-2/3" />
            </div>
            <div className="border rounded p-1 flex flex-col justify-between" style={{ borderColor: `${primaryColor}40` }}>
              <div className="h-1 rounded w-3/4" style={{ backgroundColor: primaryColor }} />
              <div className="h-0.5 bg-slate-200 rounded w-full" />
              <div className="h-0.5 bg-slate-200 rounded w-2/3" />
            </div>
            <div className="border rounded p-1 flex flex-col justify-between" style={{ borderColor: `${primaryColor}40` }}>
              <div className="h-1 rounded w-3/4" style={{ backgroundColor: primaryColor }} />
              <div className="h-0.5 bg-slate-200 rounded w-full" />
            </div>
            <div className="border rounded p-1 flex flex-col justify-between" style={{ borderColor: `${primaryColor}40` }}>
              <div className="h-1 rounded w-3/4" style={{ backgroundColor: primaryColor }} />
              <div className="h-0.5 bg-slate-200 rounded w-4/5" />
            </div>
          </div>
        </div>
      ) : (
        /* Single Column / Classic ATS */
        <div className="flex flex-col gap-1.5 h-full">
          <div className="text-center border-b pb-1 border-slate-200">
            <div className="font-black text-[7px] tracking-tight text-slate-900 truncate">
              {candidateName}
            </div>
            <div className="h-0.5 bg-slate-400 rounded w-1/3 mx-auto mt-0.5" />
            <div className="h-0.5 bg-slate-300 rounded w-1/2 mx-auto mt-0.5" />
          </div>

          <div className="space-y-1 flex-1">
            <div className="border-b pb-0.5" style={{ borderColor: `${primaryColor}50` }}>
              <div className="h-1 rounded w-1/4 font-bold" style={{ backgroundColor: primaryColor }} />
            </div>
            <div className="h-0.5 bg-slate-200 rounded w-full" />
            <div className="h-0.5 bg-slate-200 rounded w-5/6" />

            <div className="border-b pb-0.5 pt-0.5" style={{ borderColor: `${primaryColor}50` }}>
              <div className="h-1 rounded w-1/3 font-bold" style={{ backgroundColor: primaryColor }} />
            </div>
            <div className="h-0.5 bg-slate-300 rounded w-full" />
            <div className="h-0.5 bg-slate-200 rounded w-4/5" />
            <div className="h-0.5 bg-slate-200 rounded w-3/4" />

            <div className="border-b pb-0.5 pt-0.5" style={{ borderColor: `${primaryColor}50` }}>
              <div className="h-1 rounded w-1/4 font-bold" style={{ backgroundColor: primaryColor }} />
            </div>
            <div className="h-0.5 bg-slate-200 rounded w-full" />
          </div>
        </div>
      )}

      {/* ATS Score Tag */}
      <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-slate-900/80 text-[5px] text-white font-bold backdrop-blur-2xs">
        ATS {template.atsScore}%
      </div>
    </div>
  );
};
