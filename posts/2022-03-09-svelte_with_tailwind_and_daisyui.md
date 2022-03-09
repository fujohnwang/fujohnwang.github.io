% Svelte with tailwind and daisyui
% 王福强
% 2022-03-09

要在svelte里使用tailwind和daisyui， 首先我们要安装依赖：

```bash
npx degit sveltejs/template __prj__
npm install -D tailwindcss daisyui postcss autoprefixer svelte-preprocess
npm install
npx tailwindcss init
```

然后我们开始配置...

配置tailwind.config.js(这个文件已经由`npx tailwindcss init`创建):

```js
module.exports = {
    content: ['./src/**/*.{svelte,js,ts}', './public/index.html'],
    plugins: [require('daisyui')],
    future: {
        purgeLayersByDefault: true,
        removeDeprecatedGapUtilities: true,
    },
    purge: {
        content: ['./src/**/*.{svelte,js,ts}', './public/index.html'],
        enabled: true
    },
};
```

配置rollup.config.js：

```js
import sveltePreprocess from 'svelte-preprocess';
...

plugins: [
		svelte({
			preprocess: sveltePreprocess({
				sourceMap: !production,
				postcss: {
					plugins: [require('tailwindcss')(), require('autoprefixer')()],
				},
			}),
			...
		}),
		...
```

最后，在顶层的.svelte文件（比如App.svelte）里添加如下内容：

```html
<style lang="postcss" global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
```

好啦，直接像往常那样`npm run dev`就可以开玩了，svelte配合上tailwind和daisyui，绝配！






