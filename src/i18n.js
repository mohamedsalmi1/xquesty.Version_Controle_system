import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "We don't offer listings—we place you inside. \n Real internships, real companies, real experience. \n You're not browsing. You're building.": "We don't offer listings—we place you inside. \n Real internships, real companies, real experience. \n You're not browsing. You're building."
          // Add additional keys/translations here if needed.
        }
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;