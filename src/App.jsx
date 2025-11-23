import React, { useState, useEffect, useRef, useCallback } from 'react';
import WebcamCanvas from './components/WebcamCanvas';
import { PostureLogic } from './utils/postureLogic';
import styles from './App.module.css';
import clsx from 'clsx';

function App() {
  const [postureLogic] = useState(new PostureLogic());
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [postureStatus, setPostureStatus] = useState('waiting'); // waiting, good, bad
  const [deviation, setDeviation] = useState(0);
  const [calibrating, setCalibrating] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.05); // Default sensitivity

  const lastAlertTime = useRef(0);
  const badPostureStartTime = useRef(0);

  const speakAlert = useCallback(() => {
    const now = Date.now();
    if (now - lastAlertTime.current > 5000) { // Alert at most every 5 seconds
      const msg = new SpeechSynthesisUtterance("Forward head posture detected — please correct your posture.");
      window.speechSynthesis.speak(msg);
      lastAlertTime.current = now;
    }
  }, []);

  const handlePoseDetected = useCallback((landmarks) => {
    // First, check if a person is actually present
    const personPresent = postureLogic.isPersonPresent(landmarks);

    if (calibrating) {
      // Only calibrate if person is present
      if (personPresent) {
        postureLogic.calibrate(landmarks);
      }
    } else if (isCalibrated) {
      // Only analyze posture if person is present
      if (!personPresent) {
        // No person detected - reset bad posture timer and set status to waiting
        badPostureStartTime.current = 0;
        setPostureStatus('waiting');
        setDeviation(0);
        return;
      }

      postureLogic.setThreshold(sensitivity); // Update threshold dynamically
      const result = postureLogic.checkPosture(landmarks);
      setDeviation(result.deviation);

      if (result.isBad) {
        if (badPostureStartTime.current === 0) {
          badPostureStartTime.current = Date.now();
        } else if (Date.now() - badPostureStartTime.current > 2000) { // 2 seconds of bad posture to trigger
          setPostureStatus('bad');
          speakAlert();
        }
      } else {
        badPostureStartTime.current = 0;
        setPostureStatus('good');
      }
    }
  }, [calibrating, isCalibrated, postureLogic, speakAlert, sensitivity]);

  const startCalibration = () => {
    setCalibrating(true);
    postureLogic.resetCalibration();

    // Use a ref to track if we are currently calibrating to avoid closure staleness if needed,
    // though here the closure captures the initial state. 
    // The issue might be that if the component re-renders, the timeout closure might be stale?
    // Actually, setTimeout closure captures 'postureLogic' which is a state constant (ref-like).
    // But let's make sure we force a re-render or check logic.

    setTimeout(() => {
      const success = postureLogic.finalizeCalibration();
      if (success) {
        setCalibrating(false);
        setIsCalibrated(true);
        setPostureStatus('good');
      } else {
        // If calibration failed (no data), try again or alert
        console.warn("Calibration failed: No pose data detected.");
        setCalibrating(false);
        alert("Calibration failed. Please ensure you are visible to the camera and try again.");
      }
    }, 3000);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>PostureGuard</h1>
        <p>Real-Time Forward Head Posture Detection</p>
      </header>

      <main className={styles.main}>
        <div className={styles.webcamWrapper}>
          <WebcamCanvas
            onPoseDetected={handlePoseDetected}
            isCalibrating={calibrating}
          />
          {calibrating && (
            <div className={styles.overlay}>
              <h2>Calibrating...</h2>
              <p>Sit straight and look forward.</p>
            </div>
          )}
        </div>

        <div className={styles.dashboard}>
          <div className={clsx(styles.statusCard, {
            [styles.good]: postureStatus === 'good',
            [styles.bad]: postureStatus === 'bad',
            [styles.waiting]: postureStatus === 'waiting'
          })}>
            <h2>Status</h2>
            <div className={styles.statusText}>
              {postureStatus === 'waiting' && 'Not Calibrated'}
              {postureStatus === 'good' && 'Good Posture'}
              {postureStatus === 'bad' && 'Poor Posture'}
            </div>
          </div>

          <div className={styles.metricsCard}>
            <h3>Deviation</h3>
            <div className={styles.metricValue}>
              {(deviation * 100).toFixed(1)}
            </div>
            <p className={styles.metricLabel}>Lower is better</p>
          </div>

          <div className={styles.controlsCard}>
            <h3>Sensitivity</h3>
            <input
              type="range"
              min="0.005"
              max="0.1"
              step="0.005"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderValue}>
              {sensitivity < 0.02 ? 'Extreme' : sensitivity < 0.05 ? 'High' : 'Medium'} ({sensitivity})
            </div>
          </div>

          <div className={styles.controls}>
            {!isCalibrated || calibrating ? (
              <button
                className={styles.primaryButton}
                onClick={startCalibration}
                disabled={calibrating}
              >
                {calibrating ? 'Calibrating...' : 'Start Calibration'}
              </button>
            ) : (
              <button
                className={styles.secondaryButton}
                onClick={startCalibration}
              >
                Recalibrate
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
