"use strict";

// const Excel = require('exceljs');
var fs = require('fs-extra');

window.addEventListener('DOMContentLoaded', existeSesionIniciada); // htmlRandomActividades()

function existeSesionIniciada() {
  // hacer consulta para ver si existe sesion iniciada
  getTables().then(function (response) {
    // getDatesSegunStatus();
    // localStorage.setItem('USER_APP','');
    var USER_APP = localStorage.getItem('USER_APP');

    if (!USER_APP) {
      abrirLoginAcceso();
    } else {
      // console.log('Hay usuario registrado: ' + USER_APP)
      // Hay acceso y ve si tenemos datos almacenados
      var NOMBRE_USUARIO = localStorage.getItem('NOMBRE_USUARIO');
      var nombreUsuarioDsp = document.getElementById('nombreUsuarioDsp');
      nombreUsuarioDsp.innerHTML = NOMBRE_USUARIO; // closeModal()

      if (response) {
        cargarModuloRegistro();
        var KEY_RFC = localStorage.getItem('RFC_KEY'); // cargaRandomActividades(KEY_RFC)

        if (KEY_RFC) {
          obtenerDatosUsuario(KEY_RFC);
        }

        desmarcarButton('btnRegistrar');
      } else {
        cargarModuloUsuarios();
        desmarcarButton('btnUsuariosr');
      }
    }
  }).then(function () {
    //BUTTONS 
    btnRegistrar.addEventListener('click', function (ev) {
      var KEY = localStorage.getItem('RFC_KEY');
      cargarModuloRegistro();
      desmarcarButton(ev.target.id);

      if (KEY) {
        obtenerDatosUsuario(KEY);
      }
    });
    btnUsuariosr.addEventListener('click', function (ev) {
      cargarModuloUsuarios();
      desmarcarButton(ev.target.id);
    }); //BUTTONS 
    // MODAL CLOSE

    modales.addEventListener('click', function (ev) {
      if (ev.target.classList[0] == 'modulo-modal') {
        closeModal();
      }
    }); // MODAL CLOSE
  });
}

function abrirLoginAcceso() {
  var modales = document.getElementById('modales');
  modales.classList.add('modulo-modal-1');
  modales.style = 'background: black;';
  modales.innerHTML = "\n\t\t<div class=\"login-csc\">\n\t\t\t<div class=\"contenedor-login\">\n\t\t\t\t<input id=\"usuarioLogin\" class=\"item-login\" placeholder=\"Usuario\" type=\"text\"/>\n\t\t\t\t<input id=\"contrasLogin\" class=\"item-login\" placeholder=\"Contrase\xF1a\" type=\"password\"/>\n\t\t\t\t<button class=\"item-login btn-login\" onclick=\"validarUsuario()\">INGRESAR</button>\n\t\t\t\t<span id=\"messageLogin\"></span>\n\t\t\t</div>\n\t\t</div>\n\t";
}

function salirAplicacion() {
  localStorage.setItem('USER_APP', '');
  localStorage.setItem('RFC_KEY', '');
  abrirLoginAcceso();
}

function validarUsuario() {
  var usuarioLogin = document.getElementById('usuarioLogin');
  var contrasLogin = document.getElementById('contrasLogin');
  var messageLogin = document.getElementById('messageLogin');
  var db = getDatabase();

  if (usuarioLogin.value !== '' && contrasLogin.value !== '') {
    db.transaction(function (tx) {
      tx.executeSql("SELECT \n\t\t\t\t\t\t\t\t\t\t\t*\n\t\t\t\t\t\t\t\t\t\tFROM \n\t\t\t\t\t\t\t\t\t\t\tTBL_USUARIO_APP\n\t\t\t\t\t\t\t\t\t\tWHERE \n\t\t\t\t\t\t\t\t\t\t\tclave_usr = ?\n\t\t\t\t\t\t\t\t\t\tAND \n\t\t\t\t\t\t\t\t\t\t\tcontrasena_usr = ?", [usuarioLogin.value, contrasLogin.value], function (tx, results) {
        if (results.rows.length == 1) {
          // agrega la sesion para el usuario
          localStorage.setItem('USER_APP', usuarioLogin.value);
          localStorage.setItem('NOMBRE_USUARIO', results.rows[0].nombre_usr);
          var nombreUsuarioDsp = document.getElementById('nombreUsuarioDsp');
          nombreUsuarioDsp.innerHTML = results.rows[0].nombre_usr;
          closeModal();
          statusReadyApp();
        } else {
          messageLogin.innerHTML = 'Usuario / contraseña incorrecta';
        }
      });
    }, function (err) {
      console.log(err.message);
    });
  } else {
    messageLogin.innerHTML = 'Falta registro por rellenar';
  }
}

function statusReadyApp() {
  console.log('Se brindo acceso al vato');
  var btnRegistrar = document.getElementById('btnRegistrar');
  var btnPendiente = document.getElementById('btnPendiente');
  var btnUsuariosr = document.getElementById('btnUsuariosr');
  var modales = document.getElementById('modales');
  var db = getDatabase();
  db.transaction(function (tx) {
    tx.executeSql("\n\t\t\t\t\tSELECT \n\t\t\t\t\t\trfc_usuario\n\t\t\t\t\tFROM\n\t\t\t\t\t\tTBL_USUARIO\n\t\t\t\t\tLIMIT 1\n\t\t\t\t\t", [], function (tx, results) {
      // console.log(results.rows.length)
      if (results.rows.length > 0) {
        cargarModuloRegistro();
        var KEY_RFC = localStorage.getItem('RFC_KEY');

        if (KEY_RFC) {
          obtenerDatosUsuario(KEY_RFC);
        }

        desmarcarButton('btnRegistrar');
      } else {
        cargarModuloUsuarios();
        desmarcarButton('btnUsuariosr');
      }
    });
  });
} // MARCAR BOTONES


function desmarcarButton(id) {
  var btnRegistrar = document.getElementById('btnRegistrar');
  var btnUsuariosr = document.getElementById('btnUsuariosr');
  btnRegistrar.style = 'background: white; color: black;';
  btnUsuariosr.style = 'background: white; color: black;';
  document.getElementById(id).style = 'background: gray; color: white;';
} // MARCAR BOTONES
"use strict";

function getDatabase() {
  return openDatabase('daba-bitacora', '1.0', 'Almacenamiento de información de bitácoras.', 1000000);
}

function getTables() {
  var db = getDatabase();
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      // usuarios para logear
      tx.executeSql("CREATE TABLE IF NOT EXISTS TBL_USUARIO_APP (\n\t\t\t\t\tclave_usr varchar(13),\n\t\t\t\t\tnombre_usr varchar(70),\n\t\t\t\t\tcontrasena_usr varchar(20),\n\t\t\t\t\tPRIMARY KEY (clave_usr)\n\t\t\t\t);\n\t\t\t");
      tx.executeSql("CREATE TABLE IF NOT EXISTS TBL_ACTIVIDADES(\n\t\t\t\t\tid_actividad int,\n\t\t\t\t\tdescripcion_actividad varchar(201),\n\t\t\t\t\ttipo_actividad varchar(70),\n\t\t\t\t\trfcusuario varchar(13),\n\t\t\t\t\tclaveusr int,\n\t\t\t\t\tPRIMARY KEY (id_actividad, rfcusuario, claveusr),\n\t\t\t\t\tFOREIGN KEY (rfcusuario) REFERENCES TBL_USUARIO_APP(rfc_usuario),\n\t\t\t\t\tFOREIGN KEY (claveusr) REFERENCES TBL_USUARIO(clave_usr)\n\t\t\t\t);\n\t\t\t"); // tx.executeSql(`insert into TBL_ACTIVIDADES values
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

      tx.executeSql("CREATE TABLE IF NOT EXISTS TBL_USUARIO (\n\t\t\t\t\trfc_usuario varchar(13),\n\t\t\t\t\tnombre_usuario varchar(70),\n\t\t\t\t\tpuesto_usuario varchar(300),\n\t\t\t\t\tdga_direccion varchar(300),\n\t\t\t\t\tinicio_homeoff varchar(8),\n\t\t\t\t\tclaveusr varchar(13),\n\t\t\t\t\tPRIMARY KEY (rfc_usuario, claveusr),\n\t\t\t\t\tFOREIGN KEY (claveusr) REFERENCES TBL_USUARIO(clave_usr)\n\t\t\t\t);\n\t\t\t"); // tx.executeSql('')

      tx.executeSql("CREATE TABLE IF NOT EXISTS TBL_CAMPOS (\n\t\t\t\t\tcampo_1 varchar(200),\n\t\t\t\t\tcampo_2 varchar(200),\n\t\t\t\t\tcampo_3 varchar(200),\n\t\t\t\t\tcampo_4 varchar(200),\n\t\t\t\t\tcampo_5 varchar(200),\n\t\t\t\t\tcampo_6 varchar(200),\n\t\t\t\t\tcampo_7 varchar(200),\n\t\t\t\t\tcampo_8 varchar(200),\n\t\t\t\t\tcampo_9 varchar(200),\n\t\t\t\t\tcampo_10 varchar(200),\n\t\t\t\t\tcampo_11 varchar(200),\n\t\t\t\t\tcampo_12 varchar(200),\n\t\t\t\t\tcampo_13 varchar(200),\n\t\t\t\t\tcampo_14 varchar(200),\n\t\t\t\t\tcampo_15 varchar(200),\n\t\t\t\t\tcampo_16 varchar(200),\n\t\t\t\t\tcampo_17 varchar(200),\n\t\t\t\t\tcampo_18 varchar(200),\n\t\t\t\t\tcampo_19 varchar(200),\n\t\t\t\t\tcampo_20 varchar(200),\n\t\t\t\t\tcapturado int,\n\t\t\t\t\tfecha date,\n\t\t\t\t\trfcusuario varchar(13),\n\t\t\t\t\tclaveusr varchar(13),\n\t\t\t\t\tPRIMARY KEY (rfcusuario, fecha, claveusr),\n\t\t\t\t\tFOREIGN KEY (rfcusuario) REFERENCES TBL_USUARIO(id_usuario),\n\t\t\t\t\tFOREIGN KEY (claveusr) REFERENCES TBL_USUARIO(clave_usr)\n\t\t\t\t);\n\t\t\t");
    }, function (err) {
      console.error('--> ' + err.message);
    }, function () {
      resolve();
    });
  }).then(function () {
    return new Promise(function (resolve, reject) {
      db.transaction(function (tx) {
        tx.executeSql("\n\t\t\t\t\tSELECT \n\t\t\t\t\t\tclave_usr\n\t\t\t\t\tFROM\n\t\t\t\t\t\tTBL_USUARIO_APP\n\t\t\t\t\tLIMIT 1", [], function (tx, results) {
          if (results.rows.length <= 0) {
            tx.executeSql("INSERT INTO TBL_USUARIO_APP VALUES\n\t\t\t\t\t\t\t\t('angel.trujillo', '\xC1ngel Aguilar', '000000'),\n\t\t\t\t\t\t\t\t('daniel.acosta', 'Daniel Acosta', '123456'),\n\t\t\t\t\t\t\t\t('usuario1', 'Fernando Rivas', '589645'),\n\t\t\t\t\t\t\t\t('usuario2', 'Carmela Sierra', '336985'),\n\t\t\t\t\t\t\t\t('usuario3', 'Pedro Bravo', '785136')\n\t\t\t\t\t\t\t");
          }

          resolve(results.rows.length);
        });
      }, function (err) {
        console.error(err.message);
      }, function () {// resolve()
      });
    });
  }).then(function () {
    return new Promise(function (resolve, reject) {
      var USER_APP = localStorage.getItem('USER_APP');
      db.transaction(function (tx) {
        tx.executeSql("\n\t\t\t\t\tSELECT \n\t\t\t\t\t\trfc_usuario\n\t\t\t\t\tFROM\n\t\t\t\t\t\tTBL_USUARIO\n\t\t\t\t\tWHERE \n\t\t\t\t\t\tclaveusr = ?\n\t\t\t\t\tLIMIT 1\n\t\t\t\t\t", [USER_APP], function (tx, results) {
          var respuesta = false; // console.log(results.rows.length)

          if (results.rows.length > 0) {
            respuesta = true;
          }

          resolve(respuesta);
        });
      }, function (err) {
        console.error(err.message);
      }, function () {// resolve()
      });
    });
  });
}
"use strict";

function cargarModuloRegistro() {
  var displayContent = document.getElementById('displayContent');
  return new Promise(function (resolve, reject) {
    var html = "\n\t\t\t\t<div class=\"modulo\">\n\t\t\t\t\t<div class=\"title-modulo\">Registrar Actividades</div>\n\t\t\t\t\t<div class=\"content-modulo\">\n\t\t\t\t\t\t<div class=\"form-container\" id=\"divForms\">\n\t\t\t\t\t\t\t<div class=\"otros-registros\" id=\"optionsBarFloar\">\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpRfcUser\" placeholder=\"RFC\" onkeypress=\"obtenerDatosUsuario(this.value)\" maxlength=\"13\">\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"mensaje-form\" id=\"mensajeResDont\"></div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"similares-container\">\n\t\t\t\t\t\t\t<!--<div class=\"area-similares\">\n\t\t\t\t\t\t\t\t<div class=\"title-similares\">Otras actividades</div>\n\t\t\t\t\t\t\t\t<div class=\"content-similares\" id=\"otrosDatos\"></div>\n\t\t\t\t\t\t\t</div>-->\n\t\t\t\t\t\t\t\n\n\t\t\t\t\t\t\t<div class=\"area-similares\" id=\"areaOtrosRegistros\">\n\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t</div>\n\n\n\t\t\t\t\t\t\t<div class=\"area-similares\" id=\"areaFechas\">\n\t\t\t\t\t\t\t\t<div class=\"title-similares\">\n\t\t\t\t\t\t\t\t\t<div class=\"row-title-similar\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"item-similar\">\n\t\t\t\t\t\t\t\t\t\t\tTOTAL DIAS LABORALES: &nbsp;<span id=\"cantDiasL\"></span>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t<div class=\"item-similar\">\n\t\t\t\t\t\t\t\t\t\t\tFECHA INICIO: &nbsp;<span class=\"user-name\" id=\"inicioHomeOffice\"></span>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class=\"row-title-similar\" id=\"infoCantidades\"></div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class=\"content-similares\" id=\"divSetDate\">\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t\t";
    displayContent.innerHTML = html;
    resolve();
  }).then(function () {
    var areaFechas = document.getElementById('areaFechas');
    var areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
    areaOtrosRegistros.style = 'display: none';
    areaFechas.style = 'display: flex';
  });
}

function obtenerDatosUsuario(rfc) {
  obtenerUpperRfc(); // const optionRegEnable = document.getElementById('optionRegEnable')
  // optionRegEnable.onclick = function(){openDataOtrosUsuarios(rfc, USER_APP, inpFecReg.value)}
  // console.warn(optionRegEnable)

  var db = getDatabase();
  var divForms = document.getElementById('divForms');
  var inpNombre = document.getElementById('inpNombre');
  var inpPuesto = document.getElementById('inpPuesto');
  var inpDirDga = document.getElementById('inpDirDga');
  var inpFecReg = document.getElementById('inpFecReg');
  var USER_APP = localStorage.getItem('USER_APP');
  var mensajeResDont = '';
  var inpRfcUser = document.getElementById('inpRfcUser');
  var divAreaActividades = document.getElementById('divAreaActividades');
  var inicioHomeOffice = document.getElementById('inicioHomeOffice'); // const areaFechas = document.getElementById('areaFechas');
  // const mensajeResDont = document.getElementById('mensajeResDont');

  var RFC = cadenaUpperCase(rfc);
  RFC = replaceSpace(RFC);
  var cantResults = 0;
  var html = '';
  inpRfcUser.value = RFC;
  return new Promise(function (resolve, reject) {
    if (RFC.length == 13) {
      db.transaction(function (tx) {
        tx.executeSql("\n\t\t\t\t\tSELECT\n\t\t\t\t\t\t*\n\t\t\t\t\tFROM\n\t\t\t\t\t\tTBL_USUARIO\n\t\t\t\t\tWHERE\n\t\t\t\t\t\trfc_usuario = ?\n\t\t\t\t\tAND \n\t\t\t\t\t\tclaveusr = ?\n\t\t\t\t", [RFC, USER_APP], function (tx, results) {
          cantResults = results.rows.length; // console.log(cantResults)

          if (cantResults > 0) {
            if (inpNombre) {
              inpNombre.value = decodeCaracteres(results.rows[0].nombre_usuario);
              inpPuesto.value = decodeCaracteres(results.rows[0].puesto_usuario);
              inpDirDga.value = decodeCaracteres(results.rows[0].dga_direccion);
              inpFecReg.value = '';
              divAreaActividades.innerHTML = ''; // inpFecReg.value = results.rows[0].
              // selStatus.value = results.rows[0].
            } else {
              html = "\n\t\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpNombre\" placeholder=\"Nombre\" value=\"".concat(results.rows[0].nombre_usuario, "\" disabled>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpPuesto\" placeholder=\"Puesto\" value=\"").concat(results.rows[0].puesto_usuario, "\" disabled>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpDirDga\" placeholder=\"DGA o Direcci\xF3n\" value=\"").concat(results.rows[0].dga_direccion, "\" disabled>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t\t<input class=\"item-inp-data\" type=\"text\" id=\"inpFecReg\"  value=\"\" onchange=\"obtenerDatosRegistro(this.value, '").concat(USER_APP, "')\" placeholder=\"Seleccionar fecha\" disabled>\n\t\t\t\t\t\t\t\t<button class=\"btn-fecha\" onclick=\"crearCalendario('inpFecReg')\" id=\"btInptDate\">Seleccionar Fecha</button>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t\t<select class=\"item-input\" name=\"\" id=\"selStatus\" onchange=\"validaStatusSelect(this.value, '").concat(results.rows[0].rfc_usuario, "','").concat(USER_APP, "')\">\n\t\t\t\t\t\t\t\t\t<option value=\"0\" selected>Actividades</option>\n\t\t\t\t\t\t\t\t\t<option value=\"1\">Permiso</option>\n\t\t\t\t\t\t\t\t\t<option value=\"2\">Vacaciones</option>\n\t\t\t\t\t\t\t\t\t<option value=\"3\">Se labor\xF3 en Oficinas</option>\n\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"area-actividades\" id=\"divAreaActividades\">\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"item-form item-around\">\n\t\t\t\t\t\t\t\t<button class=\"btn-fecha\" onclick=\"crearPlantillaBitacora()\">EXPORTAR</button>\n\t\t\t\t\t\t\t\t<button class=\"btn-fecha\" onclick=\"almacenarRegistro()\">GUARDAR</button>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"mensaje-form\" id=\"mensajeRespuestaForm\"></div>\n\t\t\t\t\t\t\t");
              divForms.insertAdjacentHTML('beforeend', html);
            }

            localStorage.removeItem('RFC_KEY'); // console.warn(RFC)

            localStorage.setItem('RFC_KEY', RFC);
            mensajeResDont = document.getElementById('mensajeResDont');
            mensajeResDont.innerHTML = ''; // areaFechas.style = 'display: flex';

            inicioHomeOffice.innerHTML = obtenFecha(results.rows[0].inicio_homeoff, true);
            resolve(results.rows[0].inicio_homeoff); // optionRegEnable.onclick = "agregaStatusArea()"
          } else {
            cargarModuloRegistro();
            mensajeResDont = document.getElementById('mensajeResDont');
            inpRfcUser = document.getElementById('inpRfcUser');
            mensajeResDont.innerHTML = 'El usuario no existe.';
            inpRfcUser.value = RFC; // const inicioHomeOffice = document.getElementById('inicioHomeOffice');

            inicioHomeOffice.innerHTML = '';
            localStorage.removeItem('RFC_KEY');
            console.warn('NO EXISTE ESTE USUARIO'); // si no hay ningun usuario registrado con este rfc quito nuevamente todo
          }
        });
      }, function (err) {
        console.error(err.message);
      });
    }
  }).then(function (inicioHome) {
    desplegaDiasConStatus(inicioHome, rfc);
  });
}

