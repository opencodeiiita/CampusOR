"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faInstagram,
  faLinkedin,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[var(--color-brand-ink)]">
      <div className="w-full px-4 py-10">
        <div className="mb-8 flex justify-center">
          <div className="brand-wordmark text-white">
            <span className="brand-wordmark-mark">u</span>
            <span className="brand-wordmark-name text-white">uniq</span>
          </div>
        </div>

        <div className="mb-6 flex justify-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white text-[#181717] transition-all duration-300 hover:scale-110 hover:bg-slate-100"
          >
            <FontAwesomeIcon icon={faGithub} className="text-lg" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white text-black transition-all duration-300 hover:scale-110 hover:bg-slate-100"
          >
            <FontAwesomeIcon icon={faXTwitter} className="text-lg" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white text-[#0A66C2] transition-all duration-300 hover:scale-110 hover:bg-slate-100"
          >
            <FontAwesomeIcon icon={faLinkedin} className="text-lg" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white text-[#E1306C] transition-all duration-300 hover:scale-110 hover:bg-slate-100"
          >
            <FontAwesomeIcon icon={faInstagram} className="text-lg" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white text-[#FF0000] transition-all duration-300 hover:scale-110 hover:bg-slate-100"
          >
            <FontAwesomeIcon icon={faYoutube} className="text-lg" />
          </a>
        </div>

        <div className="mx-auto mb-4 max-w-5xl border-t border-white/10" />

        <div className="text-md text-center tracking-wide text-white/60">
          © {new Date().getFullYear()} uniq. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
