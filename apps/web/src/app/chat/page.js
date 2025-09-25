"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your shopping assistant. Choose a question below to get started.",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);

  // Fetch products data on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          console.log("Products fetched:", data);
          setProducts(data);
        } else {
          console.error("Failed to fetch products:", response.status);
          // Use mock data if API fails
          setProducts([
            {
              id: 1,
              productName: "Classic Hoodie",
              color: "Black",
              price: 89.99,
              inStock: true,
              description: "Premium cotton hoodie"
            },
            {
              id: 2,
              productName: "Streetwear Tee",
              color: "White",
              price: 45.00,
              inStock: true,
              description: "Comfortable cotton t-shirt"
            },
            {
              id: 3,
              productName: "Urban Jacket",
              color: "Navy",
              price: 129.99,
              inStock: false,
              description: "Stylish urban jacket"
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Use mock data if fetch fails
        setProducts([
          {
            id: 1,
            productName: "Classic Hoodie",
            color: "Black",
            price: 89.99,
            inStock: true,
            description: "Premium cotton hoodie"
          },
          {
            id: 2,
            productName: "Streetwear Tee",
            color: "White",
            price: 45.00,
            inStock: true,
            description: "Comfortable cotton t-shirt"
          },
          {
            id: 3,
            productName: "Urban Jacket",
            color: "Navy",
            price: 129.99,
            inStock: false,
            description: "Stylish urban jacket"
          }
        ]);
      }
    };

    fetchProducts();
  }, []);

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
      let botResponse = "";
      console.log("Processing prompt:", prompt);
      console.log("Available products:", products);

      // Generate responses based on backend data
      if (prompt.includes("products available")) {
        if (products.length > 0) {
          const availableProducts = products.filter(p => p.inStock);
          botResponse = `We currently have ${availableProducts.length} products available:\n\n${availableProducts
            .slice(0, 5)
            .map(p => `• ${p.productName} - ${p.color} ($${p.price})`)
            .join('\n')}`;
          if (availableProducts.length > 5) {
            botResponse += `\n\n...and ${availableProducts.length - 5} more items!`;
          }
        } else {
          botResponse = "I'm still loading our product catalog. Please try again in a moment.";
        }
      } else if (prompt.includes("price range")) {
        if (products.length > 0) {
          const prices = products.map(p => p.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          botResponse = `Our products range from $${minPrice.toFixed(2)} to $${maxPrice.toFixed(2)}. What's your budget?`;
        } else {
          botResponse = "I'm still loading pricing information. Please try again in a moment.";
        }
      } else if (prompt.includes("popular items")) {
        if (products.length > 0) {
          const popularItems = products.slice(0, 3);
          botResponse = `Here are some of our popular items:\n\n${popularItems
            .map(p => `• ${p.productName} in ${p.color} - $${p.price} ${p.inStock ? '✅ In Stock' : '❌ Out of Stock'}`)
            .join('\n')}`;
        } else {
          botResponse = "I'm still loading our popular items. Please try again in a moment.";
        }
      } else if (prompt.includes("colors available")) {
        if (products.length > 0) {
          const colors = [...new Set(products.map(p => p.color))];
          botResponse = `We have products available in these colors:\n${colors.join(', ')}`;
        } else {
          botResponse = "I'm still loading color options. Please try again in a moment.";
        }
      } else if (prompt.includes("stock")) {
        if (products.length > 0) {
          const inStock = products.filter(p => p.inStock).length;
          const total = products.length;
          botResponse = `Currently ${inStock} out of ${total} products are in stock. Would you like to see what's available?`;
        } else {
          botResponse = "I'm checking our inventory. Please try again in a moment.";
        }
      } else {
        // Fallback for other prompts
        botResponse = "Thanks for your question! I can help you with product information, pricing, stock availability, and more. Try one of the other prompts below.";
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
                  "What products are available?",
                  "Show me your price range",
                  "What are your popular items?",
                  "What colors are available?",
                  "Check stock availability",
                  "Help me find my size",
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

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                {products.length > 0
                  ? `Showing information from ${products.length} products in our catalog`
                  : "Loading product catalog..."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
