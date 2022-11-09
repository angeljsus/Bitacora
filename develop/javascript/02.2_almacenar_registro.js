/*
	Función para almacenar el registro desde el modulo de registros
*/

function almacenarRegistro(){
	const mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
	const inpRfcUser = document.getElementById('inpRfcUser');
	const inpFecReg = document.getElementById('inpFecReg')
	const selStatus = document.getElementById('selStatus');
	const db = getDatabase();
	let USER_APP = localStorage.getItem('USER_APP'), queryText = '', cantResults = 0, i = 0, element = '', contador = 0, continuar = false;
	let tipoConsulta = '';
	mensajeRespuestaForm.innerHTML = '';
	// validar si los datos tienen registro la fecha y en caso de ser de actividades que existan actividades registradas
	if (inpFecReg.value !== '') {
		if (selStatus.value > 0) {
			continuar = true;
		} else {
			const inpActiv0 = document.getElementById('inpActiv0');
			if (inpActiv0.textContent !== '') {
				continuar = true;
			} else {
				mensajeRespuestaForm.innerHTML = 'Agrega primera actividad, segunda, tercera...'
			}
		}
	} else {
		// No podrá realizar ningun registro
		mensajeRespuestaForm.innerHTML = 'Es necesario seleccionar una fecha';
		console.warn('Agrega el día que quieres registrar')
	}

	// Si esta todo bien ejecuta la consulta 
	if (continuar) {
		return new Promise( function(resolve, reject){
			db.transaction( function(tx){
				tx.executeSql(`
						SELECT
							*
						FROM
							TBL_CAMPOS
						WHERE
							rfcusuario = ?
						AND
							fecha = ?
						AND
							claveusr = ?
					`, [inpRfcUser.value, inpFecReg.value, USER_APP], function(tx, results){
						cantResults = results.rows.length;
						tipoConsulta = '';
						// si existe el registro genera una consulta para realizar una actualización
						if (cantResults > 0) {
							tipoConsulta = 'update';
							queryText = 'UPDATE TBL_CAMPOS SET '; 
							// recorre los 20 elementos generando la actualización de cada campo
							do {
								// accede a cada elemento obteniendo el valor que contiene
								element = document.getElementById('inpActiv' + i);
								if (element !== null && element.textContent !== '') {
									// si el estatus es mayor a 0 en update cambia todos los campos de actividades a vacias
									if (selStatus.value > 0) {
										queryText +=  'campo_' + (i+1) +' = "",';
									} else {
										// Agrega las actualizaciones en los campos que contienen datos
										// console.log(element)
										queryText +=  'campo_' + (i+1) +' = "'  + encondeCaracteres(element.textContent) + '",';
									}
									contador++;
								} else{
									// las actividades vacias las sigue dejando vacias
									queryText +=  'campo_' + (i+1) +' = "",';
								}
								i++;
							} while (i < 20);
							// agrega los demás campos que necesita la consulta
							queryText += ` capturado = ${selStatus.value} WHERE rfcusuario = "${inpRfcUser.value}" AND fecha = "${inpFecReg.value}" AND claveusr = "${USER_APP}";`; 

						} else {
							// si no existe registro en la fecha seleccionada genera el query para insertar el registro dentro de la base
							// de datos
							tipoConsulta = 'insert';

							queryText = 'INSERT INTO TBL_CAMPOS VALUES (';
							do {
								// accede a los valores de los input que estan cargados dentro del html
								element = document.getElementById('inpActiv' + i);
								if (element !== null && element.textContent !== '') {
									// elimina caracteres raros dentro de la consulta
									queryText +=  '"' + encondeCaracteres(element.textContent) + '",';
									contador++;
								} else {
									// los demás elementos no encontrados agrega el campo vacio
									queryText += '"",';
								}
								i++;
							} while (i < 20)
							// complementa la consulta con los datos faltantes
							queryText += `${selStatus.value},"${inpFecReg.value}","${inpRfcUser.value}","${USER_APP}");`; 
							// console.log(queryText)
							// tx.executeSql(queryText);
						}
						// resuelve la consulta
						resolve([queryText, tipoConsulta])
				})
			}, function(err){
				console.error(err.message)
			})
		})
		.then(function(datos){
			let consultaSqlite = datos[0];
			let tipo = datos[1];
			console.log(consultaSqlite)
			return new Promise(function(resolve, reject){
				// ejecuta la inserción o actualización del registro
				db.transaction( function(tx){
					tx.executeSql(consultaSqlite);
				}, function(err){
					console.error('registro: ' + err.message)
				}, function(){
					if (tipo == 'update') {
						mensajeRespuestaForm.innerHTML = 'Se actualizo el registro.';
					} else {
						mensajeRespuestaForm.innerHTML = 'Se agrego el registro.';
					}
					resolve(tipo);
				})
			})
		})
		.then(function(response){
			console.log('Se ejecuto consulta: ' + response)
			// carga el status del elemento actualizado o agregado
			let itemFechaReg = document.getElementById('itemFechaReg-' + inpFecReg.value);
			let cntRegistrado = document.getElementById('cntRegistrado');
			let cntPendiente = document.getElementById('cntPendiente');
			let cntVacaciones = document.getElementById('cntVacaciones');
			let cntPermiso = document.getElementById('cntPermiso');
			let color = '', valor = 0, cantidad = 0;
			valor = parseInt(selStatus.value); 
			
			switch(valor){
				// registrado
				case 0:
					color = '#80b918'
					break;
				// permiso
				case 1:
					color = '#779be7'
					break;
				// vacaciones
				case 2:
					color = '#588b8b'
					break;
				case 3:
					color = '#ffd000'
					break;
			}
			itemFechaReg ? itemFechaReg.style = `background: ${color};` : '';
			console.log(`SELECT capturado, count(fecha) FROM TBL_CAMPOS WHERE rfcusuario = '${inpRfcUser.value}' AND claveusr = '${USER_APP}' GROUP BY  capturado`)
			db.transaction( function(tx){
				tx.executeSql(`
					SELECT
						inicio_homeoff
					FROM
						TBL_USUARIO
					WHERE
						rfc_usuario = ?
					AND
						claveusr = ?
					`,[inpRfcUser.value, USER_APP], function(tx, results){
						cantResults = results.rows.length;
						if (cantResults > 0) {
							actualizarCantidades(results.rows[0].inicio_homeoff, inpRfcUser.value);
						}
				})
			}, function(err){
				console.error(err.message)
			})
		})
	} //end continuar

}
