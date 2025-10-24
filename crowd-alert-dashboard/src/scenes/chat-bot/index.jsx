import React, { useState, useEffect, useRef } from "react";
import MapComponent from "../../components/MapComponent";

const CITY_COORDINATES = {
  colombo: { lat: 6.9271, lng: 79.8612 },
  kandy: { lat: 7.2906, lng: 80.6337 },
  hatton: { lat: 6.8941, lng: 80.5937 },
  galle: { lat: 6.0535, lng: 80.221 },
  negombo: { lat: 7.2083, lng: 79.8358 },
  trincomalee: { lat: 8.5874, lng: 81.2152 },
  "nuwara eliya": { lat: 6.9707, lng: 80.7829 },
  anuradhapura: { lat: 8.3114, lng: 80.4037 },
  jaffna: { lat: 9.6615, lng: 80.0255 },
  batticaloa: { lat: 7.7102, lng: 81.6924 },
  matara: { lat: 5.9549, lng: 80.5549 },
  polonnaruwa: { lat: 7.9403, lng: 81.0188 },
  ratnapura: { lat: 6.6828, lng: 80.399 },
  dambulla: { lat: 7.8569, lng: 80.6521 },
  badulla: { lat: 6.9895, lng: 81.055 },
  malabe: { lat: 6.9279, lng: 79.9995 },
};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! Ask me about weather or emergencies in Sri Lankan cities. You can speak or type.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null, city: "" });
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setInput(speechResult);
        setListening(false);
        sendMessage(speechResult);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      alert("Speech Recognition API not supported in this browser.");
    }
  }, []);

  const detectCity = (text) => {
    const lower = text.toLowerCase();
    for (const city in CITY_COORDINATES) {
      if (lower.includes(city)) {
        return { ...CITY_COORDINATES[city], city };
      }
    }
    return null;
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const cityInfo = detectCity(text);
    if (cityInfo) setLocation(cityInfo);

    setMessages((msgs) => [...msgs, { from: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/nlp_query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();

      setMessages((msgs) => [...msgs, { from: "bot", text: data.message }]);
      speak(data.message);
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.error("Speech recognition start error", err);
    }
  };

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        padding: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        borderRadius: 20,
        backgroundColor: "#fefefe",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          fontWeight: "700",
          fontSize: 24,
          color: "#333",
          marginBottom: 24,
        }}
      >
        <span role="img" aria-label="Weather">
          🌦️
        </span>
        Weather & Emergency Chatbot
        <span role="img" aria-label="Emergency">
          🚨
        </span>
      </h2>

      <div
        style={{
          border: "2px solid #4a90e2",
          borderRadius: 20,
          padding: 18,
          height: 340,
          overflowY: "auto",
          background:
            "linear-gradient(135deg, #e0f0ff 0%, #ffffff 100%)",
          boxShadow: "0 6px 15px rgba(74, 144, 226, 0.2)",
          marginBottom: 24,
          scrollbarWidth: "thin",
          scrollbarColor: "#4a90e2 #e0f0ff",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.from === "user" ? "right" : "left",
              marginBottom: 12,
              maxWidth: "80%",
              marginLeft: msg.from === "user" ? "auto" : undefined,
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "10px 16px",
                borderRadius: 18,
                backgroundColor: msg.from === "user" ? "#0d6efd" : "#e9ecef",
                color: msg.from === "user" ? "white" : "#212529",
                fontSize: 16,
                lineHeight: 1.4,
                boxShadow: msg.from === "user" ? "0 2px 8px rgba(13, 110, 253, 0.5)" : "none",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type or speak: What’s the weather in Kandy?"
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px 20px",
          fontSize: 18,
          borderRadius: 20,
          border: "2px solid #ced4da",
          marginBottom: 18,
          transition: "border-color 0.3s ease",
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#4a90e2")}
        onBlur={(e) => (e.target.style.borderColor = "#ced4da")}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px 0",
          fontSize: 18,
          backgroundColor: loading ? "#6c757d" : "#0d6efd",
          color: "white",
          border: "none",
          borderRadius: 20,
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: 16,
          boxShadow: "0 4px 12px rgba(13, 110, 253, 0.4)",
          transition: "background-color 0.3s ease",
        }}
      >
        {loading ? "Loading..." : "Send"}
      </button>

      <button
        onClick={startListening}
        disabled={loading || listening}
        style={{
          width: "100%",
          padding: "14px 0",
          fontSize: 18,
          backgroundColor: listening ? "#dc3545" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: 20,
          cursor: loading || listening ? "not-allowed" : "pointer",
          boxShadow: listening
            ? "0 4px 12px rgba(220, 53, 69, 0.4)"
            : "0 4px 12px rgba(40, 167, 69, 0.4)",
          transition: "background-color 0.3s ease",
        }}
        title={listening ? "Listening..." : "Click to speak"}
      >
        {listening ? "🎙️ Listening..." : "🎙️ Speak"}
      </button>

      {/* Show Map if location available */}
      {location.lat && location.lng && (
        <div
          style={{
            marginTop: 32,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          
        </div>
      )}
    </div>
  );
}
