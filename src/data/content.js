// Todo el contenido sale del PDF "Imperio Romano · Grupo 4" (Octubre 2026).

export const meta = {
  grupo: 'Grupo 4',
  fecha: 'Octubre 2026',
  titulo: 'Imperio Romano',
  subtitulo: 'Mapa y línea del tiempo en los días del Nuevo Testamento',
  pie: 'El imperio en su máxima extensión · 117 d.C.',
};

export const integrantes = [
  'Emanuel Acevedo', 'Gabriela Balansini', 'Azucena Gomez', 'Laura Gonzalez',
  'Andrea Luna', 'Magali Quevedo', 'Brian Rios', 'Rodrigo Rodriguez',
  'Agustina Tissera', 'Benjamin Tissera', 'Dario Tissera',
];

export const fuentes = [
  'F. F. Bruce, Israel y las Naciones',
  'C. F. Pfeiffer, Atlas Completo de la Biblia',
  'M. F. Unger, Manual Bíblico',
  'F. H. Wight, Usos y Costumbres de las Tierras Bíblicas',
];

// Capítulos para el HUD
export const capitulos = [
  { id: 'inicio',   num: 'I',   nombre: 'Imperio Romano',      coord: '41.8925° N · 12.4853° E', lugar: 'Foro Romano' },
  { id: 'daniel',   num: 'II',  nombre: 'Profecía · Daniel 2', coord: '32.5363° N · 44.4209° E', lugar: 'Babilonia' },
  { id: 'linea',    num: 'III', nombre: 'Línea del tiempo',    coord: '41.8925° N · 12.4853° E', lugar: 'Roma' },
  { id: 'zoom',     num: 'IV',  nombre: 'Nuevo Testamento',    coord: '31.7683° N · 35.2137° E', lugar: 'Jerusalén' },
  { id: 'mapa',     num: 'V',   nombre: 'Mapa · 117 d.C.',     coord: '41.0082° N · 28.9784° E', lugar: 'Mediterráneo' },
  { id: 'creditos', num: 'VI',  nombre: 'Grupo 4',             coord: '—',                        lugar: 'Fin' },
];

// Daniel 2 — la estatua. focus = punto de la imagen (0–1) donde enfoca la cámara.
export const reinos = [
  { parte: 'Cabeza de oro', metal: 'ORO', imperio: 'Imperio Babilónico', fecha: '605–539 a.C.', ref: 'Dn 2:37–38',
    cita: 'Tú eres aquella cabeza de oro.', tono: '#e2b04a', focus: [0.51, 0.16, 3.0] },
  { parte: 'Pecho y brazos de plata', metal: 'PLATA', imperio: 'Imperio Medo-Persa', fecha: '539–331 a.C.', ref: 'Dn 2:39',
    cita: 'Después de ti se levantará otro reino inferior al tuyo.', tono: '#c9ccd1', focus: [0.51, 0.33, 2.6] },
  { parte: 'Vientre y muslos de bronce', metal: 'BRONCE', imperio: 'Imperio Griego', fecha: 'desde 331 a.C.', ref: 'Dn 2:39',
    cita: 'Y luego un tercer reino de bronce, el cual dominará sobre toda la tierra.', tono: '#c07a3c', focus: [0.51, 0.49, 2.6] },
  { parte: 'Piernas de hierro', metal: 'HIERRO', imperio: 'Imperio Romano', fecha: 'desde 63 a.C. en Judea', ref: 'Dn 2:40',
    cita: 'Y el cuarto reino será fuerte como hierro.', tono: '#9aa3ad', focus: [0.51, 0.66, 2.5], roma: true },
  { parte: 'Pies de hierro y barro', metal: 'BARRO', imperio: 'Reino dividido', fecha: '', ref: 'Dn 2:41–43',
    cita: 'Parte del reino será fuerte, y parte será frágil.', tono: '#8d6b4f', focus: [0.5, 0.82, 2.7] },
  { parte: 'La piedra', metal: 'PIEDRA', imperio: 'Reino de Dios', fecha: '', ref: 'Dn 2:34–35, 44–45',
    cita: 'El Dios del cielo levantará un reino que no será jamás destruido.', tono: '#b9b2a6', focus: [0.63, 0.83, 2.7] },
];

// Línea del tiempo — eras (escala no proporcional: "peso" = ancho relativo)
export const eras = [
  { id: 1, nombre: 'Monarquía',                                   desde: -753, hasta: -509, peso: 1.0, color: '#8e2a1f' },
  { id: 2, nombre: 'República temprana',                          desde: -509, hasta: -264, peso: 1.0, color: '#c4532a' },
  { id: 3, nombre: 'Guerras púnicas y dominio del Mediterráneo',  desde: -264, hasta: -133, peso: 1.25, color: '#d99a2b' },
  { id: 4, nombre: 'Fin de la República',                         desde: -133, hasta: -27,  peso: 1.0, color: '#b9975b' },
  { id: 5, nombre: 'Alto Imperio',                                desde: -27,  hasta: 117,  peso: 1.5, color: '#5e8c5a' },
  { id: 6, nombre: 'Bajo Imperio y Occidente',                    desde: 117,  hasta: 476,  peso: 1.4, color: '#2e4a68' },
  { id: 7, nombre: 'Imperio de Oriente (Bizantino)',              desde: 476,  hasta: 1453, peso: 1.7, color: '#5b3c8c' },
];

