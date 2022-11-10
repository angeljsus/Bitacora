const getCalendario  = (options, slideElement) => {
	// array para guardar errores
	const error = [];
	// modo que se presentará el calendario
	let mode = options.mode ?  options.mode : 0;
	// busqueda de elemento input
	const element = document.getElementById(options.idInput);
	console.log('presentando como: ',mode === 0 ? 'body modal' : 'child element');
	// parent
	let parent = '';
	// el contenedor
	let container = null;
	// checar formato
	let formato = '';

	// VALIDACIONES
	if(mode === 0){
		parent = document.body;
		element ? true : error.push(`Propiedad "idInput" con valor "${options.idInput}" no existe en la pantalla.`);
	} else {
		parent = options.parentId ?  
			(
				document.getElementById(options.parentId) ? 
					document.getElementById(options.parentId) : error.push(`Elemento padre con #id "${options.parentId}" no existe en el documento.`) 
			)  
			: error.push(`Es requerida la propiedad "parentId" del elemento padre donde se mostrará el calendario.`);

	}
	// VALIDACIONES
	// obteniendo el formato
	options.format ? 
		options.format.search( /string|-|\//g) >= 0 ? 
			formato = options.format.match( /string|-|\//g)[0] : formato = '-' 
		: formato = '-'

	if (error.length > 0) {
		return Promise.reject(error.toString())		
	}
	console.log(parent)
	container = document.getElementById('container');
	// cargale el calendario
	return Promise.resolve(container ? false : parent.insertAdjacentHTML('afterbegin', `
		<div class="calendar-container" id="container">
			<div class="calendar" id="calendar"></div>
		</div>
	`) 
	)
	.then( () => {
		container = document.getElementById('container');
		if(mode === 0){
			container.addEventListener('click', e => {
				e.target.classList[0] == 'calendar-container' ? closeCalendario( container ) : false
			});
		} else {
			container.style.position = 'static'
		}
	})
	.then( () =>
		slideElement ? getJsonDate(slideElement) : 
			(
				element ? 
				(
					element.value ? createDateObject(element.getAttribute('calendarKey')) : getJsonDate(new Date()) 
				): getJsonDate(new Date()) 
			) 

	)
	.then( fecha => {
		console.log('-->', fecha)
		const calendar = document.getElementById('calendar');
		const primerFechaMes = getJsonDate(new Date(fecha.year,fecha.month-1,1));
		const ultimoFechaMes = getJsonDate(new Date(fecha.year,fecha.month,0));
		const fechaHoy = getJsonDate(new Date());
		let mesSiguiente = '', mesAnterior ='', mesActual = '', diaSeleccionado = '', html = '';
		html = `
      <div class="row-calendar desc-row">
        <div class="opt-despla" id="mesAnterior"><</div>
        <div class="description">${fecha.monthYear}</div>
        <div class="opt-despla" id="mesSiguiente">></div>
      </div>
      <div class="days-row">
        <div class="day">do.</div>
        <div class="day">lu.</div>
        <div class="day">ma.</div>
        <div class="day">mi.</div>
        <div class="day">ju.</div>
        <div class="day">vi.</div>
        <div class="day">sá.</div>
      </div>
    `;
    let j = 0, contador = 0, dia = 0, idDia = 0, todayMarked = '', irAHoy = `${fecha.month}-${fecha.year}`;
    let option = '', selectedDay = '', disable = '', clases = [], estado = false, dateObjectValue = '';
    for(let i = 0; i < 6; i++){
    	html += `<div class="row-calendar">`
    	for(j = 0; j < 7; j++){
    		contador == primerFechaMes.dayWeek ? dia = 1 : ''
    		if (dia > 0 && dia <= ultimoFechaMes.dayMonth) {
    			estado= false;
    			estado = options.disable ? 
    				statusDayChecker(options.disable, { day: dia, month: fecha.month, year: fecha.year, dayWeek : j}) 
    				: false 
    			idDia = `id-${dia}-${fecha.month}-${fecha.year}`;
    			dateObjectValue=`${fecha.year},${fecha.month},${dia}`;
    			// marcar el día de hoy
    			idDia == fechaHoy.id ? todayMarked='day-marked' : todayMarked=''; 
    			// marcar el dia seleccionado en input
    			element ? 
    			element.value !== '' ? 
    			element.getAttribute('calendarKey') == idDia ? selectedDay = 'day-selected' : selectedDay = '' 
    			: selectedDay = '' 
    			: false

    			estado ? disable = 'day-disabled' : disable = ''
    			clases = ['day', todayMarked, selectedDay, disable]

    			html += `<div class="${clases.toString().replace(/\,/g,' ')}" dateDefault="${dateObjectValue}" id="${idDia}" name="diaSeleccionable">${dia}</div>`
    			dia++
    		} else {
    			html += `<div class="day day-hidden"></div>`
    		}
    		contador++;
    	}
    	html += `</div>`
    }
		option = `<div class="today"></div>`;

    if (irAHoy !== `${fechaHoy.month}-${fechaHoy.year}`) {
			option = `<div class="today" id="mesActual">Hoy: ${fechaHoy.full}</div>`;
    }
    html += `<div class="days-row">${option}</div>`
    calendar.innerHTML = html;
    // activando eventos
		mesAnterior = document.getElementById('mesAnterior');
		mesSiguiente = document.getElementById('mesSiguiente');
		mesActual = document.getElementById('mesActual');
		diaSeleccionado = document.getElementsByName('diaSeleccionable');

		mesAnterior.onclick = () => slideTo(options, false, fecha.default );
		mesSiguiente.onclick = () => slideTo(options, true, fecha.default );
		mesActual ? mesActual.onclick = () => slideTo(options, null, fechaHoy.default) : false
		if(options.mode === 0){
			for(let i = 0; i < diaSeleccionado.length; i++) {
				diaSeleccionado[i].onclick = () => 
					getValueOfDay(diaSeleccionado[i].id, options.idInput, formato)
					.then( closeCalendario( container ) );
			}
		} else {
			let fechaFinal = '', result = '', estado = false;
			// const elements = document.getElementsByName('valuesModMarcado');
			for(let i = 0; i < diaSeleccionado.length; i++) {
				
				diaSeleccionado[i].onclick = () =>{
					estado = getValueToMarker();
					if (estado) {
						console.log(estado)
						fechaFinal = new Date( diaSeleccionado[i].getAttribute('dateDefault') );
						fechaFinal = getJsonDate(fechaFinal);
						/*actualizar desde la base de datos*/
						return revisarRegistroEnBd(fechaFinal.value, estado.valor, estado.color)
						.then( () => {
							console.log('---------------------')
							// fechaFinal.queryToUpdate = hayRegistros;
							fechaFinal.valueToDb = estado.valor;
							fechaFinal.colorToGroup = estado.color;
							document.getElementById(fechaFinal.id).style.backgroundColor = estado.color;
							result = options.global.some(e => {
								if(e.valueReverse === fechaFinal.valueReverse){
									e.valueToDb = estado.valor;
									e.colorToGroup = estado.color;
									return true;
								}
								return false;
							})
							result ? false : options.global.push(fechaFinal)
						})
					}
				}
				// calendario de random
				if(options.parentId === 'calendar3'){
					diaSeleccionado[i].onclick = () =>{
						fechaFinal = new Date( diaSeleccionado[i].getAttribute('dateDefault') );
						fechaFinal = getJsonDate(fechaFinal);
						diaSeleccionado[i].classList.add('random-class');
						diaSeleccionado[i].style.backgroundColor = '#bb9457';

						if(options.sinceTo.length === 2){
							options.sinceTo.shift();	
							options.sinceTo.push(fechaFinal)
						} else {
							options.sinceTo.push(fechaFinal)
						}
						if(options.sinceTo.length === 2){
							marcarFechas(options.sinceTo)
						}
					}

				}
			}
			let element = false;
			// console.log(options.global)
			options.global.map( day => {
				element = document.getElementById(day.id);
				element ? element.style.backgroundColor = day.colorToGroup : false
			})

			if(options.parentId === 'calendar3' && options.sinceTo.length === 2){
				marcarFechas(options.sinceTo)
			}
		}
	})
}

const getValueToMarker = () => {
	const elements = document.getElementsByName('valuesModMarcado');
	let i = 0;
	let atributo = null;
	let valor = null;
	do{
		atributo = elements[i] ? elements[i].getAttribute('valor') : null
		if(atributo !== 'null'){
			valor = atributo;
		}
		i++;
	}while(i < elements.length)
	let color = '';
	valor = parseInt(valor)
	if(valor > 0){
		if(valor === 1){
			color= '#779be7';
		}
		if(valor === 2){
			color= '#588b8b';
		}
		if(valor === 3){
			color= '#ffd000';
		}
		if(valor === 10){
			color= 'transparent';
		}
		return { valor: valor, color: color}
	}
	
	return false;
}

const searchDistinct = (nameParam, jsonData) => {
 let lookup = {};
 let result = [];
 let name = '';
 for (let item, i = 0; item = jsonData[i++];) {
   name = item.properties[nameParam];
   if (!(name in lookup)) {
     lookup[name] = 1;
     result.push(name);
   }
 }
 if (result.length == 1){
   if(result[0] === undefined){
     result = [];
   }
 }
 return result;
}

const statusDayChecker = ( disable, dayJson) => {
	let stringValue = '', i = 0;

	if (disable.daysOfWeek) {
		if (disable.daysOfWeek.toString().search(dayJson.dayWeek) >= 0) {
			return true;
		}
	}
	if (disable.eachDay) {
		i = 0;
		do {
			if (disable.eachDay[i] === dayJson.day) {
				return true;
			}
			i++;
		} while(i < disable.eachDay.length)
	}
	if (disable.eachMonth) {
		i = 0;
		do {
			if (disable.eachMonth[i].day == dayJson.day && disable.eachMonth[i].month == dayJson.month) {
				return true;
			}
			i++;
		} while(i < disable.eachMonth.length)
	}
	if (disable.specific) {
		i = 0;
		do {
			if (
				disable.specific[i].day === dayJson.day && 
				disable.specific[i].month === dayJson.month && 
				disable.specific[i].year === dayJson.year) {
				return true;
			}
			i++;
		} while(i < disable.specific.length)
	}
}

const getDatesArray = (fechaInicio, fechaFin, disable) => {
	console.log(disable)

	let count = 0;
	const fechaHoy = new Date();
	if(disable){
		disable.daysOfWeek ? count = 1 : false
		disable.eachDay ? count = 1 : false
		disable.eachMonth ? count = 1 : false
		disable.specific ? count = 1 : false
	} 
	const actualDate = getJsonDate(fechaFin);
	const actualYear = actualDate.year, actualMonth = actualDate.month, actualDay = actualDate.dayMonth;
	const startDate = getJsonDate(fechaInicio);
	const startYear = startDate.year, startMonth = startDate.month, startDay = startDate.dayMonth;
	const startMonthEnd = new Date(startDate.year, startDate.month, 0);
	const finalArray = [];
	let yearBucle = startYear;
	let countYears = actualYear - startYear;
	let i = 0, j = 0 , k = 0, finMes = 0, fechaFinal = 0, estado = false;
	countYears = countYears > 0 ? countYears+1 : countYears = 1; 
	
	do{
		j = 0;
		do{
			finMes = new Date(yearBucle, (j+1), 0);
			k = 1;
			do{
				fechaFinal = getJsonDate( new Date(yearBucle, j, k) );
				if (startDate.default <= fechaFinal.default && actualDate.default >= fechaFinal.default) {
					estado = false;
					if (count === 1) {
						estado = statusDayChecker(disable, { 
							day: fechaFinal.dayMonth, 
							month: fechaFinal.month, 
							year: fechaFinal.year, 
							dayWeek : fechaFinal.dayWeek
						});
					}
					// console.log(estado)
					// delete fechaFinal.id;
					estado ? fechaFinal.disabled = true : fechaFinal.disabled = false;
					finalArray.push(fechaFinal)
				}
				k++;
			} while (k <= finMes.getDate())
			j++;
		} while(j < 12)
		yearBucle++;
		i++;
	} while(i < countYears)

	return finalArray;
}

const createDateObject = idDay => {
	let date = idDay.replace('id-','');
	date = date.split('-');
	let dia = date[0], mes = date[1]-1, year = date[2], save = '';
	let valor = new Date(year, mes, dia);
	return getJsonDate(valor);
}

const getValueOfDay = (idDay, idInput, formato) => {
	const input = document.getElementById(idInput);
	const jsonDate = createDateObject(idDay);
	let save = jsonDate.value;
	switch (formato) {
		case '/':
			save = jsonDate.diag; 
			break;
		case 'string':
			save = jsonDate.full; 
			break;
	}
	input.setAttribute('calendarKey', jsonDate.id);
	delete jsonDate.id;
	input.setAttribute('calendarValue', JSON.stringify(jsonDate));
	return Promise.resolve(input.value = save);
}

const getJsonDate = objectDate => {
	const object = {};
	let day = 0, month = 0;
	object.dayMonth =  objectDate.getDate();
	object.month =  objectDate.getMonth()+1;
	object.year =  objectDate.getFullYear();
	object.dayWeek =  objectDate.getDay();
	day = object.dayMonth < 10 ? `0${object.dayMonth}` : object.dayMonth;
	month = object.month < 10 ? `0${object.month}` : object.month;
	object.full = `${day} de ${getStringMonth(object.month).mes} ${object.year}`;
	object.monthYear = `${getStringMonth(object.month).mes} ${object.year}`;
	object.value = `${day}-${month}-${object.year}`;
	object.valueReverse = `${object.year}-${month}-${day}`;
	object.diag = `${day}/${month}/${object.year}`;
	object.diagReverse = `${object.year}/${month}/${day}`;
	object.default = objectDate;
	object.id = `id-${object.dayMonth}-${object.month}-${object.year}`;
	// object.dia = getStringDia(object.dayWeek)
	return object;
}
// Falta implementar
const getStringDia = dayWeek => {
	let dias = [
		{id:0, nem:'Do.', string:'Domingo'},
		{id:1, nem:'Lu.', string:'Lunes'},
		{id:2, nem:'Ma.', string:'Martes'},
		{id:3, nem:'Mi.', string:'Miércoles'},
		{id:4, nem:'Ju.', string:'Jueves'},
		{id:5, nem:'Vi.', string:'Viernes'},
		{id:6, nem:'Sá.', string:'Sábado'},
	];
	let i = 0, resultado = 0;
	do {
		if (dayWeek == dias[i].id) {
			return dias[i];
		}
		i++;
	} while(i < dias.length)
}

const getStringMonth = month => {
	const meses = 
	[
		{id:1, mes:'Enero'},
		{id:2, mes:'Febrero'},
		{id:3, mes:'Marzo'},
		{id:4, mes:'Abril'},
		{id:5, mes:'Mayo'},
		{id:6, mes:'Junio'},
		{id:7, mes:'Julio'},
		{id:8, mes:'Agosto'},
		{id:9, mes:'Septiembre'},
		{id:10, mes:'Octubre'},
		{id:11, mes:'Noviembre'},
		{id:12, mes:'Diciembre'}
	]
	let i = 0, resultado = 0;
	do {
		if (month == meses[i].id) {
			return meses[i];
		}
		i++;
	} while(i < meses.length)

}

const slideTo = (options, suma, param) => {
	const fecha = new Date(param);
	let month = fecha.getMonth(), year = fecha.getFullYear();
	// null no slide
	if (suma === null) {
		return getCalendario(options, new Date(param));
	}

	if (suma) {
		if (month == 11) {
			month = 0;
			year = year+1;
		} else {
			month = month+1;
		}
	} else {
		if (month == 0) {
			month = 11;
			year = year-1;
		} else {
			month = month-1;
		}
	}
	return getCalendario( options, new Date(year, month) );
}

const closeCalendario = element => {
	element.remove();
}

const getValueFromInput = idInput => {
	const element = document.getElementById(idInput);
	if (!element) {
		throw `No se encuentra presente un elemento con el id del input proporcionado "${idInput}"`;
	} 
	let value = element.getAttribute('calendarValue');
	value = value ? JSON.parse(value) : value = {}; 
	value.default ? value.default = new Date(value.default) : false;
	return value;
}