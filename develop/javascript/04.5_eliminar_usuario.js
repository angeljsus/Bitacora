function eliminarDatosUsuario(rfc, userApp){
	modalCascade();
	const db = getDatabase();
	const cscHeader = document.getElementById('cscHeader') 
	const cscContent = document.getElementById('cscContent') 
	const cscOption = document.getElementById('cscOption') 
	let cantResults = 0;
	let html = '';
	cscHeader.innerHTML = 'Eliminar Usuario';
	// console.log(data)
	db.transaction( function(tx){
		tx.executeSql(`
			SELECT
				*
			FROM
				TBL_USUARIO
			WHERE
				rfc_usuario = ?
		`, [rfc], function(tx, results){
			cantResults = results.rows.length;
			if (cantResults > 0) {
				html = `
					<div class="csc-row"><div class="csc-col">RFC:</div><div class="csc-col">${results.rows[0].rfc_usuario}</div></div>
					<div class="csc-row"><div class="csc-col">Puesto:</div><div class="csc-col">${results.rows[0].puesto_usuario}</div></div>
					<div class="csc-row"><div class="csc-col">Nombre:</div><div class="csc-col">${results.rows[0].nombre_usuario}</div></div>
					<div class="csc-row"><div class="csc-col">Dirección:</div><div class="csc-col">${results.rows[0].dga_direccion}</div></div>
					<div class="csc-row"><div class="csc-col">Inicio trabajo en casa:</div><div class="csc-col">${results.rows[0].inicio_homeoff}</div></div>
				`;

				cscContent.innerHTML = html;
				cscOption.innerHTML = `
				<button class="csc-option" onclick="eliminarUsarioConsulta('${results.rows[0].rfc_usuario}', '${userApp}')">ELIMINAR</button>
				<button class="csc-option" onclick="closeModal()">CANCELAR</button>
				`;
			}
		})
	}, function(err){
		console.error(err.message)
	}, function(){
	})

}

function eliminarUsarioConsulta(rfc, userApp){
	const db = getDatabase();
	return new Promise(function(resolve, reject){
		db.transaction( function(tx){
			tx.executeSql('DELETE FROM TBL_CAMPOS WHERE rfcusuario = ? AND claveusr = ?', [rfc, userApp])
		}, function(err){
			console.error(err.message)
		}, function(){
			resolve()
		})
	})
	.then(function(){
		db.transaction( function(tx){
			tx.executeSql('DELETE FROM TBL_USUARIO WHERE rfc_usuario = ? AND claveusr = ?', [rfc, userApp])
		}, function(err){
			console.error(err.message)
		}, function(){
		})
	})
	.then(function(){
		db.transaction( function(tx){
			tx.executeSql('DELETE FROM TBL_ACTIVIDADES WHERE rfcusuario = ? AND claveusr = ?', [rfc, userApp])
		}, function(err){
			console.error(err.message)
		}, function(){
		})
	})
	.then(function(){
		const itemDelete = document.getElementById('code' + rfc)
		itemDelete.remove();
		closeModal()
	})
}