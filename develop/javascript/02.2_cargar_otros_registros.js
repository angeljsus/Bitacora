function cargaDatosOtrosUsuarios(rfc, date){
	console.log('Ahora cargar datos de otros usuarios ' + rfc);
	let itemValueFecha = document.getElementsByName('itemValueFecha');
	let optionsBarFloar = document.getElementsByName('optionsBarFloar');
	const areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
	areaOtrosRegistros.innerHTML = `
		<div class="title-similares">
			<div class="row-title-similar">
				<div class="item-similar" id="titleChange">
					OTROS REGISTROS
				</div>
			</div>
			<div class="row-title-similar">
				<div class="item-similar" id="desplFechaOtros">
				</div>
			</div>
		</div>
		<div class="content-similares" id="divOtrosDatos"></div>
	`
	let USER_APP = localStorage.getItem('USER_APP');
	let fecha = '', paramQuery = '', contador = 0, comma = ',', length = 0, cantResults = 0;
	const db = getDatabase();
	// console.log(itemValueFecha)
	// console.log(optionsBarFloar)
	// regresaFechasActual()	
	length = itemValueFecha.length;
	if (date) {
			paramQuery += `"${date}"`;
	} else if (length > 0) {
		itemValueFecha.forEach(function(element){
			if ((length-1) == contador) {
				comma = '';
			}
			fecha = element.id;
			fecha = fecha.replace(/cambiar/,'');
			paramQuery += `"${fecha}"${comma}`;
			contador++;
		})
	}
	db.transaction(function(tx){
		tx.executeSql(`
			SELECT
				DISTINCT(fecha)
			FROM
				TBL_CAMPOS
			WHERE
				fecha in (${paramQuery})
			AND
				rfcusuario != ?
			AND
				claveusr = ?
			`, [rfc, USER_APP], function(tx, results){
				cantResults = results.rows.length;
				let element = '';
				let cargaOption = true;
				// console.warn('---->' + cantResults)
				if (cantResults > 0) {
					cargaOption = false;
				}
				
				if (!date) {
					if (cantResults > 0) {
						for(let i = 0; i < cantResults; i++){
							// console.log(results.rows[i].fecha)
							element = document.getElementById('otroReg'+results.rows[i].fecha)
							// element.innerHTML = `<span onclick="agregaStatusArea('${rfc}', '${USER_APP}','${results.rows[i].fecha}')" class="material-icons">supervised_user_circle</span>`;
							element.innerHTML = `<span class="material-icons">supervised_user_circle</span>`;
							element.classList.add('icon-otros');
						}
					} 
				} else{
					const optionsBarFloar = document.getElementById('optionsBarFloar');
					const optionRegEnable = document.getElementById('optionRegEnable');
					console.log('---------->' + optionRegEnable)
					if (cantResults > 0) {
						if (!optionRegEnable) {
							optionsBarFloar.insertAdjacentHTML('afterbegin',`
								<button class="btn-otros" id="optionRegEnable" onclick="agregaStatusArea('${rfc}', '${USER_APP}', '${date}')">
									<span class="material-icons">supervised_user_circle</span>
								</button>
								`);
						} else {
							optionRegEnable.onclick = function(){agregaStatusArea(rfc, USER_APP, date)}
						}
					} 
				}

				regresaFechasActual(cargaOption)	

			})
	},function(err){
		console.error(err.message)
	})
}

function agregaStatusArea(rfc, userApp, fecha){
	console.warn(fecha)
	const areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
	const titleChange = document.getElementById('titleChange');
	titleChange.innerHTML = 'OTROS REGISTROS'

	new Promise(function (resolve, reject) {
		areaOtrosRegistros.setAttribute('name', 'visible');
		resolve(areaOtrosRegistros)
		console.log('status area')
	})
	.then(function(){
			openDataOtrosUsuarios(rfc, userApp, fecha)	
	});

}

