function getDatabase(){
	return openDatabase('daba-bitacora','1.0','Almacenamiento de información de bitácoras.', 1000000);
}

function getTables(){
	const db = getDatabase();
	return new Promise( function(resolve, reject){
		db.transaction( function(tx){
			// usuarios para logear
			tx.executeSql(`CREATE TABLE IF NOT EXISTS TBL_USUARIO_APP (
					clave_usr varchar(13),
					nombre_usr varchar(70),
					contrasena_usr varchar(20),
					PRIMARY KEY (clave_usr)
				);
			`);

			tx.executeSql(`CREATE TABLE IF NOT EXISTS TBL_ACTIVIDADES(
					id_actividad int,
					descripcion_actividad varchar(201),
					tipo_actividad varchar(70),
					rfcusuario varchar(13),
					claveusr int,
					PRIMARY KEY (id_actividad, rfcusuario, claveusr),
					FOREIGN KEY (rfcusuario) REFERENCES TBL_USUARIO_APP(rfc_usuario),
					FOREIGN KEY (claveusr) REFERENCES TBL_USUARIO(clave_usr)
				);
			`);


			// tx.executeSql(`insert into TBL_ACTIVIDADES values
			// 	(1,'Actividad 1', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(2,'Actividad 2', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(3,'Actividad 3', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(4,'Actividad 4', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(5,'Actividad 5', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(6,'Actividad 6', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(7,'Actividad 7', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(8,'Actividad 8', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(9,'Actividad 9', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(10,'Actividad 10', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(11,'Actividad 11', 'ASDASDASDASDA', 'angel.trujillo'),
			// 	(12,'Actividad 12', 'ASDASDASDASDA', 'angel.trujillo')
			// 	`)

			// usuarios para cargar registros de usuarios
			tx.executeSql(`CREATE TABLE IF NOT EXISTS TBL_USUARIO (
					rfc_usuario varchar(13),
					nombre_usuario varchar(70),
					puesto_usuario varchar(300),
					dga_direccion varchar(300),
					inicio_homeoff varchar(8),
					claveusr varchar(13),
					PRIMARY KEY (rfc_usuario, claveusr),
					FOREIGN KEY (claveusr) REFERENCES TBL_USUARIO(clave_usr)
				);
			`);

			// tx.executeSql('')

			tx.executeSql(`CREATE TABLE IF NOT EXISTS TBL_CAMPOS (
					campo_1 varchar(200),
					campo_2 varchar(200),
					campo_3 varchar(200),
					campo_4 varchar(200),
					campo_5 varchar(200),
					campo_6 varchar(200),
					campo_7 varchar(200),
					campo_8 varchar(200),
					campo_9 varchar(200),
					campo_10 varchar(200),
					campo_11 varchar(200),
					campo_12 varchar(200),
					campo_13 varchar(200),
					campo_14 varchar(200),
					campo_15 varchar(200),
					campo_16 varchar(200),
					campo_17 varchar(200),
					campo_18 varchar(200),
					campo_19 varchar(200),
					campo_20 varchar(200),
					capturado int,
					fecha date,
					rfcusuario varchar(13),
					claveusr varchar(13),
					PRIMARY KEY (rfcusuario, fecha, claveusr),
					FOREIGN KEY (rfcusuario) REFERENCES TBL_USUARIO(id_usuario),
					FOREIGN KEY (claveusr) REFERENCES TBL_USUARIO(clave_usr)
				);
			`);

		}, function(err){
			console.error('--> ' +err.message)
		}, function(){
			resolve()
		})
	})
	.then(function(){
		return new Promise( function(resolve, reject){
			db.transaction( function(tx){
				tx.executeSql(`
					SELECT 
						clave_usr
					FROM
						TBL_USUARIO_APP
					LIMIT 1`, [], function(tx, results){
						if (results.rows.length <= 0) {
							tx.executeSql(`INSERT INTO TBL_USUARIO_APP VALUES
								('angel.trujillo', 'Ángel Aguilar', '000000'),
								('daniel.acosta', 'Daniel Acosta', '123456'),
								('usuario1', 'Fernando Rivas', '589645'),
								('usuario2', 'Carmela Sierra', '336985'),
								('usuario3', 'Pedro Bravo', '785136')
							`)
						}
						resolve(results.rows.length)
					})
			}, function(err){
				console.error(err.message)
			}, function(){
				// resolve()
			})
		})
	})
	.then(function(){
		return new Promise( function(resolve, reject){
			let USER_APP = localStorage.getItem('USER_APP');
			db.transaction( function(tx){
				tx.executeSql(`
					SELECT 
						rfc_usuario
					FROM
						TBL_USUARIO
					WHERE 
						claveusr = ?
					LIMIT 1
					`, [USER_APP], function(tx, results){
						let respuesta = false;
						// console.log(results.rows.length)
						if (results.rows.length > 0) {
							respuesta = true;
						}
						resolve(respuesta)
					})
			}, function(err){
				console.error(err.message)
			}, function(){
				// resolve()
			})
		})
	})
}
