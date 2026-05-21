import { create } from 'zustand'

export type MessageType = 'bot' | 'user'
export type InputType = 'none' | 'text' | 'options' | 'country_select' | 'region_select' | 'phone'

export interface ChatMessage {
  id: string
  type: MessageType
  textKey?: string // i18n key for translation
  text?: string // raw text (for user input)
}

export interface ChatOption {
  value: string
  labelKey: string
}

export type ConversationStep = 
  | 'GREETING'
  | 'ASK_NAME'
  | 'ASK_COUNTRY'
  | 'ASK_PHONE'
  | 'ASK_REGION'
  | 'ASK_CITY'
  | 'ASK_CUSTOMER_TYPE'
  | 'SUBMITTING'
  | 'SUCCESS'
  | 'ERROR'

interface ChatState {
  isOpen: boolean
  messages: ChatMessage[]
  currentStep: ConversationStep
  inputType: InputType
  options: ChatOption[]
  leadData: {
    name: string
    country: string
    phone: string
    region: string
    city: string
    customerType: string
  }
  
  // Actions
  toggleChat: () => void
  addMessage: (msg: Omit<ChatMessage, 'id'>) => void
  handleOptionSelect: (value: string) => void
  handleTextInput: (text: string) => void
  resetChat: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [{ id: generateId(), type: 'bot', textKey: 'chatbot.greeting' }],
  currentStep: 'GREETING',
  inputType: 'options',
  options: [
    { value: 'projects', labelKey: 'chatbot.menu.projects' },
    { value: 'services', labelKey: 'chatbot.menu.services' },
    { value: 'contact', labelKey: 'chatbot.menu.contact' }
  ],
  leadData: { name: '', country: '+966', phone: '', region: '', city: '', customerType: '' },

  toggleChat: () => set(state => ({ isOpen: !state.isOpen })),
  
  addMessage: (msg) => set(state => ({ 
    messages: [...state.messages, { ...msg, id: generateId() }] 
  })),

  handleOptionSelect: (value) => {
    const { addMessage, leadData } = get()
    
    // Find the translation key to show the user what they clicked
    const currentOptions = get().options
    const selectedOption = currentOptions.find(o => o.value === value)
    if (selectedOption) {
       addMessage({ type: 'user', textKey: selectedOption.labelKey })
    } else {
       addMessage({ type: 'user', text: value })
    }

    const step = get().currentStep

    if (step === 'GREETING') {
      if (value === 'projects') {
        addMessage({ type: 'bot', textKey: 'chatbot.link.projects' })
        // stay in greeting or show menu again
      } else if (value === 'services') {
        addMessage({ type: 'bot', textKey: 'chatbot.link.services' })
      } else if (value === 'contact') {
        addMessage({ type: 'bot', textKey: 'chatbot.askName' })
        set({ currentStep: 'ASK_NAME', inputType: 'text', options: [] })
      }
    } else if (step === 'ASK_COUNTRY') {
      set({ leadData: { ...leadData, country: value } })
      addMessage({ type: 'bot', textKey: 'chatbot.askPhone' })
      set({ currentStep: 'ASK_PHONE', inputType: 'phone', options: [] })
    } else if (step === 'ASK_REGION') {
      set({ leadData: { ...leadData, region: value } })
      addMessage({ type: 'bot', textKey: 'chatbot.askCity' })
      set({ currentStep: 'ASK_CITY', inputType: 'text', options: [] })
    } else if (step === 'ASK_CUSTOMER_TYPE') {
      set({ leadData: { ...leadData, customerType: value } })
      addMessage({ type: 'bot', textKey: 'chatbot.submitting' })
      set({ currentStep: 'SUBMITTING', inputType: 'none', options: [] })
      
      // TRIGGER SUBMISSION
      submitLeadToSalesforce()
    }
  },

  handleTextInput: (text) => {
    if (!text.trim()) return
    const { addMessage, leadData, currentStep } = get()
    
    addMessage({ type: 'user', text })

    if (currentStep === 'ASK_NAME') {
      set({ leadData: { ...leadData, name: text } })
      addMessage({ type: 'bot', textKey: 'chatbot.askCountry' })
      set({ currentStep: 'ASK_COUNTRY', inputType: 'country_select', options: [] })
    } else if (currentStep === 'ASK_PHONE') {
      set({ leadData: { ...leadData, phone: text } })
      addMessage({ type: 'bot', textKey: 'chatbot.askRegion' })
      set({ currentStep: 'ASK_REGION', inputType: 'region_select', options: [] })
    } else if (currentStep === 'ASK_CITY') {
      set({ leadData: { ...leadData, city: text } })
      addMessage({ type: 'bot', textKey: 'chatbot.askCustomerType' })
      set({ 
        currentStep: 'ASK_CUSTOMER_TYPE', 
        inputType: 'options', 
        options: [
          { value: 'Individual', labelKey: 'chatbot.customerType.individual' },
          { value: 'Company', labelKey: 'chatbot.customerType.company' }
        ] 
      })
    }
  },

  resetChat: () => set({
    messages: [{ id: generateId(), type: 'bot', textKey: 'chatbot.greeting' }],
    currentStep: 'GREETING',
    inputType: 'options',
    options: [
      { value: 'projects', labelKey: 'chatbot.menu.projects' },
      { value: 'services', labelKey: 'chatbot.menu.services' },
      { value: 'contact', labelKey: 'chatbot.menu.contact' }
    ],
    leadData: { name: '', country: '+966', phone: '', region: '', city: '', customerType: '' }
  })
}))

async function submitLeadToSalesforce() {
  const store = useChatStore.getState()
  const payload = store.leadData
  
  try {
    const res = await fetch('/.netlify/functions/salesforce-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.success) {
      useChatStore.getState().addMessage({ type: 'bot', textKey: 'chatbot.success' })
      useChatStore.setState({ currentStep: 'SUCCESS', inputType: 'none', options: [] })
    } else {
      useChatStore.getState().addMessage({ type: 'bot', textKey: 'chatbot.error' })
      useChatStore.setState({ currentStep: 'ERROR', inputType: 'options', options: [{ value: 'contact', labelKey: 'chatbot.retry' }] })
    }
  } catch (err) {
    useChatStore.getState().addMessage({ type: 'bot', textKey: 'chatbot.error' })
    useChatStore.setState({ currentStep: 'ERROR', inputType: 'options', options: [{ value: 'contact', labelKey: 'chatbot.retry' }] })
  }
}
