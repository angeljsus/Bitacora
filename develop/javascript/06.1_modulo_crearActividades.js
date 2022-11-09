function cargarModuloActividades(){
	const KEY = localStorage.getItem('RFC_KEY');
	const USER_APP = localStorage.getItem('USER_APP');

	// mostrarActividadesRegistradas({ rfc: KEY, user: USER_APP});
}

function guardarDescripcionActividad(){
	const inputActividad = document.getElementById('inputActividad');
	const messageActRandom = document.getElementById('messageActRandom');
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
				messageActRandom.innerHTML = '';
				return mostrarActividadesRegistradas({ descripcion_actividad: valorActividad, id_actividad: (key+1), rfcusuario: KEY, claveusr: USER_APP });			
			})
		})
	} else {
		messageActRandom.innerHTML = 'No contiene descripción su actividad';
	}
}

function getMaxIdActividad(rfc, clave){
	const db = getDatabase();
	return new Promise(function(resolve, reject){
		db.transaction(function(tx){
			tx.executeSql(`SELECT max(id_actividad) number FROM TBL_ACTIVIDADES WHERE rfcusuario =? AND claveusr=?`,[rfc, clave], function(tx, results){
				let number = results.rows[0].number;
				if(results.rows[0].number === null){
					number = 1;
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
		let { length } = object; 
		for(let i = 0; i < length; i++){
			elemento += `
				<div class="item-act-random" id="fatherRandom-${object[i].id_actividad}">
					<div class="agarrate-act">
						<input
							name="checkerList" 
							class="checker" 
							type="checkbox" 
							id="random-${object[i].id_actividad}">
							<label 
								id="label-random-${object[i].id_actividad}"
								onclick="marcarActividadRandom('random-${object[i].id_actividad}', 'fatherRandom-${object[i].id_actividad}')" 
								for="random-${object[i].id_actividad}">${object[i].descripcion_actividad}</label>
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


function convertToStringParams(object){
	let params = JSON.stringify(object);
	params = params.replace(/"/g,"\\'")
	return params;
}

function leerFechasRandom(){
	const inpInicio = document.getElementById('inpInicio');
	const inpFin = document.getElementById('inpFin');
	let inicio = inpInicio.value;
	const messageActRandom = document.getElementById('messageActRandom')
	let fin = inpFin.value;
	return new Promise(function(resolve, reject){
		if (inicio !== '' && fin !== '') {
			// console.log('A validar', inicio, fin)
			resolve(obtenerFechasDe(inicio, fin))
		} else {
			reject('No hay valores en las fechas')
		}
	})
	.then(function(object){
		const checkerList = document.getElementsByName('checkerList');
		let seleccionadas = [];
		let count = 0;
		// let numbers = [3,4,5];
		// let random = Math.floor(Math.random()*numbers.length);
		let message = 'No a seleccionado ninguna actividad';

		 checkerList.forEach(function(item){
		 	if(item.checked){
				seleccionadas.push(item.id)
				count++;
		 	}
		})
		if (count >= 5) {
			return crearActividadesRandom(object, seleccionadas);
		} else {
			message = 'Seleccionar al menos 5 actividades seleccionadas: '+count;
		}

		return Promise.reject(message);
	})
	.catch(function(err){
		messageActRandom.innerHTML = err;
	})
}

function crearActividadesRandom(object, actividades){
	// console.log(object)
	const messageActRandom = document.getElementById('messageActRandom')
	const KEY = localStorage.getItem('RFC_KEY');
	const USER_APP = localStorage.getItem('USER_APP');
	let numbers = [3,4,5];
	let random = 0;
	let idActividades = '';
	let id = '';
	let concatInserts = '';
	let promesa1 ='';
	let fecha = '';
	return new Promise(function(resolveP1, reject){
		for (let a = 0, promesa1 = Promise.resolve(); a < object[0].length; a++) {
			promesa1 = promesa1
			.then(function(){
				if (object[0][a].length > 0) {
					return deleteRegistrosPrevios(object[0][a],KEY,USER_APP);
				} 
				return;
			})
			.then(function(){
				if (object[0][a].length > 0) {
					console.log(object[0][a])
					return new Promise(function(resolveP2, reject){
						let insertsGlb = 'INSERT INTO TBL_CAMPOS VALUES ';
						let promesa2 = '';
						for (let i = 0, promesa2 = Promise.resolve(); i < object[0][a].length; i++) {
							promesa2 = promesa2
							.then(function(){
								// fecha = object[0][a][i];
								random = Math.floor(Math.random()*numbers.length);
								return numbers[random];
								// console.log(fecha)
							})
							.then(function(random){
								let j = 0;
								let randomIdAct = 0;
								let selector = [];
								console.log('iteracion: ',i)
								do{
									idActividades = Math.floor(Math.random()*actividades.length);
									// console.log(actividades[idActividades])
									if (!selector.includes(actividades[idActividades])) {
										selector.push(actividades[idActividades])
										j++;
									}
								}while(j < random)
								return selector; 
							})
							.then(function(objectIds){
						  	// console.log(objectIds)
						  	let promise3 = '';
						  	let value = '';
						  	let inserts = '(';
							  	return new Promise(function(resolveQuerys, reject){
										for (let j = 0, promise3 = Promise.resolve(); j < objectIds.length; j++) {
											promise3 = promise3.then(function() {
												value = document.getElementById('label-'+objectIds[j]);
												inserts += `"${value.textContent}",`;

												if((objectIds.length-1)==j){
													for(let end = 0; end < (20-objectIds.length); end++){
														inserts += '"",';						
													}
													inserts += `${0},"${object[0][a][i]}","${KEY}","${USER_APP}")`
													resolveQuerys(inserts)
												}

											})

										}
							  	})
						  })
							.then(function(insert){
								let end = insert;
								// console.log(insert)
								if((object[0][a].length-1) == i){
									end += ';'
									insertsGlb += end;
									resolveP2(insertsGlb)
									console.log('Termino de recorrer child')
								} else {
									end += ',\n' 
									insertsGlb += end;
								}
							})

						}

					})
				}

			})
			.then(function(querys){
				if (querys) {
					insertarRandomActividades(querys);
				}
				if ((object[0].length-1) == a) {
					console.warn('Termino el proceso')
					resolveP1(true)
				} 

			})
		}
	})
	.then(function(stat){
		messageActRandom.innerHTML = 'Se crearon las actividades.'
		return getInicioHomeOffice(KEY, USER_APP)
		.then(function(obj){
			return desplegaDiasConStatus(obj[0].inicio_homeoff, KEY, 'registrado')
			console.warn('Termino de crear.')
		})
	})

}

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

function obtenerFechasDe(inicio, fin, rfc){
	let fechaInicio = crearObjectFecha(inicio); 
	let fechaFin = crearObjectFecha(fin);
	let KEY = localStorage.getItem('RFC_KEY');
	if (fechaInicio <= fechaFin) {
		return validacionesHomeOffice(inicio, KEY, fechaFin)
	}
	return Promise.reject('La fecha de fin no puede ser menor')

}

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

function marcarActividadRandom(cadenaId, row){
	let status = document.getElementById(cadenaId);
	let padre = document.getElementById(row);
	console.log(status)
	console.log(row)
	if (!status.checked) {
		padre.classList.add('marked');
	} else {
		padre.classList.remove('marked');
	}
}

function deleteRegistrosPrevios(object, rfc, user){
	const db = getDatabase()
	let valuesIn = JSON.stringify(object);
	valuesIn = valuesIn.replace(/\]/g,')')
	valuesIn = valuesIn.replace(/\[/g,'(')

	console.log(JSON.stringify(object).toString())
	return new Promise(function(resolve, reject){
		db.transaction(function(tx){
			// console.log(`DELETE FROM TBL_CAMPOS WHERE fecha in ${valuesIn} AND rfcusuario = ${rfc} AND claveusr ="${user}"`)
			tx.executeSql(`DELETE FROM TBL_CAMPOS WHERE fecha in ${valuesIn} AND rfcusuario = ? AND claveusr =?`,[ rfc, user])
		},function(err){
			reject(err)
		}, function(){
			// console.log('Elimino correctamente')
			resolve()
		})
	})

}

function insertarRandomActividades(queryTxt){
	// console.log(queryTxt)
	const db = getDatabase()
	return new Promise(function(resolve, reject){
		db.transaction(function(tx){
			tx.executeSql(queryTxt)
		}, function(err){
			reject(err)
		}, function(){

		})
	})
}

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
	// let object = JSON.parse(objectString.replace(/'/g,'"'));
	const db = getDatabase()
	const inputActividad = document.getElementById('inputActividad');
	const messageActRandom = document.getElementById('messageActRandom');
	const btGuardarRandom = document.getElementById('btGuardarRandom');
	let value = inputActividad.textContent; 

	return new Promise(function(resolve, reject){
		if(value !== ''){
			resolve()
		}
		messageActRandom.innerHTML = 'La actividad no puede estar vacia'		
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
		messageActRandom.innerHTML = '¡Registro actualizado!'		
		inputActividad.innerHTML = '';
		btGuardarRandom.setAttribute('onclick', `guardarDescripcionActividad()`);
		document.getElementById('label-random-'+object.id_actividad).innerHTML = value;
	})

}