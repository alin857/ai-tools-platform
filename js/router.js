/* ============================================
   Hash Router — 轻量 SPA 路由
   支持：导航高亮、加载状态、过渡动画、错误处理
   ============================================ */
(function() {
  var Router = {
    routes: [],
    currentHash: '',
    currentModule: null,
    container: null,
    loadedModules: {},
    transitioning: false,

    init: function(container) {
      this.container = container;
      var self = this;
      window.addEventListener('hashchange', function() { self._handleRoute(); });
      if (!location.hash) location.hash = '#/';
      this._handleRoute();
    },

    register: function(hash, moduleName, title) {
      this.routes.push({ hash: hash, moduleName: moduleName, title: title });
    },

    registerAll: function(list) {
      var self = this;
      list.forEach(function(r) { self.register(r.hash, r.moduleName, r.title); });
    },

    navigate: function(hash) {
      if (this.transitioning) return;
      location.hash = hash;
    },

    back: function() {
      if (location.hash === '#/' || !location.hash) {
        location.hash = '#/';
      } else {
        window.history.back();
      }
    },

    getCurrentRoute: function() {
      var hash = location.hash || '#/';
      for (var i = 0; i < this.routes.length; i++) {
        if (this.routes[i].hash === hash) return this.routes[i];
      }
      return null;
    },

    /* ======== 内部 ======== */
    _handleRoute: function() {
      var hash = location.hash || '#/';
      if (hash === this.currentHash && this.currentModule) return;

      this.transitioning = true;

      // 销毁旧模块
      if (this.currentModule && this.currentModule.destroy) {
        this.currentModule.destroy();
      }

      // 查找路由
      var route = null;
      for (var i = 0; i < this.routes.length; i++) {
        if (this.routes[i].hash === hash) { route = this.routes[i]; break; }
      }
      if (!route) { location.hash = '#/'; this.transitioning = false; return; }

      this.currentHash = hash;
      document.title = route.title + ' | AI 工具平台';

      // 显示加载态
      if (this.container) {
        this.container.innerHTML =
          '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center;">' +
            '<div class="spinner" style="margin-bottom:16px;"></div>' +
            '<div style="font-size:14px;color:var(--text-secondary);">加载中...</div>' +
          '</div>';
      }

      // 更新导航和滚动
      this._updateNavActive(hash);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      var self = this;
      this._loadModule(route.moduleName, function(mod) {
        self.transitioning = false;
        if (!self.container) return;
        self.currentModule = mod;
        if (mod && mod.render) {
          self.container.innerHTML = '';
          mod.render(self.container);
        } else {
          self.container.innerHTML =
            '<div class="empty-state">' +
              '<div class="empty-state__icon">🔧</div>' +
              '<div class="empty-state__text">模块加载失败</div>' +
              '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;">' + route.moduleName + ' 未能加载</div>' +
              '<button class="btn-action btn-action--secondary" style="margin-top:16px;" onclick="Router.navigate(\'#/\')">← 返回首页</button>' +
            '</div>';
        }
      });
    },

    _loadModule: function(moduleName, callback) {
      if (this.loadedModules[moduleName]) { callback(this.loadedModules[moduleName]); return; }

      var self = this;
      if (window.__modules__ && window.__modules__[moduleName]) {
        self.loadedModules[moduleName] = window.__modules__[moduleName];
        callback(window.__modules__[moduleName]);
        return;
      }

      var script = document.createElement('script');
      script.src = 'js/modules/' + moduleName + '.js';
      script.onload = function() {
        var mod = (window.__modules__ && window.__modules__[moduleName]) || null;
        self.loadedModules[moduleName] = mod;
        callback(mod);
      };
      script.onerror = function() {
        console.error('模块加载失败:', moduleName);
        self.loadedModules[moduleName] = null;
        callback(null);
      };
      document.head.appendChild(script);
    },

    // 底部导航高亮 —— 支持模糊匹配（创作Tab匹配所有创作类工具）
    _updateNavActive: function(hash) {
      var navItems = document.querySelectorAll('.bottom-nav__item');
      for (var i = 0; i < navItems.length; i++) {
        var navHash = navItems[i].getAttribute('data-hash');
        var section = navItems[i].getAttribute('data-section') || '';
        var active = false;

        if (navHash === hash) {
          active = true;
        } else if (section) {
          // 模糊匹配：例如 section="create" 匹配所有创作工具
          var sections = section.split(',');
          for (var s = 0; s < sections.length; s++) {
            var route = this._findRoute(hash);
            if (route && route.moduleName === sections[s].trim()) {
              active = true;
              break;
            }
          }
        }

        if (active) {
          navItems[i].classList.add('active');
        } else {
          navItems[i].classList.remove('active');
        }
      }
    },

    _findRoute: function(hash) {
      for (var i = 0; i < this.routes.length; i++) {
        if (this.routes[i].hash === hash) return this.routes[i];
      }
      return null;
    }
  };

  window.Router = Router;
})();
