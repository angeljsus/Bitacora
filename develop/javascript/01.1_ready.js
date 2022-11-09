// const Excel = require('exceljs');
const fs = require('fs-extra');

window.addEventListener('DOMContentLoaded', existeSesionIniciada);

			// htmlRandomActividades()
function existeSesionIniciada(){
	// hacer consulta para ver si existe sesion iniciada
	getTables()
		.then(function(response){
			// getDatesSegunStatus();
			// localStorage.setItem('USER_APP','');
			let USER_APP = localStorage.getItem('USER_APP');
			if (!USER_APP) {
				abrirLoginAcceso()
			} else {
				// console.log('Hay usuario registrado: ' + USER_APP)
				// Hay acceso y ve si tenemos datos almacenados
				let NOMBRE_USUARIO = localStorage.getItem('NOMBRE_USUARIO')
				const nombreUsuarioDsp = document.getElementById('nombreUsuarioDsp');
				nombreUsuarioDsp.innerHTML = NOMBRE_USUARIO;

				// closeModal()
				if (response) {
					cargarModuloRegistro()
					let KEY_RFC = localStorage.getItem('RFC_KEY');
					// cargaRandomActividades(KEY_RFC)

					if (KEY_RFC) {
						obtenerDatosUsuario(KEY_RFC)
					}
					desmarcarButton('btnRegistrar')
					
				} else {
					cargarModuloUsuarios()
					desmarcarButton('btnUsuariosr')
				}
			}
		})
		.then(function(){

			//BUTTONS 
			btnRegistrar.addEventListener('click', function(ev){
				let KEY = localStorage.getItem('RFC_KEY');
				cargarModuloRegistro()
				desmarcarButton(ev.target.id)
				if (KEY) {
					obtenerDatosUsuario(KEY)
				} 
			})


			btnUsuariosr.addEventListener('click', function(ev){
				cargarModuloUsuarios()
				desmarcarButton(ev.target.id)
			})

			//BUTTONS 

			// MODAL CLOSE
			modales.addEventListener('click', function(ev){
				if (ev.target.classList[0] == 'modulo-modal') {
					closeModal()
				}
			})
			// MODAL CLOSE
		})

}

function abrirLoginAcceso(){
	const modales = document.getElementById('modales');
	modales.classList.add('modulo-modal-1');
	modales.style = 'background: black;';
	modales.innerHTML = `
		<div class="login-csc">
			<div class="contenedor-login">
				<input id="usuarioLogin" class="item-login" placeholder="Usuario" type="text"/>
				<input id="contrasLogin" class="item-login" placeholder="Contraseña" type="password"/>
				<button class="item-login btn-login" onclick="validarUsuario()">INGRESAR</button>
				<span id="messageLogin"></span>
			</div>
		</div>
	`;
}

function salirAplicacion(){
	localStorage.setItem('USER_APP', '');
	localStorage.setItem('RFC_KEY','');
	abrirLoginAcceso()
}

function validarUsuario(){
	const usuarioLogin = document.getElementById('usuarioLogin');
	const contrasLogin = document.getElementById('contrasLogin');
	const messageLogin = document.getElementById('messageLogin');
	const db = getDatabase();
	if (usuarioLogin.value !== '' && contrasLogin.value !== '') {

		db.transaction(function(tx){
			tx.executeSql(`SELECT 
											*
										FROM 
											TBL_USUARIO_APP
										WHERE 
											clave_usr = ?
										AND 
											contrasena_usr = ?`, [usuarioLogin.value, contrasLogin.value], function(tx, results){
				if (results.rows.length == 1) {
					// agrega la sesion para el usuario
					localStorage.setItem('USER_APP', usuarioLogin.value)
					localStorage.setItem('NOMBRE_USUARIO', results.rows[0].nombre_usr)
					const nombreUsuarioDsp = document.getElementById('nombreUsuarioDsp');
					nombreUsuarioDsp.innerHTML = results.rows[0].nombre_usr;
					closeModal()
					statusReadyApp()
				} else {
					messageLogin.innerHTML = 'Usuario / contraseña incorrecta'
				}
			});
		},function(err){
			console.log(err.message)
		})

	} else {
		messageLogin.innerHTML = 'Falta registro por rellenar'
	}

}

function statusReadyApp(){
	console.log('Se brindo acceso al vato')
	const btnRegistrar = document.getElementById('btnRegistrar');
	const btnPendiente = document.getElementById('btnPendiente');
	const btnUsuariosr = document.getElementById('btnUsuariosr');
	const modales = document.getElementById('modales');
	const db = getDatabase();
	db.transaction( function(tx){
		tx.executeSql(`
					SELECT 
						rfc_usuario
					FROM
						TBL_USUARIO
					LIMIT 1
					`, [], function(tx, results){
						// console.log(results.rows.length)
						if (results.rows.length > 0) {
							cargarModuloRegistro()
							let KEY_RFC = localStorage.getItem('RFC_KEY');
							if (KEY_RFC) {
								obtenerDatosUsuario(KEY_RFC)
							}
							desmarcarButton('btnRegistrar')
						} else {
							cargarModuloUsuarios()
							desmarcarButton('btnUsuariosr')
						}
			})
		})
}

	// MARCAR BOTONES
	function desmarcarButton(id){
		const btnRegistrar = document.getElementById('btnRegistrar');
		const btnUsuariosr = document.getElementById('btnUsuariosr');

		btnRegistrar.style = 'background: white; color: black;';
		btnUsuariosr.style = 'background: white; color: black;';
		document.getElementById(id).style = 'background: gray; color: white;'; 
	}
	// MARCAR BOTONES