function desplegaDiasConStatus(inicioHome, rfc, status) {
  return new Promise(function (resolve, reject) {
    var objectFechas = validacionesHomeOffice(inicioHome, rfc);
    resolve(objectFechas);
  }).then(function (object) {
    var data = obtenerRegistrosFechas(object[0], object[1]);
    return data;
  }).then(function (object) {
    return new Promise(function (resolve, reject) {
      // aqui se trabajarán los elementos html
      var cantDiasL = document.getElementById('cantDiasL');
      var infoCantidades = document.getElementById('infoCantidades');
      var bound = divSetDate.getBoundingClientRect(); // const inicioHomeOffice = document.getElementById('inicioHomeOffice');
      // inicioHomeOffice.innerHTML = 'Fecha Inicio: ' + obtenFecha(inicioHome, true);

      cantDiasL.innerHTML = object.length;
      var fechas = '',
          contadorOficina = 0,
          contadorPendiente = 0,
          contadorRegistrado = 0,
          contadorPermiso = 0,
          contadorVacaciones = 0;
      var element = ''; // console.log(object)

      object.forEach(function (item) {
        switch (item.stat) {
          case 'registrado':
            contadorRegistrado++;
            break;

          case 'pendiente':
            contadorPendiente++;
            break;

          case 'vacaciones':
            contadorVacaciones++;
            break;

          case 'permiso':
            contadorPermiso++;
            break;

          case 'oficina':
            contadorOficina++;
            break;
        }

        element = "\n\t\t\t\t\t\t\t\t\t<div class=\"item-fecha\" onclick=\"abrirDentroEditor('".concat(rfc, "', '").concat(item.fecha, "')\">\n\t\t\t\t\t\t\t\t\t\t<div id=\"itemFechaReg-").concat(item.fecha, "\" class=\"status status-").concat(item.stat, "\"></div>\n\t\t\t\t\t\t\t\t\t\t<div name=\"itemValueFecha\" id=\"cambiar").concat(item.fecha, "\" class=\"fecha-status\">").concat(obtenFecha(item.fecha, true), "</div>\n\t\t\t\t\t\t\t\t\t\t<div id=\"otroReg").concat(item.fecha, "\" class=\"status\"></div>\n\t\t\t\t\t\t\t\t\t</div>");

        switch (status) {
          case 0:
            if (item.stat == 'registrado') {
              fechas += element;
            }

            break;

          case 1:
            if (item.stat == 'permiso') {
              fechas += element;
            }

            break;

          case 2:
            if (item.stat == 'vacaciones') {
              fechas += element;
            }

            break;

          case 3:
            if (item.stat == 'pendiente') {
              fechas += element;
            }

            break;

          case 4:
            if (item.stat == 'oficina') {
              fechas += element;
            }

            break;

          default:
            fechas += element;
            break;
        }
      });
      infoCantidades.innerHTML = "\n\t\t\t\t\t<div class=\"item-similar\">\n\t\t\t\t\t\t<button class=\"btn-similar\" name=\"btnsGroup\" id=\"btnTodos\" onclick=\"desplegaDiasConStatus('".concat(inicioHome, "', '").concat(rfc, "')\">\n\t\t\t\t\t\t\tTodos\n\t\t\t\t\t\t</button>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"item-similar\">\n\t\t\t\t\t\t<button class=\"btn-similar\" name=\"btnsGroup\" id=\"btn0\" onclick=\"desplegaDiasConStatus('").concat(inicioHome, "','").concat(rfc, "',0)\">\n\t\t\t\t\t\t\tActividades &nbsp; <span id=\"cntRegistrado\">").concat(contadorRegistrado, "</span>\n\t\t\t\t\t\t</button>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"item-similar\">\n\t\t\t\t\t\t<button class=\"btn-similar\" name=\"btnsGroup\" id=\"btn3\" onclick=\"desplegaDiasConStatus('").concat(inicioHome, "','").concat(rfc, "',3)\">\n\t\t\t\t\t\t\tPendiente &nbsp; <span id=\"cntPendiente\">").concat(contadorPendiente, "</span>\n\t\t\t\t\t\t</button>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"item-similar\">\n\t\t\t\t\t\t<button class=\"btn-similar\" name=\"btnsGroup\" id=\"btn2\" onclick=\"desplegaDiasConStatus('").concat(inicioHome, "','").concat(rfc, "',2)\">\n\t\t\t\t\t\t\tVacaciones &nbsp; <span id=\"cntVacaciones\">").concat(contadorVacaciones, "</span>\n\t\t\t\t\t\t</button>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"item-similar\">\n\t\t\t\t\t\t<button class=\"btn-similar\" name=\"btnsGroup\" id=\"btn1\" onclick=\"desplegaDiasConStatus('").concat(inicioHome, "','").concat(rfc, "',1)\">\n\t\t\t\t\t\t\tPermiso &nbsp; <span id=\"cntPermiso\">").concat(contadorPermiso, "</span>\n\t\t\t\t\t\t</button>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"item-similar\">\n\t\t\t\t\t\t<button class=\"btn-similar\" name=\"btnsGroup\" id=\"btn4\" onclick=\"desplegaDiasConStatus('").concat(inicioHome, "','").concat(rfc, "',4)\">\n\t\t\t\t\t\t\tOficina &nbsp; <span id=\"cntOficina\">").concat(contadorOficina, "</span>\n\t\t\t\t\t\t</button>\n\t\t\t\t\t</div>\n\t\t\t\t");
      divSetDate.innerHTML = fechas; // fechas = '';

      resolve();
    });
  }).then(function () {
    // limpiar elementos
    var elements = document.getElementsByName('btnsGroup');
    elements.forEach(function (item) {
      // console.log('->>',document.getElementById(item.id))
      document.getElementById(item.id).classList.remove('markup'); // agrega el markup a el boton seleccionado

      var cantidad = 0;

      for (var i = 0; i < 5; i++) {
        if (status == i) {
          document.getElementById('btn' + status).classList.add('markup');
          cantidad = 1;
        }
      }

      if (cantidad == 0) {
        document.getElementById('btnTodos').classList.add('markup');
      }
    });
  }).then(function () {
    return cargaDatosOtrosUsuarios(rfc);
  }).then(function () {
    return cargaRandomActividades(rfc);
  });
}

function actualizarCantidades(inicioHome, rfc) {
  return new Promise(function (resolve, reject) {
    var objectFechas = validacionesHomeOffice(inicioHome, rfc);
    resolve(objectFechas);
  }).then(function (object) {
    var data = obtenerRegistrosFechas(object[0], object[1]);
    return data;
  }).then(function (object) {
    var cntRegistrado = document.getElementById('cntRegistrado');
    var cntPendiente = document.getElementById('cntPendiente');
    var cntVacaciones = document.getElementById('cntVacaciones');
    var cntPermiso = document.getElementById('cntPermiso');
    var cntOficina = document.getElementById('cntOficina');
    var contadorPendiente = 0,
        contadorRegistrado = 0,
        contadorOficina = 0,
        contadorPermiso = 0,
        contadorVacaciones = 0;
    object.forEach(function (item) {
      switch (item.stat) {
        case 'registrado':
          contadorRegistrado++;
          break;

        case 'pendiente':
          contadorPendiente++;
          break;

        case 'vacaciones':
          contadorVacaciones++;
          break;

        case 'permiso':
          contadorPermiso++;
          break;

        case 'oficina':
          contadorOficina++;
          break;
      }
    });
    cntRegistrado.innerHTML = contadorRegistrado;
    cntPendiente.innerHTML = contadorPendiente;
    cntVacaciones.innerHTML = contadorVacaciones;
    cntPermiso.innerHTML = contadorPermiso;
    cntOficina.innerHTML = contadorOficina;
  });
}

function obtenerDatosRegistro(date, userApp) {
  var db = getDatabase();
  var selStatus = document.getElementById('selStatus');
  var divActividades = document.getElementById('divActividades');
  var inpRfcUser = document.getElementById('inpRfcUser');
  var rfc = inpRfcUser.value;
  var cantResults = 0;
  var status = 0; // const optionRegEnable = document.getElementById('optionRegEnable')
  // optionRegEnable.onclick = function(){agregaStatusArea(inpRfcUser.value, userApp, date)}
  // let queryText = `SELECT capturado FROM TBL_CAMPOS WHERE	rfcusuario = "${inpRfcUser.value}" AND fecha = "${date}";`;
  // console.log(queryText)

  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("\n\t\t\t\tSELECT \n\t\t\t\t\tcapturado \n\t\t\t\tFROM \n\t\t\t\t\tTBL_CAMPOS \n\t\t\t\tWHERE\t\n\t\t\t\t\trfcusuario = ? AND fecha = ? AND claveusr = ?", [inpRfcUser.value, date, userApp], function (tx, results) {
        cantResults = results.rows.length;

        if (cantResults > 0) {
          status = results.rows[0].capturado;
          console.log('Hay dato');
        }

        selStatus.value = status;
        resolve({
          status: status,
          date: date,
          rfc: rfc
        });
      });
    }, function (err) {
      console.error(err.message);
    });
  }).then(function (result) {
    validaStatusSelect(result.status, result.rfc, userApp);
    return result;
  }).then(function (result) {
    // cargaDatosOtrosUsuarios(inpRfcUser.value)
    console.log('..-------------> Cambio la fecha'); // openDataOtrosUsuarios(result.rfc, userApp, result.date)

    cargaDatosOtrosUsuarios(result.rfc, result.date);
    return result; // cargaDatosOtrosUsuarios(result.rfc)
  }).then(function (result) {
    marcaFechaSeleccionada(result.date);
  }); // .then(function(){
  // return regresaFechasActual()
  // })
  // .then(function(result){
  // let objectFechas = validacionesHomeOffice(inicioHome, result.rfc)
  // console.log(objectFechas)
  // return cargaOtrosRegistros(result.date, result.rfc, userApp);
  // })
}

function marcaFechaSeleccionada(fecha) {
  var itemValueFecha = document.getElementsByName('itemValueFecha');
  var fechaElement = '';
  var bound = '';

  if (itemValueFecha) {
    itemValueFecha.forEach(function (element) {
      fechaElement = element.id.replace(/cambiar/, '');
      element.classList.remove('date-selected');

      if (fechaElement == fecha) {
        element.classList.add('date-selected');
      }
    });
  }
}

function validaStatusSelect(status, rfc, userApp) {
  var divAreaActividades = document.getElementById('divAreaActividades');
  var inpFecReg = document.getElementById('inpFecReg');
  var mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
  console.log('Validando: status: ' + status + ' rfc: ' + rfc + ' date: ' + inpFecReg.value); // console.log('-------------------->' + date)

  if (inpFecReg.value != '') {
    console.warn(status);

    if (status > 0) {
      console.warn('desha');
      divAreaActividades.style.display = 'none'; // addActividad.style.display = 'none';
    } else {
      divAreaActividades.style.display = 'flex'; // addActividad.style.display = 'flex';

      console.warn('cargando inputs');
      cargarActividades(rfc, inpFecReg.value, userApp);
    }

    mensajeRespuestaForm.innerHTML = '';
  } else {
    console.warn('Es necesario seleccionar una fecha');
    mensajeRespuestaForm.innerHTML = 'Es necesario seleccionar una fecha';
  }
}

function cargarActividades(rfc, date, userApp) {
  console.warn('cargando actividades: ' + date + '---' + rfc);
  var selStatus = document.getElementById('selStatus');
  var db = getDatabase();
  var divAreaActividades = document.getElementById('divAreaActividades');
  var addActividad = document.getElementById('addActividad');
  var cantResults = 0;
  var elementoNuevo = '';
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("\n\t\t\t\tSELECT\n\t\t\t\t\t*\n\t\t\t\tFROM\n\t\t\t\t TBL_CAMPOS\n\t\t\t\tWHERE\n\t\t\t\t\trfcusuario = ?\n\t\t\t\tAND\n\t\t\t\t\tfecha = ?\n\t\t\t\tAND\n\t\t\t\t\tclaveusr = ?\n\t\t\t", [rfc, date, userApp], function (tx, results) {
        cantResults = results.rows.length;
        elementoNuevo += '<div class="display-actividades" id="divDisplayActividades">';

        if (cantResults > 0) {
          console.log('cargar inputs guardados');
          elementoNuevo += "<div class=\"item-actividad\"><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 1\" id=\"inpActiv0\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_1).slice(0, 200), "</span></div>");
          elementoNuevo += "<div class=\"item-actividad\"><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 2\" id=\"inpActiv1\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_2).slice(0, 200), "</span></div>");
          elementoNuevo += "<div class=\"item-actividad\"><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 3\" id=\"inpActiv2\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_3).slice(0, 200), "</span></div>");
          elementoNuevo += "<div class=\"item-actividad\"><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 4\" id=\"inpActiv3\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_4).slice(0, 200), "</span></div>");

          if (results.rows[0].campo_5 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 5\" id=\"inpActiv4\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_5).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_6 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 6\" id=\"inpActiv5\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_6).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_7 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 7\" id=\"inpActiv6\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_7).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_8 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 8\" id=\"inpActiv7\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_8).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_9 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 9\" id=\"inpActiv8\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_9).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_10 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 10\" id=\"inpActiv9\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_10).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_11 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 11\" id=\"inpActiv10\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_11).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_12 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 12\" id=\"inpActiv11\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_12).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_13 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 13\" id=\"inpActiv12\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_13).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_14 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 14\" id=\"inpActiv13\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_14).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_15 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 15\" id=\"inpActiv14\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_15).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_16 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 16\" id=\"inpActiv15\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_16).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_17 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 17\" id=\"inpActiv16\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_17).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_18 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 18\" id=\"inpActiv17\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_18).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_19 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 19\" id=\"inpActiv18\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_19).slice(0, 200), "</span></div>");
          }

          if (results.rows[0].campo_20 !== '') {
            elementoNuevo += "<div class=\"item-actividad\" ><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 20\" id=\"inpActiv19\" contenteditable>".concat(decodeCaracteres(results.rows[0].campo_20).slice(0, 200), "</span></div>");
          }
        } else {
          elementoNuevo += "<div class=\"item-actividad\"><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 1\" id=\"inpActiv0\" contenteditable></span></div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"item-actividad\"><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 2\" id=\"inpActiv1\" contenteditable></span></div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"item-actividad\"><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 3\" id=\"inpActiv2\" contenteditable></span></div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"item-actividad\"><span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad 4\" id=\"inpActiv3\" contenteditable></span></div>";
          selStatus.value = 0;
        }

        elementoNuevo += '</div>';
        divAreaActividades.innerHTML = elementoNuevo;

        if (!document.getElementById('addActividad')) {
          divAreaActividades.insertAdjacentHTML('beforeend', '<button class="btn-add" onclick="agregarActividadVacia()" id="addActividad">+</button>');
        }

        resolve();
      });
    }, function (err) {
      console.error(err.message);
    });
  }).then(function () {
    var element = '';
    var placeholder = '';
    var value = '';
    var newElement = '';

    for (var i = 0; i < 20; i++) {
      element = document.getElementById('inpActiv' + i);

      if (element !== null) {
        placeholder = element.getAttribute('data-placeholder');

        if (placeholder !== '') {} else {
          element.addEventListener('click', function (e) {
            console.log(e.target.id);
            newElement = document.getElementById(e.target.id);
            newElement.setAttribute('data-placeholder', '');
          });
        } // element.innerHTML === '' && (element.innerHTML = placeholder);
        // value = '';
        // element.addEventListener('click', function (e) {
        //  		value = e.target.innerHTML;
        //  		value === placeholder && (e.target.innerHTML = '');
        //  		console.log(value)
        // });
        // // value = '';
        // element.addEventListener('blur', function (e) {
        //  		value = e.target.innerHTML;
        //  		value === '' && (e.target.innerHTML = placeholder);
        // });

      }
    }
  });
}

function counterValues(id) {
  var element = document.getElementById(id);
  var mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
  var text = '';
  var _final = '';

  element.onkeyup = function (key) {
    // console.log(key)
    text = caracteresRaros(element.textContent);
    element = document.getElementById(id);
    mensajeRespuestaForm.innerHTML = '';

    if (text.length > 200 || key.code == 'Enter') {
      element = document.getElementById(id);
      text = text.slice(0, 200);
      element.innerHTML = caracteresRaros(text);
      element.removeAttribute('contenteditable');
      element.setAttribute('contenteditable', '');

      if (key.code !== 'Enter') {
        mensajeRespuestaForm.innerHTML = 'Cada actividad solo acepta 200 caracteres.';
      }
    } else {
      element.oninput = function (e) {
        // console.log(text.length + ' ' + text)
        if (text.length <= 200 && e.data !== null) {
          text = text + e.data;
          text = caracteresRaros(text); // console.log('Aqui 0')

          mensajeRespuestaForm.innerHTML = '';
        }
      };
    }
  };
}

function agregarActividadVacia() {
  var divDisplayActividades = document.getElementById('divDisplayActividades');
  var i = 0;
  var element = '';
  var elementoNuevo = '';
  var posterior = 2;
  var inputs = document.getElementsByName('optActividad').length;
  console.log('--> ' + inputs);

  do {
    element = document.getElementById('inpActiv' + i);
    console.log(element);

    if (element !== null && element.textContent !== '') {
      posterior = i + 1; // console.log(i)

      if (inputs == posterior && i < 19) {
        elementoNuevo = "\n\t\t\t\t\t<div class=\"item-actividad\">\n\t\t\t\t\t\t<span name=\"optActividad\" onclick=\"counterValues(this.id)\" class=\"la-actividad editable\" role=\"input\" type=\"text\" data-placeholder=\"Actividad ".concat(posterior + 1, "\" id=\"inpActiv").concat(posterior, "\" contenteditable></span>\n\t\t\t\t\t</div>");
        divDisplayActividades.insertAdjacentHTML('afterbegin', elementoNuevo);
      }

      if (i == 18) {
        document.getElementById('addActividad').style.display = 'none';
      }
    } else {
      i = 20;
    }

    i++;
  } while (i < 20);
}

function obtenerRegistrosFechas(object, RFC, inicioHome) {
  var db = getDatabase();
  var cantResults = 0;
  var allDays = [];
  var USER_APP = localStorage.getItem('USER_APP');
  object.forEach(function (item) {
    item.forEach(function (days) {
      allDays.push({
        fecha: days,
        stat: 'pendiente'
      });
    });
  });
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("\n\t\t\t\tSELECT\n\t\t\t\t\tfecha,\n\t\t\t\t\tcapturado\n\t\t\t\tFROM\n\t\t\t\t\tTBL_CAMPOS\n\t\t\t\tWHERE\n\t\t\t\t\trfcusuario = ?\n\t\t\t\tAND\n\t\t\t\t\tclaveusr = ?\n\t\t\t\tORDER BY\n\t\t\t\t\tfecha\n\t\t\t", [RFC, USER_APP], function (tx, results) {
        cantResults = results.rows.length;
        var estatus = '',
            cadenaText = '',
            cadenaText1 = '',
            cadenaText2 = '',
            finded = -1,
            text = '',
            object = [],
            cadenaText3 = '';
        var festivos = getDiasFestivos();

        if (cantResults > 0) {
          for (var i = 0; i < cantResults; i++) {
            // console.log('capturado: %s fecha: %s',results.rows[i].capturado, results.rows[i].fecha)
            switch (results.rows[i].capturado) {
              case 0:
                estatus = 'registrado';
                cadenaText += results.rows[i].fecha + ',';
                break;

              case 1:
                cadenaText1 += results.rows[i].fecha + ',';
                estatus = 'permiso';
                break;

              case 2:
                cadenaText2 += results.rows[i].fecha + ',';
                estatus = 'vacaciones';
                break;

              case 3:
                cadenaText3 += results.rows[i].fecha + ',';
                estatus = 'oficina';
                break;
            }
          }
        } // crea la cadena de festivos


        festivos.forEach(function (item) {
          text += "".concat(regresaTextoCero(item.dia), "-").concat(regresaTextoCero(item.mes), "-").concat(regresaTextoCero(item.year), ",");
        }); // agrega elementos a el nuevo objeto con fechas sin días festivos

        allDays.forEach(function (obj, index) {
          finded = text.search(obj.fecha);

          if (finded < 0) {
            object.push(obj);
          }
        });
        object.forEach(function (obj, index) {
          // encuentra registrados y le cambia el estado
          finded = cadenaText.search(obj.fecha);

          if (finded >= 0) {
            obj.stat = 'registrado';
          } // encuentra permiso y le cambia el estado


          finded = cadenaText1.search(obj.fecha);

          if (finded >= 0) {
            obj.stat = 'permiso';
          } // encuentra vacaciones y le cambia el estado


          finded = cadenaText2.search(obj.fecha);

          if (finded >= 0) {
            obj.stat = 'vacaciones';
          } // encuentra oficina y le cambia el estado


          finded = cadenaText3.search(obj.fecha);

          if (finded >= 0) {
            obj.stat = 'oficina';
          }
        });
        resolve(object);
      });
    }, function (err) {
      console.error(err.message);
    }, function () {});
  });
}

function abrirDentroEditor(rfc, fecha) {
  console.log('abrirPendiente: ' + fecha + ' ' + rfc);
  var inpFecReg = document.getElementById('inpFecReg');
  inpFecReg.value = fecha;
  inpFecReg.onchange();
  desmarcarButton('btnRegistrar');
}
"use strict";

