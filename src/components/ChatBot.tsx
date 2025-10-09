import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
  link?: string;
}

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  link?: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your MyMalaysia Care+ assistant. Ask me about recycling, environmental protection, or disaster safety!",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load FAQ data
    fetch("/data/faq.json")
      .then((res) => res.json())
      .then((data) => setFaqs(data))
      .catch((err) => console.error("Failed to load FAQs:", err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findBestMatch = (query: string): FAQ | null => {
    const lowerQuery = query.toLowerCase();
    
    // Simple fuzzy search implementation
    let bestMatch: FAQ | null = null;
    let bestScore = 0;

    faqs.forEach((faq) => {
      let score = 0;
      
      // Check keywords
      faq.keywords.forEach((keyword) => {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          score += 2;
        }
      });

      // Check question
      const questionWords = faq.question.toLowerCase().split(" ");
      questionWords.forEach((word) => {
        if (lowerQuery.includes(word) && word.length > 3) {
          score += 1;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    });

    return bestScore > 2 ? bestMatch : null;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Find matching answer
    const match = findBestMatch(input);
    
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: match 
          ? match.answer 
          : "I'm not sure about that. Try asking about recycling, e-waste disposal, environmental protection, or disaster safety!",
        isBot: true,
        link: match?.link,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-custom-lg gradient-primary z-50 animate-float"
        size="icon"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] flex flex-col shadow-custom-xl z-50 animate-bounce-in">
          {/* Header */}
          <div className="gradient-hero text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-sm text-white/90">Ask me anything about recycling and environment!</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot
                      ? "bg-muted text-foreground"
                      : "gradient-primary text-white"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.link && (
                    <a
                      href={message.link}
                      className="text-sm underline mt-2 block font-semibold hover:opacity-80"
                    >
                      Learn more →
                    </a>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="gradient-primary"
            >
              <Send size={18} />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