// lado: 'roma' (arriba) o 'biblia' (abajo, historia bíblica y cristiana)
export const hitos = [
  { anio: -753, fecha: '753 a.C.',     titulo: 'Fundación de Roma',                                   lado: 'roma' },
  { anio: -509, fecha: '509 a.C.',     titulo: 'Nace la República',                                   lado: 'roma' },
  { anio: -205, fecha: '264–146 a.C.', titulo: 'Guerras púnicas; cae Cartago',                        lado: 'roma' },
  { anio: -44,  fecha: '44 a.C.',      titulo: 'Asesinato de Julio César',                            lado: 'roma' },
  { anio: -27,  fecha: '27 a.C.',      titulo: 'Augusto, primer emperador',                           lado: 'roma' },
  { anio: 16,   fecha: '63 a.C. – 96 d.C.', titulo: 'Época del Nuevo Testamento',                    lado: 'biblia', nt: true },
  { anio: 117,  fecha: '117 d.C.',     titulo: 'Máxima extensión con Trajano',                        lado: 'roma' },
  { anio: 313,  fecha: '313 d.C.',     titulo: 'Edicto de Milán: libertad a los cristianos',          lado: 'biblia' },
  { anio: 395,  fecha: '395 d.C.',     titulo: 'División definitiva: Occidente y Oriente',            lado: 'biblia' },
  { anio: 410,  fecha: '410 d.C.',     titulo: 'Alarico saquea Roma',                                 lado: 'roma' },
  { anio: 476,  fecha: '476 d.C. · 1.ª caída', titulo: 'Odoacro depone a Rómulo Augústulo: fin de Occidente', lado: 'roma', caida: true },
  { anio: 546,  fecha: '527–565',      titulo: 'Justiniano reconquista Italia y el norte de África',  lado: 'biblia' },
  { anio: 1204, fecha: '1204',         titulo: 'La Cuarta Cruzada saquea Constantinopla',             lado: 'biblia' },
  { anio: 1453, fecha: '1453 d.C. · 2.ª caída', titulo: 'Mehmed II conquista Constantinopla',         lado: 'roma', caida: true },
];

// Zoom NT — cada marca es una fecha clave (escala no proporcional)
export const marcas = ['63 a.C.', '27 a.C.', '4 a.C.', '6 d.C.', '14 d.C.', '37 d.C.', '41 d.C.', '44 d.C.', '52 d.C.',
  '54 d.C.', '58 d.C.', '68 d.C.', '69 d.C.', '70 d.C.', '79 d.C.', '81 d.C.', '96 d.C.'];

// desde/hasta = índice de marca
export const emperadores = [
  { nombre: 'República',  desde: 0,  hasta: 1,  fechas: '63–27 a.C.' },
  { nombre: 'Augusto',    desde: 1,  hasta: 4,  fechas: '27 a.C. – 14 d.C.' },
  { nombre: 'Tiberio',    desde: 4,  hasta: 5,  fechas: '14–37 d.C.' },
  { nombre: 'Calígula',   desde: 5,  hasta: 6,  fechas: '37–41 d.C.' },
  { nombre: 'Claudio',    desde: 6,  hasta: 9,  fechas: '41–54 d.C.' },
  { nombre: 'Nerón',      desde: 9,  hasta: 11, fechas: '54–68 d.C.' },
  { nombre: 'Galba · Otón · Vitelio', desde: 11, hasta: 12, fechas: '68–69 d.C.', corto: 'G·O·V' },
  { nombre: 'Vespasiano', desde: 12, hasta: 14, fechas: '69–79 d.C.' },
  { nombre: 'Tito',       desde: 14, hasta: 15, fechas: '79–81 d.C.' },
  { nombre: 'Domiciano',  desde: 15, hasta: 16, fechas: '81–96 d.C.' },
];

export const judea = [
  { marca: 0,  hasta: 0,  fecha: '63 a.C.',    titulo: 'Judea bajo el mando romano: conquista de Jerusalén' },
  { marca: 2,  hasta: 2,  fecha: '4 a.C.',     titulo: 'Herodes el Grande' },
  { marca: 3,  hasta: 3,  fecha: '6 d.C.',     titulo: 'Judea es provincia romana' },
  { marca: 4,  hasta: 5,  fecha: '14–37 d.C.', titulo: 'Prefecto: Poncio Pilato' },
  { marca: 6,  hasta: 7,  fecha: '41–44 d.C.', titulo: 'Herodes Agripa I, rey de Judea' },
  { marca: 8,  hasta: 10, fecha: '52–58 d.C.', titulo: 'Félix, procurador de Judea' },
  { marca: 13, hasta: 13, fecha: '70 d.C.',    titulo: 'Templo de Jerusalén destruido', grave: true },
];

