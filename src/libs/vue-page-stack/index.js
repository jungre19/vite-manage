import { VuePageStack, getIndexByKey, getStack } from './components/VuePageStack';
import mixin from './mixin';
import history from './history';
import config from './config/config';
/* eslint-disable */
import S from '@/libs/util' // Some commonly used tools
/* eslint-disable */

function hasKey(query, keyName) {
  return !!query[keyName];
}

function getKey(src) {
  return src.replace(/[xy]/g, function(c) {
    let r = (Math.random() * 16) | 0;
    let v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const VuePageStackPlugin = {};

VuePageStackPlugin.install = function(Vue, { router, name = config.componentName, keyName = config.keyName }) {
  if (!router) {
    throw Error('\n vue-router is necessary. \n\n');
  }
  Vue.component(name, VuePageStack(keyName));

  Vue.prototype.$pageStack = {
    getStack
  };

  mixin(router);

  function beforeEach(to, from, next) {
    if (!hasKey(to.query, keyName)) {
      to.query[keyName] = getKey('xxxxxxxx');
      let replace = history.action === config.replaceName || !hasKey(from.query, keyName);
      next({
        hash: to.hash,
        path: to.path,
        name: to.name,
        params: to.params,
        query: to.query,
        meta: to.meta,
        replace: replace
      });
    } else {
      let r = to.query['r'] == undefined ? '' : to.query['r'];
      r = ''
      let key = to.query[keyName] + r;
      let index = getIndexByKey(key);
      if (index === -1) {
        to.params[keyName + '-dir'] = config.forwardName;
      } else {
        to.params[keyName + '-dir'] = config.backName;
      }
      next({ params: to.params });
    }
  }

  // ensure it's the first beforeEach hook
  router.beforeHooks.unshift(beforeEach);
};

export default VuePageStackPlugin;
