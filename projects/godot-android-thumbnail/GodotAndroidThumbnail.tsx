import { Img } from '@react-gimp/sdk'
import { AndroidHeadIcon, GodotLogoIcon } from './mascotIcons'

export type GodotAndroidThumbnailProps = {
  titlePrefix: string
  titleMain: string
  subtitle: string
  stampText: string
  gameImage?: string
  godotColor?: string
  androidColor?: string
  showStamp?: boolean
}

// Content only — the enclosing <Page> (preset, width/height, background) is
// owned by FrameSlot and applied to <Page> automatically.
export function GodotAndroidThumbnail({
  titlePrefix,
  titleMain,
  subtitle,
  stampText,
  gameImage = '',
  godotColor = '#478cbf',
  androidColor = '#3ddc84',
  showStamp = true,
}: GodotAndroidThumbnailProps) {
  return (
    <div className="relative h-full w-full overflow-hidden select-none font-sans text-white">
      {/* Background blueprint grid */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="godotSmallGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
          </pattern>
          <pattern id="godotLargeGrid" width="160" height="160" patternUnits="userSpaceOnUse">
            <rect width="160" height="160" fill="url(#godotSmallGrid)" />
            <path d="M 160 0 L 0 0 0 160" fill="none" stroke={godotColor} strokeWidth="1.25" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#godotLargeGrid)" />
      </svg>

      {/* Atmospheric lighting glows */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-[520px] w-[520px] rounded-full opacity-40 blur-[130px]"
        style={{ backgroundColor: godotColor }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-10 h-[560px] w-[560px] rounded-full opacity-35 blur-[140px]"
        style={{ backgroundColor: androidColor }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35" />

      {/* Subtle floating background watermark icons for tech atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
        <GodotLogoIcon color="#ffffff" className="absolute -left-10 top-1/4 h-80 w-80 rotate-12" />
        <AndroidHeadIcon color="#ffffff" className="absolute right-1/3 -bottom-10 h-72 w-72 -rotate-12" />
      </div>

      {/* Main layout container */}
      <div className="relative z-10 flex h-full w-full items-center justify-between px-12 py-10">
        {/* Left Column: title only — the video title/channel already say "Godot" */}
        <div className="flex h-full w-[480px] flex-col justify-center gap-3">
          <h2 className="text-7xl font-black tracking-tight text-white uppercase leading-[0.9] drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]">
            {titlePrefix}
          </h2>
          <h1
            className="text-8xl font-black tracking-tight uppercase leading-[0.85]"
            style={{
              color: androidColor,
              filter: `drop-shadow(0 0 30px ${androidColor}66) drop-shadow(0 12px 24px rgba(0,0,0,0.95))`,
            }}
          >
            {titleMain}
          </h1>

          {subtitle && (
            <p className="mt-3 line-clamp-2 max-w-[460px] text-2xl font-bold text-neutral-300 drop-shadow-md">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Column: one hero visual — the phone, nothing competing with it */}
        <div className="relative flex h-full w-[660px] items-center justify-center">
          {/* Landscape Smartphone Frame Mockup, oversized on purpose */}
          <div className="relative z-10 rotate-[-2deg]">
            {/* Phone Exterior Chassis */}
            <div className="relative h-[400px] w-[640px] rounded-[36px] border-[8px] border-neutral-700/90 bg-neutral-950 p-2 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)]">
              {/* Phone Camera Hole */}
              <div className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-neutral-800 border border-neutral-700 z-30 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-blue-950" />
              </div>

              {/* Phone Screen Area */}
              <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-[#0c1017]">
                {gameImage ? (
                  <Img
                    src={gameImage}
                    alt="Game preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ProceduralGameScreen godotColor={godotColor} androidColor={androidColor} />
                )}

                {/* Glass Specular Reflection Highlight */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15" />

                {/* Android Mobile Touch Controls Overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-4">
                  {/* Virtual Joystick / D-Pad on bottom-left */}
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/35 bg-black/50 shadow-md">
                    <div className="h-7 w-7 rounded-full bg-white/60 shadow-inner" />
                  </div>

                  {/* Action Buttons on bottom-right */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/35 bg-black/50 font-bold text-sm text-white/90 shadow-md">
                      B
                    </div>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 font-black text-base text-neutral-950 shadow-lg"
                      style={{
                        borderColor: androidColor,
                        backgroundColor: androidColor,
                      }}
                    >
                      A
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verdict stamp — the one thing that replaces the old badges + checklist + toast */}
            {showStamp && (
              <div
                className="absolute -top-12 -right-12 z-30 flex h-40 w-40 rotate-[14deg] items-center justify-center rounded-full border-[6px] p-3 text-center shadow-2xl"
                style={{
                  borderColor: androidColor,
                  backgroundColor: '#0f1e15',
                  boxShadow: `0 14px 34px rgba(0,0,0,0.9), 0 0 30px ${androidColor}55`,
                }}
              >
                <span
                  className="text-xl font-black uppercase leading-[1.05] tracking-wide"
                  style={{ color: androidColor }}
                >
                  {stampText}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Procedural 2D game scene rendered inside the phone when no custom screenshot is uploaded
function ProceduralGameScreen({
  godotColor,
  androidColor,
}: {
  godotColor: string
  androidColor: string
}) {
  return (
    <div className="relative h-full w-full bg-gradient-to-b from-[#0b1329] via-[#161c3b] to-[#0d1224]">
      {/* Distant Pixel Mountains & Nebula */}
      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 460 250" preserveAspectRatio="none">
        <polygon points="0,250 90,130 200,250" fill="#242b58" />
        <polygon points="140,250 260,100 380,250" fill="#1b2044" />
        <polygon points="300,250 390,120 460,250" fill="#242b58" />
      </svg>

      {/* Floating Game Platforms */}
      <div className="absolute left-8 bottom-16 h-7 w-44 rounded-md bg-neutral-800 border-t-4 border-emerald-500 shadow-lg" />
      <div className="absolute left-60 bottom-32 h-7 w-40 rounded-md bg-neutral-800 border-t-4 border-emerald-500 shadow-lg" />
      <div className="absolute right-12 bottom-20 h-7 w-52 rounded-md bg-neutral-800 border-t-4 border-emerald-500 shadow-lg" />

      {/* Hero Character Jumping */}
      <div className="absolute left-72 bottom-44 flex flex-col items-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 p-1.5 shadow-lg animate-bounce"
          style={{ backgroundColor: godotColor }}
        >
          <GodotLogoIcon color="#ffffff" className="h-10 w-10" />
        </div>
        {/* Jump Dust Effect */}
        <div className="mt-1.5 h-1.5 w-9 rounded-full bg-white/40 blur-[1px]" />
      </div>

      {/* Android Goal Trophy on the right platform */}
      <div className="absolute right-20 bottom-32 flex items-center gap-1">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/50 shadow-[0_0_15px_rgba(61,220,132,0.4)]"
          style={{ backgroundColor: `${androidColor}33` }}
        >
          <AndroidHeadIcon color={androidColor} className="h-6 w-6" />
        </div>
      </div>

      {/* Collectible Gold Gems / Coins */}
      <div className="absolute left-40 bottom-32 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] border border-amber-200">
        <span className="text-xs font-black text-amber-950">★</span>
      </div>
      <div className="absolute left-96 bottom-48 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] border border-amber-200">
        <span className="text-xs font-black text-amber-950">★</span>
      </div>
    </div>
  )
}
