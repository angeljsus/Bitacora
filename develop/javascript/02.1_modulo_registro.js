function cargarModuloRegistro(){
	const displayContent = document.getElementById('displayContent');
	return new Promise(function(resolve, reject){
		let html = `
				<div class="modulo">
					<div class="title-modulo">Registrar Actividades</div>
					<div class="content-modulo">
						<div class="form-container" id="divForms">
							<div class="otros-registros" id="optionsBarFloar">
							</div>
							<div class="item-form">
								<input class="item-input" type="text" id="inpRfcUser" placeholder="RFC" onkeypress="obtenerDatosUsuario(this.value)" maxlength="13">
							</div>
							<div class="mensaje-form" id="mensajeResDont"></div>
						</div>
						<div class="similares-container">
							<!--<div class="area-similares">
								<div class="title-similares">Otras actividades</div>
								<div class="content-similares" id="otrosDatos"></div>
							</div>-->
							

							<div class="area-similares" id="areaOtrosRegistros">
								
							</div>


							<div class="area-similares" id="areaFechas">
								<div class="title-similares">
									<div class="row-title-similar">
										<div class="item-similar">
											TOTAL DIAS LABORALES: &nbsp;<span id="cantDiasL"></span>
										</div>
										<div class="item-similar">
											FECHA INICIO: &nbsp;<span class="user-name" id="inicioHomeOffice"></span>
										</div>
									</div>
									<div class="row-title-similar" id="infoCantidades"></div>
								</div>
								<div class="content-similares" id="divSetDate">		</div>
							</div>
						</div>
					</div>
				</div>
					`;
		displayContent.innerHTML = html;
		resolve()
	})
	.then(function(){
		const areaFechas = document.getElementById('areaFechas');
		const areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
		areaOtrosRegistros.style = 'display: none'
		areaFechas.style = 'display: flex'
	})
}


