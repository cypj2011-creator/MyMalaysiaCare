import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

const ChatBot = () => {
  const { t, lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: t("helloMessage"),
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages((prev) => [
      {
        id: 1,
        text: t("helloMessage"),
        isBot: true,
      },
      ...prev.slice(1),
    ]);
  }, [lang, t]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        if (data.text) {
          setInput(data.text);
          await handleSendMessage(data.text);
        }
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setIsLoading(false);
    }
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
        ? '你是一个有用的环保助手。请用中文回答有关回收和环境保护的问题。保持回答简洁明了。'
        : lang === 'ms'
        ? 'Anda adalah pembantu alam sekitar yang membantu. Jawab soalan tentang kitar semula dan perlindungan alam sekitar dalam Bahasa Melayu. Pastikan jawapan ringkas dan jelas.'
        : 'You are a helpful environmental assistant. Answer questions about recycling and environmental protection in English. Keep answers concise and clear.';

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          message: textToSend,
          language: lang,
          systemPrompt
        }
      });

      if (error) {
        console.error("Chat error:", error);
        toast.error("Failed to get response. Please try again.");
        const errorMessage: Message = {
          id: messages.length + 2,
          text: "Sorry, I encountered an error. Please try again!",
          isBot: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const botMessage: Message = {
          id: messages.length + 2,
          text: data.message || "I'm sorry, I couldn't generate a response.",
          isBot: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred.");
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, something went wrong. Please try again later!",
        isBot: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
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
        <Card className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] flex flex-col shadow-custom-xl z-50 animate-bounce-in">
          {/* Header */}
          <div className="gradient-hero text-white p-3 sm:p-4 rounded-t-lg">
            <h3 className="font-semibold text-sm sm:text-base break-words">{t("aiAssistant")}</h3>
            <p className="text-xs sm:text-sm text-white/90 break-words leading-relaxed">{t("askMeAnything")}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-2.5 sm:p-3 ${
                    message.isBot
                      ? "bg-muted text-foreground"
                      : "gradient-primary text-white"
                  }`}
                >
                  <p className="text-xs sm:text-sm break-words leading-relaxed">{message.text}</p>
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
              placeholder={t("typeYourQuestion")}
              className="flex-1"
              disabled={isLoading || isRecording}
            />
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              disabled={isLoading}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
            <Button
              onClick={handleSend}
              size="icon"
              className="gradient-primary"
              disabled={isLoading || isRecording}
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
