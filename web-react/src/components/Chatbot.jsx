import { useEffect, useRef, useState } from 'react';
import { trackWhatsAppClick } from '../hooks/useWhatsAppTracking';
import { buildWaUrl } from '../lib/constants';
import WhatsAppIcon from './WhatsAppIcon';

const SUGGESTIONS = [
  { q: 'What are your hours?', label: '🕐 Hours' },
  { q: 'Where are you located?', label: '📍 Location' },
  { q: 'What products do you have?', label: '🍾 Products' },
  { q: 'Do you deliver?', label: '🚚 Delivery' },
];

/* Ports script.js `initChatbot()` — the regex knowledge base in
   `answerQuestion()` is copied verbatim (same patterns, same order,
   same fallback-to-WhatsApp behavior with `.chat-wa-fallback-btn`). */
function answerText(q) {
  const query = q.toLowerCase().trim();

  if (query.match(/(hour|open|close|when|schedule|time|sunday|saturday|monday|tuesday)/)) {
    return { html: 'We are open <strong>Monday through Saturday from 10:00 AM to 9:00 PM</strong>. We are closed on Sundays. ¡Te esperamos!' };
  }
  if (query.match(/(where|location|located|address|find|shaver|pasadena|houston|direction|map)/)) {
    return { html: 'We are conveniently located at <strong>3370 Shaver St, Pasadena, TX 77504</strong>, near Houston in Harris County. Come visit us!' };
  }
  if (query.match(/(tequila|mezcal|anejo|añejo|reposado|blanco|cristalino|jalisco|oaxaca|agave)/)) {
    return { html: 'We carry over 500 varieties of authentic Mexican tequila and mezcal! Featured items include <strong>Tequila Añejo ($45.99)</strong>, <strong>Mezcal Artesanal ($44.99 sale)</strong>, and <strong>Tequila Reposado ($32.99 sale)</strong>.' };
  }
  if (query.match(/(beer|cerveza|craft|import|corona|modelo|pacifico|chela|ipa)/)) {
    return { html: 'We stock imported Mexican cerveza, local Texas craft beers, and domestic favorites! Try our 6-pack <strong>Craft Beer Pack for $18.99</strong>.' };
  }
  if (query.match(/(whiskey|whisky|bourbon|scotch|rye|kentucky|jack|maker)/)) {
    return { html: 'We offer smooth bourbons and fine whiskeys, including <strong>Kentucky Bourbon ($38.99)</strong> and rare small-batch releases.' };
  }
  if (query.match(/(wine|vino|red|white|rose|rosado|champagne|sparkling)/)) {
    return { html: 'We have a curated collection of select red, white, and sparkling wines from top bodegas and vineyards!' };
  }
  if (query.match(/(spanish|español|espanol|habla|idioma|bilingue|bilingual|mexico|latino)/)) {
    return { html: '¡Sí! Nuestro equipo es 100% bilingüe en inglés y español. Estamos para ayudarle con la mejor actitud.' };
  }
  if (query.match(/(phone|call|contact|email|number|telephone|reach|speak)/)) {
    return { html: 'You can call us at <strong>+1 (713) 360-6526</strong>, email <strong>info@elbarrilito.com</strong>, or send us a WhatsApp message at <strong>+1 (832) 736-7123</strong>!' };
  }
  if (query.match(/(order|buy|purchase|price|cost|delivery|deliver|shipping|pickup|cart|checkout|whatsapp)/)) {
    return { html: 'You can order directly via WhatsApp! Add items to your cart on this page and click <strong>Complete Order on WhatsApp</strong>, or chat with us at <strong>+1 (832) 736-7123</strong>.' };
  }
  if (query.match(/(who|what|about|store|barrilito|name|why)/)) {
    return { html: 'El Barrilito Liquor Store is Pasadena\'s trusted neighborhood liquor store, offering over 1000 premium brands and 5-star bilingual service!' };
  }

  return {
    html: "I don't have an exact answer for that question in my automated knowledge base — but our bilingual staff would love to answer you directly on WhatsApp!",
    waFallbackQuestion: q,
  };
}

let msgId = 0;

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const firstOpenRef = useRef(true);
  const messagesElRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesElRef.current) {
      messagesElRef.current.scrollTop = messagesElRef.current.scrollHeight;
    }
  }, [messages]);

  function openChat() {
    setOpen(true);
    if (firstOpenRef.current && messages.length === 0) {
      addBotMessage("¡Hola! Welcome to El Barrilito Liquor Store in Pasadena, TX. 🥃 How can I help you today? Ask me about our hours, location, tequila & mezcal collection, or ordering!");
      firstOpenRef.current = false;
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  }
  function closeChat() {
    setOpen(false);
  }

  function addBotMessage(html, waFallbackQuestion = null) {
    msgId += 1;
    setMessages((prev) => [...prev, { id: msgId, role: 'bot', html, waFallbackQuestion }]);
  }
  function addUserMessage(text) {
    msgId += 1;
    setMessages((prev) => [...prev, { id: msgId, role: 'user', text }]);
  }

  function ask(q) {
    addUserMessage(q);
    setTimeout(() => {
      const { html, waFallbackQuestion } = answerText(q);
      addBotMessage(html, waFallbackQuestion);
    }, 450);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    ask(text);
  }

  function handleSuggestion(q) {
    ask(q);
  }

  function handleFallbackClick(question) {
    trackWhatsAppClick({ source: 'chatbot', message: buildWaUrl(`Hi! I have a question: ${question}`) });
  }

  return (
    <>
      <div className="chatbot-fab" id="chatbot-fab" aria-label="Chat with us" onClick={openChat}>
        <div className="chatbot-fab-pulse"></div>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="chatbot-fab-badge">1</span>
      </div>

      <div className={`chatbot-window${open ? ' open' : ''}`} id="chatbot-window">
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <img src="/assets/images/eb-logo.png" alt="EB Logo" className="chatbot-avatar-img" />
            </div>
            <div>
              <strong>El Barrilito</strong>
              <span className="chatbot-status">● Online</span>
            </div>
          </div>
          <button className="chatbot-close" id="chatbot-close" aria-label="Close chat" onClick={closeChat}>✕</button>
        </div>
        <div className="chatbot-messages" id="chatbot-messages" ref={messagesElRef}>
          {messages.map((m) =>
            m.role === 'bot' ? (
              <div className="chat-msg bot" key={m.id}>
                <span dangerouslySetInnerHTML={{ __html: m.html }} />
                {m.waFallbackQuestion && (
                  <>
                    <br />
                    <a
                      href={buildWaUrl(`Hi! I have a question: ${m.waFallbackQuestion}`)}
                      target="_blank"
                      rel="noopener"
                      className="chat-wa-fallback-btn"
                      onClick={() => handleFallbackClick(m.waFallbackQuestion)}
                    >
                      <WhatsAppIcon width={16} height={16} fill="#fff" />
                      Chat on WhatsApp (+1 (832) 736-7123)
                    </a>
                  </>
                )}
              </div>
            ) : (
              <div className="chat-msg user" key={m.id}>{m.text}</div>
            )
          )}
        </div>
        <div className="chatbot-suggestions" id="chatbot-suggestions">
          {SUGGESTIONS.map((s) => (
            <button className="chatbot-sugg" key={s.q} data-q={s.q} onClick={() => handleSuggestion(s.q)}>{s.label}</button>
          ))}
        </div>
        <form className="chatbot-input-area" id="chatbot-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chatbot-input"
            id="chatbot-input"
            placeholder="Ask us anything..."
            autoComplete="off"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="chatbot-send" id="chatbot-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </form>
      </div>
    </>
  );
}
