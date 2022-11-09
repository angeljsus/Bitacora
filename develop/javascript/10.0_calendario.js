function crearCalendario( inpIdName, day, month, year){
	// const divDateContent = document.getElementById('divDateContent');
	const inputDateValue = document.getElementById(inpIdName);
	const hoyDate = new Date();
	// Hago split a cadena para obtener dd-mm-aaaa y acceder medianta objeto
	let date = inputDateValue.value.split('-');
	let respuesta = false;
	let hoy = '', marcadoInput = '', i = 0;
	return new Promise(function(resolve, reject){
		respuesta = openModal();
		if (respuesta) {
			resolve() 
		}
	})
	.then(function(){
		return new Promise(function(resolve, reject){
			let primerDiaDelMes = '', ultimoDiaDelMes = '', diaArray = '';
			console.log('Que estoy haciendo?')
			if (day) {
				// ULTIMO DIA DEL MES
				ultimoDiaDelMes = new Date(year, month, 0);
				day = ultimoDiaDelMes.getDate();
				month = ultimoDiaDelMes.getMonth() + 1;
				year = ultimoDiaDelMes.getFullYear();
				ultimoDiaDelMes = ultimoDiaDelMes.getDate()
				// PRIMER DIA DEL MES
				primerDiaDelMes = new Date(year,month-1,1)
				primerDiaDelMes = primerDiaDelMes.getDay()
				console.log('--> Navegando entre calendario')
			} else {
				// console.warn('ABRIENDO FECHA')
				if (inputDateValue.value != '') {
					day = date[0];
					month = date[1];
					year = date[2];
				// ULTIMO DIA DEL MES
					ultimoDiaDelMes = new Date(year, month, 0);
					ultimoDiaDelMes = ultimoDiaDelMes.getDate()
				// PRIMER DIA DEL MES
					primerDiaDelMes = new Date(year,month-1,1)
					primerDiaDelMes = primerDiaDelMes.getDay()
					console.log('--> Abriendo calendario con fecha de input')
				} 
				else {
					day = hoyDate.getDate();
					month = hoyDate.getMonth() + 1;
					year = hoyDate.getFullYear();
				// ULTIMO DIA DEL MES
					ultimoDiaDelMes = new Date(year, month, 0);
					ultimoDiaDelMes = ultimoDiaDelMes.getDate()
				// PRIMER DIA DEL MES
					primerDiaDelMes = new Date(year,month-1,1)
					primerDiaDelMes = primerDiaDelMes.getDay()
					console.log('--> Abriendo calendario con el día de hoy')
				}
			}
			resolve({day, month, year, ultimoDiaDelMes, primerDiaDelMes})
		})
	})
	.then(function(result){
		console.log(result)
		let html = '', semana = 0, diasCont = 0, diaFormat = '';
		const divDateContent = document.getElementById('divDateContent');

		diaFormat = `${result.day}-${regresaTextoCero(result.month)}-${result.year}`; 
		diaFormat = obtenFecha(diaFormat, false);
		console.log(diaFormat)
		html = `
			<div class="container-calendario">
				<div class="calendario-options">
					<div class="nav-option" onclick="mesAnterior('${inpIdName}',${result.day},${result.month},${result.year})"><</div>
					<div class="nav-title">${diaFormat}</div>
					<div class="nav-option" onclick="mesPosterior('${inpIdName}',${result.day},${result.month},${result.year})">></div>
				</div>
				<div class="row-days">
					<div class="item-day">do.</div>
					<div class="item-day">lu.</div>
					<div class="item-day">ma.</div>
					<div class="item-day">mi.</div>
					<div class="item-day">ju.</div>
					<div class="item-day">vi.</div>
					<div class="item-day">sá.</div>
				</div>
		`;
		i = 0;
		do{
			if (diasCont == 7) {
				html += '</div>'
				diasCont = 0;
			}
			if (diasCont == 0) {
				semana++;
				html += '<div class="row-days">'
			}

			if (diasCont == 6 || diasCont == 0) {
				// CARGO EL FIN DE SEMANA, DESHABILITANDOLOS
				html += `<div class="item-day day status-disabled" id="div-${i}" onclick="seleccionarDia(this.id, '${inpIdName}', ${result.month}, ${result.year})"></div>`;
			} else {
				// CARGO DIAS NORMALES, DESHABILITANDOLOS
				html += `<div class="mes-${month} item-day day" id="div-${i}" onclick="seleccionarDia(this.id, '${inpIdName}',${result.month}, ${result.year})"></div>`;
			}
			diasCont++;
			i++;
		} while (i < 42)
		// console.log(html);
		html += '</div></div>'
		// console.log(divDateContent)
		divDateContent.innerHTML = html;

		return result;

	})
	.then(function(result){
		let selectedDay = '', itemDay = '', contador = 0, marcadoInput = 0;
		// AHORA A CARGAR LOS VALORES DE LOS INPUTS
		// console.warn(result)
		// Si el mes y año corresponden a el de el dia de hoy, asigno valor al dia seleccionado
		if (result.month == (hoyDate.getMonth()+1) && result.year == hoyDate.getFullYear()) {
			selectedDay = hoyDate.getDate();
		}
		// Selecciono el valor a marcar del input donde almaceno el valor del dia seleccionado
		if (inputDateValue.value != '') {
			// console.log(`{${date[1]}}{${date[2]}}--[${result.month}] [${result.year}]`)
			if (result.month == date[1] && result.year == date[2]) {
				marcadoInput = date[0];
			}
		}

		i = 0;
		contador = 1;
		do {
			// elemento del html
			itemDay = document.getElementById(`div-${i}`);

			// marcando el borde del dia de hoy 
			if (contador == selectedDay) {
				console.warn('Marcar borde en el dia de hoy: ' + selectedDay + ' ' + result.month + ' ' + result.year)
				itemDay.style = 'border: 2px solid rgba(0, 0, 0, .2);';
			}
			// Marco el background del dia seleccionado en input
			if (marcadoInput == contador) {
				console.log('Marcando día seleccionado en fecha: ' + contador)
				itemDay.style = 'background:#7dcd85;';

			}

			// Si el dia que es el contador es mayor a uno y menor que el ultimo dia del mes
			if (contador > 1 && contador <= result.ultimoDiaDelMes) {
				itemDay.innerHTML = contador;
				contador++;
			}
			 else if (result.primerDiaDelMes == i) {
			 	// si el dia de semana del array corresponde al primer dia en el que inicia el mes [0,1,2,3,4,5,6] == 0-7 del div del calendario
				// Agrego el nuemero del día
				itemDay.innerHTML = contador;
				contador++;
			} else {
			// 	// Deshabilito días vacios
				itemDay.style = 'pointer-events: none; background: #FFFF;';
			}
			i++;
		} while(i < 42)

		return result;
	})
	.then(function(date){
		// Deshabilitando dias del mes en el que estoy
		// console.warn(date)
		deshabilitarDiasMes(date.month, date.year)
	})

}


