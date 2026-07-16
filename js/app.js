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
        { hash: '#/motion-transfer', moduleName: 'motion-transfer',  title: '动作迁移' },
        { hash: '#/my-products',     moduleName: 'my-products',      title: '我的产品' }
      ]);

      // 绑定全局事件
      this._bindGlobalEvents();
    },

    _bindGlobalEvents: function() {
      // 底部导航点击
      var navItems = document.querySelectorAll('.bottom-nav__item');
      for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function() {
          var hash = this.getAttribute('data-hash');
          if (hash) {
            Router.navigate(hash);
          }
        });
      }

      // 顶部"我的产品"按钮
      var myProductsBtn = document.getElementById('btn-my-products');
      if (myProductsBtn) {
        myProductsBtn.addEventListener('click', function() {
          Router.navigate('#/my-products');
        });
      }

    }
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
