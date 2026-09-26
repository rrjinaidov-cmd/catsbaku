(function () {
  'use strict';

  var I18N = window.CB_I18N || {};
  var LANGS = ['az', 'ru', 'en'];
  var lang = localStorage.getItem('cb-lang-static') || 'az';
  if (LANGS.indexOf(lang) === -1) lang = 'az';

  var cats = [
    { id:'rijik', name:'Rijik', area:{az:'Bakı',ru:'Баку',en:'Baku'}, category:'rijik', photo:'img/hero-cat.jpg', likes:24, lat:40.3777, lng:49.8920, note:{az:'Sakit baxış, isti rəng və əsl Bakı xarakteri.',ru:'Спокойный взгляд, тёплый окрас и настоящий бакинский характер.',en:'A calm look, warm colour and pure Baku character.'}},
    { id:'sultan', name:'Sultan', area:{az:'İçərişəhər',ru:'Ичеришехер',en:'Old City'}, category:'rijik', photo:'img/rijik-01.jpg', likes:18, lat:40.3663, lng:49.8352, note:{az:'Daş küçələrin sakit sahibi.',ru:'Спокойный хозяин каменных улиц.',en:'The quiet owner of the stone streets.'}},
    { id:'sunny', name:'Sunny', area:{az:'Bulvar',ru:'Бульвар',en:'Boulevard'}, category:'rijik', photo:'img/rijik-02.jpg', likes:15, lat:40.3667, lng:49.8420, note:{az:'Küləyi və günəşi sevir.',ru:'Любит ветер и солнце.',en:'Loves the wind and sunshine.'}},
    { id:'mango', name:'Mango', area:{az:'Yasamal',ru:'Ясамал',en:'Yasamal'}, category:'rijik', photo:'img/rijik-03.jpg', likes:11, lat:40.3833, lng:49.8111, note:{az:'Həyətlərin ən maraqlı sakini.',ru:'Самый любопытный житель двора.',en:'The most curious resident of the courtyard.'}},
    { id:'bala', name:'Bala', area:{az:'Nərimanov',ru:'Нариманов',en:'Narimanov'}, category:'bala', photo:'img/rijik-04.jpg', likes:9, lat:40.4030, lng:49.8700, note:{az:'Balaca, enerjili və çox mehriban.',ru:'Маленький, энергичный и очень дружелюбный.',en:'Small, energetic and very friendly.'}}
  ];

  var districtStories = [
    ['all','🐾',{az:'Hamısı',ru:'Все',en:'All'}],
    ['icherisheher','🏰',{az:'İçərişəhər',ru:'Ичеришехер',en:'Old City'}],
    ['bulvar','🌊',{az:'Bulvar',ru:'Бульвар',en:'Boulevard'}],
    ['yasamal','🌳',{az:'Yasamal',ru:'Ясамал',en:'Yasamal'}],
    ['narimanov','🏙️',{az:'Nərimanov',ru:'Нариманов',en:'Narimanov'}]
  ];

  var activeFilter = 'all';
  var liked = JSON.parse(localStorage.getItem('cb-liked-static') || '[]');

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  }
  function pick(o) { return o[lang] || o.az || o.en || ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function isLiked(id) { return liked.indexOf(id) !== -1; }
  function totalLikes(c) { return c.likes + (isLiked(c.id) ? 1 : 0); }

  function applyI18n() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('.langs button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    var quote = document.querySelector('[data-static-i18n="heroQuote"]');
    if (quote) quote.textContent = lang === 'ru' ? '«На каждой улице Баку есть друг.»' : lang === 'en' ? '“There’s a friend on every street in Baku.”' : '«Bakının hər küçəsində bir dost var.»';
    var heading = document.getElementById('demoHeading');
    var text = document.getElementById('demoText');
    var title = document.getElementById('demoTitle');
    if (lang === 'ru') { title.textContent='Добавить кота'; heading.textContent='Скоро'; text.textContent='Сейчас сайт работает без базы данных. Добавление котов подключим после утверждения дизайна.'; }
    else if (lang === 'en') { title.textContent='Add a cat'; heading.textContent='Coming soon'; text.textContent='The site is currently running without a database. Cat submissions will be enabled after the design is approved.'; }
    else { title.textContent='Pişik əlavə et'; heading.textContent='Tezliklə'; text.textContent='Sayt hazırda baza olmadan işləyir. Dizayn təsdiqləndikdən sonra pişik əlavə etmək aktiv ediləcək.'; }
    renderStories(); renderFilters(); renderCats(); renderPodium(); renderProducts(); refreshHeroLike(); refreshMapPopups();
  }

  function renderStories() {
    var box = document.getElementById('stories');
    box.innerHTML = districtStories.map(function (s) {
      return '<button class="story" type="button" data-story="'+s[0]+'"><span class="story__ring"><span class="story__img">'+s[1]+'</span></span><span>'+esc(pick(s[2]))+'</span></button>';
    }).join('');
  }

  var filters = [
    ['all',{az:'Hamısı 🐾',ru:'Все 🐾',en:'All 🐾'}],
    ['rijik',{az:'Rıjik 🧡',ru:'Рыжие 🧡',en:'Ginger 🧡'}],
    ['qara',{az:'Qara 🖤',ru:'Чёрные 🖤',en:'Black 🖤'}],
    ['ag',{az:'Ağ 🤍',ru:'Белые 🤍',en:'White 🤍'}],
    ['zolaqli',{az:'Zolaqlı 🐯',ru:'Полосатые 🐯',en:'Tabby 🐯'}],
    ['bala',{az:'Balalar 🐾',ru:'Котята 🐾',en:'Kittens 🐾'}]
  ];
  function renderFilters() {
    document.getElementById('filters').innerHTML = filters.map(function (f) {
      return '<button class="chip" type="button" data-filter="'+f[0]+'" aria-pressed="'+(activeFilter===f[0])+'">'+esc(pick(f[1]))+'</button>';
    }).join('');
  }

  function likeButton(c) {
    return '<button type="button" class="like" data-like-id="'+c.id+'" aria-pressed="'+isLiked(c.id)+'" aria-label="Like">'+(isLiked(c.id)?'♥':'♡')+' <span>'+totalLikes(c)+'</span></button>';
  }

  function card(c) {
    return '<article class="card" data-category="'+c.category+'">' +
      '<div class="card__photo"><img src="'+c.photo+'" alt="'+esc(c.name)+'" loading="lazy"></div>' +
      '<span class="card__new">CatsBaku</span>' + likeButton(c) +
      '<div class="card__body"><div class="card__name">'+esc(c.name)+'</div><div class="card__district">📍 '+esc(pick(c.area))+'</div><p style="font-size:12px;color:var(--muted);margin-top:7px">'+esc(pick(c.note))+'</p></div>' +
      '</article>';
  }
  function renderCats() {
    var list = cats.filter(function (c) { return activeFilter === 'all' || c.category === activeFilter; });
    document.getElementById('catsCount').textContent = list.length + ' ' + t('cats.count');
    document.getElementById('grid').innerHTML = list.length ? list.map(card).join('') : '<div class="empty"><div style="font-size:44px">🐾</div><p>'+(lang==='ru'?'В этой категории пока нет котов.':lang==='en'?'No cats in this category yet.':'Bu kateqoriyada hələ pişik yoxdur.')+'</p></div>';
  }

  function renderPodium() {
    var top = cats.slice().sort(function (a,b) { return totalLikes(b)-totalLikes(a); }).slice(0,3);
    document.getElementById('podium').innerHTML = top.map(function (c,i) {
      return '<div class="rank"><b>'+(i+1)+'</b><img src="'+c.photo+'" alt="'+esc(c.name)+'"><div><div class="rank__name">'+esc(c.name)+'</div><small>📍 '+esc(pick(c.area))+'</small></div>'+likeButton(c)+'</div>';
    }).join('');
  }

  function renderProducts() {
    var labels = lang === 'ru' ? ['Футболка CatsBaku','Открытка из Баку','Стикер CatsBaku'] : lang === 'en' ? ['CatsBaku T-shirt','Postcard from Baku','CatsBaku sticker'] : ['CatsBaku köynəyi','Bakı açıqcası','CatsBaku stikeri'];
    document.getElementById('products').innerHTML =
      '<article class="product"><div class="tee"><svg viewBox="0 0 100 100"><path d="M33 8 16 16 4 34l13 7 6-5v58h54V36l6 5 13-7-12-18-17-8c-2 7-8 11-17 11S35 15 33 8z"/></svg><div class="tee__print"><img src="img/hero-cat.jpg" alt=""></div><div class="tee__label">CATSBAKU</div></div><div class="product__name">'+labels[0]+'</div><small>'+t('shop.eyebrow')+'</small></article>' +
      '<article class="product"><div class="postcard"><img src="img/rijik-01.jpg" alt=""><div><p>Salam<br>from Baku!</p><span><i></i><i></i><i></i></span></div></div><div class="product__name">'+labels[1]+'</div><small>'+t('shop.eyebrow')+'</small></article>' +
      '<article class="product"><div class="sticker"><img src="img/rijik-02.jpg" alt=""><span>CatsBaku</span></div><div class="product__name">'+labels[2]+'</div><small>'+t('shop.eyebrow')+'</small></article>';
  }

  function toggleLike(id) {
    var i = liked.indexOf(id);
    if (i === -1) liked.push(id); else liked.splice(i,1);
    localStorage.setItem('cb-liked-static', JSON.stringify(liked));
    renderCats(); renderPodium(); refreshHeroLike(); refreshMapPopups();
  }
  function refreshHeroLike() {
    var btn = document.querySelector('.hero__actions [data-like-id="rijik"]');
    var c = cats[0];
    if (btn) { btn.innerHTML=(isLiked(c.id)?'♥':'♡')+' <span>'+totalLikes(c)+'</span>'; btn.setAttribute('aria-pressed', String(isLiked(c.id))); }
  }

  var map, mapMarkers = [];
  function initMap() {
    if (!window.L) return;
    map = L.map('catMap').setView([40.395,49.86],11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    cats.forEach(function (c) {
      var icon = L.divIcon({className:'',html:'<div class="pin" style="background-image:url(\''+c.photo+'\')"></div>',iconSize:[48,48],iconAnchor:[24,24]});
      var m=L.marker([c.lat,c.lng],{icon:icon,title:c.name}).addTo(map); m._catId=c.id; mapMarkers.push(m);
    });
    refreshMapPopups();
    var locate=document.getElementById('locate');
    locate.addEventListener('click',function(){
      if(!navigator.geolocation){return;}
      navigator.geolocation.getCurrentPosition(function(p){var ll=[p.coords.latitude,p.coords.longitude];L.marker(ll,{icon:L.divIcon({className:'',html:'<div class="me-dot"></div>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map);map.setView(ll,15);},function(){});
    });
  }
  function refreshMapPopups() {
    if (!mapMarkers.length) return;
    mapMarkers.forEach(function(m){var c=cats.filter(function(x){return x.id===m._catId;})[0]; if(!c)return; m.bindPopup('<div class="popup"><img src="'+c.photo+'" alt=""><div><b>'+esc(c.name)+'</b><small>📍 '+esc(pick(c.area))+'</small><span>♥ '+totalLikes(c)+'</span></div></div>');});
  }

  document.addEventListener('click', function (e) {
    var langBtn = e.target.closest('[data-lang]');
    if (langBtn) { lang=langBtn.dataset.lang; localStorage.setItem('cb-lang-static',lang); applyI18n(); return; }
    var filterBtn=e.target.closest('[data-filter]');
    if(filterBtn){activeFilter=filterBtn.dataset.filter;renderFilters();renderCats();return;}
    var like=e.target.closest('[data-like-id]');
    if(like){toggleLike(like.dataset.likeId);return;}
    var add=e.target.closest('[data-demo-add]');
    if(add){document.getElementById('demoSheet').showModal();return;}
    var close=e.target.closest('[data-close]');
    if(close){document.getElementById('demoSheet').close();return;}
  });

  document.getElementById('year').textContent = new Date().getFullYear();
  applyI18n();
  initMap();
})();
