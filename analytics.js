const GOATCOUNTER_ENDPOINT = 'https://jesperva.goatcounter.com/count';

function goatCounterBotHint() {
    if (window.callPhantom || window._phantom || window.phantom) return 150;
    if (window.__nightmare) return 151;
    if (document.__selenium_unwrapped ||
        document.__webdriver_evaluate ||
        document.__driver_evaluate) return 152;
    if (navigator.webdriver) return 153;
    return 0;
}

function goatCounterUrl({path, title, referrer, event = false}) {
    const params = new URLSearchParams();
    params.set('p', path || location.pathname + location.search || '/');
    params.set('t', title || document.title);
    params.set('r', referrer || document.referrer);
    params.set('e', event ? 'true' : 'false');
    params.set('s', String(window.screen.width));
    params.set('b', String(goatCounterBotHint()));
    params.set('q', location.search);
    params.set('rnd', Math.random().toString(36).slice(2, 7));
    return `${GOATCOUNTER_ENDPOINT}?${params}`;
}

function sendGoatCounterHit(data) {
    if (document.visibilityState === 'prerender' ||
        localStorage.getItem('skipgc') === 't') {
        return;
    }

    const url = goatCounterUrl(data);
    if (!navigator.sendBeacon || !navigator.sendBeacon(url)) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.style.position = 'absolute';
        img.style.width = '1px';
        img.style.height = '1px';
        img.style.bottom = '0';
        img.addEventListener('load', () => img.remove(), false);
        document.body.appendChild(img);
    }
}

window.siteAnalytics = {
    countPageView(path, title) {
        sendGoatCounterHit({path, title});
    },
};