/*
	Función para almacenar el registro desde el modulo de registros
*/
function almacenarRegistro() {
  var mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
  var inpRfcUser = document.getElementById('inpRfcUser');
  var inpFecReg = document.getElementById('inpFecReg');
  var selStatus = document.getElementById('selStatus');
  var db = getDatabase();
  var USER_APP = localStorage.getItem('USER_APP'),
      queryText = '',
      cantResults = 0,
      i = 0,
      element = '',
      contador = 0,
      continuar = false;
  var tipoConsulta = '';
  mensajeRespuestaForm.innerHTML = ''; // validar si los datos tienen registro la fecha y en caso de ser de actividades que existan actividades registradas

  if (inpFecReg.value !== '') {
    if (selStatus.value > 0) {
      continuar = true;
    } else {
      var inpActiv0 = document.getElementById('inpActiv0');

      if (inpActiv0.textContent !== '') {
        continuar = true;
      } else {
        mensajeRespuestaForm.innerHTML = 'Agrega primera actividad, segunda, tercera...';
      }
    }
  } else {
    // No podrá realizar ningun registro
    mensajeRespuestaForm.innerHTML = 'Es necesario seleccionar una fecha';
    console.warn('Agrega el día que quieres registrar');
  } // Si esta todo bien ejecuta la consulta 


  if (continuar) {
    return new Promise(function (resolve, reject) {
      db.transaction(function (tx) {
        tx.executeSql("\n\t\t\t\t\t\tSELECT\n\t\t\t\t\t\t\t*\n\t\t\t\t\t\tFROM\n\t\t\t\t\t\t\tTBL_CAMPOS\n\t\t\t\t\t\tWHERE\n\t\t\t\t\t\t\trfcusuario = ?\n\t\t\t\t\t\tAND\n\t\t\t\t\t\t\tfecha = ?\n\t\t\t\t\t\tAND\n\t\t\t\t\t\t\tclaveusr = ?\n\t\t\t\t\t", [inpRfcUser.value, inpFecReg.value, USER_APP], function (tx, results) {
          cantResults = results.rows.length;
          tipoConsulta = ''; // si existe el registro genera una consulta para realizar una actualización

          if (cantResults > 0) {
            tipoConsulta = 'update';
            queryText = 'UPDATE TBL_CAMPOS SET '; // recorre los 20 elementos generando la actualización de cada campo

            do {
              // accede a cada elemento obteniendo el valor que contiene
              element = document.getElementById('inpActiv' + i);

              if (element !== null && element.textContent !== '') {
                // si el estatus es mayor a 0 en update cambia todos los campos de actividades a vacias
                if (selStatus.value > 0) {
                  queryText += 'campo_' + (i + 1) + ' = "",';
                } else {
                  // Agrega las actualizaciones en los campos que contienen datos
                  // console.log(element)
                  queryText += 'campo_' + (i + 1) + ' = "' + encondeCaracteres(element.textContent) + '",';
                }

                contador++;
              } else {
                // las actividades vacias las sigue dejando vacias
                queryText += 'campo_' + (i + 1) + ' = "",';
              }

              i++;
            } while (i < 20); // agrega los demás campos que necesita la consulta


            queryText += " capturado = ".concat(selStatus.value, " WHERE rfcusuario = \"").concat(inpRfcUser.value, "\" AND fecha = \"").concat(inpFecReg.value, "\" AND claveusr = \"").concat(USER_APP, "\";");
          } else {
            // si no existe registro en la fecha seleccionada genera el query para insertar el registro dentro de la base
            // de datos
            tipoConsulta = 'insert';
            queryText = 'INSERT INTO TBL_CAMPOS VALUES (';

            do {
              // accede a los valores de los input que estan cargados dentro del html
              element = document.getElementById('inpActiv' + i);

              if (element !== null && element.textContent !== '') {
                // elimina caracteres raros dentro de la consulta
                queryText += '"' + encondeCaracteres(element.textContent) + '",';
                contador++;
              } else {
                // los demás elementos no encontrados agrega el campo vacio
                queryText += '"",';
              }

              i++;
            } while (i < 20); // complementa la consulta con los datos faltantes


            queryText += "".concat(selStatus.value, ",\"").concat(inpFecReg.value, "\",\"").concat(inpRfcUser.value, "\",\"").concat(USER_APP, "\");"); // console.log(queryText)
            // tx.executeSql(queryText);
          } // resuelve la consulta


          resolve([queryText, tipoConsulta]);
        });
      }, function (err) {
        console.error(err.message);
      });
    }).then(function (datos) {
      var consultaSqlite = datos[0];
      var tipo = datos[1];
      console.log(consultaSqlite);
      return new Promise(function (resolve, reject) {
        // ejecuta la inserción o actualización del registro
        db.transaction(function (tx) {
          tx.executeSql(consultaSqlite);
        }, function (err) {
          console.error('registro: ' + err.message);
        }, function () {
          if (tipo == 'update') {
            mensajeRespuestaForm.innerHTML = 'Se actualizo el registro.';
          } else {
            mensajeRespuestaForm.innerHTML = 'Se agrego el registro.';
          }

          resolve(tipo);
        });
      });
    }).then(function (response) {
      console.log('Se ejecuto consulta: ' + response); // carga el status del elemento actualizado o agregado

      var itemFechaReg = document.getElementById('itemFechaReg-' + inpFecReg.value);
      var cntRegistrado = document.getElementById('cntRegistrado');
      var cntPendiente = document.getElementById('cntPendiente');
      var cntVacaciones = document.getElementById('cntVacaciones');
      var cntPermiso = document.getElementById('cntPermiso');
      var color = '',
          valor = 0,
          cantidad = 0;
      valor = parseInt(selStatus.value);

      switch (valor) {
        // registrado
        case 0:
          color = '#80b918';
          break;
        // permiso

        case 1:
          color = '#779be7';
          break;
        // vacaciones

        case 2:
          color = '#588b8b';
          break;

        case 3:
          color = '#ffd000';
          break;
      }

      itemFechaReg ? itemFechaReg.style = "background: ".concat(color, ";") : '';
      console.log("SELECT capturado, count(fecha) FROM TBL_CAMPOS WHERE rfcusuario = '".concat(inpRfcUser.value, "' AND claveusr = '").concat(USER_APP, "' GROUP BY  capturado"));
      db.transaction(function (tx) {
        tx.executeSql("\n\t\t\t\t\tSELECT\n\t\t\t\t\t\tinicio_homeoff\n\t\t\t\t\tFROM\n\t\t\t\t\t\tTBL_USUARIO\n\t\t\t\t\tWHERE\n\t\t\t\t\t\trfc_usuario = ?\n\t\t\t\t\tAND\n\t\t\t\t\t\tclaveusr = ?\n\t\t\t\t\t", [inpRfcUser.value, USER_APP], function (tx, results) {
          cantResults = results.rows.length;

          if (cantResults > 0) {
            actualizarCantidades(results.rows[0].inicio_homeoff, inpRfcUser.value);
          }
        });
      }, function (err) {
        console.error(err.message);
      });
    });
  } //end continuar

}
"use strict";

function cargaDatosOtrosUsuarios(rfc, date) {
  console.log('Ahora cargar datos de otros usuarios ' + rfc);
  var itemValueFecha = document.getElementsByName('itemValueFecha');
  var optionsBarFloar = document.getElementsByName('optionsBarFloar');
  var areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
  areaOtrosRegistros.innerHTML = "\n\t\t<div class=\"title-similares\">\n\t\t\t<div class=\"row-title-similar\">\n\t\t\t\t<div class=\"item-similar\" id=\"titleChange\">\n\t\t\t\t\tOTROS REGISTROS\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class=\"row-title-similar\">\n\t\t\t\t<div class=\"item-similar\" id=\"desplFechaOtros\">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t\t<div class=\"content-similares\" id=\"divOtrosDatos\"></div>\n\t";
  var USER_APP = localStorage.getItem('USER_APP');
  var fecha = '',
      paramQuery = '',
      contador = 0,
      comma = ',',
      length = 0,
      cantResults = 0;
  var db = getDatabase(); // console.log(itemValueFecha)
  // console.log(optionsBarFloar)
  // regresaFechasActual()	

  length = itemValueFecha.length;

  if (date) {
    paramQuery += "\"".concat(date, "\"");
  } else if (length > 0) {
    itemValueFecha.forEach(function (element) {
      if (length - 1 == contador) {
        comma = '';
      }

      fecha = element.id;
      fecha = fecha.replace(/cambiar/, '');
      paramQuery += "\"".concat(fecha, "\"").concat(comma);
      contador++;
    });
  }

  db.transaction(function (tx) {
    tx.executeSql("\n\t\t\tSELECT\n\t\t\t\tDISTINCT(fecha)\n\t\t\tFROM\n\t\t\t\tTBL_CAMPOS\n\t\t\tWHERE\n\t\t\t\tfecha in (".concat(paramQuery, ")\n\t\t\tAND\n\t\t\t\trfcusuario != ?\n\t\t\tAND\n\t\t\t\tclaveusr = ?\n\t\t\t"), [rfc, USER_APP], function (tx, results) {
      cantResults = results.rows.length;
      var element = '';
      var cargaOption = true; // console.warn('---->' + cantResults)

      if (cantResults > 0) {
        cargaOption = false;
      }

      if (!date) {
        if (cantResults > 0) {
          for (var i = 0; i < cantResults; i++) {
            // console.log(results.rows[i].fecha)
            element = document.getElementById('otroReg' + results.rows[i].fecha); // element.innerHTML = `<span onclick="agregaStatusArea('${rfc}', '${USER_APP}','${results.rows[i].fecha}')" class="material-icons">supervised_user_circle</span>`;

            element.innerHTML = "<span class=\"material-icons\">supervised_user_circle</span>";
            element.classList.add('icon-otros');
          }
        }
      } else {
        var _optionsBarFloar = document.getElementById('optionsBarFloar');

        var optionRegEnable = document.getElementById('optionRegEnable');
        console.log('---------->' + optionRegEnable);

        if (cantResults > 0) {
          if (!optionRegEnable) {
            _optionsBarFloar.insertAdjacentHTML('afterbegin', "\n\t\t\t\t\t\t\t\t<button class=\"btn-otros\" id=\"optionRegEnable\" onclick=\"agregaStatusArea('".concat(rfc, "', '").concat(USER_APP, "', '").concat(date, "')\">\n\t\t\t\t\t\t\t\t\t<span class=\"material-icons\">supervised_user_circle</span>\n\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t"));
          } else {
            optionRegEnable.onclick = function () {
              agregaStatusArea(rfc, USER_APP, date);
            };
          }
        }
      }

      regresaFechasActual(cargaOption);
    });
  }, function (err) {
    console.error(err.message);
  });
}

function agregaStatusArea(rfc, userApp, fecha) {
  console.warn(fecha);
  var areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
  var titleChange = document.getElementById('titleChange');
  titleChange.innerHTML = 'OTROS REGISTROS';
  new Promise(function (resolve, reject) {
    areaOtrosRegistros.setAttribute('name', 'visible');
    resolve(areaOtrosRegistros);
    console.log('status area');
  }).then(function () {
    openDataOtrosUsuarios(rfc, userApp, fecha);
  });
}

function openDataOtrosUsuarios(rfc, userApp, fecha) {
  console.log('Ejecutando openDataOtrosUsuarios()');
  var inpFecReg = document.getElementById('inpFecReg');
  var areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
  var areaFechas = document.getElementById('areaFechas');
  var desplFechaOtros = document.getElementById('desplFechaOtros');
  var divOtrosDatos = document.getElementById('divOtrosDatos');
  var db = getDatabase();
  var backDates = document.getElementById('backDates');
  var optionsBarFloar = document.getElementById('optionsBarFloar');
  var status = areaFechas.style.display;
  var cantResults = 0;
  var elements = '';
  var className = '';
  var estatus = '';

  if (areaOtrosRegistros.getAttribute('name') == 'visible') {
    areaFechas.style.display = 'none';
    areaOtrosRegistros.style.display = 'flex'; // // alert(backDates)

    if (!backDates) {
      optionsBarFloar.insertAdjacentHTML('afterbegin', "<button id=\"backDates\" class=\"btn-otros\" onclick=\"regresaFechasActual()\"><span class=\"material-icons\">low_priority</span></button>");
    }
  }

  return new Promise(function (resolve, reject) {
    if (fecha !== '') {
      desplFechaOtros.innerHTML = 'Otros Registros de la Fecha: ' + obtenFecha(fecha, true);
      db.transaction(function (tx) {
        tx.executeSql("\n\t\t\t\t\tSELECT\n\t\t\t\t\t\tU.nombre_usuario,\n\t\t\t\t\t\tU.rfc_usuario,\n\t\t\t\t\t\tC.capturado\n\t\t\t\t\tFROM\n\t\t\t\t\t\tTBL_CAMPOS C,\n\t\t\t\t\t\tTBL_USUARIO U\n\t\t\t\t\tWHERE\n\t\t\t\t\t\tC.rfcusuario = U.rfc_usuario\n\t\t\t\t\tAND\n\t\t\t\t\t\tC.fecha = ?\n\t\t\t\t\tAND\n\t\t\t\t\t\tC.rfcusuario != ?\n\t\t\t\t\tAND\n\t\t\t\t\t\tC.claveusr = U.claveusr\n\t\t\t\t\tAND\n\t\t\t\t\t\tC.claveusr = ?\n\t\t\t\t\tORDER BY\n\t\t\t\t\t\tU.nombre_usuario;\n\t\t\t\t\t", [fecha, rfc, userApp], function (tx, results) {
          cantResults = results.rows.length;

          if (cantResults > 0) {
            for (var i = 0; i < cantResults; i++) {
              switch (results.rows[i].capturado) {
                case 0:
                  estatus = 'Actividades';
                  className = '';
                  break;

                case 1:
                  estatus = 'Permiso';
                  className = 'no-hover';
                  break;

                case 2:
                  estatus = 'Vacaciones';
                  className = 'no-hover';
                  break;

                case 3:
                  estatus = 'Laboró en Oficinas';
                  className = 'no-hover';
                  break;
              }

              elements += "\n\t\t\t\t\t\t\t\t<div class=\"item-usuario ".concat(className, "\" onclick=\"modMostrarActividades('").concat(results.rows[i].rfc_usuario, "','").concat(fecha, "','").concat(userApp, "')\">\n\t\t\t\t\t\t\t\t\t<div class=\"usuario-similar\" >").concat(results.rows[i].nombre_usuario, "</div>\n\t\t\t\t\t\t\t\t\t<div class=\"usuario-similar\" >").concat(estatus, "</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t");
              console.log('--------> ' + results.rows[i].nombre_usuario);
            }

            divOtrosDatos.innerHTML = elements;
          } else {
            divOtrosDatos.innerHTML = "\n\t\t\t\t\t\t\t\t<div class=\"item-usuario no-hover\" >\n\t\t\t\t\t\t\t\t\t<div class=\"usuario-similar\" >No se encontraron otros registros con la fecha seleccionada</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t";
          }
        });
      }, function (err) {
        console.error(err.message);
      }, function () {
        resolve();
      });
    } // const backDates = document.getElementById('backDates');
    // const optionsBarFloar = document.getElementById('optionsBarFloar');
    // // alert(backDates)
    // if (!backDates && ) {
    // 	optionsBarFloar.insertAdjacentHTML('afterbegin',`<button id="backDates" class="btn-otros" onclick="regresaFechasActual()"><span class="material-icons">low_priority</span></button>`)
    // }

  }); // areaOtrosRegistros.style.display = 'none';
  // areaFechas.style.display = 'flex';
}

function regresaFechasActual(hayValor) {
  // console.log('volviendo')
  var areaFechas = document.getElementById('areaFechas');
  var areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
  var optionRegEnable = document.getElementById('optionRegEnable');
  var backDates = document.getElementById('backDates'); // console.log(backDates)

  if (backDates) {
    backDates.remove();
  }

  if (optionRegEnable && hayValor == true) {
    optionRegEnable.remove();
  }

  areaOtrosRegistros.removeAttribute('name');
  areaOtrosRegistros.style.display = 'none';
  areaFechas.style.display = 'flex';
}
/*
	Función para mostrar las actividades almacenadas por el usuario dentro de un modal, de los usuarios que tienen actividades
	almacenadas en misma fecha seleccionada por el usuario dentro del calendario

	Parametros:
		rfc : valor de RFC seleccionado.
		fecha : el valor de la fecha seleccionada.
*/


function modMostrarActividades(rfc, fecha, userApp) {
  var db = getDatabase();
  var respuesta = false;
  var cantResults = 0;
  var html = '';
  return new Promise(function (resolve, reject) {
    // abrir modal, regresa true para reactificar
    respuesta = openModal();

    if (respuesta) {
      resolve();
    }
  }).then(function () {
    var divDateContent = document.getElementById('divDateContent'); // elimino la clase del modal de fecha, no se utilizara

    divDateContent.classList.remove('modal-fecha');
    divDateContent.classList.add('modal-actividades'); // Realizar la consulta obteniendo las actividades almacenadas con el rfc y fecha pasados por parametros

    db.transaction(function (tx) {
      tx.executeSql("\n\t\t\t\tSELECT\n\t\t\t\t\t*\n\t\t\t\tFROM\n\t\t\t\t\tTBL_CAMPOS C,\n\t\t\t\t\tTBL_USUARIO U\n\t\t\t\tWHERE\n\t\t\t\t\tC.rfcusuario = U.rfc_usuario\n\t\t\t\tAND\n\t\t\t\t\tC.fecha = ?\n\t\t\t\tAND\n\t\t\t\t\tC.rfcusuario = ?\n\t\t\t\tAND\n\t\t\t\t\tC.claveusr = U.claveusr\n\t\t\t\tAND\n\t\t\t\t\tC.claveusr = ?\n\t\t\t", [fecha, rfc, userApp], function (tx, results) {
        cantResults = results.rows.length;
        var i = 0;

        if (cantResults > 0) {
          // obtener la fecha completa 
          fecha = obtenFecha(fecha, true); // Se crea el html a mostrar en el modal

          html = "\n\t\t\t\t\t\t<div class=\"container-actividades\">\n\t\t\t\t\t\t\t<div class=\"display-datos\">\n\t\t\t\t\t\t\t\t<div class=\"header-act\">\n\t\t\t\t\t\t\t\t\t<div class=\"title-act\">Actividades</div>\n\t\t\t\t\t\t\t\t\t<div class=\"equis\" onclick=\"closeModal()\"><span class=\"material-icons\">close</span></div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class=\"datos-registro\">\n\t\t\t\t\t\t\t\t\t<div class=\"info-registro\">".concat(rfc, "</div>\n\t\t\t\t\t\t\t\t\t<div class=\"info-registro\">").concat(fecha, "</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class=\"registro-actividades\">"); // Agrega a el html si el campo no esta vacío

          do {
            if (results.rows[i].campo_1 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_1, "</div>");
            }

            if (results.rows[i].campo_2 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_2, "</div>");
            }

            if (results.rows[i].campo_3 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_3, "</div>");
            }

            if (results.rows[i].campo_4 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_4, "</div>");
            }

            if (results.rows[i].campo_5 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_5, "</div>");
            }

            if (results.rows[i].campo_6 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_6, "</div>");
            }

            if (results.rows[i].campo_7 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_7, "</div>");
            }

            if (results.rows[i].campo_8 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_8, "</div>");
            }

            if (results.rows[i].campo_9 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_9, "</div>");
            }

            if (results.rows[i].campo_10 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_10, "</div>");
            }

            if (results.rows[i].campo_11 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_11, "</div>");
            }

            if (results.rows[i].campo_12 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_12, "</div>");
            }

            if (results.rows[i].campo_13 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_13, "</div>");
            }

            if (results.rows[i].campo_14 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_14, "</div>");
            }

            if (results.rows[i].campo_15 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_15, "</div>");
            }

            if (results.rows[i].campo_16 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_16, "</div>");
            }

            if (results.rows[i].campo_17 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_17, "</div>");
            }

            if (results.rows[i].campo_18 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_18, "</div>");
            }

            if (results.rows[i].campo_19 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_19, "</div>");
            }

            if (results.rows[i].campo_20 != '') {
              html += "<div class=\"item-actividad\">".concat(results.rows[i].campo_20, "</div>");
            }

            i++;
          } while (i < cantResults);

          html += "\t</div></div></div>"; // carga el html con las actividades encontradas en la pantalla del modal

          divDateContent.innerHTML = html;
        }
      });
    }, function (err) {
      console.error(err.message);
    });
  });
}
"use strict";

