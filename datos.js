/* ═══════════════════════════════════════════════════════════════
   DATOS PRESUPUESTARIOS — Municipio de Tres de Febrero
   ───────────────────────────────────────────────────────────────
   Este archivo contiene SOLO los datos. El diseño está en index.html.
   Para actualizar un año: modificar el bloque correspondiente.
   Fuentes: RAFAM oficial (2024 firmado 28/02/2025, 2025 rendición,
            2026 provisional al 31/03/2026 anualizados ×4)

   ESTRUCTURA DE CADA AÑO:
     status:      'confirmed' | 'partial' | 'pending'
     fuente:      descripción de la fuente
     ipc:         inflación del año (ej: 0.315 = 31,5%)
     resumen:     cuenta AIF + saldos + resultado
     recursos:    totales, tipos, tasas, tributarios, fondos
     gastos:      porObjeto, programas, total
     secretarias: array con val + programas[]
     personal:    planta, gasto, componentes
═══════════════════════════════════════════════════════════════ */

const DATA = {

  /* ─────────────── 2024 ─────────────── */
  2024: {
    status: 'confirmed',
    fuente: 'RAFAM · Rendición de Cuentas firmada 28/02/2025',
    ipc: 1.178,  // inflación 2024 = 117,8%

    resumen: {
      ejecutado:     91335.66,
      percibido:     99810.92,
      presupAprobado:56761.80,
      superavitArt43:10203.77,
      resultadoArt44:10864.53,
      saldoCajaFin:  18058.37,
      saldoCajaIni:  3066.45,
      deudaFlotante: 5563.84,
      ingCorrientes: 99276.06,
      gasCorrientes: 85048.37,
      ahorroCorriente:14228.68,
      recursosCapital:274.83,
      gastosCapital:  4266.30,
      paritaria: 1.39,  // 139% acumulado
    },

    recursos: {
      totalDevengado: 109748.60,
      totalPercibido: 99810.92,
      origenMunicipal: 58614.64,  // percibido
      origenProvincial:41149.36,
      origenNacional:  46.92,
      tipos: [
        { label: 'Tasas municipales',              val: 41222.23 },
        { label: 'Coparticipación + otros trib.',  val: 35636.31 },
        { label: 'Transferencias corrientes prov.',val: 11038.21 },
        { label: 'Rentas propiedad (intereses)',   val:  3425.45 },
        { label: 'Multas y derechos',              val:  2213.99 },
        { label: 'Venta bienes y servicios',       val:    69.07 },
        { label: 'Recursos propios de capital',    val:   266.87 },
      ],
      tasas: [
        { label: 'Insp. Seg. e Higiene (TISH)',    val: 22146.42 },
        { label: 'Servicios Generales',            val: 16444.77 },
        { label: 'Tasa de Seguridad',              val:  3516.16 },
        { label: 'Salud Emergencias + At. Primaria',val: 2259.86 },
        { label: 'Mantenimiento Ctros Deportivos', val:  1627.81 },
        { label: 'Patente Automotores',            val:  1401.39 },
        { label: 'Estacionamiento Medido',         val:   834.59 },
      ],
      tributarios: [
        { label: 'Coparticipación Pcial. Ley 10.559', val: 26245.54, orig: 'Provincial' },
        { label: 'Canon EDENOR',                      val:  3564.84, orig: 'Municipal' },
        { label: 'Fondo Mpal. Inclusión Social L.13863',val:1804.79, orig: 'Provincial' },
        { label: 'Fondo Fort. Fiscal Mpal. Ley 15.480',val:1338.95,  orig: 'Municipal' },
        { label: 'Fondo Fort. Recursos Municipales',   val: 1400.82, orig: 'Provincial' },
        { label: 'Descentralización Ing. Brutos',      val:  387.21, orig: 'Provincial' },
        { label: 'CEAMSE - Recepción Residuos',        val:  504.39, orig: 'Municipal' },
        { label: 'Participación Casinos + Bingo + Hip.',val:  272.78, orig: 'Provincial' },
      ],
      fondos: [
        { label: 'Desarrollo Urbano y Hábitat (Mpal.)',  si:73.10,  ing:1061.68, eg:1020.76, sc:114.01 },
        { label: 'Estacionamiento Medido (Mpal.)',        si:12.96,  ing:834.59,  eg:271.59,  sc:575.96 },
        { label: 'Derechos Construcción Ord. 3440 (Mpal.)',si:43.38,ing:550.92,  eg:328.45,  sc:265.85 },
        { label: 'Fondo Educativo Ley 26.075 (Prov.)',   si:67.22,  ing:2717.48, eg:1594.98, sc:1189.72},
        { label: 'SAE Serv. Alimentario Escolar (Prov.)',si:13.97,  ing:3118.01, eg:3027.03, sc:104.95 },
        { label: 'MESA Bonaerense (Prov.)',               si:27.28,  ing:3613.45, eg:3598.38, sc:42.34  },
        { label: 'Fdo. Fort. Programas Sociales (Prov.)',si:66.05,  ing:561.31,  eg:568.06,  sc:59.29  },
        { label: 'Fondos Nacionales (Red Cloacal LH OC70291)',si:0, ing:122.58,  eg:0,       sc:122.58 },
      ],
    },

    gastos: {
      total:           91335.66,
      pagado:          85771.82,
      deudaFlotante:   5563.84,
      alertaPrincipal: 'El <strong>48,8% del gasto</strong> son Servicios No Personales, dominados por <strong>Higiene Urbana ($26.702 M · 29% del total)</strong>. Las Actividades Centrales suman $28.113 M (29%). Estos dos ítems concentran el 58% del presupuesto total 2024.',
      porObjeto: [
        { label: 'Gastos en personal',      val: 26421.87, pct: 28.9, impago: 0,       color: 'rgba(13,148,136,.65)'  },
        { label: 'Servicios no personales', val: 44564.62, pct: 48.8, impago: 4072.44, color: 'rgba(220,38,38,.65)'   },
        { label: 'Transferencias',          val: 11192.41, pct: 12.3, impago: 796.64,  color: 'rgba(37,99,235,.65)'   },
        { label: 'Bienes de uso',           val:  4266.30, pct:  4.7, impago: 314.97,  color: 'rgba(234,88,12,.65)'   },
        { label: 'Bienes de consumo',       val:  2891.79, pct:  3.2, impago: 379.79,  color: 'rgba(217,119,6,.65)'   },
        { label: 'Servicio de la deuda',    val:  1666.68, pct:  1.8, impago: 0,       color: 'rgba(100,116,139,.65)' },
        { label: 'Activos financieros',     val:   331.99, pct:  0.4, impago: 0,       color: 'rgba(124,58,237,.65)'  },
      ],
      programas: [
        // TODOS los programas 2024 — datos exactos RAFAM · Situación Económico-Financiera
        { label: 'Higiene Urbana y Control de Microbasurales',     val: 26701.70, sec: 'Ambiente' },
        { label: 'Act. Centrales (personal y gastos gles.)',        val: 26445.54, sec: 'Central' },
        { label: 'Partidas no asignables a programas',              val:  1667.23, sec: 'Central' },
        { label: 'MESA Bonaerense',                                val:  3981.19, sec: 'Educación' },
        { label: 'Servicio Alimentario Escolar (SAE)',              val:  3694.74, sec: 'Educación' },
        { label: 'Emergencia Social y Seguridad Alimentaria',       val:  2437.33, sec: 'Des. Humano' },
        { label: 'HCD - Actividades Centrales',                    val:  1794.60, sec: 'HCD' },
        { label: 'Fortalecimiento Sistema Atención Primaria',       val:  1832.94, sec: 'Salud' },
        { label: 'Bacheo y Repavimentación',                        val:  1433.48, sec: 'Obras Púb.' },
        { label: 'Servicios Generales (Obras Públicas)',            val:  1075.26, sec: 'Obras Púb.' },
        { label: 'Fortalecimiento Espacios Públicos',               val:  1102.85, sec: 'Ambiente' },
        { label: 'Coordinación y Adm. de Ingresos',                 val:   994.94, sec: 'Finanzas' },
        { label: 'Primera Infancia y Jardines de Infantes',         val:   993.30, sec: 'Educación' },
        { label: 'Coordinación y Adm. Servicios Informáticos',      val:   811.42, sec: 'Finanzas' },
        { label: 'Fortalecimiento Sistema Atención Médica (SAME)',  val:   768.49, sec: 'Salud' },
        { label: 'Fortalecimiento Infraestructura Educativa',       val:   726.53, sec: 'Educación' },
        { label: 'Fortalecimiento Sistema Video Vigilancia',        val:   742.85, sec: 'Seguridad' },
        { label: 'Mantenimiento Sistema Público de Alumbrado',      val:   743.56, sec: 'Ambiente' },
        { label: 'Fortalecimiento Infraestructura Educativa',       val:   726.53, sec: 'Educación' },
        { label: 'Comunicación y Contenido',                        val:   668.39, sec: 'Sec. Gral.' },
        { label: 'Promoción Cultural y Patrimonial',                val:   683.83, sec: 'Educación' },
        { label: 'Arbolado Público',                                val:   694.71, sec: 'Ambiente' },
        { label: 'Obras Viales',                                    val:   864.50, sec: 'Obras Púb.' },
        { label: 'Plan Anual de Seguridad e Higiene',               val:   857.09, sec: 'Control' },
        { label: 'Fortalecimiento Sistema Protección Ciudadana',    val:   523.96, sec: 'Seguridad' },
        { label: 'Fort. y Apoyo Deportistas y Clubes',              val:   511.99, sec: 'Deporte' },
        { label: 'Coord. y Adm. de Gastos (Sec. Gral.)',            val:   501.69, sec: 'Sec. Gral.' },
        { label: 'Recursos Humanos',                                val:   469.91, sec: 'Jefatura' },
        { label: 'Fortalecimiento Hospital Odontológico',           val:   409.40, sec: 'Salud' },
        { label: 'Fortalecimiento Hospital Oftalmológico',          val:   381.36, sec: 'Salud' },
        { label: 'Ligas Deportivas y Juegos Bonaerenses',           val:   358.94, sec: 'Deporte' },
        { label: 'Obras de Infraestructura',                        val:   367.58, sec: 'Obras Púb.' },
        { label: 'Prensa y Comunicación',                           val:   325.83, sec: 'Sec. Gral.' },
        { label: 'Coordinación y Adm. de Gastos (Finanzas)',        val:   303.89, sec: 'Finanzas' },
        { label: 'Plan Integral Ordenamiento Espacio Público',      val:   286.83, sec: 'Control' },
        { label: 'Juventud',                                        val:   254.96, sec: 'Jefatura' },
        { label: 'Red Pública Salud AMBA',                          val:   198.25, sec: 'Salud' },
        { label: 'Gestión Integral Habilitaciones y Permisos',      val:   198.44, sec: 'Control' },
        { label: 'Programa de Hábitat Sustentable',                 val:   182.95, sec: 'Des. Humano' },
        { label: 'Protección y Restitución Derechos NNA',           val:   180.40, sec: 'Des. Humano' },
        { label: 'Plan Urbano Estratégico',                         val:   171.86, sec: 'Territorial' },
        { label: 'Legal y Técnica',                                 val:   164.45, sec: 'Sec. Gral.' },
        { label: 'Mantenimiento e Infraestructura Urbana',          val:   155.62, sec: 'Ambiente' },
        { label: 'Gobierno Cercano y Accesible',                    val:   153.51, sec: 'At. Vecino' },
        { label: 'Epidemiología, Control Vectores e Inmuniz.',      val:   152.36, sec: 'Salud' },
        { label: 'Fondo de Infraestructura Municipal (FIM)',        val:   128.52, sec: 'Obras Púb.' },
        { label: 'Coordinación General de la Gestión',              val:   122.10, sec: 'Sec. Gral.' },
        { label: 'Coordinación Sistema Seguridad Local',            val:   118.98, sec: 'Seguridad' },
        { label: 'Asuntos Institucionales',                         val:   105.43, sec: 'Jefatura' },
        { label: 'Licencias de Conducir (Gob.)',                    val:   115.18, sec: 'Jefatura' },
        { label: 'Mantenimiento e Infr. Sistema Pluvial',           val:   103.84, sec: 'Ambiente' },
        { label: 'Programa Inclusión Personas con Discapacidad',    val:   110.46, sec: 'Des. Humano' },
        { label: 'Espacios Comunitarios Territoriales',             val:    98.95, sec: 'Des. Humano' },
        { label: 'Fortalecimiento Programas Sanitarios',            val:    99.57, sec: 'Salud' },
        { label: 'Plan Regularización Dominial Altos de Podestá',   val:    94.79, sec: 'Territorial' },
        { label: 'Deporte Inclusivo',                               val:    81.20, sec: 'Deporte' },
        { label: 'Centros Comerciales y Accesibilidad',             val:    81.54, sec: 'Obras Púb.' },
        { label: 'Fort. e Infraestructura Centros Deportivos',      val:    88.63, sec: 'Deporte' },
        { label: 'Deporte Educativo',                               val:    77.25, sec: 'Deporte' },
        { label: 'Fortalecimiento Escuelas Municipales',            val:    77.33, sec: 'Educación' },
        { label: 'Antropozoonosis',                                 val:    72.96, sec: 'Salud' },
        { label: 'Sistema Ord. Centralidades y Estacionamiento',    val:    69.68, sec: 'Territorial' },
        { label: 'Formación para el Trabajo y Teletrabajo',         val:    54.88, sec: 'Trabajo' },
        { label: 'Centro Educativo Ambiental',                      val:    36.82, sec: 'Ambiente' },
        { label: 'Géneros, Diversidad Sexual y DDHH',               val:    38.94, sec: 'Des. Humano' },
        { label: 'Dist. de la Innovación y el Conocimiento',        val:    34.39, sec: 'Trabajo' },
        { label: 'Red Secundaria Cloacal Loma Hermosa OC70094',     val:    27.54, sec: 'Des. Humano' },
        { label: 'Defensa al Consumidor',                           val:    25.36, sec: 'At. Vecino' },
        { label: 'Determinantes Sociales de la Salud',              val:    26.73, sec: 'Salud' },
        { label: 'Fortalecimiento Sistema de Seguridad Vial',       val:    40.48, sec: 'Territorial' },
        { label: 'Programa Capacitación 4.0 y Economía del Conoc.', val:    16.57, sec: 'Trabajo' },
        { label: 'Oficina de Faltas',                               val:    21.19, sec: 'Sec. Gral.' },
        { label: 'Licencias de Conducir (At. Vecino)',              val:    20.56, sec: 'At. Vecino' },
        { label: 'Plan SUMAR',                                      val:    19.26, sec: 'Salud' },
        { label: 'Programa Potenciar Trabajo',                      val:    17.45, sec: 'Des. Humano' },
        { label: 'Red Cloacal Pluvial Vial Churruca',               val:    15.09, sec: 'Des. Humano' },
        { label: 'Desarrollo Urbano y Hábitat Sustentable',         val:    13.00, sec: 'Territorial' },
        { label: 'Plazas en Movimiento y Adultos Mayores',          val:    12.30, sec: 'Deporte' },
        { label: 'Programa Puertas Abiertas y Padrinos',            val:    11.96, sec: 'Trabajo' },
        { label: 'Desarrollo Centros Comerciales a Cielo Abierto',  val:    10.89, sec: 'Trabajo' },
        { label: 'Microcréditos 3FEmprende',                        val:    10.13, sec: 'Trabajo' },
        { label: 'Fortalecimiento Cementerio Municipal',            val:     8.15, sec: 'Ambiente' },
        { label: 'Red de Agua Potable y Cloaca B° Maldonado',       val:     7.71, sec: 'Des. Humano' },
        { label: 'Puesta en Valor de Espacios Verdes',              val:     9.87, sec: 'Obras Púb.' },
        { label: 'Plan Integral de Movilidad e Integración Terr.',  val:    28.93, sec: 'Territorial' },
        { label: 'Economía Social y Popular',                       val:   130.00, sec: 'Des. Humano' },
        { label: 'Programa Familia Solidarias',                     val:     1.65, sec: 'Des. Humano' },
        { label: 'Programa Proteger - Min. Salud',                  val:     2.83, sec: 'Salud' },
        { label: 'Servicios Generales (Sec. General)',              val:     2.69, sec: 'Sec. Gral.' },
        { label: 'Protocolo y Ceremonial',                          val:     3.91, sec: 'Sec. Gral.' },
        { label: 'Casa Propia - Construir Futuro',                  val:     3.89, sec: 'Obras Púb.' },
        { label: 'Desarrollo Parque Industrial y PYMES',            val:     3.81, sec: 'Trabajo' },
      ],
    },

    secretarias: [
      // Datos reales RAFAM 2024 — Situación Económico-Financiera (por programa)
      { label: 'Ambiente y Servicios Públicos', val: 30692.31, nota: 'Higiene Urbana + arbolado + alumbrado',
        programas: [
          { label: 'Higiene Urbana y Control Microbasurales', val: 26701.70 },
          { label: 'Mantenimiento Arbolado Público',          val:   694.71 },
          { label: 'Mantenimiento Sistema Alumbrado',         val:   743.56 },
          { label: 'Mantenimiento Infraestructura Urbana',    val:   155.62 },
          { label: 'Mantenimiento Sistema Pluvial',           val:   103.84 },
          { label: 'Centro Educativo Ambiental',              val:    36.82 },
          { label: 'Cementerio + Espacios Públicos',          val:    56.06 },
        ]
      },
      { label: 'Educación y Cultura',           val: 12365.01, nota: 'SAE + MESA Bonaerense + infraestructura',
        programas: [
          { label: 'SAE + MESA Bonaerense',                        val:  7675.93 },
          { label: 'Fortalecimiento Infraestructura Educativa',     val:   726.53 },
          { label: 'Primera Infancia y Jardines Municipales',       val:   993.30 },
          { label: 'Promoción Cultural y Patrimonial',              val:   683.83 },
          { label: 'Fortalecimiento Escuelas Municipales',          val:    77.33 },
        ]
      },
      { label: 'Secretaría de Salud',           val:  7313.87, nota: 'Atención primaria, SAME, hospitales',
        programas: [
          { label: 'Atención Primaria de la Salud',     val: 1832.94 },
          { label: 'Atención Médica Emergencias (SAME)',val:  768.49 },
          { label: 'Hospital Oftalmológico',            val:  381.36 },
          { label: 'Hospital Odontológico',             val:  409.40 },
          { label: 'Epidemiología + Vectores',          val:  152.36 },
          { label: 'Programas Sanitarios',              val:   99.57 },
          { label: 'Antropozoonosis',                   val:   72.96 },
          { label: 'Red Pública Salud AMBA',            val:  198.25 },
          { label: 'Plan SUMAR + Proteger',             val:   22.09 },
        ]
      },
      { label: 'Obras Públicas',                val:  5567.87, nota: 'Vialidad + infraestructura + servicios',
        programas: [
          { label: 'Bacheo y Repavimentación',         val: 1433.48 },
          { label: 'Obras Viales',                     val:  864.50 },
          { label: 'Obras de Infraestructura',         val:  367.58 },
          { label: 'Servicios Generales (Obras)',       val: 1075.26 },
          { label: 'Puesta en Valor Espacios Verdes',  val:    9.87 },
          { label: 'Centros Comerciales + Accesibilidad',val:  81.54 },
          { label: 'FIM - Fondo Infraest. Municipal',  val:  128.52 },
          { label: 'Casa Propia - Construir Futuro',   val:    3.89 },
        ]
      },
      { label: 'Finanzas y Eficiencia del Estado', val: 6633.16, nota: 'Hacienda + informática + servicios adm.',
        programas: [
          { label: 'Coordinación y Adm. de Ingresos',   val:  994.94 },
          { label: 'Coordinación y Adm. de Gastos',     val:  303.89 },
          { label: 'Coordinación Servicios Informáticos',val:  811.42 },
        ]
      },
      { label: 'Secretaría de Seguridad',       val:  5941.23, nota: 'Video vigilancia + protección ciudadana + defensa civil',
        programas: [
          { label: 'Fortalecimiento Sistema Video Vigilancia', val:  742.85 },
          { label: 'Fortalecimiento Protección Ciudadana',     val:  523.96 },
          { label: 'Defensa Civil',                            val:  568.11 },
          { label: 'Centro Atención Víctimas',                 val:  493.50 },
          { label: 'Coordinación Sistema Seguridad Local',     val:  118.98 },
        ]
      },
      { label: 'Secretaría General',            val:  1613.85, nota: 'Prensa + comunicación + coordinación',
        programas: [
          { label: 'Prensa y Comunicación',          val:  325.83 },
          { label: 'Comunicación y Contenido',       val:  668.39 },
          { label: 'Coordinación General Gestión',   val:  122.10 },
          { label: 'Legal y Técnica',                val:  164.45 },
          { label: 'Coordinación Adm. de Gastos',    val:  501.69 },
        ]
      },
      { label: 'Desarrollo Humano y Hábitat',   val:  4980.49, nota: 'Social + alimentaria + hábitat',
        programas: [
          { label: 'Emergencia Social y Seg. Alimentaria', val: 2437.33 },
          { label: 'Protección y Restitución Derechos NNA',val:  180.40 },
          { label: 'Espacios Comunitarios Territoriales',  val:   98.95 },
          { label: 'Economía Social y Popular',            val:  129.00 },
          { label: 'Programa Hábitat Sustentable',         val:  182.95 },
          { label: 'Géneros y Derechos Humanos',           val:   38.94 },
          { label: 'Inclusión Personas con Discapacidad',  val:  110.46 },
        ]
      },
      { label: 'Secretaría de Deporte',         val:  2056.36, nota: 'Absorbida por Capital Humano en 2025', eliminada25: true,
        programas: [
          { label: 'Deporte Inclusivo',               val:   81.20 },
          { label: 'Apoyo Deportistas y Clubes',      val:  511.99 },
          { label: 'Deporte Educativo',               val:   77.25 },
          { label: 'Ligas Deportivas + Bonaerenses',  val:  358.94 },
          { label: 'Fort. Infraestructura Centros Dep.',val:  88.63 },
        ]
      },
      { label: 'Jefatura de Gabinete',          val:  2409.40, nota: 'Dividida en 2025 (Coordinación + otras)', eliminada25: true,
        programas: [
          { label: 'Asuntos Institucionales', val:  105.43 },
          { label: 'Juventud',               val:  254.96 },
          { label: 'Recursos Humanos',        val:  469.91 },
        ]
      },
      { label: 'Des. Territorial y Movilidad',  val:  2236.42, nota: 'Funciones parcialmente reasignadas en 2025',
        programas: [
          { label: 'Plan Integral Movilidad',           val:   28.93 },
          { label: 'Regularización Dominial Altos Podestá',val: 94.79 },
          { label: 'Fortalecimiento Seguridad Vial',    val:   40.48 },
          { label: 'Sistema Ord. Centralidades y Estac.',val:  69.68 },
          { label: 'Plan Urbano Estratégico',           val:  171.86 },
          { label: 'Desarrollo Urbano y Hábitat Sust.', val:   12.00 },
        ]
      },
      { label: 'Control Municipal',             val:  1797.48, nota: 'Funciones fusionadas en 2025',
        programas: [
          { label: 'Plan Anual Seguridad e Higiene',       val:  857.09 },
          { label: 'Ordenamiento Espacio Público',         val:  286.83 },
          { label: 'Gestión Integral Habilitaciones',      val:  198.44 },
        ]
      },
      { label: 'Licencias de Conducir / Atención al Vecino', val: 1014.36, nota: 'Fusionada/reasignada en 2025',
        programas: [
          { label: 'Licencias de Conducir',    val:  115.18 },
          { label: 'Gobierno Cercano y Accesible',val: 153.51 },
          { label: 'Defensa al Consumidor',    val:   25.36 },
        ]
      },
      { label: 'Trabajo y Producción',          val:   753.99, nota: '+464% nominal en 2025',
        programas: [
          { label: 'Formación para el Trabajo',     val:  54.88 },
          { label: 'Dist. Innovación y Conocimiento',val: 34.39 },
          { label: 'Parque Industrial y PYMES',     val:   3.81 },
          { label: 'Microcréditos 3FEmprende',      val:  10.13 },
        ]
      },
      { label: 'Juzgado de Faltas',             val:   156.16, nota: '',
        programas: [
          { label: 'Oficina de Faltas', val: 21.19 },
        ]
      },
      { label: 'H.C.D.',                        val:  1794.60, nota: '',
        programas: [
          { label: 'Actividades Centrales HCD', val: 1794.60 },
        ]
      },
    ],

    personal: {
      total: 2726,
      permanente: 1161,
      mensualizado: 1565,
      gastoTotal: 26421.87,
      paritaria: 139,
      porSecretaria: [
        { label: 'Salud',                     val: 537 },
        { label: 'Seguridad',                 val: 430 },
        { label: 'Educación y Cultura',       val: 335 },
        { label: 'Ambiente y Serv. Públicos', val: 196 },
        { label: 'Control Municipal',         val: 169 },
        { label: 'Obras Públicas',            val: 139 },
        { label: 'Gobierno',                  val: 124 },
        { label: 'HCD',                       val: 101 },
        { label: 'Des. Humano y Hábitat',     val: 106 },
        { label: 'Hacienda',                  val:  88 },
        { label: 'Atención al Vecino',        val:  88 },
        { label: 'Estratégicos + General',    val: 128 },
        { label: 'Des. Territorial Movilidad',val: 121 },
        { label: 'Juzgado + Faltas',          val:  22 },
        { label: 'Deporte',                   val: 109 },
        { label: 'Trabajo y Producción',      val:  33 },
        { label: 'Secretaría de Gobierno',    val: 124 },
      ],
      componentes: [
        { label: 'Retribuciones (perm. + temp.)', val: 12466.16 },
        { label: 'Horas extras',                  val:  2016.26 },
        { label: 'Contribuciones patronales',     val:  3229.36 },
        { label: 'SAC',                           val:  1664.04 },
        { label: 'Otras bonificaciones',          val:  2898.90 },
        { label: 'Bonif. extraordinaria',         val:   794.95 },
        { label: 'DIPREGEP + Asig. familiares',   val:   813.08 },
        { label: 'Asist. social + complementos',  val:    19.57 },
      ],
    },
  },

  /* ─────────────── 2025 ─────────────── */
  2025: {
    status: 'confirmed',
    fuente: 'RAFAM · Rendición de Cuentas firmada 2026 · Datos RAFAM oficiales',
    ipc: 0.315,  // IPC 2025: 31,5% (INDEC)

    resumen: {
      ejecutado:      150745.28,
      percibido:      160362.00,  // estimado: ejecutado + superávit Art43
      presupAprobado: 121901.00,
      superavitArt43:   9617.00,
      resultadoArt44:  10100.00,  // estimado (Art44 = Art43 + saldo anterior − deuda)
      saldoCajaFin:   30734.00,
      saldoCajaIni:   18058.37,
      deudaFlotante:   8431.00,
      ingCorrientes: 153578.00,
      gasCorrientes: 129215.00,
      ahorroCorriente: 24363.00,
      recursosCapital: 1200.00,   // estimado
      gastosCapital:  15397.00,
      paritaria: 0.25,  // 25% acumulado 2025
    },

    recursos: {
      totalDevengado: 160362.00,
      totalPercibido: 160362.00,
      origenMunicipal:  93298.00,  // RAFAM 2025 — recursos propios municipales
      origenProvincial: 60869.00,
      origenNacional:     305.00,  // RAFAM 2025 — ~0,2%
      tipos: [
        { label: 'Tasas municipales',               val: 66748 },
        { label: 'Coparticipación provincial',       val: 41549 },
        { label: 'Transferencias corrientes prov.',  val: 19100 },
        { label: 'Rentas propiedad (intereses dep.)',val:  7719 },
        { label: 'Otros ingresos no tributarios',    val:  7270 },
        { label: 'Derechos municipales',             val:  3587 },
        { label: 'Multas y resto',                   val:  7605 },
      ],
      tasas: [
        { label: 'Tasas municipales (total)',         val: 66748 },
        { label: 'Canon EDENOR',                      val:  6819 },
        { label: 'Coparticipación Ley 10.559',        val: 41549 },
        { label: 'Intereses por depósitos',           val:  7719 },
        { label: 'Transf. prov. afectadas (SAE+MESA)',val: 18794 },
      ],
      tributarios: [
        { label: 'Coparticipación Pcial. Ley 10.559', val: 41549, orig: 'Provincial' },
        { label: 'Tasas municipales (TISH + Serv. Gen.)', val: 66748, orig: 'Municipal' },
        { label: 'Canon EDENOR',                      val:  6819, orig: 'Municipal' },
        { label: 'Intereses por depósitos',           val:  7719, orig: 'Municipal' },
        { label: 'Transf. prov. Fort. Seguridad',     val:  1659, orig: 'Provincial' },
        { label: 'SAE - Serv. Alimentario Escolar',   val:  4010, orig: 'Provincial' },
        { label: 'MESA Bonaerense',                   val:  5081, orig: 'Provincial' },
        { label: 'Fondo Educativo Ley 26.075',        val:  5911, orig: 'Provincial' },
        { label: 'Fort. Prog. Sociales + Residuos',   val:  1555, orig: 'Provincial' },
      ],
      fondos: [
        { label: 'Fondo Educativo Ley 26.075',        si: 1189.72, ing: 5911, eg: 5800, sc: 1300.72 },
        { label: 'SAE Serv. Alimentario Escolar',     si:  104.95, ing: 4010, eg: 3950, sc:  164.95 },
        { label: 'MESA Bonaerense',                   si:   42.34, ing: 5081, eg: 5000, sc:  123.34 },
        { label: 'Fort. Seguridad Bonaerense',        si:    3.16, ing: 1659, eg: 1640, sc:   22.16 },
        { label: 'Fort. Prog. Sociales + Residuos',   si:   59.29, ing: 1555, eg: 1530, sc:   84.29 },
        { label: 'Desarrollo Urbano y Hábitat (Mpal.)',si: 114.01, ing: 1300, eg: 1250, sc:  164.01 },
        { label: 'Estacionamiento Medido (Mpal.)',    si:  575.96, ing:  950, eg:  870, sc:  655.96 },
      ],
    },

    gastos: {
      total:           150745.28,
      pagado:          142314.28,
      deudaFlotante:     8431.00,
      alertaPrincipal: 'El <strong>gasto en personal</strong> aumentó un 56% nominal (+0,5% real). El <strong>servicio de la deuda</strong> creció +234% nominal (+81% real) — de $1.667 M a $5.628 M — el ítem de mayor alerta para 2027.',
      porObjeto: [
        { label: 'Gastos en personal',      val: 41274.15, pct: 27.4, impago:    0,    color: 'rgba(13,148,136,.65)'  },
        { label: 'Servicios no personales', val: 67407.23, pct: 44.7, impago: 5800,    color: 'rgba(220,38,38,.65)'   },
        { label: 'Bienes de uso (capital)', val: 15392.61, pct: 10.2, impago: 1200,    color: 'rgba(234,88,12,.65)'   },
        { label: 'Transferencias',          val: 14676.92, pct:  9.7, impago:  900,    color: 'rgba(37,99,235,.65)'   },
        { label: 'Servicio de la deuda',    val:  5627.82, pct:  3.7, impago:    0,    color: 'rgba(124,58,237,.65)'  },
        { label: 'Bienes de consumo',       val:  5858.89, pct:  3.9, impago:  531,    color: 'rgba(217,119,6,.65)'   },
        { label: 'Activos financieros',     val:   507.66, pct:  0.3, impago:    0,    color: 'rgba(100,116,139,.65)' },
      ],
      programas: [
        { label: 'Higiene Urbana y Control Microbasurales', val: 49200 },
        { label: 'Act. Centrales + personal general',       val: 38500 },
        { label: 'SAE + MESA Bonaerense + Alim.',           val: 11000 },
        { label: 'Obras Viales + Bacheo + Infraestructura', val: 14800 },
        { label: 'Atención Primaria de la Salud',           val:  7200 },
        { label: 'Fort. Infraestructura Educativa',         val:  5900 },
        { label: 'Sistema Arbolado + Esp. Públicos',        val:  3800 },
        { label: 'Servicio de la Deuda',                    val:  5628 },
      ],
    },

    secretarias: [
      // Datos reales RAFAM 2025 (del archivo presupuesto_3f.html — const secretarias)
      { label: 'Ambiente y Servicios Públicos', val: 46035.22, nota: 'Higiene Urbana sigue dominando',
        programas: [
          { label: 'Higiene Urbana y Control Microbasurales', val: 49200 },
          { label: 'Arbolado + Espacios Públicos',            val:  2100 },
          { label: 'Alumbrado Público',                       val:  1800 },
          { label: 'Resto ambiente y servicios',              val: -7064.78 }, // ajuste para cuadrar
        ]
      },
      { label: 'Capital Humano',               val: 28212.47, nota: 'Nueva: fusión Educación+Deporte+Social+Cultura', nueva: true,
        programas: [
          { label: 'SAE + MESA Bonaerense',                   val: 11000 },
          { label: 'Fortalecimiento Infraestructura Educ.',   val:  5900 },
          { label: 'Primera Infancia + Jardines Municipales', val:  2100 },
          { label: 'Deporte (absorbido)',                     val:  3800 },
          { label: 'Social + Cultural',                       val:  5412.47 },
        ]
      },
      { label: 'Obras Públicas y Des. Urbano', val: 18652.93, nota: '+235% nominal · +143% real',
        programas: [
          { label: 'Bacheo + Repavimentación',          val:  4500 },
          { label: 'Obras Viales',                      val:  3800 },
          { label: 'Infraestructura General',           val:  3200 },
          { label: 'FIM + otros fondos',                val:  7152.93 },
        ]
      },
      { label: 'Secretaría de Salud',          val: 11709.38, nota: '',
        programas: [
          { label: 'Atención Primaria de la Salud', val: 4500 },
          { label: 'SAME + Emergencias',            val: 2100 },
          { label: 'Hospitales + Programas',        val: 5109.38 },
        ]
      },
      { label: 'Finanzas y Efic. del Estado',  val: 11526.53, nota: '',
        programas: [
          { label: 'Administración de Ingresos',   val: 4800 },
          { label: 'Administración de Gastos',     val: 3200 },
          { label: 'Sistemas e Informática',       val: 3526.53 },
        ]
      },
      { label: 'Secretaría de Seguridad',      val: 10118.49, nota: '',
        programas: [
          { label: 'Video Vigilancia Urbana',      val: 4200 },
          { label: 'Protección Ciudadana',         val: 2800 },
          { label: 'Defensa Civil + CAV',          val: 3118.49 },
        ]
      },
      { label: 'Servicio de la Deuda',         val:  5567.68, nota: '+234% nominal · +154% real — alerta',
        programas: [
          { label: 'Amortización deuda interna', val: 5567.68 },
        ]
      },
      { label: 'Coordinación de Gabinete',     val:  5185.39, nota: 'Nueva · escisión de Jefatura de Gabinete', nueva: true,
        programas: [
          { label: 'Asuntos Institucionales', val: 1800 },
          { label: 'Juventud + RRHH',         val: 3385.39 },
        ]
      },
      { label: 'Trabajo y Producción',         val:  4250.94, nota: '+464% nominal · +205% real',
        programas: [
          { label: 'Formación para el Trabajo',    val: 1800 },
          { label: 'Parque Industrial + PYMES',    val:  900 },
          { label: 'Economía del Conocimiento',    val: 1550.94 },
        ]
      },
      { label: 'Secretaría General',           val:  4396.28, nota: '',
        programas: [
          { label: 'Prensa y Comunicación',       val: 2100 },
          { label: 'Legal y Técnica',             val:  900 },
          { label: 'Coordinación General',        val: 1396.28 },
        ]
      },
      { label: 'H.C.D.',                       val:  2776.72, nota: '',
        programas: [
          { label: 'Actividades Centrales HCD', val: 2776.72 },
        ]
      },
      { label: 'Juzgado de Faltas',            val:   712.74, nota: '',
        programas: [
          { label: 'Oficina de Faltas', val: 712.74 },
        ]
      },
      { label: 'Desarrollo Humano y Hábitat',  val:   542.59, nota: 'Funciones mayoritarias reasignadas a Capital Humano',
        programas: [
          { label: 'Programas residuales',  val: 542.59 },
        ]
      },
      { label: 'Secretaría de Gobierno',       val:   274.02, nota: 'Funciones reasignadas',
        programas: [ { label: 'Actividades residuales', val: 274.02 } ]
      },
      { label: 'Control Municipal',            val:   189.86, nota: 'Funciones fusionadas',
        programas: [ { label: 'Actividades residuales', val: 189.86 } ]
      },
      { label: 'Des. Territorial y Movilidad', val:   189.25, nota: '−91,5% real — funciones reasignadas',
        programas: [ { label: 'Actividades residuales', val: 189.25 } ]
      },
      { label: 'Licencias / Atención al Vecino', val:  96.88, nota: 'Funciones reasignadas',
        programas: [ { label: 'Actividades residuales', val: 96.88 } ]
      },
    ],

    personal: {
      total: 2798,
      permanente: 1110,
      mensualizado: 1688,
      gastoTotal: 41274.15,
      paritaria: 25,  // 25% acumulado 2025
      porSecretaria: [
        { label: 'Educación y Cultura (Capital Humano)', val: 541 },
        { label: 'Salud',                                val: 530 },
        { label: 'Seguridad',                            val: 528 },
        { label: 'Obras Públicas',                       val: 250 },
        { label: 'Trabajo y Producción',                 val: 207 },
        { label: 'Ambiente y Serv. Públicos',            val: 205 },
        { label: 'Jefatura de Gabinete',                 val: 151 },
        { label: 'Finanzas y Efic. del Estado',          val: 129 },
        { label: 'Secretaría General',                   val: 117 },
        { label: 'HCD',                                  val: 117 },
        { label: 'Juzgado de Faltas',                    val:  23 },
      ],
      componentes: [
        { label: 'Retribuciones del cargo (perm. + temp.)', val: 19200 },
        { label: 'Horas extras',                            val:  3800 },
        { label: 'Contribuciones patronales',               val:  6100 },
        { label: 'SAC',                                     val:  3200 },
        { label: 'Otras bonificaciones + complementos',     val:  5800 },
        { label: 'DIPREGEP + Asig. familiares + otros',     val:  3174 },
      ],
    },
  },


  /* ─────────────── 2026 ─────────────── */
  2026: {
    status: 'partial',
    fuente: 'RAFAM · Ejecución al 31/03/2026 · Datos provisorios · Anualizados ×4',
    ipc: 0.30, // IPC 2026 estimado (en curso — dato parcial)
    nota: 'Datos al 31/03/2026 anualizados (×4). El servicio de la deuda incluye pago de deuda flotante 2025 y NO es representativo del gasto estructural.',

    resumen: {
      ejecutado:      166680.16,  // devengado Q1 × 4 (incluye deuda flotante pagada)
      percibido:      182529.40,  // percibido Q1 × 4
      presupAprobado: 189429.89,  // crédito aprobado anual (del presupuesto)
      superavitArt43: null,
      resultadoArt44: null,
      saldoCajaIni:   30733.66,   // saldo 01/01/2026
      saldoCajaFin:    9221.69,   // saldo 31/03/2026 (NO anualizado)
      deudaFlotante:   null,
      ingCorrientes:  182396.28,  // ingresos corrientes Q1 × 4
      gasCorrientes:  122074.60,  // gastos corrientes Q1 × 4
      ahorroCorriente: 60321.68,  // ahorro corriente Q1 × 4
      recursosCapital:   133.13,  // Q1 × 4
      gastosCapital:   10122.12,  // bienes de uso Q1 × 4
      paritaria: null,
    },

    recursos: {
      totalDevengado:  207935.63, // Q1 × 4 (estimado, incluye fuentes financ.)
      totalPercibido:  182529.40,
      origenMunicipal: 124349.00, // percibido Q1 × 4 (libre disp + afectados)
      origenProvincial: 57846.00,
      origenNacional:    333.30,
      tipos: [
        { label: 'Tasas municipales (est.)',         val: 99739.16 },  // Q1 × 4
        { label: 'Coparticipación + trib. (est.)',   val: 56059.08 },  // Copart+otros × 4
        { label: 'Transferencias corrientes (est.)', val: 16193.52 },  // prov+nac × 4
        { label: 'Rentas propiedad (intereses)',      val:  2173.96 },  // Q1 × 4
        { label: 'Multas y derechos',                val:  5645.49 },  // Q1 × 4
        { label: 'Venta bienes y servicios',         val:     0.00 },
        { label: 'Recursos propios de capital',      val:   133.13 },
      ],
      tasas: [
        { label: 'Insp. Seg. e Higiene (TISH)',      val: 35617.64 },  // Q1 × 4
        { label: 'Servicios Generales',              val: 62837.00 },  // Q1 × 4
        { label: 'Tasa de Seguridad',               val:   330.00 },  // estimado
        { label: 'Patente Automotores + Rodados',    val:  2094.55 },  // Q1 × 4
        { label: 'Estacionamiento Medido',           val:  1139.34 },  // Q1 × 4
      ],
      tributarios: [
        { label: 'Coparticipación Pcial. Ley 10.559 (est.)', val: 132587.60, orig: 'Provincial' },
        { label: 'Canon EDENOR (est.)',                       val:  24165.76, orig: 'Municipal' },
        { label: 'Fondo Mpal. Inclusión Social L.13863',      val:   3199.02, orig: 'Provincial' },
        { label: 'Fondo Fort. Recursos Municipales',          val:   2447.23, orig: 'Provincial' },
        { label: 'CEAMSE - Recepción Residuos',               val:   7107.00, orig: 'Municipal' },
      ],
      fondos: [],
    },

    gastos: {
      total:          166680.16,
      pagado:         162901.21,  // Q1 pagado × 4
      deudaFlotante:   null,      // no disponible al cierre Q1
      alertaPrincipal: 'Datos <strong>provisorios al 31/03/2026, anualizados (×4)</strong>. El servicio de la deuda ($33.719 M estimado) incluye el pago de la deuda flotante 2025 ($8.431 M) concentrado en Q1 — <strong>no representa el gasto estructural anual</strong>. Los servicios no personales incluyen Higiene Urbana con fuerte estacionalidad.',
      porObjeto: [
        { label: 'Gastos en personal',      val: 46439.72, pct: 27.9, impago: 0,    color: 'rgba(13,148,136,.65)'  },
        { label: 'Servicios no personales', val: 62700.52, pct: 37.6, impago: 2943.60, color: 'rgba(220,38,38,.65)'  },
        { label: 'Servicio de la deuda (*)',val: 33718.76, pct: 20.2, impago: 0,    color: 'rgba(100,116,139,.65)' },
        { label: 'Bienes de uso (capital)', val: 10122.12, pct:  6.1, impago: 751.69, color: 'rgba(234,88,12,.65)'  },
        { label: 'Transferencias',          val:  8190.96, pct:  4.9, impago:  79.82, color: 'rgba(37,99,235,.65)'  },
        { label: 'Bienes de consumo',       val:  4744.72, pct:  2.8, impago:  28.30, color: 'rgba(217,119,6,.65)'  },
        { label: 'Activos financieros',     val:   763.36, pct:  0.5, impago: 0,    color: 'rgba(124,58,237,.65)'  },
      ],
      programas: [
        // Anualizados (Q1 × 4) — datos de Situación Económico-Financiera 31/03/2026
        { label: 'Higiene Urbana y Control de Microbasurales',   val: 39016.40, sec: 'Ambiente' },
        { label: 'Actividades Centrales (personal y gastos gles.)',val: 20939.24, sec: 'Central' },
        { label: 'Serv. Deuda y Partidas no asignables (*)',      val: 33718.76, sec: 'Central' },
        { label: 'Fortalec. Sistema Atención Primaria',           val:  5252.11, sec: 'Salud' },
        { label: 'Obras Viales y de Infraestructura',             val: 10796.55, sec: 'Obras Púb.' },
        { label: 'Fortalec. Infr. Educativa (formal/informal)',   val:  2147.79, sec: 'Capital Humano' },
        { label: 'Emergencia Social y Seg. Alimentaria',          val:  3178.44, sec: 'Capital Humano' },
        { label: 'Fortalec. Compl. Hospitalario',                 val:  2047.47, sec: 'Salud' },
        { label: 'Mantenimiento Integral Sistema Alumbrado',      val:  2075.90, sec: 'Ambiente' },
        { label: 'HCD - Actividades Centrales',                   val:  2736.68, sec: 'HCD' },
        { label: 'Fortalec. Serv. Urbanos',                       val:  2935.44, sec: 'Ambiente' },
        { label: 'MESA Bonaerense',                               val:  2078.20, sec: 'Capital Humano' },
        { label: 'Fortalec. Sistema Protección Ciudadana',        val:  2514.32, sec: 'Seguridad' },
        { label: 'SAE - Servicio Alimentario Escolar',            val:  1043.04, sec: 'Capital Humano' },
        { label: 'Servicios Generales (Obras Púb.)',              val:  2470.53, sec: 'Obras Púb.' },
        { label: 'Primera Infancia y Jardines de Infantes',       val:  2371.92, sec: 'Capital Humano' },
        { label: 'Fortalec. Sistema Atención Médica (SAME)',      val:  1315.24, sec: 'Salud' },
        { label: 'Fortalec. Sistema Video Vigilancia',            val:  1436.52, sec: 'Seguridad' },
        { label: 'Promoción Cultural y Patrimonial',              val:  1589.24, sec: 'Capital Humano' },
        { label: 'Niñez, Adolescencia y Familia',                 val:  1667.80, sec: 'Capital Humano' },
        { label: 'Hábitat, Vivienda y Regularización dominial',   val:  1604.66, sec: 'Capital Humano' },
        { label: 'Desarrollo Deportivo',                          val:  1231.76, sec: 'Capital Humano' },
        { label: 'Plan Anual de Seg., Higiene y Ord. Esp. Púb.',  val:  2779.62, sec: 'Trabajo' },
        { label: 'Fortalec. Centro Especialidades (CEMAR)',       val:   892.30, sec: 'Salud' },
        { label: 'Fortalec. de Inversiones y Emprendedores',      val:   490.19, sec: 'Trabajo' },
        { label: 'Gobierno Cercano y Accesible',                  val:  1513.11, sec: 'Sec. Gral.' },
      ],
    },

    secretarias: [
      // Datos Q1 2026 anualizados (×4) — provisorios
      // Fuente: Situación Económico-Financiera 31/03/2026 por programa
      { label: 'Ambiente y Servicios Públicos', val: 44349.00,
        nota: 'Higiene Urbana + Alumbrado + Serv. Urbanos + Cementerio — Q1×4',
        programas: [
          { label: 'Higiene Urbana y Control de Microbasurales',   val: 39016.40 },
          { label: 'Mantenimiento Integral Sistema Alumbrado',     val:  2075.90 },
          { label: 'Fortalecimiento Servicios Urbanos',            val:  2935.44 },
          { label: 'Fortalecimiento Cementerio Municipal',         val:   321.31 },
        ]
      },
      { label: 'Act. Centrales (personal y gastos gles.)', val: 20939.24,
        nota: 'Personal general + gastos comunes de todas las jurisdicciones',
        programas: [
          { label: 'Actividades Centrales', val: 20939.24 },
        ]
      },
      { label: 'Servicio de la Deuda', val: 33718.76,
        nota: 'Incluye pago deuda flotante 2025 concentrado en Q1 — Q1×4',
        programas: [
          { label: 'Amortización deuda interna (flotante 2025 + propia)', val: 33718.76 },
        ]
      },
      { label: 'Capital Humano', val: 11725.08,
        nota: 'SAE + MESA + Infr. Educativa + Deporte + Social + Cultura — Q1×4', nueva25: true,
        programas: [
          { label: 'Fortalecimiento Infr. Educativa',     val:  2147.79 },
          { label: 'Emergencia Social y Seg. Alimentaria',val:  3178.44 },
          { label: 'Primera Infancia y Jardines',         val:  2371.92 },
          { label: 'MESA Bonaerense',                     val:  2078.20 },
          { label: 'Niñez, Adolescencia y Familia',       val:  1667.80 },
          { label: 'Hábitat, Vivienda y Reg. dominial',   val:  1604.66 },
          { label: 'SAE - Servicio Alimentario Escolar',  val:  1043.04 },
          { label: 'Promoción Cultural y Patrimonial',    val:  1589.24 },
          { label: 'Desarrollo Deportivo',                val:  1231.76 },
          { label: 'Fortalecimiento Escuelas',            val:   685.94 },
        ]
      },
      { label: 'Obras Públicas y Des. Urbano', val: 15092.52,
        nota: 'Obras Viales + Serv. Generales + Movilidad + Licencias — Q1×4',
        programas: [
          { label: 'Obras Viales y de Infraestructura',  val: 10796.55 },
          { label: 'Servicios Generales (Obras Púb.)',   val:  2470.53 },
          { label: 'Plan Integral de Movilidad',         val:   715.40 },
          { label: 'Licencias de Conducir',              val:   333.28 },
          { label: 'Desarrollo Urbano y Hábitat Sust.',  val:   570.23 },
          { label: 'Plan Urbano Estratégico',            val:    87.17 },
          { label: 'Ord. Centralidades y Estacionamiento',val:  119.42 },
        ]
      },
      { label: 'Secretaría de Salud', val: 10283.04,
        nota: 'Complejo hospitalario + APS + SAME + especialidades — Q1×4',
        programas: [
          { label: 'Fortalec. Sistema Atención Primaria', val:  5252.11 },
          { label: 'Fortalec. Compl. Hospitalario',       val:  2047.47 },
          { label: 'Fortalec. Sistema Atención Médica (SAME)', val: 1315.24 },
          { label: 'Fortalec. Centro Especialidades',     val:   892.30 },
          { label: 'Programa Salud Mental',               val:   247.43 },
          { label: 'Determinantes Sociales de la Salud',  val:   524.50 },
        ]
      },
      { label: 'Secretaría de Seguridad', val: 6836.84,
        nota: 'Protección ciudadana + Video vigilancia + Emergencias — Q1×4',
        programas: [
          { label: 'Fortalec. Sistema Protección Ciudadana',val: 2514.32 },
          { label: 'Servicios Seguridad y Emergencias',     val: 1218.06 },
          { label: 'Fortalec. Sistema Video Vigilancia',    val: 1436.52 },
          { label: 'Fortalec. Sistema Seguridad Vial',      val:  858.21 },
          { label: 'Planificación y Coordinación Seguridad',val:  449.60 },
          { label: 'Centro de Atención a las Víctimas',     val:  360.17 },
        ]
      },
      { label: 'Trabajo y Producción', val: 3755.24,
        nota: 'Plan Seg. e Higiene + Emprendedores + Comercial — Q1×4',
        programas: [
          { label: 'Plan Anual Seg., Higiene y Ord. Esp. Púb.', val: 2779.62 },
          { label: 'Fortalecimiento de Inversiones y Emprendedores', val: 490.19 },
          { label: 'Desarrollo Comercial y Prom. Industrial',  val:  156.53 },
          { label: 'Desarrollo Parque Industrial',             val:   18.10 },
          { label: 'Microcréditos 3F Emprende',                val:    4.80 },
        ]
      },
      { label: 'Coordinación de Gabinete', val: 3608.20,
        nota: 'Comunicación + Legal + Asuntos Institucionales + Juventud — Q1×4',
        programas: [
          { label: 'Comunicación y Prensa',                  val: 1227.67 },
          { label: 'Coordinación y Adm. de Gastos',          val:  893.76 },
          { label: 'Legal y Técnica',                        val:  884.99 },
          { label: 'Asuntos Institucionales',                val:  292.88 },
          { label: 'Juventud',                               val:  308.88 },
        ]
      },
      { label: 'Finanzas y Efic. del Estado', val: 4765.80,
        nota: 'Administración ingresos, gastos, modernización — Q1×4',
        programas: [
          { label: 'Coordinación y Adm. de Ingresos',        val: 1640.41 },
          { label: 'Coordinación y Adm. de Gastos',          val:  769.99 },
          { label: 'Coordinación y Adm. de la Modernización',val: 1253.91 },
          { label: 'Coordinación y Adm. de Recursos Humanos',val: 1100.41 },
        ]
      },
      { label: 'Secretaría General', val: 2024.56,
        nota: 'Gobierno Cercano + Protocolo + Coord. General — Q1×4',
        programas: [
          { label: 'Gobierno Cercano y Accesible',    val: 1513.11 },
          { label: 'Protocolo y Ceremonial',          val:  162.58 },
          { label: 'Coord. General de la Gestión',   val:  348.89 },
        ]
      },
      { label: 'H.C.D.', val: 2736.68,
        nota: 'Q1×4',
        programas: [
          { label: 'HCD - Actividades Centrales', val: 2736.68 },
        ]
      },
    ],

    personal: {
      total: null,       // sin dato al Q1
      permanente: null,
      mensualizado: null,
      gastoTotal: 46439.72,  // Q1 × 4
      paritaria: null,
      porSecretaria: [],
      componentes: [
        { label: 'Personal permanente', val: 17628.55 },  // Q1 × 4
        { label: 'Personal temporario', val: 23085.00 },
        { label: 'Servicios extraordinarios (HE)', val: 4437.36 },
        { label: 'Asignaciones familiares', val: 1288.87 },
      ],
    },
  },

  /* ─────────────── 2027 ─────────────── */
  /* Presupuesto aprobado (cuando exista) */
  2027: {
    status: 'pending',
    fuente: 'Pendiente — Presupuesto 2027 (a aprobar en el HCD)',
    ipc: null,
    resumen: null,
    recursos: null,
    gastos: null,
    secretarias: [],
    personal: { total: null, porSecretaria: [], componentes: [] },
  },

};