function obtenerDatosUsuario(rfc){
	obtenerUpperRfc()
	// const optionRegEnable = document.getElementById('optionRegEnable')
	// optionRegEnable.onclick = function(){openDataOtrosUsuarios(rfc, USER_APP, inpFecReg.value)}
	// console.warn(optionRegEnable)
	const db = getDatabase();
	const divForms = document.getElementById('divForms');
	const inpNombre = document.getElementById('inpNombre')
	const inpPuesto = document.getElementById('inpPuesto')
	const inpDirDga = document.getElementById('inpDirDga')
	const inpFecReg = document.getElementById('inpFecReg')

	let USER_APP = localStorage.getItem('USER_APP');

	let mensajeResDont = '';
	let inpRfcUser = document.getElementById('inpRfcUser');
	const divAreaActividades = document.getElementById('divAreaActividades')
	const inicioHomeOffice = document.getElementById('inicioHomeOffice');
	// const areaFechas = document.getElementById('areaFechas');

	// const mensajeResDont = document.getElementById('mensajeResDont');

	let RFC = cadenaUpperCase(rfc);
	RFC = replaceSpace(RFC);

	let cantResults = 0;
	let html = '';
	inpRfcUser.value = RFC;

	return new Promise(function(resolve, reject){
		if (RFC.length == 13) {
			db.transaction( function(tx){
				tx.executeSql(`
					SELECT
						*
					FROM
						TBL_USUARIO
					WHERE
						rfc_usuario = ?
					AND 
						claveusr = ?
				`, [RFC, USER_APP], function(tx, results){
					cantResults = results.rows.length;
					// console.log(cantResults)
					if (cantResults > 0) {
						if (inpNombre) {
							inpNombre.value = decodeCaracteres(results.rows[0].nombre_usuario)
							inpPuesto.value = decodeCaracteres(results.rows[0].puesto_usuario)
							inpDirDga.value = decodeCaracteres(results.rows[0].dga_direccion)
							inpFecReg.value = '';
							divAreaActividades.innerHTML ='';
							// inpFecReg.value = results.rows[0].
							// selStatus.value = results.rows[0].
						} else {
							html = `
							<div class="item-form">
								<input class="item-input" type="text" id="inpNombre" placeholder="Nombre" value="${results.rows[0].nombre_usuario}" disabled>
							</div>
							<div class="item-form">
								<input class="item-input" type="text" id="inpPuesto" placeholder="Puesto" value="${results.rows[0].puesto_usuario}" disabled>
							</div>
							<div class="item-form">
								<input class="item-input" type="text" id="inpDirDga" placeholder="DGA o Dirección" value="${results.rows[0].dga_direccion}" disabled>
							</div>
							<div class="item-form">
								<input class="item-inp-data" type="text" id="inpFecReg"  value="" onchange="obtenerDatosRegistro(this.value, '${USER_APP}')" placeholder="Seleccionar fecha" disabled>
								<button class="btn-fecha" onclick="crearCalendario('inpFecReg')" id="btInptDate">Seleccionar Fecha</button>
							</div>
							<div class="item-form">
								<select class="item-input" name="" id="selStatus" onchange="validaStatusSelect(this.value, '${results.rows[0].rfc_usuario}','${USER_APP}')">
									<option value="0" selected>Actividades</option>
									<option value="1">Permiso</option>
									<option value="2">Vacaciones</option>
									<option value="3">Se laboró en Oficinas</option>
								</select>
							</div>
							<div class="area-actividades" id="divAreaActividades">
							</div>
							<div class="item-form item-around">
								<button class="btn-fecha" onclick="crearPlantillaBitacora()">EXPORTAR</button>
								<button class="btn-fecha" onclick="almacenarRegistro()">GUARDAR</button>
							</div>
							<div class="mensaje-form" id="mensajeRespuestaForm"></div>
							`;
							divForms.insertAdjacentHTML('beforeend', html)
						}
						localStorage.removeItem('RFC_KEY');
						// console.warn(RFC)
						localStorage.setItem('RFC_KEY', RFC);
						mensajeResDont = document.getElementById('mensajeResDont');
						mensajeResDont.innerHTML = '';
						// areaFechas.style = 'display: flex';
						inicioHomeOffice.innerHTML = obtenFecha(results.rows[0].inicio_homeoff, true); 
						resolve(results.rows[0].inicio_homeoff)
						// optionRegEnable.onclick = "agregaStatusArea()"

					} else {
						cargarModuloRegistro()
						mensajeResDont = document.getElementById('mensajeResDont');
						inpRfcUser = document.getElementById('inpRfcUser');
						mensajeResDont.innerHTML = 'El usuario no existe.'
						inpRfcUser.value = RFC;
						// const inicioHomeOffice = document.getElementById('inicioHomeOffice');
						inicioHomeOffice.innerHTML = '';
						localStorage.removeItem('RFC_KEY');
						console.warn('NO EXISTE ESTE USUARIO')
						// si no hay ningun usuario registrado con este rfc quito nuevamente todo
					}

				})
			}, function(err){
				console.error(err.message)
			})
		}
	}).then(function(inicioHome){
		desplegaDiasConStatus(inicioHome, rfc)
	})
}

