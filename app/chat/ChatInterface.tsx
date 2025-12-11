'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInterfaceProps
{
    initialCredits: number;
}

export default function ChatInterface({ initialCredits }: ChatInterfaceProps)
{
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Use local state for credits, initialized from the server prop
    const [credits, setCredits] = useState(initialCredits);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

        // Check for draft message from before payment redirect
        const draftMessage = localStorage.getItem('chat_draft_message');
        if (draftMessage) {
            setInput(draftMessage);
            localStorage.removeItem('chat_draft_message');
        }

        // Check for chat history from before payment redirect
        const savedHistory = localStorage.getItem('chat_history');
        if (savedHistory) {
            try {
                setMessages(JSON.parse(savedHistory));
                localStorage.removeItem('chat_history');
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }

        // Check for payment token in URL (Client-Side Verification Flow)
        const urlParams = new URLSearchParams(window.location.search);
        const paymentToken = urlParams.get('paymentToken');

        if (paymentToken) {
            // Verify and redeem the token
            fetch(`/api/chat?paymentToken=${paymentToken}`, {
                headers: {
                    'x-verify': 'true'
                }
            })
                .then(res =>
                {
                    if (res.ok) return res.json();
                    throw new Error('Verification failed');
                })
                .then(data =>
                {
                    if (data.success) {
                        setCredits(data.credits);
                        // Remove the token from URL
                        window.history.replaceState({}, document.title, '/chat');
                        // Also persist locally as backup
                        localStorage.setItem('x402-payment-token', paymentToken);
                    }
                })
                .catch(err => console.error("Payment verification failed:", err));
        }

        // Also check cookies for existing token
        const getCookie = (name: string) =>
        {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        }

        const cookieToken = getCookie('x402-payment-token');
        if (cookieToken) {
            localStorage.setItem('x402-payment-token', cookieToken);
        }
    }, []);


    const handleSubmit = async (e: React.FormEvent) =>
    {
        e.preventDefault();
        // Allow sending if credits > 0
        if (!input.trim() || isLoading) return;

        // Optimistic check (backend enforces final truth)
        if (credits <= 0) {
            // We can potentially show a UI warning here, or just let the backend handle the 402 redirect
        }

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        console.log('[DEBUG_CLIENT] Sending message. Current Client Credits:', credits);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'x-payment-token': localStorage.getItem('x402-payment-token') || '',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (response.status === 402) {
                console.log('Payment required for this message.');
                // Do NOT auto-redirect. Just inform the user.
                alert("You have run out of credits! Please click the 'Buy Credits' button to continue.");
                setIsLoading(false); // Stop loading state
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Update local credits from response
            if (typeof data.credits === 'number') {
                setCredits(data.credits);
            } else {
                // Fallback if API hasn't been updated yet: just decrement locally
                setCredits(prev => Math.max(0, prev - 1));
            }

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
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm font-semibold">
                                Credits: {credits}
                            </div>
                            <a
                                href="/api/buy-credits"
                                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                Buy 5 Credits ($0.01)
                            </a>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-500 dark:text-gray-400 text-center">
                                    Start a conversation by typing a message below.<br />
                                    Payment required when credits run out.
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
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-4">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={"Type your message..."}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
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
