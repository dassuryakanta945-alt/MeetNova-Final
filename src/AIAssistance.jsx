import { useState, useRef, useEffect } from "react";
import "./AIAssistance.css";

const suggestedPrompts = [
  {
    icon: "📅",
    title: "Meeting Management",
    description: "Help me manage my meetings",
    prompt: "How can I manage my meetings efficiently?",
  },
  {
    icon: "📝",
    title: "Meeting Preparation",
    description: "Help me prepare for a meeting",
    prompt: "Help me prepare for an upcoming meeting.",
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    description: "Improve team collaboration",
    prompt: "How can I improve team collaboration?",
  },
  {
    icon: "⚙️",
    title: "Troubleshooting",
    description: "Help me solve a problem",
    prompt: "I need help troubleshooting a problem in MeetNova.",
  },
];

function AIAssistance() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatStarted, setChatStarted] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = () => {
    const text = input.trim();

    if (!text) return;

    setChatStarted(true);

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        role: "user",
        text,
      },
    ]);

    setInput("");
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setChatStarted(false);
  };

  return (
    <div className="ai-assistance-page">
      <aside className="ai-chat-history">
        <div className="ai-history-header">
          <h3>Chat History</h3>

          <button
            className="ai-new-chat-button"
            onClick={handleNewChat}
            type="button"
          >
            + New Chat
          </button>
        </div>

        <div className="ai-history-empty">
          <span>💬</span>
          <p>Your conversations will appear here.</p>
        </div>
      </aside>

      <main className="ai-main-content">
        <header className="ai-page-header">
          <div>
            
            <h2>AI Assistance</h2>
            <p>Your workspace assistant for smarter collaboration.</p>
          </div>

          <div className="ai-status">
            <span className="ai-status-dot"></span>
            AI Coming Soon
          </div>
        </header>

        {!chatStarted ? (
          <section className="ai-welcome-section">
            <div className="ai-welcome-icon">✦</div>

            <h1>How can I help you today?</h1>

            <p>
              Explore smarter ways to manage meetings, collaborate
              with your team, and organize your workspace.
            </p>

            <div className="ai-suggestions-grid">
              {suggestedPrompts.map((item) => (
                <button
                  className="ai-suggestion-card"
                  key={item.title}
                  onClick={() => handlePromptClick(item.prompt)}
                  type="button"
                >
                  <span className="ai-suggestion-icon">
                    {item.icon}
                  </span>

                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="ai-chat-area">
            {messages.map((message) => (
              <div
                className={`ai-message ai-message-${message.role}`}
                key={message.id}
              >
                <div className="ai-message-avatar">
                  {message.role === "user" ? "S" : "✦"}
                </div>

                <div className="ai-message-content">
                  <strong>
                    {message.role === "user" ? "You" : "MeetNova AI"}
                  </strong>

                  <p>{message.text}</p>
                </div>
              </div>
            ))}

            <div className="ai-coming-soon-notice">
              <span>✦</span>
              <p>
                AI integration is coming soon. Your message is displayed
                here, but AI responses are not available yet.
              </p>
            </div>

            <div ref={messagesEndRef} />
          </section>
        )}

        <div className="ai-composer-wrapper">
          <form
            className="ai-message-composer"
            onSubmit={(event) => {
              event.preventDefault();
              handleSendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask MeetNova AI anything..."
              rows={1}
              aria-label="Write your message"
            />

            <button
              className="ai-send-button"
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              ↑
            </button>
          </form>

          <small className="ai-composer-note">
            MeetNova AI is not connected yet. No AI-generated responses
            will be provided.
          </small>
        </div>
      </main>
    </div>
  );
}

export default AIAssistance;