function mesAnterior(inpIdName, day, month, year){
	if (month == 1) {
		month = 12;
		year = year-1;
	}
	else {
		month = month-1;
	}
	crearCalendario(inpIdName, day, month, year)
}

function mesPosterior(inpIdName, day, month, year){
	if (month == 12) {
		month = 1;
		year = year+1;
	}
	else {
		month = month+1;
	}
	crearCalendario(inpIdName, day, month, year)
}

function deshabilitarDiasMes(mes, year){
	console.log('Deshabilitar dias del mes: ' + mes + ' ?')
	let diasMes = document.getElementsByClassName('day');
	let festivos = getDiasFestivos();
	let i = 0, diaCalendario = 0, spliting = '';
	do{
		spliting = diasMes[i].classList[0].split('-'); 
		if (spliting[0] == 'mes') {
			festivos.forEach(function (item){
				if (item.mes == spliting[1] && item.year == year) {
					diaCalendario = document.getElementById(`div-${i}`);
					if (diaCalendario.textContent == item.dia) {
						diaCalendario.classList.add('status-disabled')
						console.log('Se deshabilito: ' + item.dia + ' del mes ' + mes)
					}
				}
			})
		}
		i++;
	}while(i < diasMes.length)
}

function getDiasFestivos(){
	let festivos = [
		//2022 
		{	day:1, month:1, dia:1, mes:1, year:2022},
		{	day:7, month:2, dia:7, mes:2, year:2022},
		{	day:21, month:3, dia:21, mes:3, year:2022},
		{	day:14, month:4, dia:14, mes:4, year:2022},
		{	day:15, month:4, dia:15, mes:4, year:2022},
		{	day:1, month:5, dia:1, mes:5, year:2022},
		{	day:5, month:5, dia:5, mes:5, year:2022},
		{	day:8, month:7, dia:8, mes:7, year:2022},
		{	day:16, month:9, dia:16, mes:9, year:2022},
		{	day:2, month:11, dia:2, mes:11, year:2022},
		{	day:21, month:11, dia:21, mes:11, year:2022},
		{	day:25, month:12, dia:25, mes:12, year:2022},
		//2022
		//2021 
		{	day:1, month:1, dia:1, mes:1, year:2021},
		{	day:1, month:2, dia:1, mes:2, year:2021},
		{	day:15, month:3, dia:15, mes:3, year:2021},
		{	day:1, month:4, dia:1, mes:4, year:2021},
		{	day:2, month:4, dia:2, mes:4, year:2021},
		{	day:1, month:5, dia:1, mes:5, year:2021},
		{	day:5, month:5, dia:5, mes:5, year:2021},
		{	day:8, month:7, dia:8, mes:7, year:2021},
		{	day:16, month:9, dia:16, mes:9, year:2021},
		{	day:2, month:11, dia:2, mes:11, year:2021},
		{	day:15, month:11, dia:15, mes:11, year:2021},
		{	day:25, month:12, dia:25, mes:12, year:2021},
		//2021
		//2020 
		{	day:1, month:1, dia:1, mes:1, year:2020},
		{	day:3, month:2, dia:3, mes:2, year:2020},
		{	day:16, month:3, dia:16, mes:3, year:2020},
		{	day:9, month:4, dia:9, mes:4, year:2020},
		{	day:10, month:4, dia:10, mes:4, year:2020},
		{	day:1, month:5, dia:1, mes:5, year:2020},
		{	day:5, month:5, dia:5, mes:5, year:2020},
		{	day:8, month:7, dia:8, mes:7, year:2020},
		{	day:16, month:9, dia:16, mes:9, year:2020},
		{	day:2, month:11, dia:2, mes:11, year:2020},
		{	day:16, month:11, dia:16, mes:11, year:2020},
		{	day:25, month:12, dia:25, mes:12, year:2020},
		//2020
		//2019 
		{	day:1, month:1, dia:1, mes:1, year:2019},
		{	day:4, month:2, dia:4, mes:2, year:2019},
		{	day:18, month:3, dia:18, mes:3, year:2019},
		{	day:18, month:4, dia:18, mes:4, year:2019},
		{	day:19, month:4, dia:19, mes:4, year:2019},
		{	day:1, month:5, dia:1, mes:5, year:2019},
		{	day:5, month:5, dia:5, mes:5, year:2019},
		{	day:8, month:7, dia:8, mes:7, year:2019},
		{	day:16, month:9, dia:16, mes:9, year:2019},
		{	day:2, month:11, dia:2, mes:11, year:2019},
		{	day:18, month:11, dia:18, mes:11, year:2019},
		{	day:25, month:12, dia:25, mes:12, year:2019},
		//2019 
	]
	return festivos;
}


