# 🌍 Travel Section

Photo gallery grouped by year. Route: `#/travel`. Navigation item between Movies and Other.

## Data file

Create `data/travel.json`. Structure:

```json
[
  {
    "year": 2019,
    "photos": [
      { "src": "assets/images/travel/2019/lisbon-01.jpg", "alt": "Lisbon 2019" },
      { "src": "assets/images/travel/2019/lisbon-02.jpg", "alt": "Lisbon 2019" }
    ]
  },
  {
    "year": 2018,
    "photos": [
      { "src": "assets/images/travel/2018/norway-01.jpg", "alt": "Norway 2018" }
    ]
  }
]
```

Images go in `assets/images/travel/<year>/`. Any resolution — they display via `object-fit: cover` in a square grid.

## App changes (`assets/js/app.js`)

1. **Data loading** — add `travelData` variable and fetch `data/travel.json` in `loadData()`:
   ```js
   let travelData = null;

   // In loadData():
   const [site, movies, flights, travel] = await Promise.all([
     fetch('./data/site.json').then(r => r.json()),
     fetch('./data/movies.json').then(r => r.json()),
     fetch('./data/flights.json').then(r => r.json()),
     fetch('./data/travel.json').then(r => r.json())
   ]);
   travelData = travel;
   ```

2. **Navigation** — add a "Travel" link in `renderNav()`, between the Movies block and the "Other" link:
   ```js
   const travelLi = document.createElement('li');
   const isTravelActive = activeRoute === '/travel';
   travelLi.innerHTML = `<a href="#/travel" class="${isTravelActive ? 'on' : ''}">Travel</a>`;
   ul.appendChild(travelLi);
   ```

3. **Route** — register in `init()`:
   ```js
   Router.add('/travel', () => renderTravel());
   ```

4. **View** — `renderTravel()` renders years sorted descending, each with a 3-column photo grid:
   ```js
   function renderTravel() {
     renderNav('/travel');
     const years = [...travelData].sort((a, b) => b.year - a.year);

     const sections = years.map(yearGroup => {
       const photos = yearGroup.photos.map(p => `
         <div class="travel-grid-item">
           <img src="./${p.src}" alt="${p.alt}" loading="lazy">
         </div>`).join('');
       return `
         <div class="travel-year-section">
           <h2 class="travel-year-title">${yearGroup.year}</h2>
           <div class="travel-grid">${photos}</div>
         </div>`;
     }).join('');

     $main().innerHTML = `
       <div id="contact" class="section">
         <h1 class="page-title">Travel</h1>
         ${sections}
       </div>`;
     document.title = `Travel | ${siteData.title}`;
     initTravelFullscreen();
   }
   ```

5. **Fullscreen viewer** — `initTravelFullscreen()` reuses the existing `#full-frame-wrapper` overlay but with a dark semi-transparent background (blur on the page behind) instead of the white background used for movie posters:
   ```js
   function initTravelFullscreen() {
     const wrapper = document.getElementById('full-frame-wrapper');
     const frameImg = document.getElementById('full-frame').querySelector('img');

     document.querySelectorAll('.travel-grid-item img').forEach(img => {
       img.style.cursor = 'pointer';
       img.addEventListener('click', (e) => {
         e.preventDefault();
         e.stopPropagation();
         frameImg.src = img.src;
         wrapper.classList.add('travel-overlay');
         wrapper.style.display = 'block';
         document.body.classList.add('full-frame', 'full-frame-blur');
       });
     });

     function close() {
       wrapper.style.display = 'none';
       wrapper.classList.remove('travel-overlay');
       document.body.classList.remove('full-frame', 'full-frame-blur');
     }

     wrapper.addEventListener('click', close);
     document.addEventListener('keydown', (e) => {
       if (e.key === 'Escape') close();
     });
   }
   ```

## CSS (`assets/css/main.css`)

1. **Fullscreen overlay variant** — dark background with blur on the page content behind:
   ```css
   body.full-frame-blur #container {
     filter: blur(8px);
     transition: filter 0.3s ease;
   }
   #full-frame-wrapper.travel-overlay {
     background: rgba(0, 0, 0, 0.4);
   }
   ```
   Add `body.full-frame-blur` rule right after `body.full-frame { overflow: hidden; }`. Add `.travel-overlay` rule right after the `#full-frame-wrapper` block.

2. **Travel grid and layout**:
   ```css
   /* === Travel Section === */
   .travel-year-section {
     margin-bottom: 40px;
   }
   .travel-year-title {
     font-family: Montserrat, sans-serif;
     font-size: 18px;
     font-weight: 800;
     text-transform: uppercase;
     letter-spacing: 1px;
     color: #333;
     margin-bottom: 16px;
     padding-bottom: 8px;
     border-bottom: 2px solid #333;
   }
   .travel-grid {
     display: grid;
     grid-template-columns: repeat(3, 1fr);
     gap: 4px;
   }
   .travel-grid-item {
     aspect-ratio: 1;
     overflow: hidden;
     background: #e0e0e0;
     border-radius: 2px;
   }
   .travel-grid-item img {
     width: 100%;
     height: 100%;
     object-fit: cover;
     transition: transform 0.3s ease;
   }
   .travel-grid-item:hover img {
     transform: scale(1.05);
   }

   @media (max-width: 600px) {
     .travel-grid {
       grid-template-columns: repeat(3, 1fr);
       gap: 3px;
     }
   }
   @media (max-width: 480px) {
     .travel-year-title { font-size: 14px; }
   }
   ```

## Router comment

Update the comment in `assets/js/router.js` line 3 to include `#/travel`.

## Architecture tree and routes table

Update README: add `travel.json` to the `data/` tree, add `#/travel` to the routes table, and add `assets/images/travel/` to the images tree.
