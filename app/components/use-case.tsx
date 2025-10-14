
import { Users, Eye, Car, Camera } from "lucide-react"

const UseCase = ({ pageType = 'pricing' }) => {

   



    return     <div className="max-w-6xl mx-auto my-16 px-4">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold mb-4">Perfect for Privacy-Conscious Professionals</h2>
      <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
      Whether you're a real estate agent, automotive dealer, delivery service, or just want to protect privacy in your photos.
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="text-center p-6 rounded-2xl bg-background shadow-lg border border-muted hover:shadow-xl transition-shadow">
        <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Automotive Dealers</h3>
        <p className="text-muted-foreground text-sm">
        Protect customer privacy in vehicle photos and marketing materials.
        </p>
      </div>
      
      <div className="text-center p-6 rounded-2xl bg-background shadow-lg border border-muted hover:shadow-xl transition-shadow">
        <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Car Exporters</h3>
        <p className="text-muted-foreground text-sm">
           Prepare compliant, branded vehicle photos for overseas shipping catalogs and cross-border sales.
        </p>
      </div>
      
      <div className="text-center p-6 rounded-2xl bg-background shadow-lg border border-muted hover:shadow-xl transition-shadow">
        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Online Car Marketplaces</h3>
        <p className="text-muted-foreground text-sm">
          Automate moderation and privacy masking across user-uploaded images — plates, faces, and more.
        </p>
      </div>
      
      <div className="text-center p-6 rounded-2xl bg-background shadow-lg border border-muted hover:shadow-xl transition-shadow">
        <div className="w-16 h-16 bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Delivery / Rentals</h3>
        <p className="text-muted-foreground text-sm">
        Protect both driver and customer privacy by auto-blurring faces and plates in fleet or drop-off photos
        </p>
      </div>
    </div>
  </div>;

}

export default UseCase;