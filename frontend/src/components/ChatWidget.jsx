import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatWidget.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'https://insurance-intake-agent.azurewebsites.net';

export function ChatWidget({ cases = [], statistics = null, currentCase = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const previousCaseIdRef = useRef(null);

  const activeCase = currentCase || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const caseId = activeCase?.id;
    if (caseId && caseId !== previousCaseIdRef.current) {
      setMessages([
        {
          id: Date.now(),
          sender: 'assistant',
          text: `You are reviewing ${activeCase.label}. Ask anything about its invoices, ATP plan, or logistics.`,
          timestamp: new Date()
        }
      ]);
      previousCaseIdRef.current = caseId;
      setIsOpen(true);
    }
  }, [activeCase]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    const userMessage = { id: Date.now(), sender: 'user', text: userMessageText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);

    const chatHistory = [...messages, userMessage].slice(-10).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    // Prepare context for NIPS
    const contextIntro = activeCase
      ? `Case context:\n` +
        `- Case ID: ${activeCase.id || 'N/A'}\n` +
        `- Vendor: ${activeCase.vendor || 'N/A'}\n` +
        `- Customer: ${activeCase.customer || 'N/A'}\n` +
        `- Type: ${activeCase.type || 'N/A'}\n` +
        `- Status: ${activeCase.status || 'Unknown'}\n` +
        `- ATP Notes: ${activeCase.atpNotes || 'No notes'}\n\n`
      : '';

    const payloadMessage = contextIntro ? `${contextIntro}${userMessageText}` : userMessageText;

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: payloadMessage,
          chat_history: chatHistory,
          context_type: activeCase ? 'case' : 'dashboard',
          claims_data: {
            statistics: statistics ? {
              totalInvoices: statistics.totalInvoices || 0,
              approved: statistics.approved || 0,
              pending: statistics.pending || 0,
              atpAlerts: statistics.atpAlerts || 0
            } : null,
            recentCases: (cases || []).slice(0, 5).map(caseItem => ({
              id: caseItem?.id || 'N/A',
              vendor: caseItem?.vendor || 'N/A',
              customer: caseItem?.customer || 'N/A',
              type: caseItem?.type || 'N/A',
              status: caseItem?.status || 'Unknown',
              atpNotes: caseItem?.atpNotes || 'No notes'
            })),
            currentCase: activeCase ? {
              id: activeCase.id || 'N/A',
              vendor: activeCase.vendor || 'N/A',
              customer: activeCase.customer || 'N/A',
              type: activeCase.type || 'N/A',
              status: activeCase.status || 'Unknown',
              atpNotes: activeCase.atpNotes || 'No notes',
              amount: activeCase.amount != null ? activeCase.amount : null
            } : null
          },
          client: 'nips'
        })
      });

      const data = await response.json();
      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text:
          data.success && data.response
            ? data.response
            : data.error || 'Unable to contact the invoice assistant. Please retry shortly.',
        timestamp: new Date(),
        isError: !data.success
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: 'Connection failed. Verify the backend is reachable.',
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button className="chat-fab" onClick={() => setIsOpen(true)} aria-label="Open Celanese copilot">
          🤖
        </button>
      )}
      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <div>
              <p className="eyebrow">Celanese NIPS Copilot</p>
              <strong>{activeCase ? activeCase.label : 'Portfolio overview'}</strong>
            </div>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-bubble chat-bubble--${message.sender} ${message.isError ? 'chat-bubble--error' : ''}`}
              >
                {message.sender === 'assistant' && !message.isError ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
                <span>{message.timestamp.toLocaleTimeString()}</span>
              </div>
            ))}
            {isLoading && <div className="chat-typing">Assistant is drafting…</div>}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask about ATP, logistics, pricing…"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button type="submit" disabled={isLoading || !inputMessage.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