function crearPlantillaBitacora() {
  console.warn('CREANDO BITACORA');
  var NOMBRE_USUARIO = localStorage.getItem('NOMBRE_USUARIO');
  var homePath = 'C:\\GENERADOR_BITACORAS\\' + NOMBRE_USUARIO + '\\';
  var mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
  var workbook = new Excel.Workbook();
  var db = getDatabase();

  var path = require('path');

  var cantResults = 0;
  var ultimaHoja = '';
  var rfc = localStorage.getItem('RFC_KEY');
  var USER_APP = localStorage.getItem('USER_APP');
  workbook.creator = 'INEGI - BITACORA';
  workbook.lastModifiedBy = 'GENERADOR';
  var worksheet = ''; // columnas de la A a la M

  var columnas = [{
    header: '',
    key: 'x_a',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_b',
    width: 5,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_c',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_d',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_e',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_f',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_g',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_h',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_i',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_j',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_k',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_l',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }, {
    header: '',
    key: 'x_m',
    width: 10,
    style: {
      font: {
        name: 'Arial',
        color: {
          argb: '141413'
        },
        family: 2,
        size: 10
      }
    }
  }];
  db.transaction(function (tx) {
    tx.executeSql("\n\t\t\tSELECT\n\t\t\t\t*, substr(fecha, 7,10) year,substr(fecha, 4,2) month, substr(fecha, 1,2) day\n\t\t\tFROM\n\t\t\t\tTBL_CAMPOS C,\n\t\t\t\tTBL_USUARIO U\n\t\t\tWHERE\n\t\t\t\tC.rfcusuario = U.rfc_usuario\n\t\t\tAND\n\t\t\t\tU.rfc_usuario = ?\n\t\t\tAND\n\t\t\t\tC.capturado = 0\n\t\t\tAND\n\t\t\t\tU.claveusr = C.claveusr\n\t\t\tAND\n\t\t\t\tU.claveusr = ?\n\t\t\tORDER BY\n\t\t\t\tyear, month, day\n\t\t", [rfc, USER_APP], function (tx, results) {
      cantResults = results.rows.length;
      console.log(cantResults);

      if (cantResults > 0) {
        var i = 0;
        var j = 0;
        var date = '';
        var nombreHoja = '';
        var fecha = '';
        var direccion = decodeCaracteres(results.rows[0].dga_direccion);
        var nombre = decodeCaracteres(results.rows[0].nombre_usuario);
        var puesto = decodeCaracteres(results.rows[0].puesto_usuario);
        var contadorAct = 1;
        openStatus('Creando bitácora', false); // let image = require('./img/logo_1.png')

        var logoInegi = workbook.addImage({
          filename: path.join(__dirname, '/img/logo_1.png'),
          extension: 'png'
        });
        agregarStatus('Agregando actividades...', false);

        do {
          console.log(results.rows[i].fecha);
          date = results.rows[i].fecha.split('-');
          fecha = obtenFecha(results.rows[i].fecha, true);
          nombreHoja = date[2] + date[1] + date[0]; // console.log('Nombre hoja: '+ nombreHoja)
          // console.log('Fecha: '+ date[0] + ' de ' + fecha)
          // console.log('direccion: ' + direccion)
          // console.log('nombre: ' + nombre)
          // console.log('puesto: ' + puesto)

          worksheet = workbook.addWorksheet(nombreHoja);
          worksheet.columns = columnas;
          worksheet.addRow({
            x_b: '',
            x_c: 'Bitácora',
            x_m: ''
          });
          worksheet.addRow({
            x_b: '',
            x_c: fecha,
            x_m: ''
          });
          worksheet.addRow({
            x_b: '',
            x_c: 'Jornada laboral: 8:30 am a 4:30 pm',
            x_m: ''
          });
          worksheet.addRow({
            x_b: '',
            x_c: 'DGES'
            /*direccion*/
            ,
            x_m: ''
          });
          worksheet.addRow({
            x_b: '',
            x_m: ''
          });
          worksheet.addRow({
            x_b: '',
            x_c: 'Nombre:',
            x_d: nombre,
            x_m: ''
          });
          worksheet.addRow({
            x_b: '',
            x_c: 'Puesto',
            x_d: puesto,
            x_m: ''
          });
          worksheet.addRow({
            x_b: '',
            x_c: 'DGA o Dir:',
            x_d: direccion,
            x_m: ''
          });
          worksheet.mergeCells('D7:M7');
          worksheet.mergeCells('B1:M1');
          worksheet.mergeCells('D8:M8');
          worksheet.mergeCells('D9:M9');
          worksheet.addRow({
            x_b: '',
            x_m: ''
          });
          worksheet.addRow({
            x_b: '',
            x_c: 'Actividades Realizadas',
            x_m: ''
          });
          worksheet.mergeCells('C11:M11');
          worksheet.addRow({
            x_b: '',
            x_m: ''
          }); // console.log(results.rows[i].rfc_usuario)

          worksheet.addImage(logoInegi, {
            tl: {
              col: 12,
              row: 1.5
            },
            br: {
              col: 13,
              row: 3.8
            }
          });
          contadorAct = 1;
          j = 0;
          worksheet.addRow({
            x_b: 1,
            x_c: decodeCaracteres(results.rows[i].campo_1),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 2,
            x_c: decodeCaracteres(results.rows[i].campo_2),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 3,
            x_c: decodeCaracteres(results.rows[i].campo_3),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 4,
            x_c: decodeCaracteres(results.rows[i].campo_4),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 5,
            x_c: decodeCaracteres(results.rows[i].campo_5),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 6,
            x_c: decodeCaracteres(results.rows[i].campo_6),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 7,
            x_c: decodeCaracteres(results.rows[i].campo_7),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 8,
            x_c: decodeCaracteres(results.rows[i].campo_8),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 9,
            x_c: decodeCaracteres(results.rows[i].campo_9),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 10,
            x_c: decodeCaracteres(results.rows[i].campo_10),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 11,
            x_c: decodeCaracteres(results.rows[i].campo_11),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 12,
            x_c: decodeCaracteres(results.rows[i].campo_12),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 13,
            x_c: decodeCaracteres(results.rows[i].campo_13),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 14,
            x_c: decodeCaracteres(results.rows[i].campo_14),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 15,
            x_c: decodeCaracteres(results.rows[i].campo_15),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 16,
            x_c: decodeCaracteres(results.rows[i].campo_16),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 17,
            x_c: decodeCaracteres(results.rows[i].campo_17),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 18,
            x_c: decodeCaracteres(results.rows[i].campo_18),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 19,
            x_c: decodeCaracteres(results.rows[i].campo_19),
            x_m: ''
          });
          worksheet.addRow({
            x_b: 20,
            x_c: decodeCaracteres(results.rows[i].campo_20),
            x_m: ''
          });

          do {
            worksheet.mergeCells("C".concat(contadorAct + 12, ":M").concat(contadorAct + 12));
            worksheet.getRow(contadorAct + 12).getCell(3).alignment = {
              vertical: 'middle',
              horizontal: 'center'
            };
            contadorAct++;
            j++;
          } while (j < 20); // Agrego estilos y fuentes conforme a posicionamiento


          worksheet.getRow(7).getCell(3).font = {
            name: 'Arial',
            size: 10,
            bold: true
          };
          worksheet.getRow(8).getCell(3).font = {
            name: 'Arial',
            size: 10,
            bold: true
          };
          worksheet.getRow(9).getCell(3).font = {
            name: 'Arial',
            size: 10,
            bold: true
          };
          worksheet.getRow(11).getCell(13).font = {
            name: 'Arial',
            size: 11,
            bold: true
          };
          worksheet.getRow(11).getCell(13).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
          worksheet.getRow(7).getCell(13).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
          worksheet.getRow(8).getCell(13).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
          worksheet.getRow(9).getCell(13).alignment = {
            vertical: 'middle',
            horizontal: 'center'
          }; // ultimaHoja = nombreHoja;

          i++;
        } while (i < cantResults); // APLICANDO ESTILOS A LAS HOJAS
        // agregarStatus('Agregando estilo...', false)


        workbook.eachSheet(function (worksheet, sheetId) {
          worksheet.eachRow({
            includeEmpty: true
          }, function (row, rowNumber) {
            if (rowNumber == 1) {
              // Border a el inicio
              worksheet.getRow(rowNumber).getCell(2).border = {
                bottom: {
                  style: 'thin'
                }
              };
            } else {
              // Border a los lados
              worksheet.getRow(rowNumber).getCell(13).border = {
                right: {
                  style: 'thin'
                }
              };
              worksheet.getRow(rowNumber).getCell(2).border = {
                left: {
                  style: 'thin'
                }
              }; // Border a las actividades

              if (rowNumber > 12) {
                worksheet.getRow(rowNumber).getCell(2).border = {
                  top: {
                    style: 'thin'
                  },
                  bottom: {
                    style: 'thin'
                  },
                  right: {
                    style: 'thin'
                  },
                  left: {
                    style: 'thin'
                  }
                };
                worksheet.getRow(rowNumber).getCell(2).border = {
                  top: {
                    style: 'thin'
                  },
                  bottom: {
                    style: 'thin'
                  },
                  right: {
                    style: 'thin'
                  },
                  left: {
                    style: 'thin'
                  }
                };
                worksheet.getRow(rowNumber).getCell(3).border = {
                  top: {
                    style: 'thin'
                  },
                  bottom: {
                    style: 'thin'
                  },
                  right: {
                    style: 'thin'
                  },
                  left: {
                    style: 'thin'
                  }
                };
                worksheet.getRow(rowNumber).getCell(3).border = {
                  top: {
                    style: 'thin'
                  },
                  bottom: {
                    style: 'thin'
                  },
                  right: {
                    style: 'thin'
                  },
                  left: {
                    style: 'thin'
                  }
                };
              }
            } // Agrego el color y estilos al header


            row.eachCell({
              includeEmpty: true
            }, function (cell, colNumber) {
              if (rowNumber > 1 && colNumber > 1 && rowNumber < 6) {
                cell.font = {
                  size: 16,
                  bold: true
                };
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: {
                    argb: 'DEEAF6'
                  }
                };
              }

              if (cell._address == 'D7' || cell._address == 'D8' || cell._address == 'D9') {
                cell.border = {
                  bottom: {
                    style: 'thin'
                  },
                  right: {
                    style: 'thin'
                  }
                };
              }
            }); //eachcell
          }); //eachRow
        }); //eachsheet

        console.log('--------------------------------->' + cantResults);
        agregarStatus("Total hojas creadas: ".concat(cantResults), false);
        cantResults = cantResults - 1;
        workbook.views = [{
          firstSheet: cantResults - 5,
          activeTab: cantResults,
          visibility: 'visible'
        }]; // let esperarBro = '';

        crearDir(homePath).then(function () {
          workbook.xlsx.writeFile("".concat(homePath, "Bit\xE1cora_").concat(rfc, ".xlsx")).then(function () {
            // mensajeRespuestaForm.insertAdjacentHTML('beforeend',`Se guardo registro.<br> En: Bitácora_${rfc}.xlsx`)
            // esperarBro = setTimeout(function(){
            // 	mensajeRespuestaForm.innerHTML = '';
            // }, 3000)
            agregarStatus("Archivo creado en: ".concat(homePath), false);
            agregarStatus("Nombre de archivo: Bit\xE1cora_".concat(rfc, ".xlsx"), true);
            console.warn('SE CREO EL LIBRO CON EXITO'); // return esperarBro;
          })["catch"](function () {
            agregarStatus("Ops!, El archivo se encuentra abierto cierralo e intenta nuevamente, libro: Bit\xE1cora_".concat(rfc, ".xlsx"), true); // mensajeRespuestaForm.insertAdjacentHTML('beforeend',`El archivo se encuentra abierto cierralo e intenta nuevamente.<br> Libro: Bitácora_${rfc}.xlsx`)
            // esperarBro = setTimeout(function(){
            // mensajeRespuestaForm.innerHTML = '';
            // }, 4000)
          });
        });
      } else {
        // agregarStatus(`Aun no puedes` , true)
        mensajeRespuestaForm.innerHTML = 'Aún no tienes ningún registro con actividades.';
        setTimeout(function () {
          mensajeRespuestaForm.innerHTML = '';
        }, 4000);
      }
    });
  }, function (err) {
    console.error(err.message);
  }, function () {});
}
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
	Fin es un objeto de fecha, es donde terminará de calcular.
	Si no tiene fecha de fin, valida hasta la fecha actual
*/
function validacionesHomeOffice(fechaHomeOffice, rfc, fin) {
  console.log(fechaHomeOffice + ' ' + rfc); // home office

  var spliting = fechaHomeOffice.split('-');
  var dayHomeOff = spliting[0];
  var monthHomeOff = spliting[1] - 1;
  var yearHomeOff = spliting[2];
  var fechaHoy = new Date();
  var diferencia = 0;
  var objectDate = []; // home office

  return new Promise(function (resolve, reject) {
    diferencia = fechaHoy.getFullYear() - yearHomeOff; // console.log('Diferencia entre años: ' + diferencia)
    // console.log('iteracion entre años')

    var i = 0,
        j = 0,
        h = 0,
        dateForMonth = '';
    var yearIterator = yearHomeOff; // iteracion años

    for (i = 0; i <= diferencia; i++) {
      // console.warn('Año: '  + i +  ' ' + yearIterator)
      // iteracion meses
      do {
        // si año home office es igual al año iterador
        if (yearIterator == yearHomeOff) {
          // si año home office es igual al año de hoy
          if (yearIterator == fechaHoy.getFullYear()) {
            // que?
            objectDate.push(obtenerFechasExistentes(yearIterator, j, dayHomeOff, monthHomeOff, yearHomeOff, fin));
          } else {
            if (monthHomeOff <= j) {
              objectDate.push(obtenerFechasExistentes(yearIterator, j, dayHomeOff, monthHomeOff, yearHomeOff, fin)); // console.log('mes: ' + j)
            }
          }
        } else {
          // si llegamos a la fecha de hoy
          if (yearIterator == fechaHoy.getFullYear()) {
            if (fechaHoy.getMonth() >= j) {
              objectDate.push(obtenerFechasExistentes(yearIterator, j, dayHomeOff, monthHomeOff, yearHomeOff, fin)); // console.log('mes: ' + j)
            }
          } else {
            // diferente añño
            objectDate.push(obtenerFechasExistentes(yearIterator, j, dayHomeOff, monthHomeOff, yearHomeOff, fin)); // console.log('mes: ' + j)
          }
        }

        j++;
      } while (j < 12);

      j = 0;
      yearIterator++;
    }

    resolve([objectDate, rfc]);
  }); // .then(function(obj){
  // console.log(obj)
  // console.log(obj[0])
  // console.log(obj[1])
  // return obtenerRegistrosFaltantes(obj[0], obj[1])
  // })
}

function obtenerFechasExistentes(iYear, iMonth, hDay, hMonth, hYear, fin) {
  // console.log(year + ' -- ' + arrMes + ' -- ' + fechaHomeOffice)
  var ultimoDiaMes = new Date(iYear, iMonth + 1, 0);
  var dataDeMes = [];
  var dia = 1;
  var diaCreado = 0;
  var hoyDate = new Date(); // let final = fin.split('-')

  if (_typeof(fin) === 'object') {
    hoyDate = fin; // console.log('------',fin);		
  } // console.warn(hoyDate2)
  // console.log(hoyDate)


  var fechaReturn = '';
  hDay = parseInt(hDay); // console.log('OBTENER MES: ' + iMonth)
  // let homeoffice = hYear +''+hMonth+''+hDay;
  // let hoyDateFull = hoyDate.getFullYear()+''+hoyDate.getMonth()+''+hoyDate.getDate();
  // let fechaCreada = 0;

  var nuevoMes = 1,
      nuevoDia = 0;

  for (var i = 0; i < ultimoDiaMes.getDate(); i++) {
    diaCreado = new Date(iYear, iMonth, dia);

    if (diaCreado.getDay() == 6 || diaCreado.getDay() == 0) {} else {
      nuevoMes = iMonth + 1;
      nuevoMes = regresaTextoCero(nuevoMes);
      nuevoDia = regresaTextoCero(dia);
      fechaReturn = nuevoDia + '-' + nuevoMes + '-' + iYear;

      if (iYear == hYear && iYear == hoyDate.getFullYear()) {
        if (iMonth == hMonth && iMonth == hoyDate.getMonth()) {
          if (hMonth == iMonth && hoyDate.getDate() >= dia && hDay <= dia) {
            dataDeMes.push(fechaReturn);
            console.log(dia + '-' + iMonth + '-' + iYear);
          } // dataDeMes.push(fechaReturn)

        } else {
          // todo paso en este año pero diferente mes
          if (hMonth == iMonth && hDay <= dia) {
            // console.log(dia+'-'+iMonth+'-'+iYear)
            dataDeMes.push(fechaReturn);
          }

          if (hoyDate.getMonth() == iMonth && hoyDate.getDate() >= dia) {
            // console.log(dia+'-'+iMonth+'-'+iYear)
            dataDeMes.push(fechaReturn);
          }

          if (iMonth < hoyDate.getMonth() && iMonth > hMonth) {
            // console.log(dia+'-'+iMonth+'-'+iYear)
            dataDeMes.push(fechaReturn);
          }
        }
      } else {
        if (iMonth == hMonth && iYear == hYear) {
          if (hDay <= dia && hMonth == iMonth) {
            // console.log(dia+'-'+iMonth+'-'+iYear)
            dataDeMes.push(fechaReturn);
          }
        } else {
          if (hoyDate.getMonth() == iMonth && hoyDate.getDate() >= dia && hoyDate.getFullYear() == iYear) {
            // console.log(dia+'-'+iMonth+'-'+iYear)
            dataDeMes.push(fechaReturn);
          } else {
            if (hoyDate.getFullYear() == iYear && iMonth < hoyDate.getMonth()) {
              // console.log(dia+'-'+iMonth+'-'+iYear)
              dataDeMes.push(fechaReturn);
            }

            if (iMonth <= hoyDate.getMonth() && hoyDate.getFullYear() > iYear) {
              // console.log(dia+'-'+iMonth+'-'+iYear)
              dataDeMes.push(fechaReturn);
            }

            if (iMonth > hoyDate.getMonth() && hoyDate.getFullYear() > iYear) {
              // console.warn(dia+'-'+iMonth+'-'+iYear)
              dataDeMes.push(fechaReturn);
            }
          }
        }
      }
    }

    dia++;
  }

  return dataDeMes;
}

function obtenerRegistrosFaltantes(object, RFC) {
  var db = getDatabase();
  var cantResults = 0;
  var allDays = [];
  var USER_APP = localStorage.getItem('USER_APP');
  object.forEach(function (item) {
    item.forEach(function (days) {
      // console.log(days)
      allDays.push(days);
    });
  });
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("\n\t\t\t\tSELECT\n\t\t\t\t\tfecha\n\t\t\t\tFROM\n\t\t\t\t\tTBL_CAMPOS\n\t\t\t\tWHERE\n\t\t\t\t\trfcusuario = ?\n\t\t\t\tAND\n\t\t\t\t\tclaveusr = ?\n\t\t\t\tORDER BY\n\t\t\t\t\tfecha\n\t\t\t", [RFC, USER_APP], function (tx, results) {
        cantResults = results.rows.length;
        var text = '';
        var finded = -1;
        var faltantesDays = [];
        var resObject;
        console.warn('Registros del usuario en Base de datos: ' + cantResults);

        if (cantResults > 0) {
          for (var i = 0; i < cantResults; i++) {
            text += results.rows[i].fecha + ',';
          } // console.log(text)


          allDays.forEach(function (obj, index) {
            finded = text.search(obj);

            if (finded < 0) {
              faltantesDays.push(obj);
            }
          });
          resObject = faltantesDays;
        } else {
          resObject = allDays;
        }

        resolve(resObject);
      });
    }, function (err) {
      console.error(err.message);
    }, function () {});
  }).then(function (objDiasFaltantes) {
    return new Promise(function (resolve, reject) {
      var festivos = getDiasFestivos();
      var spliting = '';
      var dia = 0;
      var mes = 0;
      var year = 0; // let text = '', finded = -1;
      // // console.warn('Ahora eliminar festivos')
      // festivos.forEach(function(item){
      // 	text += `${regresaTextoCero(item.dia)}-${regresaTextoCero(item.mes)}-${regresaTextoCero(item.year)},`;
      // })
      // objDiasFaltantes.forEach(function( obj, index ) {
      // 	finded = text.search(obj.fecha);
      // 	if (finded >= 0) {
      // 		objDiasFaltantes.splice(index,1)
      // 	}
      // })

      festivos.forEach(function (festivo) {
        objDiasFaltantes.forEach(function (fecha, index) {
          spliting = fecha.split('-');
          dia = parseInt(spliting[0]);
          mes = parseInt(spliting[1]);
          year = parseInt(spliting[2]);

          if (festivo.mes == mes && festivo.dia == dia && festivo.year == year) {
            objDiasFaltantes.splice(index, 1);
          }
        });
      });
      resolve(objDiasFaltantes);
    });
  });
}
"use strict";

function cargarModuloUsuarios() {
  var displayContent = document.getElementById('displayContent');
  var html = "\n\t\t\t<div class=\"modulo\">\n\t\t\t\t<div class=\"title-modulo\">Registrar Personas</div>\n\t\t\t\t<div class=\"content-modulo\">\n\t\t\t\t\t<div class=\"form-container\" id=\"divForms\">\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpRfcUser\" placeholder=\"RFC*\" onkeyup=\"obtenerUpperRfc()\" maxlength=\"13\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpNmeUser\" placeholder=\"Nombre completo*\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpPueUser\" placeholder=\"Puesto*\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpDgaUser\" placeholder=\"DGA o Direcci\xF3n*\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t\t<input class=\"item-inp-data\" type=\"text\" id=\"inpHomeOff\"  value=\"\" onchange=\"\" placeholder=\"Inicio Trabajo en Casa*\" disabled>\n\t\t\t\t\t\t\t\t<button class=\"btn-fecha\" onclick=\"crearCalendario('inpHomeOff')\" id=\"btInptDate\">Seleccionar Fecha</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t<label class=\"lbel-file\" htmlFor=\"\" id=\"nameFileDisp\">Archivo de bit\xE1cora</label>\n\t\t\t\t\t\t\t<input id=\"inpFilUser\" class=\"file-input\" type=\"file\" accept=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel\" onchange=\"changeValue(this.id)\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t\t<button class=\"btn-fecha\" onclick=\"validarUsuarioBitacora(false)\">GUARDAR PERSONA</button>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"mensaje-form\" id=\"mensajeRespuestaForm\"></div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"usuarios-container\">\n\t\t\t\t\t\t<div class=\"area-usuarios\">\n\t\t\t\t\t\t\t<div class=\"title-usuarios\">Personas registradas</div>\n\t\t\t\t\t\t\t<div class=\"content-usuarios\" id=\"registrosUsuarios\">\n\t\t\t\t\t\t\t\t<!--<div class=\"row-user\">\n\t\t\t\t\t\t\t\t</div>-->\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t\t";
  displayContent.innerHTML = html;
  mostrarUsuariosAlta();
}

function obtenerUpperRfc() {
  var inpRfcUser = document.getElementById('inpRfcUser');

  if (inpRfcUser) {
    inpRfcUser.addEventListener('input', function (e) {
      inpRfcUser.value = e.target.value.toUpperCase();
    });
  }
} // const input = document.querySelector('input');
// const log = document.getElementById('values');
// input.addEventListener('input', updateValue);
// function updateValue(e) {
// 	console.log(e)
// }


function changeValue(id) {
  var file = document.getElementById(id);
  var nameFileDisp = document.getElementById('nameFileDisp');
  nameFileDisp.style = 'color: black;';
  nameFileDisp.innerHTML = file.files[0].name; // console.log(file.style)
  // console.log(file.files[0].name)
}
"use strict";