function desplegaDiasConStatus(inicioHome, rfc, status){
	return new Promise(function(resolve, reject){
			let objectFechas = validacionesHomeOffice(inicioHome, rfc);
			resolve(objectFechas)
		})
		.then(function(object){
				let data = obtenerRegistrosFechas(object[0], object[1])
				return data;
		})
		.then(function(object){
			return new Promise(function(resolve, reject){
				// aqui se trabajarán los elementos html
				const cantDiasL = document.getElementById('cantDiasL');
				const infoCantidades = document.getElementById('infoCantidades');
				let bound = divSetDate.getBoundingClientRect();
				// const inicioHomeOffice = document.getElementById('inicioHomeOffice');
				// inicioHomeOffice.innerHTML = 'Fecha Inicio: ' + obtenFecha(inicioHome, true);
				cantDiasL.innerHTML = object.length; 
				let fechas = '',contadorOficina = 0, contadorPendiente = 0, contadorRegistrado = 0, contadorPermiso = 0, contadorVacaciones = 0;
				let element = '';
				// console.log(object)
				object.forEach(function(item){
					switch(item.stat){
						case 'registrado':
							contadorRegistrado++;
							break;
						case 'pendiente':
							contadorPendiente++;
							break;
						case 'vacaciones':
							contadorVacaciones++;
							break;
						case 'permiso':
							contadorPermiso++;
							break;
						case 'oficina':
							contadorOficina++;
							break;
					}
					element = `
									<div class="item-fecha" onclick="abrirDentroEditor('${rfc}', '${item.fecha}')">
										<div id="itemFechaReg-${item.fecha}" class="status status-${item.stat}"></div>
										<div name="itemValueFecha" id="cambiar${item.fecha}" class="fecha-status">${obtenFecha(item.fecha, true)}</div>
										<div id="otroReg${item.fecha}" class="status"></div>
									</div>`;

					switch(status){
						case 0:
							if (item.stat == 'registrado') {
								fechas += element;
							}
							break;
						case 1:
							if (item.stat == 'permiso') {
								fechas += element;
							}
							break;
						case 2:
							if (item.stat == 'vacaciones') {
								fechas += element;
							}
							break;
						case 3:
							if (item.stat == 'pendiente') {
								fechas += element
							}
							break;
						case 4:
							if (item.stat == 'oficina') {
								fechas += element
							}
							break;
						default:
								fechas += element
							break;
					}

				})

				infoCantidades.innerHTML = `
					<div class="item-similar">
						<button class="btn-similar" name="btnsGroup" id="btnTodos" onclick="desplegaDiasConStatus('${inicioHome}', '${rfc}')">
							Todos
						</button>
					</div>
					<div class="item-similar">
						<button class="btn-similar" name="btnsGroup" id="btn0" onclick="desplegaDiasConStatus('${inicioHome}','${rfc}',0)">
							Actividades &nbsp; <span id="cntRegistrado">${contadorRegistrado}</span>
						</button>
					</div>
					<div class="item-similar">
						<button class="btn-similar" name="btnsGroup" id="btn3" onclick="desplegaDiasConStatus('${inicioHome}','${rfc}',3)">
							Pendiente &nbsp; <span id="cntPendiente">${contadorPendiente}</span>
						</button>
					</div>
					<div class="item-similar">
						<button class="btn-similar" name="btnsGroup" id="btn2" onclick="desplegaDiasConStatus('${inicioHome}','${rfc}',2)">
							Vacaciones &nbsp; <span id="cntVacaciones">${contadorVacaciones}</span>
						</button>
					</div>
					<div class="item-similar">
						<button class="btn-similar" name="btnsGroup" id="btn1" onclick="desplegaDiasConStatus('${inicioHome}','${rfc}',1)">
							Permiso &nbsp; <span id="cntPermiso">${contadorPermiso}</span>
						</button>
					</div>
					<div class="item-similar">
						<button class="btn-similar" name="btnsGroup" id="btn4" onclick="desplegaDiasConStatus('${inicioHome}','${rfc}',4)">
							Oficina &nbsp; <span id="cntOficina">${contadorOficina}</span>
						</button>
					</div>
				`;
				divSetDate.innerHTML = fechas;
				// fechas = '';
				resolve()
			})
		})
		.then(function(){
			// limpiar elementos
			let elements = document.getElementsByName('btnsGroup');
			elements.forEach(function(item){
				// console.log('->>',document.getElementById(item.id))
				document.getElementById(item.id).classList.remove('markup');
				// agrega el markup a el boton seleccionado
				let cantidad = 0;
				for(let i = 0; i < 5; i++){
					if (status == i) {
						document.getElementById('btn'+status).classList.add('markup');
						cantidad = 1;
					}
				}
				if (cantidad == 0) {
					document.getElementById('btnTodos').classList.add('markup');
				}
			})
		})
		.then(function(){
			return cargaDatosOtrosUsuarios(rfc)
		})
		.then(function(){
			return cargaRandomActividades(rfc)
		})
}

