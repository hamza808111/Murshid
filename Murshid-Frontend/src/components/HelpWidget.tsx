import { useState, useRef, useEffect } from 'react';
import { HelpCircle, Mail, X, FileQuestion } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useI18n();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide widget on mobile when typing (focus in inputs/textareas/contenteditable)
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
      if (el.getAttribute('contenteditable') === 'true') return true;
      return false;
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (!isMobile) return;
      if (isTypingTarget(e.target)) {
        setIsOpen(false);
        setIsVisible(false);
      }
    };

    const handleFocusOut = () => {
      if (!isMobile) return;
      // Small delay to wait for keyboard dismissal
      setTimeout(() => setIsVisible(true), 150);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isMobile]);

  const handleHelpPage = () => {
    navigate('/help');
    setIsOpen(false);
  };

  const handleContactSupport = () => {
    navigate('/contact');
    setIsOpen(false);
    // Scroll to "Get In Touch" section after navigation
    setTimeout(() => {
      const sections = document.querySelectorAll('h2');
      sections.forEach(section => {
        if (section.textContent?.includes('Get In Touch') || section.textContent?.includes('معلومات التواصل')) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }, 300);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (isMobile) {
      setIsVisible(true);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isOpen && !isMobile) {
      setIsVisible(false);
    }
  };

  // --- CORRECTED QUARTER CIRCLE LOGIC (0 - 45 - 90 DEGREES) ---
  const radius = 120; // Radius of the arc

  const menuItems = [
    {
      icon: X,
      label: language === 'ar' ? 'إغلاق' : 'Close',
      onClick: handleClose,
      color: 'from-[#ef4444] to-[#dc2626]',
      // 1. VERTICAL (Top)
      position: { x: -26, y: -radius +2 }, 
    },
    {
      icon: Mail,
      label: language === 'ar' ? 'اتصل بنا' : 'Contact',
      onClick: handleContactSupport,
      color: 'from-[#3b82f6] to-[#2563eb]',
      // 2. DIAGONAL (45 degrees)
      // Math: x = radius * 0.707, y = -radius * 0.707
      position: language === 'ar' 
        ? { x: radius   -80, y: -radius +30 } // Top-Right (Arabic)
        : { x: -radius * 0.707, y: -radius * 0.707 }, // Top-Left (English)
    },
    {
      icon: FileQuestion,
      label: language === 'ar' ? 'المساعدة' : 'Help',
      onClick: handleHelpPage,
      color: 'from-[#3b82f6] to-[#2563eb]',
      // 3. HORIZONTAL (Side)
      position: language === 'ar' 
        ? { x: radius -55, y: -27 } // Right Side (Arabic)
        : { x: -radius , y: -26 }, // Left Side (English)
    },
  ];
  // --- END OF LOGIC ---

  // Hide entirely on Messages pages (any /messages route)
  if (location.pathname === '/messages' || location.pathname.startsWith('/messages/')) {
    return null;
  }

  if (isMobile && !isVisible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // LTR = Right side of screen, RTL = Left side of screen
      className={`fixed ${language === 'ar' ? 'left-4' : 'right-4'} bottom-4 z-50 transition-all duration-300`}
      style={{ 
        opacity: isVisible ? 1 : (isMobile ? 0 : 1),
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
      }}
    >
      <div className="relative w-14 h-14 md:w-16 md:h-16">
        {/* Circular Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <>
              {menuItems.map((item, index) => {
                // Determine tooltip position based on button location
                const isTop = index === 0; 
                
                let tooltipClass = '';
                if (isTop) {
                  tooltipClass = 'bottom-16 left-1.3 -translate-x-1/2'; // Above/Center
                } else if (language === 'ar') {
                  tooltipClass = 'right-16 top-1/2 -translate-y-1/2'; // Left of button (for RTL widget on left) -> Actually, widget is on left, tooltip should be right
                } else {
                  tooltipClass = 'left-16 top-1/2 -translate-y-1/2'; // Left of button (for LTR widget on right)
                }
                
                // Arrow Logic
                let arrowClass = '';
                if (isTop) {
                  arrowClass = 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r'; 
                } else if (language === 'ar') {
                  arrowClass = 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t'; // Arrow on right side of tooltip
                } else {
                  arrowClass = 'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b'; // Arrow on left side of tooltip
                }

                // For RTL side button, tooltip needs to be on the right
                // For LTR side button, tooltip needs to be on the left
                // Correcting tooltip logic specifically:
                if (!isTop) {
                     if (language === 'ar') {
                        tooltipClass = 'left-16 top-1/2 -translate-y-1/2'; // If widget is on Left, Tooltip goes Right (positive X relative to button)? No, 'left-16' class usually puts it to the left.
                        // Let's use explicit positioning classes
                        tooltipClass = 'left-full ml-3 top-2.5 -translate-y-1/2'; // Push to the right of the button
                        arrowClass = 'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b'; // Arrow on left
                     } else {
                        tooltipClass = 'right-full mr-3 top-2.5 -translate-y-1/2'; // Push to the left of the button
                        arrowClass = 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t'; // Arrow on right
                     }
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      scale: 1, 
                      x: item.position.x, 
                      y: item.position.y 
                    }}
                    exit={{ scale: 0, x: 0, y: 0 }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                      delay: index * 0.05 
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <motion.button
                      onClick={item.onClick}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r ${item.color} text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center relative border-2 border-white/20`}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                      
                      {/* Tooltip - Desktop Only */}
                      {!isMobile && (
                        <AnimatePresence>
                          {hoveredItem === index && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className={`absolute whitespace-nowrap bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm font-medium shadow-xl pointer-events-none border border-gray-200 dark:border-gray-700 ${tooltipClass}`}
                            >
                              {item.label}
                              <div 
                                className={`absolute w-2 h-2 bg-white dark:bg-gray-800 rotate-45 border-gray-200 dark:border-gray-700 ${arrowClass}`}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          onClick={() => {
            if (isMobile && isOpen) {
              setIsVisible(true);
              setIsOpen(false);
            } else {
              setIsOpen(!isOpen);
            }
          }}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#4f46e5] text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center relative border-2 border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            rotate: isOpen ? 180 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HelpCircle className="w-6 h-6 md:w-7 md:h-7" />
              </motion.div>
            ) : (
              <motion.div
                key="help"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HelpCircle className="w-6 h-6 md:w-7 md:h-7" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse animation when closed */}
          {!isOpen && isVisible && (
            <motion.div
              className="absolute inset-0 rounded-full bg-[#3b82f6]"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 0, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
}