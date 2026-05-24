import { useState, useRef, useEffect } from 'react'
import { 
  Box, 
  IconButton, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Avatar, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Slide,
  Fade
} from '@mui/material'
import { MessageCircle, X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useChatStore } from '../../lib/chatbot/store'

export default function SaraBot() {
  const { t, i18n } = useTranslation()
  const { 
    isOpen, 
    toggleChat, 
    messages, 
    currentStep, 
    inputType, 
    options, 
    handleOptionSelect, 
    handleTextInput,
    resetChat
  } = useChatStore()
  
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const isRtl = i18n.language.startsWith('ar')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen, currentStep, options])

  const onSubmitText = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) {
      handleTextInput(inputText)
      setInputText('')
    }
  }

  // Common regions in Saudi Arabia
  const saudiRegions = [
    'Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Qassim', 
    'Aseer', 'Tabuk', 'Hail', 'Northern Borders', 'Jazan', 'Najran', 'Al Baha', 'Al Jouf'
  ]

  const saudiRegionsAr = [
    'الرياض', 'مكة المكرمة', 'المدينة المنورة', 'المنطقة الشرقية', 'القصيم', 
    'عسير', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة', 'الجوف'
  ]

  return (
    <>
      {/* Floating Action Button */}
      <Box sx={{
        position: 'fixed',
        bottom: 30,
        [isRtl ? 'left' : 'right']: 30,
        zIndex: 9999
      }}>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <IconButton
            onClick={toggleChat}
            sx={{
              width: 60,
              height: 60,
              backgroundColor: '#102d4a',
              color: 'white',
              boxShadow: '0 8px 24px rgba(16, 45, 74, 0.4)',
              '&:hover': { backgroundColor: '#1e4670' }
            }}
          >
            {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
          </IconButton>
        </motion.div>
      </Box>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
            <Paper
              elevation={24}
              sx={{
                position: 'fixed',
                bottom: 100,
                [isRtl ? 'left' : 'right']: 30,
                width: { xs: 'calc(100vw - 60px)', sm: 380 },
                height: { xs: 'calc(100vh - 140px)', sm: 600 },
                maxHeight: 700,
                zIndex: 9998,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif"
              }}
            >
              {/* Header */}
              <Box sx={{
                bgcolor: '#102d4a',
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 10
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src="/images/sara-avatar.jpg" alt="Sara" sx={{ bgcolor: 'white', width: 40, height: 40 }}>
                    <Typography color="#102d4a" fontWeight="bold">S</Typography>
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                      {isRtl ? 'سارة العتيبي' : 'Sara Al Otaibi'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
                      {isRtl ? 'متصل' : 'Online'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
                  <X size={20} />
                </IconButton>
              </Box>

              {/* Messages Area */}
              <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                bgcolor: '#f8fafc'
              }}>
                {messages.map((msg, index) => {
                  const isBot = msg.type === 'bot'
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        alignSelf: isBot ? (isRtl ? 'flex-end' : 'flex-start') : (isRtl ? 'flex-start' : 'flex-end'),
                        maxWidth: '85%'
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1, flexDirection: isBot ? 'row' : 'row-reverse' }}>
                        {isBot && (
                          <Avatar src="/images/sara-avatar.jpg" sx={{ width: 28, height: 28, bgcolor: '#102d4a', fontSize: '0.8rem', mt: 1 }}>S</Avatar>
                        )}
                        <Box sx={{
                          bgcolor: isBot ? 'white' : '#102d4a',
                          color: isBot ? '#1e293b' : 'white',
                          p: 1.5,
                          px: 2,
                          borderRadius: 3,
                          borderTopLeftRadius: isBot && !isRtl ? 4 : 24,
                          borderTopRightRadius: isBot && isRtl ? 4 : 24,
                          borderBottomRightRadius: !isBot && !isRtl ? 4 : 24,
                          borderBottomLeftRadius: !isBot && isRtl ? 4 : 24,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          typography: 'body2',
                          lineHeight: 1.6,
                        }}>
                          {msg.textKey ? t(msg.textKey) : msg.text}
                        </Box>
                      </Box>
                    </motion.div>
                  )
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{
                p: 2,
                bgcolor: 'white',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                {inputType === 'options' && options.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
                    {options.map((opt) => (
                      <Button
                        key={opt.value}
                        variant="outlined"
                        size="small"
                        onClick={() => handleOptionSelect(opt.value)}
                        sx={{
                          borderRadius: 20,
                          textTransform: 'none',
                          color: '#102d4a',
                          borderColor: '#cbd5e1',
                          '&:hover': { bgcolor: '#f1f5f9', borderColor: '#102d4a' }
                        }}
                      >
                        {t(opt.labelKey)}
                      </Button>
                    ))}
                  </Box>
                )}

                {(inputType === 'text' || inputType === 'phone') && (
                  <form onSubmit={onSubmitText} style={{ display: 'flex', gap: '8px' }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder={isRtl ? 'اكتب هنا...' : 'Type here...'}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      type={inputType === 'phone' ? 'tel' : 'text'}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 6,
                          bgcolor: '#f8fafc'
                        }
                      }}
                    />
                    <IconButton 
                      type="submit" 
                      disabled={!inputText.trim()}
                      sx={{ 
                        bgcolor: '#102d4a', 
                        color: 'white', 
                        borderRadius: 3,
                        '&:hover': { bgcolor: '#1e4670' },
                        '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
                      }}
                    >
                      <Send size={20} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                    </IconButton>
                  </form>
                )}

                {inputType === 'country_select' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{isRtl ? 'رمز الدولة' : 'Country Code'}</InputLabel>
                      <Select
                        label={isRtl ? 'رمز الدولة' : 'Country Code'}
                        value={inputText || '+966'}
                        onChange={(e) => {
                          handleOptionSelect(e.target.value)
                        }}
                      >
                        <MenuItem value="+966">+966 (Saudi Arabia)</MenuItem>
                        <MenuItem value="+971">+971 (UAE)</MenuItem>
                        <MenuItem value="+965">+965 (Kuwait)</MenuItem>
                        <MenuItem value="+973">+973 (Bahrain)</MenuItem>
                        <MenuItem value="+974">+974 (Qatar)</MenuItem>
                        <MenuItem value="+968">+968 (Oman)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {inputType === 'region_select' && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(isRtl ? saudiRegionsAr : saudiRegions).map((region, idx) => (
                      <Button
                        key={region}
                        variant="outlined"
                        size="small"
                        onClick={() => handleOptionSelect(saudiRegions[idx])} // Always pass English value for backend
                        sx={{
                          borderRadius: 20,
                          textTransform: 'none',
                          color: '#102d4a',
                          borderColor: '#cbd5e1'
                        }}
                      >
                        {region}
                      </Button>
                    ))}
                  </Box>
                )}

                {currentStep === 'SUCCESS' && (
                  <Button variant="text" fullWidth onClick={resetChat}>
                    {isRtl ? 'بدء محادثة جديدة' : 'Start a new chat'}
                  </Button>
                )}
              </Box>

            </Paper>
          </Slide>
        )}
      </AnimatePresence>
    </>
  )
}
