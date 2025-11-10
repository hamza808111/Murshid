import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, User, BookmarkCheck, LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Navbar = ({ currentPage, onNavigate }: NavbarProps = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  const getCurrentPage = () => {
    if (currentPage) return currentPage;

    if (user?.is_admin) {
      if (location.pathname === '/admin') return 'dashboard';
      if (location.pathname.startsWith('/admin/majors')) return 'admin-majors';
      if (location.pathname.startsWith('/admin/universities')) return 'admin-universities';
      if (location.pathname.startsWith('/admin/university-majors')) return 'admin-universities';
    }

    if (location.pathname === '/') return 'home';
    if (location.pathname === '/majors' || location.pathname.startsWith('/majors/')) return 'majors';
    if (location.pathname === '/universities' || location.pathname.startsWith('/universities/')) return 'universities';
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
        case 'admin-majors':
          navigate('/admin/majors');
          break;
        case 'admin-universities':
          navigate('/admin/universities');
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
        { id: "dashboard", label: language === "ar" ? "لوحة التحكم" : "Dashboard" },
        { id: "admin-majors", label: t("navbar.majors") },
        { id: "admin-universities", label: t("navbar.universities") },
      ]
    : [
        { id: 'home', label: t('navbar.home') },
        { id: 'majors', label: t('navbar.majors') },
        { id: 'universities', label: t('navbar.universities') },
        { id: 'quiz', label: t('navbar.quiz') },
        { id: 'contact', label: t('navbar.contact') },
      ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm" dir="ltr">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10" dir="ltr">
        <div className="flex justify-between items-center h-20">
          <button
            onClick={() => handleNavigate(user?.is_admin ? 'dashboard' : 'home')}
            id="navbar-logo-button"
            className="flex items-center group"
          >
            <img 
              src="/logo4.png" 
              alt="Murshid Logo" 
              className="h-14 object-contain transition-transform group-hover:scale-105"
            />
            <h1 className={`text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 ${language === "ar" ? "leading-normal pb-1.5" : ""}`}>
              {language === "ar" ? "مرشــــد" : "Murshid"}
            </h1>          
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                id={`navbar-nav-${item.id}`}
                className={`px-4 py-2 rounded-xl transition-all ${
                  isActive(item.id)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 hover:!text-blue-700 dark:hover:!text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/bookmarks" id="navbar-bookmarks-link">
                  <Button 
                    variant="outline"
                    className="rounded-xl"
                    id="navbar-bookmarks-button"
                  >
                    <BookmarkCheck className="h-[1.2rem] w-[1.2rem] mr-2" />
                    {language === "ar" ? "المفضلة" : "Bookmarks"}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost"
                      className="rounded-xl"
                      id="navbar-profile-button"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {t('navbar.profile')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" id="navbar-profile-menu-item" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        {language === "ar" ? "عرض الملف الشخصي" : "View Profile"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowLogoutDialog(true)}
                      id="navbar-logout-menu-item"
                      className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('navbar.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" id="navbar-login-link">
                  <Button
                    variant="ghost"
                    className="rounded-xl"
                    id="navbar-login-button"
                  >
                    {t('navbar.login')}
                  </Button>
                </Link>
                <Link to="/signup" id="navbar-signup-link">
                  <Button className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl px-6 shadow-md" id="navbar-signup-button">
                    {t('navbar.signUp')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
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
              {user ? (
                <div className="space-y-3">
                  <Link to="/bookmarks" onClick={() => setMobileMenuOpen(false)} id="navbar-mobile-bookmarks-link" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl"
                      id="navbar-mobile-bookmarks-button"
                    >
                      <BookmarkCheck className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'المفضلة' : 'Bookmarks'}
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start rounded-xl"
                        id="navbar-mobile-profile-button"
                      >
                        <User className="w-4 h-4 mr-2" />
                        {t('navbar.profile')}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} id="navbar-mobile-profile-menu-item" className="cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          {language === "ar" ? "عرض الملف الشخصي" : "View Profile"}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowLogoutDialog(true);
                        }}
                        id="navbar-mobile-logout-menu-item"
                        className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('navbar.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900" dir={language}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
              {t('navbar.logout.confirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              {t('navbar.logout.confirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={language === "ar" ? "flex-row-reverse sm:flex-row-reverse sm:space-x-0 sm:gap-2" : ""}>
            <AlertDialogCancel id="navbar-logout-cancel-button" className="rounded-xl">
              {t('navbar.logout.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                logout();
                navigate('/', { replace: true });
                setShowLogoutDialog(false);
              }}
              id="navbar-logout-confirm-button"
              className="rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {t('navbar.logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </nav>
  );
};

export default Navbar;
