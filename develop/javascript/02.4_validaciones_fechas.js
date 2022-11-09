/*
	Fin es un objeto de fecha, es donde terminará de calcular.
	Si no tiene fecha de fin, valida hasta la fecha actual
*/
function validacionesHomeOffice(fechaHomeOffice, rfc, fin){
	console.log(fechaHomeOffice +' ' +rfc);
	// home office
	let spliting = fechaHomeOffice.split('-');
	let dayHomeOff = spliting[0]; 
	let monthHomeOff = spliting[1]-1;
	let yearHomeOff = spliting[2];
	let fechaHoy = new Date();
	let diferencia = 0;
	let objectDate = [];

	// home office
	return new Promise(function(resolve, reject){
		diferencia = fechaHoy.getFullYear() - yearHomeOff;
		// console.log('Diferencia entre años: ' + diferencia)
		// console.log('iteracion entre años')
		let i = 0, j = 0, h = 0, dateForMonth = '';
		let yearIterator = yearHomeOff;
		// iteracion años
		for(i = 0; i <= diferencia; i++){
			// console.warn('Año: '  + i +  ' ' + yearIterator)
			// iteracion meses
			do{
				// si año home office es igual al año iterador
				if (yearIterator == yearHomeOff) {

				// si año home office es igual al año de hoy
					if (yearIterator == fechaHoy.getFullYear()) {
						// que?
							objectDate.push(obtenerFechasExistentes(yearIterator, j, dayHomeOff, monthHomeOff, yearHomeOff, fin));
					} else {
						if (monthHomeOff <= j) {
							objectDate.push(obtenerFechasExistentes(yearIterator, j, dayHomeOff, monthHomeOff, yearHomeOff, fin));

							// console.log('mes: ' + j)
						}
					}
				} else {
					// si llegamos a la fecha de hoy
					if (yearIterator == fechaHoy.getFullYear()) {
						if (fechaHoy.getMonth() >= j) {
							objectDate.push(obtenerFechasExistentes(yearIterator, j, dayHomeOff, monthHomeOff, yearHomeOff, fin));
							// console.log('mes: ' + j)
						}
					} else {
					// diferente añño
							objectDate.push(obtenerFechasExistentes(yearIterator, j, dayHomeOff, monthHomeOff, yearHomeOff, fin));
						// console.log('mes: ' + j)
					}
				}
				j++;
			}while(j < 12)
			j=0;
			yearIterator++;
		}
		resolve([objectDate, rfc])
	})
	// .then(function(obj){
		// console.log(obj)
		// console.log(obj[0])
		// console.log(obj[1])
		// return obtenerRegistrosFaltantes(obj[0], obj[1])
	// })
}