function validarUsuarioBitacora(update) {
  var inpRfcUser = document.getElementById('inpRfcUser');
  var inpNmeUser = document.getElementById('inpNmeUser');
  var inpDgaUser = document.getElementById('inpDgaUser');
  var inpHomeOff = document.getElementById('inpHomeOff');
  var inpPueUser = document.getElementById('inpPueUser');
  var btInptDate = document.getElementById('btInptDate');
  var inpFilUser = document.getElementById('inpFilUser');
  var registrosUsuarios = document.getElementById('registrosUsuarios');
  var mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
  mensajeRespuestaForm.innerHTML = '';
  var status = true;
  var formData = {
    nombre: '',
    dga: '',
    inicio: '',
    rfc: '',
    puesto: ''
  };
  var USER_APP = localStorage.getItem('USER_APP');

  if (inpNmeUser.value == '') {
    status = false;
  }

  ;

  if (inpDgaUser.value == '') {
    status = false;
  }

  ;

  if (inpHomeOff.value == '') {
    status = false;
  }

  ;

  if (inpRfcUser.value == '') {
    status = false;
  }

  ;

  if (inpPueUser.value == '') {
    status = false;
  }

  ;

  if (inpRfcUser.value.length < 13) {
    status = false;
  }

  ;

  if (status) {
    formData.nombre = encondeCaracteres(inpNmeUser.value);
    formData.dga = encondeCaracteres(inpDgaUser.value);
    formData.inicio = encondeCaracteres(inpHomeOff.value);
    formData.rfc = encondeCaracteres(inpRfcUser.value);
    formData.puesto = encondeCaracteres(inpPueUser.value);
    guardarUsuarioBitacora(formData, update, USER_APP).then(function (respuesta) {
      if (respuesta) {
        // if (update) {
        // 	cargarModuloUsuarios();
        // 	mensajeRespuestaForm.innerHTML = 'El registro se actualizo';
        // } else {
        // 	registrosUsuarios.insertAdjacentHTML(`beforeend`,`
        // 		<div class="row-user" onclick="editarRegistroUsuario('${formData.rfc}')">
        // 			<div class="column-user-data">${formData.nombre}</div>
        // 			<div class="column-user-data">${formData.rfc}</div>
        // 		</div>
        // 	`)
        // 	inpNmeUser.value = '';
        // 	inpDgaUser.value = '';
        // 	inpHomeOff.value = '';
        // 	inpRfcUser.value = '';
        // 	inpPueUser.value = '';
        // 	mensajeRespuestaForm.innerHTML = 'Registro guardado.';
        // }
        if (inpFilUser.files[0] && inpFilUser.files) {
          return leerArchivoBitacora(formData.rfc, formData.inicio, USER_APP);
          console.warn('Leer archivo excel');
        } else {
          return 'El registro fue modificado.';
        }
      }
    }).then(function (message) {
      console.log('--> ' + message);

      if (update) {
        cargarModuloUsuarios();
        mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
        mensajeRespuestaForm.innerHTML = message;
      } else {
        var nameFileDisp = document.getElementById('nameFileDisp');
        registrosUsuarios.insertAdjacentHTML("beforeend", "\n\t\t\t\t\t\t<div class=\"row-user\" id=\"code".concat(formData.rfc, "\">\n\t\t\t\t\t\t\t<div class=\"column-user-data\">").concat(formData.nombre, "</div>\n\t\t\t\t\t\t\t<div class=\"column-user-data\">").concat(formData.rfc, "</div>\n\t\t\t\t\t\t\t<div class=\"column-opt-data\" onclick=\"editarRegistroUsuario('").concat(formData.rfc, "','").concat(USER_APP, "')\"><span class=\"material-icons\">edit</span></div>\n\t\t\t\t\t\t\t<div class=\"column-opt-data\" onclick=\"observarDatosUsuario('").concat(formData.rfc, "')\"><span class=\"material-icons\">fact_check</span></div>\n\t\t\t\t\t\t\t<div class=\"column-opt-data\"><span class=\"material-icons\" onclick=\"eliminarDatosUsuario('").concat(formData.rfc, "','").concat(USER_APP, "')\">delete_forever</span></div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t"));
        inpNmeUser.value = '';
        inpDgaUser.value = '';
        inpHomeOff.value = '';
        inpRfcUser.value = '';
        inpPueUser.value = '';
        mensajeRespuestaForm.innerHTML = 'Registro guardado.';
        nameFileDisp.innerHTML = 'Archivo de bitácora';
        nameFileDisp.style = 'color: gray;'; // mensajeRespuestaForm.innerHTML = message;
      }
    })["catch"](function (err) {
      console.log(err);
    });
  } else {
    mensajeRespuestaForm.innerHTML = 'Faltan campos requeridos.';
  }
}

function leerArchivoBitacora(rfc, inicioHome, userApp) {
  var inpFilUser = document.getElementById('inpFilUser');
  var bookBitaco = new Excel.Workbook();
  var objSheetsNames = [];
  var spliting, day, month, year, posibleName;
  var db = getDatabase();
  openStatus('Verificando archivo', false);
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("DELETE FROM TBL_CAMPOS WHERE rfcusuario=? AND claveusr = ?", [rfc, userApp]);
    }, function (err) {
      console.error(err.message);
    }, function () {
      console.log('Evaluando registros anteriores.');
      agregarStatus('Evaluando registros...', false);
      resolve();
    });
  }).then(function () {
    return new Promise(function (resolve, reject) {
      // console.warn(inicioHome + ' -- ' +rfc)
      // obtengo el objeto y lo espero para leerlo
      return new Promise(function (resolve, reject) {
        var obj = validacionesHomeOffice(inicioHome, rfc);
        resolve(obj);
      }).then(function (obj) {
        return obtenerRegistrosFaltantes(obj[0], obj[1]);
      }).then(function (objDiasPosibles) {
        var spliting = '';
        var formatoBit = '';
        console.log('Hojas posibles a encontrar: ' + objDiasPosibles.length); // hago una cadena de fechas con formato de bitácora

        objDiasPosibles.forEach(function (date) {
          spliting = date.split('-');
          formatoBit += "".concat(spliting[2]).concat(spliting[1]).concat(spliting[0], ",");
        }); // console.log('Formato bit: ' + formatoBit)

        var finded = -1; // busco la cadena de fecha de nombre de hoja que almacenaré dentro de la aplicación

        bookBitaco.xlsx.readFile(inpFilUser.files[0].path).then(function (book) {
          book.eachSheet(function (worksheet, sheetId) {
            finded = formatoBit.search(worksheet.name);

            if (finded >= 0) {
              objSheetsNames.push(worksheet.name);
              console.log('Hoja encontrada: ' + worksheet.name);
            }
          });
        }).then(function () {
          // console.log('Terminando de encontrar hojas compatibles con formato...')
          console.log('Hojas compatibles encontradas: ' + objSheetsNames.length);
          agregarStatus('Hojas compatibles encontradas: ' + objSheetsNames.length, false);
          var hoja = '';
          var valueCol = '';
          var i = 0;
          var comma = ',';
          var sqlQuery = '';
          bookBitaco.xlsx.readFile(inpFilUser.files[0].path).then(function (book) {
            var end = objSheetsNames.length;
            objSheetsNames.forEach(function (sheet, index) {
              sqlQuery += '(';
              hoja = book.getWorksheet(sheet);
              hoja.eachRow({
                includeEmpty: false
              }, function (row, rowNumber) {
                if (rowNumber >= 13) {
                  valueCol = row.getCell(3);

                  if (valueCol !== '') {
                    sqlQuery += "\"".concat(encondeCaracteres(valueCol.value), "\","); // console.log('Valor encontrado: ' + valueCol.value +' en row: ' + rowNumber)
                  } // console.log(row)

                }
              }); // console.log(index)
              // console.log(end)

              i++;

              if (end == i) {
                comma = ';';
              }

              sqlQuery += "0,\"".concat(sheet.substring(6, 8), "-").concat(sheet.substring(4, 6), "-").concat(sheet.substring(0, 4), "\",\"").concat(rfc, "\", \"").concat(userApp, "\")").concat(comma, "\n");
            });

            if (objSheetsNames.length > 0) {
              sqlQuery = 'INSERT INTO TBL_CAMPOS VALUES ' + sqlQuery;
            }

            return {
              sqlQuery: sqlQuery,
              objSheetsNames: objSheetsNames
            };
          }).then(function (obj) {
            // console.log(query)
            // let mensaje = 'No se encontraron hojas compatibles';
            if (obj.sqlQuery !== '') {
              db.transaction(function (tx) {
                agregarStatus('Insertando registros, un momento...', false);
                tx.executeSql(obj.sqlQuery); // console.log(query)
              }, function (err) {
                console.error(err.message);
              }, function () {
                agregarStatus('Cantidad hojas agregadas: ' + obj.objSheetsNames.length, false); // const nameFileDisp = document.getElementById('nameFileDisp');
                // console.warn('Se insertaron datos del Excel')
                // mensaje = 'Termino de insertar datos';
                // agregarStatus('Terminando de agregar registro..', false)

                agregarStatus('¡Hecho!', true);
              });
            } else {
              agregarStatus('¡No se encontraron actividades!', true);
            }

            resolve('¡Agregado!');
          }); // objSheetsNames
        });
      });
    });
  }); // console.warn('Leer archivo excel: ' + inpFilUser.files[0].path)
}

function guardarUsuarioBitacora(obj, update, userApp) {
  console.log(obj);
  console.warn('Modificación: ' + update);
  var registrosUsuarios = document.getElementById('registrosUsuarios');
  var mensajeRespuestaForm = document.getElementById('mensajeRespuestaForm');
  var db = getDatabase();
  var cantResults = 0;
  var html = '';
  var sqlQuery = "INSERT INTO TBL_USUARIO VALUES (\"".concat(obj.rfc, "\",\"").concat(obj.nombre, "\",\"").concat(obj.puesto, "\",\"").concat(obj.dga, "\",\"").concat(obj.inicio, "\", \"").concat(userApp, "\");");
  console.log(sqlQuery); // let sqlQuery = `SELECT nombre_usuario FROM TBL_USUARIO WHERE rfc_usuario = ?`;

  if (update) {
    sqlQuery = "UPDATE TBL_USUARIO SET nombre_usuario = \"".concat(obj.nombre, "\", puesto_usuario=\"").concat(obj.puesto, "\", dga_direccion=\"").concat(obj.dga, "\", inicio_homeoff=\"").concat(obj.inicio, "\" WHERE rfc_usuario = \"").concat(obj.rfc, "\" AND claveusr=\"").concat(userApp, "\";");
  }

  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("\n\t\t\t\tSELECT\n\t\t\t\t\tnombre_usuario\n\t\t\t\tFROM\n\t\t\t\t\tTBL_USUARIO\n\t\t\t\tWHERE\n\t\t\t\t\trfc_usuario = ?\n\t\t\t\tAND\n\t\t\t\t\tclaveusr = ?\n\t\t\t", [obj.rfc, userApp], function (tx, results) {
        cantResults = results.rows.length;

        if (cantResults > 0 && update !== true) {
          mensajeRespuestaForm.innerHTML = 'El RFC coincide con el de otro registro.';
        } else {
          resolve(sqlQuery);
        }
      });
    }, function (err) {
      console.error(err.message);
    }, function () {});
  }).then(function (query) {
    // console.log(query)
    return new Promise(function (resolve, reject) {
      console.log('Consulta:\n' + query);
      db.transaction(function (tx) {
        tx.executeSql(query);
      }, function (err) {
        console.error(err.message);
      }, function () {
        // mensajeRespuestaForm.innerHTML = 'Hecho.';
        resolve(true);
      });
    });
  });
}
"use strict";

function mostrarUsuariosAlta() {
  var registrosUsuarios = document.getElementById('registrosUsuarios');
  var USER_APP = localStorage.getItem('USER_APP');
  var db = getDatabase();
  var cantResults = 0;
  var html = '';
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("\n\t\t\t\tSELECT\n\t\t\t\t\t*\n\t\t\t\tFROM\n\t\t\t\t\tTBL_USUARIO\n\t\t\t\tWHERE\n\t\t\t\t\tclaveusr = ?\n\t\t\t\tORDER BY\n\t\t\t\t\tnombre_usuario\n\t\t\t", [USER_APP], function (tx, results) {
        cantResults = results.rows.length;
        console.log('SELECT * FROM TBL_USUARIO ORDER BY nombre_usuario AND claveusr = ' + USER_APP);

        if (cantResults > 0) {
          for (var i = 0; i < cantResults; i++) {
            html += "<div class=\"row-user\" id=\"code".concat(results.rows[i].rfc_usuario, "\">\n\t\t\t\t\t\t\t\t\t\t\t<div class=\"column-user-data\">").concat(results.rows[i].nombre_usuario, "</div>\n\t\t\t\t\t\t\t\t\t\t\t<div class=\"column-user-data\">").concat(results.rows[i].rfc_usuario, "</div>\n\t\t\t\t\t\t\t\t\t\t\t<div class=\"column-opt-data\"><span class=\"material-icons\" onclick=\"editarRegistroUsuario('").concat(results.rows[i].rfc_usuario, "','").concat(USER_APP, "')\">edit</span></div>\n\t\t\t\t\t\t\t\t\t\t\t<div class=\"column-opt-data\"><span class=\"material-icons\" onclick=\"observarDatosUsuario('").concat(results.rows[i].rfc_usuario, "')\">fact_check</span></div>\n\t\t\t\t\t\t\t\t\t\t\t<div class=\"column-opt-data\"><span class=\"material-icons\" onclick=\"eliminarDatosUsuario('").concat(results.rows[i].rfc_usuario, "','").concat(USER_APP, "')\">delete_forever</span></div>\n\t\t\t\t\t\t\t\t\t\t</div>");
          }
        }

        registrosUsuarios.innerHTML = html;
      });
    }, function (err) {
      console.error(err.message);
    }, function () {
      resolve();
    });
  });
}

function observarDatosUsuario(rfc) {
  // console.log(rfc)
  desmarcarButton('btnRegistrar');
  cargarModuloRegistro();
  obtenerDatosUsuario(rfc);
}
"use strict";

function editarRegistroUsuario(rfc, userApp) {
  var divForms = document.getElementById('divForms');
  var db = getDatabase();
  var cantResults = 0;
  var html = '';
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("\n\t\t\t\tSELECT\n\t\t\t\t\t*\n\t\t\t\tFROM\n\t\t\t\t\tTBL_USUARIO\n\t\t\t\tWHERE\n\t\t\t\t\trfc_usuario = ?\n\t\t\t\tAND\n\t\t\t\t\tclaveusr = ?\n\t\t\t", [rfc, userApp], function (tx, results) {
        cantResults = results.rows.length;
        html = "\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpRfcUser\" value=\"".concat(results.rows[0].rfc_usuario, "\" maxlength=\"13\" disabled>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpNmeUser\" value=\"").concat(results.rows[0].nombre_usuario, "\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpPueUser\" value=\"").concat(results.rows[0].puesto_usuario, "\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t<input class=\"item-input\" type=\"text\" id=\"inpDgaUser\" value=\"").concat(results.rows[0].dga_direccion, "\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t\t<input class=\"item-inp-data\" type=\"text\" id=\"inpHomeOff\" value=\"").concat(results.rows[0].inicio_homeoff, "\" onchange=\"\" disabled>\n\t\t\t\t\t\t\t\t<button class=\"btn-fecha\" onclick=\"crearCalendario('inpHomeOff')\" id=\"btInptDate\">Seleccionar Fecha</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t<label class=\"lbel-file\" htmlFor=\"\" id=\"nameFileDisp\">Archivo de bit\xE1cora</label>\n\t\t\t\t\t\t\t<input id=\"inpFilUser\" class=\"file-input\" type=\"file\" accept=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel\" onchange=\"changeValue(this.id)\">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"item-form\">\n\t\t\t\t\t\t\t\t<button class=\"btn-fecha\" onclick=\"validarUsuarioBitacora(true)\">GUARDAR CAMBIOS</button>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"mensaje-form\" id=\"mensajeRespuestaForm\"></div>\n\t\t\t\t\t\t</div>\n\t\t\t\t");
        divForms.innerHTML = html;
      });
    }, function (err) {
      console.error(err.message);
    }, function () {});
  });
  console.warn('A editar: ' + rfc);
}
"use strict";

function eliminarDatosUsuario(rfc, userApp) {
  modalCascade();
  var db = getDatabase();
  var cscHeader = document.getElementById('cscHeader');
  var cscContent = document.getElementById('cscContent');
  var cscOption = document.getElementById('cscOption');
  var cantResults = 0;
  var html = '';
  cscHeader.innerHTML = 'Eliminar Usuario'; // console.log(data)

  db.transaction(function (tx) {
    tx.executeSql("\n\t\t\tSELECT\n\t\t\t\t*\n\t\t\tFROM\n\t\t\t\tTBL_USUARIO\n\t\t\tWHERE\n\t\t\t\trfc_usuario = ?\n\t\t", [rfc], function (tx, results) {
      cantResults = results.rows.length;

      if (cantResults > 0) {
        html = "\n\t\t\t\t\t<div class=\"csc-row\"><div class=\"csc-col\">RFC:</div><div class=\"csc-col\">".concat(results.rows[0].rfc_usuario, "</div></div>\n\t\t\t\t\t<div class=\"csc-row\"><div class=\"csc-col\">Puesto:</div><div class=\"csc-col\">").concat(results.rows[0].puesto_usuario, "</div></div>\n\t\t\t\t\t<div class=\"csc-row\"><div class=\"csc-col\">Nombre:</div><div class=\"csc-col\">").concat(results.rows[0].nombre_usuario, "</div></div>\n\t\t\t\t\t<div class=\"csc-row\"><div class=\"csc-col\">Direcci\xF3n:</div><div class=\"csc-col\">").concat(results.rows[0].dga_direccion, "</div></div>\n\t\t\t\t\t<div class=\"csc-row\"><div class=\"csc-col\">Inicio trabajo en casa:</div><div class=\"csc-col\">").concat(results.rows[0].inicio_homeoff, "</div></div>\n\t\t\t\t");
        cscContent.innerHTML = html;
        cscOption.innerHTML = "\n\t\t\t\t<button class=\"csc-option\" onclick=\"eliminarUsarioConsulta('".concat(results.rows[0].rfc_usuario, "', '").concat(userApp, "')\">ELIMINAR</button>\n\t\t\t\t<button class=\"csc-option\" onclick=\"closeModal()\">CANCELAR</button>\n\t\t\t\t");
      }
    });
  }, function (err) {
    console.error(err.message);
  }, function () {});
}

function eliminarUsarioConsulta(rfc, userApp) {
  var db = getDatabase();
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql('DELETE FROM TBL_CAMPOS WHERE rfcusuario = ? AND claveusr = ?', [rfc, userApp]);
    }, function (err) {
      console.error(err.message);
    }, function () {
      resolve();
    });
  }).then(function () {
    db.transaction(function (tx) {
      tx.executeSql('DELETE FROM TBL_USUARIO WHERE rfc_usuario = ? AND claveusr = ?', [rfc, userApp]);
    }, function (err) {
      console.error(err.message);
    }, function () {});
  }).then(function () {
    db.transaction(function (tx) {
      tx.executeSql('DELETE FROM TBL_ACTIVIDADES WHERE rfcusuario = ? AND claveusr = ?', [rfc, userApp]);
    }, function (err) {
      console.error(err.message);
    }, function () {});
  }).then(function () {
    var itemDelete = document.getElementById('code' + rfc);
    itemDelete.remove();
    closeModal();
  });
}
"use strict";

function modalCascade() {
  var modales = document.getElementById('modales');
  var html = '';
  modales.classList.add('modulo-modal-1'); // modales.style = 'background: red;';
  // modales.style = 'pointer-events: none;';

  html = "\n\t\t<div class=\"content-csc\">\n\t\t\t<div class=\"csc-header\" id=\"cscHeader\">header</div>\n\t\t\t<div class=\"csc-content\" id=\"cscContent\">\n\t\t\t</div>\n\t\t\t<div class=\"csc-options\" id=\"cscOption\">\n\t\t\t\t\n\t\t\t</div>\n\t\t</div>\n\t";
  modales.innerHTML = html;
}
"use strict";

function openStatus(title) {
  modalCascade();
  var cscHeader = document.getElementById('cscHeader');
  cscHeader.innerHTML = title;
} // agregarStatus('Faltan un chingo de cosas')


function agregarStatus(mensaje, status) {
  var cscContent = document.getElementById('cscContent');
  cscContent.insertAdjacentHTML('beforeend', "\n\t\t<div class=\"csc-row\"><div class=\"csc-col\">".concat(mensaje, "</div></div>\n\t"));

  if (status) {
    setTimeout(function () {
      closeModal();
    }, 2000);
  }
}
"use strict";

function cargarModuloActividades() {
  var KEY = localStorage.getItem('RFC_KEY');
  var USER_APP = localStorage.getItem('USER_APP'); // mostrarActividadesRegistradas({ rfc: KEY, user: USER_APP});
}

function guardarDescripcionActividad() {
  var inputActividad = document.getElementById('inputActividad'); // const messageActRandom = document.getElementById('messageActRandom');

  var db = getDatabase();
  var KEY = localStorage.getItem('RFC_KEY');
  var USER_APP = localStorage.getItem('USER_APP');
  var valorActividad = decodeCaracteres(inputActividad.textContent);

  if (valorActividad !== '') {
    return getMaxIdActividad(KEY, USER_APP).then(function (key) {
      db.transaction(function (tx) {
        // falta agregar el usuario
        tx.executeSql("INSERT INTO TBL_ACTIVIDADES VALUES (?,?,'none',?,?)", [key + 1, valorActividad, KEY, USER_APP]);
      }, function (err) {
        console.error(err);
      }, function () {
        inputActividad.textContent = ''; // messageActRandom.innerHTML = '';

        return mostrarActividadesRegistradas({
          descripcion_actividad: valorActividad,
          id_actividad: key + 1,
          rfcusuario: KEY,
          claveusr: USER_APP
        });
      });
    });
  } else {// messageActRandom.innerHTML = 'No contiene descripción su actividad';
  }
}

function getMaxIdActividad(rfc, clave) {
  var db = getDatabase();
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("SELECT max(id_actividad) number FROM TBL_ACTIVIDADES WHERE rfcusuario =? AND claveusr=?", [rfc, clave], function (tx, results) {
        var number = results.rows[0].number;

        if (results.rows[0].number === null) {
          number = 0;
        }

        resolve(number);
      });
    }, function (err) {
      reject(err);
    });
  });
}

