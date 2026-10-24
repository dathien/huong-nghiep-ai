import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  FileText,
  Mic,
  Route,
  Briefcase,
  X,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { AppTab } from '../types';

export type MascotState = 'idle' | 'welcome' | 'thinking' | 'guiding' | 'success';

interface ChiAnCharacterProps {
  state?: MascotState;
  height?: number;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * Pure SVG Mascot: CHỊ AN – TRỢ LÝ HƯỚNG NGHIỆP
 * Style: Premium Anime Chibi 2D
 * - Big head, chubby soft round cheeks, petite balanced chibi body
 * - Large sparkling anime purple/violet eyes with dual highlights and winged lashes
 * - Deep purple-brown hair, shoulder-length, with cute top mini bun (búi tóc nhỏ) & hair tie
 * - Blue blazer, white shirt, pastel orange ribbon bow (nơ cổ cam nhạt), navy pleated skirt
 * - White ankle socks with cute ruffled cuffs, glossy black Mary Jane office shoes
 * - Left hand holds digital tablet with CV icon & green checkmark
 * - Right hand animated for: Welcome (wave), Thinking (chin touch), Guiding (point), Success (thumbs up), Idle
 */
export const ChiAnCharacter: React.FC<ChiAnCharacterProps> = ({
  state = 'idle',
  height = 180,
  className = '',
  onClick,
  interactive = true,
}) => {
  // Proportional width based on 300 x 400 viewBox (0.75 aspect ratio)
  const width = Math.round(height * (300 / 400));

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none transition-transform ${
        interactive ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.97]' : ''
      } ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
      title="Chị An – Trợ lý hướng nghiệp (Nhấn để tương tác)"
      role="img"
      aria-label={`Chị An Anime Chibi ở trạng thái ${state}`}
    >
      <svg
        viewBox="0 0 300 400"
        width={width}
        height={height}
        className="w-full h-full overflow-visible drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 1. Peach Luminous Skin Gradients */}
          <linearGradient id="chibiSkinGrad" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#FFFBF7" />
            <stop offset="50%" stopColor="#FDEEE3" />
            <stop offset="100%" stopColor="#FBDAC3" />
          </linearGradient>

          {/* 2. Deep Purple-Brown Hair Gradients */}
          <linearGradient id="chibiHairGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#4E2E61" />
            <stop offset="45%" stopColor="#361E44" />
            <stop offset="100%" stopColor="#20112A" />
          </linearGradient>

          {/* 3. Anime Purple Eyes Radial Gradient */}
          <radialGradient id="chibiIrisGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="25%" stopColor="#A855F7" />
            <stop offset="55%" stopColor="#7E22CE" />
            <stop offset="85%" stopColor="#4C1D95" />
            <stop offset="100%" stopColor="#1E0A38" />
          </radialGradient>

          {/* 4. Royal Blue Chibi Blazer Gradients */}
          <linearGradient id="chibiBlazerGrad" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="40%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="chibiLapelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>

