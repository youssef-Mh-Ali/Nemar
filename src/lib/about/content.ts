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

export const boardMembers: BoardMember[] = [
  {
    nameAr: 'مينا ميشيل',
    nameEn: 'Mina Michel',
    titleAr: 'الرئيس التنفيذي',
    titleEn: 'Chief Executive Officer',
    descriptionAr:
      'مؤسس ورئيس تنفيذي بخبرة واسعة في قيادة التحول الرقمي وتطوير حلول تقنية مبتكرة لقطاع العقارات.',
    descriptionEn:
      'Founder and CEO with extensive experience in leading digital transformation and developing innovative technology solutions for the real estate sector.',
    image: '/images/board/Mina_Michel_Founder_of_Cloudastick_Systems.png',
  },
  {
    nameAr: 'جون شدودي',
    nameEn: 'John Shedoudy',
    titleAr: 'مستشار Salesforce',
    titleEn: 'Salesforce Consultant',
    descriptionAr:
      'خبير في استشارات Salesforce مع خبرة عميقة في تصميم وتنفيذ الحلول العقارية على منصة Salesforce.',
    descriptionEn:
      'Salesforce consultant with deep expertise in designing and implementing real estate solutions on the Salesforce platform.',
    image: '/images/board/John_Shedoudy_Salesforce_Consultant.png',
  },
  {
    nameAr: 'شادي توماس',
    nameEn: 'Shady Thomas',
    titleAr: 'مستشار Salesforce',
    titleEn: 'Salesforce Consultant',
    descriptionAr:
      'مستشار Salesforce محترف يمتلك خبرة في تحسين العمليات التجارية وتطوير حلول تقنية متكاملة.',
    descriptionEn:
      'Professional Salesforce consultant with expertise in optimizing business processes and developing integrated technical solutions.',
    image: '/images/board/Shady_Thomas_Salesforce_Consultant.png',
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
