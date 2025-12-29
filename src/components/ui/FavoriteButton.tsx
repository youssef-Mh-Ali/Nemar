import { IconButton, Tooltip } from '@mui/material'
import { Favorite, FavoriteBorder } from '@mui/icons-material'
import { useFavoritesStore } from '../../lib/store/favorites-store'
import { useToastStore } from '../../lib/store/toast-store'

interface FavoriteButtonProps {
  unitId: string
  size?: 'small' | 'medium' | 'large'
}

export default function FavoriteButton({ unitId, size = 'medium' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const { addToast } = useToastStore()
  const favorited = isFavorite(unitId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(unitId)
    addToast(favorited ? 'تمت إزالة الوحدة من المفضلة' : 'تمت إضافة الوحدة للمفضلة', 'success')
  }

  return (
    <Tooltip title={favorited ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
      <IconButton
        onClick={handleClick}
        size={size}
        sx={{
          color: favorited ? 'error.main' : 'text.secondary',
          '&:hover': {
            color: 'error.main',
            bgcolor: 'error.main' + '10',
          },
          transition: 'all 0.2s',
        }}
      >
        {favorited ? <Favorite /> : <FavoriteBorder />}
      </IconButton>
    </Tooltip>
  )
}

