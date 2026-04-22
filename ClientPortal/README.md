Klientský portál pro správu složek, dokumentů a souborů.

Obsahuje webovou verzi (Next.js) a mobilní aplikaci (Expo React Native), které používají společný backend, jednu databázi a stejné API.

Hlavní funkce:
přihlášení a registrace
role admin / user
správa složek a podsložek
nahrávání souborů
přidávání odkazů
vyhledávání
filtrování a řazení
sdílení složek
notifikace

Testovací přihlášení:
Login: denisa@portal.local
Heslo: DenisaSmidova!@567321!

Instalace backendu:
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev

Spuštění mobilní aplikace:
cd mobile
npm install
npx expo start
