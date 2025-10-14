

const FAQSection = () => {

    return (
        <div className="max-w-4xl mx-auto mb-20 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about our AI-powered image processing services
          </p>
        </div>
        
        <div className="space-y-6">
          {/* 💡 About MaskingTech */}
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">What is MaskingTech?</h3>
            <p className="text-muted-foreground">
              MaskingTech is an AI-powered platform that automatically masks number plates, blurs faces, removes and replaces backgrounds, and enhances car images in seconds, all through a simple, credit-based system.
            </p>
          </div>
          
          {/* ⚙️ How It Works */}
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">How does it work?</h3>
            <p className="text-muted-foreground">
              Just upload your car image, our AI detects the vehicle, masks sensitive details, and replaces the background with a clean studio or branded scene, all automatically.
            </p>
          </div>
          
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">Do I need design or editing skills?</h3>
            <p className="text-muted-foreground">
              Not at all. MaskingTech handles everything for you — from detection to output — with zero manual editing.
            </p>
          </div>
          
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">Can I customize the background or branding?</h3>
            <p className="text-muted-foreground">
              Yes. You can upload your own branded backdrop, select from preset templates, or request a custom design that matches your dealership's style.
            </p>
          </div>
          
          {/* 🧠 Technology & Quality */}
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">What makes MaskingTech different from other photo editors?</h3>
            <p className="text-muted-foreground">
              Unlike generic tools, MaskingTech is trained exclusively on automotive imagery, ensuring accurate masking, realistic lighting, and precise reflections tailored for cars.
            </p>
          </div>
          
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">Does it support batch processing?</h3>
            <p className="text-muted-foreground">
              Absolutely. You can process hundreds of images at once, ideal for car dealers, marketplaces, or photo studios.
            </p>
          </div>
          
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">Will it affect the original image quality?</h3>
            <p className="text-muted-foreground">
              No. All images are processed in high resolution with realistic shadows and preserved detail.
            </p>
          </div>
          
          {/* 💼 Use Cases */}
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">Who can use MaskingTech?</h3>
            <p className="text-muted-foreground">
              Car dealerships, photographers, marketplaces, and individuals selling vehicles, basically anyone who wants professional-looking car images without manual effort.
            </p>
          </div>
          
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">Can I use MaskingTech for my online car listings?</h3>
            <p className="text-muted-foreground">
              Yes! Our images are optimized for all major marketplaces and dealer portals.
            </p>
          </div>
          
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">Does it help with compliance or privacy?</h3>
            <p className="text-muted-foreground">
              Yes, faces and plate numbers are automatically blurred or replaced, ensuring full privacy and regulatory compliance.
            </p>
          </div>
          
          {/* 💳 Pricing & Access */}
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">Do credits expire?</h3>
            <p className="text-muted-foreground">
              Yes, your credits will expire after one month from billing.
            </p>
          </div>
          
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">Can I try it for free?</h3>
            <p className="text-muted-foreground">
              Yes, new users get free credits to test all core features before subscribing.
            </p>
          </div>
          
          <div className="bg-background rounded-2xl p-6 shadow-lg border border-muted">
            <h3 className="text-lg font-semibold mb-3">Is there a free trial available?</h3>
            <p className="text-muted-foreground">
              Absolutely! All new users receive 20 free credits to try our services risk-free. No credit card required, no commitment. Experience the power of AI-powered license plate masking and privacy protection today.
            </p>
          </div>
        </div>
      </div>
    )
}

export default FAQSection