function mostrarActividadesRegistradas(object) {
  var listaActividades = document.getElementById('listaActividades');
  var db = getDatabase();
  var elemento = '',
      resultados = 0;
  return new Promise(function (resolve, reject) {
    var estado = false;

    if (object.descripcion_actividad) {
      estado = true;
    }

    resolve(estado);
  }).then(function (tipoInsersion) {
    if (tipoInsersion) {
      return [object];
    }

    return new Promise(function (resolve, reject) {
      return db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM TBL_ACTIVIDADES WHERE rfcusuario =? AND claveusr=?", [object.rfc, object.user], function (tx, results) {
          resultados = results.rows.length;
          var i = 0;
          var access = results.rows;
          resolve(access);
        });
      }, function (err) {
        reject(err);
      });
    });
  }).then(function (object) {
    console.warn(object);
    var length = object.length;

    for (var i = 0; i < length; i++) {
      elemento += "\n\t\t\t\t<div class=\"item-act-random\" id=\"fatherRandom-".concat(object[i].id_actividad, "\">\n\t\t\t\t\t<div class=\"agarrate-act\" onclick=\"marcarRandom(this)\" idActividad=\"").concat(object[i].id_actividad, "\">\n\t\t\t\t\t\t<div class=\"random-ref\">").concat(object[i].id_actividad, "</div>\n\t\t\t\t\t\t<div class=\"description-ref\" id=\"randomId-").concat(object[i].id_actividad, "\">").concat(object[i].descripcion_actividad, "</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"options-act-random\">\n\t\t\t\t\t\t<div class=\"option-act\">\n\t\t\t\t\t\t\t<span class=\"material-icons\" onclick=\"crearAreaEditarRandomActividad('").concat(convertToStringParams(object[i]), "')\">edit</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"option-act\">\n\t\t\t\t\t\t\t<span class=\"material-icons\" onclick=\"deleteRandomActividad('fatherRandom-").concat(object[i].id_actividad, "','").concat(convertToStringParams(object[i]), "')\">delete_forever</span>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t");
    }

    return listaActividades.insertAdjacentHTML('beforeend', elemento);
  });
}

var marcarRandom = function marcarRandom(e) {
  var className = 'random-marked';
  var stringId = 'fatherRandom-' + e.getAttribute('idActividad');
  var parentElement = document.getElementById(stringId);
  var clases = parentElement.classList.toString().search(className);

  if (clases >= 0) {
    parentElement.classList.remove(className);
    e.removeAttribute('estadoRandom', 'selected');
  } else {
    parentElement.classList.add(className);
    e.setAttribute('estadoRandom', 'selected');
  }
};

function convertToStringParams(object) {
  var params = JSON.stringify(object);
  params = params.replace(/"/g, "\\'");
  return params;
}

function leerFechasRandom() {
  var inpInicio = document.getElementById('inpInicio');
  var inpFin = document.getElementById('inpFin');
  var inicio = inpInicio.value;
  var messageActRandom = document.getElementById('messageActRandom');
  var fin = inpFin.value;
  return new Promise(function (resolve, reject) {
    if (inicio !== '' && fin !== '') {
      // console.log('A validar', inicio, fin)
      resolve(obtenerFechasDe(inicio, fin));
    } else {
      reject('No hay valores en las fechas');
    }
  }).then(function (object) {
    var checkerList = document.getElementsByName('checkerList');
    var seleccionadas = [];
    var count = 0; // let numbers = [3,4,5];
    // let random = Math.floor(Math.random()*numbers.length);

    var message = 'No a seleccionado ninguna actividad';
    checkerList.forEach(function (item) {
      if (item.checked) {
        seleccionadas.push(item.id);
        count++;
      }
    });

    if (count >= 5) {
      return crearActividadesRandom(object, seleccionadas);
    } else {
      message = 'Seleccionar al menos 5 actividades seleccionadas: ' + count;
    }

    return Promise.reject(message);
  })["catch"](function (err) {
    messageActRandom.innerHTML = err;
  });
}

function crearActividadesRandom(object, actividades) {
  // console.log(object)
  var messageActRandom = document.getElementById('messageActRandom');
  var KEY = localStorage.getItem('RFC_KEY');
  var USER_APP = localStorage.getItem('USER_APP');
  var numbers = [3, 4, 5];
  var random = 0;
  var idActividades = '';
  var id = '';
  var concatInserts = '';
  var promesa1 = '';
  var fecha = '';
  return new Promise(function (resolveP1, reject) {
    var _loop = function _loop(a, _promesa2) {
      _promesa2 = _promesa2.then(function () {
        if (object[0][a].length > 0) {
          _promesa = _promesa2;
          return deleteRegistrosPrevios(object[0][a], KEY, USER_APP);
        }

        _promesa = _promesa2;
        return;
      }).then(function () {
        if (object[0][a].length > 0) {
          console.log(object[0][a]);
          _promesa = _promesa2;
          return new Promise(function (resolveP2, reject) {
            var insertsGlb = 'INSERT INTO TBL_CAMPOS VALUES ';
            var promesa2 = '';

            var _loop2 = function _loop2(i, _promesa4) {
              _promesa4 = _promesa4.then(function () {
                // fecha = object[0][a][i];
                random = Math.floor(Math.random() * numbers.length);
                _promesa = _promesa2;
                _promesa3 = _promesa4;
                return numbers[random]; // console.log(fecha)
              }).then(function (random) {
                var j = 0;
                var randomIdAct = 0;
                var selector = [];
                console.log('iteracion: ', i);

                do {
                  idActividades = Math.floor(Math.random() * actividades.length); // console.log(actividades[idActividades])

                  if (!selector.includes(actividades[idActividades])) {
                    selector.push(actividades[idActividades]);
                    j++;
                  }
                } while (j < random);

                _promesa = _promesa2;
                _promesa3 = _promesa4;
                return selector;
              }).then(function (objectIds) {
                // console.log(objectIds)
                var promise3 = '';
                var value = '';
                var inserts = '(';
                _promesa = _promesa2;
                _promesa3 = _promesa4;
                return new Promise(function (resolveQuerys, reject) {
                  var _loop3 = function _loop3(j, _promise2) {
                    _promise2 = _promise2.then(function () {
                      value = document.getElementById('label-' + objectIds[j]);
                      inserts += "\"".concat(value.textContent, "\",");

                      if (objectIds.length - 1 == j) {
                        for (var end = 0; end < 20 - objectIds.length; end++) {
                          inserts += '"",';
                        }

                        inserts += "".concat(0, ",\"", object[0][a][i], "\",\"").concat(KEY, "\",\"").concat(USER_APP, "\")");
                        resolveQuerys(inserts);
                      }
                    });
                    _promise = _promise2;
                  };

                  for (var j = 0, _promise = Promise.resolve(); j < objectIds.length; j++) {
                    _loop3(j, _promise);
                  }
                });
              }).then(function (insert) {
                var end = insert; // console.log(insert)

                if (object[0][a].length - 1 == i) {
                  end += ';';
                  insertsGlb += end;
                  resolveP2(insertsGlb);
                  console.log('Termino de recorrer child');
                } else {
                  end += ',\n';
                  insertsGlb += end;
                }
              });
              _promesa3 = _promesa4;
            };

            for (var i = 0, _promesa3 = Promise.resolve(); i < object[0][a].length; i++) {
              _loop2(i, _promesa3);
            }
          });
        }
      }).then(function (querys) {
        if (querys) {
          insertarRandomActividades(querys);
        }

        if (object[0].length - 1 == a) {
          console.warn('Termino el proceso');
          resolveP1(true);
        }
      });
      _promesa = _promesa2;
    };

    for (var a = 0, _promesa = Promise.resolve(); a < object[0].length; a++) {
      _loop(a, _promesa);
    }
  }).then(function (stat) {
    messageActRandom.innerHTML = 'Se crearon las actividades.';
    return getInicioHomeOffice(KEY, USER_APP).then(function (obj) {
      return desplegaDiasConStatus(obj[0].inicio_homeoff, KEY, 'registrado');
      console.warn('Termino de crear.');
    });
  });
}

function getInicioHomeOffice(rfc, user) {
  var db = getDatabase();
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("SELECT inicio_homeoff FROM TBL_USUARIO WHERE rfc_usuario = ? AND claveusr = ?", [rfc, user], function (tx, results) {
        resolve(results.rows);
      });
    }, function (err) {
      reject(err);
    });
  });
}

function obtenerFechasDe(inicio, fin, rfc) {
  var fechaInicio = crearObjectFecha(inicio);
  var fechaFin = crearObjectFecha(fin);
  var KEY = localStorage.getItem('RFC_KEY');

  if (fechaInicio <= fechaFin) {
    return validacionesHomeOffice(inicio, KEY, fechaFin);
  }

  return Promise.reject('La fecha de fin no puede ser menor');
} // dd-mm-aaaa


function crearObjectFecha(cadena) {
  if (cadena.length > 0) {
    var date = cadena.split('-');
    var year = date[2];
    var month = date[1] - 1;
    var day = date[0];
    return new Date(year, month, day);
  } else {
    return null;
  }
} // function marcarActividadRandom(cadenaId, row){
// 	let status = document.getElementById(cadenaId);
// 	let padre = document.getElementById(row);
// 	console.log(status)
// 	console.log(row)
// 	if (!status.checked) {
// 		padre.classList.add('marked');
// 	} else {
// 		padre.classList.remove('marked');
// 	}
// }


function deleteRegistrosPrevios(object, rfc, user) {
  var db = getDatabase();
  var valuesIn = JSON.stringify(object);
  valuesIn = valuesIn.replace(/\]/g, ')');
  valuesIn = valuesIn.replace(/\[/g, '(');
  console.log(JSON.stringify(object).toString());
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      // console.log(`DELETE FROM TBL_CAMPOS WHERE fecha in ${valuesIn} AND rfcusuario = ${rfc} AND claveusr ="${user}"`)
      tx.executeSql("DELETE FROM TBL_CAMPOS WHERE fecha in ".concat(valuesIn, " AND rfcusuario = ? AND claveusr =?"), [rfc, user]);
    }, function (err) {
      reject(err);
    }, function () {
      // console.log('Elimino correctamente')
      resolve();
    });
  });
}

function insertarRandomActividades(queryTxt) {
  // console.log(queryTxt)
  var db = getDatabase();
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql(queryTxt);
    }, function (err) {
      reject(err);
    }, function () {});
  });
}

function deleteRandomActividad(idElemento, objectString) {
  var object = JSON.parse(objectString.replace(/'/g, '"'));
  var elemento = document.getElementById(idElemento); // // console.log(idElemento)

  var db = getDatabase();
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("DELETE FROM TBL_ACTIVIDADES WHERE id_actividad=? AND rfcusuario=? AND claveusr=?", [object.id_actividad, object.rfcusuario, object.claveusr]);
    }, function (err) {
      reject(err);
    }, function () {
      resolve();
    });
  }).then(function () {
    return elemento.remove();
  });
}

function crearAreaEditarRandomActividad(objectString) {
  var object = JSON.parse(objectString.replace(/'/g, '"')); // console.warn(object)

  var btGuardarRandom = document.getElementById('btGuardarRandom');
  var inputActividad = document.getElementById('inputActividad');
  btGuardarRandom.innerHTML = 'ACTUALIZAR'; // btGuardarRandom.setAttribute('onclick', `actualizarRandomActividad("${objectString}")`);

  btGuardarRandom.setAttribute('onclick', "actualizarRandomActividad(" + objectString + ")");
  inputActividad.innerHTML = object.descripcion_actividad;
}

function actualizarRandomActividad(object) {
  // let object = JSON.parse(objectString.replace(/'/g,'"'));
  var db = getDatabase();
  var inputActividad = document.getElementById('inputActividad'); // const messageActRandom = document.getElementById('messageActRandom');

  var btGuardarRandom = document.getElementById('btGuardarRandom');
  var value = inputActividad.textContent;
  return new Promise(function (resolve, reject) {
    if (value !== '') {
      resolve();
    } // messageActRandom.innerHTML = 'La actividad no puede estar vacia'		

  }).then(function () {
    return new Promise(function (resolve, reject) {
      db.transaction(function (tx) {
        tx.executeSql("UPDATE TBL_ACTIVIDADES SET descripcion_actividad = ? WHERE id_actividad= ? AND rfcusuario = ? and claveusr = ?", [value, object.id_actividad, object.rfcusuario, object.claveusr]);
      }, function (err) {
        reject(err);
      }, function () {
        resolve();
      });
    });
  }).then(function () {
    // messageActRandom.innerHTML = '¡Registro actualizado!'		
    inputActividad.innerHTML = '';
    btGuardarRandom.setAttribute('onclick', "guardarDescripcionActividad()");
    btGuardarRandom.innerHTML = 'GUARDAR';
    var element = document.getElementById('randomId-' + object.id_actividad);
    element ? element.innerHTML = value : '';
  });
} // MODULO DE RAN


var marcarFechas = function marcarFechas(array) {
  // console.warn(array)
  var start = 0;
  var end = 0;
  var dias = document.getElementsByClassName('day');
  var searchR = -1;

  for (var i = 0; i < dias.length; i++) {
    if (dias[i].hasAttribute('id')) {
      searchR = dias[i].classList.toString().search(/random-class/g);

      if (searchR >= 0) {
        dias[i].classList.remove('random-class');
        dias[i].style.backgroundColor = 'white';
      }
    }
  }

  var element = null;
  getDatesSegunStatus().then(function (array) {
    array.map(function (day) {
      element = document.getElementById(day.id); // devuelve color anteriormente marcado

      element ? element.style.backgroundColor = day.colorToGroup : false;
    });
    console.log('#1 ', array);
    return;
  }).then(function () {
    var uno = array[0]["default"];
    var dos = array[1]["default"];

    if (uno >= dos) {
      start = array[1];
      end = array[0];
    }

    if (dos >= uno) {
      start = array[0];
      end = array[1];
    } // console.log('#2 ', array)


    start.diaObject = getStringDia(start.dayWeek);
    end.diaObject = getStringDia(end.dayWeek);
    var infoRandomSeleccion = document.getElementById('infoRandomSeleccion');
    var specific = getDiasFestivos();
    var valores = getDatesArray(start["default"], end["default"], {
      daysOfWeek: [0, 6],
      specific: specific
    });
    console.log('#2', valores);
    valores.map(function (_ref) {
      var id = _ref.id,
          value = _ref.value,
          colorToGroup = _ref.colorToGroup,
          full = _ref.full,
          disabled = _ref.disabled,
          month = _ref.month,
          year = _ref.year;

      if (month === 11 && year === 2022) {
        console.log('%s %s', colorToGroup, full);
      }

      if (disabled === false) {
        // id-18-11-2022
        element = document.getElementById(id);

        if (element) {
          element.classList.add('random-class');
          element.style.backgroundColor = '#bb9457'; // element.style.color = 'white';
        } // console.log(colorToGroup)

      }
    });
    infoRandomSeleccion.innerHTML = "<br>\n\t\t<div class=\"item-fecha-s\">\n\t\t\t<div class=\"tle\">INICIO:</div><div class=\"vle\">".concat(start.diaObject.string, " ").concat(start.full, "</div>\n\t\t</div>\n\t\t<div class=\"item-fecha-s\">\n\t\t\t<div class=\"tle\">FIN:</div><div class=\"vle\">").concat(end.diaObject.string, " ").concat(end.full, "</div>\n\t\t</div>\n\t\t");
  }); // options.global.map( day => {
  // 	element = document.getElementById(day.id);
  // 	element ? element.style.backgroundColor = day.colorToGroup : false
  // })
};
"use strict";

function cargaRandomActividades(rfc) {
  var optionsBarFloar = document.getElementById('optionsBarFloar');
  var html = "\n\t\t<button class=\"btn-otros\" onclick=\"htmlDisableDaysCalendar()\">\n\t\t\t<span class=\"material-icons\">free_cancellation</span>\n\t\t</button>\n\t\t<button class=\"btn-otros\" onclick=\"htmlRandomActividades()\">\n\t\t\t<span class=\"material-icons\">shuffle</span>\n\t\t</button>\n\t\t";
  optionsBarFloar.innerHTML = html;
}

var _arrayDates = [];

function htmlRandomActividades() {
  _arrayDates = [];
  var KEY = localStorage.getItem('RFC_KEY');
  var USER_APP = localStorage.getItem('USER_APP');
  var areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
  var areaFechas = document.getElementById('areaFechas');
  var backDates = document.getElementById('backDates'); // mostrarActividadesRegistradas({ rfc: KEY, user: USER_APP})

  if (!backDates) {
    optionsBarFloar.insertAdjacentHTML('afterbegin', "\n\t\t\t<button id=\"backDates\" class=\"btn-otros\" onclick=\"regresaFechasActual()\">\n\t\t\t\t<span class=\"material-icons\">low_priority</span>\n\t\t\t</button>");
  }

  var html = "\n\t\t<div class=\"random-module\">\n\t\t\t<!--HEADER-->\n\t\t\t<div class=\"header-module\"></div>\n\t\t\t<!--HEADER-->\n\t\t\t\t<!--MODULO-->\n\t\t\t<div class=\"container-module\">\n\t\t\t\t<div class=\"calendar-area\">\n\t\t\t\t\t<div class=\"preview-calendar\" id=\"calendar3\"></div>\n\t\t\t\t\t<div class=\"options-calendar\">\n\t\t\t\t\t\t<div class=\"info-group\" id=\"infoRandomSeleccion\"></div>\n\t\t\t\t\t\t<div class=\"buttons-container\">\n\t\t\t\t\t\t\t<button onclick=\"leerArreglo(".concat(JSON.stringify(_arrayDates), ")\">getArray</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<!--ACTIVIDADES-->\n\t\t\t\t<div class=\"actividades-area\">\n\t\t\t\t\t<!--FORM-->\n\t\t\t\t\t<div class=\"formulario\">\n\t\t\t\t\t\t<span \n\t\t\t\t\t\t\tname=\"optActividad\" \n\t\t\t\t\t\t\tonclick=\"counterValues(this.id)\" \n\t\t\t\t\t\t\tclass=\"input-actividad editable\" \n\t\t\t\t\t\t\trole=\"input\" type=\"text\" \n\t\t\t\t\t\t\tdata-placeholder=\"Descripci\xF3n de la actividad\" \n\t\t\t\t\t\t\tid=\"inputActividad\" \n\t\t\t\t\t\t\tcontenteditable>\n\t\t\t\t\t\t</span>\n\t\t\t\t\t\t<button class=\"btn-regular\" onclick=\"guardarDescripcionActividad()\" id=\"btGuardarRandom\">GUARDAR</button>\n\t\t\t\t\t</div>\n\t\t\t\t\t<!--FORM-->\n\n\t\t\t\t\t<!--ACTS-->\n\t\t\t\t\t<div class=\"despliegue-actividades\" id=\"listaActividades\">\n\t\t\t\t\t\t<!--<div class=\"item-act-random\">\n\t\t\t\t\t\t\t<div class=\"agarrate-act\">\n\t\t\t\t\t\t\t\t<div class=\"random-ref\">100</div>\n\t\t\t\t\t\t\t\t<div class=\"description-ref\">\n\t\t\t\t\t\t\t\t\t\xF1kasdasdm asd asd as da dsasd asd a ds\n\t\t\t\t\t\t\t\t\t\xF1kasdasdm asd asd as da dsasd asd a ds\n\t\t\t\t\t\t\t\t\t\xF1kasdasdm asd asd as da dsasd asd a ds\n\t\t\t\t\t\t\t\t\t\xF1kasdasdm asd asd as da dsasd asd a ds\n\t\t\t\t\t\t\t\t\t\xF1kasdasdm asd asd as da dsasd asd a ds\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"options-act-random\">\n\t\t\t\t\t\t\t\t<div class=\"option-act\">\n\t\t\t\t\t\t\t\t\t<span class=\"material-icons\" >edit</span>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div class=\"option-act\">\n\t\t\t\t\t\t\t\t\t<span class=\"material-icons\">delete_forever</span>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>-->\n\n\t\t\t\t\t</div>\n\t\t\t\t\t<!--ACTS-->\n\n\t\t\t\t</div>\n\t\t\t\t<!--ACTIVIDADES-->\n\t\t\t</div>\n\t\t\t\t<!--MODULO-->\n\n\t\t</div>\n\t");
  console.log(areaOtrosRegistros);
  areaOtrosRegistros.innerHTML = html;
  areaOtrosRegistros.style.display = 'flex';
  areaFechas.style.display = 'none';
  var specific = getDiasFestivos();
  var data = {
    mode: 1,
    // mode (0: modal o 1:child)
    // si es child busca propiedad 'parent' con un id del elemento padre
    parentId: 'calendar3',
    format: 'string',
    disable: {
      daysOfWeek: [0, 6],
      // eachMonth:[ { day:21, month:9}, { day:21, month:10} ],
      specific: specific
    },
    sinceTo: _arrayDates // global: globalArray

  };
  getDatesSegunStatus().then(function (array) {
    data.global = array;
    return data;
  }).then(function (object) {
    getCalendario(object);
  });
  mostrarActividadesRegistradas({
    rfc: KEY,
    user: USER_APP
  });
}

var leerArreglo = function leerArreglo() {
  console.warn(_arrayDates);
};
"use strict";

// el evento es escuchado desde cargaRandomActividades() 06.2_random_actividades.js
var htmlDisableDaysCalendar = function htmlDisableDaysCalendar() {
  var KEY = localStorage.getItem('RFC_KEY');
  var USER_APP = localStorage.getItem('USER_APP');
  var areaOtrosRegistros = document.getElementById('areaOtrosRegistros');
  var areaFechas = document.getElementById('areaFechas');
  var backDates = document.getElementById('backDates'); // const globalArray = getDatesSegunStatus();

  var specific = getDiasFestivos(); // console.log('spec 0 ',specific)

  var data = {
    mode: 1,
    // mode (0: modal o 1:child)
    // si es child busca propiedad 'parent' con un id del elemento padre
    parentId: 'parentCalendar',
    format: 'string',
    disable: {
      daysOfWeek: [0, 6],
      // eachMonth:[ { day:21, month:9}, { day:21, month:10} ],
      specific: specific
    } // global: globalArray

  };

  if (!backDates) {
    optionsBarFloar.insertAdjacentHTML('afterbegin', "\n\t\t\t<button id=\"backDates\" class=\"btn-otros\" onclick=\"regresaFechasActual()\">\n\t\t\t\t<span class=\"material-icons\">low_priority</span>\n\t\t\t</button>");
  }

  var html = "\n\t\t<div class=\"title-similares\">\n\t\t\t<div class=\"row-title-similar\">\n\t\t\t\t<div class=\"item-similar\">\n\t\t\t\t\tASIGNAR ESTADO DE FECHAS\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class=\"row-title-similar\">\n\t\t\t\t<div class=\"item-similar\">\n\t\t\t\t\tMarcar d\xEDas seg\xFAn como se cumpli\xF3 o se cumplir\xE1 la jornada laboral\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t\t<div class=\"content-disable\">\n\t\t\t<div class=\"content-area\">\n\t\t\t\t<div class=\"calendar-area\" id=\"parentCalendar\"></div>\t\n\t\t\t\t<div class=\"calendar-options\">\n\t\t\t\t\t\t<div class=\"options-select\">\n\t\t\t\t\t\t\t<div class=\"option\">Marcar c\xF3mo:</div>\n\t\t\t\t\t\t\t<div \n\t\t\t\t\t\t\t\tclass=\"option seleccionable\" \n\t\t\t\t\t\t\t\tvalor=\"null\" \n\t\t\t\t\t\t\t\tname=\"valuesModMarcado\" \n\t\t\t\t\t\t\t\tonclick=\"marcarComo(this, 2)\">\n\t\t\t\t\t\t\t\t\t<div class=\"mark status-vacaciones\" ></div>\n\t\t\t\t\t\t\t\t\tVacaciones\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div \n\t\t\t\t\t\t\t\tclass=\"option seleccionable\" \n\t\t\t\t\t\t\t\tvalor=\"null\" \n\t\t\t\t\t\t\t\tname=\"valuesModMarcado\" \n\t\t\t\t\t\t\t\tonclick=\"marcarComo(this, 1)\">\n\t\t\t\t\t\t\t\t\t<div class=\"mark status-permiso\"></div>\n\t\t\t\t\t\t\t\t\tPermiso\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div \n\t\t\t\t\t\t\t\tclass=\"option seleccionable\" \n\t\t\t\t\t\t\t\tvalor=\"null\" \n\t\t\t\t\t\t\t\tname=\"valuesModMarcado\" \n\t\t\t\t\t\t\t\tonclick=\"marcarComo(this, 3)\">\n\t\t\t\t\t\t\t\t\t<div class=\"mark status-oficina\"></div>\n\t\t\t\t\t\t\t\t\tSe labor\xF3 en oficinas\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div \n\t\t\t\t\t\t\t\tclass=\"option seleccionable\" \n\t\t\t\t\t\t\t\tvalor=\"null\" \n\t\t\t\t\t\t\t\tname=\"valuesModMarcado\" \n\t\t\t\t\t\t\t\tonclick=\"marcarComo(this, 10)\">\n\t\t\t\t\t\t\t\t\t<div class=\"mark\"></div>\n\t\t\t\t\t\t\t\t\tLimpiar\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t</div>\t\n\n\t\t\t</div>\n\t\t\t<div class=\"info-area\"></div>\n\t\t</div>\n\t";
  areaOtrosRegistros.innerHTML = html; // const globalArray = 

  getDatesSegunStatus() // .then( array => console.log(array) )
  .then(function (array) {
    data.global = array;
    return data;
  }).then(function (object) {
    getCalendario(object);
  });
  areaOtrosRegistros.style.display = 'flex';
  areaFechas.style.display = 'none';
};

var marcarComo = function marcarComo(e, value) {
  var color = getColorStatus(value); // switch(value){
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

  var elements = document.getElementsByName('valuesModMarcado');
  var i = 0;

  do {
    elements[i].style.backgroundColor = '';
    elements[i].setAttribute('valor', null);
    i++;
  } while (i < elements.length);

  e.style.backgroundColor = color;
  e.setAttribute('valor', value);
};

var revisarRegistroEnBd = function revisarRegistroEnBd(valorFecha, valorEstado, color) {
  console.log('valor: %s; estado: %s ', valorFecha, valorEstado);
  var db = getDatabase();
  var KEY = localStorage.getItem('RFC_KEY');
  var USER_APP = localStorage.getItem('USER_APP');
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql("SELECT \n\t\t\t\t\tcount(*) cantidad \n\t\t\t\tFROM \n\t\t\t\t\tTBL_CAMPOS \n\t\t\t\tWHERE \n\t\t\t\t\tclaveusr = ? AND rfcusuario = ? AND fecha = ?", [USER_APP, KEY, valorFecha], function (tz, results) {
        resolve(results.rows[0].cantidad > 0 ? true : false);
      });
    }, function (err) {
      return reject(err);
    });
  }).then(function (existe) {
    var query = '';
    var array = existe ? [USER_APP, KEY, valorFecha] : [];
    valorEstado === 10 ? query = 'DELETE FROM TBL_CAMPOS WHERE claveusr = ? AND rfcusuario = ? AND fecha = ?;' : existe ? query = "UPDATE TBL_CAMPOS SET capturado=".concat(valorEstado, " WHERE claveusr = ? AND rfcusuario = ? AND fecha = ?;") : query = "INSERT INTO TBL_CAMPOS VALUES('','','','','','','','','','','','','','','','','','','','',".concat(valorEstado, ",'").concat(valorFecha, "','").concat(KEY, "','").concat(USER_APP, "');");
    valorEstado === 10 ? existe ? query = "DELETE FROM TBL_CAMPOS WHERE claveusr = ? AND rfcusuario = ? AND fecha = ?;" : query = '' : '';
    return {
      query: query,
      array: array
    };
  }).then(function (_ref) {
    var query = _ref.query,
        array = _ref.array;

    if (query !== '') {
      return new Promise(function (resolve, reject) {
        db.transaction(function (tx) {
          tx.executeSql(query, array);
        }, function (err) {
          return reject(err);
        }, function () {
          return resolve();
        });
      }).then(function () {
        var element = document.getElementById("itemFechaReg-".concat(valorFecha));
        element ? element.style.backgroundColor = valorEstado === 10 ? '#ff002b' : color : ''; // console.log(element)

        return getInicioHomeOffice().then(function (inicio) {
          return actualizarCantidades(inicio, KEY);
        });
      });
    }

    return Promise.resolve();
  });
};

