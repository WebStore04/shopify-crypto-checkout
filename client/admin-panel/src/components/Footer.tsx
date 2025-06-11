export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center py-4 mt-8">
      <p>&copy; 2025 Admin Dashboard. All rights reserved.</p>
      <div className="text-sm">
        <a href="/terms" className="text-gray-400 hover:text-white mx-2">
          Terms & Conditions
        </a>
        <a href="/privacy" className="text-gray-400 hover:text-white mx-2">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};
