// global vars
var _log0, _log;
//Server utils

function find_str_step(str)
{
	if (i >= memsize) {
		dbg("Out of limits! i: 0x" + i.toString(16).toUpperCase());
		return;
	}
	var strlen = str.length;
	dbg("Pos: 0x" + i.toString(16).toUpperCase());
	var n = i;
	do {
		n = find_str_n(n, STEP, str);
		if (n > 0) {
			sendmsg("0x" + n.toString(16) + ": " + get_stringz(n));
			n += strlen;
		} else {
			break;
		}
	} while (n >= 0);
	i += STEP;
}

function send_disasm(addr, size)
{
	dbg("Disassembling from 0x" + addr.toString(16).toUpperCase() +
		   " to 0x" + (addr+size).toString(16).toUpperCase());
	sendcmsg("disasm", addr, get_bytes_str(addr, size));
}

function send_read(addr, size)
{
	dbg("Reading from 0x" + addr.toString(16).toUpperCase() +
		   " to 0x" + (addr+size).toString(16).toUpperCase() +
		   " (" + (size/1024)/1024 + "MB)");
	sendcmsg("read", addr, get_bytes_str(addr, size));
}

function send_dump_name(addr, size, name)
{
	dbg("Dumping from 0x" + addr.toString(16).toUpperCase() +
		   " to 0x" + (addr+size).toString(16).toUpperCase() +
		   " (" + (size/1024)/1024 + "MB)");
	sendcmsg("dump", addr, get_bytes_str(addr, size), name);
}


function send_dump(addr, size)
{
	dbg("Dumping from 0x" + addr.toString(16).toUpperCase() +
		   " to 0x" + (addr+size).toString(16).toUpperCase() +
		   " (" + (size/1024)/1024 + "MB)");
	var filename = "0x" + hex32(addr.toString(16).toUpperCase()) + "-0x" +
					hex32((addr+size).toString(16).toUpperCase()) + ".bin";
	sendcmsg("dump", addr, get_bytes_str(addr, size), filename);
}

function send_dump_real_addr(addr, size)
{
	fake_addr = addr;
	addr += BASE_ADDR;
	dbg("Dumping from 0x" + addr.toString(16).toUpperCase() +
		   " to 0x" + (addr+size).toString(16).toUpperCase() +
		   " (" + (size/1024)/1024 + "MB)");
	var filename = "0x" + hex32(addr.toString(16).toUpperCase()) + "-0x" +
					hex32((addr+size).toString(16).toUpperCase()) + ".bin";
	sendcmsg("dump", addr, get_bytes_str(fake_addr, size), filename);
}

//String functions

function get_bytes_str(addr, size)
{
	var s = "";
	var end = addr+size;
	for (var i = addr; i < end; i++) {
		s = s + hex8(lb(i).toString(16));
	}
	return s;
}

function get_bytes(addr, size)
{
	var array = [];
	var end = addr+size;
	for (var i = addr; i < end; i++) {
		array.push(lb(i));
	}
	return array;
}

function get_stringz(addr)
{
	var str = "";
	for (var i = addr; lb(i) != 0; i++) {
		str = str + String.fromCharCode(lb(i));
	}
	return str;
}

function get_string(addr, length)
{
	var str = "";
	var end = addr+length;
	for (var i = addr; i < end; i++) {
		str = str + String.fromCharCode(lb(i));
	}
	return str;
}

function find_str_n(start_addr, size, s)
{
	var end = start_addr+size;
	var found = true;
	var len = s.length;
	for (var i = start_addr; i < end; i++) {
		found = true;
		for (var j = 0; j < len && found; j++) {
			if (lb(i+j) != asciiAt(s, j)) {
				found = false;
			}
		}
		if (found) {
			return i;
		}
	}
	return -1;
}

function find_str(start_addr, s)
{
	var found = true;
	var len = s.length;
	for (var i = start_addr; i < memsize; i++) {
		found = true;
		for (var j = 0; j < len && found; j++) {
			if (lb(i+j) != asciiAt(s, j)) {
				found = false;
			}
		}
		if (found) {
			return i;
		}
	}
	return -1;
}

function asciiAt(str, i)
{
	return str.charCodeAt(i)&0xFF;
}

function str2ascii(str)
{
	var ascii = "";
	for (var i = 0; i < str.length; i++) {
		ascii = ascii + str.charCodeAt(i).toString(16);
	}
	return ascii;
}

//Memory functions
function lb(addr)
{
	if (addr%2 == 0) {
		return mem.charCodeAt(addr/2)>>8;
	} else {
		return mem.charCodeAt(addr/2)&0xFF;
	}
}

function lh(addr)
{
	if (addr%2 == 0) {
		return mem.charCodeAt(addr/2);
	} else {
		return (lb(addr)<<8) | lb(addr+1);
	}
}

function lw(addr)
{
	return (lh(addr)<<16) | lh(addr+2);
}

function a2hex(str)
{
  var arr = [];
  for (var i = 0, l = str.length; i < l; i ++) {
    var hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }
  return arr.join('');
}

function hex32(s)
{
	return ('00000000' + s).substr(-8);
}
function hex16(s)
{
	return ('0000' + s).slice(-4)
}
function hex8(s)
{
	return ('00' + s).substr(-2);
}


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

/*
    Send message to server-synchronous javascript
*/

function dbg(txt)
{
	logAdd(txt);
    sendmsg(txt);
}


/*
    Get a command from the server
*/
function getcmd()
{
    try {
        var cmd = "";
        handler = function(data, stat) {
			cmd = data;
		}
        $.ajax({
            type: 'GET',
            url: '/Command',
            success: handler,
            async: false
        });
    } catch(e) {
        logdbg("GetCMDError: " + e);
        return "FAIL";
    }
    return "";
}

/*
    POST text (hexencoded string) to server
*/
function sendcmsg(type, addr, txt, extra)
{
    try {
        var dat = {type: type, addr: addr, data: txt, extra: extra};
        $.ajax({
            type: 'POST',
            url: '/Data',
            data: dat,
            async: false
        });
    }catch(e){
        logdbg("SendCMsgError: " + e);
    }
}

/*
    Send message to server-synchronous javascript
*/
function sendmsg(txt)
{
    var dat = {dbg: txt};
    $.ajax({
        type: 'GET',
        url: '/Debug',
        data: dat,
        async: false
    });
}

/*
    Send debug msg to server
*/
function logdbg(txt)
{
    sendmsg(txt);
}

/*
	Print log messages
*/
function logAdd(txt)
{
	if (!_log0){
		_log0 = document.getElementById("log");
		if (!_log0) return;
	}
	if (!_log){
		_log = document.createElement("div");
		if (_log0.hasChildNodes()){
			_log0.insertBefore(_log, _log0.firstChild);
		}else{
			_log0.appendChild(_log);
		}
	}
	var div = document.createElement("div");
	div.innerHTML = txt;
	_log.appendChild(div);
}

// prints environment info
function writeEnvInfo()
{
	document.write(new Date().toTimeString() + "<br/>");
	document.write(navigator.userAgent + "<br/>");
	document.write(navigator.appName + " (" + navigator.platform + ")<br/><br/>");
}




