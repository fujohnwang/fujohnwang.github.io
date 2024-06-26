// Set "light" theme as default
if (!localStorage.theme) {
    localStorage.theme = "light";
}

if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

function attachEvent(selector, event, fn) {
    const matches = document.querySelectorAll(selector);
    if (matches && matches.length) {
        matches.forEach((elem) => {
            elem.addEventListener(event, () => fn(elem), false);
        });
    }
}

window.onload = function () {
    attachEvent('[data-toggle-menu]', 'click', function (elem) {
        elem.classList.toggle('expanded');
        document.body.classList.toggle('overflow-hidden');
        document.getElementById('header')?.classList.toggle('h-screen');
        document.querySelector('#header nav')?.classList.toggle('hidden');
    });

    attachEvent('[data-toggle-color-scheme]', 'click', function () {
        document.documentElement.classList.toggle('dark');
        localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

};
window.onpageshow = function () {
    const elem = document.querySelector('[data-toggle-menu]');
    if (elem) {
        elem.classList.remove('expanded');
    }
    document.body.classList.remove('overflow-hidden');
    document.getElementById('header')?.classList.remove('h-screen');
    document.querySelector('#header nav')?.classList.add('hidden');
};