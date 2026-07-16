/* ============================================
   登录/注册页面
   ============================================ */
(function() {
  var module = {
    name: 'login',
    title: '登录',

    mode: 'login', // 'login' | 'register'

    render: function(container) {
      container.innerHTML = this._buildHTML();
      this._bindEvents(container);
    },

    _buildHTML: function() {
      var h = '';
      var isLogin = this.mode === 'login';

      h += '<div style="max-width:400px;margin:40px auto 0;">';

      // 头像区
      h += '<div style="text-align:center;margin-bottom:24px;">';
      h += '<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#4da6ff,#7c5cfc);display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px;">🤖</div>';
      h += '<div style="font-size:20px;font-weight:700;color:#f0f0f0;">AI 工具聚合平台</div>';
      h += '<div style="font-size:12px;color:#666;margin-top:4px;">' + (isLogin ? '欢迎回来' : '创建账号，领取100积分') + '</div>';
      h += '</div>';

      // 表单
      h += '<div class="tool-input-area">';
      h += '<div style="margin-bottom:14px;">';
      h += '<div class="tool-input-area__label">👤 用户名</div>';
      h += '<input type="text" id="loginUser" class="tool-textarea" placeholder="请输入用户名" style="min-height:auto;height:44px;padding:10px 14px;">';
      h += '</div>';
      h += '<div style="margin-bottom:14px;">';
      h += '<div class="tool-input-area__label">🔒 密码</div>';
      h += '<input type="password" id="loginPass" class="tool-textarea" placeholder="请输入密码（至少6位）" style="min-height:auto;height:44px;padding:10px 14px;">';
      h += '</div>';

      if (!isLogin) {
        h += '<div style="margin-bottom:14px;">';
        h += '<div class="tool-input-area__label">🔒 确认密码</div>';
        h += '<input type="password" id="loginPass2" class="tool-textarea" placeholder="再次输入密码" style="min-height:auto;height:44px;padding:10px 14px;">';
        h += '</div>';
      }

      h += '<button class="btn-generate" id="btnSubmit">' + (isLogin ? '登录' : '注册') + '</button>';
      h += '</div>';

      // 切换
      h += '<div style="text-align:center;margin-top:14px;font-size:13px;color:#999;">';
      if (isLogin) {
        h += '没有账号？<button id="btnSwitch" style="color:#4da6ff;background:none;border:none;cursor:pointer;font-size:13px;">立即注册</button>';
      } else {
        h += '已有账号？<button id="btnSwitch" style="color:#4da6ff;background:none;border:none;cursor:pointer;font-size:13px;">去登录</button>';
      }
      h += '</div>';

      h += '</div>';

      return h;
    },

    _bindEvents: function(container) {
      var self = this;

      container.querySelector('#btnSubmit').addEventListener('click', function() {
        var user = container.querySelector('#loginUser').value.trim();
        var pass = container.querySelector('#loginPass').value.trim();

        if (self.mode === 'register') {
          var pass2 = container.querySelector('#loginPass2').value.trim();
          if (pass !== pass2) { UI.toast('两次密码不一致', 'error'); return; }
          var result = Auth.register(user, pass);
          UI.toast(result.msg, result.ok ? 'success' : 'error');
          if (result.ok) {
            Auth.login(user, pass);
            Router.navigate('#/');
            setTimeout(function() { location.reload(); }, 300);
          }
        } else {
          var result = Auth.login(user, pass);
          UI.toast(result.msg, result.ok ? 'success' : 'error');
          if (result.ok) {
            Router.navigate('#/');
            setTimeout(function() { location.reload(); }, 300);
          }
        }
      });

      container.querySelector('#btnSwitch').addEventListener('click', function() {
        self.mode = self.mode === 'login' ? 'register' : 'login';
        self.render(container);
      });

      // 回车提交
      container.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') container.querySelector('#btnSubmit').click();
      });
    },

    destroy: function() {}
  };

  window.__modules__ = window.__modules__ || {};
  window.__modules__['login'] = module;
})();
