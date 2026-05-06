import { useEffect, useMemo, useState } from 'react'
import { Box, Card, CardContent, Container, Grid, Typography } from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getBoardMembers, loadMissionVisionMarkdown } from '../lib/about/content'

type MarkdownBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.split('\n')
  const blocks: MarkdownBlock[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ type: 'ul', items: listItems })
      listItems = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushList()
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(line.slice(2).trim())
      continue
    }

    flushList()

    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push({ type: 'h2', text: line.slice(2).trim() })
      continue
    }

    blocks.push({ type: 'p', text: line })
  }

  flushList()
  return blocks
}

function extractVisionMission(blocks: MarkdownBlock[]) {
  let section: 'vision' | 'mission' | null = null
  const vision: string[] = []
  const mission: string[] = []

  for (const block of blocks) {
    if (block.type === 'h2') {
      const normalized = block.text.toLowerCase()
      if (normalized === 'vision' || normalized === 'الرؤية') {
        section = 'vision'
      } else if (normalized === 'mission' || normalized === 'الرسالة') {
        section = 'mission'
      } else {
        section = null
      }
      continue
    }

    if (!section) continue

    if (section === 'vision') {
      if (block.type === 'p') vision.push(block.text)
    } else if (section === 'mission') {
      if (block.type === 'ul') mission.push(...block.items)
      if (block.type === 'p') mission.push(block.text)
    }
  }

  return { vision, mission }
}

export default function AboutUs() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage || i18n.language
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)

  const members = useMemo(() => getBoardMembers(language), [language])
  const markdownBlocks = useMemo(() => parseMarkdown(markdown), [markdown])
  const { vision, mission } = useMemo(() => extractVisionMission(markdownBlocks), [markdownBlocks])

  useEffect(() => {
    let active = true
    const loadContent = async () => {
      setLoading(true)
      try {
        const content = await loadMissionVisionMarkdown(language)
        if (active) setMarkdown(content)
      } catch {
        if (active) setMarkdown('')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadContent()
    return () => {
      active = false
    }
  }, [language])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', px: { xs: 2, md: 3 }, py: 6, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {t('about.title')}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '48rem', mx: 'auto' }}>
              {t('about.subtitle')}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {t('about.companyIntroTitle')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                {t('about.companyIntroBody')}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {t('about.boardMembersTitle')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {members.map((member, index) => (
            <Grid key={member.name} size={{ xs: 12, md: 6, lg: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                style={{ height: '100%' }}
              >
                <Card sx={{ height: '100%' }}>
                  <Box
                    sx={{
                      height: 320,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                    }}
                  >
                    <Box
                      component="img"
                      src={member.image}
                      alt={member.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center top',
                        borderRadius: 1.5,
                        bgcolor: 'white',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1.25, fontWeight: 600 }}>
                      {member.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {loading ? (
                <Card>
                  <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Typography color="text.secondary">{t('common.loading')}</Typography>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  sx={{
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 10px 30px rgba(2, 6, 23, 0.08)',
                    overflow: 'hidden',
                    bgcolor: 'common.white',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: 999,
                        px: 2,
                        py: 0.65,
                        bgcolor: 'grey.100',
                        color: 'primary.main',
                        fontWeight: 700,
                        letterSpacing: '0.28em',
                        textTransform: 'uppercase',
                        fontSize: 12,
                      }}
                    >
                      {language.startsWith('en') ? 'VISION' : 'الرؤية'}
                    </Box>
                    <Box sx={{ mt: 2, display: 'grid', gap: 1.25 }}>
                      {vision.map((p, idx) => (
                        <Typography key={idx} variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                          {p}
                        </Typography>
                      ))}
                    </Box>

                    <Box sx={{ my: 3, height: 1, bgcolor: 'divider' }} />

                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: 999,
                        px: 2,
                        py: 0.65,
                        bgcolor: 'grey.100',
                        color: 'primary.main',
                        fontWeight: 700,
                        letterSpacing: '0.28em',
                        textTransform: 'uppercase',
                        fontSize: 12,
                      }}
                    >
                      {language.startsWith('en') ? 'MISSION' : 'الرسالة'}
                    </Box>

                    <Box sx={{ mt: 2, display: 'grid', gap: 1.4 }}>
                      {mission.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                          <CheckCircleRoundedIcon sx={{ mt: '2px', fontSize: 18, color: 'rgba(201, 162, 39, 1)' }} />
                          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                  borderRadius: 4,
                  border: '1px solid rgba(201, 162, 39, 0.18)',
                  backgroundImage: 'linear-gradient(135deg, #0b1b33 0%, #16325c 100%)',
                  boxShadow: '0 20px 50px -20px rgba(2, 6, 23, 0.35)',
                }}
              >
                <CardContent sx={{ p: 3.25, minHeight: 320, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'radial-gradient(rgba(201,162,39,0.22) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.7)' }}>
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: 'rgba(201,162,39,0.95)' }} />
                    <Typography sx={{ fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 700 }}>
                      2030
                    </Typography>
                  </Box>

                  {/* Orb */}
                  <Box
                    sx={{
                      width: 190,
                      height: 190,
                      borderRadius: '50%',
                      position: 'absolute',
                      top: -48,
                      right: -42,
                      background:
                        'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, rgba(201,162,39,0.65) 42%, rgba(201,162,39,0.08) 72%)',
                      opacity: 0.85,
                    }}
                  />

                  {/* Bottom content */}
                  <Box sx={{ position: 'absolute', left: 26, right: 26, bottom: 26 }}>
                    <Typography variant="h4" sx={{ color: 'common.white', fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {t('about.animatedPanelTitle')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mt: 1.25, lineHeight: 1.9, maxWidth: 380 }}>
                      {t('about.animatedPanelBody')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
