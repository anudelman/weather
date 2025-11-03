# Apple Weather (Web)

## Product Vision
A beautifully designed, privacy-first **Apple Weather experience** delivered through modern web technologies, offering users hyperlocal, real-time, and forecasted weather insights with a design language inspired by macOS aesthetics.

## Current Status
**Implementation:** Web-based weather application (HTML/CSS/JavaScript)
**Target Platform:** Modern web browsers (with macOS-inspired design)

This repository contains a **functional web-based weather application** that will be enhanced with **macOS Human Interface Guidelines** design principles, delivering a premium, Apple-quality experience through web technologies.

### What's Working (Web Prototype)
- ✅ Real-time weather conditions (OpenWeather API)
- ✅ 5-day forecast with precipitation probability
- ✅ Hourly forecast (next 12 hours)
- ✅ City search with autocomplete (Algolia)
- ✅ Detailed weather cards (UV, wind, humidity, pressure, visibility, air quality, sunrise)
- ✅ Basic offline caching (localStorage)
- ✅ Responsive design with Tailwind CSS

### Future Vision (Enhanced Web Experience)
See **[AGENTS.md](./AGENTS.md)** for complete product requirements, including:
- macOS-inspired design system (SF Pro typography, translucency, shadows)
- Dark mode support with system preference detection
- Progressive Web App (PWA) with offline capability
- Dynamic animated backgrounds that match current conditions
- Browser-based geolocation with "Use my location" feature
- Interactive radar maps with precipitation overlay
- Severe weather alerts with browser notifications
- 10-day extended forecasts
- Saved locations with localStorage/cloud sync
- Premium micro-interactions and smooth animations

### Documentation
- **[AGENTS.md](./AGENTS.md)** - Complete product requirements and agent orchestration model
- **[GAP_ANALYSIS.md](./GAP_ANALYSIS.md)** - Detailed comparison of current implementation vs. target vision
- **[ROADMAP.md](./ROADMAP.md)** - Phased implementation plan (coming soon)

## Quick Start (Web Prototype)

### Prerequisites
- Modern web browser (Chrome, Safari, Firefox)
- OpenWeather API key (free tier available)
- Algolia account for search functionality

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/anudelman/weather.git
   cd weather
   ```

2. Open `index.html` in your browser:
   ```bash
   open index.html
   ```

### Configuration
Update API keys in `app.js`:
```javascript
const openWeatherApiKey = 'YOUR_OPENWEATHER_API_KEY';
const searchClient = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_API_KEY");
```

## Technology Stack

### Current (Web)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Tailwind CSS, Phosphor Icons
- **Weather API:** OpenWeather API
- **Search:** Algolia Search
- **HTTP Client:** Axios

### Target (Enhanced Web)
- **Language:** JavaScript/TypeScript
- **Framework:** React 18+ or Vue 3 (with Vite build tool)
- **Weather:** OpenWeather API (current)
- **Maps:** Mapbox GL JS or Leaflet
- **Animations:** CSS animations, Canvas API, WebGL (optional)
- **Storage:** localStorage, IndexedDB, Service Workers (PWA)
- **Design System:** macOS HIG-inspired (SF Pro, system colors, translucency)
- **Platform:** Modern browsers (Chrome 90+, Safari 14+, Firefox 88+, Edge 90+)

## Project Structure
```
weather/
├── index.html              # Main HTML structure
├── style.css              # Custom styles
├── app.js                 # Core weather logic and API integration
├── assets/
│   └── Logo.png          # App branding
├── components/
│   ├── Thunderstorm3D.js # 3D animation experiments
│   ├── thunderstorm.glb  # 3D model asset
│   └── thunderstorm.mp4  # Video background asset
├── us_cities.json        # City database for search
├── AGENTS.md             # Product requirements document
├── GAP_ANALYSIS.md       # Current vs. target comparison
└── README.md             # This file
```

## Roadmap

### Phase 0: Foundation & Audit (Weeks 1-2)
- ✅ Web prototype with core weather features
- ✅ Product requirements documentation (web-focused)
- ✅ Gap analysis completed
- ⏳ Design, performance, and accessibility audits

### Phase 1: macOS Design System (Weeks 3-6)
- SF Pro typography and macOS color system
- Dark mode implementation
- Card layouts with translucency and shadows
- Smooth animations and micro-interactions
- 10-day forecast
- Browser geolocation ("Use my location")

### Phase 2: PWA & Performance (Weeks 7-9)
- Service Workers for offline support
- PWA manifest and install prompts
- Performance optimization (Lighthouse ≥90)
- Code splitting and lazy loading

### Phase 3: Advanced Features (Weeks 10-12)
- Dynamic weather backgrounds
- Interactive radar maps
- Severe weather alerts + notifications
- Saved locations
- Historical data (if API supports)

### Phase 4: Polish & Launch (Weeks 13-16)
- Comprehensive testing (unit, E2E, accessibility)
- Cross-browser testing
- Production deployment
- Documentation and launch

**Timeline:** 16 weeks (4 months) from start to public launch

See **[ROADMAP.md](./ROADMAP.md)** for detailed week-by-week implementation plan.

## Contributing
This project uses a multi-agent development model. See the [AGENTS.md](./AGENTS.md) file for agent responsibilities and contribution guidelines.

## License
Private repository - All rights reserved

## Contact
For questions or feedback about the product vision, please refer to the agent responsibilities in [AGENTS.md](./AGENTS.md).
