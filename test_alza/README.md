Alza domácí úkol (React) Notebooky

Tady je moje řešení domácího úkolu. Udělal jsem jednoduchou stránku „Notebooky“ podle wireframu a napojil jsem ji na dodaný REST endpoint tak, aby se UI generovalo z JSON dat.

Cíl byl mít výsledek, který:
- jde spustit přes npm i && npm start
- je čitelný a udržitelný (vrstvy, typy, čistá zodpovědnost souborů)
- dá se normálně předvést i v případě, že REST endpoint v prohlížeči blokuje CORS

Co je hotové (dle zadání)
1) UI podle wireframu
- Nadpis „Notebooky“
- Kategorie jako tlačítka/chips (statický blok jako ve wireframu)
- Sekce „Nejprodávanější“ jako carousel
- Tabové řazení: **TOP / Nejprodávanější / Od nejlevnějšího / Od nejdražšího**
- Grid produktových karet (marketplace layout)
2) REST data - UI
- Volám endpoint https://www.alza.cz/Services/RestService.svc/v2/products
- Používám POST a JSON body přesně podle zadání
- Z response beru hlavně data[] (produkty), zbytek ignoruju
- Data mapuju do interního modelu Product, aby UI nebylo přímo závislé na API formátu
(tj. když se změní API, upraví se mapper, ne celé komponenty)
3) Carousel
- šipky vlevo/vpravo
- nekonečná smyčka (cyklení přes produkty)
- responsivní chování (na menších šířkách méně položek)
4) Tlačítko Koupit (dropdown)
- po kliku se otevře menu:
- Koupit zrychleně
- Porovnat
- Hlídat
- Přidat do seznamu
- zavírání klikem mimo / ESC
- menu je renderované přes portal do document.body, takže se nikdy neoreže v kartě (řeší overflow problém)
5)Responsivita
- grid přechází podle šířky: 5 - 4 - 3 - 2 - 1 sloupec
- layout je použitelný i na mobilu

Poznámka k CORS / 403 (reálný stav v browseru)

V prohlížeči může být tento endpoint zablokovaný kvůli CORS (typicky hlášky typu:
No Access-Control-Allow-Origin/Failed to fetch).

Co s tím dělá aplikace:
1) nejdřív vždy zkusí reálné volání REST služby (dle zadání)
2) pokud prohlížeč request zablokuje, tak:
- ukážu banner, že endpoint je blokovaný (CORS/403)
- automaticky přepnu na lokální demo data, aby se dal UI a logika normálně ukázat

Důležité: demo data jsou jen fallback pro prezentaci.  
Pokud bude endpoint dostupný (např. v interním prostředí Alza), aplikace použije reálná data a demo se vůbec nespustí.

Jak je to poskládané (stručně, ale prakticky)
- api/ – jedno místo pro volání REST (POST + payload)
- domain/ – typy + mapper (transformace API -> Product)
- hooks/ – business logika načítání (loading/error/fallback)
- ui/ – čisté komponenty (karty, carousel, dropdown, tabs)
- pages/ – skládání celé stránky + řazení přes useMemo

Tímhle stylem se dá projekt snadno rozšiřovat (filtry, paging, detail produktu, atd.)

Spuštění
bash
npm i
npm start