function actualizarCantidades(inicioHome, rfc){
	return new Promise(function(resolve, reject){
		let objectFechas = validacionesHomeOffice(inicioHome, rfc);
		resolve(objectFechas)
	})
	.then(function(object){
			let data = obtenerRegistrosFechas(object[0], object[1])
			return data;
	})
	.then(function(object){
		const cntRegistrado = document.getElementById('cntRegistrado');
		const cntPendiente = document.getElementById('cntPendiente');
		const cntVacaciones = document.getElementById('cntVacaciones');
		const cntPermiso = document.getElementById('cntPermiso');
		const cntOficina = document.getElementById('cntOficina');
		let contadorPendiente = 0, contadorRegistrado = 0, contadorOficina = 0,contadorPermiso = 0, contadorVacaciones = 0;

		object.forEach(function(item){
			switch(item.stat){
				case 'registrado':
					contadorRegistrado++;
					break;
				case 'pendiente':
					contadorPendiente++;
					break;
				case 'vacaciones':
					contadorVacaciones++;
					break;
				case 'permiso':
					contadorPermiso++;
					break;
				case 'oficina':
					contadorOficina++;
					break;
			}
		})

		cntRegistrado.innerHTML = contadorRegistrado;
		cntPendiente.innerHTML = contadorPendiente;
		cntVacaciones.innerHTML = contadorVacaciones;
		cntPermiso.innerHTML = contadorPermiso;
		cntOficina.innerHTML = contadorOficina;
	})
}

function obtenerDatosRegistro(date, userApp){
	const db = getDatabase();
	const selStatus = document.getElementById('selStatus');
	const divActividades = document.getElementById('divActividades');
	const inpRfcUser = document.getElementById('inpRfcUser');
	let rfc = inpRfcUser.value;
	let cantResults = 0;
	let status = 0;
	// const optionRegEnable = document.getElementById('optionRegEnable')
	// optionRegEnable.onclick = function(){agregaStatusArea(inpRfcUser.value, userApp, date)}

	// let queryText = `SELECT capturado FROM TBL_CAMPOS WHERE	rfcusuario = "${inpRfcUser.value}" AND fecha = "${date}";`;
	// console.log(queryText)
	return new Promise(function(resolve, reject){
		db.transaction( function(tx){
			tx.executeSql(`
				SELECT 
					capturado 
				FROM 
					TBL_CAMPOS 
				WHERE	
					rfcusuario = ? AND fecha = ? AND claveusr = ?`,[inpRfcUser.value, date, userApp], function(tx, results){
					cantResults = results.rows.length;

					if (cantResults > 0) {
						status = results.rows[0].capturado;
						console.log('Hay dato')
					}
					selStatus.value = status;
					resolve({status, date, rfc})
			})
		}, function(err){
			console.error(err.message)
		})
	})
	.then(function(result){
		validaStatusSelect(result.status, result.rfc, userApp)
		return result;
	})
	.then(function(result){
		// cargaDatosOtrosUsuarios(inpRfcUser.value)
		console.log('..-------------> Cambio la fecha')
		// openDataOtrosUsuarios(result.rfc, userApp, result.date)
		cargaDatosOtrosUsuarios(result.rfc, result.date)
		return result; 
		// cargaDatosOtrosUsuarios(result.rfc)
	})
	.then(function(result){
		marcaFechaSeleccionada(result.date)
	})
	// .then(function(){
		// return regresaFechasActual()
	// })
	// .then(function(result){
		// let objectFechas = validacionesHomeOffice(inicioHome, result.rfc)
		// console.log(objectFechas)
		// return cargaOtrosRegistros(result.date, result.rfc, userApp);
	// })
}

