import { DEMO_CONFIG } from '../demo-config'

export type BoardMember = {
  nameAr: string
  nameEn: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  image: string
}

const placeholderAvatar = '/placeholder.jpg'

export const boardMembers: BoardMember[] = [
  {
    nameAr: 'أحمد السالم',
    nameEn: 'Ahmed Al Salem',
    titleAr: 'الرئيس التنفيذي',
    titleEn: 'Chief Executive Officer',
    descriptionAr:
      'رائد أعمال ومستثمر عقاري يتمتع بخبرة تزيد عن 20 عاماً في تطوير وإدارة المشاريع العقارية السكنية والتجارية.',
    descriptionEn:
      'An entrepreneur and real estate investor with over 20 years of experience in developing and managing residential and commercial real estate projects.',
    image: '/images/board/ceo.jpg',
  },
  {
    nameAr: 'سارة العتيبي',
    nameEn: 'Sara Al Otaibi',
    titleAr: 'مديرة التطوير العقاري',
    titleEn: 'Director of Real Estate Development',
    descriptionAr:
      'خبيرة في التخطيط الحضري وتطوير المجتمعات السكنية المتكاملة، قادت العديد من المشاريع الكبرى.',
    descriptionEn:
      'An expert in urban planning and integrated community development who has led numerous large-scale projects.',
    image: '/images/board/director.jpg',
  },
  {
    nameAr: 'محمد القحطاني',
    nameEn: 'Mohammed Al Qahtani',
    titleAr: 'مدير العمليات',
    titleEn: 'Operations Manager',
    descriptionAr:
      'يمتلك خبرة واسعة في إدارة العمليات وتحقيق الكفاءة التشغيلية في قطاع التطوير العقاري.',
    descriptionEn:
      'Brings extensive experience in operations management and driving operational efficiency in the real estate development sector.',
    image: '/images/board/operations.jpg',
  },
]

export type LocalizedBoardMember = {
  name: string
  title: string
  description: string
  image: string
}

export function getBoardMembers(language: string): LocalizedBoardMember[] {
  if (!DEMO_CONFIG.features.showBoardMembers) return []
  const isEnglish = language.startsWith('en')
  return boardMembers.map((member) => ({
    name: isEnglish ? member.nameEn : member.nameAr,
    title: isEnglish ? member.titleEn : member.titleAr,
    description: isEnglish ? member.descriptionEn : member.descriptionAr,
    image: member.image,
  }))
}

export async function loadMissionVisionMarkdown(language: string): Promise<string> {
  const primaryLanguage = language.startsWith('en') ? 'en' : 'ar'
  const fallbackLanguage = primaryLanguage === 'en' ? 'ar' : 'en'

  for (const lang of [primaryLanguage, fallbackLanguage]) {
    const response = await fetch(`/content/about/mission-vision.${lang}.md`)
    if (response.ok) {
      return response.text()
    }
  }

  throw new Error('Unable to load mission and vision content')
}
