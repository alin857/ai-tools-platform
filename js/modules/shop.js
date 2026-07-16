/* ============================================
   积分商城
   ============================================ */
(function() {
  var module = {
    name: 'shop',
    title: '积分商城',

    packages: [
      { id: 'p1', name: '100 积分', price: 1,   points: 100,  icon: '💎', tag: '体验' },
      { id: 'p2', name: '500 积分', price: 20,  points: 500,  icon: '🌟', tag: '热门', tagColor: '#ff6b3d' },
      { id: 'p3', name: '1000 积分', price: 50, points: 1000, icon: '👑', tag: '超值', tagColor: '#ffd700' }
    ],
    payMethods: [
      { id: 'wechat',  name: '微信支付', icon: '💚', color: '#07c160' },
      { id: 'alipay',  name: '支付宝',   icon: '💙', color: '#1677ff' }
    ],
    selectedPkg: null,
    selectedPay: 'wechat',

    render: function(container) {
      // 默认选中第一个套餐
      if (!this.selectedPkg) this.selectedPkg = this.packages[0];
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
    },

    _buildHTML: function() {
      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">💰 积分商城</div></div>';

      // 当前积分
      var pts = Auth.isLoggedIn() ? Auth.getPoints() : 0;
      h += '<div style="padding:16px;background:linear-gradient(135deg,rgba(77,166,255,0.1),rgba(124,92,252,0.1));border-radius:12px;border:1px solid rgba(77,166,255,0.15);margin-bottom:20px;text-align:center;">';
      h += '<div style="font-size:12px;color:#999;">当前积分</div>';
      h += '<div style="font-size:32px;font-weight:800;color:#4da6ff;margin:4px 0;">💰 ' + pts + '</div>';
      if (!Auth.isLoggedIn()) {
        h += '<div style="font-size:11px;color:#ff6b6b;">请先登录后购买</div>';
      }
      h += '</div>';

      // 套餐
      h += '<div style="margin-bottom:20px;">';
      h += '<div class="tool-input-area__label" style="margin-bottom:10px;">📦 选择套餐</div>';
      for (var i = 0; i < this.packages.length; i++) {
        var pkg = this.packages[i];
        var sel = this.selectedPkg && this.selectedPkg.id === pkg.id;
        h += '<div class="pkg-card" data-pkg="' + pkg.id + '" style="padding:16px;margin-bottom:10px;border-radius:12px;background:' + (sel ? 'rgba(77,166,255,0.08)' : '#1a1a1e') + ';border:1.5px solid ' + (sel ? 'rgba(77,166,255,0.4)' : 'rgba(255,255,255,0.06)') + ';cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:14px;">';
        h += '<div style="font-size:36px;">' + pkg.icon + '</div>';
        h += '<div style="flex:1;">';
        h += '<div style="font-size:16px;font-weight:700;color:#f0f0f0;">' + pkg.name + '</div>';
        h += '<div style="font-size:12px;color:#999;">' + (pkg.price / pkg.points * 100).toFixed(1) + '分/积分</div>';
        h += '</div>';
        h += '<div style="text-align:right;">';
        h += '<div style="font-size:22px;font-weight:800;color:#f0f0f0;">¥' + pkg.price + '</div>';
        if (pkg.tag) {
          h += '<span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;background:' + (pkg.tagColor || '#4da6ff') + '20;color:' + (pkg.tagColor || '#4da6ff') + ';">' + pkg.tag + '</span>';
        }
        h += '</div></div>';
      }
      h += '</div>';

      // 支付方式
      h += '<div class="tool-input-area__label" style="margin-bottom:8px;">💳 支付方式</div>';
      h += '<div style="display:flex;gap:10px;margin-bottom:20px;">';
      for (var j = 0; j < this.payMethods.length; j++) {
        var pm = this.payMethods[j];
        var pmSel = this.selectedPay === pm.id;
        h += '<button class="pay-btn" data-pay="' + pm.id + '" style="flex:1;padding:12px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;background:' + (pmSel ? pm.color + '20' : '#1a1a1e') + ';border:1.5px solid ' + (pmSel ? pm.color : 'rgba(255,255,255,0.06)') + ';color:' + (pmSel ? pm.color : '#999') + ';transition:all 0.2s;">' + pm.icon + ' ' + pm.name + '</button>';
      }
      h += '</div>';

      // 购买按钮
      h += '<button class="btn-generate" id="btnBuy">💳 立即购买</button>';

      // 充值记录
      h += '<div style="margin-top:24px;">';
      h += '<div class="tool-input-area__label" style="margin-bottom:8px;">📋 充值记录</div>';
      h += '<div id="orderList" style="font-size:11px;color:#666;"></div>';
      h += '</div>';

      return h;
    },

    _bindEvents: function(container) {
      var self = this;
      var pkgs = container.querySelectorAll('.pkg-card');
      for (var i = 0; i < pkgs.length; i++) {
        pkgs[i].addEventListener('click', function() {
          var id = this.getAttribute('data-pkg');
          for (var j = 0; j < self.packages.length; j++) {
            if (self.packages[j].id === id) { self.selectedPkg = self.packages[j]; break; }
          }
          self.render(container);
        });
      }

      var payBtns = container.querySelectorAll('.pay-btn');
      for (var k = 0; k < payBtns.length; k++) {
        payBtns[k].addEventListener('click', function() {
          self.selectedPay = this.getAttribute('data-pay');
          self.render(container);
        });
      }

      container.querySelector('#btnBuy').addEventListener('click', function() {
        self._buy(container);
      });

      this._showOrders(container);
    },

    _buy: function(container) {
      var pkg = this.selectedPkg || this.packages[0];
      this.selectedPkg = pkg;
      var pay = this.selectedPay === 'wechat' ? '微信支付' : '支付宝';

      var orderId = 'ORD' + Date.now();

      // 保存订单（关联用户名）
      var username = Auth.isLoggedIn() ? Auth.currentUser() : 'guest';
      var orders = [];
      try { orders = JSON.parse(localStorage.getItem('aigp_orders') || '[]'); } catch(e) {}
      orders.unshift({ id: orderId, pkg: pkg.name, price: pkg.price, points: pkg.points, pay: pay, time: new Date().toISOString(), status: 'pending', user: username });
      localStorage.setItem('aigp_orders', JSON.stringify(orders));

      // 显示支付弹窗
      this._showPayModal(container, pkg, pay, orderId);
    },

    /* 支付弹窗 */
    _showPayModal: function(container, pkg, pay, orderId) {
      var self = this;
      var isWechat = pay === '微信支付';
      var payColor = isWechat ? '#07c160' : '#1677ff';
      var payIcon = isWechat ? '💚' : '💙';
      var payInfo = '订单号：' + orderId + '\n金额：¥' + pkg.price + '\n套餐：' + pkg.name;

      var overlay = document.createElement('div');
      overlay.style.cssText = 'display:flex;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);backdrop-filter:blur(8px);align-items:center;justify-content:center;overflow-y:auto;padding:20px;';

      var h = '';
      h += '<div style="background:#1a1a1e;border-radius:20px;padding:24px;max-width:380px;width:100%;text-align:center;border:1px solid rgba(255,255,255,0.08);position:relative;">';
      h += '<button id="closePayModal" style="position:absolute;top:14px;right:18px;background:none;border:none;color:#666;font-size:22px;cursor:pointer;z-index:1;">&times;</button>';

      // 金额
      h += '<div style="font-size:14px;color:#999;margin-bottom:4px;margin-top:8px;">' + pay + ' · ' + pkg.name + '</div>';
      h += '<div style="font-size:36px;font-weight:800;color:' + payColor + ';margin-bottom:8px;">¥<span id="payAmount">' + pkg.price + '</span></div>';

      // 当前积分余额 + 刷新按钮
      var currentPts = Auth.isLoggedIn() ? Auth.getPoints() : 0;
      h += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px;padding:8px 14px;background:rgba(255,255,255,0.03);border-radius:10px;">';
      h += '<span style="font-size:12px;color:#999;">当前积分：<b style="color:#4da6ff;" id="modalPtsDisplay">' + currentPts + '</b></span>';
      h += '<button id="btnRefreshPtsModal" style="padding:3px 10px;border-radius:12px;font-size:10px;color:#4da6ff;background:rgba(77,166,255,0.08);border:1px solid rgba(77,166,255,0.15);cursor:pointer;">🔄 刷新</button>';
      h += '<div style="font-size:10px;color:#666;">充值后：<b style="color:#5eeeca;">' + (currentPts + pkg.points) + '</b> 积分</div>';
      h += '</div>';

      // 收款二维码
      var qrSrc = localStorage.getItem('aigp_qr_' + (isWechat ? 'wechat' : 'alipay')) || '';
      if (qrSrc) {
        h += '<div style="width:200px;height:200px;margin:0 auto 16px;border-radius:12px;overflow:hidden;border:2px solid rgba(255,255,255,0.08);"><img src="' + qrSrc + '" style="width:100%;height:100%;object-fit:contain;" alt="收款码"></div>';
      } else {
        h += '<div style="width:200px;height:200px;margin:0 auto 16px;background:rgba(255,255,255,0.03);border-radius:12px;display:flex;align-items:center;justify-content:center;border:2px dashed rgba(255,255,255,0.1);">';
        h += '<div style="text-align:center;color:#666;font-size:13px;">📱<br>收款码<br><span style="font-size:10px;">管理员未上传</span></div>';
        h += '</div>';
      }

      // 付款步骤
      h += '<div style="text-align:left;font-size:12px;color:#999;margin-bottom:16px;line-height:2;">';
      h += '<div>1️⃣ 截图保存上方收款码</div>';
      h += '<div>2️⃣ 打开' + pay + '扫一扫</div>';
      h += '<div>3️⃣ 支付 <b style="color:#f0f0f0;">¥' + pkg.price + '</b></div>';
      h += '<div>4️⃣ 返回此页面点击下方按钮</div>';
      h += '</div>';

      // 按钮组
      h += '<button id="btnCopyInfo" style="width:100%;padding:10px;border-radius:10px;font-size:13px;color:#4da6ff;background:rgba(77,166,255,0.08);border:1px solid rgba(77,166,255,0.15);cursor:pointer;margin-bottom:8px;">📋 复制付款信息</button>';
      h += '<button id="btnPaidDone" style="width:100%;padding:12px;border-radius:10px;font-size:14px;font-weight:700;color:#fff;background:linear-gradient(135deg,#5eeeca,#3db8a0);border:none;cursor:pointer;margin-bottom:8px;">✅ 我已完成付款，通知管理员</button>';
      h += '<div style="font-size:11px;color:#666;">管理员确认后积分自动到账</div>';

      h += '</div>';
      overlay.innerHTML = h;
      document.body.appendChild(overlay);

      var close = function() { overlay.remove(); self.render(container); };

      // 复制付款信息
      overlay.querySelector('#btnCopyInfo').addEventListener('click', function() {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(payInfo).then(function() {
            UI.toast('付款信息已复制，请打开' + pay + '完成支付', 'success');
          });
        }
        // 尝试打开支付App
        var scheme = isWechat ? 'weixin://' : 'alipays://platformapi/startapp?saId=10000007';
        var a = document.createElement('a');
        a.href = scheme;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(function() { document.body.removeChild(a); }, 1000);
      });

      // 已付款通知
      overlay.querySelector('#btnPaidDone').addEventListener('click', function() {
        this.textContent = '已通知管理员，等待确认...';
        this.disabled = true;
        this.style.opacity = '0.6';
        UI.toast('已通知管理员审核，请耐心等待', 'success');
        self._showOrders(container);
      });

      // 刷新积分按钮
      var ptsBefore = Auth.isLoggedIn() ? Auth.getPoints() : 0;
      overlay.querySelector('#btnRefreshPtsModal').addEventListener('click', function() {
        var ptsNow = Auth.isLoggedIn() ? Auth.getPoints() : 0;
        var display = overlay.querySelector('#modalPtsDisplay');
        if (display) display.textContent = ptsNow;
        if (ptsNow > ptsBefore) {
          UI.toast('充值已到账！积分：' + ptsBefore + ' → ' + ptsNow, 'success');
          setTimeout(function() { overlay.remove(); self.render(container); }, 1000);
        } else {
          UI.toast('积分未变化，请联系管理员确认', 'error');
          App._showContactModal();
        }
      });

      overlay.querySelector('#closePayModal').addEventListener('click', close);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    },

    _showOrders: function(container) {
      var el = container.querySelector('#orderList');
      var orders = [];
      try { orders = JSON.parse(localStorage.getItem('aigp_orders') || '[]'); } catch(e) {}
      orders = orders.slice(0, 5);
      if (!orders.length) { el.innerHTML = '暂无充值记录'; return; }
      var h = '';
      for (var i = 0; i < orders.length; i++) {
        var o = orders[i];
        h += '<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;">';
        h += '<span>' + o.pkg + ' · ' + o.pay + '</span>';
        h += '<span style="color:' + (o.status === 'paid' ? '#5eeeca' : '#ffb088') + ';">' + (o.status === 'paid' ? '✅ 已到账 ¥' + o.price : '⏳ 待管理员确认') + '</span>';
        h += '</div>';
      }
      el.innerHTML = h;
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['shop'] = module;
})();
