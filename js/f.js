function onSubmitX(data, setStatus, spinner) {
    data["client"] = "6b7ae91b-4b0a-481b-a7a0-7344c02da3d6";
    setStatus(spinner);
    return data;
};

function overlayOn() {
    document.getElementById("actionBtn").disabled = true
    document.getElementById("overlay").style.display = "block";
}

function overlayOff() {
    document.getElementById("actionBtn").disabled = false
    document.getElementById("overlay").style.display = "none";
}

