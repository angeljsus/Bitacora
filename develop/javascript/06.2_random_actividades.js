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


let _arrayDates = [];

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
			<div class="header-module"></div>
			<!--HEADER-->
				<!--MODULO-->
			<div class="container-module">
				<div class="calendar-area">
					<div class="preview-calendar" id="calendar3"></div>
					<div class="options-calendar">
						<button onclick="leerArreglo(${JSON.stringify(_arrayDates)})">getArray</button>
						<div id="infoRandomSeleccion"></div>
					</div>
				</div>
				<!--ACTIVIDADES-->
				<div class="actividades-area">
					<!--FORM-->
					<div class="formulario">
						<span 
							name="optActividad" 
							onclick="counterValues(this.id)" 
							class="input-actividad editable" 
							role="input" type="text" 
							data-placeholder="Descripción de la actividad" 
							id="inputActividad" 
							contenteditable>
						</span>
						<button class="btn-regular" onclick="guardarDescripcionActividad()" id="btGuardarRandom">GUARDAR</button>
					</div>
					<!--FORM-->

					<!--ACTS-->
					<div class="despliegue-actividades">
						<div class="item-act-random">
							<div class="agarrate-act">
								<div class="random-ref">100</div>
							</div>
							<div class="options-act-random">
								<div class="option-act">
									<span class="material-icons" >edit</span>
								</div>
								<div class="option-act">
									<span class="material-icons">delete_forever</span>
								</div>
							</div>
						</div>

						<div class="item-act-random"><div class="agarrate-act"></div></div>

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
			sinceTo: _arrayDates
			// global: globalArray
		}
			getDatesSegunStatus()
		.then( array => { data.global = array; return data; } )
		.then( object => { getCalendario(object); } )


	// mostrarActividadesRegistradas({ rfc: KEY, user: USER_APP})

}

const leerArreglo = () => {
	console.warn(_arrayDates)
}
