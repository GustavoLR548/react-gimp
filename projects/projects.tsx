import { z } from 'zod'
import { defineFrame, defineProject, ui } from '@react-gimp/sdk'
import type { ProjectDef } from '@react-gimp/sdk'
import { CarouselSlide } from './carousel/CarouselSlide'
import { GodotAndroidExportFail } from './godot-android-export-fail/GodotAndroidExportFail'
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
  titlePrefix: z.string().min(1).register(ui, { label: 'Prefixo do Título', order: 0 }),
  titleMain: z.string().min(1).register(ui, { label: 'Destaque do Título (Verde)', order: 1 }),
  subtitle: z.string().register(ui, { label: 'Subtítulo (uma linha curta)', order: 2 }),
  stampText: z.string().register(ui, { label: 'Selo de Veredito', order: 3 }),
  gameImage: z.string().register(ui, {
    label: 'Captura de Tela do Jogo',
    control: { kind: 'file' },
    help: 'Envie uma imagem do seu jogo para a tela do celular (ou deixe vazio para o jogo padrão)',
    order: 4,
  }),
  background: z.string().register(ui, { label: 'Cor de Fundo', control: { kind: 'color' }, order: 5 }),
  godotColor: z.string().register(ui, { label: 'Cor Azul Godot', control: { kind: 'color' }, order: 6 }),
  androidColor: z.string().register(ui, { label: 'Cor Verde Android', control: { kind: 'color' }, order: 7 }),
  showStamp: z.boolean().register(ui, {
    label: 'Exibir Selo de Veredito',
    control: { kind: 'checkbox' },
    order: 8,
  }),
})

const godotAndroidDefaults = {
  titlePrefix: 'EXPORTAR PARA',
  titleMain: 'ANDROID',
  subtitle: 'SDK, Keystore e Gradle em um vídeo só',
  stampText: '100% FUNCIONAL',
  gameImage: '',
  background: '#12161f',
  godotColor: '#478cbf',
  androidColor: '#3ddc84',
  showStamp: true,
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

const godotAndroidFailSchema = z.object({
  titlePrefix: z.string().min(1).register(ui, { label: 'Prefixo do Título', order: 0 }),
  titleMain: z.string().min(1).register(ui, { label: 'Destaque do Título (Vermelho)', order: 1 }),
  subtitle: z.string().register(ui, { label: 'Subtítulo (uma linha curta)', order: 2 }),
  stampText: z.string().register(ui, { label: 'Selo de Veredito', order: 3 }),
  crashImage: z.string().register(ui, {
    label: 'Captura de Tela do Crash',
    control: { kind: 'file' },
    help: 'Envie uma captura real do crash (ou deixe vazio para a Tela Azul padrão)',
    order: 4,
  }),
  background: z.string().register(ui, { label: 'Cor de Fundo', control: { kind: 'color' }, order: 5 }),
  godotColor: z.string().register(ui, { label: 'Cor Azul Godot', control: { kind: 'color' }, order: 6 }),
  errorColor: z.string().register(ui, { label: 'Cor de Erro', control: { kind: 'color' }, order: 7 }),
  showStamp: z.boolean().register(ui, {
    label: 'Exibir Selo de Veredito',
    control: { kind: 'checkbox' },
    order: 8,
  }),
})

const godotAndroidFailDefaults = {
  titlePrefix: '1 ERRO',
  titleMain: 'TRAVA TUDO',
  subtitle: 'Builda liso no PC, quebra na hora de instalar',
  stampText: 'FALHOU',
  crashImage: '',
  background: '#12161f',
  godotColor: '#478cbf',
  errorColor: '#ff4757',
  showStamp: true,
}

const godotAndroidFailProject = defineProject({
  id: 'godot-android-export-fail',
  name: 'Erro ao Exportar Godot para Android (Thumbnail)',
  description: 'Thumbnail de alerta para vídeos sobre por que o export da Godot para Android falha.',
  frames: [
    defineFrame({
      id: 'youtube-thumbnail',
      name: 'Thumbnail do YouTube (1280×720)',
      preset: 'youtube',
      schema: godotAndroidFailSchema,
      defaults: godotAndroidFailDefaults,
      render: (values) => <GodotAndroidExportFail {...values} />,
    }),
    defineFrame({
      id: 'social-card',
      name: 'Card para Redes Sociais / OG (1200×630)',
      preset: 'og',
      schema: godotAndroidFailSchema,
      defaults: godotAndroidFailDefaults,
      render: (values) => <GodotAndroidExportFail {...values} />,
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
  godotAndroidFailProject,
  youtubeThumbnail,
  ogCard,
  instagramCarousel,
]
