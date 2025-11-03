# AGENTS.md
## Product Requirements: Apple Weather (Web Application)

### 🧭 Mission
Deliver a beautifully designed, privacy-first **Apple Weather experience as a web application**, offering users hyperlocal, real-time, and forecasted weather insights with a design language inspired by macOS aesthetics.

### 🎯 Objectives
- Provide accurate, real-time weather information through a modern web experience.
- Maintain design consistency with Apple's Human Interface Guidelines (HIG) for visual language and interaction patterns.
- Enable context-aware forecasts using browser geolocation, time, and device state.
- Deliver a responsive, accessible experience across desktop and mobile browsers.

---

## 1. Product Overview
**Apple Weather (Web)** brings the beloved iOS/macOS weather experience to the browser, allowing users to quickly check current conditions, hourly forecasts, and long-term outlooks. It delivers a premium, Apple-quality experience through web technologies with macOS-inspired design principles.

**Value Proposition**
- **Design Excellence:** Apple-quality design language in a web application.
- **Accessibility:** Cross-platform access through any modern browser.
- **Performance:** Fast, responsive interface that feels native-quality.
- **Delight:** Ambient, dynamic visuals that mirror live weather conditions.

---

## 2. User Personas
| Persona | Description | Goals | Pain Points |
|----------|--------------|-------|--------------|
| **Everyday User** | Casual weather checker | Quick glance at temp & rain | Overloaded info, cluttered UI |
| **Commuter / Traveler** | Cross-city or regional user | Reliable short-term forecast | Switching between apps, delays |
| **Outdoor Enthusiast** | Hiker, cyclist, or event planner | Extended & radar forecast | Hard to visualize conditions |
| **Accessibility User** | Vision or motion-sensitive | Screen reader & contrast compliance | Inaccessible data visualizations |

---

## 3. Core Features
| Category | Feature | Description | Priority |
|-----------|----------|-------------|-----------|
| **Core Weather Data** | Current Conditions | Temp, humidity, wind, UV index, visibility | P0 |
|  | Hourly Forecast | Next 24 hours w/ icons and precipitation graphs | P0 |
|  | 10-Day Forecast | Extended forecast view with trends | P0 |
| **Visual Experience** | Dynamic Backgrounds | Animated weather scenes that match conditions (CSS/Canvas/WebGL) | P1 |
|  | macOS-Inspired UI | SF Pro font, translucency effects, system-like animations | P0 |
|  | Responsive Design | Adaptive layouts for desktop, tablet, mobile | P0 |
| **User Features** | Location Search | Intelligent city search with autocomplete | P0 |
|  | Saved Locations | Bookmark favorite cities (localStorage/cloud) | P1 |
|  | Browser Geolocation | "Use my location" for current weather | P0 |
|  | PWA Support | Install as Progressive Web App with offline capability | P1 |
| **Pro Features** | Radar Map | Interactive precipitation overlay with MapBox/Leaflet | P2 |
|  | Severe Weather Alerts | Real-time government issued alerts with notifications | P1 |
|  | Historical Data | Review past weather data for specific dates | P3 |
|  | Data Export | Download weather data as CSV/JSON | P3 |

---

## 4. Functional Requirements

### 4.1 Data Sources
- **Primary:** OpenWeather API (current implementation)
- **Alternative Options:** WeatherAPI.com, Tomorrow.io, Visual Crossing
- **Backup:** NOAA (US), ECMWF (Europe)
- **Update Frequency:**
  - Current Conditions: Every 60 seconds (with smart caching)
  - Forecasts: Every 15 minutes
  - Radar: Every 5 minutes

### 4.2 Performance Targets
| Metric | Target |
|---------|--------|
| First Contentful Paint (FCP) | ≤ 1.5 seconds |
| Largest Contentful Paint (LCP) | ≤ 2.5 seconds |
| Time to Interactive (TTI) | ≤ 3.5 seconds |
| API response time | ≤ 400ms |
| Lighthouse Performance Score | ≥ 90 |
| Bundle size (initial) | < 200KB (gzipped) |

### 4.3 Offline Behavior
- Cache last known weather data (12h retention) using Service Workers.
- Show "Offline Mode" banner when no connection detected.
- Allow basic temperature and condition view from cache.
- Progressive Web App (PWA) support for offline-first experience.
- IndexedDB for larger data storage (forecasts, historical data).

---

## 5. UX / UI Requirements