function marcaFechaSeleccionada(fecha){
	let itemValueFecha = document.getElementsByName('itemValueFecha');
	let fechaElement = '';
	let bound = '';
	if (itemValueFecha) {
		itemValueFecha.forEach(function(element){
			fechaElement = element.id.replace(/cambiar/,'');
			element.classList.remove('date-selected')
			if (fechaElement == fecha) {
				element.classList.add('date-selected')
			}
		})
	}

}

function validaStatusSelect(status, rfc, userApp){
	const divAreaActividades = document.getElementById('divAreaActividades');
	const inpFecReg = document.getElementById('inpFecReg');
	const mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');


	console.log('Validando: status: ' + status + ' rfc: ' + rfc + ' date: ' + inpFecReg.value)

	// console.log('-------------------->' + date)
	if (inpFecReg.value != '') {
		console.warn(status)
		if (status > 0) {
			console.warn('desha')
			divAreaActividades.style.display = 'none';
			// addActividad.style.display = 'none';
		} else {
			divAreaActividades.style.display = 'flex';
			// addActividad.style.display = 'flex';
			console.warn('cargando inputs')
			cargarActividades(rfc, inpFecReg.value, userApp);
		}
		mensajeRespuestaForm.innerHTML = '';

	} else {
		console.warn('Es necesario seleccionar una fecha')
		mensajeRespuestaForm.innerHTML = 'Es necesario seleccionar una fecha';
	}

}

