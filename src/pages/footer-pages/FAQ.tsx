import React from "react";

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">
          Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mb-8">
          Last updated: [12.30.2025]
        </p>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            1. What is FlashMovies?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            FlashMovies is a movie discovery and streaming index website that
            provides embedded links to movies and video content hosted on third-party platforms. 
            We do not host or stream movies directly from our servers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            2. Do I need an account to watch movies?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            No, you do not need to create an account. All embedded movies are publicly accessible.
            However, some third-party platforms may require an account or subscription to view certain content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            3. Is FlashMovies free?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            Yes, FlashMovies is completely free to use. We earn revenue from third-party advertisements displayed on the site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            4. Do you host the movies on your server?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            No. FlashMovies only indexes and embeds movies from third-party sources. 
            We do not upload, store, or stream any media content ourselves.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            5. How do I report copyright infringement?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            If you believe your copyrighted material is improperly embedded or linked on FlashMovies, please submit a DMCA notice to our email: <strong>flashmoviesxyz@gmail.com</strong>.
            Include all necessary information such as your contact info, URLs, and a statement of good faith.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            6. Can I watch movies on my phone or tablet?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            Yes, FlashMovies is mobile-friendly. You can watch embedded movies on any device with a modern web browser.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            7. Why are some movies not available?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            FlashMovies does not control third-party content. Movies may be removed or restricted by the original hosting platforms. We strive to keep links updated, but availability depends on external sources.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            8. Is it safe to use FlashMovies?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            FlashMovies itself is safe to use. However, some third-party platforms may display ads or content that are not under our control. Always use caution when clicking external links.
          </p>
        </section>
      </div>
    </div>
  );
}