function openDataOtrosUsuarios(rfc, userApp, fecha){
	console.log('Ejecutando openDataOtrosUsuarios()')
	const inpFecReg = document.getElementById('inpFecReg');
	const areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
	const areaFechas = document.getElementById('areaFechas');
	const desplFechaOtros = document.getElementById('desplFechaOtros');
	const divOtrosDatos = document.getElementById('divOtrosDatos');
	const db = getDatabase();
	const backDates = document.getElementById('backDates');
	const optionsBarFloar = document.getElementById('optionsBarFloar');
	let status = areaFechas.style.display;
	let cantResults = 0;
	let elements = '';
	let className = '';
	let estatus = '';

	if (areaOtrosRegistros.getAttribute('name') == 'visible') {
		areaFechas.style.display = 'none';
		areaOtrosRegistros.style.display = 'flex';
		// // alert(backDates)
		if (!backDates) {
			optionsBarFloar.insertAdjacentHTML('afterbegin',`<button id="backDates" class="btn-otros" onclick="regresaFechasActual()"><span class="material-icons">low_priority</span></button>`)
		}
	}
	return new Promise(function(resolve, reject){

		if (fecha !== '') {
			desplFechaOtros.innerHTML = 'Otros Registros de la Fecha: ' + obtenFecha(fecha, true);
			db.transaction(function(tx){
				tx.executeSql(`
					SELECT
						U.nombre_usuario,
						U.rfc_usuario,
						C.capturado
					FROM
						TBL_CAMPOS C,
						TBL_USUARIO U
					WHERE
						C.rfcusuario = U.rfc_usuario
					AND
						C.fecha = ?
					AND
						C.rfcusuario != ?
					AND
						C.claveusr = U.claveusr
					AND
						C.claveusr = ?
					ORDER BY
						U.nombre_usuario;
					`,[fecha, rfc, userApp ], function(tx, results){
						cantResults = results.rows.length;

						if (cantResults > 0) {
							for(var i = 0; i < cantResults; i++){
								switch(results.rows[i].capturado){
									case 0:
										estatus = 'Actividades';
										className = '';
										break;
									case 1:
										estatus = 'Permiso'
										className = 'no-hover';
										break;
									case 2:
										estatus = 'Vacaciones'
										className = 'no-hover';
										break;
									case 3:
										estatus = 'Laboró en Oficinas'
										className = 'no-hover';
										break;
								}
								elements +=
								`
								<div class="item-usuario ${className}" onclick="modMostrarActividades('${results.rows[i].rfc_usuario}','${fecha}','${userApp}')">
									<div class="usuario-similar" >${results.rows[i].nombre_usuario}</div>
									<div class="usuario-similar" >${estatus}</div>
								</div>
								`;
								console.log('--------> ' + results.rows[i].nombre_usuario)
							}

							divOtrosDatos.innerHTML = elements;

						}	else {
							divOtrosDatos.innerHTML = `
								<div class="item-usuario no-hover" >
									<div class="usuario-similar" >No se encontraron otros registros con la fecha seleccionada</div>
								</div>
								`;
						}
				})
			}, function(err){
				console.error(err.message)
			}, function(){
				resolve()
			})
		}
		// const backDates = document.getElementById('backDates');
		// const optionsBarFloar = document.getElementById('optionsBarFloar');
		// // alert(backDates)
		// if (!backDates && ) {
		// 	optionsBarFloar.insertAdjacentHTML('afterbegin',`<button id="backDates" class="btn-otros" onclick="regresaFechasActual()"><span class="material-icons">low_priority</span></button>`)
		// }
	})
		// areaOtrosRegistros.style.display = 'none';
		// areaFechas.style.display = 'flex';
}

function regresaFechasActual(hayValor){
	// console.log('volviendo')
	const areaFechas = document.getElementById('areaFechas');
	const areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
	const optionRegEnable = document.getElementById('optionRegEnable');
	const backDates = document.getElementById('backDates');
	// console.log(backDates)
	if (backDates) {
		backDates.remove();
	}

	if (optionRegEnable && hayValor == true) {
		optionRegEnable.remove();
	}
	areaOtrosRegistros.removeAttribute('name');
	areaOtrosRegistros.style.display = 'none';
	areaFechas.style.display = 'flex';
}

