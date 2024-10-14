function onSubmitX(data, setStatus, spinner) {
    data["client"] = "6b7ae91b-4b0a-481b-a7a0-7344c02da3d6";
    setStatus(spinner);
    return data;
};

const fOverlayDefaultId = "f-overlay"
function overlayOn(id) {
    let overlayId = fOverlayDefaultId
    if (id) {
        overlayId = id
    }
    // document.getElementById("actionBtn").disabled = true
    document.getElementById(overlayId).style.display = "block";
}

function overlayOff() {
    let overlayId = fOverlayDefaultId
    if (id) {
        overlayId = id
    }
    // document.getElementById("actionBtn").disabled = false
    document.getElementById("overlayId").style.display = "none";
}

function f_uuid() {
    return crypto.randomUUID();
}

function isMobileUA() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return regex.test(navigator.userAgent);
}
function hasTouchSupport() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
function isMobileWindowSize() {
    const minWidth = 768; // Minimum width for desktop devices
    return window.innerWidth < minWidth || screen.width < minWidth;
}

function isMobile() {
    return (isMobileUA() && hasTouchSupport() && isMobileWindowSize());
}

function isWx() {
    return (isMobile() && (/(micromessenger|webbrowser)/.test(navigator.userAgent.toLocaleLowerCase())));
}

function dispatchLink(wxLink, mbLink, webLink) {
    if (isWx()) {
        return wxLink;
    } else if (isMobile()) {
        return mbLink;
    } else {
        return webLink;
    }
}

// onclick="playSound(this,'https://hulk.afoo.me/mp3/%E7%A2%8E%E9%93%B6%E5%87%A0%E4%B8%A4.mp3')"
function playOrPause(el,soundfile) {
    if (el.mp3) {
        if(el.mp3.paused) el.mp3.play();
        else el.mp3.pause();
    } else {
        el.mp3 = new Audio(soundfile);
        el.mp3.play();
    }
}
