const shell = require("shelljs");

function pathfinder(path) {
  if (path === "" || null) {
    return path;
  }

  if (path[0] != "." && path[1] != "/") {
    return `./${path}`;
  }

  console.log(path);
  return path;
}

exports.makeFolder = (name, URI, componentOrPage) => {
  const isPage = componentOrPage === "page";
  const shellPath = isPage
    ? `${URI.pageURI}${name}`
    : `${URI.componentURI}${name}`;
  shell.mkdir("-p", shellPath);
  shell.touch(`${shellPath}/${name}.js`);
  shell.touch(`${shellPath}/${name}.scss`);
  shell.touch(`${shellPath}/${name}.vue`);
  shell
    .echo(
      `<template>
<div class="${name}-root">
  ${name} Coming Soon..
</div>
</template> \n
<script src="./${name}.js" scoped></script>
<style lang="scss" scoped> @import './${name}.scss'</style>`
    )
    .to(`${shellPath}/${name}.vue`);

  shell
    .echo(`export default {\n name: "${name}" \n }`)
    .to(`${shellPath}/${name}.js`);

  shell.echo(`.${name}-root {}`).to(`${shellPath}/${name}.scss`);
};

exports.makeSingle = (name, URI, componentOrPage) => {
  const isPage = componentOrPage === "page";
  const shellPath = isPage
    ? `${URI.pageURI}${name}`
    : `${URI.componentURI}${name}`;
  shell.touch(`${shellPath}${name}.vue`);
  shell.echo(
    `<template>
<div class="${name}-root">
  ${name} Coming Soon..
</div>
</template> \n
<script>
export default {\n name: "${name}" \n }
</script>
<style>
  .${name}-root: {}
</style>`
  );
};

exports.makeUnitTests = (name, path, meta) => {
  const shellPath =
    path.unitURI === "" ? `./${name}` : `${path.unitURI}${name}`;
  const vuex = meta.includes("vuex");
  shell.mkdir("-p", shellPath);
  shell
    .echo(
      `
/* global it, describe */
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import ${name} from '@/${path.componentURI.slice(2)}${name}/${name}.vue'
${vuex ? "import Vuex from 'vuex'" : ""}
import { expect } from 'chai'
import router from '@/router'
\n
const localVue = createLocalVue()
localVue.use(VueRouter)
${vuex ? "localVue.use(Vuex)" : ""}
\n
describe('${name} Component', () => {

    let wrapper

    ${
      vuex
        ? `const store = new Vuex.Store({
        state: {
        },
        getters: {
        },
        mutations: {
        },
        actions: {
        }
    })`
        : ""
    }

    beforeEach(() => {
        wrapper = shallowMount(${name}, {
            router,
            localVue,
            ${vuex ? "store" : ""}
        })
    })

    it('Renders the component', () => {
        expect(wrapper.html()).not.to.equal(undefined)
    })

})
    `
    )
    .to(`${shellPath}/${name}.spec.js`);
};

exports.checkFile = path => {
  if (shell.test("-e", path)) {
    const info = shell.cat(path);
    const infoObj = JSON.parse(info.stdout);
    return infoObj;
  } else {
    return "NO_URI";
  }
};

exports.checkorMakeFile = path => {
  if (shell.test("-e", path)) {
    // get info
    const info = shell.cat(path); //.stdout;
    const infoObj = JSON.parse(info.stdout);
    return infoObj;
  } else {
    shell.touch(path);
    const baseInfo = { componentURI: "", unitTestURI: "", pageURI: "" };
    const info = JSON.stringify(baseInfo);
    shell.echo(info).to(path);
    return {};
  }
};

exports.updateConfigFile = object => {
  const info = JSON.stringify(object);
  shell.echo(info).to("./vuegen_config.js");
};

exports.retrieveConfigFile = () => {
  const data = shell.cat("./vuegen_config.js");
  const dataObj = JSON.parse(data.stdout);
  console.log(`Component URI: ${dataObj.componentURI}`);
  console.log(`Unit Test URI: ${dataObj.unitURI}`);
  console.log(`Page URI: ${dataObj.pageURI}`);
};
