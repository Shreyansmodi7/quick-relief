const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary-600 mb-4 flex items-center gap-2">
              <span className="bg-primary-600 text-white p-1 rounded-md text-sm">QR</span>
              Quick Relief
            </h3>
            <p className="text-gray-500 text-sm">
              Your trusted partner for fast and reliable online medicine delivery.
              We connect you with the nearest pharmacies for quick relief.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary-600 transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary-600 transition-colors">Order Medicines</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Healthcare Products</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Upload Prescription</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Find a Pharmacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Support: support@quickrelief.com</li>
              <li>Phone: +1 800 123 4567</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Quick Relief. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
