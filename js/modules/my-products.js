/* ============================================
   我的产品 — 用户创作管理
   展示、筛选、删除所有保存的作品
   ============================================ */
(function() {
  var module = {
    name: 'my-products',
    title: '我的产品',

    filter: 'all', // 'all' | 'image' | 'video' | 'article'

    render: function(container) {
      this._renderPage(container);
    },

    _renderPage: function(container) {
      var products = Storage.getProducts();
      var self = this;
      var h = '';

      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">📦 我的产品</div></div>';

      // 统计栏
      var counts = { image: 0, video: 0, article: 0, total: products.length };
      for (var i = 0; i < products.length; i++) {
        var t = products[i].type || 'image';
        counts[t] = (counts[t] || 0) + 1;
      }

      h += '<div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">';
      h += '<button class="filter-btn' + (this.filter === 'all' ? ' active' : '') + '" data-filter="all" style="padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;background:' + (this.filter === 'all' ? 'var(--accent-dim)' : 'var(--bg-card)') + ';border:1px solid ' + (this.filter === 'all' ? 'var(--accent-strong)' : 'var(--border-card)') + ';color:' + (this.filter === 'all' ? 'var(--accent)' : 'var(--text-secondary)') + ';">全部 (' + counts.total + ')</button>';
      h += '<button class="filter-btn' + (this.filter === 'image' ? ' active' : '') + '" data-filter="image" style="padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;background:' + (this.filter === 'image' ? 'var(--accent-dim)' : 'var(--bg-card)') + ';border:1px solid ' + (this.filter === 'image' ? 'var(--accent-strong)' : 'var(--border-card)') + ';color:' + (this.filter === 'image' ? 'var(--accent)' : 'var(--text-secondary)') + ';">🖼️ 图片 (' + (counts.image || 0) + ')</button>';
      h += '<button class="filter-btn' + (this.filter === 'video' ? ' active' : '') + '" data-filter="video" style="padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;background:' + (this.filter === 'video' ? 'var(--accent-dim)' : 'var(--bg-card)') + ';border:1px solid ' + (this.filter === 'video' ? 'var(--accent-strong)' : 'var(--border-card)') + ';color:' + (this.filter === 'video' ? 'var(--accent)' : 'var(--text-secondary)') + ';">🎬 视频 (' + (counts.video || 0) + ')</button>';
      h += '<button class="filter-btn' + (this.filter === 'article' ? ' active' : '') + '" data-filter="article" style="padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;background:' + (this.filter === 'article' ? 'var(--accent-dim)' : 'var(--bg-card)') + ';border:1px solid ' + (this.filter === 'article' ? 'var(--accent-strong)' : 'var(--border-card)') + ';color:' + (this.filter === 'article' ? 'var(--accent)' : 'var(--text-secondary)') + ';">📝 笔记 (' + (counts.article || 0) + ')</button>';
      h += '</div>';

      // 产品列表
      var filtered = this.filter === 'all' ? products : products.filter(function(p) { return p.type === self.filter; });

      if (!filtered.length) {
        h += '<div class="empty-state"><div class="empty-state__icon">📭</div><div class="empty-state__text">还没有保存任何作品</div><div style="font-size:12px;color:var(--text-muted);">去工具页面创作后保存，就会出现在这里</div></div>';
      } else {
        h += '<div class="card-grid">';
        for (var j = 0; j < filtered.length; j++) {
          var item = filtered[j];
          h += '<div class="product-card" data-id="' + item.id + '" style="position:relative;border-radius:var(--radius);overflow:hidden;background:var(--bg-card);border:1px solid var(--border-card);">';

          // 缩略区
          h += '<div style="height:140px;background:var(--bg-input);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">';
          if (item.type === 'video') {
            h += '<video src="' + (item.videoUrl || '') + '" muted style="width:100%;height:100%;object-fit:cover;" poster="' + (item.thumbnailUrl || '') + '" onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0;"></video>';
            h += '<div style="position:absolute;top:8px;right:8px;padding:3px 8px;border-radius:4px;font-size:10px;background:rgba(0,0,0,0.7);color:var(--accent);">🎬 视频</div>';
          } else if (item.type === 'article') {
            h += '<div style="padding:16px;text-align:center;font-size:40px;">📝</div>';
            h += '<div style="position:absolute;top:8px;right:8px;padding:3px 8px;border-radius:4px;font-size:10px;background:rgba(0,0,0,0.7);color:var(--green);">📰 笔记</div>';
          } else {
            h += '<img src="' + (item.imageUrl || '') + '" alt="" style="width:100%;height:100%;object-fit:cover;" loading="lazy">';
            h += '<div style="position:absolute;top:8px;right:8px;padding:3px 8px;border-radius:4px;font-size:10px;background:rgba(0,0,0,0.7);color:var(--accent);">🖼️ 图片</div>';
          }
          h += '</div>';

          // 信息区
          h += '<div style="padding:10px 12px;">';
          h += '<div style="font-size:13px;font-weight:600;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (item.title || item.toolName || '未命名') + '</div>';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">';
          h += '<span style="font-size:11px;color:var(--text-muted);">' + (item.createdAt ? new Date(item.createdAt).toLocaleDateString('zh-CN') : '') + '</span>';
          h += '<button class="btn-delete" data-id="' + item.id + '" style="padding:3px 8px;border-radius:4px;font-size:10px;background:rgba(255,107,107,0.12);color:#ff6b6b;border:1px solid rgba(255,107,107,0.2);cursor:pointer;">🗑️</button>';
          h += '</div></div>';

          h += '</div>';
        }
        h += '</div>';
      }

      container.innerHTML = h;
      this._bindEvents(container);
    },

    _bindEvents: function(container) {
      var self = this;

      // 筛选按钮
      var fbs = container.querySelectorAll('.filter-btn');
      for (var i = 0; i < fbs.length; i++) {
        fbs[i].addEventListener('click', function() {
          self.filter = this.getAttribute('data-filter');
          self._renderPage(container);
        });
      }

      // 删除按钮
      var dels = container.querySelectorAll('.btn-delete');
      for (var j = 0; j < dels.length; j++) {
        dels[j].addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.getAttribute('data-id');
          Storage.removeProduct(id);
          UI.toast('已删除', 'success');
          self._renderPage(container);
        });
      }

      // 点击产品卡 — 预览
      var cards = container.querySelectorAll('.product-card');
      for (var k = 0; k < cards.length; k++) {
        cards[k].addEventListener('click', function() {
          var id = this.getAttribute('data-id');
          var prods = Storage.getProducts();
          for (var p = 0; p < prods.length; p++) {
            if (prods[p].id === id) {
              var item = prods[p];
              if ((item.type === 'image' || !item.type) && item.imageUrl) {
                UI.previewImage(item.imageUrl);
              } else if (item.type === 'video' && item.videoUrl) {
                var modal = document.querySelector('.modal-overlay');
                if (!modal) { UI.toast('播放器加载中', ''); return; }
                modal.classList.add('is-open');
                modal.querySelector('.modal-content').innerHTML =
                  '<button class="modal-close" onclick="UI.closePreview()">&times;</button>' +
                  '<video src="' + item.videoUrl + '" controls autoplay style="max-width:90vw;max-height:80vh;border-radius:var(--radius);"></video>';
              } else if (item.type === 'article' && item.content) {
                UI.toast('笔记内容已就绪，可在对应工具页查看全文', '');
              }
              break;
            }
          }
        });
      }
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['my-products'] = module;
})();