function obtenerFechasExistentes(iYear, iMonth, hDay, hMonth, hYear, fin ){
	// console.log(year + ' -- ' + arrMes + ' -- ' + fechaHomeOffice)
	let ultimoDiaMes = new Date(iYear, iMonth+1, 0);
	let dataDeMes = [];
	let dia = 1;
	let diaCreado = 0;
	let hoyDate = new Date();
	// let final = fin.split('-')
	if (typeof fin === 'object') {
		hoyDate = fin;
		// console.log('------',fin);		
	}
	// console.warn(hoyDate2)
	// console.log(hoyDate)
	let fechaReturn = ''; 
	hDay = parseInt(hDay);
	// console.log('OBTENER MES: ' + iMonth)
	// let homeoffice = hYear +''+hMonth+''+hDay;
	// let hoyDateFull = hoyDate.getFullYear()+''+hoyDate.getMonth()+''+hoyDate.getDate();
	// let fechaCreada = 0;
	let nuevoMes = 1, nuevoDia = 0;

	for(let i = 0; i < ultimoDiaMes.getDate(); i++){
		diaCreado = new Date(iYear, iMonth, dia)
		if (diaCreado.getDay() == 6 || diaCreado.getDay() == 0) {

		} else {
			nuevoMes = iMonth+1;
			nuevoMes = regresaTextoCero(nuevoMes);
			nuevoDia = regresaTextoCero(dia);
			fechaReturn = nuevoDia+'-'+nuevoMes+'-'+iYear;
			if (iYear == hYear && iYear == hoyDate.getFullYear() ) {
				if (iMonth == hMonth && iMonth == hoyDate.getMonth()) {
					if (hMonth == iMonth && hoyDate.getDate() >= dia && hDay <= dia) {
						dataDeMes.push(fechaReturn)
						console.log(dia+'-'+iMonth+'-'+iYear)
					} 
					// dataDeMes.push(fechaReturn)
				} else {
					// todo paso en este año pero diferente mes
					if (hMonth == iMonth && hDay <= dia) {
						// console.log(dia+'-'+iMonth+'-'+iYear)
						dataDeMes.push(fechaReturn)
					} 
					if (hoyDate.getMonth() == iMonth && hoyDate.getDate() >= dia) {
						// console.log(dia+'-'+iMonth+'-'+iYear)
						dataDeMes.push(fechaReturn)
					}
					if (iMonth < hoyDate.getMonth() && iMonth > hMonth) {
						// console.log(dia+'-'+iMonth+'-'+iYear)
						dataDeMes.push(fechaReturn)
					}
				}
			} else {
				if (iMonth == hMonth && iYear == hYear) {
					if (hDay <= dia && hMonth == iMonth) {
						// console.log(dia+'-'+iMonth+'-'+iYear)
						dataDeMes.push(fechaReturn)
					}
				} else {
					if (hoyDate.getMonth() == iMonth && hoyDate.getDate() >= dia && hoyDate.getFullYear() == iYear) {
						// console.log(dia+'-'+iMonth+'-'+iYear)
						dataDeMes.push(fechaReturn)
					} else {
						if (hoyDate.getFullYear() == iYear && iMonth < hoyDate.getMonth()) {
							// console.log(dia+'-'+iMonth+'-'+iYear)
							dataDeMes.push(fechaReturn)
						}
						if (iMonth <= hoyDate.getMonth() && hoyDate.getFullYear() > iYear) {
							// console.log(dia+'-'+iMonth+'-'+iYear)
							dataDeMes.push(fechaReturn)
						}
						if (iMonth > hoyDate.getMonth() && hoyDate.getFullYear() > iYear) {
							// console.warn(dia+'-'+iMonth+'-'+iYear)
							dataDeMes.push(fechaReturn)
						}
					}
				}
			}
		}

		dia++;
	}
	return dataDeMes;

}

function obtenerRegistrosFaltantes(object, RFC){
	const db = getDatabase();
	let cantResults = 0;
	let allDays = [];
	let USER_APP = localStorage.getItem('USER_APP');


	object.forEach(function(item){
		item.forEach(function(days){
			// console.log(days)
			allDays.push(days)
		})
	})

	return new Promise( function(resolve, reject){
		db.transaction( function(tx){
			tx.executeSql(`
				SELECT
					fecha
				FROM
					TBL_CAMPOS
				WHERE
					rfcusuario = ?
				AND
					claveusr = ?
				ORDER BY
					fecha
			`, [RFC, USER_APP], function(tx, results){
				cantResults = results.rows.length;
				let text = '';
				let finded = -1;
				let faltantesDays = [];
				let resObject;

				console.warn('Registros del usuario en Base de datos: ' + cantResults)
				if (cantResults > 0) {
					for(let i = 0; i < cantResults; i++){
						text += results.rows[i].fecha +',';
					}
					// console.log(text)
					allDays.forEach(function( obj, index ) {
						finded = text.search(obj);
						if (finded < 0) {
								faltantesDays.push(obj)
						} 

					})
					resObject = faltantesDays;
					
				} else {
					resObject = allDays;
				}
				resolve(resObject)
			})
		}, function(err){
			console.error(err.message)
		}, function(){
		})
	}).then(function(objDiasFaltantes){

		return new Promise( function(resolve, reject){
			let festivos = getDiasFestivos();
			let spliting = '';
			let dia = 0;
			let mes = 0;
			let year = 0;
			// let text = '', finded = -1;
			// // console.warn('Ahora eliminar festivos')
			// festivos.forEach(function(item){
			// 	text += `${regresaTextoCero(item.dia)}-${regresaTextoCero(item.mes)}-${regresaTextoCero(item.year)},`;
			// })
			
			// objDiasFaltantes.forEach(function( obj, index ) {
			// 	finded = text.search(obj.fecha);
			// 	if (finded >= 0) {
			// 		objDiasFaltantes.splice(index,1)
			// 	}
			// })

			festivos.forEach(function(festivo){
				objDiasFaltantes.forEach(function(fecha, index){
					spliting = fecha.split('-');
					dia = parseInt(spliting[0]);
					mes = parseInt(spliting[1])
					year = parseInt(spliting[2])
					if (festivo.mes == mes && festivo.dia == dia && festivo.year == year) {
						objDiasFaltantes.splice(index,1)
					}
				})
			})

			resolve(objDiasFaltantes); 
		})
	})

}

