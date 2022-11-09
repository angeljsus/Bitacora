// el evento es escuchado desde cargaRandomActividades() 06.2_random_actividades.js
const htmlDisableDaysCalendar = () => {

	const KEY = localStorage.getItem('RFC_KEY');
	const USER_APP = localStorage.getItem('USER_APP');
	const areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
	const areaFechas = document.getElementById('areaFechas');
	const backDates = document.getElementById('backDates');
	// const globalArray = getDatesSegunStatus();
	const specific = getDiasFestivos(); 
	// console.log('spec 0 ',specific)
	const data = 
		{
			mode: 1, // mode (0: modal o 1:child)
			// si es child busca propiedad 'parent' con un id del elemento padre
			parentId: 'parentCalendar',
			format:'string',
			disable: {
				daysOfWeek:[0,6],
				// eachMonth:[ { day:21, month:9}, { day:21, month:10} ],
				specific: specific
			},
			// global: globalArray
		}

	if (!backDates) {
		optionsBarFloar.insertAdjacentHTML('afterbegin',`
			<button id="backDates" class="btn-otros" onclick="regresaFechasActual()">
				<span class="material-icons">low_priority</span>
			</button>`)
	}

	let html = `
		<div class="title-similares">
			<div class="row-title-similar">
				<div class="item-similar">
					ASIGNAR ESTADO DE FECHAS
				</div>
			</div>
			<div class="row-title-similar">
				<div class="item-similar">
					Marcar días según como se cumplió o se cumplirá la jornada laboral
				</div>
			</div>
		</div>
		<div class="content-disable">
			<div class="content-area">
				<div class="calendar-area" id="parentCalendar"></div>	
				<div class="calendar-options">
						<div class="options-select">
							<div class="option">Marcar cómo:</div>
							<div 
								class="option seleccionable" 
								valor="null" 
								name="valuesModMarcado" 
								onclick="marcarComo(this, 2)">
									<div class="mark status-vacaciones" ></div>
									Vacaciones
								</div>
							<div 
								class="option seleccionable" 
								valor="null" 
								name="valuesModMarcado" 
								onclick="marcarComo(this, 1)">
									<div class="mark status-permiso"></div>
									Permiso
								</div>
							<div 
								class="option seleccionable" 
								valor="null" 
								name="valuesModMarcado" 
								onclick="marcarComo(this, 3)">
									<div class="mark status-oficina"></div>
									Se laboró en oficinas
								</div>
							<div 
								class="option seleccionable" 
								valor="null" 
								name="valuesModMarcado" 
								onclick="marcarComo(this, 10)">
									<div class="mark"></div>
									Limpiar
								</div>
						</div>
				</div>	

			</div>
			<div class="info-area"></div>
		</div>
	`;

	areaOtrosRegistros.innerHTML = html;
	// const globalArray = 
	getDatesSegunStatus()
	// .then( array => console.log(array) )
	.then( array => { data.global = array; return data; } )
	.then( object => { getCalendario(object); } )
	areaOtrosRegistros.style.display = 'flex';
	areaFechas.style.display = 'none';
}

const marcarComo = (e, value) => {

	let color = getColorStatus(value);
	// switch(value){
	// 	case 1:
	// 		color = '#779be7'
	// 	break;
	// 	case 2:
	// 		color = '#588b8b'
	// 	break;
	// 	case 3:
	// 		color = '#ffd000'
	// 	break;
	// 	// case 10:
	// 	// 	color = '#ff002b'
	// 	// break;
	// }

	const elements = document.getElementsByName('valuesModMarcado');
	let i = 0;
	do{
		elements[i].style.backgroundColor = '';
		elements[i].setAttribute('valor', null);
		i++;
	}while(i < elements.length)
	e.style.backgroundColor = color;
	e.setAttribute('valor', value);
}

