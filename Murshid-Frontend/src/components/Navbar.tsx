import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, User, Bookmark, LayoutDashboard, MoreHorizontal, ChevronDown ,MessageSquare, BarChart3  } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useMessaging } from "@/contexts/MessagingContext";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Navbar = ({ currentPage, onNavigate }: NavbarProps = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, language } = useI18n();
  const { totalBookmarks, animateBookmark } = useBookmarks();
  const { totalUnreadCount } = useMessaging();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSpecialist = !!user && (user.role?.toLowerCase?.() === 'specialist');

  // Check if user is currently on the messages page
  const isOnMessagesPage = location.pathname === '/messages' || location.pathname.startsWith('/messages/');
  
  const getCurrentPage = () => {
    if (currentPage) return currentPage;

    if (user?.is_admin) {
      if (location.pathname === '/admin') return 'dashboard';
      if (location.pathname.startsWith('/admin/analytics')) return 'admin-analytics';
      if (location.pathname.startsWith('/admin/majors')) return 'admin-majors';
      if (location.pathname.startsWith('/admin/universities')) return 'admin-universities';
      if (location.pathname.startsWith('/admin/university-majors')) return 'admin-universities';
    }

    if (location.pathname === '/') return 'home';
    if (location.pathname === '/majors' || location.pathname.startsWith('/majors/')) return 'majors';
    if (location.pathname === '/universities' || location.pathname.startsWith('/universities/')) return 'universities';
    if (location.pathname === '/community' || location.pathname.startsWith('/community/')) return 'community';
    if (location.pathname === '/contact') return 'contact';
    if (location.pathname === '/help') return 'help';
    if (location.pathname === '/assessment') return 'quiz';
    if (location.pathname === '/profile') return 'profile';
    return 'home';
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      switch (page) {
        case 'home':
          navigate('/');
          break;
        case 'dashboard':
          navigate('/admin');
          break;
        case 'majors':
          if (user?.is_admin) {
            navigate('/admin/majors');
          } else {
            navigate('/majors');
          }
          break;
        case 'universities':
          if (user?.is_admin) {
            navigate('/admin/universities');
          } else {
            navigate('/universities');
          }
          break;
        case 'community':
          if (user) {
            navigate('/community');
          } else {
            toast.error(language === 'ar' ? 'الرجاء تسجيل الدخول للانضمام إلى المجتمع' : 'Please login to join the community');
            navigate('/login');
          }
          break;
        case 'contact':
          navigate('/contact');
          break;
        case 'help':
          navigate('/help');
          break;
        case 'admin-majors':
          navigate('/admin/majors');
          break;
        case 'admin-universities':
          navigate('/admin/universities');
          break;
        case 'admin-analytics':
          navigate('/admin/analytics');
          break;
        case 'quiz':
          if (user) {
            navigate('/assessment');
          } else {
            navigate('/login');
          }
          break;
        case 'contact':
          break;
        default:
          navigate('/');
      }
    }
  };

  const isActive = (page: string) => getCurrentPage() === page;

  // Dynamic nav items based on user role
  const navItems = user?.is_admin
    ? [
        { id: "dashboard", label: language === "ar" ? "لوحة التحكم" : "Dashboard", priority: 1 },
        { id: "admin-analytics", label: language === "ar" ? "التحليلات" : "Analytics", priority: 2 },
        { id: "admin-majors", label: t("navbar.majors"), priority: 3 },
        { id: "admin-universities", label: t("navbar.universities"), priority: 4 },
      ]
    : [
        { id: 'home', label: t('navbar.home'), priority: 1 },
        { id: 'majors', label: t('navbar.majors'), priority: 2 },
        { id: 'universities', label: t('navbar.universities'), priority: 3 },
        { id: 'community', label: language === 'ar' ? 'المجتمع' : 'Community', priority: 4 },
        ...(!isSpecialist ? [{ id: 'quiz', label: t('navbar.quiz'), priority: 5 } as const] : []),
        { id: 'help', label: language === 'ar' ? 'المساعدة' : 'Help', priority: 6 },
        { id: 'contact', label: t('navbar.contact'), priority: 7 },
      ];

  // Split items for responsive design
  // Dynamic visible count between md and xl to progressively collapse one-by-one
  const [visibleCount, setVisibleCount] = useState(5);
  useEffect(() => {
    const updateVisible = () => {
      const w = window.innerWidth;
      if (w >= 1240) setVisibleCount(5);
      else if (w >= 1170) setVisibleCount(4);
      else if (w >= 1100) setVisibleCount(3);
      else if (w >= 1030) setVisibleCount(2);
      else setVisibleCount(1);
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm" dir="ltr">
      <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-10" dir="ltr">
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Logo - Fixed width, never shrinks */}
          <button
            onClick={() => handleNavigate(user?.is_admin ? 'dashboard' : 'home')}
            id="navbar-logo-button"
            className="flex items-center group transition-all duration-300 hover:opacity-80 p-2 md:p-3 flex-shrink-0"
          >
             <img 
              src="/logo4.png" 
              alt="Murshid Logo" 
              className="h-12 md:h-14 object-contain transition-transform group-hover:scale-105"
            />
            <h1 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 ${language === "ar" ? "leading-normal pb-1.5" : ""}`}>
              {language === "ar" ? "مرشــــد" : "Murshid"}
            </h1>          
          </button>

          {/* Navigation - Flexible, can shrink but never overlap sides */}
          <div className="flex-1 flex justify-center items-center min-w-0">
            {/* Desktop Navigation - Show all items on large screens */}
            <div className="hidden xl:flex items-center gap-1 flex-nowrap">
              {navItems
                .filter((item) => !user?.is_admin && (item.id === 'help' || item.id === 'contact') ? false : true)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    id={`navbar-nav-${item.id}`}
                    className={`px-4   py-2 rounded-xl transition-all whitespace-nowrap text-md ${
                      isActive(item.id)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 hover:!text-blue-700 dark:hover:!text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              {/* More dropdown for Help and Contact at 100% zoom */}
              {!user?.is_admin && navItems.some(item => item.id === 'help' || item.id === 'contact') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-2 rounded-xl transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 text-md whitespace-nowrap">
                      {language === 'ar' ? 'المزيد' : 'More'}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {navItems
                      .filter((item) => item.id === 'help' || item.id === 'contact')
                      .map((item) => (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => handleNavigate(item.id)}
                          className={`cursor-pointer ${
                            isActive(item.id)
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : ''
                          }`}
                        >
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* md..xl-1 screens - progressively collapse one-by-one into More */}
            <div className="hidden md:flex xl:hidden items-center gap-1 flex-nowrap">
              {navItems.slice(0, Math.min(visibleCount, navItems.length)).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  id={`navbar-nav-${item.id}`}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap text-md ${
                    isActive(item.id)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 hover:!text-blue-700 dark:hover:!text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {navItems.length > visibleCount && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-2 rounded-xl transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 text-md whitespace-nowrap">
                      {language === 'ar' ? 'المزيد' : 'More'}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {navItems.slice(visibleCount).map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`cursor-pointer ${
                          isActive(item.id)
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : ''
                        }`}
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Right side - User actions - Fixed width, never shrinks */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            
            {loading ? (
              <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                {!user.is_admin && (
                  <>
                    <NotificationBell />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link to="/messages" id="navbar-messages-link" className="relative">
                            <Button
                              variant="outline"
                              size="icon"
                              id="navbar-messages-button"
                              className="relative h-9 w-9"
                            >
                              <MessageSquare className="h-4 w-4" />
                              {totalUnreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                                </span>
                              )}
                              <span className="sr-only">Messages</span>
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{language === 'ar' ? 'الرسائل' : 'Messages'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
                {!user.is_admin && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/bookmarks" id="navbar-bookmarks-link" className="relative">
                          <Button
                            variant="outline"
                            size="icon"
                            id="navbar-bookmarks-button"
                            className={`relative transition-transform duration-300 h-9 w-9 ${
                              animateBookmark ? 'animate-pulse scale-110' : ''
                            }`}
                          >
                            <Bookmark className="h-4 w-4" />
                            {totalBookmarks > 0 && (
                              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                {totalBookmarks > 99 ? '99+' : totalBookmarks}
                              </span>
                            )}
                            <span className="sr-only">Bookmarks</span>
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{language === 'ar' ? 'المحفوظات' : 'Bookmarks'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Link to="/profile" id="navbar-profile-link">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl"
                    id="navbar-profile-button"
                  >
                    <User className="w-4 h-4 mr-1" />
                    <span className="hidden xl:inline">{t('navbar.profile')}</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" id="navbar-login-link">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl"
                    id="navbar-login-button"
                  >
                    {t('navbar.login')}
                  </Button>
                </Link>
                <Link to="/signup" id="navbar-signup-link">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl px-4 shadow-md" 
                    id="navbar-signup-button"
                  >
                    {t('navbar.signUp')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1 flex-shrink-0">
            <ThemeToggle />
            {/* Mobile - Always show Notifications icon */}
            {user && !user.is_admin && <NotificationBell />}
            {/* Mobile - Always show Messages icon */}
            {user && !user.is_admin && (
              <Link to="/messages" id="navbar-mobile-messages-top-link" className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  id="navbar-mobile-messages-top-button"
                  className="relative h-9 w-9 rounded-xl"
                >
                  <MessageSquare className="h-4 w-4" />
                  {totalUnreadCount > 0 && !isOnMessagesPage  && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
                  <span className="sr-only">Messages</span>
                </Button>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="navbar-mobile-menu-toggle"
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  handleNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                id={`navbar-mobile-nav-${item.id}`}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  isActive(item.id)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 hover:!text-blue-700 dark:hover:!text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 space-y-3 border-t border-gray-100 dark:border-gray-800">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl"></div>
                </div>
              ) : user ? (
                <div className="space-y-3">
                  {!user.is_admin && (
                    <Link to="/messages" onClick={() => setMobileMenuOpen(false)} id="navbar-mobile-messages-link" className="block">
                      
                    </Link>
                  )}
                  {!user.is_admin && (
                    <Link to="/bookmarks" onClick={() => setMobileMenuOpen(false)} id="navbar-mobile-bookmarks-link" className="block">
                      <Button
                        variant="outline"
                        className={`w-full justify-start rounded-xl transition-transform duration-300 ${
                          animateBookmark ? 'animate-pulse scale-105' : ''
                        }`}
                        id="navbar-mobile-bookmarks-button"
                      >
                        <div className="relative flex items-center">
                          <Bookmark className="w-4 h-4 mr-2" />
                          {language === 'ar' ? 'المحفوظات' : 'Bookmarks'}
                          {totalBookmarks > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                              {totalBookmarks > 99 ? '99+' : totalBookmarks}
                            </span>
                          )}
                        </div>
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} id="navbar-mobile-profile-link" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl"
                      id="navbar-mobile-profile-button"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {t('navbar.profile')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} id="navbar-mobile-login-link" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl"
                      id="navbar-mobile-login-button"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {t('navbar.login')}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} id="navbar-mobile-signup-link" className="block">
                    <Button className="w-full justify-start bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl" id="navbar-mobile-signup-button">
                      {t('navbar.signUp')}
                    </Button>
                  </Link>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{language === 'ar' ? 'اللغة' : 'Language'}</span>
                  <LanguageToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;
