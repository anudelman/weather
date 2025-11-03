# AGENTS.md
## Product Requirements: Apple Weather (Desktop App)

### 🧭 Mission
Deliver a beautifully designed, privacy-first **Apple Weather experience for macOS**, offering users hyperlocal, real-time, and forecasted weather insights—synchronized across their Apple ecosystem.

### 🎯 Objectives
- Provide accurate, real-time weather information through a native macOS experience.
- Maintain design consistency with the iOS Weather app and Apple's Human Interface Guidelines (HIG).
- Enable context-aware forecasts using location, time, and device state.
- Integrate seamlessly with Apple ecosystem services (iCloud, Siri, Spotlight, Widgets).

---

## 1. Product Overview
**Apple Weather (Desktop)** brings the beloved iOS weather experience to macOS, allowing users to quickly check current conditions, hourly forecasts, and long-term outlooks. It also enables desktop-specific enhancements such as menu bar summaries, dynamic wallpapers, and system-wide widgets.

**Value Proposition**
- **Consistency:** Unified experience across Apple devices.
- **Utility:** Fast access to real-time weather data at a glance.
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
| **Visual Experience** | Dynamic Backgrounds | Animated weather scenes that match conditions | P1 |
|  | Menu Bar Mini View | Always-on summary in macOS menu bar | P1 |
| **Integrations** | iCloud Sync | Sync preferred locations and settings across devices | P1 |
|  | Siri Shortcuts | "Hey Siri, what's the weather like?" | P1 |
|  | Spotlight Query | Type "Weather" or "Chicago" to surface instant data | P2 |
|  | Widgets | Add weather widgets to desktop or Notification Center | P0 |
| **Pro Features** | Radar Map | Live Doppler and precipitation overlay | P2 |
|  | Severe Weather Alerts | Real-time government issued alerts | P1 |
|  | Historical Data | Review past weather data for specific dates | P3 |

---

## 4. Functional Requirements

### 4.1 Data Sources
- **Primary:** Apple WeatherKit API (powered by Apple's partnership with The Weather Channel)
- **Backup:** NOAA (US), ECMWF (Europe), JMA (Japan)
- **Update Frequency:**
  - Current Conditions: Every 60 seconds
  - Forecasts: Every 15 minutes
  - Radar: Every 5 minutes

### 4.2 Performance Targets
| Metric | Target |
|---------|--------|
| Launch time | ≤ 1.2 seconds |
| Menu bar update latency | ≤ 2 seconds |
| API response time | ≤ 400ms |
| CPU usage (idle) | < 2% |
| Memory footprint | < 150MB |

### 4.3 Offline Behavior
- Cache last known weather data (12h retention).
- Show "Offline Mode" banner when no connection detected.
- Allow basic temperature and condition view from cache.

---

## 5. UX / UI Requirements
- Follow **macOS Human Interface Guidelines (HIG)**.
- Responsive layout: window resizing preserves layout integrity.
- **Accessibility compliance:** WCAG 2.2 AA.
- System accent color + dark mode support.
- Minimalist navigation: three primary tabs
  1. **Today**
  2. **Hourly**
  3. **10-Day / Radar**
- Animated scenes rendered using **SceneKit** with fallback to static imagery on low power.

---

## 6. Technical Requirements

### 6.1 Platform
- macOS 15 Sequoia or later
- Built with **SwiftUI** and **WeatherKit**
- Uses **Combine** for live updates and **MapKit** for radar

### 6.2 Data Storage
- **Local:** User preferences and cached weather data in `~/Library/Application Support/Weather`
- **Sync:** iCloud Key-Value Store for saved locations

### 6.3 Security & Privacy
- No third-party trackers.
- Location access via macOS Core Location prompt.
- Data encrypted in transit (TLS 1.3).

### 6.4 Telemetry
- Anonymous usage analytics (e.g., most viewed city, session duration)
- Opt-in only per Apple privacy policy.

---

## 7. Agent Responsibilities

| Agent | Responsibility | Key Tools |
|--------|----------------|-----------|
| **🧩 DesignAgent** | Align with HIG, prototype in Figma, generate SwiftUI layouts. | Figma MCP, Apple HIG DB |
| **📡 DataAgent** | Connect to WeatherKit, validate API data freshness. | WeatherKit SDK, Postman |
| **🧠 LogicAgent** | Implement caching, error handling, and offline logic. | Xcode, Combine |
| **🧪 QABot** | Automate regression, latency, and performance testing. | XCTest, XCUITest |
| **🗣️ VoiceAgent** | Integrate Siri and Dictation commands. | SiriKit, Core ML |
| **📘 DocsAgent** | Generate release notes and privacy summaries. | DocC, Markdown |
| **🧱 ReleaseAgent** | Build and notarize app, submit to TestFlight / App Store. | Xcode Cloud, Fastlane |

---

## 8. Success Metrics

| KPI | Target | Owner |
|-----|---------|--------|
| App Store Rating | ≥ 4.8 ⭐️ | ReleaseAgent |
| Average Session Time | < 30s (quick glance) | DesignAgent |
| Daily Active Users | 1M+ globally | ProductAgent |
| Crash Rate | < 0.05% | QABot |
| Data Accuracy | ≥ 99.5% vs source | DataAgent |

---

## 9. Risks & Mitigation
| Risk | Mitigation |
|------|-------------|
| API rate limit | Implement intelligent caching and retry logic |
| Power consumption from animations | Use GPU throttling and adaptive frame rate |
| Data inconsistency | Use fallback sources (NOAA, ECMWF) |
| User privacy concerns | Maintain strict opt-in telemetry and encryption |

---

## 10. Roadmap (Phased Rollout)
| Phase | Milestone | Timeline |
|--------|------------|-----------|
| **Phase 1** | MVP: Current, Hourly, 10-Day Forecast + Widgets | Q1 2026 |
| **Phase 2** | Radar, Siri, Menu Bar Mini View | Q2 2026 |
| **Phase 3** | Historical Data + Severe Weather Alerts | Q3 2026 |
| **Phase 4** | macOS 16 Optimization + iPadOS Desktop Sync | Q4 2026 |

---

## 11. Open Questions
- Should radar data be locally cached or streamed?
- Will users want background refresh even when app is closed?
- How should notifications behave for multiple saved cities?

---

## 12. Appendix
- **APIs:** WeatherKit, MapKit, CoreLocation, SiriKit
- **References:**
  - Apple HIG: https://developer.apple.com/design/human-interface-guidelines
  - WeatherKit Docs: https://developer.apple.com/weatherkit/
- **Figma Source:** `figma.com/apple-weather-desktop`

---

> _Generated for multi-agent orchestration. Each agent uses this file to align goals, update progress, and maintain consistent reasoning context throughout the Apple Weather Desktop app lifecycle._
