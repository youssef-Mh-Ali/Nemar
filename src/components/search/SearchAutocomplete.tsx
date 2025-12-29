import { useState, useEffect, useRef } from 'react'
import { Autocomplete, TextField, Box, Typography, Chip, IconButton } from '@mui/material'
import { Search, X, Clock } from 'lucide-react'
import { useToastStore } from '../../lib/store/toast-store'

interface SearchSuggestion {
  id: string
  label: string
  type: 'project' | 'phase' | 'recent' | 'popular'
}

interface SearchAutocompleteProps {
  onSelect: (value: string) => void
  placeholder?: string
}

const POPULAR_SEARCHES: SearchSuggestion[] = [
  { id: '1', label: 'شقق للبيع في الرياض', type: 'popular' },
  { id: '2', label: 'فلل في جدة', type: 'popular' },
  { id: '3', label: 'وحدات سكنية', type: 'popular' },
  { id: '4', label: 'مشاريع جديدة', type: 'popular' },
]

export default function SearchAutocomplete({ onSelect, placeholder = 'ابحث عن مشروع أو مرحلة...' }: SearchAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([])
  const { addToast } = useToastStore()
  const debounceTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('binsaedan-recent-searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return

    const newRecent: SearchSuggestion = {
      id: `recent-${Date.now()}`,
      label: search,
      type: 'recent',
    }

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.label.toLowerCase() !== search.toLowerCase())
      const updated = [newRecent, ...filtered].slice(0, 5) // Keep last 5
      localStorage.setItem('binsaedan-recent-searches', JSON.stringify(updated))
      return updated
    })
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('binsaedan-recent-searches')
    addToast('تم مسح البحث السابق', 'success')
  }

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (!inputValue.trim()) {
      setSuggestions([...recentSearches, ...POPULAR_SEARCHES])
      return
    }

    debounceTimer.current = setTimeout(() => {
      // Mock search - replace with actual API call
      const mockResults: SearchSuggestion[] = [
        { id: 'p1', label: `مشروع ${inputValue}`, type: 'project' },
        { id: 'ph1', label: `مرحلة ${inputValue}`, type: 'phase' },
      ]
      setSuggestions([...mockResults, ...recentSearches.filter((s) => s.label.toLowerCase().includes(inputValue.toLowerCase()))])
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [inputValue, recentSearches])

  const handleSelect = (value: string | SearchSuggestion | null) => {
    if (!value) return

    const searchValue = typeof value === 'string' ? value : value.label
    saveRecentSearch(searchValue)
    onSelect(searchValue)
    setInputValue('')
  }

  const options = suggestions.map((suggestion) => ({
    ...suggestion,
    label: suggestion.label,
  }))

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
      inputValue={inputValue}
      onInputChange={(_, newValue) => setInputValue(newValue)}
      onChange={(_, value) => handleSelect(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: <Search size={20} style={{ marginRight: 8, color: '#666' }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              borderRadius: 2,
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        const suggestion = typeof option === 'string' ? null : option
        if (!suggestion) return null

        return (
          <Box
            component="li"
            {...props}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1.5,
              px: 2,
            }}
          >
            {suggestion.type === 'recent' && <Clock size={16} color="#999" />}
            {suggestion.type === 'popular' && <Search size={16} color="#999" />}
            <Typography variant="body2" sx={{ flex: 1 }}>
              {suggestion.label}
            </Typography>
            {suggestion.type === 'popular' && (
              <Chip label="شائع" size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
            )}
          </Box>
        )
      }}
      ListboxProps={{
        sx: {
          maxHeight: 400,
        },
      }}
      noOptionsText={
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            لا توجد نتائج
          </Typography>
          {recentSearches.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                البحث السابق:
              </Typography>
              <IconButton size="small" onClick={clearRecentSearches}>
                <X size={16} />
              </IconButton>
            </Box>
          )}
        </Box>
      }
      sx={{ width: '100%' }}
    />
  )
}