function cargarActividades(rfc, date, userApp){
	console.warn('cargando actividades: ' +date +'---' + rfc)
	const selStatus = document.getElementById('selStatus');
	const db = getDatabase();
	const divAreaActividades = document.getElementById('divAreaActividades');
	const addActividad = document.getElementById('addActividad')
	let cantResults = 0;
	let elementoNuevo = '';
	return new Promise(function(resolve, reject){
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
			`, [rfc, date, userApp], function(tx, results){
				cantResults = results.rows.length;
				elementoNuevo += '<div class="display-actividades" id="divDisplayActividades">';
				if (cantResults > 0) {
					console.log('cargar inputs guardados')
							elementoNuevo += `<div class="item-actividad"><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 1" id="inpActiv0" contenteditable>${decodeCaracteres(results.rows[0].campo_1).slice(0,200)}</span></div>`;
							elementoNuevo += `<div class="item-actividad"><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 2" id="inpActiv1" contenteditable>${decodeCaracteres(results.rows[0].campo_2).slice(0,200)}</span></div>`;
							elementoNuevo += `<div class="item-actividad"><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 3" id="inpActiv2" contenteditable>${decodeCaracteres(results.rows[0].campo_3).slice(0,200)}</span></div>`;
							elementoNuevo += `<div class="item-actividad"><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 4" id="inpActiv3" contenteditable>${decodeCaracteres(results.rows[0].campo_4).slice(0,200)}</span></div>`;
						if (results.rows[0].campo_5 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 5" id="inpActiv4" contenteditable>${decodeCaracteres(results.rows[0].campo_5).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_6 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 6" id="inpActiv5" contenteditable>${decodeCaracteres(results.rows[0].campo_6).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_7 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 7" id="inpActiv6" contenteditable>${decodeCaracteres(results.rows[0].campo_7).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_8 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 8" id="inpActiv7" contenteditable>${decodeCaracteres(results.rows[0].campo_8).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_9 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 9" id="inpActiv8" contenteditable>${decodeCaracteres(results.rows[0].campo_9).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_10 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 10" id="inpActiv9" contenteditable>${decodeCaracteres(results.rows[0].campo_10).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_11 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 11" id="inpActiv10" contenteditable>${decodeCaracteres(results.rows[0].campo_11).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_12 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 12" id="inpActiv11" contenteditable>${decodeCaracteres(results.rows[0].campo_12).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_13 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 13" id="inpActiv12" contenteditable>${decodeCaracteres(results.rows[0].campo_13).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_14 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 14" id="inpActiv13" contenteditable>${decodeCaracteres(results.rows[0].campo_14).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_15 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 15" id="inpActiv14" contenteditable>${decodeCaracteres(results.rows[0].campo_15).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_16 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 16" id="inpActiv15" contenteditable>${decodeCaracteres(results.rows[0].campo_16).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_17 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 17" id="inpActiv16" contenteditable>${decodeCaracteres(results.rows[0].campo_17).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_18 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 18" id="inpActiv17" contenteditable>${decodeCaracteres(results.rows[0].campo_18).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_19 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 19" id="inpActiv18" contenteditable>${decodeCaracteres(results.rows[0].campo_19).slice(0,200)}</span></div>`;
						}
						if (results.rows[0].campo_20 !== '') {
							elementoNuevo += `<div class="item-actividad" ><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 20" id="inpActiv19" contenteditable>${decodeCaracteres(results.rows[0].campo_20).slice(0,200)}</span></div>`;
						}
				} else {
					elementoNuevo += `<div class="item-actividad"><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 1" id="inpActiv0" contenteditable></span></div>
														<div class="item-actividad"><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 2" id="inpActiv1" contenteditable></span></div>
														<div class="item-actividad"><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 3" id="inpActiv2" contenteditable></span></div>
														<div class="item-actividad"><span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad 4" id="inpActiv3" contenteditable></span></div>`;
					selStatus.value = 0;

				}
								

				elementoNuevo += '</div>'
				divAreaActividades.innerHTML = elementoNuevo;
				if (!document.getElementById('addActividad')) {
					divAreaActividades.insertAdjacentHTML('beforeend','<button class="btn-add" onclick="agregarActividadVacia()" id="addActividad">+</button>')
				}

				resolve()
			})
		}, function(err){
			console.error(err.message)
		})
	})
.then(function(){
	let element = '';
	let placeholder = '';
	let value = '';
	let newElement = '';
	for(var i = 0; i < 20; i++){
		element = document.getElementById('inpActiv'+i);
		if (element !== null) {
			placeholder = element.getAttribute('data-placeholder');
			if (placeholder !== '') {

			} else {
				element.addEventListener('click', function (e) {
					console.log(e.target.id)
					newElement = document.getElementById(e.target.id)
					newElement.setAttribute('data-placeholder','')
				})
			}
			// element.innerHTML === '' && (element.innerHTML = placeholder);

			// value = '';
			// element.addEventListener('click', function (e) {
   //  		value = e.target.innerHTML;
   //  		value === placeholder && (e.target.innerHTML = '');
   //  		console.log(value)
			// });
			// // value = '';
			// element.addEventListener('blur', function (e) {
   //  		value = e.target.innerHTML;
   //  		value === '' && (e.target.innerHTML = placeholder);
			// });
		}
	}
})
}

function counterValues(id){
	let element = document.getElementById(id);
	const mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
	let text = '';
	let final = '';
	element.onkeyup = function(key){
		// console.log(key)
		text = caracteresRaros(element.textContent);
		element = document.getElementById(id);
		mensajeRespuestaForm.innerHTML = '';

		if (text.length > 200  || key.code == 'Enter') {
			element = document.getElementById(id);
			text = text.slice(0,200);
			element.innerHTML = caracteresRaros(text);
			element.removeAttribute('contenteditable');
			element.setAttribute('contenteditable','');
			if (key.code !== 'Enter') {
				mensajeRespuestaForm.innerHTML = 'Cada actividad solo acepta 200 caracteres.'
			} 
		} else{
				element.oninput = function(e){
					// console.log(text.length + ' ' + text)
					if (text.length <= 200 && e.data !== null) {
						text = text + e.data;
						text = caracteresRaros(text)
						// console.log('Aqui 0')
						mensajeRespuestaForm.innerHTML = '';
					}
			} 
		}
	}
}

function agregarActividadVacia(){
	const divDisplayActividades = document.getElementById('divDisplayActividades');
	let i = 0;
	let element = '';
	let elementoNuevo = '';
	let posterior = 2;
	let inputs = document.getElementsByName('optActividad').length;
	console.log('--> ' + inputs)
	do {
		element = document.getElementById('inpActiv' + i);
		console.log(element)
		if (element !== null && element.textContent !== '') {
			posterior = i + 1;
			// console.log(i)
			if (inputs == posterior && i < 19) {
				elementoNuevo = `
					<div class="item-actividad">
						<span name="optActividad" onclick="counterValues(this.id)" class="la-actividad editable" role="input" type="text" data-placeholder="Actividad ${posterior + 1}" id="inpActiv${posterior}" contenteditable></span>
					</div>`;
				divDisplayActividades.insertAdjacentHTML('afterbegin', elementoNuevo)
			}
			if (i == 18) {
				document.getElementById('addActividad').style.display = 'none';
			}
		} else {
			i = 20;
		}
		i++;
	} while (i < 20)
}


function obtenerRegistrosFechas(object, RFC, inicioHome){
  const db = getDatabase();
	let cantResults = 0;
	let allDays = [];
	let USER_APP = localStorage.getItem('USER_APP');

	object.forEach(function(item){
		item.forEach(function(days){
			allDays.push({fecha : days, stat : 'pendiente'})
		})
	})

	return new Promise( function(resolve, reject){
		db.transaction( function(tx){
			tx.executeSql(`
				SELECT
					fecha,
					capturado
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
				let estatus = '', cadenaText = '', cadenaText1 = '', cadenaText2 = '', finded = -1, text = '', object = [], cadenaText3 = '';
				let festivos = getDiasFestivos();

				if (cantResults > 0 ) {
					for(let i = 0; i < cantResults; i++){
						// console.log('capturado: %s fecha: %s',results.rows[i].capturado, results.rows[i].fecha)
						switch(results.rows[i].capturado){
							case 0:
								estatus = 'registrado'
								cadenaText += results.rows[i].fecha + ',';
								break;
							case 1:
								cadenaText1 += results.rows[i].fecha + ',';
								estatus = 'permiso'
								break;
							case 2:
								cadenaText2 += results.rows[i].fecha + ',';
								estatus = 'vacaciones'
								break;
							case 3:
								cadenaText3 += results.rows[i].fecha + ',';
								estatus = 'oficina'
								break;
						}
					}
					
				}
				// crea la cadena de festivos
				festivos.forEach(function(item){
					text += `${regresaTextoCero(item.dia)}-${regresaTextoCero(item.mes)}-${regresaTextoCero(item.year)},`;
				})
				// agrega elementos a el nuevo objeto con fechas sin días festivos
				allDays.forEach(function( obj, index ) {
						finded = text.search(obj.fecha);
						if (finded < 0) {
							object.push(obj);
						}
				})

				object.forEach(function( obj, index ) {
					// encuentra registrados y le cambia el estado
					finded = cadenaText.search(obj.fecha);
					if (finded >= 0) {
						obj.stat = 'registrado'
					}
					// encuentra permiso y le cambia el estado
					finded = cadenaText1.search(obj.fecha);
					if (finded >= 0) {
						obj.stat = 'permiso'
					}
					// encuentra vacaciones y le cambia el estado
					finded = cadenaText2.search(obj.fecha);
					if (finded >= 0) {
						obj.stat = 'vacaciones'
					}
					// encuentra oficina y le cambia el estado
					finded = cadenaText3.search(obj.fecha);
					if (finded >= 0) {
						obj.stat = 'oficina'
					}
				})

				resolve(object)
			})
		}, function(err){
			console.error(err.message)
		}, function(){
		})
	})
}

function abrirDentroEditor(rfc, fecha){
	console.log('abrirPendiente: ' + fecha + ' ' + rfc)
	const inpFecReg = document.getElementById('inpFecReg');
	inpFecReg.value = fecha;
	inpFecReg.onchange();
	desmarcarButton('btnRegistrar')
}