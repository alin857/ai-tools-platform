/* ============================================
   Storage — localStorage 封装
   用于：我的产品、历史记录、用户偏好
   ============================================ */
(function() {
  var STORAGE_KEYS = {
    PRODUCTS: 'aigp_products',
    HISTORY: 'aigp_history',
    PREFERENCES: 'aigp_prefs'
  };

  var Storage = {};

  /* ======== 通用读写 ======== */
  Storage._read = function(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Storage read error:', e);
      return null;
    }
  };

  Storage._write = function(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  };

  /* ======== 我的产品 ======== */
  /**
   * 获取所有产品
   * @returns {Array}
   */
  Storage.getProducts = function() {
    return this._read(STORAGE_KEYS.PRODUCTS) || [];
  };

  /**
   * 添加产品
   * @param {Object} item - { id, name, imageUrl, toolName, createdAt, ... }
   */
  Storage.addProduct = function(item) {
    var products = this.getProducts();
    item.id = item.id || 'prod_' + Date.now();
    item.createdAt = item.createdAt || new Date().toISOString();
    products.unshift(item);
    this._write(STORAGE_KEYS.PRODUCTS, products);
    return item;
  };

  /**
   * 删除产品
   * @param {string} id
   */
  Storage.removeProduct = function(id) {
    var products = this.getProducts();
    var filtered = products.filter(function(p) { return p.id !== id; });
    this._write(STORAGE_KEYS.PRODUCTS, filtered);
  };

  /**
   * 根据工具名筛选产品
   * @param {string} toolName
   * @returns {Array}
   */
  Storage.getProductsByTool = function(toolName) {
    return this.getProducts().filter(function(p) {
      return p.toolName === toolName;
    });
  };

  /* ======== 历史记录 ======== */
  /**
   * 获取所有历史记录
   * @returns {Object} - { toolName: [entries] }
   */
  Storage.getHistory = function() {
    return this._read(STORAGE_KEYS.HISTORY) || {};
  };

  /**
   * 获取指定工具的历史记录
   * @param {string} toolName
   * @returns {Array}
   */
  Storage.getToolHistory = function(toolName) {
    var history = this.getHistory();
    return history[toolName] || [];
  };

  /**
   * 添加历史记录
   * @param {string} toolName
   * @param {Object} entry - { prompt, result, timestamp }
   */
  Storage.addHistory = function(toolName, entry) {
    var history = this.getHistory();
    if (!history[toolName]) {
      history[toolName] = [];
    }
    entry.timestamp = entry.timestamp || new Date().toISOString();
    history[toolName].unshift(entry);

  /**
   * 清空指定工具的历史记录
   * @param {string} toolName
   */
  Storage.clearToolHistory = function(toolName) {
    var history = this.getHistory();
    delete history[toolName];
    this._write(STORAGE_KEYS.HISTORY, history);
  };

    // 每个工具最多保留 50 条
    if (history[toolName].length > 50) {
      history[toolName] = history[toolName].slice(0, 50);
    }

    this._write(STORAGE_KEYS.HISTORY, history);
  };

  /* ======== 用户偏好 ======== */
  Storage.getPreference = function(key, defaultValue) {
    var prefs = this._read(STORAGE_KEYS.PREFERENCES) || {};
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
  };

  Storage.setPreference = function(key, value) {
    var prefs = this._read(STORAGE_KEYS.PREFERENCES) || {};
    prefs[key] = value;
    this._write(STORAGE_KEYS.PREFERENCES, prefs);
  };

  /* ======== 注册到全局 ======== */
  window.Storage = Storage;
})();