var getInicioHomeOffice = function getInicioHomeOffice() {
  var KEY = localStorage.getItem('RFC_KEY');
  var USER_APP = localStorage.getItem('USER_APP');
  var db = getDatabase();
  return new Promise(function (resolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql('SELECT inicio_homeoff FROM TBL_USUARIO WHERE rfc_usuario = ? AND claveusr = ?', [KEY, USER_APP], function (tx, results) {
        resolve(results.rows[0].inicio_homeoff);
      });
    }, function (err) {
      return reject(err);
    });
  });
};

var getDatesSegunStatus = function getDatesSegunStatus() {
  var KEY = localStorage.getItem('RFC_KEY');
  var USER_APP = localStorage.getItem('USER_APP');
  var db = getDatabase();
  return new Promise(function (queryResolve, reject) {
    db.transaction(function (tx) {
      tx.executeSql('SELECT fecha, capturado FROM TBL_CAMPOS WHERE rfcusuario = ? AND claveusr = ?', [KEY, USER_APP], function (tx, results) {
        var object = Object.keys(results.rows);

        if (object.length > 0) {
          return new Promise(function (resolve, reject) {
            var counter = 1;

            var _loop = function _loop(i, _promise) {
              _promise = _promise.then(function () {
                var key = object[i];
                var split = results.rows[key].fecha.split('-');
                var dateObject = getJsonDate(new Date(split[2], split[1] - 1, split[0]));
                dateObject.colorToGroup = getColorStatus(results.rows[key].capturado);
                object[i] = dateObject;
              }).then(function () {
                return counter++;
              }).then(function (cnt) {
                return cnt === object.length ? resolve(object) : '';
              });
              promise = _promise;
            };

            for (var i = 0, promise = Promise.resolve(); i < object.length; i++) {
              _loop(i, promise);
            }
          }).then(function (array) {
            return queryResolve(array);
          });
        }

        queryResolve([]);
      });
    }, function (err) {
      return reject(err);
    });
  });
};

var getColorStatus = function getColorStatus(capturado) {
  var color = '';

  switch (capturado) {
    case 0:
      color = '#80b918';
      break;

    case 1:
      color = '#779be7';
      break;

    case 2:
      color = '#588b8b';
      break;

    case 3:
      color = '#ffd000';
      break;
    // caso especifico marcado de días eliminar

    case 10:
      color = '#adb5bd';
      break;
  }

  return color;
};
"use strict";

function crearCalendario(inpIdName, day, month, year) {
  // const divDateContent = document.getElementById('divDateContent');
  var inputDateValue = document.getElementById(inpIdName);
  var hoyDate = new Date(); // Hago split a cadena para obtener dd-mm-aaaa y acceder medianta objeto

  var date = inputDateValue.value.split('-');
  var respuesta = false;
  var hoy = '',
      marcadoInput = '',
      i = 0;
  return new Promise(function (resolve, reject) {
    respuesta = openModal();

    if (respuesta) {
      resolve();
    }
  }).then(function () {
    return new Promise(function (resolve, reject) {
      var primerDiaDelMes = '',
          ultimoDiaDelMes = '',
          diaArray = '';
      console.log('Que estoy haciendo?');

      if (day) {
        // ULTIMO DIA DEL MES
        ultimoDiaDelMes = new Date(year, month, 0);
        day = ultimoDiaDelMes.getDate();
        month = ultimoDiaDelMes.getMonth() + 1;
        year = ultimoDiaDelMes.getFullYear();
        ultimoDiaDelMes = ultimoDiaDelMes.getDate(); // PRIMER DIA DEL MES

        primerDiaDelMes = new Date(year, month - 1, 1);
        primerDiaDelMes = primerDiaDelMes.getDay();
        console.log('--> Navegando entre calendario');
      } else {
        // console.warn('ABRIENDO FECHA')
        if (inputDateValue.value != '') {
          day = date[0];
          month = date[1];
          year = date[2]; // ULTIMO DIA DEL MES

          ultimoDiaDelMes = new Date(year, month, 0);
          ultimoDiaDelMes = ultimoDiaDelMes.getDate(); // PRIMER DIA DEL MES

          primerDiaDelMes = new Date(year, month - 1, 1);
          primerDiaDelMes = primerDiaDelMes.getDay();
          console.log('--> Abriendo calendario con fecha de input');
        } else {
          day = hoyDate.getDate();
          month = hoyDate.getMonth() + 1;
          year = hoyDate.getFullYear(); // ULTIMO DIA DEL MES

          ultimoDiaDelMes = new Date(year, month, 0);
          ultimoDiaDelMes = ultimoDiaDelMes.getDate(); // PRIMER DIA DEL MES

          primerDiaDelMes = new Date(year, month - 1, 1);
          primerDiaDelMes = primerDiaDelMes.getDay();
          console.log('--> Abriendo calendario con el día de hoy');
        }
      }

      resolve({
        day: day,
        month: month,
        year: year,
        ultimoDiaDelMes: ultimoDiaDelMes,
        primerDiaDelMes: primerDiaDelMes
      });
    });
  }).then(function (result) {
    console.log(result);
    var html = '',
        semana = 0,
        diasCont = 0,
        diaFormat = '';
    var divDateContent = document.getElementById('divDateContent');
    diaFormat = "".concat(result.day, "-").concat(regresaTextoCero(result.month), "-").concat(result.year);
    diaFormat = obtenFecha(diaFormat, false);
    console.log(diaFormat);
    html = "\n\t\t\t<div class=\"container-calendario\">\n\t\t\t\t<div class=\"calendario-options\">\n\t\t\t\t\t<div class=\"nav-option\" onclick=\"mesAnterior('".concat(inpIdName, "',").concat(result.day, ",").concat(result.month, ",").concat(result.year, ")\"><</div>\n\t\t\t\t\t<div class=\"nav-title\">").concat(diaFormat, "</div>\n\t\t\t\t\t<div class=\"nav-option\" onclick=\"mesPosterior('").concat(inpIdName, "',").concat(result.day, ",").concat(result.month, ",").concat(result.year, ")\">></div>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"row-days\">\n\t\t\t\t\t<div class=\"item-day\">do.</div>\n\t\t\t\t\t<div class=\"item-day\">lu.</div>\n\t\t\t\t\t<div class=\"item-day\">ma.</div>\n\t\t\t\t\t<div class=\"item-day\">mi.</div>\n\t\t\t\t\t<div class=\"item-day\">ju.</div>\n\t\t\t\t\t<div class=\"item-day\">vi.</div>\n\t\t\t\t\t<div class=\"item-day\">s\xE1.</div>\n\t\t\t\t</div>\n\t\t");
    i = 0;

    do {
      if (diasCont == 7) {
        html += '</div>';
        diasCont = 0;
      }

      if (diasCont == 0) {
        semana++;
        html += '<div class="row-days">';
      }

      if (diasCont == 6 || diasCont == 0) {
        // CARGO EL FIN DE SEMANA, DESHABILITANDOLOS
        html += "<div class=\"item-day day status-disabled\" id=\"div-".concat(i, "\" onclick=\"seleccionarDia(this.id, '").concat(inpIdName, "', ").concat(result.month, ", ").concat(result.year, ")\"></div>");
      } else {
        // CARGO DIAS NORMALES, DESHABILITANDOLOS
        html += "<div class=\"mes-".concat(month, " item-day day\" id=\"div-").concat(i, "\" onclick=\"seleccionarDia(this.id, '").concat(inpIdName, "',").concat(result.month, ", ").concat(result.year, ")\"></div>");
      }

      diasCont++;
      i++;
    } while (i < 42); // console.log(html);


    html += '</div></div>'; // console.log(divDateContent)

    divDateContent.innerHTML = html;
    return result;
  }).then(function (result) {
    var selectedDay = '',
        itemDay = '',
        contador = 0,
        marcadoInput = 0; // AHORA A CARGAR LOS VALORES DE LOS INPUTS
    // console.warn(result)
    // Si el mes y año corresponden a el de el dia de hoy, asigno valor al dia seleccionado

    if (result.month == hoyDate.getMonth() + 1 && result.year == hoyDate.getFullYear()) {
      selectedDay = hoyDate.getDate();
    } // Selecciono el valor a marcar del input donde almaceno el valor del dia seleccionado


    if (inputDateValue.value != '') {
      // console.log(`{${date[1]}}{${date[2]}}--[${result.month}] [${result.year}]`)
      if (result.month == date[1] && result.year == date[2]) {
        marcadoInput = date[0];
      }
    }

    i = 0;
    contador = 1;

    do {
      // elemento del html
      itemDay = document.getElementById("div-".concat(i)); // marcando el borde del dia de hoy 

      if (contador == selectedDay) {
        console.warn('Marcar borde en el dia de hoy: ' + selectedDay + ' ' + result.month + ' ' + result.year);
        itemDay.style = 'border: 2px solid rgba(0, 0, 0, .2);';
      } // Marco el background del dia seleccionado en input


      if (marcadoInput == contador) {
        console.log('Marcando día seleccionado en fecha: ' + contador);
        itemDay.style = 'background:#7dcd85;';
      } // Si el dia que es el contador es mayor a uno y menor que el ultimo dia del mes


      if (contador > 1 && contador <= result.ultimoDiaDelMes) {
        itemDay.innerHTML = contador;
        contador++;
      } else if (result.primerDiaDelMes == i) {
        // si el dia de semana del array corresponde al primer dia en el que inicia el mes [0,1,2,3,4,5,6] == 0-7 del div del calendario
        // Agrego el nuemero del día
        itemDay.innerHTML = contador;
        contador++;
      } else {
        // 	// Deshabilito días vacios
        itemDay.style = 'pointer-events: none; background: #FFFF;';
      }

      i++;
    } while (i < 42);

    return result;
  }).then(function (date) {
    // Deshabilitando dias del mes en el que estoy
    // console.warn(date)
    deshabilitarDiasMes(date.month, date.year);
  });
}

function mesAnterior(inpIdName, day, month, year) {
  if (month == 1) {
    month = 12;
    year = year - 1;
  } else {
    month = month - 1;
  }

  crearCalendario(inpIdName, day, month, year);
}

function mesPosterior(inpIdName, day, month, year) {
  if (month == 12) {
    month = 1;
    year = year + 1;
  } else {
    month = month + 1;
  }

  crearCalendario(inpIdName, day, month, year);
}

function deshabilitarDiasMes(mes, year) {
  console.log('Deshabilitar dias del mes: ' + mes + ' ?');
  var diasMes = document.getElementsByClassName('day');
  var festivos = getDiasFestivos();
  var i = 0,
      diaCalendario = 0,
      spliting = '';

  do {
    spliting = diasMes[i].classList[0].split('-');

    if (spliting[0] == 'mes') {
      festivos.forEach(function (item) {
        if (item.mes == spliting[1] && item.year == year) {
          diaCalendario = document.getElementById("div-".concat(i));

          if (diaCalendario.textContent == item.dia) {
            diaCalendario.classList.add('status-disabled');
            console.log('Se deshabilito: ' + item.dia + ' del mes ' + mes);
          }
        }
      });
    }

    i++;
  } while (i < diasMes.length);
}

function getDiasFestivos() {
  var festivos = [//2022 
  {
    day: 1,
    month: 1,
    dia: 1,
    mes: 1,
    year: 2022
  }, {
    day: 7,
    month: 2,
    dia: 7,
    mes: 2,
    year: 2022
  }, {
    day: 21,
    month: 3,
    dia: 21,
    mes: 3,
    year: 2022
  }, {
    day: 14,
    month: 4,
    dia: 14,
    mes: 4,
    year: 2022
  }, {
    day: 15,
    month: 4,
    dia: 15,
    mes: 4,
    year: 2022
  }, {
    day: 1,
    month: 5,
    dia: 1,
    mes: 5,
    year: 2022
  }, {
    day: 5,
    month: 5,
    dia: 5,
    mes: 5,
    year: 2022
  }, {
    day: 8,
    month: 7,
    dia: 8,
    mes: 7,
    year: 2022
  }, {
    day: 16,
    month: 9,
    dia: 16,
    mes: 9,
    year: 2022
  }, {
    day: 2,
    month: 11,
    dia: 2,
    mes: 11,
    year: 2022
  }, {
    day: 21,
    month: 11,
    dia: 21,
    mes: 11,
    year: 2022
  }, {
    day: 25,
    month: 12,
    dia: 25,
    mes: 12,
    year: 2022
  }, //2022
  //2021 
  {
    day: 1,
    month: 1,
    dia: 1,
    mes: 1,
    year: 2021
  }, {
    day: 1,
    month: 2,
    dia: 1,
    mes: 2,
    year: 2021
  }, {
    day: 15,
    month: 3,
    dia: 15,
    mes: 3,
    year: 2021
  }, {
    day: 1,
    month: 4,
    dia: 1,
    mes: 4,
    year: 2021
  }, {
    day: 2,
    month: 4,
    dia: 2,
    mes: 4,
    year: 2021
  }, {
    day: 1,
    month: 5,
    dia: 1,
    mes: 5,
    year: 2021
  }, {
    day: 5,
    month: 5,
    dia: 5,
    mes: 5,
    year: 2021
  }, {
    day: 8,
    month: 7,
    dia: 8,
    mes: 7,
    year: 2021
  }, {
    day: 16,
    month: 9,
    dia: 16,
    mes: 9,
    year: 2021
  }, {
    day: 2,
    month: 11,
    dia: 2,
    mes: 11,
    year: 2021
  }, {
    day: 15,
    month: 11,
    dia: 15,
    mes: 11,
    year: 2021
  }, {
    day: 25,
    month: 12,
    dia: 25,
    mes: 12,
    year: 2021
  }, //2021
  //2020 
  {
    day: 1,
    month: 1,
    dia: 1,
    mes: 1,
    year: 2020
  }, {
    day: 3,
    month: 2,
    dia: 3,
    mes: 2,
    year: 2020
  }, {
    day: 16,
    month: 3,
    dia: 16,
    mes: 3,
    year: 2020
  }, {
    day: 9,
    month: 4,
    dia: 9,
    mes: 4,
    year: 2020
  }, {
    day: 10,
    month: 4,
    dia: 10,
    mes: 4,
    year: 2020
  }, {
    day: 1,
    month: 5,
    dia: 1,
    mes: 5,
    year: 2020
  }, {
    day: 5,
    month: 5,
    dia: 5,
    mes: 5,
    year: 2020
  }, {
    day: 8,
    month: 7,
    dia: 8,
    mes: 7,
    year: 2020
  }, {
    day: 16,
    month: 9,
    dia: 16,
    mes: 9,
    year: 2020
  }, {
    day: 2,
    month: 11,
    dia: 2,
    mes: 11,
    year: 2020
  }, {
    day: 16,
    month: 11,
    dia: 16,
    mes: 11,
    year: 2020
  }, {
    day: 25,
    month: 12,
    dia: 25,
    mes: 12,
    year: 2020
  }, //2020
  //2019 
  {
    day: 1,
    month: 1,
    dia: 1,
    mes: 1,
    year: 2019
  }, {
    day: 4,
    month: 2,
    dia: 4,
    mes: 2,
    year: 2019
  }, {
    day: 18,
    month: 3,
    dia: 18,
    mes: 3,
    year: 2019
  }, {
    day: 18,
    month: 4,
    dia: 18,
    mes: 4,
    year: 2019
  }, {
    day: 19,
    month: 4,
    dia: 19,
    mes: 4,
    year: 2019
  }, {
    day: 1,
    month: 5,
    dia: 1,
    mes: 5,
    year: 2019
  }, {
    day: 5,
    month: 5,
    dia: 5,
    mes: 5,
    year: 2019
  }, {
    day: 8,
    month: 7,
    dia: 8,
    mes: 7,
    year: 2019
  }, {
    day: 16,
    month: 9,
    dia: 16,
    mes: 9,
    year: 2019
  }, {
    day: 2,
    month: 11,
    dia: 2,
    mes: 11,
    year: 2019
  }, {
    day: 18,
    month: 11,
    dia: 18,
    mes: 11,
    year: 2019
  }, {
    day: 25,
    month: 12,
    dia: 25,
    mes: 12,
    year: 2019
  } //2019 
  ];
  return festivos;
}

