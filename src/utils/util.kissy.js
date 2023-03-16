/**
 *  KISSY FUNCTIONS
 *  @see http://docs.kissyui.com/1.4/docs/html/api/index.html
 *  @author lishumingoo@gmail.com
 */

const KISSY = (function () {
  let S;

  S = {

    /**
     * 检查变量类型
     * @param o
     * @returns {string}
     */
    type: (o) => {
      let class2type = {}
      return o == null ?
        String(o) :
        class2type[toString.call(o)] || 'object'
    },

    /**
     * 检查变量是否为null
     * @param o
     * @returns {boolean}
     */
    isNull: (o) => {
      return o === null || o == 'null'
    },

    /**
     * 检查变量是否等于 undefined
     * @param o
     * @returns {boolean}
     */
    isUndefined: (o) => {
      return o === undefined;
    },

    /**
     * 检查是否为空对象
     * @param o
     * @returns {boolean}
     */
    isEmptyObject: (o) => {
      for (let p in o) {
        if (p !== undefined) {
          return false;
        }
      }
      return true;
    },

    isPlainObject: (obj) => {
      function hasOwnProperty(o, p) {
        return Object.prototype.hasOwnProperty.call(o, p);
      }

      if (!obj || S.type(obj) !== 'object' || obj.nodeType ||
        obj.window == obj) {
        return false;
      }

      let key, objConstructor;

      try {
        if ((objConstructor = obj.constructor) && !hasOwnProperty(obj, 'constructor') && !hasOwnProperty(objConstructor.prototype, 'isPrototypeOf')) {
          return false;
        }
      } catch (e) {
        return false;
      }

      return ((key === undefined) || hasOwnProperty(obj, key));
    },

    indexOf: (item, arr) => {
      for (let i = 0, len = arr.length; i < len; ++i) {
        if (arr[i] === item) {
          return i;
        }
      }
      return -1;
    },

    lastIndexOf: (item, arr) => {
      let i = 0
      for (i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === item) {
          break;
        }
      }
      return i;
    },

    unique: function (a, override) {
      let b = a.slice();
      if (override) {
        b.reverse();
      }
      let i = 0,
        n,
        item;

      while (i < b.length) {
        item = b[i];
        while ((n = S.lastIndexOf(item, b)) !== i) {
          b.splice(n, 1);
        }
        i += 1;
      }

      if (override) {
        b.reverse();
      }
      return b;
    },


    inArray: (item, arr) => {
      return S.indexOf(item, arr) > -1;
    },

    isArray: Array.isArray || S.isArray,

    keys: (o) => {
      let result = [], p;
      for (p in o) {
        if (o.hasOwnProperty(p)) {
          result.push(p);
        }
      }
      return result;
    },

    makeArray: function (o) {
      if (o == null) {
        return [];
      }
      if (S.isArray(o)) {
        return o;
      }
      let lengthType = typeof o.length,
        oType = typeof o;
      // The strings and functions also have 'length'
      if (lengthType !== 'number' ||
        // form.elements in ie78 has nodeName 'form'
        // then caution select
        // o.nodeName
        // window
        o.alert ||
        oType === 'string' ||
        // https://github.com/ariya/phantomjs/issues/11478
        (oType === 'function' && !('item' in o && lengthType === 'number'))) {
        return [o];
      }
      let ret = [];
      for (let i = 0, l = o.length; i < l; i++) {
        ret[i] = o[i];
      }
      return ret;
    }

  };

  (function (S) {
    let MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR'

    mix(S, {
      mix: function (r, s, ov, wl, deep) {
        if (typeof ov === 'object') {
          wl = /**
           @ignore
           @type {String[]|Function}
           */ov.whitelist;
          deep = ov.deep;
          ov = ov.overwrite;
        }

        if (wl && (typeof wl !== 'function')) {
          let originalWl = wl;
          wl = function (name, val) {
            return S.inArray(name, originalWl) ? val : undefined;
          };
        }

        if (ov === undefined) {
          ov = true;
        }

        let cache = [],
          c,
          i = 0;
        mixInternal(r, s, ov, wl, deep, cache);
        while ((c = cache[i++])) {
          delete c[MIX_CIRCULAR_DETECTION];
        }
        return r;
      },

      merge: function (varArgs) {
        varArgs = S.makeArray(arguments);
        let o = {},
          i,
          l = varArgs.length;
        for (i = 0; i < l; i++) {
          S.mix(o, varArgs[i]);
        }
        return o;
      },
    })


    function mix(r, s) {
      for (let i in s) {
        r[i] = s[i];
      }
    }

    function mixInternal(r, s, ov, wl, deep, cache) {
      if (!s || !r) {
        return r;
      }
      let i, p, keys, len;

      // 记录循环标志
      s[MIX_CIRCULAR_DETECTION] = r;

      // 记录被记录了循环标志的对像
      cache.push(s);

      // mix all properties
      keys = S.keys(s);
      len = keys.length;
      for (i = 0; i < len; i++) {
        p = keys[i];
        if (p !== MIX_CIRCULAR_DETECTION) {
          // no hasOwnProperty judge!
          _mix(p, r, s, ov, wl, deep, cache);
        }
      }

      return r;
    }

    function _mix(p, r, s, ov, wl, deep, cache) {
      // 要求覆盖
      // 或者目的不存在
      // 或者深度mix
      if (ov || !(p in r) || deep) {
        var target = r[p],
          src = s[p];
        // prevent never-end loop
        if (target === src) {
          // S.mix({},{x:undefined})
          if (target === undefined) {
            r[p] = target;
          }
          return;
        }
        if (wl) {
          src = wl.call(s, p, src);
        }
        // 来源是数组和对象，并且要求深度 mix
        if (deep && src && (S.isArray(src) || S.isPlainObject(src))) {
          if (src[MIX_CIRCULAR_DETECTION]) {
            r[p] = src[MIX_CIRCULAR_DETECTION];
          } else {
            // 目标值为对象或数组，直接 mix
            // 否则 新建一个和源值类型一样的空数组/对象，递归 mix
            var clone = target && (S.isArray(target) || S.isPlainObject(target)) ?
              target :
              (S.isArray(src) ? [] : {});
            r[p] = clone;
            mixInternal(clone, src, ov, wl, true, cache);
          }
        } else if (src !== undefined && (ov || !(p in r))) {
          r[p] = src;
        }
      }
    }

  })(S);

  return S
})();
export default KISSY;
