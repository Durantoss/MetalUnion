import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-metal-gray mt-16 safe-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 safe-left safe-right">
        <div className="mobile-grid md:grid-cols-4 gap-6 md:gap-8">
          <div className="text-center md:text-left">
            <h3 className="mobile-heading md:text-2xl text-metal-red mb-4">METALHUB</h3>
            <p className="mobile-text text-gray-400 mb-6">The ultimate destination for metal and rock music reviews, photos, and tour information.</p>
            <div className="flex space-x-6 justify-center md:justify-start">
              <a href="#" className="text-gray-400 hover:text-metal-red transition-colors touch-target active-scale focus-visible-metal" data-testid="link-facebook" aria-label="Facebook">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-metal-red transition-colors touch-target active-scale focus-visible-metal" data-testid="link-twitter" aria-label="Twitter">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-metal-red transition-colors touch-target active-scale focus-visible-metal" data-testid="link-instagram" aria-label="Instagram">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-metal-red transition-colors touch-target active-scale focus-visible-metal" data-testid="link-youtube" aria-label="YouTube">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h4 className="font-black uppercase tracking-wider mb-6 text-white text-lg">Explore</h4>
            <ul className="space-y-4">
              <li><Link href="/bands"><span className="mobile-text text-gray-400 hover:text-white transition-colors active-scale touch-target-large block focus-visible-metal" data-testid="link-browse-bands">Browse Bands</span></Link></li>
              <li><Link href="/reviews"><span className="mobile-text text-gray-400 hover:text-white transition-colors active-scale touch-target-large block focus-visible-metal" data-testid="link-latest-reviews">Latest Reviews</span></Link></li>
              <li><Link href="/photos"><span className="mobile-text text-gray-400 hover:text-white transition-colors active-scale touch-target-large block focus-visible-metal" data-testid="link-photo-gallery">Photo Gallery</span></Link></li>
              <li><Link href="/tours"><span className="mobile-text text-gray-400 hover:text-white transition-colors active-scale touch-target-large block focus-visible-metal" data-testid="link-tour-dates">Tour Dates</span></Link></li>
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
        <div className="border-t border-metal-gray pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-2 md:space-y-0">
            <p className="mobile-text text-gray-400">&copy; 2024 MetalHub. All rights reserved.</p>
            <p className="mobile-text text-gray-400">Made with 🤘 for metalheads worldwide</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
