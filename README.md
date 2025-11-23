# PostureGuard 🧍‍♂️

**Real-Time Forward Head Posture Detection System**

PostureGuard is an AI-powered web application that monitors your posture in real-time and alerts you when forward head posture is detected. Built with React and MediaPipe, it provides instant visual and audio feedback to help you maintain healthy sitting posture during long work sessions.

![PostureGuard Demo](https://via.placeholder.com/800x400?text=Add+Your+Screenshot+Here)

## ✨ Features

- **🎯 Real-Time Pose Detection**: Uses MediaPipe Pose estimation for accurate tracking
- **📊 Visual Skeleton Overlay**: Professional gradient-based skeleton visualization with arms, torso, and facial landmarks
- **🔊 Voice Alerts**: Audio notifications when poor posture is detected
- **⚙️ Adjustable Sensitivity**: Fine-tune detection from "Extreme" to "Medium" sensitivity (0.005 - 0.1)
- **👤 Person Detection**: Smart validation prevents false positives when you step away
- **📏 Calibration System**: Personalized baseline calibration for accurate detection
- **⏱️ Delayed Alerts**: 2-second threshold to avoid false alarms from momentary movements
- **💎 Modern UI**: Glassmorphic design with dynamic status indicators and smooth animations

## 🚀 Demo

1. **Calibrate**: Sit with good posture and click "Start Calibration"
2. **Monitor**: The system tracks your posture in real-time
3. **Alert**: Receive instant feedback when forward head posture is detected
4. **Adjust**: Fine-tune sensitivity based on your preferences

## 🛠️ Technologies Used

- **React** - Frontend framework
- **MediaPipe Pose** - AI-powered pose estimation
- **Vite** - Build tool and dev server
- **CSS Modules** - Component-scoped styling
- **Web Speech API** - Voice alerts

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Webcam
- Modern browser (Chrome, Edge, or Firefox recommended)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/postureguard.git
   cd postureguard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   Navigate to http://localhost:5173
   ```

## 📖 Usage

### Initial Setup

1. **Grant Camera Permission**: Allow browser access to your webcam
2. **Position Yourself**: Sit at a comfortable distance from the camera (ensure your face and shoulders are visible)
3. **Calibrate**: Sit with proper posture and click "Start Calibration" (takes 3 seconds)

### During Monitoring

- **Green Status**: Good posture maintained ✅
- **Red Status**: Poor posture detected ⚠️
- **Gray Status**: No person detected or not calibrated

### Adjusting Sensitivity

Use the sensitivity slider to control detection threshold:
- **Extreme (0.005-0.02)**: Detects very slight forward lean
- **High (0.02-0.05)**: Moderate sensitivity (default)
- **Medium (0.05-0.1)**: Only alerts on significant lean

### Recalibration

Click "Recalibrate" at any time to reset your baseline posture.

## 🎨 Features in Detail

### Person Detection
The system validates that a person is actually present before analyzing posture. This prevents false alerts when:
- You step away from your desk
- Objects (pillows, pets, etc.) are in view
- Lighting changes temporarily affect detection

### Visual Feedback
- **Skeleton Overlay**: Shows tracked body points with gradient colors
- **Alignment Line**: Dashed line from nose to shoulders for visual reference
- **Status Card**: Color-coded feedback (green/red/gray)
- **Deviation Metric**: Numerical measurement of posture deviation

### Smart Alerts
- **2-Second Delay**: Prevents alerts from brief movements
- **5-Second Cooldown**: Avoids alert spam
- **Automatic Reset**: Stops alerting when posture is corrected

## 📁 Project Structure

```
forward-head-posture-detection/
├── src/
│   ├── components/
│   │   ├── WebcamCanvas.jsx          # Webcam + pose detection + rendering
│   │   └── WebcamCanvas.module.css   # Component styles
│   ├── utils/
│   │   └── postureLogic.js           # Posture analysis logic
│   ├── App.jsx                       # Main application
│   ├── App.module.css                # App styles
│   └── main.jsx                      # Entry point
├── public/
├── package.json
└── README.md
```

## 🔬 How It Works

1. **Pose Detection**: MediaPipe Pose model detects 33 body landmarks in real-time
2. **Calibration**: System records your baseline posture (vertical distance from nose to shoulder line)
3. **Comparison**: Continuously compares current posture to baseline
4. **Person Validation**: Checks landmark visibility scores to confirm person presence
5. **Alert Trigger**: If deviation exceeds threshold for 2+ seconds, triggers alert

## ⚙️ Configuration

### Sensitivity Thresholds
Edit `src/App.jsx` to modify default sensitivity:
```javascript
const [sensitivity, setSensitivity] = useState(0.05); // Default: High
```

### Alert Cooldown
Edit `src/App.jsx` to adjust alert frequency:
```javascript
if (now - lastAlertTime.current > 5000) { // 5 seconds (in ms)
  // Trigger alert
}
```

### Bad Posture Duration
Edit `src/App.jsx` to change detection delay:
```javascript
else if (Date.now() - badPostureStartTime.current > 2000) { // 2 seconds (in ms)
  setPostureStatus('bad');
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MediaPipe](https://google.github.io/mediapipe/) - Google's ML solutions
- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/postureguard](https://github.com/yourusername/postureguard)

---

**⚠️ Disclaimer**: This application is for awareness purposes only and should not replace professional medical advice. Consult a healthcare professional for persistent posture issues.
