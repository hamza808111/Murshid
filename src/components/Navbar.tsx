import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";

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
  
  // Use props if provided, otherwise use location-based detection
  const getCurrentPage = () => {
    if (currentPage) return currentPage;
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/majors') return 'majors';
    if (location.pathname === '/universities') return 'universities';
    if (location.pathname === '/assessment') return 'quiz';
    if (location.pathname === '/profile') return 'profile';
    return 'home';
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      // Default navigation based on page
      switch (page) {
        case 'home':
          navigate('/');
          break;
        case 'majors':
          navigate('/majors');
          break;
        case 'universities':
          navigate('/universities');
          break;
        case 'quiz':
          if (user) {
            navigate('/assessment');
          } else {
            navigate('/login');
          }
          break;
        case 'contact':
          // You can implement contact page later
          break;
        default:
          navigate('/');
      }
    }
  };

  const isActive = (page: string) => getCurrentPage() === page;

  const navItems = [
    { id: 'home', label: t('navbar.home') },
    { id: 'majors', label: t('navbar.majors') },
    { id: 'universities', label: t('navbar.universities') },
    { id: 'quiz', label: t('navbar.quiz') },
    { id: 'contact', label: t('navbar.contact') },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm" dir="ltr">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="ltr">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-blue-400 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-gray-800 dark:text-gray-200 text-xl font-semibold">Murshid</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
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

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme and Language Toggles */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            
            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile">
                  <Button 
                    variant="ghost"
                    className="rounded-xl"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t('navbar.profile')}
                  </Button>
                </Link>
                <Button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  variant="outline"
                  className="rounded-xl border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('navbar.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="rounded-xl"
                  >
                    {t('navbar.login')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl px-6 shadow-md">
                    {t('navbar.signUp')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

      {/* Mobile Menu */}
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
                className={`w-full text-right px-4 py-3 rounded-xl transition-all ${
                  isActive(item.id)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 hover:!text-blue-700 dark:hover:!text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 space-y-2 border-t border-gray-100 dark:border-gray-800">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {t('navbar.profile')}
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    variant="outline"
                    className="w-full rounded-xl border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('navbar.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {t('navbar.login')}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl">
                      {t('navbar.signUp')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
