import React from 'react';
import { Mail, Github, Linkedin } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';


export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t mt-8 sm:mt-16">     
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          {/* Website description on the left */}
          <div className="space-y-4 w-full sm:w-1/2">
            <div className="flex items-center gap-2">
              <img
                alt="xQuesty Logo"
                className="h-5 w-auto transition-transform group-hover:scale-50"
                src="/src/assets/xQuesty_logo.png"
                style={{ minWidth: 32 }}
              />
            </div>
            <p className="text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{t("footer.slogan", { defaultValue: "We don't offer listings—we place you inside. \n Real internships, real companies, real experience. \n You're not browsing. You're building." })}</p>
          </div>

          {/* Links, Contact, Follow Us on the right */}
          <div className="w-full sm:w-1/2 flex flex-col sm:flex-row gap-8 justify-end">
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4">{t('Quick Links')}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#services" className="text-muted-foreground hover:text-foreground">
                    {t('header.services')}
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-muted-foreground hover:text-foreground">
                    {t('about.title')}
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-muted-foreground hover:text-foreground">
                    {t('faq.title')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 sm:mb-4">{t('Contact')}</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="0668025533" className="text-muted-foreground hover:text-foreground">
                    0668025533
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 sm:mb-4">{t('Follow Us')}</h3>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Language Selector */}
        <LanguageSelector />

        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground italic text-center w-full sm:w-auto" 
             style={{ 
               fontFamily: "'Times New Roman', serif", 
               fontSize: "clamp(1.25rem, 4vw, 1.875rem)", 
               fontStyle: "italic", 
               opacity: 0.6 
             }}>
            {t("footer.slogan_short", { defaultValue: "You're not browsing. You're building." })}
          </p>
        </div>
      </div>
    </footer>
  );
}