function obtenFecha(date, completa) {
  // console.log('obtenter texto fecha: ' + date + ' completa: ' + completa)
  date = date.split('-');
  var day = date[0];
  var month = date[1];
  var year = date[2];
  var mesText = '';

  switch (month) {
    case '01':
      mesText = 'Enero';
      break;

    case '02':
      mesText = 'Febrero';
      break;

    case '03':
      mesText = 'Marzo';
      break;

    case '04':
      mesText = 'Abril';
      break;

    case '05':
      mesText = 'Mayo';
      break;

    case '06':
      mesText = 'Junio';
      break;

    case '07':
      mesText = 'Julio';
      break;

    case '08':
      mesText = 'Agosto';
      break;

    case '09':
      mesText = 'Septiembre';
      break;

    case '10':
      mesText = 'Octubre';
      break;

    case '11':
      mesText = 'Noviembre';
      break;

    case '12':
      mesText = 'Diciembre';
      break;
  }

  if (completa) {
    //regresa fecha completa
    return "".concat(day, " de ").concat(mesText, " del ").concat(year);
  } else {
    // solo mes y año
    console.log('Regresando: ' + "".concat(mesText, " ").concat(year));
    return "".concat(mesText, " ").concat(year);
  }
}

function seleccionarDia(idFecha, input, month, year) {
  // Poner fecha seleccionada dentro de input
  // console.warn('Obtener dato de: ' + idFecha + ' en ' + input);
  var divFecha = document.getElementById(idFecha);
  var inpRespuesta = document.getElementById(input);
  var fechaReturn = regresaTextoCero(divFecha.textContent);
  fechaReturn = fechaReturn + '-';
  fechaReturn += regresaTextoCero(month) + '-';
  fechaReturn += year;
  inpRespuesta.value = fechaReturn;
  console.log('Se agrego valor a input con id: ' + input); // ejecuto evento onchange para activar funcionalidad que existe dentro del input

  inpRespuesta.onchange();
  closeModal();
} // Regresa texto antes de numero si es menor a 10


function regresaTextoCero(numero) {
  numero = parseInt(numero); // console.log('Numero parseado: ' + numero)

  if (numero < 10) {
    return '0' + numero;
  } else {
    return numero;
  }
}

function closeModal() {
  var modales = document.getElementById('modales');
  modales.style = 'background: rgba(0, 0, 0, 0.1)';
  modales.classList.remove('modulo-modal');
  modales.classList.remove('modulo-modal-1');
  modales.innerHTML = '';
}

function openModal() {
  var modales = document.getElementById('modales');
  modales.classList.add('modulo-modal');
  modales.innerHTML = '<div id="divDateContent" class="modal-fecha"></div>';
  console.log('Cargando modal');
  return true;
}
"use strict";

var getCalendario = function getCalendario(options, slideElement) {
  // array para guardar errores
  var error = []; // modo que se presentará el calendario

  var mode = options.mode ? options.mode : 0; // busqueda de elemento input

  var element = document.getElementById(options.idInput);
  console.log('presentando como: ', mode === 0 ? 'body modal' : 'child element'); // parent

  var parent = ''; // el contenedor

  var container = null; // checar formato

  var formato = ''; // VALIDACIONES

  if (mode === 0) {
    parent = document.body;
    element ? true : error.push("Propiedad \"idInput\" con valor \"".concat(options.idInput, "\" no existe en la pantalla."));
  } else {
    parent = options.parentId ? document.getElementById(options.parentId) ? document.getElementById(options.parentId) : error.push("Elemento padre con #id \"".concat(options.parentId, "\" no existe en el documento.")) : error.push("Es requerida la propiedad \"parentId\" del elemento padre donde se mostrar\xE1 el calendario.");
  } // VALIDACIONES
  // obteniendo el formato


  options.format ? options.format.search(/string|-|\//g) >= 0 ? formato = options.format.match(/string|-|\//g)[0] : formato = '-' : formato = '-';

  if (error.length > 0) {
    return Promise.reject(error.toString());
  }

  console.log(parent);
  container = document.getElementById('container'); // cargale el calendario

  return Promise.resolve(container ? false : parent.insertAdjacentHTML('afterbegin', "\n\t\t<div class=\"calendar-container\" id=\"container\">\n\t\t\t<div class=\"calendar\" id=\"calendar\"></div>\n\t\t</div>\n\t")).then(function () {
    container = document.getElementById('container');

    if (mode === 0) {
      container.addEventListener('click', function (e) {
        e.target.classList[0] == 'calendar-container' ? closeCalendario(container) : false;
      });
    } else {
      container.style.position = 'static';
    }
  }).then(function () {
    return slideElement ? getJsonDate(slideElement) : element ? element.value ? createDateObject(element.getAttribute('calendarKey')) : getJsonDate(new Date()) : getJsonDate(new Date());
  }).then(function (fecha) {
    console.log('-->', fecha);
    var calendar = document.getElementById('calendar');
    var primerFechaMes = getJsonDate(new Date(fecha.year, fecha.month - 1, 1));
    var ultimoFechaMes = getJsonDate(new Date(fecha.year, fecha.month, 0));
    var fechaHoy = getJsonDate(new Date());
    var mesSiguiente = '',
        mesAnterior = '',
        mesActual = '',
        diaSeleccionado = '',
        html = '';
    html = "\n      <div class=\"row-calendar desc-row\">\n        <div class=\"opt-despla\" id=\"mesAnterior\"><</div>\n        <div class=\"description\">".concat(fecha.monthYear, "</div>\n        <div class=\"opt-despla\" id=\"mesSiguiente\">></div>\n      </div>\n      <div class=\"days-row\">\n        <div class=\"day\">do.</div>\n        <div class=\"day\">lu.</div>\n        <div class=\"day\">ma.</div>\n        <div class=\"day\">mi.</div>\n        <div class=\"day\">ju.</div>\n        <div class=\"day\">vi.</div>\n        <div class=\"day\">s\xE1.</div>\n      </div>\n    ");
    var j = 0,
        contador = 0,
        dia = 0,
        idDia = 0,
        todayMarked = '',
        irAHoy = "".concat(fecha.month, "-").concat(fecha.year);
    var option = '',
        selectedDay = '',
        disable = '',
        clases = [],
        estado = false,
        dateObjectValue = '';

    for (var i = 0; i < 6; i++) {
      html += "<div class=\"row-calendar\">";

      for (j = 0; j < 7; j++) {
        contador == primerFechaMes.dayWeek ? dia = 1 : '';

        if (dia > 0 && dia <= ultimoFechaMes.dayMonth) {
          estado = false;
          estado = options.disable ? statusDayChecker(options.disable, {
            day: dia,
            month: fecha.month,
            year: fecha.year,
            dayWeek: j
          }) : false;
          idDia = "id-".concat(dia, "-").concat(fecha.month, "-").concat(fecha.year);
          dateObjectValue = "".concat(fecha.year, ",").concat(fecha.month, ",").concat(dia); // marcar el día de hoy

          idDia == fechaHoy.id ? todayMarked = 'day-marked' : todayMarked = ''; // marcar el dia seleccionado en input

          element ? element.value !== '' ? element.getAttribute('calendarKey') == idDia ? selectedDay = 'day-selected' : selectedDay = '' : selectedDay = '' : false;
          estado ? disable = 'day-disabled' : disable = '';
          clases = ['day', todayMarked, selectedDay, disable];
          html += "<div class=\"".concat(clases.toString().replace(/\,/g, ' '), "\" dateDefault=\"").concat(dateObjectValue, "\" id=\"").concat(idDia, "\" name=\"diaSeleccionable\">").concat(dia, "</div>");
          dia++;
        } else {
          html += "<div class=\"day day-hidden\"></div>";
        }

        contador++;
      }

      html += "</div>";
    }

    option = "<div class=\"today\"></div>";

    if (irAHoy !== "".concat(fechaHoy.month, "-").concat(fechaHoy.year)) {
      option = "<div class=\"today\" id=\"mesActual\">Hoy: ".concat(fechaHoy.full, "</div>");
    }

    html += "<div class=\"days-row\">".concat(option, "</div>");
    calendar.innerHTML = html; // activando eventos

    mesAnterior = document.getElementById('mesAnterior');
    mesSiguiente = document.getElementById('mesSiguiente');
    mesActual = document.getElementById('mesActual');
    diaSeleccionado = document.getElementsByName('diaSeleccionable');

    mesAnterior.onclick = function () {
      return slideTo(options, false, fecha["default"]);
    };

    mesSiguiente.onclick = function () {
      return slideTo(options, true, fecha["default"]);
    };

    mesActual ? mesActual.onclick = function () {
      return slideTo(options, null, fechaHoy["default"]);
    } : false;

    if (options.mode === 0) {
      var _loop = function _loop(_i) {
        diaSeleccionado[_i].onclick = function () {
          return getValueOfDay(diaSeleccionado[_i].id, options.idInput, formato).then(closeCalendario(container));
        };
      };

      for (var _i = 0; _i < diaSeleccionado.length; _i++) {
        _loop(_i);
      }
    } else {
      (function () {
        var fechaFinal = '',
            result = '',
            estado = false; // const elements = document.getElementsByName('valuesModMarcado');

        var _loop2 = function _loop2(_i2) {
          diaSeleccionado[_i2].onclick = function () {
            estado = getValueToMarker();

            if (estado) {
              console.log(estado);
              fechaFinal = new Date(diaSeleccionado[_i2].getAttribute('dateDefault'));
              fechaFinal = getJsonDate(fechaFinal);
              /*actualizar desde la base de datos*/

              return revisarRegistroEnBd(fechaFinal.value, estado.valor, estado.color).then(function () {
                console.log('---------------------'); // fechaFinal.queryToUpdate = hayRegistros;

                fechaFinal.valueToDb = estado.valor;
                fechaFinal.colorToGroup = estado.color;
                document.getElementById(fechaFinal.id).style.backgroundColor = estado.color;
                result = options.global.some(function (e) {
                  if (e.valueReverse === fechaFinal.valueReverse) {
                    e.valueToDb = estado.valor;
                    e.colorToGroup = estado.color;
                    return true;
                  }

                  return false;
                });
                result ? false : options.global.push(fechaFinal);
              });
            }
          }; // calendario de random


          if (options.parentId === 'calendar3') {
            diaSeleccionado[_i2].onclick = function () {
              fechaFinal = new Date(diaSeleccionado[_i2].getAttribute('dateDefault'));
              fechaFinal = getJsonDate(fechaFinal);

              diaSeleccionado[_i2].classList.add('random-class');

              diaSeleccionado[_i2].style.backgroundColor = '#bb9457';

              if (options.sinceTo.length === 2) {
                options.sinceTo.shift();
                options.sinceTo.push(fechaFinal);
              } else {
                options.sinceTo.push(fechaFinal);
              }

              if (options.sinceTo.length === 2) {
                marcarFechas(options.sinceTo);
              }
            };
          }
        };

        for (var _i2 = 0; _i2 < diaSeleccionado.length; _i2++) {
          _loop2(_i2);
        }

        var element = false; // console.log(options.global)

        options.global.map(function (day) {
          element = document.getElementById(day.id);
          element ? element.style.backgroundColor = day.colorToGroup : false;
        });

        if (options.parentId === 'calendar3' && options.sinceTo.length === 2) {
          marcarFechas(options.sinceTo);
        }
      })();
    }
  });
};

var getValueToMarker = function getValueToMarker() {
  var elements = document.getElementsByName('valuesModMarcado');
  var i = 0;
  var atributo = null;
  var valor = null;

  do {
    atributo = elements[i] ? elements[i].getAttribute('valor') : null;

    if (atributo !== 'null') {
      valor = atributo;
    }

    i++;
  } while (i < elements.length);

  var color = '';
  valor = parseInt(valor);

  if (valor > 0) {
    if (valor === 1) {
      color = '#779be7';
    }

    if (valor === 2) {
      color = '#588b8b';
    }

    if (valor === 3) {
      color = '#ffd000';
    }

    if (valor === 10) {
      color = 'transparent';
    }

    return {
      valor: valor,
      color: color
    };
  }

  return false;
};

var searchDistinct = function searchDistinct(nameParam, jsonData) {
  var lookup = {};
  var result = [];
  var name = '';

  for (var item, i = 0; item = jsonData[i++];) {
    name = item.properties[nameParam];

    if (!(name in lookup)) {
      lookup[name] = 1;
      result.push(name);
    }
  }

  if (result.length == 1) {
    if (result[0] === undefined) {
      result = [];
    }
  }

  return result;
};

var statusDayChecker = function statusDayChecker(disable, dayJson) {
  var stringValue = '',
      i = 0;

  if (disable.daysOfWeek) {
    if (disable.daysOfWeek.toString().search(dayJson.dayWeek) >= 0) {
      return true;
    }
  }

  if (disable.eachDay) {
    i = 0;

    do {
      if (disable.eachDay[i] === dayJson.day) {
        return true;
      }

      i++;
    } while (i < disable.eachDay.length);
  }

  if (disable.eachMonth) {
    i = 0;

    do {
      if (disable.eachMonth[i].day == dayJson.day && disable.eachMonth[i].month == dayJson.month) {
        return true;
      }

      i++;
    } while (i < disable.eachMonth.length);
  }

  if (disable.specific) {
    i = 0;

    do {
      if (disable.specific[i].day === dayJson.day && disable.specific[i].month === dayJson.month && disable.specific[i].year === dayJson.year) {
        return true;
      }

      i++;
    } while (i < disable.specific.length);
  }
};

var getDatesArray = function getDatesArray(fechaInicio, fechaFin, disable) {
  console.log(disable);
  var count = 0;
  var fechaHoy = new Date();

  if (disable) {
    disable.daysOfWeek ? count = 1 : false;
    disable.eachDay ? count = 1 : false;
    disable.eachMonth ? count = 1 : false;
    disable.specific ? count = 1 : false;
  }

  var actualDate = getJsonDate(fechaFin);
  var actualYear = actualDate.year,
      actualMonth = actualDate.month,
      actualDay = actualDate.dayMonth;
  var startDate = getJsonDate(fechaInicio);
  var startYear = startDate.year,
      startMonth = startDate.month,
      startDay = startDate.dayMonth;
  var startMonthEnd = new Date(startDate.year, startDate.month, 0);
  var finalArray = [];
  var yearBucle = startYear;
  var countYears = actualYear - startYear;
  var i = 0,
      j = 0,
      k = 0,
      finMes = 0,
      fechaFinal = 0,
      estado = false;
  countYears = countYears > 0 ? countYears + 1 : countYears = 1;

  do {
    j = 0;

    do {
      finMes = new Date(yearBucle, j + 1, 0);
      k = 1;

      do {
        fechaFinal = getJsonDate(new Date(yearBucle, j, k));

        if (startDate["default"] <= fechaFinal["default"] && actualDate["default"] >= fechaFinal["default"]) {
          estado = false;

          if (count === 1) {
            estado = statusDayChecker(disable, {
              day: fechaFinal.dayMonth,
              month: fechaFinal.month,
              year: fechaFinal.year,
              dayWeek: fechaFinal.dayWeek
            });
          } // console.log(estado)
          // delete fechaFinal.id;


          estado ? fechaFinal.disabled = true : fechaFinal.disabled = false;
          finalArray.push(fechaFinal);
        }

        k++;
      } while (k <= finMes.getDate());

      j++;
    } while (j < 12);

    yearBucle++;
    i++;
  } while (i < countYears);

  return finalArray;
};

var createDateObject = function createDateObject(idDay) {
  var date = idDay.replace('id-', '');
  date = date.split('-');
  var dia = date[0],
      mes = date[1] - 1,
      year = date[2],
      save = '';
  var valor = new Date(year, mes, dia);
  return getJsonDate(valor);
};

var getValueOfDay = function getValueOfDay(idDay, idInput, formato) {
  var input = document.getElementById(idInput);
  var jsonDate = createDateObject(idDay);
  var save = jsonDate.value;

  switch (formato) {
    case '/':
      save = jsonDate.diag;
      break;

    case 'string':
      save = jsonDate.full;
      break;
  }

  input.setAttribute('calendarKey', jsonDate.id);
  delete jsonDate.id;
  input.setAttribute('calendarValue', JSON.stringify(jsonDate));
  return Promise.resolve(input.value = save);
};

var getJsonDate = function getJsonDate(objectDate) {
  var object = {};
  var day = 0,
      month = 0;
  object.dayMonth = objectDate.getDate();
  object.month = objectDate.getMonth() + 1;
  object.year = objectDate.getFullYear();
  object.dayWeek = objectDate.getDay();
  day = object.dayMonth < 10 ? "0".concat(object.dayMonth) : object.dayMonth;
  month = object.month < 10 ? "0".concat(object.month) : object.month;
  object.full = "".concat(day, " de ").concat(getStringMonth(object.month).mes, " ").concat(object.year);
  object.monthYear = "".concat(getStringMonth(object.month).mes, " ").concat(object.year);
  object.value = "".concat(day, "-").concat(month, "-").concat(object.year);
  object.valueReverse = "".concat(object.year, "-").concat(month, "-").concat(day);
  object.diag = "".concat(day, "/").concat(month, "/").concat(object.year);
  object.diagReverse = "".concat(object.year, "/").concat(month, "/").concat(day);
  object["default"] = objectDate;
  object.id = "id-".concat(object.dayMonth, "-").concat(object.month, "-").concat(object.year); // object.dia = getStringDia(object.dayWeek)

  return object;
}; // Falta implementar


var getStringDia = function getStringDia(dayWeek) {
  var dias = [{
    id: 0,
    nem: 'Do.',
    string: 'Domingo'
  }, {
    id: 1,
    nem: 'Lu.',
    string: 'Lunes'
  }, {
    id: 2,
    nem: 'Ma.',
    string: 'Martes'
  }, {
    id: 3,
    nem: 'Mi.',
    string: 'Miércoles'
  }, {
    id: 4,
    nem: 'Ju.',
    string: 'Jueves'
  }, {
    id: 5,
    nem: 'Vi.',
    string: 'Viernes'
  }, {
    id: 6,
    nem: 'Sá.',
    string: 'Sábado'
  }];
  var i = 0,
      resultado = 0;

  do {
    if (dayWeek == dias[i].id) {
      return dias[i];
    }

    i++;
  } while (i < dias.length);
};

var getStringMonth = function getStringMonth(month) {
  var meses = [{
    id: 1,
    mes: 'Enero'
  }, {
    id: 2,
    mes: 'Febrero'
  }, {
    id: 3,
    mes: 'Marzo'
  }, {
    id: 4,
    mes: 'Abril'
  }, {
    id: 5,
    mes: 'Mayo'
  }, {
    id: 6,
    mes: 'Junio'
  }, {
    id: 7,
    mes: 'Julio'
  }, {
    id: 8,
    mes: 'Agosto'
  }, {
    id: 9,
    mes: 'Septiembre'
  }, {
    id: 10,
    mes: 'Octubre'
  }, {
    id: 11,
    mes: 'Noviembre'
  }, {
    id: 12,
    mes: 'Diciembre'
  }];
  var i = 0,
      resultado = 0;

  do {
    if (month == meses[i].id) {
      return meses[i];
    }

    i++;
  } while (i < meses.length);
};

var slideTo = function slideTo(options, suma, param) {
  var fecha = new Date(param);
  var month = fecha.getMonth(),
      year = fecha.getFullYear(); // null no slide

  if (suma === null) {
    return getCalendario(options, new Date(param));
  }

  if (suma) {
    if (month == 11) {
      month = 0;
      year = year + 1;
    } else {
      month = month + 1;
    }
  } else {
    if (month == 0) {
      month = 11;
      year = year - 1;
    } else {
      month = month - 1;
    }
  }

  return getCalendario(options, new Date(year, month));
};

var closeCalendario = function closeCalendario(element) {
  element.remove();
};

var getValueFromInput = function getValueFromInput(idInput) {
  var element = document.getElementById(idInput);

  if (!element) {
    throw "No se encuentra presente un elemento con el id del input proporcionado \"".concat(idInput, "\"");
  }

  var value = element.getAttribute('calendarValue');
  value = value ? JSON.parse(value) : value = {};
  value["default"] ? value["default"] = new Date(value["default"]) : false;
  return value;
};
"use strict";

function cadenaUpperCase(text) {
  text = text.toUpperCase();
  return text;
}

function crearDir(url) {
  return new Promise(function (resolve, reject) {
    var sehace = fs.ensureDir(url);
    resolve(sehace);
  });
}

function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

function encondeCaracteres(texto) {
  // console.log(texto)
  if (texto == null) {
    texto = '';
  }

  texto = texto.replace(/[\u0000-\u0019]/g, '');
  texto = texto.replace(/"/g, '&quot;'); // const inpRfcIde = document.getElementById('inpRfcIde');

  return texto;
}

function decodeCaracteres(texto) {
  texto = texto.replace(/[\u0000-\u0019]/g, '');
  texto = texto.replace(/&quot;/g, '"'); // const inpRfcIde = document.getElementById('inpRfcIde');

  return texto;
}

function replaceSpace(texto) {
  texto = texto.replace(/[\u0000-\u0019]/g, '');
  texto = texto.replace(/ /g, '');
  return texto;
} // rampamparm = decodeCaracteres(rampamparm);
// console.warn(rampamparm)
// function decodeCaracteres(texto){
// 	// texto = b64_to_utf8(texto);
// }


function caracteresRaros(cadena) {
  cadena = cadena.replace(/[\u0000-\u0019|\u001A|\u001B|\u001C|\u001D|\u001E|\u001F|\u007F]/g, '');
  return cadena;
}