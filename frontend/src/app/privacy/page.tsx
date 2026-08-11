import type { Metadata } from "next";
import { LegalPage, LegalSection } from "../legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AuraMail handles Google account, Gmail, and Calendar data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="AuraMail"
      title="Privacy Policy"
      updated="August 11, 2026"
    >
      <LegalSection title="1. Overview">
        <p>
          AuraMail is a placement-email assistant for students. It connects to
          Google only after you authorize it, finds relevant placement messages,
          extracts useful details such as roles and deadlines, and lets you
          organize those opportunities.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we access">
        <p>Depending on the features you use, AuraMail accesses:</p>
        <ul>
          <li>
            <strong>Google account information:</strong> your name, email
            address, and Google account identifier for authentication.
          </li>
          <li>
            <strong>Gmail data:</strong> message sender, subject, date, labels,
            snippets, body content, and relevant attachment metadata for
            placement-related messages. AuraMail requests read-only Gmail
            access and does not send, edit, or delete your Gmail messages.
          </li>
          <li>
            <strong>Google Calendar data:</strong> calendar information needed
            to display and create, update, or remove events when you use the
            calendar feature.
          </li>
          <li>
            <strong>Session information:</strong> application session tokens
            and the Google authorization token needed to keep your connection
            active and perform the requested Gmail and Calendar operations.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use Google user data">
        <p>We use this data only to:</p>
        <ul>
          <li>sign you in and maintain your AuraMail session;</li>
          <li>find and display placement-related email;</li>
          <li>
            create structured summaries and extract roles, eligibility,
            locations, compensation, deadlines, links, and other details from
            the email body;
          </li>
          <li>show your saved opportunities and email details in AuraMail;</li>
          <li>create or manage Calendar events when you request that action;</li>
          <li>secure, maintain, debug, and improve the service.</li>
        </ul>
        <p>
          AuraMail does not use Google user data for advertising, sell it, or
          use it to build a separate profile about you.
        </p>
      </LegalSection>

      <LegalSection title="4. AI processing and sharing">
        <p>
          To provide email analysis, relevant email content is sent to the
          OpenAI API as a service provider. OpenAI processes that content to
          return the structured analysis requested by AuraMail. The returned
          summary and extracted fields are stored with your AuraMail account.
        </p>
        <p>
          We do not disclose Google user data to third parties for independent
          advertising or sale. We share the minimum data needed with service
          providers that operate AuraMail, including Google APIs, OpenAI,
          Vercel, Render, and Neon. Those providers process data to deliver,
          host, secure, or support the service and not for AuraMail advertising.
        </p>
        <p>
          Our use of Google user data is intended to comply with the Google API
          Services User Data Policy and its Limited Use requirements.
        </p>
      </LegalSection>

      <LegalSection title="5. Storage and security">
        <p>
          AuraMail stores account identifiers, session and authorization
          tokens, email summaries, extracted fields, and the relevant email
          description needed to show the service you requested. Production
          traffic uses HTTPS. We use access controls and server-side storage
          for credentials and apply reasonable technical and organizational
          safeguards to protect the information we process.
        </p>
        <p>
          No internet service can guarantee absolute security. You should
          protect your Google account and sign out of shared devices.
        </p>
      </LegalSection>

      <LegalSection title="6. Retention and deletion">
        <p>
          We retain account and summarized email data while your AuraMail
          account is active or as needed to provide the service. You can revoke
          AuraMail&apos;s Google access at any time from your Google Account
          security settings. To request deletion of your AuraMail account,
          tokens, summaries, and associated data, contact us through the public
          support channel linked below. We may retain limited information where
          required for security, fraud prevention, legal compliance, or backup
          recovery.
        </p>
      </LegalSection>

      <LegalSection title="7. Third-party services and links">
        <p>
          AuraMail relies on Google APIs, OpenAI, and hosting and database
          providers. Their own privacy policies govern their processing of
          information under their services. AuraMail may display links from
          email messages; those external sites have their own terms and privacy
          practices.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>
          We may update this policy when AuraMail&apos;s data practices change or
          when required by law. We will update the date above and publish the
          revised policy at this same URL. If a change materially affects how we
          use Google user data, we will provide an appropriate notice.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
