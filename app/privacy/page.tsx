import { Shield, Lock, Eye, Database, FileText, Bell, Settings } from "lucide-react"
import LegalContent, { LegalSection } from "@/components/legal-content"

export default function PrivacyPage() {
  return (
    <LegalContent title="Privacy Policy">
      <div className="space-y-8">
        <p>
          At MaskingTech, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
          disclose, and safeguard your information when you use our services. Please read this policy carefully. 
          If you do not agree with the terms, please do not access or use our services.
        </p>

        <LegalSection title="1. Information We Collect" icon={<Database className="h-5 w-5" />}>
          <p>
            We collect the following types of information:
          </p>
          <ul className="space-y-2">
            <li>Account information (email, name, username)</li>
            <li>Usage data (login times, feature usage, processing history)</li>
            <li>Payment information for subscription services</li>
            <li>Images uploaded for processing</li>
            <li>Technical data (IP address, browser type, device information)</li>
          </ul>
        </LegalSection>

        <LegalSection title="2. How We Use Your Information" icon={<Eye className="h-5 w-5" />}>
          <p>
            We use your information to:
          </p>
          <ul className="space-y-2">
            <li>Provide and maintain our services</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send service notifications and updates</li>
            <li>Improve our AI algorithms and service quality</li>
            <li>Respond to support requests</li>
            <li>Prevent fraud and abuse</li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Data Security" icon={<Lock className="h-5 w-5" />}>
          <p>
            We implement industry-standard security measures to protect your data, including:
          </p>
          <ul className="space-y-2">
            <li>Encryption for data transmission and storage</li>
            <li>Secure, isolated processing environments</li>
            <li>Regular security audits and testing</li>
            <li>Access controls and authentication</li>
            <li>Automated threat detection systems</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Data Retention" icon={<FileText className="h-5 w-5" />}>
          <p>
            We retain your data according to these principles:
          </p>
          <ul className="space-y-2">
            <li>Account information: Retained while account is active</li>
            <li>Original images: Deleted immediately after processing</li>
            <li>Processed images: Stored for 30 days unless saved to your account</li>
            <li>Payment records: Retained as required by applicable laws</li>
            <li>Usage logs: 90 days for security and performance monitoring</li>
          </ul>
        </LegalSection>

        <LegalSection title="5. Your Privacy Rights" icon={<Settings className="h-5 w-5" />}>
          <p>
            You have the right to:
          </p>
          <ul className="space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your personal data</li>
            <li>Object to or restrict processing</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Updates to This Policy" icon={<Bell className="h-5 w-5" />}>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes through email 
            or notices on our website. Your continued use of the service after such modifications constitutes 
            acceptance of the updated Policy.
          </p>
        </LegalSection>

        <LegalSection title="7. Contact Information" icon={<Shield className="h-5 w-5" />}>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="space-y-2">
            <li>Email: privacy@maskingtech.com</li>
            <li>Support: support@maskingtech.com</li>
          </ul>
        </LegalSection>
      </div>
    </LegalContent>
  )
} 