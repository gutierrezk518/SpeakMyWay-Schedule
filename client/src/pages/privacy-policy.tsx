import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";

export default function PrivacyPolicy() {
  const { setCurrentPage } = useAppContext();

  useEffect(() => {
    setCurrentPage("/privacy-policy");
  }, [setCurrentPage]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p>
            This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our SpeakMyWay application. By using our application, you consent to the data practices described in this policy.
          </p>
          <p className="mt-2">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc ml-6 mt-2">
            <li><strong>Personal Information:</strong> Name, email address, and birth date.</li>
            <li><strong>Usage Data:</strong> Information about how you use our application, including activities, preferences, and patterns.</li>
            <li><strong>Technical Information:</strong> Device information, IP address, browser type, operating system, and other technology identifiers.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>To provide, maintain, and improve our services</li>
            <li>To personalize your experience</li>
            <li>To track popular cards and use cases with end users</li>
            <li>To send you promotional emails about our product roadmap and opportunities to purchase future enhancements (if you've consented)</li>
            <li>To respond to your requests or inquiries</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. 
          </p>
          <p className="mt-2">
            Your data will be retained according to the following principles:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>Active users: Data retained for the duration of your use of our application</li>
            <li>Inactive users: Personal data may be retained for up to 3 years after your last interaction with the application</li>
            <li>After 3 years of inactivity: Your data will be anonymized by removing personally identifiable information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Data Sharing and Third Parties</h2>
          <p>
            We do not sell your personal information to third parties. We may share your information with:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>Service providers who help us operate our application</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>Right to access and receive a copy of your personal information</li>
            <li>Right to correct inaccurate information</li>
            <li>Right to deletion of your personal information (subject to certain exceptions)</li>
            <li>Right to restrict or object to processing</li>
            <li>Right to data portability</li>
            <li>Right to withdraw consent at any time</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us using the information in the "Contact Us" section.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Children's Privacy</h2>
          <p>
            Our application is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Changes to This Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Contact Us</h2>
          <p>
            If you have any questions or concerns about this privacy policy or our data practices, please contact us at:
          </p>
          <p className="mt-2 font-medium">
            Email: privacy@speakmyway.app<br/>
            Address: SpeakMyWay Inc., 123 Accessibility Drive, Suite 500, San Francisco, CA 94103
          </p>
        </section>
      </div>
    </div>
  );
}