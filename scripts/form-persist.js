/**
 * 表单持久化工具
 * 自动将页面上用户可编辑的表单元素（input/textarea/select）的值保存到 localStorage，
 * 页面刷新或重新打开后自动恢复。
 *
 * 使用方式：在 HTML 页面底部（</body> 前）加一行：
 *   <script src="scripts/form-persist.js"></script>
 */
(function () {
    var filename = decodeURIComponent(location.pathname.split('/').pop()) || 'index';
    var STORAGE_KEY = 'form-persist:' + filename;

    // 单字段最大保存 512KB，超出跳过该字段
    var MAX_FIELD_SIZE = 512 * 1024;

    // 缓存上一次保存的数据，内容没变就不重复写
    var lastSaved = null;

    // 防抖保存
    var saveTimer = null;
    function debounceSave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveAll, 500);
    }

    function shouldPersist(el) {
        if (!el.id) return false;
        var t = el.type;
        if (t === 'hidden' || t === 'password' || t === 'file') return false;
        if (t === 'button' || t === 'submit' || t === 'reset' || t === 'image') return false;
        if (el.readOnly || el.disabled) return false;
        return true;
    }

    function loadData() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveData(data) {
        try {
            var json = JSON.stringify(data);
            // 内容没变就不写
            if (json === lastSaved) return;
            localStorage.setItem(STORAGE_KEY, json);
            lastSaved = json;
        } catch (e) {
            // localStorage 满了就忽略
        }
    }

    function saveAll() {
        var data = {};
        var els = document.querySelectorAll('input, textarea, select');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (!shouldPersist(el)) continue;
            if (el.type === 'checkbox') {
                data[el.id] = { v: el.checked ? '1' : '0', t: 'c' };
            } else if (el.type === 'radio') {
                if (el.checked) data[el.id] = { v: el.value, t: 'r' };
            } else {
                // 超过大小阈值的字段跳过保存
                if (el.value.length > MAX_FIELD_SIZE) continue;
                data[el.id] = { v: el.value, t: 't' };
            }
        }
        saveData(data);
    }

    function restoreAll() {
        var data = loadData();
        var els = document.querySelectorAll('input, textarea, select');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (!shouldPersist(el)) continue;
            var entry = data[el.id];
            if (!entry) continue;
            try {
                if (entry.t === 'c') {
                    el.checked = entry.v === '1';
                } else if (entry.t === 'r') {
                    el.checked = (el.value === entry.v);
                } else {
                    el.value = entry.v;
                }
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            } catch (e) {}
        }
    }

    function bindListeners() {
        var els = document.querySelectorAll('input, textarea, select');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (!shouldPersist(el)) continue;
            el.addEventListener('input', debounceSave);
            el.addEventListener('change', debounceSave);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            restoreAll();
            bindListeners();
        });
    } else {
        restoreAll();
        bindListeners();
    }

    window.addEventListener('beforeunload', saveAll);
})();