const revisarRegistroEnBd = (valorFecha, valorEstado, color) => {
	console.log('valor: %s; estado: %s ', valorFecha, valorEstado)
	const db = getDatabase();
	const KEY = localStorage.getItem('RFC_KEY');
	const USER_APP = localStorage.getItem('USER_APP');
	return new Promise( (resolve, reject) => {
		db.transaction( tx => {
			tx.executeSql(`SELECT 
					count(*) cantidad 
				FROM 
					TBL_CAMPOS 
				WHERE 
					claveusr = ? AND rfcusuario = ? AND fecha = ?`, 
				[USER_APP, KEY, valorFecha], (tz, results) => {
					resolve(results.rows[0].cantidad > 0 ? true : false)
				})
		},err => reject(err) )
	})
	.then( existe => {
		let query = '';
		const array = existe ? [USER_APP, KEY, valorFecha] : [];
		valorEstado === 10 ? ( query = 'DELETE FROM TBL_CAMPOS WHERE claveusr = ? AND rfcusuario = ? AND fecha = ?;') :  
		existe ? query = `UPDATE TBL_CAMPOS SET capturado=${valorEstado} WHERE claveusr = ? AND rfcusuario = ? AND fecha = ?;` : 
			query = `INSERT INTO TBL_CAMPOS VALUES('','','','','','','','','','','','','','','','','','','','',${valorEstado},'${valorFecha}','${KEY}','${USER_APP}');`;
		valorEstado === 10 ? ( existe ? query=`DELETE FROM TBL_CAMPOS WHERE claveusr = ? AND rfcusuario = ? AND fecha = ?;` : query='') : ''
		return {query, array};
	})
	.then( ({query, array}) => {
		if(query !== ''){
			return new Promise( (resolve, reject) => {
				db.transaction( tx => {
					tx.executeSql(query, array)
				},err => reject(err), () => resolve() )
			})
			.then( () => {
				const element = document.getElementById(`itemFechaReg-${valorFecha}`);
				element ? element.style.backgroundColor = valorEstado === 10 ? '#ff002b' : color : ''
				// console.log(element)
				return getInicioHomeOffice()
				.then( inicio => {
					return actualizarCantidades(inicio, KEY)
				})
			})
		}
		return Promise.resolve()
	})

}

const getInicioHomeOffice = () => {
	const KEY = localStorage.getItem('RFC_KEY');
	const USER_APP = localStorage.getItem('USER_APP');
	const db = getDatabase();
	return new Promise( (resolve, reject) => {
		db.transaction( tx => {
			tx.executeSql('SELECT inicio_homeoff FROM TBL_USUARIO WHERE rfc_usuario = ? AND claveusr = ?', [KEY, USER_APP], (tx, results) =>{
				resolve(results.rows[0].inicio_homeoff)
			})
		},err => reject(err) )
	})
}

const getDatesSegunStatus = () => {
	const KEY = localStorage.getItem('RFC_KEY');
	const USER_APP = localStorage.getItem('USER_APP');
	const db = getDatabase();
	return new Promise( (queryResolve, reject) => {
		db.transaction( tx => {
			tx.executeSql('SELECT fecha, capturado FROM TBL_CAMPOS WHERE rfcusuario = ? AND claveusr = ?', [KEY, USER_APP], (tx, results) => {
				const object = Object.keys(results.rows);
				if(object.length > 0){
					return new Promise( (resolve, reject) => {
						let counter = 1;

						for (let i = 0, promise = Promise.resolve(); i < object.length; i++) {
							promise = promise.then( () => {
								let key = object[i];
								let split = results.rows[key].fecha.split('-');
								const dateObject = getJsonDate( new Date(split[2], split[1]-1, split[0]) ) 
								dateObject.colorToGroup = getColorStatus(results.rows[key].capturado);
								object[i] = dateObject;
							})
							.then(() => counter++ )
							.then(cnt => cnt === object.length ? resolve( object ) : '' )
						}
					})
					.then( array => queryResolve(array) )
				}
				queryResolve([]);
			})
		},err => reject(err) )
	})
}


const getColorStatus = capturado => {
	let color = '';
	switch(capturado){
		case 0:
			color = '#80b918'
		break;
		case 1:
			color = '#779be7'
		break;
		case 2:
			color = '#588b8b'
		break;
		case 3:
			color = '#ffd000'
		break;
		// caso especifico marcado de días eliminar
		case 10:
			color = '#adb5bd'
		break;
	}

	return color;
}