/*
	Función para mostrar las actividades almacenadas por el usuario dentro de un modal, de los usuarios que tienen actividades
	almacenadas en misma fecha seleccionada por el usuario dentro del calendario

	Parametros:
		rfc : valor de RFC seleccionado.
		fecha : el valor de la fecha seleccionada.
*/
function modMostrarActividades(rfc, fecha, userApp){
	const db = getDatabase();
	let respuesta = false;
	let cantResults = 0;
	let html = '';
	return new Promise(function(resolve, reject){
		// abrir modal, regresa true para reactificar
		respuesta = openModal();
		if (respuesta) {
			resolve() 
		}
	})
	.then(function(){
		const divDateContent = document.getElementById('divDateContent');
		// elimino la clase del modal de fecha, no se utilizara
		divDateContent.classList.remove('modal-fecha')
		divDateContent.classList.add('modal-actividades')
		// Realizar la consulta obteniendo las actividades almacenadas con el rfc y fecha pasados por parametros
		db.transaction( function(tx){
			tx.executeSql(`
				SELECT
					*
				FROM
					TBL_CAMPOS C,
					TBL_USUARIO U
				WHERE
					C.rfcusuario = U.rfc_usuario
				AND
					C.fecha = ?
				AND
					C.rfcusuario = ?
				AND
					C.claveusr = U.claveusr
				AND
					C.claveusr = ?
			`, [fecha, rfc, userApp], function(tx, results){
				cantResults = results.rows.length;
				let i = 0;
				if (cantResults > 0) {
				// obtener la fecha completa 
				fecha = obtenFecha(fecha, true)
				// Se crea el html a mostrar en el modal
				html = `
						<div class="container-actividades">
							<div class="display-datos">
								<div class="header-act">
									<div class="title-act">Actividades</div>
									<div class="equis" onclick="closeModal()"><span class="material-icons">close</span></div>
								</div>
								<div class="datos-registro">
									<div class="info-registro">${rfc}</div>
									<div class="info-registro">${fecha}</div>
								</div>
								<div class="registro-actividades">`;
					// Agrega a el html si el campo no esta vacío
					do{
						if (results.rows[i].campo_1 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_1}</div>`;
						}
						if (results.rows[i].campo_2 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_2}</div>`;
						}
						if (results.rows[i].campo_3 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_3}</div>`;
						}
						if (results.rows[i].campo_4 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_4}</div>`;
						}
						if (results.rows[i].campo_5 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_5}</div>`;
						}
						if (results.rows[i].campo_6 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_6}</div>`;
						}
						if (results.rows[i].campo_7 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_7}</div>`;
						}
						if (results.rows[i].campo_8 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_8}</div>`;
						}
						if (results.rows[i].campo_9 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_9}</div>`;
						}
						if (results.rows[i].campo_10 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_10}</div>`;
						}
						if (results.rows[i].campo_11 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_11}</div>`;
						}
						if (results.rows[i].campo_12 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_12}</div>`;
						}
						if (results.rows[i].campo_13 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_13}</div>`;
						}
						if (results.rows[i].campo_14 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_14}</div>`;
						}
						if (results.rows[i].campo_15 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_15}</div>`;
						}
						if (results.rows[i].campo_16 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_16}</div>`;
						}
						if (results.rows[i].campo_17 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_17}</div>`;
						}
						if (results.rows[i].campo_18 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_18}</div>`;
						}
						if (results.rows[i].campo_19 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_19}</div>`;
						}
						if (results.rows[i].campo_20 != '') {
							html += 	`<div class="item-actividad">${results.rows[i].campo_20}</div>`;
						}
						i++;
					}while(i < cantResults)
					html += `	</div></div></div>`
					// carga el html con las actividades encontradas en la pantalla del modal
					divDateContent.innerHTML = html;
				}
			})
		}, function(err){
			console.error(err.message)
		})
	})
}
