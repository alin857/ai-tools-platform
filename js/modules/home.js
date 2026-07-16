/* ============================================
   Home — 首页（现代卡片网格风）
   ============================================ */
(function() {
  var module = {
    name: 'home',
    bannerTimer: null,
    currentSlide: 0,

    bannerData: [
      { title: 'AI 绘画 · 全新上线', desc: '文字描述你的创意，AI 秒级生成精美画作', icon: '🎨', link: '#/text-to-image', btnText: '立即体验' },
      { title: 'AI 视频生成 · 热门', desc: '图片变视频、文字变视频，让静态画面动起来', icon: '🎬', link: '#/image-to-video', btnText: '开始创作' },
      { title: '一键创作 · 小红书', desc: '输入主题自动生成爆款笔记，排版精美', icon: '✨', link: '#/one-click-create', btnText: '试试看' }
    ],

    allTools: [
      { name: 'AI绘画',     desc: '文生图·图生图',     icon: '🎨', hash: '#/text-to-image',    cat: 'create', badge: 'HOT', badgeClass: 'tool-card__badge--hot' },
      { name: 'AI视频',     desc: '文生视频·图生视频',  icon: '🎬', hash: '#/image-to-video',   cat: 'create', badge: 'NEW', badgeClass: 'tool-card__badge--new' },
      { name: '批量生成视频', desc: '一键批量出片',       icon: '📦', hash: '#/batch-video',      cat: 'create', iconClass: 'tool-card__icon--purple', badge: 'HOT', badgeClass: 'tool-card__badge--hot' },
      { name: 'AI工作室',   desc: '多模式统一创作',     icon: '🏭', hash: '#/ai-studio',        cat: 'create', iconClass: 'tool-card__icon--purple' },
      { name: '电商详情图', desc: '产品图·详情页排版',  icon: '📋', hash: '#/ecommerce-detail', cat: 'shop', iconClass: 'tool-card__icon--purple' },
      { name: '电商环境图', desc: '产品图·场景替换',    icon: '🏞️', hash: '#/ecommerce-scene',  cat: 'shop', iconClass: 'tool-card__icon--green' },
      { name: '模特换装',   desc: '服装·AI模特穿搭',    icon: '👗', hash: '#/model-change',     cat: 'shop' },
      { name: '达人探店',   desc: '探店笔记·视频',      icon: '🔍', hash: '#/store-visit',      cat: 'life', iconClass: 'tool-card__icon--gold', badge: 'HOT', badgeClass: 'tool-card__badge--hot' },
      { name: '图文二创',   desc: '内容改写·二次创作',  icon: '📝', hash: '#/article-rewrite',  cat: 'content', iconClass: 'tool-card__icon--green' },
      { name: '一键创作',   desc: '小红书爆款笔记',     icon: '📱', hash: '#/one-click-create', cat: 'content', iconClass: 'tool-card__icon--pink' },
      { name: '文案提取',   desc: '视频一键提取文案',   icon: '💬', hash: '#/copy-extract',     cat: 'content' },
      { name: '视频转图文', desc: '视频转图文笔记',     icon: '🔄', hash: '#/video-to-article', cat: 'content' },
      { name: '一键改图',   desc: 'AI智能图片处理',     icon: '⚡', hash: '#/quick-edit',       cat: 'extend', iconClass: 'tool-card__icon--orange' },
      { name: '数字人合成', desc: 'AI数字人视频',       icon: '🤖', hash: '#/digital-human',    cat: 'extend', iconClass: 'tool-card__icon--purple' },
      { name: '视频复刻',   desc: '视频+图片AI复刻',    icon: '🎞️', hash: '#/motion-transfer',  cat: 'extend', iconClass: 'tool-card__icon--purple', badge: 'NEW', badgeClass: 'tool-card__badge--new' }
    ],

    cats: [
      { id: 'all',  label: '全部' },
      { id: 'create', label: '创作' },
      { id: 'shop', label: '电商' },
      { id: 'content', label: '内容' },
      { id: 'extend', label: '扩展' },
      { id: 'life', label: '生活' }
    ],
    activeCat: 'all',

    quickActions: [
      { name: '文生图', icon: '🎨', hash: '#/text-to-image' },
      { name: '视频生成', icon: '🎬', hash: '#/image-to-video' },
      { name: '图文二创', icon: '✍️', hash: '#/article-rewrite' },
      { name: '一键创作', icon: '📱', hash: '#/one-click-create' }
    ],

    render: function(container) {
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
      this._startBanner(container);
    },

    _buildHTML: function() {
      var h = '';

      // === 搜索条 ===
      h += '<div class="search-bar" onclick="Router.navigate(\'#/ai-studio\')"><span class="search-bar__icon">🔍</span>搜索 AI 工具...</div>';

      // === 系统公告 ===
      var ann = localStorage.getItem('aigp_announce') || '';
      if (ann) {
        h += '<div style="margin-bottom:14px;padding:10px 14px;background:rgba(255,140,66,0.08);border-radius:10px;border:1px solid rgba(255,140,66,0.15);font-size:12px;color:#ffb088;display:flex;align-items:center;gap:8px;">📢 ' + ann + '</div>';
      }

      // === 快捷功能行 ===
      h += '<div class="quick-row">';
      for (var q = 0; q < this.quickActions.length; q++) {
        var qa = this.quickActions[q];
        h += '<div class="quick-row__item" data-hash="' + qa.hash + '"><div class="quick-row__icon">' + qa.icon + '</div><span>' + qa.name + '</span></div>';
      }
      h += '</div>';

      // === Banner ===
      h += '<div class="banner" id="homeBanner">';
      h += '<div class="banner__track" id="bannerTrack">';
      for (var i = 0; i < this.bannerData.length; i++) {
        var b = this.bannerData[i];
        h += '<div class="banner__slide"><div class="banner__slide-text"><div class="banner__slide-title">' + b.title + '</div><div class="banner__slide-desc">' + b.desc + '</div><button class="banner__slide-btn" data-link="' + b.link + '">' + b.btnText + '</button></div><div class="banner__slide-icon">' + b.icon + '</div></div>';
      }
      h += '</div>';
      h += '<div class="banner__dots" id="bannerDots">';
      for (var j = 0; j < this.bannerData.length; j++) {
        h += '<button class="banner__dot' + (j === 0 ? ' active' : '') + '" data-index="' + j + '"></button>';
      }
      h += '</div></div>';

      // === 分类标签 ===
      h += '<div class="cat-tabs" id="catTabs">';
      for (var c = 0; c < this.cats.length; c++) {
        var cat = this.cats[c];
        h += '<button class="cat-tab' + (cat.id === this.activeCat ? ' active' : '') + '" data-cat="' + cat.id + '">' + cat.label + '</button>';
      }
      h += '</div>';

      // === 工具卡片网格 ===
      h += '<div class="tool-grid" id="toolGrid">';
      h += this._renderCards();
      h += '</div>';

      // === 页脚 ===
      h += '<footer class="app-footer">AI 工具聚合平台 · 用 AI 释放创意</footer>';

      return h;
    },

    _renderCards: function() {
      var h = '';
      var filtered = this.activeCat === 'all'
        ? this.allTools
        : this.allTools.filter(function(t) { return t.cat === this.activeCat; }.bind(this));

      for (var i = 0; i < filtered.length; i++) {
        var t = filtered[i];
        h += '<div class="tool-card card-hover" data-hash="' + t.hash + '">';
        if (t.badge) {
          h += '<div class="tool-card__badge ' + (t.badgeClass || '') + '">' + t.badge + '</div>';
        }
        h += '<div class="tool-card__icon' + (t.iconClass ? ' ' + t.iconClass : '') + '">' + t.icon + '</div>';
        h += '<div class="tool-card__name">' + t.name + '</div>';
        h += '<div class="tool-card__desc">' + t.desc + '</div>';
        h += '</div>';
      }
      return h;
    },

    _bindEvents: function(container) {
      var self = this;

      // 分类标签切换
      var tabs = container.querySelectorAll('#catTabs .cat-tab');
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function() {
          for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
          this.classList.add('active');
          self.activeCat = this.getAttribute('data-cat');
          container.querySelector('#toolGrid').innerHTML = self._renderCards();
          self._bindCardClicks(container);
        });
      }

      // 工具卡片点击
      this._bindCardClicks(container);

      // 快捷入口
      var qItems = container.querySelectorAll('.quick-row__item');
      for (var qi = 0; qi < qItems.length; qi++) {
        qItems[qi].addEventListener('click', function() {
          var hash = this.getAttribute('data-hash');
          if (hash) Router.navigate(hash);
        });
      }

      // Banner 按钮
      var btns = container.querySelectorAll('.banner__slide-btn');
      for (var b = 0; b < btns.length; b++) {
        btns[b].addEventListener('click', function(e) {
          e.stopPropagation();
          var link = this.getAttribute('data-link');
          if (link) Router.navigate(link);
        });
      }

      // Banner 指示点
      var dots = container.querySelectorAll('.banner__dot');
      for (var d = 0; d < dots.length; d++) {
        dots[d].addEventListener('click', function() {
          var idx = parseInt(this.getAttribute('data-index'));
          self._goToSlide(container, idx);
        });
      }
    },

    _bindCardClicks: function(container) {
      var cards = container.querySelectorAll('#toolGrid .tool-card');
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function() {
          var hash = this.getAttribute('data-hash');
          if (hash) Router.navigate(hash);
        });
      }
    },

    /* ======== Banner 轮播 ======== */
    _startBanner: function(container) {
      var self = this;
      this.currentSlide = 0;
      this._stopBanner();
      this.bannerTimer = setInterval(function() {
        self.currentSlide = (self.currentSlide + 1) % self.bannerData.length;
        self._goToSlide(container, self.currentSlide);
      }, 4000);
    },

    _stopBanner: function() {
      if (this.bannerTimer) { clearInterval(this.bannerTimer); this.bannerTimer = null; }
    },

    _goToSlide: function(container, index) {
      this.currentSlide = index;
      var track = container.querySelector('#bannerTrack');
      if (track) track.style.transform = 'translateX(-' + (index * 100) + '%)';
      var dots = container.querySelectorAll('.banner__dot');
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('active', i === index);
      }
    },

    destroy: function() { this._stopBanner(); }
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['home'] = module;
})();
