function cargaRandomActividades(rfc){
	const optionsBarFloar = document.getElementById('optionsBarFloar');
	let html = `
		<button class="btn-otros" onclick="htmlDisableDaysCalendar()">
			<span class="material-icons">free_cancellation</span>
		</button>
		<button class="btn-otros" onclick="htmlRandomActividades()">
			<span class="material-icons">shuffle</span>
		</button>
		`
	optionsBarFloar.innerHTML = html;

}


// seleccion de dos fechas solamente
let _arrayDates = [];
// actualizacion del status de las fechas
let _arrayEstadosFechas = [];

function htmlRandomActividades(){
	_arrayDates = [];
	const KEY = localStorage.getItem('RFC_KEY');
	const USER_APP = localStorage.getItem('USER_APP');
	const areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
	const areaFechas = document.getElementById('areaFechas');
	const backDates = document.getElementById('backDates');
	// mostrarActividadesRegistradas({ rfc: KEY, user: USER_APP})
	
	if (!backDates) {
		optionsBarFloar.insertAdjacentHTML('afterbegin',`
			<button id="backDates" class="btn-otros" onclick="regresaFechasActual()">
				<span class="material-icons">low_priority</span>
			</button>`)
	}

	let html = `
		<div class="random-module">
			<!--HEADER-->
			<div class="header-module">
				<div class="title-header">GENERAR ACTIVIDADES ALEATORIAS</div>	
			</div>
			<!--HEADER-->
				<!--MODULO-->
			<div class="container-module">
				<div class="calendar-area">
					<div class="preview-calendar" id="calendar3"></div>
					<div class="options-calendar">
						<div class="info-group" id="infoRandomSeleccion"></div>
						<div class="buttons-container" id="randomSeleccionBtns">
							<!--<button  class="btn-regular" onclick="leerArreglo(${JSON.stringify(_arrayDates)})">getArray</button>-->
						</div>
						<div class="messages-container" id="messageRandomContainer"></div>
					</div>
				</div>
				<!--ACTIVIDADES-->
				<div class="actividades-area">
					<!--FORM-->
					<div class="formulario">
						<span 
							name="randomActividad" 
							onclick="counterValues(this.id, 'messageRandomContainer')" 
							class="input-actividad" 
							role="input" 
							type="text" 
							data-placeholder="Descripción de la actividad" 
							id="inpRandomActividad" 
							contenteditable></span>
						<button class="btn-regular" onclick="guardarDescripcionActividad()" id="btGuardarRandom">GUARDAR</button>
					</div>
					<!--FORM-->

					<!--ACTS-->
					<div class="despliegue-actividades" id="listaActividades">
						<!--<div class="item-act-random">
							<div class="agarrate-act">
								<div class="random-ref">100</div>
								<div class="description-ref">
									ñkasdasdm asd asd as da dsasd asd a ds
									ñkasdasdm asd asd as da dsasd asd a ds
									ñkasdasdm asd asd as da dsasd asd a ds
									ñkasdasdm asd asd as da dsasd asd a ds
									ñkasdasdm asd asd as da dsasd asd a ds
								</div>
							</div>
							<div class="options-act-random">
								<div class="option-act">
									<span class="material-icons" >edit</span>
								</div>
								<div class="option-act">
									<span class="material-icons">delete_forever</span>
								</div>
							</div>
						</div>-->

					</div>
					<!--ACTS-->

				</div>
				<!--ACTIVIDADES-->
			</div>
				<!--MODULO-->

		</div>
	`;
	console.log(areaOtrosRegistros)
	areaOtrosRegistros.innerHTML = html;
	areaOtrosRegistros.style.display = 'flex';
	areaFechas.style.display = 'none';
	const specific = getDiasFestivos(); 
	const data = 
		{
			mode: 1, // mode (0: modal o 1:child)
			// si es child busca propiedad 'parent' con un id del elemento padre
			parentId: 'calendar3',
			format:'string',
			disable: {
				daysOfWeek:[0,6],
				// eachMonth:[ { day:21, month:9}, { day:21, month:10} ],
				specific: specific
			},
			sinceTo: _arrayDates,
			global: _arrayEstadosFechas
		}
			getDatesSegunStatus()
		// .then( array => { data.global = _arrayEstadosFechas; return _arrayEstadosFechas; } )
		.then( object => { 
			// _arrayEstadosFechas = object;
			console.log(data)
			getCalendario(data); 
		} )


	mostrarActividadesRegistradas({ rfc: KEY, user: USER_APP})

}
