# Apple Weather (Desktop)

## Product Vision
A beautifully designed, privacy-first **Apple Weather experience for macOS**, offering users hyperlocal, real-time, and forecasted weather insights—synchronized across their Apple ecosystem.

## Current Status
**Implementation:** Web-based prototype (HTML/CSS/JavaScript)
**Target Platform:** Native macOS app (SwiftUI + WeatherKit)

This repository currently contains a **functional web-based weather application** that serves as a prototype and proof-of-concept. The long-term vision is to evolve this into a **native macOS application** that deeply integrates with the Apple ecosystem.

### What's Working (Web Prototype)
- ✅ Real-time weather conditions (OpenWeather API)
- ✅ 5-day forecast with precipitation probability
- ✅ Hourly forecast (next 12 hours)
- ✅ City search with autocomplete (Algolia)
- ✅ Detailed weather cards (UV, wind, humidity, pressure, visibility, air quality, sunrise)
- ✅ Basic offline caching (localStorage)
- ✅ Responsive design with Tailwind CSS

### Future Vision (Native macOS)
See **[AGENTS.md](./AGENTS.md)** for complete product requirements, including:
- Native macOS app built with SwiftUI + WeatherKit
- Menu bar integration with always-visible weather summary
- Dynamic animated backgrounds that match current conditions
- iCloud sync for saved locations across devices
- Siri Shortcuts and Spotlight integration
- Native widgets for Notification Center
- Radar maps with live precipitation overlay
- Severe weather alerts
- 10-day extended forecasts

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

### Target (Native macOS)
- **Language:** Swift 5.9+
- **Framework:** SwiftUI, Combine
- **Weather:** Apple WeatherKit API
- **Maps:** MapKit
- **Animations:** SceneKit, Metal
- **Storage:** UserDefaults, iCloud Key-Value Store
- **Platform:** macOS 15 Sequoia+

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

### Phase 0: Foundation (Current)
- ✅ Web prototype with core weather features
- ✅ Product requirements documentation
- ✅ Gap analysis completed

### Phase 1: MVP (Q1 2026)
- Native macOS app scaffold
- WeatherKit API integration
- Current conditions + 5/10-day forecast
- Basic widgets

### Phase 2: Native Enhancements (Q2 2026)
- Menu bar mini view
- Dynamic backgrounds
- Siri integration
- Radar maps

### Phase 3: Ecosystem Integration (Q3 2026)
- iCloud sync
- Severe weather alerts
- Historical data
- Watch app companion

See **[AGENTS.md](./AGENTS.md)** for detailed phased rollout timeline.

## Contributing
This project uses a multi-agent development model. See the [AGENTS.md](./AGENTS.md) file for agent responsibilities and contribution guidelines.

## License
Private repository - All rights reserved

## Contact
For questions or feedback about the product vision, please refer to the agent responsibilities in [AGENTS.md](./AGENTS.md).
