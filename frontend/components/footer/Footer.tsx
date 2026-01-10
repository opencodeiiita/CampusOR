"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faXTwitter,
  faLinkedin,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="w-full px-4 py-10">
        {/* Social Icons */}
        <div className="flex justify-center gap-6 mb-6">
          {/* GitHub */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-700 text-[#181717] bg-white hover:bg-slate-100 transition-all duration-300 hover:scale-110"
          >
            <FontAwesomeIcon icon={faGithub} className="text-lg" />
          </a>

          {/* X / Twitter */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-700 text-black bg-white hover:bg-slate-100 transition-all duration-300 hover:scale-110"
          >
            <FontAwesomeIcon icon={faXTwitter} className="text-lg" />
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-700 text-[#0A66C2] bg-white hover:bg-slate-100 transition-all duration-300 hover:scale-110"
          >
            <FontAwesomeIcon icon={faLinkedin} className="text-lg" />
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-700 text-[#E1306C] bg-white hover:bg-slate-100 transition-all duration-300 hover:scale-110"
          >
            <FontAwesomeIcon icon={faInstagram} className="text-lg" />
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-700 text-[#FF0000] bg-white hover:bg-slate-100 transition-all duration-300 hover:scale-110"
          >
            <FontAwesomeIcon icon={faYoutube} className="text-lg" />
          </a>
        </div>

        {/* Divider */}
        <div className="max-w-5xl mx-auto border-t border-slate-800 mb-4" />

        {/* Copyright */}
        <div className="text-center text-md text-slate-500 tracking-wide">
          © {new Date().getFullYear()} CampusOR. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