### Design Language
- **Inspired by macOS Human Interface Guidelines (HIG)**:
  - SF Pro font family (with system font fallbacks)
  - Generous whitespace and clear visual hierarchy
  - Subtle shadows and translucency effects (CSS backdrop-filter)
  - Smooth, purposeful animations (300-500ms easing curves)
  - Rounded corners (border-radius: 12-20px)
  - Card-based layouts with elevation

### Layout & Navigation
- **Responsive design**: Mobile-first, adapting to desktop/tablet
- **Single-page application** with smooth transitions
- **Minimalist navigation**: Scrollable sections or tabs
  1. **Current Conditions** (hero section)
  2. **Hourly Forecast** (horizontal scroll)
  3. **10-Day Forecast** (vertical list)
  4. **Details Cards** (grid layout)
  5. **Radar Map** (optional full-screen)

### Theming
- **Dark mode support** (prefers-color-scheme: dark)
- **Light mode**: White/light gray backgrounds, dark text
- **Dark mode**: Near-black backgrounds (#1C1C1E), white text
- **Accent colors**: System-blue (#007AFF) or custom theme
- **Color palette**: iOS/macOS system colors

### Accessibility
- **WCAG 2.2 AA compliance**
- **Keyboard navigation**: Full tab-index support
- **Screen reader**: Semantic HTML, ARIA labels
- **Contrast ratios**: 4.5:1 for text, 3:1 for UI components
- **Focus indicators**: Visible outline on interactive elements
- **Reduced motion**: Respect prefers-reduced-motion

### Animations
- **Dynamic weather scenes**: CSS animations, Canvas, or WebGL
- **Micro-interactions**: Hover states, button presses, loading states
- **Page transitions**: Fade/slide effects (250-350ms)
- **Skeleton screens**: Loading placeholders for data
- **Performance**: 60 FPS, GPU-accelerated transforms

---

## 6. Technical Requirements

### 6.1 Platform & Browser Support
- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile, Samsung Internet
- **Progressive Web App (PWA)**: Installable on desktop and mobile
- **Responsive breakpoints**:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px+

### 6.2 Technology Stack
- **Frontend Framework**: React 18+ (or Vue 3, or Vanilla JS with modern build tools)
- **Styling**:
  - CSS Modules or Styled Components
  - Tailwind CSS for utility classes
  - CSS custom properties for theming
- **State Management**: React Context API, Redux Toolkit, or Zustand
- **HTTP Client**: Axios or native Fetch API
- **Build Tool**: Vite or Webpack 5
- **Type Safety**: TypeScript (optional but recommended)
- **Testing**: Jest, React Testing Library, Playwright/Cypress

### 6.3 Data Storage
- **Cache API**: Service Worker caching for offline support
- **localStorage**: User preferences, last viewed city
- **IndexedDB**: Larger datasets (10-day forecasts, historical data)
- **Session Storage**: Temporary state during session
- **Optional Cloud Sync**: Firebase, Supabase, or custom backend

### 6.4 Maps & Visualization
- **Radar Maps**: Mapbox GL JS, Leaflet, or Google Maps
- **Charts**: Chart.js, Recharts, or D3.js for data visualization
- **Weather Animations**:
  - CSS animations for simple effects
  - Canvas API for particle effects (rain, snow)
  - WebGL/Three.js for advanced 3D scenes (optional)

### 6.5 Security & Privacy
- **No third-party trackers** (no Google Analytics, Facebook Pixel, etc.)
- **Location access**: Browser Geolocation API with user consent
- **HTTPS only**: All API calls over TLS 1.3
- **Content Security Policy (CSP)**: Strict headers to prevent XSS
- **API key security**: Environment variables, never committed to git

### 6.6 Telemetry (Optional)
- **Privacy-first analytics**: Plausible, Fathom, or self-hosted Matomo
- **Anonymous metrics**: Page views, session duration, popular cities
- **Opt-in only**: Cookie consent banner, respect DNT header
- **No PII collection**: No user identification or tracking

---

## 7. Agent Responsibilities

| Agent | Responsibility | Key Tools |
|--------|----------------|-----------|
| **🧩 DesignAgent** | Align with macOS HIG design principles, create Figma prototypes, design React/Vue components. | Figma, Storybook, Apple HIG reference |
| **📡 DataAgent** | Integrate weather APIs, validate data freshness, implement caching strategies. | OpenWeather API, Axios, Service Workers |
| **🧠 LogicAgent** | Implement state management, error handling, offline-first logic, PWA features. | React/Vue, TypeScript, IndexedDB |
| **🧪 QABot** | Automate unit tests, E2E tests, performance testing, accessibility audits. | Jest, Playwright, Lighthouse, axe-core |
| **🎨 AnimationAgent** | Create weather animations, micro-interactions, page transitions. | CSS animations, Canvas, WebGL/Three.js |
| **📘 DocsAgent** | Write component documentation, API docs, user guides, privacy policy. | Storybook, JSDoc, Markdown |
| **🧱 ReleaseAgent** | Build production bundles, deploy to hosting, monitor performance. | Vite, Vercel/Netlify, GitHub Actions |

---

## 8. Success Metrics

| KPI | Target | Owner |
|-----|---------|--------|
| Lighthouse Performance Score | ≥ 90 | ReleaseAgent |
| Lighthouse Accessibility Score | 100 | DesignAgent |
| First Contentful Paint (FCP) | ≤ 1.5s | LogicAgent |
| Largest Contentful Paint (LCP) | ≤ 2.5s | LogicAgent |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | DesignAgent |
| Average Session Time | < 45s (quick glance) | DesignAgent |
| Bounce Rate | < 40% | DesignAgent |
| Data Accuracy | ≥ 99.5% vs source | DataAgent |
| PWA Install Rate | ≥ 5% of desktop users | ReleaseAgent |

---

## 9. Risks & Mitigation
| Risk | Mitigation |
|------|-------------|
| API rate limit / cost | Implement intelligent caching, CDN, and retry logic with exponential backoff |
| Performance on low-end devices | Progressive enhancement, lazy loading, code splitting, reduce animations |
| Browser compatibility | Polyfills, feature detection, graceful degradation |
| Data inconsistency | Use fallback API sources (NOAA, ECMWF), show staleness indicators |
| User privacy concerns | No trackers, transparent data policy, opt-in analytics only |
| Large bundle size | Tree shaking, code splitting, dynamic imports, lazy load heavy features |

---

## 10. Roadmap (Phased Rollout)
| Phase | Milestone | Timeline |
|--------|------------|-----------|
| **Phase 1** | MVP: Current conditions, Hourly & 10-Day Forecasts, macOS-inspired UI | Q1 2026 |
| **Phase 2** | PWA, Offline Support, Dynamic Backgrounds, Saved Locations | Q2 2026 |
| **Phase 3** | Radar Maps, Severe Weather Alerts, Historical Data | Q3 2026 |
| **Phase 4** | Performance Optimization, Mobile App Wrappers (Capacitor/React Native) | Q4 2026 |

---

## 11. Open Questions
- Should we build with React, Vue, or vanilla JavaScript?
- Should radar data be locally cached or streamed?
- Do we need a backend server or stay purely client-side?
- How should browser notifications work for severe weather alerts?
- Should we offer data export features (CSV/JSON)?
- Do we want to support offline-first or online-first architecture?

---

## 12. Appendix

### APIs & Libraries
- **Weather Data:** OpenWeather API, WeatherAPI.com, Tomorrow.io
- **Maps:** Mapbox GL JS, Leaflet, Google Maps JavaScript API
- **Charts:** Chart.js, Recharts, D3.js
- **Animations:** Framer Motion, GSAP, Anime.js
- **Icons:** Phosphor Icons, Heroicons, SF Symbols (web adaptation)

### Design References
- **Apple HIG:** https://developer.apple.com/design/human-interface-guidelines
- **macOS Design Patterns:** Typography, spacing, colors, shadows
- **iOS Weather App:** Visual inspiration for layouts and interactions
- **Figma Community:** macOS UI kits for reference

### Technical Resources
- **Web Vitals:** https://web.dev/vitals/
- **PWA Documentation:** https://web.dev/progressive-web-apps/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG22/quickref/
- **CSS Tricks - Glassmorphism:** For macOS-like translucency effects

### Color System (macOS-Inspired)
**Light Mode:**
- Background: #FFFFFF, #F5F5F7
- Card: #FFFFFF with shadow
- Text: #1D1D1F (primary), #6E6E73 (secondary)
- Accent: #007AFF (blue), #34C759 (green), #FF9500 (orange)

**Dark Mode:**
- Background: #000000, #1C1C1E
- Card: #2C2C2E with subtle border
- Text: #FFFFFF (primary), #AEAEB2 (secondary)
- Accent: #0A84FF (blue), #30D158 (green), #FF9F0A (orange)

---

> _Generated for multi-agent orchestration. Each agent uses this file to align goals, update progress, and maintain consistent reasoning context throughout the Apple Weather web application lifecycle._
