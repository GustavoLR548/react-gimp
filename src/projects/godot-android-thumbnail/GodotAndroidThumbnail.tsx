import { Img } from '../../react/Img'

export type GodotAndroidThumbnailProps = {
  tag: string
  titlePrefix: string
  titleMain: string
  subtitle: string
  badgeText: string
  statusPill: string
  chips: string
  author: string
  gameImage?: string
  godotColor?: string
  androidColor?: string
  showEditorOverlay?: boolean
}

// Content only — the enclosing <Page> (preset, width/height, background) is
// owned by FrameSlot and applied to <Page> automatically.
export function GodotAndroidThumbnail({
  tag,
  titlePrefix,
  titleMain,
  subtitle,
  badgeText,
  statusPill,
  chips,
  author,
  gameImage = '',
  godotColor = '#478cbf',
  androidColor = '#3ddc84',
  showEditorOverlay = true,
}: GodotAndroidThumbnailProps) {
  const chipList = chips
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)

  return (
    <div className="relative h-full w-full overflow-hidden select-none font-sans text-white">
      {/* Background blueprint grid & Godot editor axes */}
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
        {/* Godot 2D Origin crosshair lines (Red X, Green Y) */}
        <line x1="0" y1="360" x2="1280" y2="360" stroke="#ff4757" strokeWidth="1.5" opacity="0.35" />
        <line x1="640" y1="0" x2="640" y2="720" stroke="#2ed573" strokeWidth="1.5" opacity="0.35" />
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
      <div className="relative z-10 flex h-full w-full items-center justify-between px-12 py-10 lg:px-14 lg:py-12">
        {/* Left Column: Headlines, Badges, and Metadata */}
        <div className="flex h-full w-[600px] flex-col justify-between py-1">
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Godot Engine Badge */}
            <div
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-1.5 shadow-lg"
              style={{
                borderColor: `${godotColor}77`,
                backgroundColor: '#16202c',
                boxShadow: `0 0 15px ${godotColor}22`,
              }}
            >
              <GodotLogoIcon color={godotColor} className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap text-xs font-black uppercase text-sky-200 leading-none">
                {tag}
              </span>
            </div>

            {/* High Impact Highlight Badge */}
            {badgeText && (
              <div className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-3.5 py-1.5 font-black text-xs uppercase text-neutral-950 shadow-md">
                <svg className="h-3.5 w-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="whitespace-nowrap leading-none">{badgeText}</span>
              </div>
            )}

            {/* Android Export Badge */}
            <div
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 shadow-lg"
              style={{
                borderColor: `${androidColor}66`,
                backgroundColor: '#112218',
                boxShadow: `0 0 15px ${androidColor}22`,
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full animate-pulse"
                style={{ backgroundColor: androidColor }}
              />
              <span
                className="whitespace-nowrap text-xs font-bold uppercase leading-none"
                style={{ color: androidColor }}
              >
                DEPLOY EM 1 CLIQUE
              </span>
            </div>
          </div>

          {/* Main Title Block */}
          <div className="my-auto flex flex-col gap-1.5">
            <h2 className="text-6xl font-black tracking-tight text-white uppercase leading-[0.95] drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)] lg:text-7xl">
              {titlePrefix}
            </h2>
            <h1
              className="text-7xl font-black tracking-tight uppercase leading-[0.9] lg:text-8xl"
              style={{
                color: androidColor,
                filter: `drop-shadow(0 0 30px ${androidColor}66) drop-shadow(0 12px 24px rgba(0,0,0,0.95))`,
              }}
            >
              {titleMain}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="mt-3 max-w-[560px] text-2xl font-bold text-neutral-200 drop-shadow-md">
                {subtitle}
              </p>
            )}
          </div>

          {/* Bottom Row: Feature Chips + Author */}
          <div className="flex flex-col gap-3.5">
            {/* Tech Chips */}
            {chipList.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5">
                {chipList.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-700/90 bg-[#161a22] px-3.5 py-2 text-xs font-bold text-neutral-200 shadow-md"
                  >
                    <span className="shrink-0 text-emerald-400">✓</span>
                    <span className="whitespace-nowrap leading-none">{chip}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Author / Channel Watermark */}
            {author && (
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-400 uppercase">
                <span
                  className="h-1.5 w-6 rounded-full shadow-sm"
                  style={{ backgroundColor: godotColor }}
                />
                <span className="whitespace-nowrap leading-none">{author}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="relative flex h-full w-[560px] flex-col items-center justify-center">
          {/* Top Mascot Bridge: Godot Robot ──▶ ⚡ EXPORTAR ──▶ Android Bugdroid */}
          <div className="mb-3.5 flex w-full items-center justify-between px-1">
            {/* Godot Mascot Card */}
            <div
              className="inline-flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 shadow-lg"
              style={{
                borderColor: `${godotColor}88`,
                backgroundColor: '#172230',
                boxShadow: `0 4px 20px ${godotColor}22`,
              }}
            >
              <GodotLogoIcon color={godotColor} className="h-9 w-9 shrink-0" />
              <div className="flex flex-col">
                <span className="whitespace-nowrap text-xs font-black uppercase text-sky-200 leading-tight">
                  Godot 4
                </span>
                <span className="whitespace-nowrap text-[10px] font-semibold text-neutral-400 leading-tight">
                  Projeto do Jogo
                </span>
              </div>
            </div>

            {/* High-Tech Glowing Pipeline Connector */}
            <div className="mx-3 flex flex-1 items-center gap-2">
              <div
                className="h-1 flex-1 rounded-full"
                style={{
                  background: `linear-gradient(to right, ${godotColor}, #60a5fa)`,
                  boxShadow: `0 0 8px ${godotColor}66`,
                }}
              />
              <div
                className="inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-black uppercase shadow-md"
                style={{
                  borderColor: `${androidColor}99`,
                  backgroundColor: '#112418',
                  color: androidColor,
                  boxShadow: `0 0 15px ${androidColor}33`,
                }}
              >
                <span>⚡</span>
                <span className="whitespace-nowrap leading-none">EXPORTAR</span>
              </div>
              <div
                className="h-1 flex-1 rounded-full"
                style={{
                  background: `linear-gradient(to right, #34d399, ${androidColor})`,
                  boxShadow: `0 0 8px ${androidColor}66`,
                }}
              />
            </div>

            {/* Android Bugdroid Card */}
            <div
              className="inline-flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 shadow-lg"
              style={{
                borderColor: `${androidColor}88`,
                backgroundColor: '#122218',
                boxShadow: `0 4px 20px ${androidColor}22`,
              }}
            >
              <AndroidHeadIcon color={androidColor} className="h-9 w-9 shrink-0" />
              <div className="flex flex-col">
                <span
                  className="whitespace-nowrap text-xs font-black uppercase leading-tight"
                  style={{ color: androidColor }}
                >
                  Android
                </span>
                <span className="whitespace-nowrap text-[10px] font-semibold text-neutral-400 leading-tight">
                  Dispositivo
                </span>
              </div>
            </div>
          </div>

          {/* Landscape Smartphone Frame Mockup */}
          <div className="relative z-10 rotate-[-1.5deg] transition-transform">
            {/* Phone Exterior Chassis */}
            <div className="relative h-[275px] w-[475px] rounded-[28px] border-[6px] border-neutral-700/90 bg-neutral-950 p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]">
              {/* Phone Camera Hole */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-neutral-800 border border-neutral-700 z-30 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-950" />
              </div>

              {/* Phone Screen Area */}
              <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#0c1017]">
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
                <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-3.5">
                  {/* Virtual Joystick / D-Pad on bottom-left */}
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/35 bg-black/50 shadow-md">
                    <div className="h-6 w-6 rounded-full bg-white/60 shadow-inner" />
                  </div>

                  {/* Action Buttons on bottom-right */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/35 bg-black/50 font-bold text-xs text-white/90 shadow-md">
                      B
                    </div>
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 font-black text-sm text-neutral-950 shadow-lg"
                      style={{
                        borderColor: androidColor,
                        backgroundColor: androidColor,
                      }}
                    >
                      A
                    </div>
                  </div>
                </div>

                {/* Top Phone HUD */}
                <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-2 text-[11px] font-bold text-white/90 drop-shadow">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-500/90 px-1.5 py-0.5 text-[10px] text-black font-black leading-none">
                      60 FPS
                    </span>
                    <span className="whitespace-nowrap leading-none">PONTOS 04.250</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AndroidHeadIcon color={androidColor} className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap leading-none">ANDROID 14</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Godot Editor Export Preset Floating Card */}
            {showEditorOverlay && (
              <div
                className="absolute -top-7 -left-10 z-20 w-56 rounded-xl border p-3 shadow-2xl"
                style={{
                  borderColor: `${godotColor}77`,
                  backgroundColor: '#17202c',
                  boxShadow: `0 12px 30px rgba(0,0,0,0.85), 0 0 20px ${godotColor}22`,
                }}
              >
                <div className="flex items-center justify-between border-b border-neutral-700/80 pb-1.5 text-[11px] font-bold text-neutral-200">
                  <div className="flex items-center gap-1.5">
                    <GodotLogoIcon color={godotColor} className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Predefinição Android</span>
                  </div>
                  <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 whitespace-nowrap">
                    ATIVO
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-1.5 text-[11px] font-mono text-neutral-300">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="shrink-0">✓</span>
                    <span className="whitespace-nowrap text-neutral-200">Build com Gradle</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="shrink-0">✓</span>
                    <span className="whitespace-nowrap text-neutral-200">arm64-v8a</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="shrink-0">✓</span>
                    <span className="whitespace-nowrap text-neutral-200">Keystore Validada</span>
                  </div>
                </div>
              </div>
            )}

            {/* Export Success Toast Notification */}
            {statusPill && (
              <div
                className="absolute -bottom-5 right-2 z-30 inline-flex items-center gap-3 rounded-xl border px-4 py-2 shadow-2xl"
                style={{
                  borderColor: `${androidColor}88`,
                  backgroundColor: '#102218',
                  boxShadow: `0 12px 30px -5px rgba(0,0,0,0.85), 0 0 20px ${androidColor}33`,
                }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${androidColor}25` }}
                >
                  <AndroidHeadIcon color={androidColor} className="h-4.5 w-4.5 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span
                    className="whitespace-nowrap text-xs font-black uppercase leading-tight"
                    style={{ color: androidColor }}
                  >
                    {statusPill}
                  </span>
                  <span className="whitespace-nowrap text-[10px] font-medium text-neutral-400 leading-tight">
                    APK e AAB • Pronto para Instalar
                  </span>
                </div>
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
      <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 460 250">
        <polygon points="0,250 90,130 200,250" fill="#242b58" />
        <polygon points="140,250 260,100 380,250" fill="#1b2044" />
        <polygon points="300,250 390,120 460,250" fill="#242b58" />
      </svg>

      {/* Floating Game Platforms */}
      <div className="absolute left-6 bottom-12 h-6 w-36 rounded-md bg-neutral-800 border-t-4 border-emerald-500 shadow-lg" />
      <div className="absolute left-46 bottom-24 h-6 w-34 rounded-md bg-neutral-800 border-t-4 border-emerald-500 shadow-lg" />
      <div className="absolute right-10 bottom-16 h-6 w-44 rounded-md bg-neutral-800 border-t-4 border-emerald-500 shadow-lg" />

      {/* Hero Character Jumping */}
      <div className="absolute left-56 bottom-32 flex flex-col items-center">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 p-1 shadow-lg animate-bounce"
          style={{ backgroundColor: godotColor }}
        >
          <GodotLogoIcon color="#ffffff" className="h-8 w-8" />
        </div>
        {/* Jump Dust Effect */}
        <div className="mt-1 h-1 w-7 rounded-full bg-white/40 blur-[1px]" />
      </div>

      {/* Android Goal Trophy on the right platform */}
      <div className="absolute right-16 bottom-24 flex items-center gap-1">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/50 shadow-[0_0_15px_rgba(61,220,132,0.4)]"
          style={{ backgroundColor: `${androidColor}33` }}
        >
          <AndroidHeadIcon color={androidColor} className="h-5 w-5" />
        </div>
      </div>

      {/* Collectible Gold Gems / Coins */}
      <div className="absolute left-32 bottom-24 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] border border-amber-200">
        <span className="text-[10px] font-black text-amber-950">★</span>
      </div>
      <div className="absolute left-74 bottom-36 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] border border-amber-200">
        <span className="text-[10px] font-black text-amber-950">★</span>
      </div>
    </div>
  )
}

// Godot Engine Official Mascot / Logo SVG
function GodotLogoIcon({
  color = '#478cbf',
  className = 'h-6 w-6',
}: {
  color?: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="scale(.015625)">
        <g fill="#fff">
          <path d="M105 673v33q407 354 814 0v-33z" />
          <path
            d="m105 673 152 14q12 1 15 14l4 67 132 10 8-61q2-11 15-15h162q13 4 15 15l8 61 132-10 4-67q3-13 15-14l152-14V427q30-39 56-81-35-59-83-108-43 20-82 47-40-37-88-64 7-51 8-102-59-28-123-42-26 43-46 89-49-7-98 0-20-46-46-89-64 14-123 42 1 51 8 102-48 27-88 64-39-27-82-47-48 49-83 108 26 42 56 81zm0 33v39c0 276 813 276 814 0v-39l-134 12-5 69q-2 10-14 13l-162 11q-12 0-16-11l-10-65H446l-10 65q-4 11-16 11l-162-11q-12-3-14-13l-5-69z"
            fill={color}
          />
          <path d="M483 600c0 34 58 34 58 0v-86c0-34-58-34-58 0z" />
          <circle cx="725" cy="526" r="90" />
          <circle cx="299" cy="526" r="90" />
        </g>
        <g fill="#20252c">
          <circle cx="307" cy="532" r="60" />
          <circle cx="717" cy="532" r="60" />
        </g>
      </g>
    </svg>
  )
}

// Android Robot / Bugdroid Head Icon
function AndroidHeadIcon({
  color = '#3ddc84',
  className = 'h-6 w-6',
}: {
  color?: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 100 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Antenna */}
      <line
        x1="32"
        y1="10"
        x2="40"
        y2="26"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Right Antenna */}
      <line
        x1="68"
        y1="10"
        x2="60"
        y2="26"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Head Dome */}
      <path
        d="M18 68 C 18 36, 82 36, 82 68 Z"
        fill={color}
      />
      {/* Eyes */}
      <circle cx="38" cy="52" r="4.5" fill="#ffffff" />
      <circle cx="62" cy="52" r="4.5" fill="#ffffff" />
    </svg>
  )
}
