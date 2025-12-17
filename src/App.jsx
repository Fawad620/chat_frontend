import { useState, useEffect, useRef } from "react";

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved
      ? JSON.parse(saved)
      : [{ sender: "bot", text: "🤖 Hello! Ask me anything.", time: new Date().toLocaleTimeString() }];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [blurBg, setBlurBg] = useState(true);
  const chatEndRef = useRef(null);

  const backgroundImages = [
    "url('https://img.dunyanews.tv/news/2023/October/10-12-23/news_big_images/762047_92562360.jpg')",
    "url('https://tse1.mm.bing.net/th/id/OIP.H6YLA3Dan5mxiZsI7Z7lmAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3')",
    "url('https://img.freepik.com/premium-photo/abstract-silhouette-digital-person-concept-artificial-intelligence_217593-46021.jpg')",
    "url('https://miro.medium.com/v2/resize:fit:1024/1*kdTsyCAKiw_FplGvuPFVGw.png')",
  ];

  // Button common style
  const buttonStyle = {
    cursor: "pointer",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "14px",
    color: "#fff",
    transition: "all 0.2s ease",
  };

  // Auto-save and scroll
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input, time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch("https://backend-ye1w.vercel.app//api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.reply, time: new Date().toLocaleTimeString() },
        ]);
        setIsTyping(false);
      }, 700);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Server not responding", time: "" },
      ]);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech Recognition not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.start();
  };

  const clearChat = () => setMessages([]);
  const toggleChatBg = () => setBgIndex((prev) => (prev + 1) % backgroundImages.length);
  const copyMessage = (text) => navigator.clipboard.writeText(text) && alert("Message copied!");
  const deleteMessage = (index) => setMessages((prev) => prev.filter((_, i) => i !== index));
  const exportChat = () => {
    const chatText = messages.map(m => `[${m.time}] ${m.sender}: ${m.text}`).join("\n");
    const blob = new Blob([chatText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chat.txt";
    link.click();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
        background: darkMode
          ? "radial-gradient(circle at top left, #4f46e5 0%, #020617 40%)"
          : "radial-gradient(circle at top left, #93c5fd 0%, #f8fafc 40%)",
        transition: "background 0.5s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "18px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          backgroundImage: backgroundImages[bgIndex],
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 0.5s ease",
        }}
      >
        {/* Redesigned Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: darkMode ? "linear-gradient(90deg, #4f46e5, #1e293b)" : "linear-gradient(90deg, #93c5fd, #e0f2fe)",
            color: "#fff",
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          {/* Left: Logo + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>🤖</span>
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>AI Chat</span>
          </div>

          {/* Right: Buttons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button title="Toggle Dark/Light" onClick={() => setDarkMode(!darkMode)} style={buttonStyle}>
              {darkMode ? "🌞" : "🌙"}
            </button>
            <button title="Clear Chat" onClick={clearChat} style={buttonStyle}>🗑️</button>
            <button title="Change Background" onClick={toggleChatBg} style={buttonStyle}>🎨</button>
            <button title="Increase Font" onClick={() => setFontSize((prev) => prev + 2)} style={buttonStyle}>A+</button>
            <button title="Decrease Font" onClick={() => setFontSize((prev) => Math.max(prev - 2, 10))} style={buttonStyle}>A-</button>
            <button title="Toggle Blur" onClick={() => setBlurBg(!blurBg)} style={buttonStyle}>
              {blurBg ? "🌀 Blur Off" : "🌀 Blur On"}
            </button>
            <button title="Export Chat" onClick={exportChat} style={buttonStyle}>💾 Export</button>
          </div>
        </div>

        {/* Chat Area */}
        <div
          style={{
            flex: 1,
            padding: "14px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: "0 0 18px 18px",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                background: msg.sender === "user" ? "#4f46e5" : darkMode ? "#1f2937" : "#e5e7eb",
                color: msg.sender === "user" ? "#fff" : darkMode ? "#fff" : "#000",
                padding: "10px 14px",
                borderRadius: "14px",
                maxWidth: "80%",
                fontSize: `${fontSize}px`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                filter: blurBg ? "blur(0px)" : "none",
              }}
              title={msg.time} // hover timestamp
            >
              <span>{msg.text}</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => copyMessage(msg.text)} style={{ fontSize: "12px", cursor: "pointer", background: "transparent", border: "none", color: msg.sender === "user" ? "#fff" : darkMode ? "#fff" : "#000" }}>📋</button>
                <button onClick={() => deleteMessage(i)} style={{ fontSize: "12px", cursor: "pointer", background: "transparent", border: "none", color: "red" }}>❌</button>
              </div>
            </div>
          ))}
          {isTyping && <div style={{ fontStyle: "italic", opacity: 0.7 }}>🤖 AI is typing<span className="dots">...</span></div>}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input Area */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            padding: "10px",
            borderTop: darkMode ? "1px solid #334155" : "1px solid #ddd",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={darkMode ? "Type or use mic..." : "Ask me something..."}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              background: darkMode ? "#1e293b" : "#f1f5f9",
              color: darkMode ? "#fff" : "#000",
            }}
          />
          <button onClick={startVoiceInput} style={{ padding: "8px 10px", borderRadius: "10px", border: "none", cursor: "pointer" }}>🎤</button>
          <button onClick={sendMessage} style={{ padding: "8px 14px", borderRadius: "10px", border: "none", background: "#4f46e5", color: "#fff", cursor: "pointer" }}>Send</button>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "6px 0",
            fontSize: "12px",
            color: darkMode ? "#cbd5e1" : "#475569",
            background: darkMode ? "#0f172a" : "#f1f5f9",
            borderBottomLeftRadius: "18px",
            borderBottomRightRadius: "18px",
          }}
        >
          Chatbot developed by Muhammad Fawad Aslam
        </div>
      </div>
    </div>
  );
}
