// jquery required
function castArmageddon(){
	$("#Armageddon").css("display","block");
  let imgUrl = `url("https://afoo.me/images/Armageddon.webp?ts=${new Date().getTime()}")`
  $("#Armageddon").css('background-image',imgUrl)
	setTimeout('$("#Armageddon").css("display","none")', 1200); // time matter, animation 
}