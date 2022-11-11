function cargarModuloActividades(){
	const KEY = localStorage.getItem('RFC_KEY');
	const USER_APP = localStorage.getItem('USER_APP');

	// mostrarActividadesRegistradas({ rfc: KEY, user: USER_APP});
}

function guardarDescripcionActividad(){
	const inputActividad = document.getElementById('inputActividad');
	const messageRandomContainer = document.getElementById('messageRandomContainer');
	const db = getDatabase();
	const KEY = localStorage.getItem('RFC_KEY');
	const USER_APP = localStorage.getItem('USER_APP');


	let valorActividad = decodeCaracteres(inputActividad.textContent); 

	if (valorActividad !== '') {
		return getMaxIdActividad(KEY, USER_APP)
		.then(function(key){
			db.transaction(function (tx){
				// falta agregar el usuario
				tx.executeSql(`INSERT INTO TBL_ACTIVIDADES VALUES (?,?,'none',?,?)`, [key+1,valorActividad, KEY, USER_APP])
			},function(err){
				console.error(err)	
			}, function(){
				inputActividad.textContent = '';
				messageRandomContainer.innerHTML = '';
				return mostrarActividadesRegistradas({ descripcion_actividad: valorActividad, id_actividad: (key+1), rfcusuario: KEY, claveusr: USER_APP });			
			})
		})
	} else {
		messageRandomContainer.innerHTML = 'No contiene descripción su actividad';
	}
}

function getMaxIdActividad(rfc, clave){
	const db = getDatabase();
	return new Promise(function(resolve, reject){
		db.transaction(function(tx){
			tx.executeSql(`SELECT max(id_actividad) number FROM TBL_ACTIVIDADES WHERE rfcusuario =? AND claveusr=?`,[rfc, clave], function(tx, results){
				let number = results.rows[0].number;
				if(results.rows[0].number === null){
					number = 0;
				}
				resolve(number);
			})
		}, function(err){
			reject(err)
		})
	})
}

function mostrarActividadesRegistradas(object){
	const listaActividades = document.getElementById('listaActividades');
	const db = getDatabase();
	let elemento = '', resultados = 0;
	return new Promise(function(resolve, reject){
		let estado = false;
		if(object.descripcion_actividad){
			estado = true;
		} 
		resolve(estado);
	})
	.then(function(tipoInsersion){
		if (tipoInsersion) {
			return [object]
		} 
		return new Promise(function(resolve, reject){
			return db.transaction(function(tx){
				tx.executeSql(`SELECT * FROM TBL_ACTIVIDADES WHERE rfcusuario =? AND claveusr=?`,[object.rfc, object.user], function(tx, results){
					resultados = results.rows.length;
					let i = 0;
					let access = results.rows;
					resolve(access);
				})
			}, function(err){
				reject(err)
			})
		})
	})
	.then(function(object){
		console.warn(object)
		let { length } = object; 
		for(let i = 0; i < length; i++){
			elemento += `
				<div class="item-act-random" parenIdActividad="${object[i].id_actividad}" id="fatherRandom-${object[i].id_actividad}">
					<div class="agarrate-act" onclick="marcarRandom(this)" idActividad="${object[i].id_actividad}">
						<div class="random-ref">${object[i].id_actividad}</div>
						<div class="description-ref" id="randomId-${object[i].id_actividad}">${object[i].descripcion_actividad}</div>
					</div>
					<div class="options-act-random">
						<div class="option-act">
							<span class="material-icons" onclick="crearAreaEditarRandomActividad('${convertToStringParams(object[i])}')">edit</span>
						</div>
						<div class="option-act">
							<span class="material-icons" onclick="deleteRandomActividad('fatherRandom-${object[i].id_actividad}','${convertToStringParams(object[i])}')">delete_forever</span>
						</div>
					</div>
				</div>
			`;
		}
			
		return listaActividades.insertAdjacentHTML('beforeend', elemento)
	})
}

