import React from 'react';

export const metadata = {
    title: 'Bitly — Shorten links',
};

export default function BitlyPage()
{
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-4">Create a short link</h1>
                <p className="text-sm text-gray-600 mb-4">
                    Enter the URL you want to shorten. After submitting, you'll be prompted to complete a small payment. When the payment completes you'll see your shortened link.
                </p>

                <form action="/protected/create" method="post" className="space-y-4">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">URL</span>
                        <input
                            name="url"
                            type="url"
                            required
                            placeholder="https://example.com/very/long/path"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </label>

                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Continue to payment
                    </button>
                </form>
            </div>
        </main>
    );
}
