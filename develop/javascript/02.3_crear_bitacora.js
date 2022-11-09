function crearPlantillaBitacora(){

	console.warn('CREANDO BITACORA')
	let NOMBRE_USUARIO = localStorage.getItem('NOMBRE_USUARIO');
	const homePath = 'C:\\GENERADOR_BITACORAS\\' + NOMBRE_USUARIO + '\\';
	const mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
	const workbook = new Excel.Workbook();
	const db = getDatabase();
	const path = require('path')
	let cantResults = 0;
	let ultimaHoja = '';
	let rfc = localStorage.getItem('RFC_KEY');
	let USER_APP = localStorage.getItem('USER_APP');

	workbook.creator = 'INEGI - BITACORA';
	workbook.lastModifiedBy = 'GENERADOR';
	let worksheet = '';
	// columnas de la A a la M
	let columnas = [
			    	{ header: '', key: 'x_a', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_b', width: 5,  style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_c', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_d', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_e', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_f', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_g', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_h', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_i', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_j', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_k', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_l', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
			    	{ header: '', key: 'x_m', width: 10, style: { font: { name: 'Arial',  color: { argb: '141413' }, family: 2, size: 10}, }},
				];


	db.transaction( function(tx){
		tx.executeSql(`
			SELECT
				*, substr(fecha, 7,10) year,substr(fecha, 4,2) month, substr(fecha, 1,2) day
			FROM
				TBL_CAMPOS C,
				TBL_USUARIO U
			WHERE
				C.rfcusuario = U.rfc_usuario
			AND
				U.rfc_usuario = ?
			AND
				C.capturado = 0
			AND
				U.claveusr = C.claveusr
			AND
				U.claveusr = ?
			ORDER BY
				year, month, day
		`, [rfc, USER_APP], function(tx, results){
			cantResults = results.rows.length;
			console.log(cantResults)
			if (cantResults > 0) {
				let i = 0;
				let j = 0;
				let date = ''; 
				let nombreHoja = '';
				let fecha = '';
				let direccion = decodeCaracteres(results.rows[0].dga_direccion);
				let nombre = decodeCaracteres(results.rows[0].nombre_usuario);
				let puesto = decodeCaracteres(results.rows[0].puesto_usuario);
				let contadorAct = 1;
				openStatus('Creando bitácora', false)
				// let image = require('./img/logo_1.png')
				const logoInegi = workbook.addImage({
	  			filename:  path.join(__dirname, '/img/logo_1.png'),
	  			extension: 'png',
				});
				agregarStatus('Agregando actividades...', false)
				do{
					console.log(results.rows[i].fecha)
					date = results.rows[i].fecha.split('-')
					fecha = obtenFecha(results.rows[i].fecha, true)
					nombreHoja = date[2] + date[1] + date[0];
					// console.log('Nombre hoja: '+ nombreHoja)
					// console.log('Fecha: '+ date[0] + ' de ' + fecha)
					// console.log('direccion: ' + direccion)
					// console.log('nombre: ' + nombre)
					// console.log('puesto: ' + puesto)
					worksheet = workbook.addWorksheet(nombreHoja);
					worksheet.columns = columnas;
					worksheet.addRow({ x_b : '', x_c : 'Bitácora', x_m : ''})
					worksheet.addRow({ x_b : '', x_c : fecha, x_m : ''})
					worksheet.addRow({ x_b : '', x_c : 'Jornada laboral: 8:30 am a 4:30 pm',x_m : ''})
					worksheet.addRow({ x_b : '', x_c : 'DGES'/*direccion*/, x_m : ''})
					worksheet.addRow({x_b : '',x_m : ''})
					worksheet.addRow({ x_b : '', x_c : 'Nombre:', x_d : nombre, x_m : ''})
					worksheet.addRow({ x_b : '', x_c : 'Puesto', x_d : puesto, x_m : ''})
					worksheet.addRow({ x_b : '', x_c : 'DGA o Dir:', x_d : direccion, x_m : ''})
					worksheet.mergeCells('D7:M7');
					worksheet.mergeCells('B1:M1');
					worksheet.mergeCells('D8:M8');
					worksheet.mergeCells('D9:M9');
					worksheet.addRow({x_b : '',x_m : ''})
					worksheet.addRow({ x_b : '', x_c : 'Actividades Realizadas', x_m : ''})
					worksheet.mergeCells('C11:M11');
					worksheet.addRow({x_b : '',x_m : ''})
					// console.log(results.rows[i].rfc_usuario)
					worksheet.addImage(logoInegi, {
		  			tl: { col: 12, row: 1.5 },
		  			br: { col: 13, row: 3.8 }
					});

					contadorAct = 1;
					j = 0;

					worksheet.addRow({x_b : 1, x_c :  decodeCaracteres(results.rows[i].campo_1), x_m : ''})
					worksheet.addRow({x_b : 2, x_c :  decodeCaracteres(results.rows[i].campo_2), x_m : ''})
					worksheet.addRow({x_b : 3, x_c :  decodeCaracteres(results.rows[i].campo_3), x_m : ''})
					worksheet.addRow({x_b : 4, x_c :  decodeCaracteres(results.rows[i].campo_4), x_m : ''})
					worksheet.addRow({x_b : 5, x_c :  decodeCaracteres(results.rows[i].campo_5), x_m : ''})
					worksheet.addRow({x_b : 6, x_c :  decodeCaracteres(results.rows[i].campo_6), x_m : ''})
					worksheet.addRow({x_b : 7, x_c :  decodeCaracteres(results.rows[i].campo_7), x_m : ''})
					worksheet.addRow({x_b : 8, x_c :  decodeCaracteres(results.rows[i].campo_8), x_m : ''})
					worksheet.addRow({x_b : 9, x_c :  decodeCaracteres(results.rows[i].campo_9), x_m : ''})
					worksheet.addRow({x_b : 10, x_c :  decodeCaracteres(results.rows[i].campo_10), x_m : ''})
					worksheet.addRow({x_b : 11, x_c :  decodeCaracteres(results.rows[i].campo_11), x_m : ''})
					worksheet.addRow({x_b : 12, x_c :  decodeCaracteres(results.rows[i].campo_12), x_m : ''})
					worksheet.addRow({x_b : 13, x_c :  decodeCaracteres(results.rows[i].campo_13), x_m : ''})
					worksheet.addRow({x_b : 14, x_c :  decodeCaracteres(results.rows[i].campo_14), x_m : ''})
					worksheet.addRow({x_b : 15, x_c :  decodeCaracteres(results.rows[i].campo_15), x_m : ''})
					worksheet.addRow({x_b : 16, x_c :  decodeCaracteres(results.rows[i].campo_16), x_m : ''})
					worksheet.addRow({x_b : 17, x_c :  decodeCaracteres(results.rows[i].campo_17), x_m : ''})
					worksheet.addRow({x_b : 18, x_c :  decodeCaracteres(results.rows[i].campo_18), x_m : ''})
					worksheet.addRow({x_b : 19, x_c :  decodeCaracteres(results.rows[i].campo_19), x_m : ''})
					worksheet.addRow({x_b : 20, x_c :  decodeCaracteres(results.rows[i].campo_20), x_m : ''})

					do{
						worksheet.mergeCells(`C${contadorAct + 12}:M${contadorAct + 12}`);
						worksheet.getRow(contadorAct + 12).getCell(3).alignment = { vertical: 'middle', horizontal: 'center'};	
						contadorAct++;
						j++;
					} while(j < 20);
					// Agrego estilos y fuentes conforme a posicionamiento
					worksheet.getRow(7).getCell(3).font = { name: 'Arial', size: 10,	bold: true};	
					worksheet.getRow(8).getCell(3).font = { name: 'Arial', size: 10,	bold: true};	
					worksheet.getRow(9).getCell(3).font = { name: 'Arial', size: 10,	bold: true};	
					worksheet.getRow(11).getCell(13).font = { name: 'Arial',size: 11,	bold: true};	
					worksheet.getRow(11).getCell(13).alignment = {	vertical: 'middle', horizontal: 'center'};	
					worksheet.getRow(7).getCell(13).alignment = {	vertical: 'middle', horizontal: 'center'};	
					worksheet.getRow(8).getCell(13).alignment = {	vertical: 'middle', horizontal: 'center'};	
					worksheet.getRow(9).getCell(13).alignment = {	vertical: 'middle', horizontal: 'center'};	
					// ultimaHoja = nombreHoja;
					i++;
				} while(i < cantResults)
			// APLICANDO ESTILOS A LAS HOJAS
			// agregarStatus('Agregando estilo...', false)

				workbook.eachSheet((worksheet, sheetId)=>{
					worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber){
						if (rowNumber == 1) {
							// Border a el inicio
							worksheet.getRow(rowNumber).getCell(2).border = {bottom:{style:'thin'}};

						} else {

							// Border a los lados
							worksheet.getRow(rowNumber).getCell(13).border = {right:{style:'thin'}};
							worksheet.getRow(rowNumber).getCell(2).border = {left:{style:'thin'}};

							// Border a las actividades
							if (rowNumber > 12) {
								worksheet.getRow(rowNumber).getCell(2).border = { top: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}, left: {style:'thin'}};
								worksheet.getRow(rowNumber).getCell(2).border = { top: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}, left: {style:'thin'}};
								worksheet.getRow(rowNumber).getCell(3).border = { top: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}, left: {style:'thin'}};
								worksheet.getRow(rowNumber).getCell(3).border = { top: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}, left: {style:'thin'}};
							}
						}
						// Agrego el color y estilos al header
						row.eachCell({ includeEmpty: true }, function(cell, colNumber){
							if (rowNumber > 1 && colNumber > 1 && rowNumber < 6) {
								cell.font = {
									size: 16,
									bold: true
		   					};
								cell.fill = {
			            type: 'pattern',
			            pattern:'solid',
			            fgColor:{argb:'DEEAF6'}
			        	};
							}

							if (cell._address == 'D7' || cell._address == 'D8' || cell._address == 'D9') {
								cell.border = {
		  						bottom: {style:'thin'},
		  						right: {style:'thin'}
		  					}
							}

						})//eachcell
					})//eachRow
				}) //eachsheet
				console.log('--------------------------------->' + cantResults)
				agregarStatus(`Total hojas creadas: ${cantResults}` , false)

				cantResults = cantResults - 1;
				workbook.views = [
				  {
				    firstSheet: (cantResults-5), activeTab: cantResults, visibility: 'visible'
				  }
				]
				// let esperarBro = '';
				crearDir(homePath).then(function(){
					workbook.xlsx.writeFile(`${homePath}Bitácora_${rfc}.xlsx`)
					.then(function(){
						// mensajeRespuestaForm.insertAdjacentHTML('beforeend',`Se guardo registro.<br> En: Bitácora_${rfc}.xlsx`)
						// esperarBro = setTimeout(function(){
						// 	mensajeRespuestaForm.innerHTML = '';
						// }, 3000)
						agregarStatus(`Archivo creado en: ${homePath}` , false)
						agregarStatus(`Nombre de archivo: Bitácora_${rfc}.xlsx` , true)
						console.warn('SE CREO EL LIBRO CON EXITO')
						// return esperarBro;
					})
					.catch(function(){
						agregarStatus(`Ops!, El archivo se encuentra abierto cierralo e intenta nuevamente, libro: Bitácora_${rfc}.xlsx` , true)
						// mensajeRespuestaForm.insertAdjacentHTML('beforeend',`El archivo se encuentra abierto cierralo e intenta nuevamente.<br> Libro: Bitácora_${rfc}.xlsx`)
						// esperarBro = setTimeout(function(){
							// mensajeRespuestaForm.innerHTML = '';
						// }, 4000)
					})
				})
			} else {
				// agregarStatus(`Aun no puedes` , true)

				mensajeRespuestaForm.innerHTML = 'Aún no tienes ningún registro con actividades.'
				setTimeout(function(){
					mensajeRespuestaForm.innerHTML = '';
				}, 4000)
			}
		});
	}, function(err){
		console.error(err.message)
	}, function(){
	})
}
