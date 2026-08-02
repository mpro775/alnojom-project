import {
  LoginRoundedIcon,
  MenuRoundedIcon,
  StorefrontRoundedIcon,
} from './components/icons';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AdminLoginPage } from './features/auth/admin-login-page';
import { AdminAcceptInvitePage } from './features/auth/admin-accept-invite-page';
import { AdminDashboard } from './features/admin/admin-dashboard';
import { useAdminSession } from './features/admin/use-admin-session';
import type { AdminSession } from './features/admin/types';
import {
  ADMIN_ROUTE,
  canonicalizeLegacyAdminUrl,
  isLegacyAdminRoute,
} from './compatibility/legacy-admin-compat';

const THEME_RIPPLE_EXPAND_MS = 680;
const SKIP_LINK_SX = {
  position: 'fixed',
  top: 8,
  insetInlineStart: 8,
  zIndex: 2000,
  transform: 'translateY(-140%)',
  '&:focus': { transform: 'translateY(0)' },
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  px: 1.5,
  py: 1,
  borderRadius: 1,
  fontWeight: 800,
  textDecoration: 'none',
};

type AppRoute = 'login' | 'admin' | 'acceptInvite';
type ThemeMode = 'light' | 'dark';
type ThemeRippleOrigin = { x: number; y: number };
type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
};
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};
type ViewTransitionAnimationOptions = KeyframeAnimationOptions & {
  pseudoElement: string;
};

interface AppProps {
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
}

function resolveRoute(pathname: string): AppRoute {
  if (pathname === '/accept-invite') {
    return 'acceptInvite';
  }

  if (pathname === ADMIN_ROUTE || isLegacyAdminRoute(pathname)) {
    return 'admin';
  }

  return 'login';
}

function resolvePath(route: AppRoute): string {
  switch (route) {
    case 'admin':
      return ADMIN_ROUTE;
    case 'acceptInvite':
      return '/accept-invite';
    case 'login':
    default:
      return '/login';
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function calculateRippleRadius(origin: ThemeRippleOrigin): number {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const farthestX = Math.max(origin.x, width - origin.x);
  const farthestY = Math.max(origin.y, height - origin.y);

  return Math.ceil(Math.hypot(farthestX, farthestY)) + 48;
}

function animateThemeViewTransition(
  origin: ThemeRippleOrigin,
  applyTheme: () => void,
): Promise<void> | null {
  const root = document.documentElement;
  const startViewTransition = (document as ViewTransitionDocument).startViewTransition?.bind(
    document,
  );

  if (!startViewTransition) {
    return null;
  }

  root.setAttribute('data-theme-ripple', 'true');
  let transition: ViewTransition;

  try {
    transition = startViewTransition(applyTheme);
  } catch {
    root.removeAttribute('data-theme-ripple');
    return null;
  }
  const originPoint = `${origin.x}px ${origin.y}px`;
  const radius = calculateRippleRadius(origin);

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [`circle(0px at ${originPoint})`, `circle(${radius}px at ${originPoint})`],
        },
        {
          duration: THEME_RIPPLE_EXPAND_MS,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        } as ViewTransitionAnimationOptions,
      );
    })
    .catch(() => undefined);

  return transition.finished
    .finally(() => {
      root.removeAttribute('data-theme-ripple');
    })
    .catch(() => undefined);
}

