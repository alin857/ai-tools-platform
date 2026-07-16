/* ============================================
   App.js — 应用入口
   负责：初始化 Router、注册所有路由、全局事件
   ============================================ */
(function() {
  var App = {
    init: function() {
      var container = document.getElementById('page-container');
      if (!container) {
        console.error('找不到 #page-container');
        return;
      }

      // 初始化路由
      Router.init(container);

      // 注册所有路由
      Router.registerAll([
        { hash: '#/',             moduleName: 'home',             title: 'AI 工具聚合平台' },
        { hash: '#/ai-studio',    moduleName: 'ai-studio',        title: 'AI工作室' },
        { hash: '#/text-to-image',   moduleName: 'text-to-image',    title: 'AI绘画 - 文生图' },
        { hash: '#/image-to-video',  moduleName: 'image-to-video',   title: 'AI视频生成' },
        { hash: '#/batch-video',     moduleName: 'batch-video',      title: '批量生成视频' },
        { hash: '#/ecommerce-detail',moduleName: 'ecommerce-detail', title: '电商详情图' },
        { hash: '#/ecommerce-scene', moduleName: 'ecommerce-scene',  title: '电商环境图' },
        { hash: '#/model-change',    moduleName: 'model-change',     title: '模特换装' },
        { hash: '#/store-visit',     moduleName: 'store-visit',      title: '达人探店' },
        { hash: '#/article-rewrite', moduleName: 'article-rewrite',  title: '图文二创' },
        { hash: '#/one-click-create',moduleName: 'one-click-create', title: '一键创作' },
        { hash: '#/copy-extract',    moduleName: 'copy-extract',     title: '短视频文案提取' },
        { hash: '#/video-to-article',moduleName: 'video-to-article', title: '视频转图文' },
        { hash: '#/quick-edit',      moduleName: 'quick-edit',       title: '一键改图' },
        { hash: '#/digital-human',   moduleName: 'digital-human',    title: '数字人合成' },
        { hash: '#/motion-transfer', moduleName: 'motion-transfer',  title: '视频复刻' },
        { hash: '#/login',           moduleName: 'login',            title: '登录' },
        { hash: '#/shop',            moduleName: 'shop',             title: '积分商城' }
      ]);

      // 绑定全局事件
      this._bindGlobalEvents();
    },

    _bindGlobalEvents: function() {
      var self = this;

      // 底部导航点击
      var navItems = document.querySelectorAll('.bottom-nav__item');
      for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function() {
          var hash = this.getAttribute('data-hash');
          if (hash) Router.navigate(hash);
        });
      }

      // 渲染头部
      this._renderHeader();

      // 积分变化回调
      window._onPointsChange = function(pts) {
        self._renderHeader();
        if (pts <= 0) self._showPointsEmptyOverlay();
        else self._hidePointsEmptyOverlay();
      };

      // 积分不足封锁层
      window._showPointsEmpty = function() { self._showPointsEmptyOverlay(); };

      // 初始化时检查积分
      if (Auth.isLoggedIn() && Auth.getPoints() <= 0) {
        setTimeout(function() { self._showPointsEmptyOverlay(); }, 500);
      }

      // 页面可见时自动检查积分（用户从管理后台切回来时生效）
      document.addEventListener('visibilitychange', function() {
        if (!document.hidden && Auth.isLoggedIn()) {
          var pts = Auth.getPoints();
          self._renderHeader();
          if (pts > 0) {
            self._hidePointsEmptyOverlay();
          } else {
            self._showPointsEmptyOverlay();
          }
        }
      });

      // 每30秒自动刷新积分
      setInterval(function() {
        if (Auth.isLoggedIn()) {
          var pts = Auth.getPoints();
          self._renderHeader();
          if (pts > 0) self._hidePointsEmptyOverlay();
        }
      }, 30000);
    },

    /* 积分不足全局遮罩 */
    _showPointsEmptyOverlay: function() {
      var existing = document.getElementById('pointsEmptyOverlay');
      if (existing) return;
      var div = document.createElement('div');
      div.id = 'pointsEmptyOverlay';
      div.style.cssText = 'position:fixed;inset:0;z-index:9997;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;flex-direction:column;';
      div.innerHTML =
        '<div style="text-align:center;padding:32px;">' +
          '<div style="font-size:64px;margin-bottom:16px;">😢</div>' +
          '<div style="font-size:22px;font-weight:700;color:#ff6b6b;margin-bottom:8px;">积分已用完</div>' +
          '<div style="font-size:14px;color:#999;margin-bottom:20px;">所有 AI 生成功能已暂停<br>请充值或签到获取积分</div>' +
          '<button id="btnGoShop" style="padding:12px 32px;border-radius:20px;font-size:15px;font-weight:700;color:#fff;background:linear-gradient(135deg,#ff6b3d,#ff8c42);border:none;cursor:pointer;margin-bottom:8px;">⚡ 立即充值</button>' +
          '<br><button id="btnGoSignIn" style="padding:8px 20px;border-radius:14px;font-size:12px;color:#ffb088;background:transparent;border:1px solid rgba(255,140,66,0.3);cursor:pointer;">🎁 每日签到 +50</button>' +
          '<br><button id="btnGoContact" style="padding:8px 20px;border-radius:14px;font-size:12px;color:#999;background:transparent;border:1px solid rgba(255,255,255,0.1);cursor:pointer;margin-top:4px;">📞 联系管理员</button>' +
          '<br><button id="btnRefreshPts" style="padding:8px 20px;border-radius:14px;font-size:12px;color:#5eeeca;background:transparent;border:1px solid rgba(0,200,150,0.2);cursor:pointer;margin-top:8px;">🔄 刷新积分（充值后点此）</button>' +
        '</div>';
      document.body.appendChild(div);

      document.getElementById('btnGoShop').addEventListener('click', function() { Router.navigate('#/shop'); App._hidePointsEmptyOverlay(); });
      document.getElementById('btnGoSignIn').addEventListener('click', function() {
        if (Auth.signedInToday()) { UI.toast('今天已签到', ''); return; }
        var r = Auth.signIn();
        UI.toast(r.msg, r.ok ? 'success' : 'error');
        if (r.ok) App._renderHeader();
        if (Auth.getPoints() > 0) App._hidePointsEmptyOverlay();
      });
      document.getElementById('btnGoContact').addEventListener('click', function() { App._showContactModal(); });
      document.getElementById('btnRefreshPts').addEventListener('click', function() {
        location.reload();
      });
    },

    _hidePointsEmptyOverlay: function() {
      var el = document.getElementById('pointsEmptyOverlay');
      if (el) el.remove();
    },

    /* 动态渲染头部用户区 */
    _renderHeader: function() {
      var el = document.getElementById('headerRight');
      if (!el) return;
      var h = '';

      if (Auth.isLoggedIn()) {
        var info = Auth.getUserInfo();
        var pts = info ? info.points : 0;
        var signed = Auth.signedInToday();
        h += '<span style="font-size:12px;color:#4da6ff;font-weight:600;">💰 ' + pts + ' 积分</span>';
        h += '<button id="btn-shop-h" style="padding:6px 14px;border-radius:16px;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,#ff8c42,#ff6b3d);border:none;cursor:pointer;animation:pulse 2s infinite;">⚡ 充值</button>';
        h += '<button id="btn-signin" style="padding:5px 10px;border-radius:14px;font-size:11px;font-weight:600;color:#fff;background:' + (signed ? '#333' : 'linear-gradient(135deg,#4da6ff,#7c5cfc)') + ';border:none;cursor:' + (signed ? 'default' : 'pointer') + ';opacity:' + (signed ? '0.5' : '1') + ';">' + (signed ? '已签到' : '🎁 签到') + '</button>';
        h += '<button id="btn-contact-h" style="padding:5px 10px;border-radius:8px;font-size:11px;color:#999;background:#1a1a1e;border:1px solid rgba(255,255,255,0.06);cursor:pointer;">📞 客服</button>';
        h += '<span style="font-size:12px;color:#999;">👤 ' + (info ? info.username : '') + '</span>';
        h += '<button id="btn-logout" style="padding:5px 10px;border-radius:8px;font-size:11px;color:#ff6b6b;background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.15);cursor:pointer;">退出</button>';
      } else {
        h += '<button id="btn-login-h" style="padding:6px 16px;border-radius:16px;font-size:12px;font-weight:600;color:#fff;background:linear-gradient(135deg,#4da6ff,#7c5cfc);border:none;cursor:pointer;">登录</button>';
      }

      el.innerHTML = h;
      this._bindHeaderEvents();
    },

    _bindHeaderEvents: function() {
      var signinBtn = document.getElementById('btn-signin');
      if (signinBtn) {
        signinBtn.addEventListener('click', function() {
          if (Auth.signedInToday()) { UI.toast('今天已签到', ''); return; }
          var r = Auth.signIn();
          UI.toast(r.msg, r.ok ? 'success' : 'error');
          if (r.ok) App._renderHeader();
        });
      }
      var loginBtn = document.getElementById('btn-login-h');
      if (loginBtn) loginBtn.addEventListener('click', function() { Router.navigate('#/login'); });
      var logoutBtn = document.getElementById('btn-logout');
      if (logoutBtn) logoutBtn.addEventListener('click', function() { Auth.logout(); App._renderHeader(); UI.toast('已退出登录', ''); });
      var shopBtn = document.getElementById('btn-shop-h');
      if (shopBtn) shopBtn.addEventListener('click', function() { Router.navigate('#/shop'); });
      var contactBtn = document.getElementById('btn-contact-h');
      if (contactBtn) contactBtn.addEventListener('click', function() { App._showContactModal(); });
    },

    /* 联系管理员弹窗 */
    _showContactModal: function() {
      var existing = document.getElementById('contactModal');
      if (existing) { existing.remove(); return; }
      var info = {};
      try { info = JSON.parse(localStorage.getItem('aigp_support') || '{}'); } catch(e) {}
      var wechat = info.wechat || '未设置';
      var email = info.email || '未设置';
      var phone = info.phone || '未设置';
      var qq = info.qq || '';
      var remark = info.remark || '';

      var div = document.createElement('div');
      div.id = 'contactModal';
      div.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;';
      var contactHTML = '<div>💬 微信：<b style="color:#f0f0f0;">' + wechat + '</b></div>';
      contactHTML += '<div>📧 邮箱：<b style="color:#f0f0f0;">' + email + '</b></div>';
      contactHTML += '<div>📱 电话：<b style="color:#f0f0f0;">' + phone + '</b></div>';
      if (qq) contactHTML += '<div>🐧 QQ：<b style="color:#f0f0f0;">' + qq + '</b></div>';
      if (remark) contactHTML += '<div style="font-size:10px;color:#666;margin-top:6px;">💡 ' + remark + '</div>';
      div.innerHTML =
        '<div style="background:#1a1a1e;border-radius:20px;padding:28px;max-width:340px;width:90%;text-align:center;border:1px solid rgba(255,255,255,0.08);">' +
          '<div style="font-size:40px;margin-bottom:8px;">📞</div>' +
          '<div style="font-size:18px;font-weight:700;color:#f0f0f0;margin-bottom:4px;">联系管理员</div>' +
          '<div style="font-size:12px;color:#999;margin-bottom:20px;">如有问题请通过以下方式联系</div>' +
          '<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;margin-bottom:14px;text-align:left;font-size:13px;line-height:2.2;">' +
            contactHTML +
          '</div>' +
          '<button id="btnCloseContact" style="width:100%;padding:10px;border-radius:10px;font-size:13px;color:#999;background:#1a1a1e;border:1px solid rgba(255,255,255,0.06);cursor:pointer;">关闭</button>' +
        '</div>';
      document.body.appendChild(div);
      div.addEventListener('click', function(e) { if (e.target === div) { div.remove(); } });
      div.querySelector('#btnCloseContact').addEventListener('click', function() { div.remove(); });
    },
  };

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      App.init();
    });
  } else {
    App.init();
  }

  /* ======== 注册到全局 ======== */
  window.App = App;
})();
