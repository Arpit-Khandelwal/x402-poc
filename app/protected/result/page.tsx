"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResultPage()
{
    const searchParams = useSearchParams();
    const code = searchParams?.get('code');
    const origFromQuery = searchParams?.get('u') || null;
    const [original, setOriginal] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false); useEffect(() =>
    {
        if (!code) return;

        // If the original URL was passed in the query (u), use it immediately.
        if (origFromQuery) {
            try {
                setOriginal(decodeURIComponent(origFromQuery));
            } catch (e) {
                setOriginal(origFromQuery);
            }
            return;
        }

        setLoading(true);
        fetch(`/api/short/${code}`)
            .then((r) =>
            {
                if (!r.ok) throw new Error('Not found');
                return r.json();
            })
            .then((data) => setOriginal(data.original))
            .catch(() => setError('Short link not found'))
            .finally(() => setLoading(false));
    }, [code]);

    const shortUrl = code ? `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${code}` : '';

    function copyToClipboard()
    {
        if (!shortUrl) return;
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-xl bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-4">Your short link</h1>

                {loading && <p>Loading...</p>}

                {error && <p className="text-red-600">{error}</p>}

                {code && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Shortened link (click to copy):</p>
                        <div className="flex items-center gap-3 flex-wrap">
                            <code className="text-indigo-600 break-all">
                                {shortUrl}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                className={`px-3 py-1 ${copied ? 'bg-green-600' : 'bg-indigo-600'} text-white rounded-md whitespace-nowrap transition-colors`}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        {original && (
                            <>
                                <p className="text-sm text-gray-500">Original URL:</p>
                                <a
                                    href={original}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-indigo-600 break-all hover:underline"
                                >
                                    {original}
                                </a>
                            </>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
