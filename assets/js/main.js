(function () {
  'use strict';

  var CFG = window.WEDDING || {};
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var WD = ['일', '월', '화', '수', '목', '금', '토'];
  var weddingAt = new Date(CFG.date);

  /* ── 토스트 ─────────────────────────────── */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 1800);
  }

  /* ── 클립보드 복사 ──────────────────────── */
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        function () { toast('복사되었습니다'); },
        function () { fallbackCopy(text); }
      );
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    try { document.execCommand('copy'); toast('복사되었습니다'); }
    catch (e) { toast('복사에 실패했습니다'); }
    document.body.removeChild(ta);
  }

  /* ── 로더 ───────────────────────────────── */
  window.addEventListener('load', function () {
    setTimeout(function () {
      $('#loader').classList.add('is-done');
      setTimeout(function () { $('#loader').style.display = 'none'; }, 900);
    }, 1100);
  });

  /* ── 스크롤 등장 애니메이션 ──────────────── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach(function (el) { io.observe(el); });

  /* ── 캘린더 + D-day ─────────────────────── */
  (function calendar() {
    var box = $('#calendar');
    if (!box || isNaN(weddingAt)) return;

    var y = weddingAt.getFullYear(), m = weddingAt.getMonth(), d = weddingAt.getDate();
    var first = new Date(y, m, 1).getDay();
    var last  = new Date(y, m + 1, 0).getDate();

    var html = '<p class="cal__month">' + (m + 1) + '</p><div class="cal__grid">';
    WD.forEach(function (w, i) {
      html += '<div class="cal__dow' + (i === 0 ? ' cal__dow--sun' : '') + '">' + w + '</div>';
    });
    for (var i = 0; i < first; i++) html += '<div class="cal__day"></div>';
    for (var day = 1; day <= last; day++) {
      var dow = (first + day - 1) % 7;
      var cls = 'cal__day' + (dow === 0 ? ' cal__day--sun' : '') + (day === d ? ' cal__day--on' : '');
      html += '<div class="' + cls + '">' + day + '</div>';
    }
    html += '</div><p class="cal__time">' + fmtTime(weddingAt) + '</p>';
    box.innerHTML = html;

    // 헤드라인 문구도 날짜에서 자동 생성
    var hl = $('#calHeadline');
    if (hl) {
      hl.textContent = y + '년 ' + (m + 1) + '월 ' + d + '일 ' +
        WD[weddingAt.getDay()] + '요일 ' + fmtTime(weddingAt);
    }

    // D-day
    var dEl = $('#dday');
    if (dEl) {
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var target = new Date(y, m, d);
      var diff = Math.round((target - today) / 86400000);
      var names = '성민 ♥ 윤재';
      dEl.innerHTML = diff > 0
        ? names + '의 결혼식이 <b>' + diff + '일</b> 남았습니다'
        : diff === 0
          ? '오늘은 ' + names + '의 결혼식입니다'
          : names + '의 결혼식이 <b>' + Math.abs(diff) + '일</b> 지났습니다';
    }
  })();

  function fmtTime(dt) {
    var h = dt.getHours(), mi = dt.getMinutes();
    var ap = h < 12 ? '오전' : '오후';
    var h12 = h % 12 || 12;
    return ap + ' ' + h12 + '시' + (mi ? ' ' + mi + '분' : '');
  }

  /* ── 게스트스냅 ─────────────────────────── */
  (function snap() {
    var btn = $('#snapBtn'), note = $('#snapNote');
    if (!btn) return;
    var open = !isNaN(weddingAt) && Date.now() >= new Date(weddingAt).setHours(0, 0, 0, 0);

    if (!CFG.snapUrl) {
      btn.disabled = true;
      if (note) note.textContent = '업로드 링크 준비 중입니다';
      return;
    }
    if (!open) {
      btn.disabled = true;
      if (note) note.textContent =
        weddingAt.getMonth() + 1 + '월 ' + weddingAt.getDate() + '일부터 업로드가 가능합니다';
      return;
    }
    if (note) note.hidden = true;
    btn.addEventListener('click', function () { window.open(CFG.snapUrl, '_blank', 'noopener'); });
  })();

  /* ── 갤러리 라이트박스 ──────────────────── */
  (function gallery() {
    var cells = $$('#gallery .gallery__cell');
    if (!cells.length) return;

    var lb = $('#lightbox'), img = $('#lbImg'), cnt = $('#lbCount');
    var srcs = cells.map(function (c) {
      var t = c.querySelector('img');
      return { src: t.dataset.full || t.src, alt: t.alt };
    });
    var idx = 0;

    function show(i) {
      idx = (i + srcs.length) % srcs.length;
      img.src = srcs[idx].src;
      img.alt = srcs[idx].alt;
      cnt.textContent = (idx + 1) + ' / ' + srcs.length;
    }
    function open(i) {
      show(i);
      lb.hidden = false;
      document.body.classList.add('is-locked');
    }
    function close() {
      lb.hidden = true;
      document.body.classList.remove('is-locked');
    }

    cells.forEach(function (c, i) { c.addEventListener('click', function () { open(i); }); });
    $('[data-lb-close]').addEventListener('click', close);
    $('[data-lb-prev]').addEventListener('click', function () { show(idx - 1); });
    $('[data-lb-next]').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });

    // 스와이프
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) show(dx > 0 ? idx - 1 : idx + 1);
      x0 = null;
    }, { passive: true });
  })();

  /* ── 오시는 길: 지도 + 내비 링크 ────────── */
  (function location_() {
    var v = CFG.venue || {};
    var q = encodeURIComponent(v.name || '');
    var addr = encodeURIComponent(v.address || '');

    var tmap = $('#naviTmap');
    if (tmap) tmap.href = 'tmap://route?goalname=' + q + '&goalx=' + v.lng + '&goaly=' + v.lat;

    var kakao = $('#naviKakao');
    if (kakao) kakao.href = 'https://map.kakao.com/link/to/' + q + ',' + v.lat + ',' + v.lng;

    var naver = $('#naviNaver');
    if (naver) naver.href = 'https://map.naver.com/p/search/' + (addr || q);

    // 카카오맵 SDK (키가 설정된 경우에만)
    if (!CFG.kakaoMapKey) return;
    var s = document.createElement('script');
    s.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=' + CFG.kakaoMapKey + '&autoload=false';
    s.onload = function () {
      window.kakao.maps.load(function () {
        var box = $('#map');
        box.innerHTML = '';
        box.classList.add('is-loaded');
        var pos = new kakao.maps.LatLng(v.lat, v.lng);
        var map = new kakao.maps.Map(box, { center: pos, level: 4 });
        new kakao.maps.Marker({ map: map, position: pos });
        map.setZoomable(false);
      });
    };
    document.head.appendChild(s);
  })();

  /* ── 복사 버튼 (계좌 / 주소) ────────────── */
  document.addEventListener('click', function (e) {
    var byText = e.target.closest('[data-copy]');
    if (byText) { copy(byText.dataset.copy); return; }

    var byTarget = e.target.closest('[data-copy-target]');
    if (byTarget) {
      var t = $(byTarget.dataset.copyTarget);
      if (t) copy(t.textContent.trim());
    }
  });

  /* ── 안내사항 탭 ────────────────────────── */
  (function tabs() {
    var wrap = $('#infoTabs');
    if (!wrap) return;
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.tabs__btn');
      if (!btn) return;
      $$('.tabs__btn', wrap).forEach(function (b) { b.classList.toggle('is-on', b === btn); });
      $$('.tabs__panel').forEach(function (p) {
        p.classList.toggle('is-on', p.dataset.panel === btn.dataset.tab);
      });
    });
  })();

  /* ── RSVP 모달 ──────────────────────────── */
  (function rsvp() {
    var modal = $('#rsvpModal'), form = $('#rsvpForm');

    function open() {
      modal.hidden = false;
      document.body.classList.add('is-locked');
    }
    function close() {
      modal.hidden = true;
      document.body.classList.remove('is-locked');
    }

    $$('[data-open-rsvp]').forEach(function (b) { b.addEventListener('click', open); });
    $$('[data-close-rsvp]').forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });

    // 개인정보 안내 토글
    $('#policyBtn').addEventListener('click', function () {
      var box = $('#policyBox');
      box.hidden = !box.hidden;
    });

    // 연락처 자동 하이픈
    var phone = form.elements.phone;
    phone.addEventListener('input', function () {
      var n = phone.value.replace(/\D/g, '').slice(0, 11);
      phone.value = n.length < 4 ? n
        : n.length < 8 ? n.slice(0, 3) + '-' + n.slice(3)
        : n.slice(0, 3) + '-' + n.slice(3, 7) + '-' + n.slice(7);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.at = new Date().toISOString();

      // ⚠️ 초안: 브라우저에만 저장됩니다. 실제 수집은 아래 sendRsvp()를 연결하세요.
      var list = JSON.parse(localStorage.getItem('rsvpList') || '[]');
      list.push(data);
      localStorage.setItem('rsvpList', JSON.stringify(list));

      close();
      toast('참석 여부가 전달되었습니다. 감사합니다!');
      form.reset();
      $('#policyBox').hidden = true;
    });
  })();

  /* ── 방명록 (초안: localStorage) ─────────── */
  (function guestbook() {
    var form = $('#gbForm'), list = $('#gbList'), more = $('#gbMore');
    if (!form) return;
    var KEY = 'guestbook', PAGE = 5, shown = PAGE;

    function load() { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    function save(v) { localStorage.setItem(KEY, JSON.stringify(v)); }

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function render() {
      var all = load();
      if (!all.length) {
        list.innerHTML = '<li class="gb__empty">첫 번째 축하 메시지를 남겨주세요 :)</li>';
        more.hidden = true;
        return;
      }
      list.innerHTML = all.slice(0, shown).map(function (g, i) {
        return '<li>' +
          '<div class="gb__head">' +
            '<span class="gb__name">' + esc(g.name) + '</span>' +
            '<span class="gb__date">' + g.date + '</span>' +
            '<button type="button" class="gb__del" data-del="' + i + '">삭제</button>' +
          '</div>' +
          '<p class="gb__msg">' + esc(g.msg) + '</p>' +
        '</li>';
      }).join('');
      more.hidden = all.length <= shown;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var all = load();
      var now = new Date();
      all.unshift({
        name: f.name.value.trim(),
        pw:   f.pw.value,
        msg:  f.msg.value.trim(),
        date: now.getFullYear() + '.' +
              String(now.getMonth() + 1).padStart(2, '0') + '.' +
              String(now.getDate()).padStart(2, '0')
      });
      save(all);
      form.reset();
      render();
      toast('축하 메시지가 등록되었습니다');
    });

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-del]');
      if (!btn) return;
      var all = load(), i = Number(btn.dataset.del);
      var pw = prompt('작성 시 입력한 비밀번호를 입력해주세요');
      if (pw === null) return;
      if (pw !== all[i].pw) { toast('비밀번호가 일치하지 않습니다'); return; }
      all.splice(i, 1);
      save(all);
      render();
      toast('삭제되었습니다');
    });

    more.addEventListener('click', function () { shown += PAGE; render(); });
    render();
  })();

  /* ── 공유하기 ───────────────────────────── */
  (function share() {
    var title = document.title;
    var text = $('meta[property="og:description"]');
    text = text ? text.content : '';

    var sBtn = $('#shareBtn');
    if (sBtn) sBtn.addEventListener('click', function () {
      if (navigator.share) {
        navigator.share({ title: title, text: text, url: location.href }).catch(function () {});
      } else {
        copy(location.href);
      }
    });

    var lBtn = $('#linkBtn');
    if (lBtn) lBtn.addEventListener('click', function () { copy(location.href); });
  })();

  /* ── BGM ────────────────────────────────── */
  (function bgm() {
    if (!CFG.bgm) return;
    var btn = $('#bgmBtn');
    var audio = new Audio(CFG.bgm);
    audio.loop = true;
    audio.volume = 0.5;
    btn.hidden = false;

    function play() {
      audio.play().then(function () { btn.classList.add('is-on'); }).catch(function () {});
    }
    btn.addEventListener('click', function () {
      if (audio.paused) play();
      else { audio.pause(); btn.classList.remove('is-on'); }
    });
    // 브라우저 자동재생 정책상 첫 사용자 터치 후 재생 시도
    document.addEventListener('click', function once() {
      play();
      document.removeEventListener('click', once);
    }, { once: true });
  })();

})();
