import { useState, useRef, useEffect } from "react";
import hark from "hark";

export default function VoiceTherapy() {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [status, setStatus] = useState("Disconnected");
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    // Refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const wsRef = useRef(null);
    const streamRef = useRef(null);
    const speechEventsRef = useRef(null);
    const sessionActiveRef = useRef(false);
    const currentAudioRef = useRef(null);

    // Sync ref with state
    useEffect(() => {
        sessionActiveRef.current = isSessionActive;
    }, [isSessionActive]);

    useEffect(() => {
        // Connect to WebSocket
        const ws = new WebSocket("ws://localhost:5000");
        wsRef.current = ws;

        ws.onopen = () => setStatus("Connected");

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "audio") {
                    // Don't play audio if session is not active
                    if (!sessionActiveRef.current) return;

                    setSpeaking(true);
                    const audioUrl = `http://localhost:5000${data.audioUrl}`;
                    const audio = new Audio(audioUrl + "?t=" + new Date().getTime());
                    currentAudioRef.current = audio;

                    audio.onended = () => {
                        setSpeaking(false);
                        currentAudioRef.current = null;
                        if (sessionActiveRef.current) startListening();
                    };
                    audio.play().catch(e => console.error("Audio play error:", e));
                }
            } catch (err) {
                console.error("Error parsing WS message:", err);
            }
        };

        ws.onclose = () => setStatus("Disconnected");

        return () => {
            if (ws.readyState === 1) ws.close();
            stopSession();
        };
    }, []); // Run once on mount

    const startSession = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const speechEvents = hark(stream, { threshold: -50, interval: 100 });
            speechEventsRef.current = speechEvents;

            speechEvents.on('stopped_speaking', () => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    mediaRecorderRef.current.stop();
                    setListening(false);
                }
            });

            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                audioChunksRef.current = [];
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(blob);
                }
            };

            setIsSessionActive(true);
            startListening();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Please allow microphone access!");
        }
    };

    const startListening = () => {
        if (!mediaRecorderRef.current) return;
        if (mediaRecorderRef.current.state === "recording") return;

        audioChunksRef.current = [];
        try {
            mediaRecorderRef.current.start();
            setListening(true);
        } catch (e) {
            console.error("Error starting recorder:", e);
        }
    };

    const stopSession = () => {
        setIsSessionActive(false);
        setListening(false);
        setSpeaking(false);

        // Stop any currently playing audio
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.currentTime = 0;
            currentAudioRef.current = null;
        }

        if (speechEventsRef.current) speechEventsRef.current.stop();
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    };

    // Determine UI State for Animation
    let circleState = "idle";
    if (speaking) circleState = "speaking";
    else if (listening) circleState = "listening";
    else if (isSessionActive) circleState = "processing";

    return (
        <div style={styles.container}>
            {/* Background Gradient */}
            <div style={styles.background}></div>

            <div style={styles.content}>

                {/* Main Visual Indicator */}
                <div style={styles.circleContainer}>
                    <div style={{
                        ...styles.circle,
                        ...styles[circleState]
                    }}></div>

                    {/* Ripple/Halo Effect */}
                    <div style={{
                        ...styles.halo,
                        ...styles[`halo_${circleState}`]
                    }}></div>
                </div>

                {/* Status Text */}
                <h2 style={styles.statusText}>
                    {speaking ? "Therapist is speaking..." :
                        listening ? "Listening..." :
                            isSessionActive ? "Thinking..." : "Ready"}
                </h2>

                {/* Control Button */}
                <button
                    onClick={isSessionActive ? stopSession : startSession}
                    style={{
                        ...styles.button,
                        backgroundColor: isSessionActive ? "rgba(255, 255, 255, 0.2)" : "#ffffff",
                        color: isSessionActive ? "#fff" : "#4a90e2",
                    }}
                >
                    {isSessionActive ? "End Session" : "Start Session"}
                </button>
            </div>

            {/* Inject CSS Animations */}
            <style>{`
                @keyframes pulse-listen {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
                @keyframes pulse-speak {
                    0% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 20px rgba(255,255,255,0.4); }
                    50% { transform: scale(1.2); opacity: 0.7; box-shadow: 0 0 40px rgba(255,255,255,0.6); }
                    100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 20px rgba(255,255,255,0.4); }
                }
                @keyframes rotate-process {
                    0% { transform: rotate(0deg) scale(0.9); border-radius: 40%; }
                    50% { transform: rotate(180deg) scale(1.0); border-radius: 50%; }
                    100% { transform: rotate(360deg) scale(0.9); border-radius: 40%; }
                }
            `}</style>
        </div>
    );
}

const styles = {
    container: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
        color: "#065f46", // Dark green text
    },
    background: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#ffffff", // Clean white background
        zIndex: -1,
    },
    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
        zIndex: 1,
    },
    circleContainer: {
        position: "relative",
        width: "200px",
        height: "200px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    circle: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "#10b981", // Green circle
        transition: "all 0.5s ease-in-out",
        boxShadow: "0 0 30px rgba(16, 185, 129, 0.3)",
        zIndex: 2,
    },
    halo: {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        backgroundColor: "rgba(16, 185, 129, 0.2)", // Green halo
        zIndex: 1,
        transition: "all 0.5s ease",
    },
    // States
    idle: {
        transform: "scale(1)",
        opacity: 0.8,
    },
    listening: {
        animation: "pulse-listen 2s infinite ease-in-out",
        backgroundColor: "#10b981", // Green
    },
    speaking: {
        animation: "pulse-speak 1.5s infinite ease-in-out",
        backgroundColor: "#059669", // Darker green for speaking
    },
    processing: {
        animation: "rotate-process 2s infinite linear",
        backgroundColor: "#6ee7b7", // Light green
    },

    // Halo States
    halo_idle: { transform: "scale(0.8)", opacity: 0 },
    halo_listening: { animation: "pulse-listen 2s infinite ease-in-out 0.2s" }, // Delayed pulse
    halo_speaking: { animation: "pulse-speak 1.5s infinite ease-in-out 0.1s" },
    halo_processing: { transform: "scale(0.6)", opacity: 0 },

    statusText: {
        fontSize: "24px",
        fontWeight: "300",
        letterSpacing: "1px",
        opacity: 0.9,
        minHeight: "30px",
        color: "#065f46", // Dark green
    },
    button: {
        padding: "16px 40px",
        fontSize: "18px",
        fontWeight: "600",
        border: "none",
        borderRadius: "50px",
        cursor: "pointer",
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        backgroundColor: "#10b981", // Green button
        color: "#fff",
    },
};
