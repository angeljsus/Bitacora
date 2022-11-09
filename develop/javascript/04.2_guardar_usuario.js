function validarUsuarioBitacora(update){
	const inpRfcUser = document.getElementById('inpRfcUser');
	const inpNmeUser = document.getElementById('inpNmeUser');
	const inpDgaUser = document.getElementById('inpDgaUser');
	const inpHomeOff = document.getElementById('inpHomeOff');
	const inpPueUser = document.getElementById('inpPueUser');
	const btInptDate = document.getElementById('btInptDate');
	const inpFilUser = document.getElementById('inpFilUser');
	const registrosUsuarios = document.getElementById('registrosUsuarios');

	let mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
	mensajeRespuestaForm.innerHTML = '';
	let status = true;
	let formData = {nombre :'',dga :'',inicio:'', rfc:'', puesto: ''};
	let USER_APP = localStorage.getItem('USER_APP');


	if (inpNmeUser.value == '') {status=false};
	if (inpDgaUser.value == '') {status=false};
	if (inpHomeOff.value == '') {status=false};
	if (inpRfcUser.value == '' ) {status=false};
	if (inpPueUser.value == '' ) {status=false};

	if (inpRfcUser.value.length < 13 ) {status=false};
	
	if (status) {
		formData.nombre = encondeCaracteres(inpNmeUser.value);
		formData.dga = encondeCaracteres(inpDgaUser.value);
		formData.inicio = encondeCaracteres(inpHomeOff.value);
		formData.rfc = encondeCaracteres(inpRfcUser.value);
		formData.puesto = encondeCaracteres(inpPueUser.value);
		guardarUsuarioBitacora(formData, update, USER_APP)
			.then(function(respuesta){
				if (respuesta) {
					// if (update) {
					// 	cargarModuloUsuarios();
					// 	mensajeRespuestaForm.innerHTML = 'El registro se actualizo';

					// } else {
					// 	registrosUsuarios.insertAdjacentHTML(`beforeend`,`
					// 		<div class="row-user" onclick="editarRegistroUsuario('${formData.rfc}')">
					// 			<div class="column-user-data">${formData.nombre}</div>
					// 			<div class="column-user-data">${formData.rfc}</div>
					// 		</div>
					// 	`)
					// 	inpNmeUser.value = '';
					// 	inpDgaUser.value = '';
					// 	inpHomeOff.value = '';
					// 	inpRfcUser.value = '';
					// 	inpPueUser.value = '';
					// 	mensajeRespuestaForm.innerHTML = 'Registro guardado.';

					// }
					if (inpFilUser.files[0] && inpFilUser.files) {
						return leerArchivoBitacora(formData.rfc, formData.inicio, USER_APP);
						console.warn('Leer archivo excel')
					} else {
						return 'El registro fue modificado.'
					}
				}
			})
			.then(function(message){
				console.log('--> ' + message)
				if (update) {
					cargarModuloUsuarios();
					mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
					mensajeRespuestaForm.innerHTML = message;

				} else {
				const nameFileDisp = document.getElementById('nameFileDisp');

					registrosUsuarios.insertAdjacentHTML(`beforeend`,`
						<div class="row-user" id="code${formData.rfc}">
							<div class="column-user-data">${formData.nombre}</div>
							<div class="column-user-data">${formData.rfc}</div>
							<div class="column-opt-data" onclick="editarRegistroUsuario('${formData.rfc}','${USER_APP}')"><span class="material-icons">edit</span></div>
							<div class="column-opt-data" onclick="observarDatosUsuario('${formData.rfc}')"><span class="material-icons">fact_check</span></div>
							<div class="column-opt-data"><span class="material-icons" onclick="eliminarDatosUsuario('${formData.rfc}','${USER_APP}')">delete_forever</span></div>
						</div>
					`)
					inpNmeUser.value = '';
					inpDgaUser.value = '';
					inpHomeOff.value = '';
					inpRfcUser.value = '';
					inpPueUser.value = '';
					mensajeRespuestaForm.innerHTML = 'Registro guardado.';
					nameFileDisp.innerHTML = 'Archivo de bitácora';
					nameFileDisp.style = 'color: gray;'
					// mensajeRespuestaForm.innerHTML = message;

				}
			})
			.catch(function(err){
				console.log(err)
			})
	} else {
		mensajeRespuestaForm.innerHTML = 'Faltan campos requeridos.'
	}
}
function leerArchivoBitacora(rfc, inicioHome, userApp){
	const inpFilUser = document.getElementById('inpFilUser');
	const bookBitaco = new Excel.Workbook();
	let objSheetsNames = [];
	let spliting, day, month, year, posibleName;
	const db = getDatabase();
	openStatus('Verificando archivo', false)


	return new Promise( function(resolve, reject){
		db.transaction( function(tx){
			tx.executeSql(`DELETE FROM TBL_CAMPOS WHERE rfcusuario=? AND claveusr = ?`,[rfc, userApp])
		}, function(err){
			console.error(err.message)
		}, function(){
			console.log('Evaluando registros anteriores.')
			agregarStatus('Evaluando registros...', false)

			resolve()
		})
	}).then(function(){
		return new Promise(function(resolve, reject){
			// console.warn(inicioHome + ' -- ' +rfc)
			// obtengo el objeto y lo espero para leerlo
			return new Promise(function(resolve, reject){
				let  obj = validacionesHomeOffice(inicioHome, rfc)
				resolve(obj)
			})
			.then(function(obj){
				return obtenerRegistrosFaltantes(obj[0], obj[1])
			})
			.then(function(objDiasPosibles){
					let spliting = '';
					let formatoBit = '';
					console.log('Hojas posibles a encontrar: ' + objDiasPosibles.length)
					// hago una cadena de fechas con formato de bitácora
					objDiasPosibles.forEach(function(date){
						spliting = date.split('-');
						formatoBit += `${spliting[2]}${spliting[1]}${spliting[0]},`;
					})
					// console.log('Formato bit: ' + formatoBit)
					let finded = -1;
					// busco la cadena de fecha de nombre de hoja que almacenaré dentro de la aplicación
					bookBitaco.xlsx.readFile(inpFilUser.files[0].path)
						.then(function(book){
							book.eachSheet(function(worksheet, sheetId){
								finded = formatoBit.search(worksheet.name);
								if (finded >= 0) {
									objSheetsNames.push(worksheet.name)
									console.log('Hoja encontrada: ' + worksheet.name);
								}
							})
						}).then(function(){
							// console.log('Terminando de encontrar hojas compatibles con formato...')
							console.log('Hojas compatibles encontradas: ' + objSheetsNames.length)
							agregarStatus('Hojas compatibles encontradas: ' + objSheetsNames.length, false)

							let hoja = '';
							let valueCol = '';
							let i = 0;
							let comma = ',';
							let sqlQuery = '';
							bookBitaco.xlsx.readFile(inpFilUser.files[0].path)
								.then(function(book){
									let end = objSheetsNames.length;
									objSheetsNames.forEach(function(sheet, index){
										sqlQuery += '(';
										hoja = book.getWorksheet(sheet);
										hoja.eachRow({ includeEmpty: false }, function(row, rowNumber) {
											if (rowNumber >= 13) {
												valueCol = row.getCell(3)
												if (valueCol !== '') {
													sqlQuery += `"${encondeCaracteres(valueCol.value)}",`;
													// console.log('Valor encontrado: ' + valueCol.value +' en row: ' + rowNumber)
												}
												// console.log(row)
											}
										})
									// console.log(index)
									// console.log(end)
									i++;

									if (end == i) {
										comma = ';';
									}
									sqlQuery += `0,"${sheet.substring(6,8)}-${sheet.substring(4,6)}-${sheet.substring(0,4)}","${rfc}", "${userApp}")${comma}\n`;

								})
								if (objSheetsNames.length > 0) {
									sqlQuery = 'INSERT INTO TBL_CAMPOS VALUES ' + sqlQuery;
								}
								return {sqlQuery, objSheetsNames};
							}).then(function(obj){
								// console.log(query)
								// let mensaje = 'No se encontraron hojas compatibles';
								if (obj.sqlQuery !== '') {
									db.transaction( function(tx){
										agregarStatus('Insertando registros, un momento...', false)
										tx.executeSql(obj.sqlQuery)

										// console.log(query)
									}, function(err){
										console.error(err.message)
									}, function(){
										agregarStatus('Cantidad hojas agregadas: ' + obj.objSheetsNames.length, false)
										// const nameFileDisp = document.getElementById('nameFileDisp');

										// console.warn('Se insertaron datos del Excel')
										// mensaje = 'Termino de insertar datos';
										// agregarStatus('Terminando de agregar registro..', false)
										agregarStatus('¡Hecho!', true)
									})
								} else {
									agregarStatus('¡No se encontraron actividades!', true)
								}
								resolve('¡Agregado!')

							})

						// objSheetsNames
					})
				})
		})
	})

	// console.warn('Leer archivo excel: ' + inpFilUser.files[0].path)

}