export function App({
  themeMode,
  onThemeModeChange,
}: AppProps) {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [session, setSession] = useAdminSession();
  const [route, setRoute] = useState<AppRoute>(() => resolveRoute(window.location.pathname));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isThemeRippleRunningRef = useRef(false);

  const toggleThemeMode = useCallback(
    (origin?: ThemeRippleOrigin): void => {
      const nextMode = themeMode === 'dark' ? 'light' : 'dark';

      if (!origin || prefersReducedMotion()) {
        onThemeModeChange(nextMode);
        return;
      }

      if (isThemeRippleRunningRef.current) {
        return;
      }

      isThemeRippleRunningRef.current = true;
      const transition = animateThemeViewTransition(origin, () => {
        onThemeModeChange(nextMode);
      });

      if (!transition) {
        onThemeModeChange(nextMode);
        isThemeRippleRunningRef.current = false;
        return;
      }

      transition.finally(() => {
        isThemeRippleRunningRef.current = false;
      });
    },
    [onThemeModeChange, themeMode],
  );

  useEffect(() => {
    const compatibilityUrl = canonicalizeLegacyAdminUrl(
      window.location.pathname,
      window.location.search,
      window.location.hash,
    );
    if (compatibilityUrl) {
      window.history.replaceState({}, '', compatibilityUrl);
    }

    const nextRoute = resolveRoute(window.location.pathname);
    const expectedPath = resolvePath(nextRoute);
    if (window.location.pathname !== expectedPath) {
      window.history.replaceState({}, '', expectedPath);
    }

    setRoute(nextRoute);

    const handlePopState = () => {
      const nextCompatibilityUrl = canonicalizeLegacyAdminUrl(
        window.location.pathname,
        window.location.search,
        window.location.hash,
      );
      if (nextCompatibilityUrl) {
        window.history.replaceState({}, '', nextCompatibilityUrl);
      }
      setRoute(resolveRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = useCallback((nextRoute: AppRoute, replace = false): void => {
    const nextPath = resolvePath(nextRoute);
    if (window.location.pathname !== nextPath) {
      if (replace) {
        window.history.replaceState({}, '', nextPath);
      } else {
        window.history.pushState({}, '', nextPath);
      }
    }
    setRoute(nextRoute);
    setMobileDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (route === 'admin' && !session) {
      navigate('login', true);
      return;
    }

    if ((route === 'login' || route === 'acceptInvite') && session) {
      navigate('admin', true);
    }
  }, [navigate, route, session]);

  const navigationItems = useMemo<Array<{ route: AppRoute; label: string; icon: ReactElement }>>(
    () => [
      { route: 'login', label: 'تسجيل الدخول', icon: <LoginRoundedIcon fontSize="small" /> },
      { route: 'admin', label: 'لوحة الإدارة', icon: <StorefrontRoundedIcon fontSize="small" /> },
    ],
    [],
  );

  const shellItems = useMemo(
    () =>
      route === 'admin'
        ? navigationItems.filter((item) => item.route === 'admin')
        : navigationItems,
    [navigationItems, route],
  );

  function renderRouteContent(currentRoute: AppRoute, currentSession: AdminSession | null) {
    if (currentRoute === 'login') {
      return (
        <AdminLoginPage
          onLoggedIn={(nextSession) => {
            setSession(nextSession);
            navigate('admin', true);
          }}
          onBackHome={() => navigate('login')}
        />
      );
    }

    if (currentRoute === 'acceptInvite') {
      return (
        <AdminAcceptInvitePage
          onAccepted={(nextSession) => {
            setSession(nextSession);
            navigate('admin', true);
          }}
          onBackHome={() => navigate('login')}
          onSignIn={() => navigate('login')}
        />
      );
    }

    if (currentRoute === 'admin' && currentSession) {
      return (
        <AdminDashboard
          session={currentSession}
          onSessionUpdate={setSession}
          themeMode={themeMode}
          onToggleThemeMode={toggleThemeMode}
          onSignedOut={() => {
            setSession(null);
            navigate('login', true);
          }}
        />
      );
    }

    return null;
  }

  const activeShellIndex = shellItems.findIndex((item) => item.route === route);
  const isStandalonePage =
    route === 'login' || route === 'acceptInvite';

  if (route === 'admin') {
    return (
      <>
        <Box component="a" href="#admin-main-content" sx={SKIP_LINK_SX}>
          تجاوز إلى المحتوى الرئيسي
        </Box>
        <Box id="admin-main-content">{renderRouteContent(route, session)}</Box>
      </>
    );
  }

  if (isStandalonePage) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: { xs: 1, md: 2 } }}>
        <Box component="a" href="#admin-main-content" sx={SKIP_LINK_SX}>
          تجاوز إلى المحتوى الرئيسي
        </Box>
        <Container maxWidth="xl" id="admin-main-content">{renderRouteContent(route, session)}</Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="fixed" color="inherit" elevation={0}>
        <Toolbar sx={{ gap: 1.5, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {isMobile ? (
              <IconButton onClick={() => setMobileDrawerOpen(true)} aria-label="فتح القائمة">
                <MenuRoundedIcon />
              </IconButton>
            ) : null}
            <Stack spacing={0}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                لوحة إدارة نجوم تليكوم
              </Typography>
              <Typography variant="caption" color="text.secondary">
                المسار الحالي: {resolvePath(route)}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {session ? (
              <Chip
                variant="outlined"
                label={`مرحباً ${session.user.fullName}`}
                icon={<StorefrontRoundedIcon fontSize="small" />}
              />
            ) : (
              <Button size="small" onClick={() => navigate('login')}>
                تسجيل الدخول
              </Button>
            )}
            <Box
              aria-label="Alnjoom Telecom"
              role="img"
              sx={{
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
              }}
            >
              <StorefrontRoundedIcon />
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Drawer
        anchor={isRtl ? 'right' : 'left'}
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileDrawerOpen : true}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderInlineEnd: '1px solid',
            borderColor: 'divider',
            pt: 1,
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 800 }}>
          التنقل
        </Typography>
        <Divider />
        <List
          sx={{
            py: 1,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.route}
              selected={route === item.route}
              onClick={() => navigate(item.route)}
              sx={{ mx: 1, borderRadius: 2, direction: 'rtl' }}
            >
              {item.icon}
              <ListItemText
                sx={{ marginInlineStart: 1, textAlign: 'start' }}
                primary={item.label}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="a" href="#admin-main-content" sx={SKIP_LINK_SX}>
        تجاوز إلى المحتوى الرئيسي
      </Box>

      <Box
        component="main"
        id="admin-main-content"
        sx={{
          marginInlineStart: { xs: 0, md: '280px' },
          pb: isMobile ? 10 : 3,
        }}
      >
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Paper variant="outlined" sx={{ p: { xs: 1.25, md: 2 }, borderRadius: 3 }}>
            {renderRouteContent(route, session)}
          </Paper>
        </Container>
      </Box>

      {isMobile ? (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <BottomNavigation
            value={activeShellIndex >= 0 ? activeShellIndex : 0}
            onChange={(_, nextIndex) => {
              const nextItem = shellItems[nextIndex];
              if (nextItem) {
                navigate(nextItem.route);
              }
            }}
            showLabels
          >
            {shellItems.map((item) => (
              <BottomNavigationAction key={item.route} label={item.label} icon={item.icon} />
            ))}
          </BottomNavigation>
        </Paper>
      ) : null}
    </Box>
  );
}
