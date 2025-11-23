import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Pose } from '@mediapipe/pose';
import styles from './WebcamCanvas.module.css';

const WebcamCanvas = ({ onPoseDetected, isCalibrating }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Ref to store the latest callback to avoid re-creating Pose
    const onPoseDetectedRef = useRef(onPoseDetected);
    useEffect(() => {
        onPoseDetectedRef.current = onPoseDetected;
    }, [onPoseDetected]);

    const onResults = useCallback((results) => {
        if (!canvasRef.current || !webcamRef.current || !webcamRef.current.video) return;

        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const canvasCtx = canvasRef.current.getContext('2d');
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.poseLandmarks) {
            // Custom Professional Drawing
            const landmarks = results.poseLandmarks;

            // Helper to draw line with gradient
            const drawLine = (start, end, colorStart, colorEnd, width) => {
                if (!landmarks[start] || !landmarks[end]) return;
                const startX = landmarks[start].x * canvasRef.current.width;
                const startY = landmarks[start].y * canvasRef.current.height;
                const endX = landmarks[end].x * canvasRef.current.width;
                const endY = landmarks[end].y * canvasRef.current.height;

                const gradient = canvasCtx.createLinearGradient(startX, startY, endX, endY);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);

                canvasCtx.beginPath();
                canvasCtx.moveTo(startX, startY);
                canvasCtx.lineTo(endX, endY);
                canvasCtx.strokeStyle = gradient;
                canvasCtx.lineWidth = width;
                canvasCtx.lineCap = 'round';
                canvasCtx.stroke();
            };

            // Helper to draw point with glow
            const drawPoint = (index, color, radius) => {
                if (!landmarks[index]) return;
                const x = landmarks[index].x * canvasRef.current.width;
                const y = landmarks[index].y * canvasRef.current.height;

                canvasCtx.beginPath();
                canvasCtx.arc(x, y, radius, 0, 2 * Math.PI);
                canvasCtx.fillStyle = color;
                canvasCtx.shadowColor = color;
                canvasCtx.shadowBlur = 15;
                canvasCtx.fill();
                canvasCtx.shadowBlur = 0;

                // Inner white dot for tech look
                canvasCtx.beginPath();
                canvasCtx.arc(x, y, radius * 0.4, 0, 2 * Math.PI);
                canvasCtx.fillStyle = '#fff';
                canvasCtx.fill();
            };

            // --- Draw Skeleton ---

            // Shoulders (11-12)
            drawLine(11, 12, '#00f2fe', '#4facfe', 4);

            // Arms (Left: 11-13-15, Right: 12-14-16)
            drawLine(11, 13, '#00f2fe', '#00c6ff', 3); // Left Upper Arm
            drawLine(13, 15, '#00c6ff', '#0072ff', 3); // Left Forearm
            drawLine(12, 14, '#4facfe', '#00f2fe', 3); // Right Upper Arm
            drawLine(14, 16, '#00f2fe', '#00c6ff', 3); // Right Forearm

            // Torso (Shoulders to Hips: 11-23, 12-24, 23-24)
            drawLine(11, 23, '#00f2fe', '#43e97b', 3); // Left Side
            drawLine(12, 24, '#4facfe', '#38f9d7', 3); // Right Side
            drawLine(23, 24, '#43e97b', '#38f9d7', 3); // Hips

            // Neck/Spine Alignment (Mid-Shoulder to Nose)
            if (landmarks[11] && landmarks[12] && landmarks[0]) {
                const midShoulderX = (landmarks[11].x + landmarks[12].x) / 2;
                const midShoulderY = (landmarks[11].y + landmarks[12].y) / 2;

                canvasCtx.beginPath();
                canvasCtx.moveTo(midShoulderX * canvasRef.current.width, midShoulderY * canvasRef.current.height);
                canvasCtx.lineTo(landmarks[0].x * canvasRef.current.width, landmarks[0].y * canvasRef.current.height);
                canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                canvasCtx.lineWidth = 2;
                canvasCtx.setLineDash([5, 5]);
                canvasCtx.stroke();
                canvasCtx.setLineDash([]);
            }

            // Face Box (Ear to Ear)
            drawLine(7, 8, '#ff9a9e', '#fecfef', 2);

            // --- Draw Key Points ---

            // Face
            drawPoint(0, '#ff0055', 6); // Nose
            drawPoint(7, '#ffffff', 4); // Left Ear
            drawPoint(8, '#ffffff', 4); // Right Ear

            // Upper Body
            drawPoint(11, '#00f2fe', 5); // Left Shoulder
            drawPoint(12, '#00f2fe', 5); // Right Shoulder
            drawPoint(13, '#00c6ff', 4); // Left Elbow
            drawPoint(14, '#00c6ff', 4); // Right Elbow
            drawPoint(15, '#0072ff', 4); // Left Wrist
            drawPoint(16, '#0072ff', 4); // Right Wrist

            // Hips
            drawPoint(23, '#43e97b', 5); // Left Hip
            drawPoint(24, '#38f9d7', 5); // Right Hip

            if (onPoseDetectedRef.current) {
                onPoseDetectedRef.current(results.poseLandmarks);
            }
        }
        canvasCtx.restore();
    }, []); // Empty dependency array - stable callback

    useEffect(() => {
        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        pose.onResults(onResults);

        let animationFrameId;

        const onFrame = async () => {
            if (webcamRef.current && webcamRef.current.video && (webcamRef.current.video.readyState >= 2 || webcamRef.current.video.currentTime > 0)) {
                try {
                    await pose.send({ image: webcamRef.current.video });
                } catch (error) {
                    console.error("Pose processing error:", error);
                }
            }
            animationFrameId = requestAnimationFrame(onFrame);
        };

        const checkVideoReady = setInterval(() => {
            if (webcamRef.current && webcamRef.current.video && (webcamRef.current.video.readyState >= 2 || webcamRef.current.video.currentTime > 0)) {
                clearInterval(checkVideoReady);
                setCameraActive(true);
                onFrame();
            }
        }, 100);

        return () => {
            clearInterval(checkVideoReady);
            cancelAnimationFrame(animationFrameId);
            pose.close();
        };
    }, [onResults]);

    const handleUserMediaError = (error) => {
        console.error("Webcam error:", error);
        setErrorMessage("Camera access denied or device in use.");
    };

    return (
        <div className={styles.container}>
            {errorMessage ? (
                <div className={styles.error}>
                    <p>{errorMessage}</p>
                    <button onClick={() => window.location.reload()} className={styles.retryButton}>Retry</button>
                </div>
            ) : (
                <>
                    <Webcam
                        ref={webcamRef}
                        className={styles.webcam}
                        mirrored={true}
                        screenshotFormat="image/jpeg"
                        onUserMediaError={handleUserMediaError}
                        onUserMedia={() => setErrorMessage(null)}
                    />
                    <canvas
                        ref={canvasRef}
                        className={styles.canvas}
                        style={{ transform: 'scaleX(-1)' }}
                    />
                    {!cameraActive && <div className={styles.loading}>Loading Camera...</div>}
                </>
            )}
        </div>
    );
};

export default WebcamCanvas;
