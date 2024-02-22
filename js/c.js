function ShowRandomPic(){
	$("#Armageddon img").attr("src","");
	$("#Armageddon img").attr("src","../images/Armageddon.webp");
	$("#Armageddon").css("display","block");
	if(!$("#Armageddon")[0]){
		$("body").append('<div id="Armageddon"></div>');
		$("#Armageddon").css("height",$(window).height());
		$("#Armageddon").css("width",(Math.ceil($(window).width()/200))*200);
		imgA=Math.floor((($(window).height()+200)*($(window).width()+100))/40000);
		for(var i = 1; i <= imgA; i++){
			$("#Armageddon").append('<img src="">');
		}
	}
	setTimeout('$("#Armageddon").css("display","none")', 500);
}