function obtenFecha(date, completa){
	// console.log('obtenter texto fecha: ' + date + ' completa: ' + completa)
	date = date.split('-');
	let day = date[0];
	let month = date[1];
	let year = date[2];
	let mesText = '';
	switch(month){
		case '01':
			mesText = 'Enero';
			break;
		case '02':
			mesText = 'Febrero';
			break;
		case '03':
			mesText = 'Marzo';
			break;
		case '04':
			mesText = 'Abril';
			break;
		case '05':
			mesText = 'Mayo';
			break;
		case '06':
			mesText = 'Junio';
			break;
		case '07':
			mesText = 'Julio';
			break;
		case '08':
			mesText = 'Agosto';
			break;
		case '09':
			mesText = 'Septiembre';
			break;
		case '10':
			mesText = 'Octubre';
			break;
		case '11':
			mesText = 'Noviembre';
			break;
		case '12':
			mesText = 'Diciembre';
			break;
	}

	if (completa) {
		//regresa fecha completa
		return `${day} de ${mesText} del ${year}`;
	} else {
		// solo mes y año
		console.log('Regresando: ' + `${mesText} ${year}`)
		return `${mesText} ${year}`;
	}
}

function seleccionarDia(idFecha, input, month, year){
	// Poner fecha seleccionada dentro de input
	// console.warn('Obtener dato de: ' + idFecha + ' en ' + input);
	const divFecha = document.getElementById(idFecha);
	const inpRespuesta = document.getElementById(input);
	let fechaReturn = regresaTextoCero(divFecha.textContent);
	fechaReturn = fechaReturn+'-';
	fechaReturn += regresaTextoCero(month)+'-';
	fechaReturn += year;
	inpRespuesta.value = fechaReturn;
	console.log('Se agrego valor a input con id: ' + input)
	// ejecuto evento onchange para activar funcionalidad que existe dentro del input
	inpRespuesta.onchange()
	closeModal()
}

// Regresa texto antes de numero si es menor a 10
function regresaTextoCero(numero){
	numero = parseInt(numero)
	// console.log('Numero parseado: ' + numero)
	if (numero < 10) {
		return '0' + numero;
	} else {
		return numero;
	}
}

function closeModal(){
	const modales = document.getElementById('modales');
	modales.style = 'background: rgba(0, 0, 0, 0.1)';
	modales.classList.remove('modulo-modal');
	modales.classList.remove('modulo-modal-1');
	modales.innerHTML = '';
}

function openModal(){
	const modales = document.getElementById('modales');
	modales.classList.add('modulo-modal');
	modales.innerHTML = '<div id="divDateContent" class="modal-fecha"></div>';
	console.log('Cargando modal')
	return true;
}