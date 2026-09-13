import { Img } from '@react-gimp/sdk'
import { AndroidHeadIcon, GodotLogoIcon } from '../godot-android-thumbnail/mascotIcons'

export type GodotAndroidExportFailProps = {
  titlePrefix: string
  titleMain: string
  subtitle: string
  stampText: string
  crashImage?: string
  godotColor?: string
  errorColor?: string
  showStamp?: boolean
}

// Content only — the enclosing <Page> (preset, width/height, background) is
// owned by FrameSlot and applied to <Page> automatically.
export function GodotAndroidExportFail({
  titlePrefix,
  titleMain,
  subtitle,
  stampText,
  crashImage = '',
  godotColor = '#478cbf',
  errorColor = '#ff4757',
  showStamp = true,
}: GodotAndroidExportFailProps) {
  return (
    <div className="relative h-full w-full overflow-hidden select-none font-sans text-white">
      {/* Background blueprint grid */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="godotFailSmallGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
          </pattern>
          <pattern id="godotFailLargeGrid" width="160" height="160" patternUnits="userSpaceOnUse">
            <rect width="160" height="160" fill="url(#godotFailSmallGrid)" />
            <path d="M 160 0 L 0 0 0 160" fill="none" stroke={godotColor} strokeWidth="1.25" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#godotFailLargeGrid)" />
      </svg>

      {/* Atmospheric lighting glows */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-[520px] w-[520px] rounded-full opacity-40 blur-[130px]"
        style={{ backgroundColor: godotColor }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-10 h-[560px] w-[560px] rounded-full opacity-35 blur-[140px]"
        style={{ backgroundColor: errorColor }}
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
              color: errorColor,
              filter: `drop-shadow(0 0 30px ${errorColor}66) drop-shadow(0 12px 24px rgba(0,0,0,0.95))`,
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
                {crashImage ? (
                  <Img
                    src={crashImage}
                    alt="Crash screenshot"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BlueScreenOfDeath />
                )}

                {/* Glass Specular Reflection Highlight */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15" />
              </div>
            </div>

            {/* Verdict stamp — the one thing that replaces the old checklist + toast */}
            {showStamp && (
              <div
                className="absolute -top-12 -right-12 z-30 flex h-40 w-40 rotate-[14deg] items-center justify-center rounded-full border-[6px] p-3 text-center shadow-2xl"
                style={{
                  borderColor: errorColor,
                  backgroundColor: '#1a0f0e',
                  boxShadow: `0 14px 34px rgba(0,0,0,0.9), 0 0 30px ${errorColor}55`,
                }}
              >
                <span
                  className="text-xl font-black uppercase leading-[1.05] tracking-wide"
                  style={{ color: errorColor }}
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

// A comically literal Blue Screen of Death — Android doesn't have one, but
// it reads instantly at thumbnail scale where a realistic small dialog
// doesn't, and the mismatch (PC crash screen on a phone) is the joke.
function BlueScreenOfDeath() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#1a56db] px-8 text-center font-mono text-white">
      <span className="text-8xl font-black leading-none">:(</span>
      <p className="mt-5 max-w-[420px] text-2xl font-bold uppercase tracking-tight">
        Seu jogo parou de funcionar
      </p>
      <p className="mt-6 text-[11px] font-normal text-white/60">
        STOP_CODE: ANDROID_EXPORT_FAILURE
      </p>
    </div>
  )
}
