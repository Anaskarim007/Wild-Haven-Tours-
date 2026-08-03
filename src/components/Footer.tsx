import { Tent, Instagram, Facebook, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-20 lg:py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col gap-10 lg:gap-12">

          {/* Brand Row */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Tent className="h-4 w-4" />
              <span className="text-sm font-normal tracking-wide">
                Wild Haven
              </span>
            </div>

            <p className="text-background/70 text-xs font-light leading-relaxed max-w-xs">
              Creating meaningful connections with nature through sustainable
              off-grid experiences.
            </p>
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-sm font-medium mb-4">Pages</h4>

            <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
              <li>
                <Link
                  to="/"
                  className="text-background/70 hover:text-background smooth-hover text-xs font-light"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/locations"
                  className="text-background/70 hover:text-background smooth-hover text-xs font-light"
                >
                  Locations
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="text-background/70 hover:text-background smooth-hover text-xs font-light"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-background/70 hover:text-background smooth-hover text-xs font-light"
                >
                  Contact
                </Link>
              </li>

              <li>
                <a
                  href="/#booking"
                  className="text-background/70 hover:text-background smooth-hover text-xs font-light"
                >
                  Book Now
                </a>
              </li>

              <li>
                <Link
                  to="/admin"
                  className="text-background/70 hover:text-background smooth-hover text-xs font-light"
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium mb-4">Contact Us</h4>

            <div className="flex flex-col gap-2 mb-8">
              <a
                href="mailto:wildhaven02@gmail.com"
                className="text-background/70 hover:text-background smooth-hover text-xs font-light flex items-center gap-2"
              >
                <Mail className="h-3 w-3" />
                wildhaven02@gmail.com
              </a>

              <p className="text-background/70 text-xs font-light">
                Mon - Sun: 6:00 AM - 11:00 PM
              </p>
            </div>

            <h4 className="text-sm font-medium mb-4">Follow Us</h4>

            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/wildhaven02?igsh=OXgxenU3ZHRzOGU3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/70 hover:text-background smooth-hover"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61592490974624"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/70 hover:text-background smooth-hover"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-background/20 pt-8 mt-12 text-center text-background/50 text-xs font-light">
            <p>&copy; 2026 Wild Haven. All rights reserved.</p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;