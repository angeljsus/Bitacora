function mostrarUsuariosAlta(){
	const registrosUsuarios = document.getElementById('registrosUsuarios');
	let USER_APP = localStorage.getItem('USER_APP');

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
					claveusr = ?
				ORDER BY
					nombre_usuario
			`,[USER_APP], function(tx, results){
				cantResults = results.rows.length;
				console.log('SELECT * FROM TBL_USUARIO ORDER BY nombre_usuario AND claveusr = ' + USER_APP)
				if (cantResults > 0) {
					for(let i = 0; i < cantResults; i++){
						html += `<div class="row-user" id="code${results.rows[i].rfc_usuario}">
											<div class="column-user-data">${results.rows[i].nombre_usuario}</div>
											<div class="column-user-data">${results.rows[i].rfc_usuario}</div>
											<div class="column-opt-data"><span class="material-icons" onclick="editarRegistroUsuario('${results.rows[i].rfc_usuario}','${USER_APP}')">edit</span></div>
											<div class="column-opt-data"><span class="material-icons" onclick="observarDatosUsuario('${results.rows[i].rfc_usuario}')">fact_check</span></div>
											<div class="column-opt-data"><span class="material-icons" onclick="eliminarDatosUsuario('${results.rows[i].rfc_usuario}','${USER_APP}')">delete_forever</span></div>
										</div>`
					}
				}
				registrosUsuarios.innerHTML = html;
			});
		}, function(err){
			console.error(err.message)
		}, function(){
			resolve()
		})
	})
}

function observarDatosUsuario(rfc){
	// console.log(rfc)
	desmarcarButton('btnRegistrar')
	cargarModuloRegistro()
	obtenerDatosUsuario(rfc)
}