const marcarRandom = e => {
	const className = 'random-marked';
	const stringId = 'fatherRandom-' + e.getAttribute('idActividad'); 
	const parentElement = document.getElementById(stringId);
	const clases = parentElement.classList.toString().search(className)
	if(clases >= 0){
		parentElement.classList.remove(className);

		e.removeAttribute('estadoRandom','selected')
	} else {
		parentElement.classList.add(className)
		e.setAttribute('estadoRandom','selected')
	}
} 

function convertToStringParams(object){
	let params = JSON.stringify(object);
	params = params.replace(/"/g,"\\'")
	return params;
}

// function leerFechasRandom(){
// 	const inpInicio = document.getElementById('inpInicio');
// 	const inpFin = document.getElementById('inpFin');
// 	let inicio = inpInicio.value;
// 	const messageActRandom = document.getElementById('messageActRandom')
// 	let fin = inpFin.value;
// 	return new Promise(function(resolve, reject){
// 		if (inicio !== '' && fin !== '') {
// 			// console.log('A validar', inicio, fin)
// 			resolve(obtenerFechasDe(inicio, fin))
// 		} else {
// 			reject('No hay valores en las fechas')
// 		}
// 	})
// 	.then(function(object){
// 		const checkerList = document.getElementsByName('checkerList');
// 		let seleccionadas = [];
// 		let count = 0;
// 		// let numbers = [3,4,5];
// 		// let random = Math.floor(Math.random()*numbers.length);
// 		let message = 'No a seleccionado ninguna actividad';

// 		 checkerList.forEach(function(item){
// 		 	if(item.checked){
// 				seleccionadas.push(item.id)
// 				count++;
// 		 	}
// 		})
// 		if (count >= 5) {
// 			return crearActividadesRandom(object, seleccionadas);
// 		} else {
// 			message = 'Seleccionar al menos 5 actividades seleccionadas: '+count;
// 		}

// 		return Promise.reject(message);
// 	})
// 	.catch(function(err){
// 		messageActRandom.innerHTML = err;
// 	})
// }

function getInicioHomeOffice(rfc, user){
	const db = getDatabase();
	return new Promise(function(resolve, reject){
		db.transaction(function(tx){
			tx.executeSql(`SELECT inicio_homeoff FROM TBL_USUARIO WHERE rfc_usuario = ? AND claveusr = ?`,[rfc, user], function(tx, results){
				resolve(results.rows)
			})
		}, function(err){
			reject(err)
		})
	})
}

// function obtenerFechasDe(inicio, fin, rfc){
// 	let fechaInicio = crearObjectFecha(inicio); 
// 	let fechaFin = crearObjectFecha(fin);
// 	let KEY = localStorage.getItem('RFC_KEY');
// 	if (fechaInicio <= fechaFin) {
// 		return validacionesHomeOffice(inicio, KEY, fechaFin)
// 	}
// 	return Promise.reject('La fecha de fin no puede ser menor')

// }

// dd-mm-aaaa
function crearObjectFecha(cadena){
	if (cadena.length > 0) {
		let date = cadena.split('-');
		let year = date[2]
		let month = date[1]-1;
		let day = date[0]
		return new Date(year, month, day);
	} else {
		return null;
	}
}

// function marcarActividadRandom(cadenaId, row){
// 	let status = document.getElementById(cadenaId);
// 	let padre = document.getElementById(row);
// 	console.log(status)
// 	console.log(row)
// 	if (!status.checked) {
// 		padre.classList.add('marked');
// 	} else {
// 		padre.classList.remove('marked');
// 	}
// }

// function deleteRegistrosPrevios(object, rfc, user){
// 	const db = getDatabase()
// 	let valuesIn = JSON.stringify(object);
// 	valuesIn = valuesIn.replace(/\]/g,')')
// 	valuesIn = valuesIn.replace(/\[/g,'(')

// 	console.log(JSON.stringify(object).toString())
// 	return new Promise(function(resolve, reject){
// 		db.transaction(function(tx){
// 			// console.log(`DELETE FROM TBL_CAMPOS WHERE fecha in ${valuesIn} AND rfcusuario = ${rfc} AND claveusr ="${user}"`)
// 			tx.executeSql(`DELETE FROM TBL_CAMPOS WHERE fecha in ${valuesIn} AND rfcusuario = ? AND claveusr =?`,[ rfc, user])
// 		},function(err){
// 			reject(err)
// 		}, function(){
// 			// console.log('Elimino correctamente')
// 			resolve()
// 		})
// 	})

// }



function deleteRandomActividad(idElemento, objectString){
	let object = JSON.parse(objectString.replace(/'/g,'"'));
	const elemento = document.getElementById(idElemento);
	// // console.log(idElemento)
	const db = getDatabase()
	return new Promise(function(resolve, reject){
		db.transaction(function(tx){
			tx.executeSql(`DELETE FROM TBL_ACTIVIDADES WHERE id_actividad=? AND rfcusuario=? AND claveusr=?`,[object.id_actividad, object.rfcusuario, object.claveusr])				
		}, function(err){
			reject(err)
		}, function(){
			resolve()
		})
	})
	.then(function(){
		return elemento.remove(); 
	})
}

function crearAreaEditarRandomActividad(objectString){
	let object = JSON.parse(objectString.replace(/'/g,'"'));
	// console.warn(object)
	const btGuardarRandom = document.getElementById('btGuardarRandom');
	const inputActividad = document.getElementById('inputActividad');
	btGuardarRandom.innerHTML = 'ACTUALIZAR'
	// btGuardarRandom.setAttribute('onclick', `actualizarRandomActividad("${objectString}")`);
	btGuardarRandom.setAttribute('onclick', "actualizarRandomActividad(" + objectString +")");
	inputActividad.innerHTML = object.descripcion_actividad
}

function actualizarRandomActividad(object){
	const db = getDatabase()
	const inputActividad = document.getElementById('inputActividad');
	const messageRandomContainer = document.getElementById('messageRandomContainer');
	const btGuardarRandom = document.getElementById('btGuardarRandom');
	let value = inputActividad.textContent; 

	return new Promise(function(resolve, reject){
		if(value !== ''){
			resolve()
		}
		// messageActRandom.innerHTML = 'La actividad no puede estar vacia'		
	})
	.then(function(){
		return new Promise(function(resolve, reject){
			db.transaction(function(tx){
				tx.executeSql(`UPDATE TBL_ACTIVIDADES SET descripcion_actividad = ? WHERE id_actividad= ? AND rfcusuario = ? and claveusr = ?`,[value, object.id_actividad, object.rfcusuario, object.claveusr])
			}, function(err){
				reject(err)
			}, function(){
				resolve()
			})
		})
	})
	.then(function(){
		messageRandomContainer.innerHTML = `Registro actualizado. [${object.id_actividad}]`		
		inputActividad.innerHTML = '';
		btGuardarRandom.setAttribute('onclick', `guardarDescripcionActividad()`);
		btGuardarRandom.innerHTML = 'GUARDAR'
		const element = document.getElementById('randomId-'+object.id_actividad);
		element ? element.innerHTML = value : '';
	})

}


// MODULO DE RAN

const desmarcarMarcar = () => {
	return getDatesSegunStatus()
	.then( array => {
		// volver a estado original días sin marcar
		const dias = document.getElementsByClassName('day');
		let searchR = -1;
		for(let i = 0; i < dias.length; i++){
			if(dias[i].hasAttribute('id')){
				searchR = dias[i].classList.toString().search(/random-class/g)
				if(searchR >= 0){
					dias[i].classList.remove('random-class');
					dias[i].style.backgroundColor = 'white'
				}
			}
		}	
		// volver a estado original días sin marcar
		// marcar estado segun estan en bd
		let element = null;
		array.map( day => {
			element = document.getElementById(day.id);
			// devuelve color anteriormente marcado
			element ? element.style.backgroundColor = day.colorToGroup : false
		})
		// marcar estado segun estan en bd
		return array;
	})
}

const marcarFechas = array => {
	// console.warn(array)
	let start = 0;
	let end = 0;
	let element = null;
	const infoRandomSeleccion = document.getElementById('infoRandomSeleccion');
	const randomSeleccionBtns = document.getElementById('randomSeleccionBtns');
	const specific = getDiasFestivos(); 
	desmarcarMarcar()
	.then(() => {
		const uno = array[0].default
		const dos = array[1].default

		if(uno >= dos){
			start = array[1];
			end = array[0];
		}
		if(dos >= uno){
			start = array[0];
			end = array[1];
		}
		// console.log('#2 ', array)
		start.diaObject = getStringDia(start.dayWeek);
		end.diaObject = getStringDia(end.dayWeek);

		const valores = getDatesArray(start.default, end.default,{ daysOfWeek:[0,6], specific: specific})
		console.log('#2',valores)
		valores.map( ({id, value, colorToGroup, full, disabled, month, year}) => {
			if(month === 11 && year === 2022){
				console.log('%s %s', colorToGroup, full)
			}
			if(disabled === false){
				// id-18-11-2022
				element = document.getElementById(id);
				if(element){
					element.classList.add('random-class');
					element.style.backgroundColor = '#bb9457';
					// element.style.color = 'white';
				}
				// console.log(colorToGroup)
				
			} 
		})
		infoRandomSeleccion.innerHTML = `<br>
		<div class="item-fecha-s">
			<div class="tle">INICIO:</div><div class="vle">${start.diaObject.string}, ${start.full}</div>
		</div>
		<div class="item-fecha-s">
			<div class="tle">FIN:</div><div class="vle">${end.diaObject.string}, ${end.full}</div>
		</div>
		`;
		randomSeleccionBtns.innerHTML=`
			<button  class="btn-option" id="generatorId" onclick="leerArreglo(${JSON.stringify(_arrayDates)})">GENERAR</button>
			<button  class="btn-option" id="cancelableId">CANCELAR</button>
		`;
		const messageRandomContainer = document.getElementById('messageRandomContainer');
		messageRandomContainer.innerHTML = '';

	})
	.then( () => {
		const cancelableId = document.getElementById('cancelableId');
		cancelableId.onclick = () => {
				return desmarcarMarcar()
				.then( () => {
					_arrayDates.splice(0,_arrayDates.length)
					randomSeleccionBtns.innerHTML = '';
					infoRandomSeleccion.innerHTML = '';
				});
		}
	})
	.then( () => {
		const generatorId = document.getElementById('generatorId');

		generatorId.onclick = () => {
			const arrayMarked = document.getElementsByClassName('random-marked');
			const messageRandomContainer = document.getElementById('messageRandomContainer');
			let arrayIds = [];
			let id = null;
			let descripcion = '';
			if(arrayMarked.length > 4){
				for(let i = 0; i < arrayMarked.length; i++){
					id = arrayMarked[i].getAttribute('parenIdActividad');
					descripcion = document.getElementById('randomId-'+ id).textContent
					arrayIds.push({idActividad: id, descripcionActividad: descripcion})
				}
				const arrayFechasSeleccionadas = getDatesArray(start.default, end.default,{ daysOfWeek:[0,6], specific: specific});
				return generarActividadesRandom(arrayIds, arrayFechasSeleccionadas)
				.then( () => {
					randomSeleccionBtns.innerHTML = '';
					infoRandomSeleccion.innerHTML = '';
					// messageRandomContainer.innerHTML = `Se generaron actividades para ${arrayFechasSeleccionadas.length} fechas.`
				})

			} else {
				// 5 bro
				console.log('Debes seleccionar al menos 5 actividades')
				messageRandomContainer.innerHTML = 'Debes seleccionar al menos 5 actividades para comenzar a generar registros.';
			}

		}
		// consolen
		// parenIdActividad

	})
}

const generarActividadesRandom = (arrayActividades, arrayDatesSeleccion) => {
	const RFC = localStorage.getItem('RFC_KEY');
	const USER_APP = localStorage.getItem('USER_APP');
	const datesEnabled = arrayDatesSeleccion.filter(({ disabled}) => disabled === false)
	const messageRandomContainer = document.getElementById('messageRandomContainer');

	// const arrayFechasSeleccionadas = getDatesArray(start.default, end.default,{ daysOfWeek:[0,6], specific: specific});
	return deleteRegistrosPrevios(datesEnabled, RFC, USER_APP)
	.then( () => {
		// const datesEnabled = arrayDatesSeleccion.filter(({ disabled}) => disabled === false)
		return createInsertsActividadesRandom(arrayActividades, datesEnabled, RFC, USER_APP)
	})
	.then( query => {
		return insertarRandomActividades(query)
	})
	.then( () => desmarcarMarcar() ) 
	.then( () => _arrayDates.splice(0,_arrayDates.length) )
	.then( () => messageRandomContainer.innerHTML = `Se generaron actividades para ${datesEnabled.length} fecha${datesEnabled.length > 1 ? 's' : ''}.`)
	

	// return Promise.resolve()

}

const insertarRandomActividades = queryTxt => {
	const db = getDatabase()
	return new Promise( (resolve, reject) =>{
		db.transaction( tx => {
			tx.executeSql(queryTxt)
		}, err => reject(err) , () => resolve() )
	})
}

const createInsertsActividadesRandom = (arrayActividades, arrDates, rfc, userApp) => {

	let random = '';
	let insertsGlb = 'INSERT INTO TBL_CAMPOS VALUES ';
	let mapeo = arrayActividades.map( ({idActividad}) => idActividad) 
	let numbers = [3,4,5];
	return new Promise(function(resolveP1, reject){
		let promesa1 = null;
		let counter = 1;
		for (let a = 0, promesa1 = Promise.resolve(); a < arrDates.length; a++) {
			promesa1 = promesa1.then(() => {
				random = Math.floor(Math.random()*numbers.length);
					return numbers[random];
			})
			.then( randomNumber => {
				console.log('---------------------------------')
				console.log('fecha: ', arrDates[a])
				console.log('random',randomNumber)
				console.log(arrayActividades)
				let j = 0;
				let randomIdAct = 0;
				let selector = [];
				do{
					let idActividades = Math.floor(Math.random()*arrayActividades.length);
					// console.log(arrayActividades[idActividades])
					if (!selector.includes(arrayActividades[idActividades])) {
						selector.push(arrayActividades[idActividades])
						j++;
					}
				}while(j < randomNumber)
				return selector; 
			})
			.then( randomSelection => {
				// console.log(arrIdActividades)
				let insert = '(';
				randomSelection.map( ({idActividad, descripcionActividad}, index) => {
					insert += `"${descripcionActividad}",`;
					// console.log('(%s)',index)
					if((randomSelection.length-1) === index){
						for(let end = 0; end < (20-randomSelection.length); end++){
							insert += '"",';						
						}
						insert += `${0},"${arrDates[a].value}","${rfc}","${userApp}")`
					}
				})
				return insert;
			})
			.then( insert => {
				let end = insert;
				if(counter == arrDates.length){
					end += ';'
					insertsGlb += end;
					resolveP1(insertsGlb)
					console.log('Termino de recorrer')
				} else {
					end += ',\n' 
					insertsGlb += end;
				}
				counter++;
			})
		}
	})
	// .then( inserts => console.log(inserts))
}

const  deleteRegistrosPrevios = (object, rfc, user) => {
	const db = getDatabase()
	const arrStringDates = object.map(({ value }) => value )
	let valuesIn = JSON.stringify(arrStringDates);
	valuesIn = valuesIn.replace(/\]/g,')')
	valuesIn = valuesIn.replace(/\[/g,'(')

	return new Promise(function(resolve, reject){
		db.transaction(function(tx){
	// 		// console.log(`DELETE FROM TBL_CAMPOS WHERE fecha in ${valuesIn} AND rfcusuario = ${rfc} AND claveusr ="${user}"`)
			tx.executeSql(`DELETE FROM TBL_CAMPOS WHERE fecha in ${valuesIn} AND rfcusuario = ? AND claveusr =?`,[ rfc, user])
		},function(err){
			reject(err)
		}, function(){
			// console.log('Registros eliminados para: ', valuesIn)
			resolve()
		})
	})
}

const cancelarRandomSelection = arrayMarked => {
	return desmarcarMarcar()
	.then( array => {
		console.log(arrayMarked)
	});
}