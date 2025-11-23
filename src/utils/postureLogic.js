export class PostureLogic {
  constructor() {
    this.baseline = null;
    this.calibrationCount = 0;
    this.calibrationSum = 0;
    this.isCalibrated = false;
    this.threshold = 0.05; // Default sensitivity (lower = more sensitive)
  }

  /**
   * Calculates the vertical distance between the nose and the midpoint of the shoulders.
   * @param {Object} landmarks - MediaPipe Pose landmarks
   * @returns {number|null} - The calculated metric or null if landmarks are missing
   */
  calculateMetric(landmarks) {
    // 0: Nose, 11: Left Shoulder, 12: Right Shoulder
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (!nose || !leftShoulder || !rightShoulder) return null;

    // Calculate midpoint of shoulders
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

    // Metric: Vertical distance (y-axis) between nose and shoulder line.
    // In MediaPipe, y increases downwards.
    // Sitting straight: Nose is higher (smaller y) than shoulders (larger y).
    // Leaning forward: Nose drops relative to shoulders (distance decreases) OR
    // actually, forward head posture usually means the head goes FORWARD (z-axis) and DOWN (y-axis).
    // But in 2D, we often see the vertical distance shrink as the head comes down/forward.
    // Let's use simple Y difference for now.
    return shoulderMidY - nose.y;
  }

  resetCalibration() {
    this.calibrationCount = 0;
    this.calibrationSum = 0;
    this.isCalibrated = false;
    this.baseline = null;
  }

  calibrate(landmarks) {
    const metric = this.calculateMetric(landmarks);
    if (metric !== null) {
      this.calibrationSum += metric;
      this.calibrationCount++;
    }
  }

  finalizeCalibration() {
    if (this.calibrationCount > 0) {
      this.baseline = this.calibrationSum / this.calibrationCount;
      this.isCalibrated = true;
      console.log("Calibration finalized. Baseline:", this.baseline);
      return true;
    }
    console.warn("Calibration failed: No valid frames processed.");
    return false;
  }

  /**
   * Checks if a person is actually present in the frame.
   * Uses visibility scores to ensure key landmarks are clearly detected.
   * @param {Object} landmarks - MediaPipe Pose landmarks
   * @returns {boolean} - true if person is present, false otherwise
   */
  isPersonPresent(landmarks) {
    // Key landmarks for person detection:
    // 0: Nose, 7: Left Ear, 8: Right Ear, 11: Left Shoulder, 12: Right Shoulder
    const nose = landmarks[0];
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    // Check if landmarks exist and have good visibility (> 0.5)
    const noseVisible = nose && nose.visibility > 0.5;
    const leftEarVisible = leftEar && leftEar.visibility > 0.5;
    const rightEarVisible = rightEar && rightEar.visibility > 0.5;
    const leftShoulderVisible = leftShoulder && leftShoulder.visibility > 0.5;
    const rightShoulderVisible = rightShoulder && rightShoulder.visibility > 0.5;

    // Person is present if:
    // 1. Nose is visible AND
    // 2. At least one ear is visible AND
    // 3. Both shoulders are visible
    const faceVisible = noseVisible && (leftEarVisible || rightEarVisible);
    const shouldersVisible = leftShoulderVisible && rightShoulderVisible;

    return faceVisible && shouldersVisible;
  }

  /**
   * Checks if the current posture is bad based on calibration.
   * @param {Object} landmarks - MediaPipe Pose landmarks
   * @returns {Object} - { isBad: boolean, deviation: number }
   */
  checkPosture(landmarks) {
    if (!this.isCalibrated) return { isBad: false, deviation: 0 };

    const currentMetric = this.calculateMetric(landmarks);
    if (currentMetric === null) return { isBad: false, deviation: 0 };

    // Deviation = Baseline - Current. Positive deviation means forward head.
    const deviation = this.baseline - currentMetric;

    return {
      isBad: deviation > this.threshold,
      deviation: deviation
    };
  }

  setThreshold(val) {
    this.threshold = val;
  }
}
