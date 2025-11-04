'use client';

import App from 'next/app';
import { redirect } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function ProtectedPage()
{
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false); // Simulate payment status
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userMessagesCount = messages.filter(m => m.role === 'user').length;
  const messageLimit = 10;
  const isLimitReached = !isPaidUser && userMessagesCount >= messageLimit;

  const scrollToBottom = () =>
  {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() =>
  {
    scrollToBottom();
  }, [messages]);

  useEffect(() =>
  {
    inputRef.current?.focus();

    // Check for payment token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentToken = urlParams.get('paymentToken');
    if (paymentToken) {
      localStorage.setItem('x402-payment-token', paymentToken);
      // Remove the token from URL
      window.history.replaceState({}, document.title, '/chat');
    }
  }, []);


  const handleSubmit = async (e: React.FormEvent) =>
  {
    e.preventDefault();
    if (!input.trim() || isLimitReached) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-payment-token': localStorage.getItem('x402-payment-token') || '',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.status === 402) {
        console.log('Payment required for this message.');
        const paymentUrl = window.location.origin + '/protected?returnUrl=' + encodeURIComponent('/chat');
        window.location.href = paymentUrl;
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // If we got a successful response, we're a paid user
      setIsPaidUser(true);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Chat Assistant</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 dark:text-gray-400">
                  Start a conversation by typing a message below.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                      }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 text-gray-800 dark:text-white">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {isLimitReached && (
              <div className="text-center text-red-500 mb-4">
                You have reached the message limit. Please upgrade to continue.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLimitReached ? "Message limit reached" : "Type your message..."}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled={isLoading || isLimitReached}
              />
              <button
                type="submit"
                disabled={isLoading || isLimitReached}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
