function cargarModuloUsuarios(){
	const displayContent = document.getElementById('displayContent');
	let html = `
			<div class="modulo">
				<div class="title-modulo">Registrar Personas</div>
				<div class="content-modulo">
					<div class="form-container" id="divForms">
						<div class="item-form">
							<input class="item-input" type="text" id="inpRfcUser" placeholder="RFC*" onkeyup="obtenerUpperRfc()" maxlength="13">
						</div>
						<div class="item-form">
							<input class="item-input" type="text" id="inpNmeUser" placeholder="Nombre completo*">
						</div>
						<div class="item-form">
							<input class="item-input" type="text" id="inpPueUser" placeholder="Puesto*">
						</div>
						<div class="item-form">
							<input class="item-input" type="text" id="inpDgaUser" placeholder="DGA o Dirección*">
						</div>
						<div class="item-form">
								<input class="item-inp-data" type="text" id="inpHomeOff"  value="" onchange="" placeholder="Inicio Trabajo en Casa*" disabled>
								<button class="btn-fecha" onclick="crearCalendario('inpHomeOff')" id="btInptDate">Seleccionar Fecha</button>
						</div>
						<div class="item-form">
							<label class="lbel-file" htmlFor="" id="nameFileDisp">Archivo de bitácora</label>
							<input id="inpFilUser" class="file-input" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onchange="changeValue(this.id)">
						</div>
						<div class="item-form">
								<button class="btn-fecha" onclick="validarUsuarioBitacora(false)">GUARDAR PERSONA</button>
							</div>
							<div class="mensaje-form" id="mensajeRespuestaForm"></div>
						</div>
					<div class="usuarios-container">
						<div class="area-usuarios">
							<div class="title-usuarios">Personas registradas</div>
							<div class="content-usuarios" id="registrosUsuarios">
								<!--<div class="row-user">
								</div>-->
							</div>
						</div>
					</div>
				</div>
			</div>
				`;
	displayContent.innerHTML = html;
	mostrarUsuariosAlta()
}


function obtenerUpperRfc(){
		const inpRfcUser = document.getElementById('inpRfcUser');
		if (inpRfcUser) {
			inpRfcUser.addEventListener('input', function(e){
				inpRfcUser.value = e.target.value.toUpperCase();
			});
		}
}

// const input = document.querySelector('input');
// const log = document.getElementById('values');

// input.addEventListener('input', updateValue);

// function updateValue(e) {
// 	console.log(e)
// }

function changeValue(id){
	const file = document.getElementById(id);
	const nameFileDisp = document.getElementById('nameFileDisp');
	nameFileDisp.style = 'color: black;'
	nameFileDisp.innerHTML = file.files[0].name;
	// console.log(file.style)
	// console.log(file.files[0].name)
}