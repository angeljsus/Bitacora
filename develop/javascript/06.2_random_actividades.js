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


function htmlRandomActividades(){
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
	<div class="title-similares">
		<div class="row-title-similar">
			<div class="item-similar" id="titleChange">
				ACTIVIDADES RANDOM
			</div>
		</div>
		<div class="row-title-similar">
			<div class="item-similar" id="desplFechaOtros">
				<div class="item-similar">
					
					<input 
						class="item-inp-minus" 
						type="text" 
						id="inpInicio"  
						onchange="" 
						placeholder="Seleccionar fecha" 
						disabled>
					
					<button 
						class="btn-minus" 
						onclick="crearCalendario('inpInicio')" 
						id="btInptDateInicio">INICIO</button>

					<input 
						class="item-inp-minus" 
						type="text" 
						id="inpFin" 
						onchange="" placeholder="Seleccionar fecha" 
						disabled>
						
					<button 
						class="btn-minus" 
						onclick="crearCalendario('inpFin')" 
						id="btInptDateFin">FIN</button>

					<div class="item-similar">
						<button class="btn-minus" 
							onclick="leerFechasRandom()">
							GENERAR
						</button>
					</div>

				</div>
			</div>
		</div>
	</div>
	<div class="content-similares" id="divOtrosDatos">
		<div class="actividades-constantes">
			<div class="registrar-constantes">
				<div class="item-form random-inp" >
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
				<div class="mensaje-form" id="messageActRandom"></div>
			</div>

			<div class="mostrar-constantes">
				<div class="lista-actividades">
					<div class="title-mod">Actividades</div>
					<div class="content" id="listaActividades">
						<!--
						<div class="item-act-random">
							<div class="agarrate-act">
								<input class="checker" type="checkbox" id="check1"><label for="check1"></label>
							</div>
							<div class="options-act-random">
								<div class="option-act">
									<span class="material-icons">edit</span>
								</div>
								<div class="option-act">
									<span class="material-icons">delete_forever</span>
								</div>
							</div>
						</div>
						-->
					</div>
				</div>

			</div>

		</div>
	</div>
	`;

	areaOtrosRegistros.innerHTML = html;
	areaOtrosRegistros.style.display = 'flex';
	areaFechas.style.display = 'none';
	mostrarActividadesRegistradas({ rfc: KEY, user: USER_APP})

}