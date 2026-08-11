import type { Metadata } from "next";
import { LegalPage, LegalSection } from "../legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use AuraMail.",
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="AuraMail" title="Terms of Service" updated="August 11, 2026">
      <LegalSection title="1. Acceptance">
        <p>
          These Terms of Service govern your use of AuraMail, a placement-email
          organization and analysis service. By connecting a Google account or
          using AuraMail, you agree to these terms. If you do not agree, do not
          use the service.
        </p>
      </LegalSection>

      <LegalSection title="2. The service">
        <p>
          AuraMail connects to services you authorize, identifies relevant
          placement messages, and provides summaries, extracted information,
          links, and optional Calendar actions. AuraMail currently operates as a
          beta service for students and may change, pause, or remove features as
          the product develops.
        </p>
      </LegalSection>

      <LegalSection title="3. Your account and authorization">
        <ul>
          <li>You are responsible for the Google account you connect.</li>
          <li>
            You must provide accurate information and keep your account and
            devices secure.
          </li>
          <li>
            You may revoke Google access at any time through your Google Account
            security settings.
          </li>
          <li>
            You authorize AuraMail to access only the Google services and data
            described in the consent screen and Privacy Policy.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You may not:</p>
        <ul>
          <li>use AuraMail unlawfully or to violate another person&apos;s rights;</li>
          <li>attempt to access another user&apos;s account or data;</li>
          <li>interfere with, probe, or disrupt the service or its providers;</li>
          <li>use automated access that exceeds the intended product features;</li>
          <li>upload or process content you do not have the right to use.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. AI and email accuracy">
        <p>
          AuraMail&apos;s summaries and extracted fields are generated from email
          content and may be incomplete, outdated, or incorrect. They are for
          convenience only and are not a substitute for checking the original
          email, the employer&apos;s instructions, or an official deadline. You are
          responsible for confirming application requirements, eligibility,
          dates, and links before acting on them.
        </p>
      </LegalSection>

      <LegalSection title="6. Third-party services">
        <p>
          AuraMail depends on Google APIs, OpenAI, and hosting and database
          providers. Those services are governed by their own terms and may be
          unavailable or change independently of AuraMail. AuraMail is not
          responsible for third-party outages, policies, content, or links.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          AuraMail and its software, design, branding, and original content are
          owned by AuraMail or its licensors. You retain rights to the email
          content you access through your Google account. You grant AuraMail the
          limited permission needed to process that content to operate the
          service.
        </p>
      </LegalSection>

      <LegalSection title="8. Availability and termination">
        <p>
          AuraMail is provided on an evolving beta basis. We do not promise that
          it will always be available, error-free, or compatible with every
          device or third-party service. We may suspend or terminate access when
          necessary for security, abuse prevention, legal compliance, or service
          changes. You may stop using AuraMail and revoke its Google access at
          any time.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimers and limitation of liability">
        <p>
          To the extent permitted by law, AuraMail is provided without warranties
          of any kind. AuraMail is not responsible for missed deadlines,
          inaccurate summaries, decisions made from extracted information, or
          losses caused by third-party services. Nothing in these terms limits
          rights or remedies that cannot legally be limited.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to these terms">
        <p>
          We may update these terms as AuraMail changes. We will publish the
          revised version at this same URL and update the date above. Continued
          use after an update means you accept the revised terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
