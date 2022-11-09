function cadenaUpperCase(text){
	text = text.toUpperCase();
	return text;
}

function crearDir(url){
	return new Promise(function(resolve, reject){
		let sehace = fs.ensureDir(url);
		resolve(sehace);
	})
}

function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8( str ) {
  return decodeURIComponent(escape(window.atob(str)));
}

function encondeCaracteres(texto){
	// console.log(texto)
	if (texto == null) {
		texto = '';
	}

	texto = texto.replace(/[\u0000-\u0019]/g,''); 
	texto = texto.replace(/"/g, '&quot;'); 
	// const inpRfcIde = document.getElementById('inpRfcIde');
	return texto;
}

function decodeCaracteres(texto){
	texto = texto.replace(/[\u0000-\u0019]/g,''); 
	texto = texto.replace(/&quot;/g, '"'); 
	// const inpRfcIde = document.getElementById('inpRfcIde');
	return texto;
}

function replaceSpace(texto){
	texto = texto.replace(/[\u0000-\u0019]/g,''); 
	texto = texto.replace(/ /g,''); 
	return texto;

}
// rampamparm = decodeCaracteres(rampamparm);
// console.warn(rampamparm)
// function decodeCaracteres(texto){
// 	// texto = b64_to_utf8(texto);
// }

function caracteresRaros(cadena){
	cadena = cadena.replace(/[\u0000-\u0019|\u001A|\u001B|\u001C|\u001D|\u001E|\u001F|\u007F]/g, '')
	return cadena;
}