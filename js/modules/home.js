/* ============================================
   Home — 首页模块
   Banner 轮播 + 快捷入口 + 分类功能卡片
   ============================================ */
(function() {
  var module = {
    name: 'home',
    bannerTimer: null,
    currentSlide: 0,

    /* ======== Banner 数据 ======== */
    bannerData: [
      {
        title: 'AI 绘画 · 最新上线',
        desc: '用文字描述你的创意，AI 为你生成精美画作。支持多种风格，秒级出图。',
        icon: '🎨',
        link: '#/text-to-image',
        btnText: '立即体验'
      },
      {
        title: 'AI 视频生成 · 热门',
        desc: '图片变视频、文字变视频，让静态画面动起来。支持多种风格和时长。',
        icon: '🎬',
        link: '#/image-to-video',
        btnText: '开始创作'
      },
      {
        title: '一键创作 · 小红书风格',
        desc: '输入主题，AI 自动生成小红书风格的爆款图文。排版精美，内容优质。',
        icon: '✨',
        link: '#/one-click-create',
        btnText: '试试看'
      }
    ],

    /* ======== 功能卡片数据 ======== */
    categories: [
      {
        id: 'create',
        label: '核心创作',
        icon: '🎨',
        iconClass: 'category-section__icon--create',
        tools: [
          { name: 'AI工作室',     desc: '统一创作入口，多模式切换',           icon: '🏭', hash: '#/ai-studio',        tag: '核心',   tagClass: '' },
          { name: 'AI绘画',       desc: '文字描述生成精美图片',                icon: '🖼️', hash: '#/text-to-image',    tag: '热门',   tagClass: 'card__tag--green' },
          { name: 'AI视频生成',   desc: '图片/文字一键生成动态视频',           icon: '🎥', hash: '#/image-to-video',   tag: '推荐',   tagClass: 'card__tag--purple' }
        ]
      },
      {
        id: 'shop',
        label: '电商工具',
        icon: '🛒',
        iconClass: 'category-section__icon--shop',
        tools: [
          { name: '电商详情图',   desc: '产品图一键生成电商详情页排版',        icon: '📋', hash: '#/ecommerce-detail', tag: '电商',   tagClass: '' },
          { name: '电商环境图',   desc: '为产品图智能匹配合适场景背景',        icon: '🏞️', hash: '#/ecommerce-scene',  tag: '电商',   tagClass: '' },
          { name: '模特换装',     desc: 'AI 换装技术，快速展示不同穿搭效果',    icon: '👗', hash: '#/model-change',     tag: '新品',   tagClass: 'card__tag--green' }
        ]
      },
      {
        id: 'life',
        label: '生活服务',
        icon: '🌟',
        iconClass: 'category-section__icon--life',
        tools: [
          { name: '达人探店',     desc: 'AI 探店笔记+视频，图文并茂种草内容',    icon: '🔍', hash: '#/store-visit',      tag: '热门',   tagClass: 'card__tag--green' }
        ]
      },
      {
        id: 'content',
        label: '内容创作',
        icon: '✍️',
        iconClass: 'category-section__icon--content',
        tools: [
          { name: '图文二创',     desc: '对已有内容进行 AI 重新创作改编',      icon: '📝', hash: '#/article-rewrite',  tag: '内容',   tagClass: '' },
          { name: '一键创作',     desc: 'AI 自动生成小红书风格爆款笔记',        icon: '📱', hash: '#/one-click-create', tag: '热门',   tagClass: 'card__tag--green' },
          { name: '短视频文案提取', desc: '从视频中快速提取文案脚本内容',       icon: '💬', hash: '#/copy-extract',     tag: '实用',   tagClass: 'card__tag--orange' },
          { name: '视频转图文',   desc: '将视频内容智能转化为图文笔记',         icon: '🔄', hash: '#/video-to-article', tag: '内容',   tagClass: '' }
        ]
      },
      {
        id: 'extend',
        label: '扩展工具',
        icon: '🔧',
        iconClass: 'category-section__icon--extend',
        tools: [
          { name: '一键改图',     desc: 'AI 智能优化图片，一键完成调整',        icon: '⚡', hash: '#/quick-edit',       tag: '工具',   tagClass: '' },
          { name: '数字人合成',   desc: '创建专属 AI 数字人形象并生成视频',     icon: '🤖', hash: '#/digital-human',    tag: 'AI',     tagClass: 'card__tag--purple' },
          { name: '动作迁移',     desc: '将一段视频的动作迁移到你的图片上',      icon: '🕺', hash: '#/motion-transfer',  tag: '高级',   tagClass: 'card__tag--orange' }
        ]
      }
    ],

    /* ======== 快捷入口 ======== */
    quickActions: [
      { name: '文生图',   icon: '🎨', hash: '#/text-to-image' },
      { name: '视频生成', icon: '🎬', hash: '#/image-to-video' },
      { name: '图文二创', icon: '✍️', hash: '#/article-rewrite' },
      { name: '一键创作', icon: '📱', hash: '#/one-click-create' }
    ],

    /* ======== 渲染 ======== */
    render: function(container) {
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
      this._startBanner(container);
    },

    _buildHTML: function() {
      var html = '';

      // Banner
      html += '<div class="banner" id="homeBanner">';
      html += '<div class="banner__track" id="bannerTrack">';
      for (var i = 0; i < this.bannerData.length; i++) {
        var b = this.bannerData[i];
        html +=
          '<div class="banner__slide">' +
            '<div class="banner__slide-text">' +
              '<div class="banner__slide-title">' + b.title + '</div>' +
              '<div class="banner__slide-desc">' + b.desc + '</div>' +
              '<a class="banner__slide-btn" href="' + b.link + '">' + b.btnText + '</a>' +
            '</div>' +
            '<div class="banner__slide-icon">' + b.icon + '</div>' +
          '</div>';
      }
      html += '</div>';
      html += '<div class="banner__dots" id="bannerDots">';
      for (var j = 0; j < this.bannerData.length; j++) {
        html += '<button class="banner__dot' + (j === 0 ? ' active' : '') + '" data-index="' + j + '"></button>';
      }
      html += '</div>';
      html += '</div>';

      // 快捷入口
      html += '<div class="quick-actions">';
      for (var k = 0; k < this.quickActions.length; k++) {
        var q = this.quickActions[k];
        html +=
          '<div class="quick-action" data-hash="' + q.hash + '">' +
            '<div class="quick-action__icon">' + q.icon + '</div>' +
            '<span>' + q.name + '</span>' +
          '</div>';
      }
      html += '</div>';

      // 功能分类
      for (var c = 0; c < this.categories.length; c++) {
        var cat = this.categories[c];
        html += '<section class="category-section">';
        html +=
          '<div class="category-section__header">' +
            '<div class="category-section__icon ' + cat.iconClass + '">' + cat.icon + '</div>' +
            '<div class="category-section__label">' + cat.label + '</div>' +
            '<div class="category-section__count">' + cat.tools.length + ' 个工具</div>' +
          '</div>';
        html += '<div class="card-grid">';
        for (var t = 0; t < cat.tools.length; t++) {
          var tool = cat.tools[t];
          html +=
            '<div class="card" data-hash="' + tool.hash + '">' +
              '<div class="card__thumb">' +
                '<span class="card__thumb-icon">' + tool.icon + '</span>' +
                '<div class="card__badge">' + tool.name + '</div>' +
              '</div>' +
              '<div class="card__body">' +
                '<div class="card__title">' + tool.name + '</div>' +
                '<div class="card__desc">' + tool.desc + '</div>' +
                '<div class="card__tags">' +
                  '<span class="card__tag ' + (tool.tagClass || '') + '">' + tool.tag + '</span>' +
                '</div>' +
              '</div>' +
            '</div>';
        }
        html += '</div>';
        html += '</section>';
      }

      // 页脚
      html +=
        '<footer class="app-footer">' +
          '<div>© 2026 AI 工具聚合平台 — 用 AI 释放创意。保留所有权利。</div>' +
        '</footer>';

      return html;
    },

    /* ======== 事件绑定 ======== */
    _bindEvents: function(container) {
      var self = this;

      // 卡片点击 → 路由跳转
      var cards = container.querySelectorAll('.card');
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function() {
          var hash = this.getAttribute('data-hash');
          if (hash) Router.navigate(hash);
        });
      }

      // 快捷入口点击
      var quickItems = container.querySelectorAll('.quick-action');
      for (var j = 0; j < quickItems.length; j++) {
        quickItems[j].addEventListener('click', function() {
          var hash = this.getAttribute('data-hash');
          if (hash) Router.navigate(hash);
        });
      }

      // Banner 指示点点击
      var dots = container.querySelectorAll('.banner__dot');
      for (var k = 0; k < dots.length; k++) {
        dots[k].addEventListener('click', function() {
          var index = parseInt(this.getAttribute('data-index'));
          self._goToSlide(container, index);
        });
      }

      // Banner CTA 按钮 — 阻止事件冒泡，用 hash 导航
      var btns = container.querySelectorAll('.banner__slide-btn');
      for (var b = 0; b < btns.length; b++) {
        btns[b].addEventListener('click', function(e) {
          e.preventDefault();
          var href = this.getAttribute('href');
          if (href) Router.navigate(href);
        });
      }

      // 卡片 hover 3D 倾斜效果
      for (var m = 0; m < cards.length; m++) {
        cards[m].addEventListener('mousemove', function(e) {
          var rect = this.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width - 0.5;
          var y = (e.clientY - rect.top) / rect.height - 0.5;
          this.style.transform = 'perspective(800px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg) translateY(-6px)';
        });
        cards[m].addEventListener('mouseleave', function() {
          this.style.transform = '';
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
      if (this.bannerTimer) {
        clearInterval(this.bannerTimer);
        this.bannerTimer = null;
      }
    },

    _goToSlide: function(container, index) {
      this.currentSlide = index;
      var track = container.querySelector('#bannerTrack');
      if (track) {
        track.style.transform = 'translateX(-' + (index * 100) + '%)';
      }
      var dots = container.querySelectorAll('.banner__dot');
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('active', i === index);
      }
    },

    /* ======== 销毁 ======== */
    destroy: function() {
      this._stopBanner();
    }
  };

  /* ======== 注册到全局 ======== */
  window.__modules__ = window.__modules__ || {};
  window.__modules__['home'] = module;
})();
