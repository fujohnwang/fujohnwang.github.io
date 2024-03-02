function onSubmitX(data, setStatus, spinner) {
    data["client"] = "6b7ae91b-4b0a-481b-a7a0-7344c02da3d6";
    setStatus(spinner);
    return data;
};

const fOverlayDefaultId = "f-overlay"
function overlayOn(id) {
    let overlayId = fOverlayDefaultId
    if(id){
        overlayId = id
    }
    // document.getElementById("actionBtn").disabled = true
    document.getElementById(overlayId).style.display = "block";
}

function overlayOff() {
    let overlayId = fOverlayDefaultId
    if(id){
        overlayId = id
    }
    // document.getElementById("actionBtn").disabled = false
    document.getElementById("overlayId").style.display = "none";
}

