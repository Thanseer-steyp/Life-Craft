"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function ChatPage() {
  const params = useParams();
  const appointmentId = params.id;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // ✅ Load after mount
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("user_id");
      if (storedUserId) {
        setUserId(parseInt(storedUserId));
      }
    }
  }, []);

  useEffect(() => {
    if (!appointmentId) return;

    const token = localStorage.getItem("access");

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/user/chat/${appointmentId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data.messages);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const token = localStorage.getItem("access");

    try {
      await axios.post(
        `http://localhost:8000/api/v1/user/chat/${appointmentId}/`,
        { content: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInput("");
      const res = await axios.get(
        `http://localhost:8000/api/v1/user/chat/${appointmentId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-2xl mx-auto mt-6 border border-gray-300 rounded-xl bg-[#e5ddd5]">
      {/* Header */}
      <div className="bg-[#075E54] text-white py-3 px-4 rounded-t-xl flex items-center justify-between">
        <h2 className="font-semibold text-lg">💬 Chat Room #{appointmentId}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 flex flex-col">
        {messages.map((msg) => {
          const isSender = msg.sender === userId;
          const displayName = isSender ? "You" : msg.sender_name || "Advisor";

          return (
            <div
              key={msg.id}
              className={`flex w-full ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] flex flex-col ${
                  isSender ? "items-end" : "items-start"
                }`}
              >
                <span
                  className={`text-xs mb-1 font-medium ${
                    isSender ? "text-[#075E54]" : "text-[#128C7E]"
                  }`}
                >
                  {displayName}
                </span>

                <div
                  className={`px-3 py-2 rounded-2xl shadow text-sm ${
                    isSender
                      ? "bg-[#dcf8c6] text-gray-800 rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-[10px] text-gray-500 text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input area */}
      <div className="bg-[#f0f0f0] border-t border-gray-300 p-3 flex items-center gap-2 rounded-b-xl">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white rounded-full px-4 py-2 outline-none text-gray-800"
        />
        <button
          onClick={sendMessage}
          className="bg-[#075E54] text-white px-4 py-2 rounded-full hover:bg-[#0a6b61] transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
