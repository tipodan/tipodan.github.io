/**
 * Main application: data loading, navigation rendering, and view orchestration.
 */
const App = (() => {
  let siteData = null;
  let moviesData = null;
  let flightsData = null;

  const $main = () => document.getElementById('main');
  const $nav = () => document.getElementById('nav');

  // --- Data loading ---
  async function loadData() {
    const [site, movies, flights] = await Promise.all([
      fetch('./data/site.json').then(r => r.json()),
      fetch('./data/movies.json').then(r => r.json()),
      fetch('./data/flights.json').then(r => r.json())
    ]);
    siteData = site;
    moviesData = movies;
    flightsData = flights;
  }

  function getYears() {
    const years = [...new Set(moviesData.map(m => m.year))];
    return years.sort((a, b) => a - b);
  }

  function getMoviesByYear(year) {
    return moviesData.filter(m => m.year === year);
  }

  // --- Navigation ---
  function renderNav(activeRoute) {
    const years = getYears();
    const ul = document.createElement('ul');

    // BTC
    const btcLi = document.createElement('li');
    const isBtcActive = activeRoute === '/btc';
    btcLi.innerHTML = `<a href="#/btc" class="${isBtcActive ? 'on' : ''}">BTC</a>`;
    ul.appendChild(btcLi);

    // Flights
    const flightsLi = document.createElement('li');
    const isFlightsSection = activeRoute.startsWith('/flights');
    flightsLi.innerHTML = `<a href="#" class="nav-toggle ${isFlightsSection ? 'open' : ''}">Flights</a>`;
    const flightsSub = document.createElement('ul');
    flightsSub.classList.add('nav-submenu');
    if (isFlightsSection) flightsSub.classList.add('nav-submenu--open');
    const flightRoutes = [
      { label: 'All flights', route: '#/flights' },
      { label: 'By year', route: '#/flights/by-year' },
      { label: 'Airlines', route: '#/flights/airlines' }
    ];
    for (const fr of flightRoutes) {
      const li = document.createElement('li');
      const isActive = `#${activeRoute}` === fr.route;
      li.innerHTML = `<a href="${fr.route}" class="${isActive ? 'on' : ''}">&emsp;${fr.label}</a>`;
      flightsSub.appendChild(li);
    }
    flightsLi.appendChild(flightsSub);
    flightsLi.querySelector('.nav-toggle').addEventListener('click', (e) => {
      e.preventDefault();
      flightsSub.classList.toggle('nav-submenu--open');
      e.target.classList.toggle('open');
    });
    ul.appendChild(flightsLi);

    // Movies
    const moviesLi = document.createElement('li');
    const isMoviesSection = activeRoute.startsWith('/movies');
    moviesLi.innerHTML = `<a href="#" class="nav-toggle ${isMoviesSection ? 'open' : ''}">Movies</a>`;
    const moviesSub = document.createElement('ul');
    moviesSub.classList.add('nav-submenu');
    if (isMoviesSection) moviesSub.classList.add('nav-submenu--open');

    // "All" link
    const allLi = document.createElement('li');
    const isAllActive = activeRoute === '/movies';
    allLi.innerHTML = `<a href="#/movies" class="${isAllActive ? 'on' : ''}">&emsp;All</a>`;
    moviesSub.appendChild(allLi);

    for (const y of years) {
      const li = document.createElement('li');
      const route = `#/movies/${y}`;
      const isActive = activeRoute === `/movies/${y}` || activeRoute.startsWith(`/movies/${y}/`);
      li.innerHTML = `<a href="${route}" class="${isActive ? 'on' : ''}">&emsp;${y}</a>`;
      moviesSub.appendChild(li);
    }
    moviesLi.appendChild(moviesSub);
    moviesLi.querySelector('.nav-toggle').addEventListener('click', (e) => {
      e.preventDefault();
      moviesSub.classList.toggle('nav-submenu--open');
      e.target.classList.toggle('open');
    });
    ul.appendChild(moviesLi);

    // Other (always last)
    const otherLi = document.createElement('li');
    const isOtherActive = activeRoute === '/other';
    otherLi.innerHTML = `<a href="#/other" class="${isOtherActive ? 'on' : ''}">Other</a>`;
    ul.appendChild(otherLi);

    const nav = $nav();
    nav.innerHTML = '';
    nav.appendChild(ul);
  }

  // --- Views ---
  function renderHome() {
    renderNav('/');
    $main().innerHTML = '';
    document.title = siteData.title;
  }

  function renderMoviesAll() {
    renderNav('/movies');
    const movies = [...moviesData].reverse();
    const posters = movies.map(m => `
      <a href="#/movies/${m.year}/${m.slug}" class="poster-thumb" title="${m.name} (${m.year})">
        <img data-src="./assets/images/movies/${m.year}/thumbs/${m.slug}.jpg"
             alt="${m.name}"
             class="poster-lazy">
      </a>`).join('');

    $main().innerHTML = `
      <div id="film" class="section">
        <div class="poster-grid">${posters}</div>
      </div>`;
    document.title = `All Movies | ${siteData.title}`;

    // Lazy load with Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      }
    }, { rootMargin: '200px' });

    document.querySelectorAll('.poster-lazy').forEach(img => observer.observe(img));
  }

  function renderMovieList(year) {
    renderNav(`/movies/${year}`);
    const movies = getMoviesByYear(parseInt(year));
    if (!movies.length) {
      $main().innerHTML = '<p>No movies found for this year.</p>';
      return;
    }

    // Movie of the Year header
    let motyHtml = '';
    let motySlug = null;
    const motySlugConfig = siteData.movieOfTheYear && siteData.movieOfTheYear[year];
    if (motySlugConfig) {
      motySlug = motySlugConfig;
      const motyMovie = movies.find(m => m.slug === motySlug);
      if (motyMovie) {
        motyHtml = `
          <div class="moty-header">
            <h2 class="moty-title"><a href="#/movies/${year}/${motySlug}" class="moty-title-link">🏆 Movie of the Year</a></h2>
            <article class="clear no-feature">
              <div class="flexslider">
                <ul class="slides">
                  <li style="display:list-item;">
                    <img src="./assets/images/movies/${year}/${motySlug}.jpg"
                         data-full-src="./assets/images/movies/${year}/${motySlug}.jpg"
                         alt="${motyMovie.name}">
                  </li>
                </ul>
              </div>
            </article>
          </div>`;
      }
    }

    const bullets = movies.map(m => {
      const isActive = m.slug === motySlug;
      return `<li${isActive ? ' class="on"' : ''}><a href="#/movies/${year}/${m.slug}" title="${m.name}"><h1>${m.name}</h1></a></li>`;
    }).join('\n');

    $main().innerHTML = `
      <div id="film" class="section">
        ${motyHtml}
        <nav class="nav-projects"><ul>${bullets}</ul></nav>
      </div>`;
    document.title = `${year} | ${siteData.title}`;
    if (motyHtml) initFullscreen();
  }

  function renderMovieDetail(year, slug) {
    renderNav(`/movies/${year}`);
    const movies = getMoviesByYear(parseInt(year));
    const movie = movies.find(m => m.slug === slug);
    if (!movie) {
      $main().innerHTML = '<p>Movie not found.</p>';
      return;
    }

    const bullets = movies.map(m => {
      const isActive = m.slug === slug;
      return `<li${isActive ? ' class="on"' : ''}><a href="#/movies/${year}/${m.slug}" title="${m.name}"><h1>${m.name}</h1></a></li>`;
    }).join('\n');

    $main().innerHTML = `
      <div id="film" class="section">
        <article class="clear no-feature">
          <div class="flexslider">
            <ul class="slides">
              <li style="display:list-item;">
                <img src="./assets/images/movies/${year}/${slug}.jpg"
                     data-full-src="./assets/images/movies/${year}/${slug}.jpg"
                     alt="${movie.name}">
              </li>
            </ul>
          </div>
        </article>
        <nav class="nav-projects"><ul>${bullets}</ul></nav>
      </div>`;
    document.title = `${movie.name} | ${siteData.title}`;
    initFullscreen();
  }

  function renderOther() {
    renderNav('/other');
    $main().innerHTML = `
      <div id="contact" class="section">
        <h2>This is</h2>
        <p>A postcard from the paradise</p>
        <article class="clear no-feature">
          <div class="flexslider">
            <ul class="slides">
              <li style="display:list-item;">
                <img src="./assets/images/traviata.jpg"
                     data-full-src="./assets/images/traviata.jpg"
                     alt="">
              </li>
            </ul>
          </div>
        </article>
      </div>`;
    document.title = `Other | ${siteData.title}`;
    initFullscreen();
  }

  // --- Flights views ---
  function renderFlightsAll() {
    renderNav('/flights');
    const flights = flightsData;
    const total = flights.length;
    const cities = new Set();
    const airlines = new Set();
    flights.forEach(f => { cities.add(f.from); cities.add(f.to); airlines.add(f.airline); });

    $main().innerHTML = `
      <div id="contact" class="section">
        <h1 class="page-title">All Data</h1>
        <p class="stats-summary">
          <strong>${total}</strong> flights taken since 1994 ·
          <strong>${cities.size}</strong> cities ·
          <strong>${airlines.size}</strong> airlines
        </p>
        <div class="filter-bar" id="filterBar">
          <span class="filter-text" id="filterText"></span>
          <span class="clear-filter" id="clearFilter">✕ Clear filter</span>
        </div>
        <table class="flights-table" id="flightsTable">
          <thead><tr>
            <th data-col="route" class="col-route">Route <span class="sort-arrow"></span></th>
            <th data-col="from">From <span class="sort-arrow"></span></th>
            <th data-col="to">To <span class="sort-arrow"></span></th>
            <th data-col="date">Date <span class="sort-arrow"></span></th>
            <th data-col="airline">Airline <span class="sort-arrow"></span></th>
          </tr></thead>
          <tbody></tbody>
        </table>
      </div>`;
    document.title = `All Flights | ${siteData.title}`;
    Flights.initAllTable(flights, siteData);
  }

  function renderFlightsByYear() {
    renderNav('/flights/by-year');
    $main().innerHTML = `
      <div id="contact" class="section">
        <h1 class="page-title">Data by Year</h1>
        <table class="year-table" id="yearTable">
          <thead><tr>
            <th data-col="year">Year <span class="sort-arrow"></span></th>
            <th data-col="flights">Flights <span class="sort-arrow"></span></th>
            <th data-col="pct">% <span class="sort-arrow"></span></th>
          </tr></thead>
          <tbody></tbody>
        </table>
      </div>`;
    document.title = `Flights by Year | ${siteData.title}`;
    Flights.initByYearTable(flightsData, siteData);
  }

  function renderFlightsAirlines() {
    renderNav('/flights/airlines');
    $main().innerHTML = `
      <div id="contact" class="section">
        <h1 class="page-title">Airlines</h1>
        <h2>Top 3</h2>
        <div class="top3" id="top3"></div>
        <h2>Distribution</h2>
        <div class="bar-chart" id="barChart"></div>
        <div class="waffle-chart" id="waffleChart"></div>
      </div>`;
    document.title = `Airlines | ${siteData.title}`;
    Flights.initAirlinesChart(flightsData, siteData);
  }

  // --- BTC view ---
  function renderBtc() {
    renderNav('/btc');
    $main().innerHTML = `
      <div id="contact" class="section">
        <h1 class="page-title">BTC</h1>
        <div class="btc-currency-toggle">
          <button class="btc-currency-btn active" data-currency="eur">EUR</button>
          <button class="btc-currency-btn" data-currency="usd">USD</button>
        </div>
        <div class="btc-header">
          <span class="btc-price" id="btc-price">--</span>
          <span class="btc-change" id="btc-change">--</span>
        </div>
        <div class="btc-periods">
          <button class="btc-period-btn" data-days="1">24h</button>
          <button class="btc-period-btn active" data-days="7">7d</button>
          <button class="btc-period-btn" data-days="30">30d</button>
          <button class="btc-period-btn" data-days="90">90d</button>
          <button class="btc-period-btn" data-days="365">1y</button>
        </div>
        <div class="btc-chart-container" id="btc-chart-container">
          <p>Loading chart...</p>
        </div>
      </div>`;
    document.title = `BTC | ${siteData.title}`;
    BTC.init();
  }

  // --- Fullscreen image viewer ---
  function initFullscreen() {
    const wrapper = document.getElementById('full-frame-wrapper');
    const frame = document.getElementById('full-frame');
    const frameImg = frame.querySelector('img');

    document.querySelectorAll('.flexslider img').forEach(img => {
      img.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const src = img.dataset.fullSrc || img.src;
        frameImg.src = src;
        wrapper.style.display = 'block';
        document.body.classList.add('full-frame');
      });
    });

    function close() {
      wrapper.style.display = 'none';
      document.body.classList.remove('full-frame');
    }

    wrapper.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  // --- Init ---
  async function init() {
    await loadData();

    Router.add('/', () => renderHome());
    Router.add('/movies', () => renderMoviesAll());
    Router.add('/movies/:year', ({ year }) => renderMovieList(year));
    Router.add('/movies/:year/:slug', ({ year, slug }) => renderMovieDetail(year, slug));
    Router.add('/flights', () => renderFlightsAll());
    Router.add('/flights/by-year', () => renderFlightsByYear());
    Router.add('/flights/airlines', () => renderFlightsAirlines());
    Router.add('/btc', () => renderBtc());
    Router.add('/other', () => renderOther());
    Router.notFound(() => renderHome());

    Router.start();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
