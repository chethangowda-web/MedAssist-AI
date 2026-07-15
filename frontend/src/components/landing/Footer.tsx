import { Activity, Github, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="relative border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white">MedAssist AI</h3>
                <p className="text-xs text-surface-500">AI Healthcare Assistant</p>
              </div>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed">
              Empowering rural healthcare workers with AI-powered tools for better patient care.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Features</Link></li>
              <li><Link to="/agents" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">AI Agents</Link></li>
              <li><Link to="/pricing" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Pricing</Link></li>
              <li><Link to="/docs" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/security" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Security</Link></li>
              <li><Link to="/compliance" className="text-sm text-surface-500 hover:text-primary-500 transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-surface-200 dark:border-surface-800">
          <p className="text-sm text-surface-500">
            &copy; {new Date().getFullYear()} MedAssist AI. Made with ❤️ for rural India.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="mailto:hello@medassist-ai.com" className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
