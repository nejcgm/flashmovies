import React from "react";
import { Link } from "react-router-dom";

export default function ProPlanTermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <Link
          to="/payments/plans"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <span>←</span>
          Go back to Plans
        </Link>
      </div>
      <div className="prose prose-invert max-w-none">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">
          Pro Plan Terms &amp; Conditions
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mb-8">
          Last updated: [02.09.2026]
        </p>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            1. Lifetime Access
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            The Pro plan is a one-time purchase that provides lifetime access to Pro features for as long as the platform remains available. &ldquo;Lifetime&rdquo; refers to the lifetime of the service, not the individual user.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            2. Advertisements
          </h2>
          <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-300 leading-relaxed ml-4">
            <li>
              Pro users are guaranteed the removal of ads across the website interface.
            </li>
            <li>
              Advertisements displayed within the movie player may be delivered by third-party providers and are outside of our direct control.
            </li>
            <li>
              While Pro users will experience noticeably reduced or completely removed player ads, the complete absence of all third-party ads cannot be guaranteed.
            </li>
            <li>
              The presence of limited third-party advertisements does not constitute a violation of the Pro plan.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            3. Payments &amp; Security
          </h2>
          <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-300 leading-relaxed ml-4">
            <li>
              User safety and security are our top priority.
            </li>
            <li>
              All payments are securely processed via PayPal, a trusted third-party payment provider.
            </li>
            <li>
              We do not store or process payment card details on our servers.
            </li>
            <li>
              Any payment-related issues, disputes, or chargebacks are handled in accordance with PayPal&rsquo;s terms and policies.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            4. Feature Availability
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4">
            Pro features are provided on an as-is and as-available basis.
          </p>
          <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-300 leading-relaxed ml-4">
            <li>
              Features such as premium servers, HD streaming, and early access may be updated, modified, limited, or discontinued at any time.
            </li>
            <li>
              We do not guarantee uninterrupted service, specific streaming quality, or permanent availability of any content.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            5. No Refund Policy
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            All purchases are final and non-refundable, including one-time payments, unless otherwise required by applicable law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            6. Service Limitations &amp; Liability
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4">
            We are not responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-base sm:text-lg text-gray-300 leading-relaxed ml-4">
            <li>Temporary downtime or service interruptions</li>
            <li>Third-party provider outages or failures</li>
            <li>Content availability, removal, or changes</li>
            <li>Issues caused by user devices, software, or network connections</li>
          </ul>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed mt-4">
            To the maximum extent permitted by law, we are not liable for any direct, indirect, incidental, or consequential damages arising from the use of the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">
            7. Changes to Terms
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            We reserve the right to update or modify these terms, Pro features, or service offerings at any time without prior notice. Continued use of the service constitutes acceptance of any changes.
          </p>
        </section>
      </div>
    </div>
  );
}
