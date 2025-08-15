import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-metal-gray mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-black text-metal-red mb-4">METALHUB</h3>
            <p className="text-gray-400 mb-4">The ultimate destination for metal and rock music reviews, photos, and tour information.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-metal-red transition-colors" data-testid="link-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-metal-red transition-colors" data-testid="link-twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-metal-red transition-colors" data-testid="link-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-metal-red transition-colors" data-testid="link-youtube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="/bands"><span className="text-gray-400 hover:text-white transition-colors" data-testid="link-browse-bands">Browse Bands</span></Link></li>
              <li><Link href="/reviews"><span className="text-gray-400 hover:text-white transition-colors" data-testid="link-latest-reviews">Latest Reviews</span></Link></li>
              <li><Link href="/photos"><span className="text-gray-400 hover:text-white transition-colors" data-testid="link-photo-gallery">Photo Gallery</span></Link></li>
              <li><Link href="/tours"><span className="text-gray-400 hover:text-white transition-colors" data-testid="link-tour-dates">Tour Dates</span></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-wider mb-4">Community</h4>
            <ul className="space-y-2">
              <li><Link href="/reviews"><span className="text-gray-400 hover:text-white transition-colors" data-testid="link-write-reviews">Write Reviews</span></Link></li>
              <li><Link href="/photos"><span className="text-gray-400 hover:text-white transition-colors" data-testid="link-upload-photos">Upload Photos</span></Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-submit-band">Submit Band Info</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-discussion">Join Discussion</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-help">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-contact">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-privacy">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-metal-gray pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; 2024 MetalHub. All rights reserved.</p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">Made with 🤘 for metalheads worldwide</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
