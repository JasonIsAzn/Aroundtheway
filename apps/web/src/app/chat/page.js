"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Welcome to Aroundtheway! I'm your personal shopping assistant. I'm here to help you discover amazing products, find the perfect fit, and answer any questions about our collection. What would you like to know?",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const handlePromptClick = async (prompt) => {
    const userMessage = {
      id: messages.length + 1,
      text: prompt,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Add realistic processing delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Call the backend ChatBot API
      const response = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: prompt }),
      });

      let botResponse = "";

      if (response.ok) {
        const data = await response.json();
        botResponse = data.message || "I'm here to help! How can I assist you today?";
      } else {
        console.error("API Error:", response.status, response.statusText);
        botResponse = "I'm having trouble connecting to our systems right now. Please try again in a moment.";
      }

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble right now. Please try again later.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomMessage = async (e) => {
    e.preventDefault();
    if (!customMessage.trim() || isLoading) return;

    await handlePromptClick(customMessage.trim());
    setCustomMessage("");
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-black text-white px-6 py-4">
            <h1 className="text-xl font-light tracking-wide">
              Shopping Assistant
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Ask me about products, sizing, shipping, or anything else!
            </p>
          </div>

          {/* Messages Container */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === "user"
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gray-100 text-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">Typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Predefined Prompts Area */}
          <div className="border-t border-gray-200 p-6">
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-4">Choose a question:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "🛍️ What's new this season?",
                  "💰 Show me sale items",
                  "📏 What sizes do you have?",
                  "🚚 Shipping & delivery info",
                  "↩️ Return & exchange policy",
                  "🎯 Help me find my style",
                  "💳 Payment options",
                  "⭐ Best selling items",
                  "🎁 Gift cards available?",
                ].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-4 py-3 text-sm text-left bg-white hover:bg-black hover:text-white border border-gray-300 hover:border-black rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-900 disabled:hover:border-gray-300"
                    disabled={isLoading}
                  >
                    <span className="font-medium">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Input */}
            <div className="mt-6">
              <form onSubmit={handleCustomMessage} className="flex gap-3">
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Ask me about products, sizes, shipping, returns..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!customMessage.trim() || isLoading}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black transition-colors duration-200"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Pro Tips */}
            <div className="pt-4 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4">
                <h6 className="text-sm font-medium text-gray-900 mb-2">💡 Pro Tips:</h6>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Ask specific questions about fit, material, or care instructions</li>
                  <li>• Mention your style preferences for personalized recommendations</li>
                  <li>• Need help choosing between items? I can compare features for you</li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Powered by OpenAI ChatGPT for intelligent shopping assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