          {/* 5. Orange Ribbon Bow Gradients */}
          <linearGradient id="chibiBowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="50%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* 6. Navy Pleated Skirt Gradients */}
          <linearGradient id="chibiSkirtGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* 7. Glossy Black Mary Jane Shoes */}
          <linearGradient id="chibiShoeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* 8. Digital Tablet Screen */}
          <linearGradient id="chibiTabletScreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>

        {/* 1. Floor Drop Shadow */}
        <ellipse
          cx="150"
          cy="386"
          rx={state === 'success' ? '74' : '66'}
          ry="8.5"
          fill="#64748B"
          opacity="0.25"
        />

        {/* Floating Stars in SUCCESS State */}
        {state === 'success' && (
          <g className="anim-chian-stars">
            {/* Golden Star Left */}
            <path
              d="M 45 95 Q 49 84 60 80 Q 49 76 45 65 Q 41 76 30 80 Q 41 84 45 95 Z"
              fill="#F59E0B"
            />
            {/* Emerald Star Right */}
            <path
              d="M 255 85 Q 259 74 270 70 Q 259 66 255 55 Q 251 66 240 70 Q 251 74 255 85 Z"
              fill="#10B981"
            />
            {/* Violet Star Right */}
            <path
              d="M 245 155 Q 248 147 256 145 Q 248 143 245 135 Q 242 143 234 145 Q 242 147 245 155 Z"
              fill="#8B5CF6"
            />
            <circle cx="35" cy="125" r="3.5" fill="#F59E0B" />
            <circle cx="265" cy="115" r="3" fill="#3B82F6" />
          </g>
        )}

        {/* Thought Bubbles in THINKING State */}
        {state === 'thinking' && (
          <g>
            <circle cx="218" cy="65" r="4.5" fill="#A855F7" opacity="0.65" />
            <circle cx="232" cy="48" r="7.5" fill="#9333EA" opacity="0.75" />
            <g transform="translate(230, 8)">
              <circle cx="20" cy="20" r="20" fill="#FAF5FF" stroke="#9333EA" strokeWidth="2.2" />
              {/* Question / Idea in Thought Bubble */}
              <path
                d="M 15 14 C 15 9 25 9 25 14 C 25 18 21 19 21 23"
                stroke="#7E22CE"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="20.5" cy="27.5" r="1.6" fill="#7E22CE" />
            </g>
          </g>
        )}

        {/* 2. Main Chibi Body with Breathing Motion */}
        <g className="anim-chian-breathe">
          {/* A. HAIR BACK (Shoulder-length deep purple-brown volume with cute inward curls) */}
          <g>
            {/* Left Hair Mass */}
            <path
              d="M 90 70 C 50 100 45 150 50 200 C 53 230 75 240 105 235 C 95 210 92 180 94 150 Z"
              fill="url(#chibiHairGrad)"
            />
            {/* Right Hair Mass */}
            <path
              d="M 210 70 C 250 100 255 150 250 200 C 247 230 225 240 195 235 C 205 210 208 180 206 150 Z"
              fill="url(#chibiHairGrad)"
            />
            {/* Center Hair Nape behind neck */}
            <path
              d="M 85 80 C 120 70 180 70 215 80 C 225 140 220 200 195 235 C 165 242 135 242 105 235 C 80 200 75 140 85 80 Z"
              fill="#1E1124"
            />
          </g>

          {/* B. CHIBI LEGS, RUFFLED SOCKS & MARY JANE SHOES */}
          <g>
            {/* Left Leg (Warm peach skin) */}
            <rect x="122" y="282" width="18" height="74" rx="9" fill="url(#chibiSkinGrad)" />
            {/* Left Sock (White with ruffled cuff) */}
            <path d="M 120 348 C 120 344 142 344 142 348 L 141 366 L 121 366 Z" fill="#FFFFFF" />
            <path d="M 119 347 Q 124 344 131 347 Q 138 344 143 347" stroke="#E2E8F0" strokeWidth="1.6" fill="none" />
            {/* Left Mary Jane Shoe (Rounded gloss black with strap) */}
            <path
              d="M 113 363 C 113 358 120 355 131 355 C 142 355 147 360 146 368 C 144 376 138 381 126 380 C 117 379 113 373 113 363 Z"
              fill="url(#chibiShoeGrad)"
            />
            {/* Shoe Strap & Button */}
            <path d="M 119 360 Q 131 363 143 360" stroke="#334155" strokeWidth="2.5" fill="none" />
            <circle cx="123" cy="361" r="1.5" fill="#E2E8F0" />
            {/* Shoe Gloss Highlight */}
            <path d="M 120 374 Q 128 376 136 373" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />

            {/* Right Leg */}
            <rect x="160" y="282" width="18" height="74" rx="9" fill="url(#chibiSkinGrad)" />
            {/* Right Sock */}
            <path d="M 158 348 C 158 344 180 344 180 348 L 179 366 L 159 366 Z" fill="#FFFFFF" />
            <path d="M 157 347 Q 162 344 169 347 Q 176 344 181 347" stroke="#E2E8F0" strokeWidth="1.6" fill="none" />
            {/* Right Mary Jane Shoe */}
            <path
              d="M 154 363 C 153 358 158 355 169 355 C 180 355 187 358 187 363 C 187 373 183 379 174 380 C 162 381 156 376 154 363 Z"
              fill="url(#chibiShoeGrad)"
            />
            {/* Shoe Strap & Button */}
            <path d="M 157 360 Q 169 363 181 360" stroke="#334155" strokeWidth="2.5" fill="none" />
            <circle cx="177" cy="361" r="1.5" fill="#E2E8F0" />
            {/* Shoe Gloss Highlight */}
            <path d="M 164 373 Q 172 376 180 374" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />
          </g>

          {/* C. NAVY PLEATED SKIRT (Chibi flaring silhouette) */}
          <g>
            <path
              d="M 118 248 C 135 250 165 250 182 248 C 196 265 208 288 214 294 C 180 299 120 299 86 294 C 92 288 104 265 118 248 Z"
              fill="url(#chibiSkirtGrad)"
            />
            {/* Skirt Pleat Shadows */}
            <path d="M 112 254 L 102 294" stroke="#0F172A" strokeWidth="1.5" opacity="0.5" />
            <path d="M 132 251 L 130 296" stroke="#0F172A" strokeWidth="1.5" opacity="0.5" />
            <path d="M 150 251 L 150 297" stroke="#0F172A" strokeWidth="1.5" opacity="0.5" />
            <path d="M 168 251 L 170 296" stroke="#0F172A" strokeWidth="1.5" opacity="0.5" />
            <path d="M 188 254 L 198 294" stroke="#0F172A" strokeWidth="1.5" opacity="0.5" />
          </g>

          {/* D. WHITE SHIRT, ORANGE RIBBON BOW & BLUE BLAZER */}
          <g>
            {/* White Blouse Center */}
            <path d="M 134 182 L 166 182 L 158 248 L 142 248 Z" fill="#FFFFFF" />

            {/* Blue Blazer Main Body (Curved cute chibi proportions) */}
            <path
              d="M 102 190 C 104 215 106 238 108 254 C 132 258 168 258 192 254 C 194 238 196 215 198 190 C 175 186 125 186 102 190 Z"
              fill="url(#chibiBlazerGrad)"
            />

            {/* White Rounded Peter Pan Collar */}
            <path
              d="M 124 178 C 122 192 136 195 148 188 L 148 180 Z"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <path
              d="M 176 178 C 178 192 164 195 152 188 L 152 180 Z"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1"
            />

            {/* Nơ cổ màu cam nhạt (Chibi Orange Ribbon Bow) */}
            <g transform="translate(150, 190)">
              {/* Left Loop */}
              <path
                d="M 0 0 C -8 -7 -18 -3 -15 4 C -12 10 -4 3 0 0 Z"
                fill="url(#chibiBowGrad)"
              />
              {/* Right Loop */}
              <path
                d="M 0 0 C 8 -7 18 -3 15 4 C 12 10 4 3 0 0 Z"
                fill="url(#chibiBowGrad)"
              />
              {/* Left Ribbon Tail */}
              <path
                d="M -3 3 L -11 15 L -6 13 L -1 5 Z"
                fill="#EA580C"
              />
              {/* Right Ribbon Tail */}
              <path
                d="M 3 3 L 11 15 L 6 13 L 1 5 Z"
                fill="#EA580C"
              />
              {/* Center Ribbon Knot */}
              <circle cx="0" cy="0" r="3.8" fill="#F97316" stroke="#C2410C" strokeWidth="0.8" />
            </g>

            {/* Blazer Rounded Lapels */}
            <path
              d="M 126 190 L 118 222 L 140 236 L 144 200 Z"
              fill="url(#chibiLapelGrad)"
            />
            <path
              d="M 174 190 L 182 222 L 160 236 L 156 200 Z"
              fill="url(#chibiLapelGrad)"
            />

            {/* Center Button */}
            <circle cx="150" cy="242" r="3.2" fill="#F8FAFC" stroke="#1D4ED8" strokeWidth="0.8" />
            <circle cx="149" cy="241" r="1" fill="#FFFFFF" />

            {/* Left Chest Pocket with Silver Pen Clip */}
            <line x1="114" y1="216" x2="128" y2="218" stroke="#1E40AF" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="118" y1="213" x2="119" y2="218" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* E. LEFT ARM & DIGITAL TABLET (with CV & green checkmark) */}
          <g>
            {/* Left Blazer Sleeve */}
            <path
              d="M 102 192 C 86 210 80 226 84 246 C 92 250 98 244 100 238 C 98 224 102 210 110 198 Z"
              fill="url(#chibiBlazerGrad)"
            />
            {/* White Cuff */}
            <rect x="80" y="244" width="14" height="4.5" rx="2" fill="#FFFFFF" transform="rotate(-15 80 244)" />
            {/* Cute Chibi Hand holding tablet */}
            <circle cx="82" cy="254" r="8" fill="url(#chibiSkinGrad)" />
            <ellipse cx="86" cy="252" rx="3.5" ry="5" fill="url(#chibiSkinGrad)" />

            {/* Digital Tablet Chassis */}
            <g transform="rotate(-10 88 250)">
              <rect
                x="52"
                y="226"
                width="40"
                height="54"
                rx="6"
                fill="#1E293B"
                stroke="#475569"
                strokeWidth="1.2"
              />
              {/* Screen */}
              <rect
                x="55.5"
                y="229.5"
                width="33"
                height="47"
                rx="4"
                fill="url(#chibiTabletScreenGrad)"
              />
              {/* Header Bar */}
              <rect x="58" y="233" width="28" height="5" rx="2" fill="#2563EB" />
              {/* Mini CV Icon */}
              <rect x="59" y="242" width="9" height="11" rx="1.5" fill="#EEF2F6" stroke="#94A3B8" strokeWidth="0.8" />
              <line x1="61" y1="245" x2="66" y2="245" stroke="#2563EB" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="61" y1="248" x2="66" y2="248" stroke="#64748B" strokeWidth="0.9" strokeLinecap="round" />
              <line x1="61" y1="251" x2="65" y2="251" stroke="#64748B" strokeWidth="0.9" strokeLinecap="round" />
              {/* Green Checkmark Badge */}
              <circle cx="79" cy="247" r="7.5" fill="#10B981" />
              <path
                d="M 75.5 247 L 78 249.5 L 82.5 244.5"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Notes lines */}
              <line x1="59" y1="258" x2="84" y2="258" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
              <line x1="59" y1="264" x2="78" y2="264" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="59" y1="269" x2="72" y2="269" stroke="#E2E8F0" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          </g>

          {/* F. RIGHT ARM (5 States) */}
          {state === 'welcome' ? (
            /* State 1: WELCOME (Warm, friendly waving hand animation) */
            <g className="anim-chian-wave">
              <path
                d="M 198 192 C 218 202 232 200 230 180 C 228 170 234 165 240 162 C 246 165 246 172 240 185 C 230 206 218 220 208 225 Z"
                fill="url(#chibiBlazerGrad)"
              />
              <rect x="232" y="160" width="12" height="4.5" rx="2" fill="#FFFFFF" transform="rotate(-25 232 160)" />
              {/* Waving Chibi Mitten Palm */}
              <g transform="translate(238, 140)">
                <circle cx="8" cy="10" r="9.5" fill="url(#chibiSkinGrad)" />
                {/* Thumb */}
                <ellipse cx="0" cy="12" rx="3.5" ry="4.5" fill="url(#chibiSkinGrad)" />
                {/* Tapered Chibi Fingers */}
                <rect x="2" y="-1" width="3.2" height="8" rx="1.6" fill="url(#chibiSkinGrad)" />
                <rect x="6.5" y="-3" width="3.2" height="9.5" rx="1.6" fill="url(#chibiSkinGrad)" />
                <rect x="11" y="-1.5" width="3.2" height="8.5" rx="1.6" fill="url(#chibiSkinGrad)" />
                <rect x="15" y="1" width="2.8" height="6.5" rx="1.4" fill="url(#chibiSkinGrad)" />
              </g>
            </g>
          ) : state === 'thinking' ? (
            /* State 2: THINKING (Hand touching chubby cheek) */
            <g>
              <path
                d="M 198 192 C 220 206 220 190 208 170 C 202 160 198 152 190 148 C 186 154 194 160 200 170 C 208 190 206 208 200 218 Z"
                fill="url(#chibiBlazerGrad)"
              />
              <rect x="190" y="148" width="10" height="4" rx="2" fill="#FFFFFF" transform="rotate(-30 190 148)" />
              <circle cx="186" cy="144" r="7.5" fill="url(#chibiSkinGrad)" />
              <ellipse cx="183" cy="138" rx="2.8" ry="4.5" fill="url(#chibiSkinGrad)" />
            </g>
          ) : state === 'guiding' ? (
            /* State 3: GUIDING (Hand guiding forward/right) */
            <g>
              <path
                d="M 198 192 C 224 200 238 202 248 202 C 252 208 246 216 238 216 C 222 215 208 218 204 220 Z"
                fill="url(#chibiBlazerGrad)"
              />
              <rect x="242" y="202" width="10" height="4.5" rx="2" fill="#FFFFFF" />
              <circle cx="254" cy="206" r="8" fill="url(#chibiSkinGrad)" />
              <rect x="256" y="203" width="12" height="5" rx="2.5" fill="url(#chibiSkinGrad)" />
            </g>
          ) : state === 'success' ? (
            /* State 4: SUCCESS (Thumbs Up celebration) */
            <g>
              <path
                d="M 198 192 C 220 200 228 186 226 168 C 232 170 234 176 232 184 C 222 206 212 218 208 222 Z"
                fill="url(#chibiBlazerGrad)"
              />
              <rect x="222" y="166" width="11" height="4.5" rx="2" fill="#FFFFFF" transform="rotate(-20 222 166)" />
              <circle cx="228" cy="160" r="8.5" fill="url(#chibiSkinGrad)" />
              {/* Thumb Up */}
              <rect x="225" y="146" width="5.5" height="13" rx="2.75" fill="url(#chibiSkinGrad)" />
            </g>
          ) : (
            /* State 5: IDLE (Hand resting on hip/skirt) */
            <g>
              <path
                d="M 198 192 C 212 212 212 230 210 246 C 206 250 196 248 196 240 C 198 224 196 210 194 200 Z"
                fill="url(#chibiBlazerGrad)"
              />
              <rect x="202" y="244" width="9" height="4" rx="2" fill="#FFFFFF" />
              <circle cx="206" cy="252" r="7.5" fill="url(#chibiSkinGrad)" />
            </g>
          )}

          {/* G. HEAD, FACE, ANIME EYES, HAIR & MINI BUN */}
          <g
            className={
              state === 'welcome' || state === 'thinking'
                ? 'anim-chian-head-tilt'
                : state === 'guiding' || state === 'success'
                ? 'anim-chian-nod'
                : ''
            }
          >
            {/* Short Cute Neck */}
            <path d="M 140 166 L 140 182 L 160 182 L 160 166 Z" fill="url(#chibiSkinGrad)" />
            <ellipse cx="150" cy="172" rx="12" ry="4" fill="#F8C4A5" opacity="0.6" />

            {/* Chubby Round Chibi Face */}
            <path
              d="M 88 112 C 86 142 98 170 128 173 C 142 174 158 174 172 173 C 202 170 214 142 212 112 C 212 68 190 56 150 56 C 110 56 88 68 88 112 Z"
              fill="url(#chibiSkinGrad)"
            />

            {/* Soft Rosy Blush & Diagonal Anime Dashes */}
            <g>
              <ellipse cx="106" cy="142" rx="14" ry="7.5" fill="#FF8BA7" opacity="0.5" />
              <line x1="100" y1="140" x2="105" y2="145" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="106" y1="140" x2="111" y2="145" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />

              <ellipse cx="194" cy="142" rx="14" ry="7.5" fill="#FF8BA7" opacity="0.5" />
              <line x1="188" y1="140" x2="193" y2="145" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="194" y1="140" x2="199" y2="145" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Cute Tiny Button Nose */}
            <circle cx="150" cy="138" r="1.5" fill="#F8C4A5" />
            <circle cx="149.5" cy="137.5" r="0.6" fill="#FFFFFF" />

            {/* Sweet Smile */}
            {state === 'success' ? (
              /* Happy big open smile */
              <g>
                <path d="M 138 147 Q 150 167 162 147 Z" fill="#E11D48" stroke="#BE123C" strokeWidth="1.2" />
                <path d="M 141 148 Q 150 152 159 148 Z" fill="#FFFFFF" />
                <path d="M 143 158 Q 150 162 157 158" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            ) : state === 'thinking' ? (
              /* Curious gentle smile */
              <path d="M 143 150 Q 150 154 157 150" stroke="#E11D48" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            ) : (
              /* Adorable open chibi smile */
              <g>
                <path d="M 139 148 Q 150 164 161 148 Z" fill="#E11D48" stroke="#BE123C" strokeWidth="1" />
                <path d="M 142 149 Q 150 153 158 149 Z" fill="#FFFFFF" />
                <path d="M 144 156 Q 150 160 156 156" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* SPARKLING ANIME PURPLE EYES */}
            <g className="anim-chian-blink">
              {/* LEFT EYE */}
              <g>
                {/* Sclera */}
                <path
                  d="M 94 122 C 94 100 130 100 130 122 C 130 144 94 144 94 122 Z"
                  fill="#FFFFFF"
                />
                {/* Upper Sclera Soft Lavender Shadow */}
                <path d="M 94 120 C 96 108 128 108 130 120 Z" fill="#E2E8F4" />
                {/* Iris */}
                <circle cx={state === 'thinking' ? '114' : '112'} cy={state === 'thinking' ? '121' : '122'} r="16.5" fill="url(#chibiIrisGrad)" />
                {/* Pupil */}
                <circle cx={state === 'thinking' ? '114' : '112'} cy={state === 'thinking' ? '121' : '122'} r="8.5" fill="#150824" />
                {/* Bottom Crescent Amethyst Glow */}
                <path
                  d="M 100 128 C 103 136 121 136 124 128 C 121 134 103 134 100 128 Z"
                  fill="#C084FC"
                  opacity="0.85"
                />
                {/* Big Sparkle Highlight (Top Right) */}
                <circle cx={state === 'thinking' ? '120' : '118'} cy="115" r="4.8" fill="#FFFFFF" />
                {/* Small Sparkle Highlight (Bottom Left) */}
                <circle cx={state === 'thinking' ? '108' : '106'} cy="129" r="2.8" fill="#FFFFFF" />
                {/* Micro Twinkle Dot */}
                <circle cx="119" cy="127" r="1.3" fill="#E9D5FF" />
                {/* Thick Upper Eyelash Line with winged flick */}
                <path
                  d="M 90 120 Q 112 98 134 120"
                  stroke="#23152B"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 132 118 Q 138 114 141 109"
                  stroke="#23152B"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Double Eyelid Crease */}
                <path d="M 98 102 Q 112 96 126 102" stroke="#E5A67C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </g>

              {/* RIGHT EYE */}
              <g>
                {/* Sclera */}
                <path
                  d="M 170 122 C 170 100 206 100 206 122 C 206 144 170 144 170 122 Z"
                  fill="#FFFFFF"
                />
                {/* Upper Sclera Soft Lavender Shadow */}
                <path d="M 170 120 C 172 108 204 108 206 120 Z" fill="#E2E8F4" />
                {/* Iris */}
                <circle cx={state === 'thinking' ? '190' : '188'} cy={state === 'thinking' ? '121' : '122'} r="16.5" fill="url(#chibiIrisGrad)" />
                {/* Pupil */}
                <circle cx={state === 'thinking' ? '190' : '188'} cy={state === 'thinking' ? '121' : '122'} r="8.5" fill="#150824" />
                {/* Bottom Crescent Amethyst Glow */}
                <path
                  d="M 176 128 C 179 136 197 136 200 128 C 197 134 179 134 176 128 Z"
                  fill="#C084FC"
                  opacity="0.85"
                />
                {/* Big Sparkle Highlight (Top Right) */}
                <circle cx={state === 'thinking' ? '196' : '194'} cy="115" r="4.8" fill="#FFFFFF" />
                {/* Small Sparkle Highlight (Bottom Left) */}
                <circle cx={state === 'thinking' ? '184' : '182'} cy="129" r="2.8" fill="#FFFFFF" />
                {/* Micro Twinkle Dot */}
                <circle cx="195" cy="127" r="1.3" fill="#E9D5FF" />
                {/* Thick Upper Eyelash Line with winged flick */}
                <path
                  d="M 166 120 Q 188 98 210 120"
                  stroke="#23152B"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 208 118 Q 214 114 217 109"
                  stroke="#23152B"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Double Eyelid Crease */}
                <path d="M 174 102 Q 188 96 202 102" stroke="#E5A67C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </g>
            </g>

            {/* Eyebrows */}
            {state === 'thinking' ? (
              <g stroke="#3A2248" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 96 90 Q 112 84 126 89" />
                <path d="M 174 86 Q 188 80 204 87" />
              </g>
            ) : (
              <g stroke="#3A2248" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 96 88 Q 112 80 128 86" />
                <path d="M 172 86 Q 188 80 204 88" />
              </g>
            )}

            {/* H. HAIR FRONT, BANGS, SIDE LOCKS & MINI BUN */}
            {/* Front Hair Dome */}
            <path
              d="M 82 105 C 80 50 110 35 150 35 C 190 35 220 50 218 105 C 210 75 190 62 150 62 C 110 62 90 75 82 105 Z"
              fill="url(#chibiHairGrad)"
            />

            {/* BÚI TÓC NHỎ TRÊN ĐỈNH ĐẦU (Top Mini Bun / Odango) */}
            <g transform="translate(138, 30)">
              {/* Bun Shadow behind */}
              <circle cx="0" cy="0" r="20" fill="#1E1124" />
              {/* Bun Body with gradient */}
              <circle cx="0" cy="0" r="18.5" fill="url(#chibiHairGrad)" />
              {/* Hair Swirls inside Bun */}
              <path d="M -9 4 C -7 -10 10 -10 12 2 C 10 9 0 10 -4 4" stroke="#6D437D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M -3 -6 C 4 -7 7 -2 5 2" stroke="#8B5A9E" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              {/* Cute Ribbon / Hair Tie on Bun */}
              <ellipse cx="0" cy="16" rx="9" ry="3.5" fill="#FB923C" stroke="#EA580C" strokeWidth="1" />
            </g>

            {/* Side-Swept Bangs (Soft layered strands across forehead) */}
            <g>
              {/* Left Bang */}
              <path
                d="M 84 96 C 92 78 106 72 120 78 C 132 84 135 98 132 108 C 122 96 108 92 96 98 Z"
                fill="#331D3F"
              />
              {/* Center Bang */}
              <path
                d="M 112 62 C 128 58 142 66 150 82 C 158 98 152 110 148 116 C 146 102 142 90 128 80 Z"
                fill="#3D244C"
              />
              {/* Right Bang */}
              <path
                d="M 148 68 C 160 62 178 68 186 84 C 194 98 190 112 186 118 C 182 102 174 90 162 82 Z"
                fill="#331D3F"
              />
              {/* Outer Far Right Bang */}
              <path
                d="M 184 76 C 196 74 208 82 216 98 C 212 92 202 88 194 94 Z"
                fill="#2A1635"
              />

              {/* Anime Hair Sheen / Angel Ring Highlight Band */}
              <path
                d="M 98 78 Q 150 64 202 78"
                stroke="#935DA6"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 106 82 Q 150 70 194 82"
                stroke="#C084FC"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.75"
              />
            </g>

            {/* Face-framing Side Locks (curling softly inward) */}
            <path
              d="M 85 95 C 78 120 76 150 86 175 C 89 160 88 135 92 112 Z"
              fill="url(#chibiHairGrad)"
            />
            <path
              d="M 215 95 C 222 120 224 150 214 175 C 211 160 212 135 208 112 Z"
              fill="url(#chibiHairGrad)"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

