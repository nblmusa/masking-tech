import { Shield, Lock, Eye, Database, FileText, Bell, Settings } from "lucide-react"
import LegalContent, { LegalSection } from "@/components/legal-content"

export default function PrivacyPage() {
  return (
    <LegalContent title="Privacy Policy">
      <div className="space-y-8">
        <p>
        MaskingTech respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
        </p>

        <LegalSection title="1. Information We Collect" icon={<Database className="h-5 w-5" />}>
          <p>
            We may collect personal information such as your name, email, contact details, and payment information. We may also collect image data uploaded to our platform for processing purposes.
          </p>
        </LegalSection>

        <LegalSection title="2. How We Use Your Information" icon={<Eye className="h-5 w-5" />}>
          <p>
          We use collected information to provide and improve our services, process transactions, and ensure compliance with applicable regulations. Processed images are used only for the purposes intended by the user.
          </p>
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
          Uploaded images are automatically deleted from our servers after processing unless the user explicitly chooses to store them. Account information is retained as required by law or for service continuity.
          </p>
        </LegalSection>

        <LegalSection title="5. Data Security" icon={<Settings className="h-5 w-5" />}>
          <p>
          We implement technical and organizational measures to protect data from unauthorized access, alteration, or disclosure. However, no online platform is completely secure, and users share data at their own risk.
          </p>
        </LegalSection>

        <LegalSection title="6. Third-Party Services" icon={<Bell className="h-5 w-5" />}>
          <p>
          Our platform may use third-party APIs or analytics tools to improve functionality and user experience. These third parties are bound by confidentiality and data protection obligations.
          </p>
        </LegalSection>

          <LegalSection title="7. Cookies & Analytics" icon={<Shield className="h-5 w-5" />}>
            <p>
            We may use cookies and tracking tools to enhance user experience, analyze usage, and improve services. Users may disable cookies through their browser settings.
            </p>
          </LegalSection>

          <LegalSection title="8. Your Rights" icon={<Shield className="h-5 w-5" />}>
            <p>
            Users have the right to access, correct, or delete their personal information. To exercise these rights, contact us at info@maskingtech.com.
            </p>
          </LegalSection>

          <LegalSection title="9. Policy Updates" icon={<Shield className="h-5 w-5" />}>
            <p>
            We may update this Privacy Policy periodically. Continued use of our services after any updates constitutes acceptance of the revised policy.
            </p>
          </LegalSection>
      </div>
    </LegalContent>
  )
} 