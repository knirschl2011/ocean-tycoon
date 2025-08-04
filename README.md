# 🌊 Ocean Tycoon: Abyssal Beginnings

An immersive 3D ocean exploration tycoon game built with Three.js that teaches economics principles through underwater resource management and submarine operations.

![Ocean Tycoon](https://img.shields.io/badge/Status-Alpha-orange) ![Three.js](https://img.shields.io/badge/Three.js-r128-blue) ![HTML5](https://img.shields.io/badge/HTML5-Game-green)

## 🎯 Overview

Ocean Tycoon combines engaging underwater exploration with educational economics gameplay. Players pilot a submarine through realistic ocean depths, managing critical resources like oxygen and power while collecting minerals and building an underwater empire. The game teaches fundamental economic concepts including scarcity, opportunity cost, and risk vs. reward through immersive gameplay.

## ✨ Features

### Current Implementation (Phase 1 - Complete)

- **🚢 Realistic Submarine Physics**: Detailed 3D submarine with animated propellers and multi-directional movement
- **🌊 Dynamic Ocean Environment**: Beautiful underwater world with realistic lighting, fog effects, and particle systems
- **⚡ Resource Management**: Oxygen, power, minerals, and credits system with depth-based consumption
- **💎 Collection Mechanics**: Glowing mineral crystals with proximity detection and collection rewards
- **📊 Pressure System**: Realistic depth pressure affecting resource efficiency and submarine performance
- **🎮 Multi-Platform Controls**: WASD/Arrow keys, mouse, trackpad, and touch support
- **🔧 Upgrade System**: Hull reinforcement system allowing deeper exploration
- **🐠 Marine Life**: Animated fish with AI behaviors that react to submarine presence
- **📱 Responsive UI**: Glassmorphism interface panels that adapt to different screen sizes

## 🎮 How to Play

### Controls

**Desktop:**
- `WASD` or `Arrow Keys`: Move submarine horizontally
- `Space`: Ascend
- `Shift`: Descend  
- `E`: Collect minerals (when near)
- `Mouse`: Look around (camera control)

**Mobile/Touch:**
- Touch controls appear automatically on mobile devices
- Drag to steer, tap buttons for movement and collection

### Gameplay Tips

1. **Monitor Your Oxygen**: Surface above -10m to regenerate oxygen
2. **Watch Power Consumption**: Movement drains power - let it regenerate when stationary
3. **Explore Deeper**: Better minerals are found at greater depths, but pressure increases
4. **Collect Strategically**: Each mineral crystal has different values
5. **Upgrade Wisely**: Hull upgrades allow safer deep-sea exploration

## 🚀 Quick Start

### Prerequisites

- Modern web browser with WebGL support
- No installation required - runs directly in browser

### Running the Game

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Start exploring the ocean depths!

```bash
# For local development with live server
npx live-server .
# Or simply open index.html in your browser
```

## 🏗️ Project Structure

```
ocean-tycoon/
├── index.html          # Main game file with UI and styling
├── src/
│   └── main.js         # Core game logic and Three.js implementation
├── gemini.md           # Comprehensive development plan and roadmap
└── .env                # Environment configuration
```

## 🎓 Educational Value

Ocean Tycoon is designed to teach key economic concepts through gameplay:

### Core Economic Principles

- **Scarcity**: Limited oxygen and power force strategic decisions
- **Opportunity Cost**: Time spent exploring vs. surfacing vs. base building
- **Risk vs. Reward**: Deeper exploration yields better rewards but higher costs  
- **Resource Management**: Balancing multiple competing needs
- **Investment Strategy**: Choosing between equipment upgrades and exploration

### Learning Outcomes

Students will develop understanding of:
- Resource allocation under constraints
- Risk assessment and management
- Strategic planning and decision making
- Economic trade-offs and optimization
- Supply chain and market dynamics (in future phases)

## 🛠️ Technical Details

### Built With

- **Three.js r128**: 3D graphics engine and WebGL rendering
- **HTML5 Canvas**: Cross-platform game rendering
- **Modern JavaScript**: ES6+ syntax with async/await patterns
- **CSS3**: Glassmorphism UI design with backdrop filters
- **Web APIs**: Device detection and responsive controls

### Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+  
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Performance

- **Target**: 60 FPS on desktop, 30+ FPS on mobile
- **Memory Usage**: ~50-100MB typical usage
- **Load Time**: <3 seconds on modern connections

## 🗺️ Development Roadmap

### Phase 2: Enhanced Gameplay (Next)
- **Base Building System**: Underwater habitats and facilities
- **Submarine Upgrades**: Propulsion, life support, and collection equipment
- **Advanced Resources**: Multiple mineral types and processing chains

### Phase 3: Economic Complexity
- **Trading & Commerce**: Surface ships and contract systems
- **Research & Technology**: Tech trees and equipment unlocks
- **Risk Management**: Equipment failure and environmental hazards

### Phase 4: Advanced Features
- **Multiplayer Elements**: Cooperative play and trading networks
- **Procedural Content**: Dynamic ocean and seasonal events
- **Advanced Simulation**: Ecosystem modeling and complex economics

## 🤝 Contributing

This project welcomes contributions! Areas where help is especially valuable:

- **Game Design**: Balancing mechanics and educational effectiveness
- **3D Art**: Submarine models, ocean creatures, and environmental assets
- **Educational Content**: Curriculum integration and assessment tools
- **Performance Optimization**: Rendering efficiency and mobile support
- **Testing**: Cross-platform compatibility and user experience

### Development Setup

```bash
# Clone the repository
git clone [your-repo-url]
cd ocean-tycoon

# No build process required - edit files directly
# Serve locally for development
npx live-server .
```

## 📝 License

[Specify your license here - MIT, GPL, etc.]

## 🙏 Acknowledgments

- **Three.js Community**: For the incredible 3D graphics framework
- **Educational Game Design**: Inspired by proven gamification principles
- **Ocean Science**: Based on real deep-sea exploration challenges
- **Octalysis Framework**: Game design methodology by Yu-kai Chou

## 📞 Contact

[Your contact information]

---

**Current Version**: Alpha v0.1  
**Last Updated**: August 2025  
**Platform**: Web (HTML5/WebGL)  
**Educational Level**: Middle School to Adult