// Mapa — pasos de la secuencia. vb = viewBox [x, y, w, h] sobre 780×640
export const mapaPasos = [
  { era: 0, rango: '117 d.C.', titulo: 'El Imperio Romano', texto: 'En su máxima extensión, con Trajano. Cada color indica en qué etapa de la línea del tiempo Roma conquistó ese territorio.', vb: [0, 60, 780, 520] },
  { era: 1, rango: '753–509 a.C.', titulo: 'Monarquía', texto: 'Roma y el Lacio.', vb: [270, 255, 150, 115] },
  { era: 2, rango: '509–264 a.C.', titulo: 'República temprana', texto: 'Italia.', vb: [230, 215, 260, 200] },
  { era: 3, rango: '264–133 a.C.', titulo: 'Guerras púnicas y dominio del Mediterráneo', texto: 'Sicilia, Hispania, África, Grecia y Asia.', vb: [60, 200, 600, 400] },
  { era: 4, rango: '133–27 a.C.', titulo: 'Fin de la República', texto: 'Galia, Siria, Judea (63 a.C.) y Egipto.', vb: [60, 110, 720, 500] },
  { era: 5, rango: '27 a.C.–117 d.C.', titulo: 'Alto Imperio', texto: 'Britania, Danubio, Dacia y Arabia.', vb: [0, 60, 780, 560] },
  { era: 6, rango: '395 d.C.', titulo: 'Bajo Imperio', texto: 'División definitiva entre Occidente y Oriente.', vb: [0, 60, 780, 560] },
  { era: 7, rango: '476–1453 d.C.', titulo: 'Imperio de Oriente', texto: 'Capital: Constantinopla.', vb: [330, 200, 400, 300] },
  { era: 8, rango: 'Nuevo Testamento', titulo: 'Ciudades del Nuevo Testamento', texto: 'Jerusalén, Cesarea, Damasco, Antioquía, Tarso, Éfeso, Filipos, Tesalónica, Atenas, Corinto, Malta y Roma.', vb: [300, 280, 455, 265] },
];

// Coordenadas en el sistema del mapa (780×640), extraídas del PDF
export const ciudades = [
  { n: 'Roma', x: 340.4, y: 316.5, nt: true, capital: true },
  { n: 'Jerusalén', x: 622.0, y: 444.6, nt: true, destacada: true },
  { n: 'Cesarea', x: 615.4, y: 434.9, nt: true, lado: 'izq' },
  { n: 'Damasco', x: 629.5, y: 416.3, nt: true },
  { n: 'Antioquía', x: 619.0, y: 377.4, nt: true },
  { n: 'Tarso', x: 602.0, y: 370.1, nt: true, lado: 'izq', arriba: true },
  { n: 'Éfeso', x: 511.3, y: 369.5, nt: true },
  { n: 'Filipos', x: 471.7, y: 327.7, nt: true, arriba: true },
  { n: 'Tesalónica', x: 457.1, y: 334.3, nt: true, lado: 'izq' },
  { n: 'Atenas', x: 469.0, y: 373.1, nt: true, abajo: true },
  { n: 'Corinto', x: 459.2, y: 375.0, nt: true, lado: 'izq', abajo: true },
  { n: 'Malta', x: 358.7, y: 406.7, nt: true },
  { n: 'Alejandría', x: 556.0, y: 465.4 },
  { n: 'Cartago', x: 310.5, y: 389.9, lado: 'izq' },
  { n: 'Londinium', x: 229.9, y: 158.4 },
  { n: 'Constantinopla', x: 523.9, y: 320.6, oriente: true },
];

export const regiones = [
  ['BRITANIA', 222, 140], ['GALIA', 255, 245], ['HISPANIA', 152, 340], ['GERMANIA', 345, 180, 'fuera'],
  ['DACIA', 500, 265], ['ITALIA', 400, 362], ['ÁFRICA', 312, 452], ['MAURITANIA', 165, 442],
  ['ASIA', 580, 362], ['CAPADOCIA', 640, 355], ['SIRIA', 668, 410], ['EGIPTO', 600, 570],
  ['PARTIA', 765, 380, 'fuera'], ['ARABIA', 765, 455, 'fuera'],
  ['Mar Mediterráneo', 450, 455, 'mar'], ['Mar Negro', 610, 290, 'mar'], ['Océano Atlántico', 90, 240, 'mar'],
];
