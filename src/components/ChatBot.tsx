import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Mic, MicOff, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const getSpeechRecognition = (): (new () => SpeechRecognitionInstance) | null => {
  if (typeof window === "undefined") return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
};

const ChatBot = () => {
  const { t, lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: t("helloMessage"), isBot: true },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const cleanBotText = (text: string) =>
    text.replace(/\n{3,}/g, "\n\n").trim();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    setMessages((prev) => [
      { id: 1, text: t("helloMessage"), isBot: true },
      ...prev.slice(1),
    ]);
  }, [lang, t]);

  const startRecording = () => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      toast.error("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (!window.isSecureContext) {
      toast.error("Voice input needs a secure (https) connection.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = lang === "zh" ? "zh-CN" : lang === "ms" ? "ms-MY" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      let finalText = "";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += transcript;
          else interim += transcript;
        }
        setInput(finalText + interim);
      };

      recognition.onerror = (e: any) => {
        setIsRecording(false);
        if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
          toast.error("Microphone permission denied.");
        } else if (e?.error === "no-speech") {
          toast.error("No speech detected.");
        } else {
          toast.error("Voice input failed.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
        const text = finalText.trim();
        if (text) {
          setInput("");
          handleSendMessage(text);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      toast.success("Listening… speak now");
    } catch (error) {
      setIsRecording(false);
      toast.error("Could not start voice input.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsRecording(false);
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: textToSend,
      isBot: false,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const systemPrompt = lang === 'zh'
        ? '你是一个有用的环保助手。请用中文回答有关回收和环境保护的问题。使用简短的段落、项目符号列表和粗体标题，使回答清晰易读。'
        : lang === 'ms'
        ? 'Anda pembantu alam sekitar. Jawab dalam Bahasa Melayu tentang kitar semula. Gunakan perenggan pendek, senarai berbutir, dan tajuk tebal supaya mudah dibaca.'
        : 'You are a helpful recycling and eco assistant. Respond in clear, well-structured markdown: short paragraphs, bullet lists, and **bold** headings where helpful. Keep it concise and easy to scan.';

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: textToSend, language: lang, systemPrompt }
      });

      if (error) {
        toast.error("Failed to get response.");
        setMessages((prev) => [...prev, { id: prev.length + 1, text: "Sorry, I had trouble reaching the assistant. Please try again.", isBot: true }]);
      } else {
        setMessages((prev) => [...prev, {
          id: prev.length + 1,
          text: cleanBotText(data.message || "I couldn't generate a response."),
          isBot: true,
        }]);
      }
    } catch {
      toast.error("An unexpected error occurred.");
      setMessages((prev) => [...prev, { id: prev.length + 1, text: "Something went wrong. Please try again.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => handleSendMessage();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-custom-lg gradient-primary z-50"
        size="icon"
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>

      {isOpen && (
        <Card
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[560px] max-h-[calc(100vh-8rem)] flex flex-col shadow-custom-xl z-50 animate-bounce-in overflow-hidden font-sans"
          style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
        >
          {/* Header */}
          <div className="gradient-hero text-white px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight">{t("aiAssistant")}</h3>
              <p className="text-xs text-white/85 leading-tight">{t("askMeAnything")}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-muted/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                {message.isBot && (
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0 mb-1">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                    message.isBot
                      ? "bg-background text-foreground rounded-bl-sm border"
                      : "gradient-primary text-white rounded-br-sm"
                  }`}
                >
                  {message.isBot ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words font-medium">{message.text}</p>
                  )}
                </div>
                {!message.isBot && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mb-1">
                    <User size={14} className="text-primary" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0 mb-1">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-background border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-background flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("typeYourQuestion")}
              className="flex-1 font-normal"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              disabled={isLoading || isRecording}
            />
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              disabled={isLoading}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
            <Button
              onClick={handleSend}
              size="icon"
              className="gradient-primary"
              disabled={isLoading || isRecording || !input.trim()}
              aria-label="Send message"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
