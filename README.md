# Multiplayer FPS Game (Browser-Based)

A real-time multiplayer first-person shooter built using cutting-edge web technologies, featuring seamless desktop and mobile crossplay.

![Game Preview](client/public/preview.gif)

## 🚀 Technologies Used
- **React Three Fiber (3D rendering)** for highly performant, stunning browser-based 3D environments.
- **Node.js + Socket.io (real-time multiplayer)** for lag-free room-based state synchronization.
- **Zustand (state management)** for efficient cross-component data binding.

## 🎯 Core Features
- **Real-time Multiplayer:** Room-based matches with full 3D positional and rotational sync.
- **Dynamic Camera Modes:** Seamless switching between FPS and TPP modes.
- **Advanced Combat System:** 
  - Realistic weapon recoil and sight alignments.
  - Granular damage models (Headshot multipliers, torso variants).
  - Multiple Weapon classes (AR, SMG, Sniper).
- **Responsive Controls:** Fully unified mobile (virtual touch) and desktop (mouse/keyboard) controllers.
- **Customizable HUD:** Configurable sensitivity and fully movable UI bounds for mobile layouts.
- **Match Leaderboards:** Live player tracking, kill feeds, and zone shrinking mechanics.

## 🎮 Controls
**Desktop:**
- `W/A/S/D` → Movement
- `Mouse` → Aim / Look
- `Left Click` → Shoot
- `Right Click` → Scope
- `C / Ctrl` → Crouch
- `Space` → Jump
- `F` → TPP Toggle
- `1 / 2 / 3` → Switch Weapons

**Mobile:**
- `Left Virtual Joystick` → Movement
- `Right Screen Touch` → Aim / Look
- `On-Screen Buttons` → Shoot, Jump, Crouch, Scope

## 🛠️ Setup Instructions

### 1. Client Setup
```bash
cd client
npm install
npm run dev
```

### 2. Server Setup
```bash
cd server
npm install
node index.js
```

## 📈 Future Improvements
- Immersive combat animations and procedural inverse kinematics.
- Custom weapon skins and unlock progressions.
- Expansive localized Battle Royale map.
- Spatial 3D audio cues.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
