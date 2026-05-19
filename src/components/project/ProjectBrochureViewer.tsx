import { useEffect, useRef, useState } from 'react';
import { 
  Dialog, 
  IconButton, 
  Box, 
  CircularProgress,
  Typography
} from '@mui/material';
import { X, Maximize, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Flipbook, setWorkerSrc } from 'flippy-pdf';
import 'flippy-pdf/style.css';
import workerUrl from 'flippy-pdf/worker?url';
import { useTranslation } from 'react-i18next';

// Set the worker source for PDF.js parsing
setWorkerSrc(workerUrl);

interface ProjectBrochureViewerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
}

export default function ProjectBrochureViewer({ open, onClose, pdfUrl }: ProjectBrochureViewerProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const flipbookRef = useRef<Flipbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !containerRef.current || !pdfUrl) return;

    setIsLoading(true);
    setError(null);

    // Initialize Flipbook
    const fb = new Flipbook({ 
      container: containerRef.current,
      flipDuration: 800, // Slightly slower for more dramatic effect
      enableDrag: true,
      enableKeyboard: true
    });
    
    flipbookRef.current = fb;

    fb.load(pdfUrl)
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load PDF brochure:', err);
        setError(err.message || 'Failed to load brochure');
        setIsLoading(false);
      });

    return () => {
      fb.destroy();
      flipbookRef.current = null;
    };
  }, [open, pdfUrl]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#1a1a1a', // Dark theme for better contrast with pages
          overflow: 'hidden'
        }
      }}
    >
      {/* Top Toolbar */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 100, 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
        pointerEvents: 'none' // allow clicking through where empty
      }}>
        <Box sx={{ pointerEvents: 'auto' }}>
           {/* Add any left side controls if needed */}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, pointerEvents: 'auto' }}>
          <IconButton onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <X size={24} />
          </IconButton>
        </Box>
      </Box>

      {/* Viewer Container */}
      <Box 
        ref={containerRef} 
        sx={{ 
          width: '100%', 
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Override library default backgrounds if necessary to fit our dark theme
          '& .flippy-container': {
            bgcolor: 'transparent !important'
          }
        }} 
      />

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: '#1a1a1a',
          zIndex: 50,
          color: 'white'
        }}>
          <CircularProgress color="inherit" size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" fontWeight="300">
            {t('project.loadingBrochure', 'Loading Interactive Brochure...')}
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: '#1a1a1a',
          zIndex: 50,
          color: 'white'
        }}>
          <Typography variant="h6" color="error" gutterBottom>
            {t('project.errorLoadingBrochure', 'Failed to load brochure')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {error}
          </Typography>
        </Box>
      )}
    </Dialog>
  );
}