function guardarUsuarioBitacora(obj, update, userApp){
	console.log(obj)
	console.warn('Modificación: ' + update)
	const registrosUsuarios = document.getElementById('registrosUsuarios');
	const mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
	const db = getDatabase();
	let cantResults = 0;
	let html = '';
	let sqlQuery = `INSERT INTO TBL_USUARIO VALUES ("${obj.rfc}","${obj.nombre}","${obj.puesto}","${obj.dga}","${obj.inicio}", "${userApp}");`;
	console.log(sqlQuery)
	// let sqlQuery = `SELECT nombre_usuario FROM TBL_USUARIO WHERE rfc_usuario = ?`;
	if (update) {
		sqlQuery = `UPDATE TBL_USUARIO SET nombre_usuario = "${obj.nombre}", puesto_usuario="${obj.puesto}", dga_direccion="${obj.dga}", inicio_homeoff="${obj.inicio}" WHERE rfc_usuario = "${obj.rfc}" AND claveusr="${userApp}";`;
	}
	return new Promise( function(resolve, reject){
		db.transaction( function(tx){
			tx.executeSql(`
				SELECT
					nombre_usuario
				FROM
					TBL_USUARIO
				WHERE
					rfc_usuario = ?
				AND
					claveusr = ?
			`,[obj.rfc, userApp], function(tx, results){
				cantResults = results.rows.length;
				if (cantResults > 0 && update !== true) {
					mensajeRespuestaForm.innerHTML = 'El RFC coincide con el de otro registro.';
				} else {
					resolve(sqlQuery)
				}
			});
		}, function(err){
			console.error(err.message)
		}, function(){
		})
	})
	.then(function(query){
		// console.log(query)
		return new Promise( function(resolve, reject){
			console.log('Consulta:\n' +  query)
			db.transaction( function(tx){
				tx.executeSql(query);
			}, function(err){
				console.error(err.message)
			}, function(){
				// mensajeRespuestaForm.innerHTML = 'Hecho.';
				resolve(true);
			})
		})
	})

}