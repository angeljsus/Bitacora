function editarRegistroUsuario(rfc, userApp){
	const divForms = document.getElementById('divForms');
	const db = getDatabase();
	let cantResults = 0;
	let html = '';

	return new Promise( function(resolve, reject){
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
			`,[rfc, userApp], function(tx, results){
				cantResults = results.rows.length;
				html = `
						<div class="item-form">
							<input class="item-input" type="text" id="inpRfcUser" value="${results.rows[0].rfc_usuario}" maxlength="13" disabled>
						</div>
						<div class="item-form">
							<input class="item-input" type="text" id="inpNmeUser" value="${results.rows[0].nombre_usuario}">
						</div>
						<div class="item-form">
							<input class="item-input" type="text" id="inpPueUser" value="${results.rows[0].puesto_usuario}">
						</div>
						<div class="item-form">
							<input class="item-input" type="text" id="inpDgaUser" value="${results.rows[0].dga_direccion}">
						</div>
						<div class="item-form">
								<input class="item-inp-data" type="text" id="inpHomeOff" value="${results.rows[0].inicio_homeoff}" onchange="" disabled>
								<button class="btn-fecha" onclick="crearCalendario('inpHomeOff')" id="btInptDate">Seleccionar Fecha</button>
						</div>
						<div class="item-form">
							<label class="lbel-file" htmlFor="" id="nameFileDisp">Archivo de bitácora</label>
							<input id="inpFilUser" class="file-input" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onchange="changeValue(this.id)">
						</div>
						<div class="item-form">
								<button class="btn-fecha" onclick="validarUsuarioBitacora(true)">GUARDAR CAMBIOS</button>
							</div>
							<div class="mensaje-form" id="mensajeRespuestaForm"></div>
						</div>
				`;

				divForms.innerHTML = html;

			})
		}, function(err){
			console.error(err.message)
		}, function(){
		})
	})
	console.warn('A editar: ' + rfc)
}