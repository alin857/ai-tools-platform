/* ============================================
   管理后台 — 用户管理+积分调整+充值审核
   默认密码: admin123
   ============================================ */
(function() {
  var module = {
    name: 'admin',
    title: '管理后台',
    adminPass: 'admin123',
    authed: false,

    render: function(container) {
      if (!this.authed) { this._renderLogin(container); return; }
      this._renderPanel(container);
    },

    _renderLogin: function(container) {
      var h = '';
      h += '<div style="max-width:360px;margin:40px auto 0;">';
      h += '<div style="text-align:center;margin-bottom:20px;"><div style="font-size:40px;">🔐</div><div style="font-size:18px;font-weight:700;color:#f0f0f0;margin-top:8px;">管理后台</div></div>';
      h += '<div class="tool-input-area">';
      h += '<div class="tool-input-area__label">管理员密码</div>';
      h += '<input type="password" id="adminPass" class="tool-textarea" placeholder="请输入管理密码" style="min-height:auto;height:44px;padding:10px 14px;">';
      h += '<button class="btn-generate" id="btnAdminLogin" style="margin-top:12px;">登录后台</button>';
      h += '</div></div>';
      container.innerHTML = h;

      var self = this;
      container.querySelector('#btnAdminLogin').addEventListener('click', function() {
        var pass = container.querySelector('#adminPass').value;
        if (pass === self.adminPass) { self.authed = true; self.render(container); }
        else { UI.toast('密码错误', 'error'); }
      });
    },

    _renderPanel: function(container) {
      var users = {};
      try { users = JSON.parse(localStorage.getItem('aigp_users') || '{}'); } catch(e) {}
      var orders = [];
      try { orders = JSON.parse(localStorage.getItem('aigp_orders') || '[]'); } catch(e) {}
      var userList = Object.keys(users);

      var h = '';
      h += '<div class="tool-header"><button class="tool-header__back" onclick="Router.navigate(\'#/\')">←</button><div class="tool-header__title">🔐 管理后台</div></div>';

      // 统计卡片
      h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">';
      h += '<div style="padding:14px;background:#1a1a1e;border-radius:10px;text-align:center;"><div style="font-size:22px;font-weight:800;color:#4da6ff;">' + userList.length + '</div><div style="font-size:11px;color:#999;">注册用户</div></div>';
      var totalPaid = orders.filter(function(o) { return o.status === 'paid'; }).length;
      h += '<div style="padding:14px;background:#1a1a1e;border-radius:10px;text-align:center;"><div style="font-size:22px;font-weight:800;color:#5eeeca;">' + totalPaid + '</div><div style="font-size:11px;color:#999;">充值订单</div></div>';
      var todaySigns = userList.filter(function(u) { return users[u].lastSignIn === new Date().toDateString(); }).length;
      h += '<div style="padding:14px;background:#1a1a1e;border-radius:10px;text-align:center;"><div style="font-size:22px;font-weight:800;color:#ffd700;">' + todaySigns + '</div><div style="font-size:11px;color:#999;">今日签到</div></div>';
      h += '</div>';

      // 用户列表
      h += '<div class="tool-input-area__label" style="margin-bottom:8px;">👥 用户管理</div>';
      if (!userList.length) { h += '<div style="font-size:12px;color:#666;padding:16px;">暂无注册用户</div>'; }
      else {
        for (var i = 0; i < userList.length; i++) {
          var uname = userList[i];
          var u = users[uname];
          h += '<div style="padding:12px;margin-bottom:8px;background:#1a1a1e;border-radius:10px;border:1px solid rgba(255,255,255,0.06);">';
          h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
          h += '<div><span style="font-weight:600;color:#f0f0f0;">' + uname + '</span><span style="font-size:10px;color:#666;margin-left:8px;">注册: ' + new Date(u.createdAt).toLocaleDateString('zh-CN') + '</span></div>';
          h += '<span style="font-size:11px;color:#ffb088;">' + (u.lastSignIn === new Date().toDateString() ? '✅ 已签到' : '⏳ 未签到') + '</span>';
          h += '</div>';
          h += '<div style="display:flex;gap:8px;align-items:center;">';
          h += '<span style="font-size:13px;color:#4da6ff;font-weight:600;">💰 ' + (u.points || 0) + ' 积分</span>';
          h += '<input type="number" class="pts-input" data-user="' + uname + '" value="' + (u.points || 0) + '" style="flex:1;padding:6px 10px;border-radius:6px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:#e0e0e0;font-size:12px;">';
          h += '<button class="btn-save-pts" data-user="' + uname + '" style="padding:6px 12px;border-radius:6px;font-size:11px;color:#fff;background:#4da6ff;border:none;cursor:pointer;">保存</button>';
          h += '<button class="btn-del-user" data-user="' + uname + '" style="padding:6px 10px;border-radius:6px;font-size:11px;color:#ff6b6b;background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.15);cursor:pointer;">删除</button>';
          h += '</div></div>';
        }
      }

      // 充值审核
      var pendingOrders = orders.filter(function(o) { return o.status === 'pending'; });
      if (pendingOrders.length) {
        h += '<div style="margin-top:20px;">';
        h += '<div class="tool-input-area__label" style="margin-bottom:8px;">📋 待审核充值</div>';
        for (var j = 0; j < pendingOrders.length; j++) {
          var po = pendingOrders[j];
          h += '<div style="padding:10px;margin-bottom:6px;background:rgba(255,140,66,0.05);border-radius:8px;border:1px solid rgba(255,140,66,0.1);display:flex;justify-content:space-between;align-items:center;font-size:12px;">';
          h += '<span>' + po.pkg + ' · ¥' + po.price + ' · ' + po.pay + '</span>';
          h += '<button class="btn-approve" data-oid="' + po.id + '" data-pkg="' + po.pkg + '" style="padding:5px 12px;border-radius:6px;font-size:11px;color:#fff;background:#5eeeca;border:none;cursor:pointer;">确认到账</button>';
          h += '</div>';
        }
        h += '</div>';
      }

      // === API 配置 ===
      var cfg = window.API ? API._config : {};
      var fields = [
        { key: 'apiKey', label: '🔑 API 密钥', type: 'password' },
        { key: 'baseURL', label: '🌐 API 地址', type: 'text' },
        { key: 'imageModel', label: '🎨 图片模型', type: 'text' },
        { key: 'videoModel', label: '🎬 视频模型', type: 'text' },
        { key: 'textModel', label: '📝 文本模型', type: 'text' }
      ];
      h += '<div style="margin-top:20px;"><div class="tool-input-area__label" style="margin-bottom:8px;">⚙️ API 配置</div>';
      h += '<div style="padding:14px;background:#1a1a1e;border-radius:10px;border:1px solid rgba(255,255,255,0.06);">';
      for (var f = 0; f < fields.length; f++) {
        var fd = fields[f];
        h += '<div style="margin-bottom:10px;"><div style="font-size:11px;color:#999;margin-bottom:4px;">' + fd.label + '</div>';
        h += '<input type="' + fd.type + '" class="cfg-input" data-key="' + fd.key + '" value="' + (cfg[fd.key] || '').replace(/"/g,'&quot;') + '" style="width:100%;padding:8px 12px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:#e0e0e0;font-size:12px;"></div>';
      }
      h += '<div style="display:flex;gap:8px;">';
      h += '<button id="btnSaveCfg" style="flex:1;padding:8px;border-radius:8px;font-size:12px;color:#fff;background:#4da6ff;border:none;cursor:pointer;">💾 保存配置</button>';
      h += '<button id="btnTestCfg" style="flex:1;padding:8px;border-radius:8px;font-size:12px;color:#999;background:#1a1a1e;border:1px solid rgba(255,255,255,0.06);cursor:pointer;">🧪 测试连接</button>';
      h += '</div><div id="testResult" style="margin-top:8px;font-size:11px;"></div>';
      h += '</div></div>';

      h += '<button id="btnAdminLogout" style="width:100%;margin-top:16px;padding:10px;border-radius:8px;font-size:12px;color:#ff6b6b;background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.15);cursor:pointer;">退出后台</button>';

      container.innerHTML = h;
      this._bindPanelEvents(container);
    },

    _bindPanelEvents: function(container) {
      var self = this;

      // 保存积分
      var saveBtns = container.querySelectorAll('.btn-save-pts');
      for (var i = 0; i < saveBtns.length; i++) {
        saveBtns[i].addEventListener('click', function() {
          var uname = this.getAttribute('data-user');
          var input = container.querySelector('.pts-input[data-user="' + uname + '"]');
          var newPts = parseInt(input.value);
          if (isNaN(newPts) || newPts < 0) { UI.toast('积分格式错误', 'error'); return; }
          var users = {};
          try { users = JSON.parse(localStorage.getItem('aigp_users') || '{}'); } catch(e) {}
          if (users[uname]) { users[uname].points = newPts; localStorage.setItem('aigp_users', JSON.stringify(users)); UI.toast(uname + ' 积分已更新为 ' + newPts, 'success'); }
        });
      }

      // 删除用户
      var delBtns = container.querySelectorAll('.btn-del-user');
      for (var j = 0; j < delBtns.length; j++) {
        delBtns[j].addEventListener('click', function() {
          var uname = this.getAttribute('data-user');
          var users = {};
          try { users = JSON.parse(localStorage.getItem('aigp_users') || '{}'); } catch(e) {}
          delete users[uname];
          localStorage.setItem('aigp_users', JSON.stringify(users));
          UI.toast('已删除 ' + uname, 'success');
          self.render(container);
        });
      }

      // 审核通过
      var approveBtns = container.querySelectorAll('.btn-approve');
      for (var k = 0; k < approveBtns.length; k++) {
        approveBtns[k].addEventListener('click', function() {
          var oid = this.getAttribute('data-oid');
          var orders = [];
          try { orders = JSON.parse(localStorage.getItem('aigp_orders') || '[]'); } catch(e) {}
          for (var o = 0; o < orders.length; o++) {
            if (orders[o].id === oid) { orders[o].status = 'paid'; break; }
          }
          localStorage.setItem('aigp_orders', JSON.stringify(orders));
          UI.toast('已确认到账', 'success');
          self.render(container);
        });
      }

      // API 保存
      var saveCfg = container.querySelector('#btnSaveCfg');
      if (saveCfg) saveCfg.addEventListener('click', function() {
        var config = {};
        var inputs = container.querySelectorAll('.cfg-input');
        for (var ci = 0; ci < inputs.length; ci++) {
          config[inputs[ci].getAttribute('data-key')] = inputs[ci].value.trim();
        }
        API.saveConfig(config);
        UI.toast('API 配置已保存', 'success');
      });

      // API 测试
      var testCfg = container.querySelector('#btnTestCfg');
      if (testCfg) testCfg.addEventListener('click', function() {
        var tr = container.querySelector('#testResult');
        tr.innerHTML = '<span style="color:#999;">测试中...</span>';
        var testURL = (container.querySelector('[data-key="baseURL"]') || {}).value || API._config.baseURL;
        var testKey = (container.querySelector('[data-key="apiKey"]') || {}).value || API._config.apiKey;
        fetch(testURL + '/models', { headers: { 'Authorization': 'Bearer ' + testKey } })
          .then(function(r) { return r.json(); })
          .then(function(d) {
            if (d && d.data) { tr.innerHTML = '<span style="color:#5eeeca;">✅ 连接成功 — ' + d.data.length + ' 个模型</span>'; }
            else { tr.innerHTML = '<span style="color:#ff6b6b;">❌ 响应异常</span>'; }
          })
          .catch(function() { tr.innerHTML = '<span style="color:#ff6b6b;">❌ 连接失败，请检查地址和密钥</span>'; });
      });

      // 退出
      container.querySelector('#btnAdminLogout').addEventListener('click', function() {
        self.authed = false;
        self.render(container);
      });
    },

    destroy: function() { this.authed = false; }
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['admin'] = module;
})();
