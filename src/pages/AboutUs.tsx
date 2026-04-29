import { useEffect, useMemo, useState } from 'react'
import { Box, Card, CardContent, Container, Grid, Typography } from '@mui/material'
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

export default function AboutUs() {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage || i18n.language
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(true)

  const members = useMemo(() => getBoardMembers(language), [language])
  const markdownBlocks = useMemo(() => parseMarkdown(markdown), [markdown])

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
              <Card>
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {t('about.visionMissionTitle')}
                  </Typography>
                  {loading ? (
                    <Typography color="text.secondary">{t('common.loading')}</Typography>
                  ) : (
                    <Box sx={{ display: 'grid', gap: 1.5 }}>
                      {markdownBlocks.map((block, index) => {
                        if (block.type === 'h2') {
                          return (
                            <Typography key={index} variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                              {block.text}
                            </Typography>
                          )
                        }
                        if (block.type === 'h3') {
                          return (
                            <Typography key={index} variant="h6" fontWeight="bold" sx={{ mt: 0.5 }}>
                              {block.text}
                            </Typography>
                          )
                        }
                        if (block.type === 'ul') {
                          return (
                            <Box key={index} component="ul" sx={{ m: 0, pl: 2.5, display: 'grid', gap: 0.75 }}>
                              {block.items.map((item, itemIndex) => (
                                <Typography key={itemIndex} component="li" variant="body1" color="text.secondary">
                                  {item}
                                </Typography>
                              ))}
                            </Box>
                          )
                        }
                        return (
                          <Typography key={index} variant="body1" color="text.secondary">
                            {block.text}
                          </Typography>
                        )
                      })}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Card sx={{ height: '100%', overflow: 'hidden', position: 'relative', bgcolor: 'grey.900' }}>
                <CardContent sx={{ p: 3, minHeight: 320, position: 'relative' }}>
                  <Typography variant="h6" sx={{ color: 'common.white', fontWeight: 700 }}>
                    {t('about.animatedPanelTitle')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.300', mt: 1.25, maxWidth: 280 }}>
                    {t('about.animatedPanelBody')}
                  </Typography>
                  <Box
                    sx={{
                      width: 220,
                      height: 220,
                      borderRadius: '50%',
                      position: 'absolute',
                      bottom: -40,
                      right: -30,
                      background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #90caf9 30%, #1976d2 100%)',
                      animation: 'floatPulse 4s ease-in-out infinite',
                      '@keyframes floatPulse': {
                        '0%': { transform: 'translateY(0px) scale(1)' },
                        '50%': { transform: 'translateY(-10px) scale(1.06)' },
                        '100%': { transform: 'translateY(0px) scale(1)' },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
