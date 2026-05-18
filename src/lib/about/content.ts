import faisalImg from '../Board members photos/Faisal Bin Saedan.png'
import osamaImg from '../Board members photos/Ussama Al-dawlty.png'
import tariqImg from '../Board members photos/Tariq Bin Saedan.png'
import abdulazizRashidiImg from '../Board members photos/Abd El Aziz Al Rashidy.png'
import abdulazizSalehImg from '../Board members photos/Abd-el Aziz Saleh.png'

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
    nameAr: 'فيصل عبدالله بن سعيدان',
    nameEn: 'Faisal Abdullah Bin Saedan',
    titleAr: 'الرئيس التنفيذي للمجموعة - نائب رئيس مجلس الإدارة',
    titleEn: 'Group CEO - Vice Chairman',
    descriptionAr:
      'رئيس تنفيذي ومؤسس لشركات عقارية واستثمارية، يتمتع بخبرة واسعة في الإدارة والتطوير العقاري، وشغل مناصب قيادية في عدة جهات وشارك في مجالس إدارات وصناديق استثمارية.',
    descriptionEn:
      'Executive leader and founder of real estate and investment companies with broad experience in management and real estate development, and a track record of leadership roles across boards and investment funds.',
    image: faisalImg,
  },
  {
    nameAr: 'أسامة يوسف الدولتلي',
    nameEn: 'Osama Yousif Al-Dawtali',
    titleAr: 'رئيس لجنة الاستثمار - الرئيس التنفيذي للتطوير',
    titleEn: 'Chairman, Investment Committee - Chief Development Officer',
    descriptionAr:
      'يمتلك خبرة واسعة في التطوير العقاري وإدارة المشاريع، وقاد مشاريع استراتيجية كبرى أسهمت في تعزيز محفظة الشركة بخبرة تنفيذية تتجاوز 25 عاماً.',
    descriptionEn:
      'Seasoned leader in real estate development and project management who has led major strategic initiatives that strengthened the company portfolio, backed by over 25 years of execution experience.',
    image: osamaImg,
  },
  {
    nameAr: 'طارق بن سعيدان',
    nameEn: 'Tariq Bin Saedan',
    titleAr: 'رئيس مجلس الإدارة',
    titleEn: 'Chairman of the Board',
    descriptionAr:
      'يتمتع بخبرة تتجاوز 25 عاماً في إدارة الاستثمارات العقارية وتطوير الأعمال، ويتميز برؤية استراتيجية شاملة وقدرة عالية على تحويل الفرص الاستثمارية إلى مشاريع ذات قيمة مضافة.',
    descriptionEn:
      'Brings 25+ years in real estate investment management and business development, with a strategic outlook and strong capability to transform opportunities into high-value projects.',
    image: tariqImg,
  },
  {
    nameAr: 'عبدالعزيز عوجان الرشيدي',
    nameEn: 'Abdulaziz Awjan Al-Rashidi',
    titleAr: 'عضو مجلس الإدارة',
    titleEn: 'Board Member',
    descriptionAr:
      'يمتلك خبرة تتجاوز 25 عاماً في قيادة الاستراتيجيات المالية والاستثمارية، وقاد عمليات تمويل لمشاريع كبيرة وأسهم في تعزيز كفاءة رأس المال وتحقيق نمو مستدام للمجموعة.',
    descriptionEn:
      'Board member with more than 25 years in financial and investment strategy leadership, driving large-scale project financing and capital-efficiency initiatives for sustainable growth.',
    image: abdulazizRashidiImg,
  },
  {
    nameAr: 'عبدالعزيز الفريدي',
    nameEn: 'Abdulaziz Al-Furaidi',
    titleAr: 'عضو مجلس الإدارة',
    titleEn: 'Board Member',
    descriptionAr:
      'قيادي تنفيذي بخبرة تتجاوز 21 عاماً في إدارة المشاريع الكبرى والعمليات الاستراتيجية، مع قدرة متميزة على بناء فرق عالية الأداء وتحويل التحديات إلى فرص نمو.',
    descriptionEn:
      'Executive leader with 21+ years in mega projects and strategic operations, known for building high-performance teams and turning complex challenges into growth opportunities.',
    image: abdulazizSalehImg,
  },
]

export type LocalizedBoardMember = {
  name: string
  title: string
  description: string
  image: string
}

export function getBoardMembers(language: string): LocalizedBoardMember[] {
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
