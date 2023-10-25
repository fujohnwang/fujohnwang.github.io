// Modify your tailwind.config.js <- https://www.skcript.com/blog/disable-tailwind-prose-code
const disabledCss = {
	'code::before': false,
	'code::after': false,
	'blockquote p:first-of-type::before': false,
	'blockquote p:last-of-type::after': false,
	pre: false,
	code: false,
	'pre code': false,
	'code::before': false,
	'code::after': false,
}

module.exports = {
    darkMode: 'class',
    content: ['./**/*.html','./templates/**/*.html'],
    plugins: [require('@tailwindcss/typography'),require("daisyui")],
    theme: {
      extend: {
        // typography: {
        //     DEFAULT: {
        //         css: {
        //             "code::before": {content: ''},
        //             "code::after": {content: ''},
        //         }
        //     }
        // }
        typography: {
          DEFAULT: { css: disabledCss },
          sm: { css: disabledCss },
          lg: { css: disabledCss },
          xl: { css: disabledCss },
          '2xl': { css: disabledCss },
          'dark': { css: disabledCss },
          '*': { css: disabledCss },
        },
      }
    },
    daisyui: {
      styled: true,
      themes: true,
      base: true,
      utils: true,
      logs: true,
      rtl: false,
      prefix: "",
      darkTheme: "dark",
      themes: ["light", "dark", "winter"],
    },
}



// other options to disable prose css: 
// - https://nikitagoncharuk.com/blog/my-custom-code-style-for-typography-by-tailwindcss-highlightjs/



