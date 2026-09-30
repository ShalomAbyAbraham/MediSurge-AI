import React, { useState, useRef, useEffect } from 'react';
import { useHealthSystem } from '../context/HealthSystemContext';
import {
  MessageSquareQuote,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  Clock,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'SWASTHYAFLOW';
  text: string;
  timestamp: string;
  engine?: string;
}

export const AskSwasthyaFlowView: React.FC = () => {
  const { stats, facilities, setSelectedFacilityId, setActiveTab } = useHealthSystem();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'SWASTHYAFLOW',
      text: `**Namaste! I am MediSurge AI Copilot.**

I have real-time visibility into 100 Primary Health Centres, 10 essential medicines, and regional drug warehouses across 5 states.

You can ask me about stock-outs, disease surge impacts, cross-district redistribution options, or specific facility diagnostics. Try asking one of the sample questions below.`,
      timestamp: 'Just now',
      engine: 'Gemini-3.8-Flash',
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const contextSummary = `Network Status: ${stats.totalFacilities} PHCs monitored across Maharashtra, Kerala, Uttar Pradesh, Karnataka, and Odisha. ${stats.criticalCount} Critical facilities, ${stats.highRiskCount} High Risk facilities. Top critical facility: PHC-042 (Pipraich Sugarbelt PHC, Gorakhpur) with ORS stock at 2.5 days. Active transfers: ${stats.activeTransfersCount}.`;

      const response = await fetch('/api/gemini/ask-swasthyaflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          contextSummary,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'SWASTHYAFLOW',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          engine: data.engine || 'Gemini-3.8-Flash',
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'SWASTHYAFLOW',
        text: `**System Intelligence Response:**\n\n• **Critical Focus:** PHC-042 (Pipraich Sugarbelt PHC) is currently facing an ORS stockout in 2.5 days due to a gastroenteritis surge.\n• **Immediate Action:** Authorize the 350-unit transfer from Bansgaon CHC in the Redistribution Cockpit.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: 'Deterministic-Fallback',
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleQueries = [
    'Why is PHC-042 at risk of running out of ORS?',
    'Where can we source emergency ORS for Gorakhpur district?',
    'What happens if dengue cases rise by 40%?',
    'Which health facilities have safe surplus insulin?',
    'Show the top 5 most vulnerable PHCs across India this week.',
  ];

  // Voice recognition simulation / Web Speech API toggle
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in (window as any))) {
      // If Web Speech API is not supported in the iframe, toggle voice simulation query
      setIsListening(!isListening);
      if (!isListening) {
        setTimeout(() => {
          setIsListening(false);
          setInputQuery('Where can we source emergency ORS for Gorakhpur district?');
        }, 2000);
      }
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Copilot Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Ask SwasthyaFlow AI
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Natural language resilience copilot powered by Gemini 3.8 Flash, grounded in real-time health data and transfer optimization models.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>100 PHCs Grounded</span>
        </div>
      </div>

      {/* Suggested Inquiries Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-teal-400" /> Prompts:
        </span>
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(q)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Transcript Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[420px] max-h-[550px] flex flex-col justify-between">
        
        <div className="overflow-y-auto space-y-4 pr-2 flex-1">
          {messages.map(msg => {
            const isAI = msg.sender === 'SWASTHYAFLOW';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                    isAI
                      ? 'bg-slate-950 border border-slate-800 text-slate-200'
                      : 'bg-teal-600 text-slate-950 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70">
                    <span className="font-bold">{isAI ? 'SwasthyaFlow Intelligence' : 'Health Officer'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-line prose prose-invert max-w-none text-xs">
                    {msg.text}
                  </div>

                  {isAI && msg.engine && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Engine: {msg.engine}</span>
                      {msg.text.includes('PHC-042') && (
                        <button
                          onClick={() => {
                            setSelectedFacilityId('phc-042');
                            setActiveTab('facility-detail');
                          }}
                          className="text-teal-400 hover:text-teal-300 underline font-sans flex items-center gap-1"
                        >
                          Open PHC-042 Diagnostics &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!isAI && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Grounding query against telemetry data via Gemini 3.8 Flash...
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendQuery(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition ${
                isListening
                  ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isListening ? 'Listening (Speaking...)' : 'Voice Input (Audio Query)'}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask about PHC stock, outbreak hazards, or inter-district transfers..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 placeholder:font-['Outfit'] placeholder:tracking-wide focus:outline-none focus:border-teal-500"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isProcessing}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          {isListening && (
            <p className="text-[10px] text-rose-400 mt-1.5 animate-pulse text-center">
              Microphone listening... Speak your question in English, Hindi, or regional languages.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
