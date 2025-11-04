import Link from 'next/link';
import WordmarkCondensed from './assets/x402_wordmark_dark.svg';

export default function Home()
{
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-grow">
        {/* Hero Section with x402 Branding */}
        <section className="max-w-7xl mx-auto px-4 pt-20 pb-12 text-center">
          <div className="w-64 mb-8 mx-auto">
            <WordmarkCondensed className="mx-auto" />
          </div>
          <h1 className="text-5xl font-bold mb-6 text-white">
            Pay-as-you-go Web Services
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Experience premium services powered by x402's secure blockchain payments —
            pay only for what you use, no subscriptions required.
          </p>
        </section>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Chat Service */}
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 hover:border-white/20 transition-colors">
              <div className="h-12 w-12 bg-zinc-800 rounded-lg mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">AI Chat Assistant</h2>
              <p className="text-zinc-400 mb-6">
                Premium AI chat powered by ChatGPT. Pay per message, get instant responses.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-zinc-300">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced AI capabilities
                </li>
                <li className="flex items-center text-zinc-300">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Pay-per-message pricing
                </li>
                <li className="flex items-center text-zinc-300">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  No subscription required
                </li>
              </ul>
              <Link
                href="/chat"
                className="inline-flex items-center px-6 py-3 bg-white hover:bg-zinc-100 rounded-lg font-semibold transition-colors text-black"
              >
                Try AI Chat
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Link Shortener Service */}
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 hover:border-white/20 transition-colors">
              <div className="h-12 w-12 bg-zinc-800 rounded-lg mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">URL Shortener</h2>
              <p className="text-zinc-400 mb-6">
                Create short, memorable links instantly. Pay once per link, use forever.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-zinc-300">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Instant short URLs
                </li>
                <li className="flex items-center text-zinc-300">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  One-time payment
                </li>
                <li className="flex items-center text-zinc-300">
                  <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Permanent links
                </li>
              </ul>
              <Link
                href="/bitly"
                className="inline-flex items-center px-6 py-3 bg-white hover:bg-zinc-100 rounded-lg font-semibold transition-colors text-black"
              >
                Shorten URL
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* x402 Payment Highlight */}
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <div className="bg-zinc-900/50 rounded-xl p-8 text-center border border-zinc-800">
            <h2 className="text-2xl font-bold mb-4">Powered by x402 Payments</h2>
            <p className="text-zinc-400 mb-6">
              Experience the future of web payments. x402 enables secure, instant micropayments
              using blockchain technology. No subscriptions, no minimum commitments — just pay for what you use.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://x402.tools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white hover:bg-zinc-100 rounded-lg transition-colors text-sm text-black"
              >
                Learn More
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="https://docs.x402.tools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm text-white"
              >
                Documentation
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-zinc-500 border-t border-zinc-900">
        By using this site, you agree to be bound by the{' '}
        <a
          href="https://www.coinbase.com/legal/developer-platform/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-zinc-300"
        >
          CDP Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="https://www.coinbase.com/legal/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-zinc-300"
        >
          Global Privacy Policy
        </a>
        .
      </footer>
    </div>
  );
}
