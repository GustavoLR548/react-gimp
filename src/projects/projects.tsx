import { z } from 'zod'
import { CarouselSlide } from './carousel/CarouselSlide'
import { defineFrame, defineProject, ui } from './defineProject'
import type { ProjectDef } from './defineProject'
import { GodotAndroidThumbnail } from './godot-android-thumbnail/GodotAndroidThumbnail'
import { Thumbnail } from './thumbnail/Thumbnail'

const thumbnailSchema = z.object({
  title: z.string().min(1).register(ui, { label: 'Title', order: 0 }),
  author: z.string().register(ui, { label: 'Author', order: 1 }),
  background: z.string().register(ui, { label: 'Background', control: { kind: 'color' }, order: 2 }),
  imageUrl: z.url().register(ui, { label: 'Image', control: { kind: 'file' }, order: 3 }),
})

const slideSchema = z.object({
  heading: z.string().min(1).register(ui, { label: 'Heading', order: 0 }),
  body: z.string().register(ui, { label: 'Body', control: { kind: 'textarea', rows: 3 }, order: 1 }),
  footer: z.string().register(ui, { label: 'Footer', order: 2 }),
  background: z.string().register(ui, { label: 'Background', control: { kind: 'color' }, order: 3 }),
})

const godotAndroidSchema = z.object({
  tag: z.string().min(1).register(ui, { label: 'Versão / Tag da Engine', order: 0 }),
  titlePrefix: z.string().min(1).register(ui, { label: 'Prefixo do Título', order: 1 }),
  titleMain: z.string().min(1).register(ui, { label: 'Destaque do Título (Verde)', order: 2 }),
  subtitle: z.string().register(ui, { label: 'Subtítulo', order: 3 }),
  badgeText: z.string().register(ui, { label: 'Selo de Destaque', order: 4 }),
  statusPill: z.string().register(ui, { label: 'Aviso de Status', order: 5 }),
  chips: z.string().register(ui, {
    label: 'Tags de Recursos (separadas por vírgula)',
    help: 'Tags separadas por vírgula, ex: SDK e Keystore, Build Gradle, Google Play',
    order: 6,
  }),
  author: z.string().register(ui, { label: 'Canal / Autor', order: 7 }),
  gameImage: z.string().register(ui, {
    label: 'Captura de Tela do Jogo',
    control: { kind: 'file' },
    help: 'Envie uma imagem do seu jogo para a tela do celular (ou deixe vazio para o jogo padrão)',
    order: 8,
  }),
  background: z.string().register(ui, { label: 'Cor de Fundo', control: { kind: 'color' }, order: 9 }),
  godotColor: z.string().register(ui, { label: 'Cor Azul Godot', control: { kind: 'color' }, order: 10 }),
  androidColor: z.string().register(ui, { label: 'Cor Verde Android', control: { kind: 'color' }, order: 11 }),
  showEditorOverlay: z.boolean().register(ui, {
    label: 'Exibir Painel de Exportação Godot',
    control: { kind: 'checkbox' },
    order: 12,
  }),
})

const godotAndroidDefaults = {
  tag: 'GODOT 4.4',
  titlePrefix: 'EXPORTAR PARA',
  titleMain: 'ANDROID',
  subtitle: 'Passo a Passo Completo • SDK, Keystore e Gradle',
  badgeText: '100% FUNCIONAL',
  statusPill: '✓ APK E AAB PRONTOS',
  chips: 'SDK e Keystore, Build Gradle, Deploy em 1 Clique, Google Play',
  author: 'TUTORIAIS GODOT',
  gameImage: '',
  background: '#12161f',
  godotColor: '#478cbf',
  androidColor: '#3ddc84',
  showEditorOverlay: true,
}

const godotAndroidProject = defineProject({
  id: 'godot-android-export',
  name: 'Exportar Godot para Android (Thumbnail)',
  description: 'Thumbnail de alto impacto para tutoriais de exportação da Godot para Android.',
  frames: [
    defineFrame({
      id: 'youtube-thumbnail',
      name: 'Thumbnail do YouTube (1280×720)',
      preset: 'youtube',
      schema: godotAndroidSchema,
      defaults: godotAndroidDefaults,
      render: (values) => <GodotAndroidThumbnail {...values} />,
    }),
    defineFrame({
      id: 'social-card',
      name: 'Card para Redes Sociais / OG (1200×630)',
      preset: 'og',
      schema: godotAndroidSchema,
      defaults: godotAndroidDefaults,
      render: (values) => <GodotAndroidThumbnail {...values} />,
    }),
  ],
})

const SAMPLE_IMAGE_URL = 'https://picsum.photos/seed/gimp/1280/720'

const youtubeThumbnail = defineProject({
  id: 'youtube-thumbnail',
  name: 'YouTube Thumbnail',
  description: 'A single 1280×720 video thumbnail.',
  frames: [
    defineFrame({
      id: 'thumbnail',
      name: 'Thumbnail',
      preset: 'youtube',
      schema: thumbnailSchema,
      defaults: {
        title: 'Ship it faster',
        author: 'react-gimp',
        background: '#1d4ed8',
        imageUrl: SAMPLE_IMAGE_URL,
      },
      render: ({ title, author, imageUrl }) => <Thumbnail title={title} author={author} imageUrl={imageUrl} />,
    }),
  ],
})

const ogCard = defineProject({
  id: 'og-card',
  name: 'OpenGraph Card',
  description: 'A single 1200×630 link-preview card, reusing the thumbnail design.',
  frames: [
    defineFrame({
      id: 'og',
      name: 'OG Card',
      preset: 'og',
      schema: thumbnailSchema,
      defaults: {
        title: 'Ship it faster',
        author: 'react-gimp',
        background: '#1d4ed8',
        imageUrl: SAMPLE_IMAGE_URL,
      },
      render: ({ title, author, imageUrl }) => <Thumbnail title={title} author={author} imageUrl={imageUrl} />,
    }),
  ],
})

const SLIDE_DEFAULTS = [
  { heading: 'Step 1', body: 'Start here.', footer: 'react-gimp' },
  { heading: 'Step 2', body: 'Keep going.', footer: 'react-gimp' },
  { heading: 'Step 3', body: 'Ship it.', footer: 'react-gimp' },
]

const instagramCarousel = defineProject({
  id: 'instagram-carousel',
  name: 'Instagram Carousel',
  description: 'Three 1080×1080 slides, each independently editable.',
  layout: 'row',
  frames: SLIDE_DEFAULTS.map((defaults, index) =>
    defineFrame({
      id: `slide-${index + 1}`,
      name: `Slide ${index + 1}`,
      preset: 'square',
      schema: slideSchema,
      defaults: { ...defaults, background: '#1d4ed8' },
      render: ({ heading, body, footer }) => (
        <CarouselSlide
          heading={heading}
          body={body}
          footer={footer}
          index={index + 1}
          total={SLIDE_DEFAULTS.length}
        />
      ),
    }),
  ),
})

export const projects: ProjectDef[] = [
  godotAndroidProject,
  youtubeThumbnail,
  ogCard,
  instagramCarousel,
]