interface ChiAnCardProps {
  onNavigateTab: (tab: AppTab) => void;
}

/**
 * Dedicated Card for Dashboard:
 * "CHỊ AN – NGƯỜI BẠN ĐỒNG HÀNH"
 * Slogan: "Chị An đồng hành – Vững bước tương lai!"
 * Embedded neatly into Dashboard layout (not floating over screen).
 */
export const ChiAnCard: React.FC<ChiAnCardProps> = ({ onNavigateTab }) => {
  const [activeState, setActiveState] = useState<MascotState>('welcome');
  const [showBubble, setShowBubble] = useState(true);

  const stateMessages: Record<MascotState, { title: string; desc: string }> = {
    welcome: {
      title: 'Chào em! Chị là An 👋',
      desc: 'Chị sẽ đồng hành cùng em khám phá năng lực, xây dựng CV và chuẩn bị cho những cơ hội nghề nghiệp đầu tiên nhé!',
    },
    thinking: {
      title: 'Cùng phân tích hướng đi phù hợp 💡',
      desc: 'Mỗi ngành nghề đều có những tiêu chuẩn tuyển dụng riêng. Chị sẽ giúp em định vị thế mạnh và bổ sung các kỹ năng còn thiếu.',
    },
    guiding: {
      title: 'Chị gợi ý hoạt động tiếp theo cho em 🧭',
      desc: 'Chưa có kinh nghiệm cũng đừng lo! Em hãy bắt đầu từ các đồ án môn học hoặc tham gia một buổi phỏng vấn thử 1-1 với chị nhé.',
    },
    success: {
      title: 'Làm tốt lắm em! Chúc mừng em 🎉',
      desc: 'Mỗi kỹ năng em tích lũy hôm nay đều là bước đệm vững chắc giúp em tự tin nhận offer từ các nhà tuyển dụng hàng đầu.',
    },
    idle: {
      title: 'Chị An luôn sẵn sàng hỗ trợ em 🚀',
      desc: 'Bất cứ khi nào em cần chỉnh sửa CV, đối chiếu từ khóa JD hay luyện phỏng vấn, cứ nhắn chị bất cứ lúc nào nhé!',
    },
  };

  const currentMsg = stateMessages[activeState];

  return (
    <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white border border-blue-200/90 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-100/50 pointer-events-none blur-2xl" />

      {/* Header Tag */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-blue-100/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black tracking-wider text-blue-900 uppercase">
              CHỊ AN – NGƯỜI BẠN ĐỒNG HÀNH
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-blue-600">
              • “Chị An đồng hành – Vững bước tương lai!”
            </span>
          </div>
        </div>

        {/* State Interactive Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-white/80 border border-blue-100 rounded-xl p-1 text-[11px] font-bold text-slate-600">
          {(['welcome', 'guiding', 'thinking', 'success'] as MascotState[]).map((st) => (
            <button
              key={st}
              onClick={() => {
                setActiveState(st);
                setShowBubble(true);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer capitalize ${
                activeState === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-blue-50 text-slate-600'
              }`}
            >
              {st === 'welcome'
                ? 'Chào em'
                : st === 'guiding'
                ? 'Hướng dẫn'
                : st === 'thinking'
                ? 'Suy ngẫm'
                : 'Chúc mừng'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left = Speech / Content / 5 Action Buttons, Right = Full-Body Chị An */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column (8 of 12) */}
        <div className="md:col-span-8 space-y-4">
          {showBubble && (
            <div className="relative bg-white border border-blue-200 rounded-2xl p-4 shadow-xs space-y-2 animate-fade-in">
              {/* Speech triangle pointing right on desktop */}
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white drop-shadow-xs" />

              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {currentMsg.title}
                </h4>
                <button
                  onClick={() => setShowBubble(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Đóng bong bóng hướng dẫn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {currentMsg.desc}
              </p>
            </div>
          )}

          {/* 5 Interactive Activity Direction Buttons (Em muốn chị hỗ trợ nội dung nào hôm nay?) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Em muốn chị hỗ trợ nội dung nào hôm nay?
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => onNavigateTab('self-discovery')}
                className="p-2.5 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 rounded-xl transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <Compass className="w-4 h-4 text-blue-600 group-hover:text-white mb-1.5 transition-colors" />
                <div>
                  <div className="text-xs font-bold leading-tight">Khám phá bản thân</div>
                  <div className="text-[10px] text-slate-500 group-hover:text-blue-100 mt-0.5">
                    Holland Code
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('career-explore')}
                className="p-2.5 bg-white hover:bg-sky-600 hover:text-white border border-slate-200 hover:border-sky-600 rounded-xl transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <Briefcase className="w-4 h-4 text-sky-600 group-hover:text-white mb-1.5 transition-colors" />
                <div>
                  <div className="text-xs font-bold leading-tight">Tìm hiểu nghề nghiệp</div>
                  <div className="text-[10px] text-slate-500 group-hover:text-sky-100 mt-0.5">
                    Xu hướng & JD
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('cv-builder')}
                className="p-2.5 bg-white hover:bg-teal-600 hover:text-white border border-slate-200 hover:border-teal-600 rounded-xl transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <FileText className="w-4 h-4 text-teal-600 group-hover:text-white mb-1.5 transition-colors" />
                <div>
                  <div className="text-xs font-bold leading-tight">Tạo CV đầu tiên</div>
                  <div className="text-[10px] text-slate-500 group-hover:text-teal-100 mt-0.5">
                    Chuẩn ATS
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('interview-practice')}
                className="p-2.5 bg-white hover:bg-purple-600 hover:text-white border border-slate-200 hover:border-purple-600 rounded-xl transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <Mic className="w-4 h-4 text-purple-600 group-hover:text-white mb-1.5 transition-colors" />
                <div>
                  <div className="text-xs font-bold leading-tight">Luyện phỏng vấn</div>
                  <div className="text-[10px] text-slate-500 group-hover:text-purple-100 mt-0.5">
                    Phỏng vấn Chị An
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('career-roadmap')}
                className="p-2.5 bg-white hover:bg-amber-600 hover:text-white border border-slate-200 hover:border-amber-600 rounded-xl transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <Route className="w-4 h-4 text-amber-600 group-hover:text-white mb-1.5 transition-colors" />
                <div>
                  <div className="text-xs font-bold leading-tight">Xem lộ trình</div>
                  <div className="text-[10px] text-slate-500 group-hover:text-amber-100 mt-0.5">
                    Kế hoạch 4 năm
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 of 12): Full-Body Chị An Character */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          <div className="p-2 relative flex flex-col items-center">
            {/* Desktop height ~200px (width 150px), Mobile ~130px (width 98px) */}
            <div className="hidden sm:block">
              <ChiAnCharacter
                state={activeState}
                height={200}
                onClick={() => {
                  const states: MascotState[] = ['welcome', 'thinking', 'guiding', 'success'];
                  const nextIdx = (states.indexOf(activeState) + 1) % states.length;
                  setActiveState(states[nextIdx]);
                  setShowBubble(true);
                }}
              />
            </div>
            <div className="sm:hidden">
              <ChiAnCharacter
                state={activeState}
                height={130}
                onClick={() => setShowBubble(true)}
              />
            </div>

            <p className="text-[11px] font-bold text-blue-700 mt-1">
              Nhấn vào Chị An để tương tác
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ChiAnGuideProps {
  activeTab: AppTab;
  onNavigateTab?: (tab: AppTab) => void;
}

/**
 * Contextual Guidance Banner for Functional Tabs
 * Displays Chị An (~120px) with genuine Recruiter advice using "Chị – Em" phrasing.
 */
export const ChiAnGuide: React.FC<ChiAnGuideProps> = ({ activeTab, onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [characterState, setCharacterState] = useState<MascotState>('guiding');

  const getGuidance = () => {
    switch (activeTab) {
      case 'self-discovery':
        return {
          title: 'Khám phá bản thân',
          text: 'Em hãy trả lời theo đúng suy nghĩ của mình. Không có lựa chọn nào khiến em trở nên kém giá trị hơn người khác đâu nhé!',
          actionText: 'Xem hồ sơ năng lực',
          actionTab: 'competency-profile' as AppTab,
        };
      case 'career-explore':
        return {
          title: 'Khám phá nghề nghiệp',
          text: 'Em đang quan tâm ngành nghề nào? Chị sẽ giúp em tìm hiểu những kỹ năng cần thiết và mức lương khởi điểm nhé.',
          actionText: 'Tạo CV ứng tuyển',
          actionTab: 'cv-builder' as AppTab,
        };
      case 'competency-profile':
        return {
          title: 'Hồ sơ năng lực',
          text: 'Em hãy cập nhật những kỹ năng và sản phẩm học tập mình đã thực hiện nhé! Đồ án trường lớp cũng là điểm cộng rất lớn trong mắt nhà tuyển dụng.',
          actionText: 'Đồng bộ sang CV',
          actionTab: 'cv-builder' as AppTab,
        };
      case 'cv-builder':
        return {
          title: 'Thiết kế CV chuẩn ATS',
          text: 'Chưa có kinh nghiệm làm việc cũng không sao. Chúng ta có thể bắt đầu từ kỹ năng và các dự án học tập của em. Nhớ dùng nút "⚡ Nâng cấp" để thêm số liệu nhé!',
          actionText: 'Quét từ khóa JD',
          actionTab: 'internship-jobs' as AppTab,
        };
      case 'internship-jobs':
        return {
          title: 'Thực tập & việc làm',
          text: 'Chị sẽ cùng em xem vị trí này yêu cầu những gì và em cần chuẩn bị thêm kỹ năng nào trước khi nộp hồ sơ.',
          actionText: 'Luyện phỏng vấn cùng Chị An',
          actionTab: 'interview-practice' as AppTab,
        };
      case 'interview-practice':
        return {
          title: 'Phòng luyện phỏng vấn',
          text: 'Chị sẽ đóng vai nhà tuyển dụng. Em cứ trả lời tự nhiên, sau mỗi câu chị sẽ góp ý theo mô hình STAR để em tiến bộ hơn.',
          actionText: 'Xem lộ trình 4 năm',
          actionTab: 'career-roadmap' as AppTab,
        };
      case 'career-roadmap':
        return {
          title: 'Lộ trình phát triển',
          text: 'Mỗi kỹ năng em học được hôm nay sẽ giúp em có thêm lựa chọn trong tương lai. Từng mốc nhỏ sẽ tạo nên bước nhảy vọt khi tốt nghiệp!',
          actionText: 'Khám phá bản thân',
          actionTab: 'self-discovery' as AppTab,
        };
      default:
        return {
          title: 'Chị An hướng dẫn',
          text: 'Chào em! Hôm nay chúng ta cùng chuẩn bị một bước mới cho tương lai nhé!',
          actionText: 'Về Tổng quan',
          actionTab: 'dashboard' as AppTab,
        };
    }
  };

  const advice = getGuidance();

  return (
    <div className="bg-gradient-to-r from-blue-50/80 via-white to-sky-50/50 border border-blue-200/80 rounded-2xl p-4 shadow-xs mb-6 flex flex-col sm:flex-row items-center gap-4 no-print transition-all">
      {/* 1. Full-Body Chị An Character (~120px) */}
      <div className="flex-shrink-0">
        <ChiAnCharacter
          state={characterState}
          height={120}
          onClick={() => {
            const nextState: MascotState =
              characterState === 'guiding'
                ? 'thinking'
                : characterState === 'thinking'
                ? 'welcome'
                : characterState === 'welcome'
                ? 'success'
                : 'guiding';
            setCharacterState(nextState);
            setIsOpen(true);
          }}
        />
      </div>

      {/* 2. Content & Phrasing with Chị - Em */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h5 className="font-bold text-xs uppercase tracking-wider text-blue-900">
              Gợi ý từ Chị An • {advice.title}
            </h5>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-slate-600 p-1 text-xs font-semibold cursor-pointer"
          >
            {isOpen ? 'Thu gọn' : 'Mở lời khuyên'}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-2 animate-fade-in">
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {advice.text}
            </p>

            {onNavigateTab && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onNavigateTab(advice.actionTab)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                  <span>{advice.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-slate-500">
                  Nhấn vào Chị An để đổi cử chỉ
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
