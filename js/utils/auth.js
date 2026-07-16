/* ============================================
   Auth — 用户系统（localStorage）
   注册/登录/积分/签到
   ============================================ */
(function() {
  var Auth = {};

  Auth.USERS_KEY = 'aigp_users';
  Auth.CURRENT_KEY = 'aigp_current_user';
  Auth.INIT_POINTS = 100;
  Auth.SIGNIN_POINTS = 50;
  Auth.IMAGE_COST = 1;
  Auth.VIDEO_COST = 5;

  /* ======== 获取所有用户 ======== */
  Auth._users = function() {
    try { return JSON.parse(localStorage.getItem(this.USERS_KEY)) || {}; }
    catch(e) { return {}; }
  };

  Auth._saveUsers = function(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  };

  /* ======== 当前用户 ======== */
  Auth.currentUser = function() {
    return localStorage.getItem(this.CURRENT_KEY) || null;
  };

  Auth.isLoggedIn = function() {
    return !!this.currentUser();
  };

  /* ======== 注册 ======== */
  Auth.register = function(username, password) {
    username = username.trim();
    if (!username || username.length < 2) return { ok: false, msg: '用户名至少2个字符' };
    if (!password || password.length < 6) return { ok: false, msg: '密码至少6个字符' };
    var users = this._users();
    if (users[username]) return { ok: false, msg: '用户名已存在' };
    users[username] = {
      password: password,
      points: this.INIT_POINTS,
      lastSignIn: null,
      createdAt: new Date().toISOString()
    };
    this._saveUsers(users);
    return { ok: true, msg: '注册成功！初始积分：' + this.INIT_POINTS };
  };

  /* ======== 登录 ======== */
  Auth.login = function(username, password) {
    username = username.trim();
    var users = this._users();
    var user = users[username];
    if (!user) return { ok: false, msg: '用户不存在' };
    if (user.password !== password) return { ok: false, msg: '密码错误' };
    localStorage.setItem(this.CURRENT_KEY, username);
    return { ok: true, msg: '登录成功' };
  };

  /* ======== 登出 ======== */
  Auth.logout = function() {
    localStorage.removeItem(this.CURRENT_KEY);
  };

  /* ======== 积分 ======== */
  Auth.getPoints = function() {
    var username = this.currentUser();
    if (!username) return 0;
    var users = this._users();
    return (users[username] && users[username].points) || 0;
  };

  Auth._updatePoints = function(username, delta) {
    var users = this._users();
    if (!users[username]) return false;
    users[username].points = Math.max(0, (users[username].points || 0) + delta);
    this._saveUsers(users);
    return true;
  };

  /* ======== 扣积分 ======== */
  Auth.canAfford = function(cost) {
    return this.getPoints() >= cost;
  };

  Auth.deduct = function(cost, reason) {
    var username = this.currentUser();
    if (!username) return false;
    if (!this.canAfford(cost)) return false;
    this._updatePoints(username, -cost);
    // 触发积分更新事件
    if (window._onPointsChange) window._onPointsChange(this.getPoints());
    return true;
  };

  /* ======== 签到 ======== */
  Auth.signIn = function() {
    var username = this.currentUser();
    if (!username) return { ok: false, msg: '请先登录' };
    var users = this._users();
    var user = users[username];
    var today = new Date().toDateString();
    if (user.lastSignIn === today) return { ok: false, msg: '今天已签到，明天再来' };
    user.lastSignIn = today;
    user.points = (user.points || 0) + this.SIGNIN_POINTS;
    this._saveUsers(users);
    if (window._onPointsChange) window._onPointsChange(user.points);
    return { ok: true, msg: '签到成功！+' + this.SIGNIN_POINTS + ' 积分，当前：' + user.points };
  };

  Auth.signedInToday = function() {
    var username = this.currentUser();
    if (!username) return false;
    var users = this._users();
    var user = users[username];
    return user && user.lastSignIn === new Date().toDateString();
  };

  /* ======== 获取用户信息 ======== */
  Auth.getUserInfo = function() {
    var username = this.currentUser();
    if (!username) return null;
    var users = this._users();
    var user = users[username];
    return user ? { username: username, points: user.points, lastSignIn: user.lastSignIn, createdAt: user.createdAt } : null;
  };

  window.Auth = Auth;
})();
