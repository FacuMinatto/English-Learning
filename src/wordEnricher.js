// wordEnricher.js - Comprehensive knowledge base for rich explanations and authentic bilingual context examples

export const wordKnowledge = {
  // --- REDES & INFRAESTRUCTURA (NETWORKING & CLOUD) ---
  "Subnet": {
    category: "💻 Redes / IT",
    explanation: "Una subred es una subdivisión lógica de una red IP grande. Permite dividir una red en partes más pequeñas y seguras, mejorando el tráfico y facilitando la administración de equipos.",
    exampleEn: "The network administrator configured a private subnet to isolate the database servers.",
    exampleEs: "El administrador de red configuró una subred privada para aislar los servidores de bases de datos."
  },
  "Firewall": {
    category: "🔒 Ciberseguridad",
    explanation: "Sistema de seguridad que monitorea y filtra el tráfico de red entrante y saliente, bloqueando accesos no autorizados o ataques cibernéticos según reglas específicas.",
    exampleEn: "The corporate firewall blocked unauthorized external connection attempts.",
    exampleEs: "El cortafuegos corporativo bloqueó intentos no autorizados de conexión externa."
  },
  "Gateway": {
    category: "💻 Redes / IT",
    explanation: "Punto de enlace o pasarela que conecta dos redes diferentes con protocolos o estructuras distintas, como el router que une tu red doméstica con Internet.",
    exampleEn: "The default gateway routes internal computer traffic out to the internet.",
    exampleEs: "La puerta de enlace predeterminada enruta el tráfico de las computadoras internas hacia internet."
  },
  "Bandwidth": {
    category: "💻 Redes / IT",
    explanation: "La capacidad máxima de transferencia de datos a través de una conexión de red en un periodo determinado (medida en Mbps o Gbps).",
    exampleEn: "Video streaming in 4K resolution requires significantly higher bandwidth.",
    exampleEs: "Transmitir video en resolución 4K requiere un ancho de banda significativamente mayor."
  },
  "Latency": {
    category: "💻 Redes / IT",
    explanation: "El tiempo de retardo o demora (ping) que tarda un paquete de datos en viajar desde el origen hasta su destino a través de la red.",
    exampleEn: "Low latency is essential for competitive online gaming and live audio calls.",
    exampleEs: "La baja latencia es esencial para los videojuegos online competitivos y las llamadas en vivo."
  },
  "Throughput": {
    category: "💻 Rendimiento",
    explanation: "La cantidad real y efectiva de datos transferidos con éxito en un tiempo dado, a diferencia del ancho de banda que representa solo la capacidad teórica.",
    exampleEn: "Network throughput dropped during peak hours because of heavy traffic congestion.",
    exampleEs: "El rendimiento de la red cayó en horas pico debido a la fuerte congestión de tráfico."
  },
  "Router": {
    category: "💻 Redes / IT",
    explanation: "Dispositivo que analiza los paquetes de datos y decide la mejor ruta física y lógica para reenviarlos entre diferentes redes informáticas.",
    exampleEn: "We had to restart the office router to restore the wireless internet connection.",
    exampleEs: "Tuvimos que reiniciar el enrutador de la oficina para restablecer la conexión inalámbrica."
  },
  "Switch": {
    category: "💻 Redes / IT",
    explanation: "Dispositivo de red local que conecta múltiples computadoras o impresoras en una misma oficina y distribuye los datos solo al equipo destinatario exacto.",
    exampleEn: "The network switch connects all the workstations directly to the local server.",
    exampleEs: "El switch de red conecta todas las estaciones de trabajo directamente al servidor local."
  },
  "Proxy": {
    category: "🔒 Ciberseguridad",
    explanation: "Servidor intermediario que se sitúa entre el usuario e Internet, filtrando solicitudes, acelerando cargas mediante caché o anonimizando la dirección IP.",
    exampleEn: "Employees browse the web through a reverse proxy to protect internal company IP addresses.",
    exampleEs: "Los empleados navegan por la web mediante un proxy inverso para proteger las direcciones IP internas."
  },
  "Packet": {
    category: "💻 Redes / IT",
    explanation: "Unidad fundamental en la que se divide cualquier archivo o mensaje digital para viajar por Internet antes de reconstruirse en el destino.",
    exampleEn: "If a single packet is lost during transmission, the TCP protocol requests a retransmission.",
    exampleEs: "Si se pierde un solo paquete durante la transmisión, el protocolo TCP solicita un reenvío."
  },
  "Protocol": {
    category: "💻 Redes / IT",
    explanation: "Conjunto formal de reglas y estándares que determinan el formato y secuencia en que dos dispositivos deben comunicarse e intercambiar datos.",
    exampleEn: "HTTPS is the encrypted communication protocol standard for secure web navigation.",
    exampleEs: "HTTPS es el protocolo de comunicación cifrado estándar para la navegación web segura."
  },
  "Node": {
    category: "💻 Redes / IT",
    explanation: "Cualquier punto activo o dispositivo conectado dentro de una red o sistema distribuido capaz de procesar, almacenar o reenviar información.",
    exampleEn: "When one server node fails, the distributed cluster automatically redistributes the workload.",
    exampleEs: "Cuando un nodo de servidor falla, el clúster distribuido redistribuye automáticamente la carga de trabajo."
  },
  "Handshake": {
    category: "💻 Redes / IT",
    explanation: "Acuerdo inicial y automático entre dos dispositivos donde validan protocolos, claves de cifrado y parámetros antes de empezar a transferir datos.",
    exampleEn: "The browser and the server complete an SSL handshake before transmitting personal credentials.",
    exampleEs: "El navegador y el servidor completan un protocolo de enlace SSL antes de transmitir credenciales personales."
  },
  "Domain": {
    category: "🌐 Web",
    explanation: "El nombre legible y fácil de recordar asignado a una dirección IP en Internet (por ejemplo 'google.com' en vez de números complejos).",
    exampleEn: "The startup purchased a custom domain name for their new web application.",
    exampleEs: "La startup compró un nombre de dominio personalizado para su nueva aplicación web."
  },
  "Host": {
    category: "🌐 Web",
    explanation: "Computadora o servidor conectado a una red que provee servicios, archivos o aloja sitios web a los que otros usuarios acceden.",
    exampleEn: "Our cloud host provides automatic backups and ninety-nine percent uptime guarantee.",
    exampleEs: "Nuestro host en la nube provee copias de seguridad automáticas y garantía de disponibilidad del 99%."
  },

  // --- PROGRAMACIÓN Y DESARROLLO (CODING & ARCHITECTURE) ---
  "Cache": {
    category: "⚡ Rendimiento",
    explanation: "Memoria ultrarrápida temporal que guarda copias de datos recién consultados para servirlos al instante sin tener que volver a calcularlos o buscarlos en el disco.",
    exampleEn: "Clearing your browser cache forces the web page to download the latest styling files.",
    exampleEs: "Borrar la memoria caché del navegador fuerza a la página a descargar los archivos de estilo más recientes."
  },
  "Buffer": {
    category: "⚡ Rendimiento",
    explanation: "Espacio en memoria RAM asignado para retener datos temporalmente mientras se mueven de un dispositivo o proceso a otro a ritmos de velocidad distintos.",
    exampleEn: "The streaming video paused for a second while refilling the audio buffer.",
    exampleEs: "El video en streaming se pausó un segundo mientras rellenaba el búfer de audio."
  },
  "Query": {
    category: "🗄️ Bases de Datos",
    explanation: "Consulta o solicitud formal enviada a una base de datos para buscar, filtrar, insertar o actualizar registros específicos.",
    exampleEn: "The backend engineer optimized the database query to return search results in milliseconds.",
    exampleEs: "El ingeniero backend optimizó la consulta a la base de datos para devolver resultados en milisegundos."
  },
  "Fetch": {
    category: "⚡ Programación",
    explanation: "Operación en programación donde una aplicación solicita y descarga información remota desde un servidor o API externa.",
    exampleEn: "We fetch user preferences from the backend API as soon as the application opens.",
    exampleEs: "Obtenemos las preferencias del usuario desde la API del backend apenas se abre la aplicación."
  },
  "Deployment": {
    category: "🚀 DevOps",
    explanation: "Puesta en marcha: proceso de empaquetar, configurar y publicar software en un entorno de producción para que los usuarios puedan utilizarlo.",
    exampleEn: "The automated CI/CD pipeline triggered a new production deployment after passing all tests.",
    exampleEs: "El pipeline automatizado de CI/CD ejecutó un nuevo despliegue a producción tras pasar todas las pruebas."
  },
  "Encryption": {
    category: "🔒 Ciberseguridad",
    explanation: "Técnica matemática que convierte texto y datos legibles en un código indescifrable que solo puede leerse con la clave secreta adecuada.",
    exampleEn: "End-to-end encryption ensures that third parties cannot intercept your private chats.",
    exampleEs: "El cifrado de extremo a extremo garantiza que terceros no puedan interceptar tus chats privados."
  },
  "Decryption": {
    category: "🔒 Ciberseguridad",
    explanation: "El proceso inverso al cifrado: descodificar los datos ilegibles para volver a obtener el contenido original con la clave correspondiente.",
    exampleEn: "Decryption occurs automatically on your device once the authentic security key is verified.",
    exampleEs: "El descifrado ocurre automáticamente en tu dispositivo una vez verificada la clave de seguridad auténtica."
  },
  "Algorithm": {
    category: "🧠 Lógica",
    explanation: "Serie ordenada y rigurosa de instrucciones lógicas paso a paso diseñadas para resolver un problema computacional o tomar decisiones automáticas.",
    exampleEn: "Recommendation algorithms analyze user behavior to suggest relevant vocabulary decks.",
    exampleEs: "Los algoritmos de recomendación analizan el comportamiento del usuario para sugerir mazos de vocabulario relevantes."
  },
  "Repository": {
    category: "🛠️ Control de Versiones",
    explanation: "Espacio de almacenamiento digital (como en Git/GitHub) donde se guarda todo el código de un proyecto junto con su historial completo de cambios.",
    exampleEn: "Developers can clone the Git repository and collaborate on the same open-source project.",
    exampleEs: "Los desarrolladores pueden clonar el repositorio Git y colaborar en el mismo proyecto de código abierto."
  },
  "Commit": {
    category: "🛠️ Control de Versiones",
    explanation: "Guardado permanente de una serie de cambios en el código fuente, documentado con un mensaje explicativo de lo que se modificó.",
    exampleEn: "Remember to make small, descriptive commits so your teammates can review changes easily.",
    exampleEs: "Recuerda hacer commits pequeños y descriptivos para que tus compañeros puedan revisar los cambios fácilmente."
  },
  "Branch": {
    category: "🛠️ Control de Versiones",
    explanation: "Línea paralela e independiente de trabajo dentro de Git que permite crear nuevas funciones sin poner en riesgo la versión principal del programa.",
    exampleEn: "She created a new Git branch to test the dark mode UI design without breaking the master branch.",
    exampleEs: "Ella creó una nueva rama de Git para probar el diseño del modo oscuro sin alterar la rama principal."
  },
  "Merge": {
    category: "🛠️ Control de Versiones",
    explanation: "La unión o fusión de dos ramas de desarrollo de código en una sola rama definitiva tras revisar que todo funcione correctamente.",
    exampleEn: "After the code review was approved, the team merged the pull request into the main branch.",
    exampleEs: "Tras aprobarse la revisión de código, el equipo fusionó la solicitud de cambios en la rama principal."
  },
  "Debugging": {
    category: "🐞 Desarrollo",
    explanation: "El proceso meticuloso de inspeccionar, encontrar y solucionar errores, fallos lógicos o 'bugs' en un programa de software.",
    exampleEn: "Console logs and breakpoint tools make debugging asynchronous code much easier.",
    exampleEs: "Los registros de consola y los puntos de interrupción hacen que depurar código asíncrono sea mucho más fácil."
  },
  "Compilation": {
    category: "⚙️ Sistemas",
    explanation: "La transformación del código fuente escrito por humanos (como Java, C++ o Rust) en instrucciones binarias de máquina que el procesador entiende.",
    exampleEn: "The mobile app compilation succeeded and generated the final Android APK package.",
    exampleEs: "La compilación de la app móvil tuvo éxito y generó el paquete final de Android en formato APK."
  },
  "Syntax": {
    category: "💻 Programación",
    explanation: "Las reglas gramaticales y de puntuación exactas que definen cómo deben combinarse las palabras y símbolos en un lenguaje de programación.",
    exampleEn: "A missing semicolon or bracket can cause a syntax error that halts code execution.",
    exampleEs: "Un punto y coma o un corchete faltante pueden causar un error de sintaxis que detenga la ejecución del código."
  },
  "Variable": {
    category: "💻 Programación",
    explanation: "Contenedor con nombre en la memoria del computador que guarda un valor específico que puede cambiar a lo largo del tiempo.",
    exampleEn: "We defined a variable to store the user's current study streak count.",
    exampleEs: "Definimos una variable para almacenar la racha actual de estudio del usuario."
  },
  "Array": {
    category: "💻 Programación",
    explanation: "Estructura de datos que almacena una lista ordenada de elementos (números, palabras u objetos) bajo un mismo nombre identificador.",
    exampleEn: "The flashcard deck is represented as an array of vocabulary objects in the state.",
    exampleEs: "El mazo de tarjetas se representa como un arreglo de objetos de vocabulario en el estado."
  },
  "String": {
    category: "💻 Programación",
    explanation: "Tipo de dato informático que representa una secuencia continua de caracteres de texto, palabras o frases.",
    exampleEn: "The translation is returned as a plain text string from the API.",
    exampleEs: "La traducción se devuelve como una cadena de texto sin formato desde la API."
  },
  "Boolean": {
    category: "💻 Programación",
    explanation: "Tipo de dato lógico binario que solo puede tener dos posibles valores: verdadero (true) o falso (false).",
    exampleEn: "The soundEnabled flag is a boolean variable that toggles audio effects on or off.",
    exampleEs: "La bandera soundEnabled es una variable booleana que activa o desactiva los efectos de sonido."
  },
  "Loop": {
    category: "💻 Programación",
    explanation: "Estructura de control de código que repite un bloque de instrucciones múltiples veces de manera automática mientras se cumpla una condición.",
    exampleEn: "The algorithm runs an iterative loop over each card to verify review due dates.",
    exampleEs: "El algoritmo ejecuta un bucle iterativo sobre cada tarjeta para verificar las fechas de repaso pendientes."
  },
  "Function": {
    category: "💻 Programación",
    explanation: "Bloque autónomo y reutilizable de código que toma parámetros de entrada, realiza una tarea y devuelve un resultado.",
    exampleEn: "We wrote a helper function to calculate spaced repetition intervals automatically.",
    exampleEs: "Escribimos una función auxiliar para calcular automáticamente los intervalos de repetición espaciada."
  },
  "Database": {
    category: "🗄️ Bases de Datos",
    explanation: "Sistema organizado para almacenar, consultar y gestionar grandes volúmenes de información estructurada de forma segura y veloz.",
    exampleEn: "User progress and streak dates are persisted in a local database storage.",
    exampleEs: "El progreso y las fechas de racha del usuario se persisten en el almacenamiento de base de datos local."
  },
  "Middleware": {
    category: "🌐 Backend",
    explanation: "Software o función intermedia que inspecciona, transforma o autentica las peticiones web antes de que lleguen al destino final.",
    exampleEn: "The authorization middleware validates the user's login token before granting access.",
    exampleEs: "El middleware de autorización valida el token de inicio de sesión del usuario antes de otorgar acceso."
  },
  "Framework": {
    category: "🛠️ Herramientas",
    explanation: "Conjunto estandarizado de herramientas, librerías y estructuras que sirve como base preconstruida para programar aplicaciones completas.",
    exampleEn: "React is a popular component-based UI framework used to build modern interactive applications.",
    exampleEs: "React es un marco de trabajo de interfaces basado en componentes utilizado para crear apps modernas."
  },
  "Token": {
    category: "🔒 Ciberseguridad",
    explanation: "Clave digital cifrada y temporal generada por un servidor para comprobar la identidad del usuario sin enviar contraseñas en cada solicitud.",
    exampleEn: "The mobile app saves a secure authentication token to keep you logged in offline.",
    exampleEs: "La app móvil guarda un token de autenticación seguro para mantenerte conectado sin conexión."
  },
  "Cookie": {
    category: "🌐 Web",
    explanation: "Pequeño fragmento de datos que los sitios web guardan en el navegador para recordar tus preferencias, sesión o carrito de compras.",
    exampleEn: "This website saves a cookie so you do not have to select your theme mode every visit.",
    exampleEs: "Este sitio web guarda una cookie para que no tengas que seleccionar tu tema en cada visita."
  },
  "Session": {
    category: "🌐 Web",
    explanation: "El periodo de tiempo continuo durante el cual un usuario interactúa con una aplicación desde que inicia hasta que se cierra.",
    exampleEn: "Your study session progress is saved automatically so you never lose your answers.",
    exampleEs: "El progreso de tu sesión de estudio se guarda automáticamente para que nunca pierdas tus respuestas."
  },
  "Thread": {
    category: "⚙️ Rendimiento",
    explanation: "Línea o hilo de ejecución independiente dentro de un procesador que permite ejecutar múltiples tareas a la vez en segundo plano.",
    exampleEn: "Audio playback runs on a separate worker thread so the user interface never freezes.",
    exampleEs: "La reproducción de audio se ejecuta en un hilo separado para que la interfaz nunca se congele."
  },
  "Asynchronous": {
    category: "⚡ Programación",
    explanation: "Operación que se ejecuta en segundo plano sin bloquear el resto del programa, permitiendo que la interfaz siga respondiendo de inmediato.",
    exampleEn: "We make asynchronous network requests so the screen stays completely fluid while loading data.",
    exampleEs: "Hacemos solicitudes de red asíncronas para que la pantalla siga completamente fluida mientras carga datos."
  },
  "Synchronous": {
    category: "⚡ Programación",
    explanation: "Operación secuencial que bloquea la ejecución hasta que la tarea actual termine por completo antes de pasar a la siguiente.",
    exampleEn: "Synchronous file reading halts the program execution until the entire document is loaded.",
    exampleEs: "La lectura sincrónica de archivos detiene la ejecución del programa hasta que se carga todo el documento."
  },
  "Callback": {
    category: "⚡ Programación",
    explanation: "Función que se pasa como argumento a otra función para que se ejecute más tarde, una vez terminada una acción previa.",
    exampleEn: "We passed a callback function to trigger the celebration confetti when the animation finishes.",
    exampleEs: "Pasamos una función de retrollamada (callback) para activar el confeti cuando termina la animación."
  },
  "Promise": {
    category: "⚡ Programación",
    explanation: "Objeto en programación que representa un valor que estará disponible ahora, en el futuro o nunca (como el resultado de una descarga web).",
    exampleEn: "The JavaScript promise resolves once the voice synthesis engine finishes speaking the sentence.",
    exampleEs: "La promesa de JavaScript se resuelve una vez que el motor de síntesis de voz termina de pronunciar la frase."
  },
  "API": {
    category: "🌐 Arquitectura",
    explanation: "Interfaz de Programación de Aplicaciones: conjunto de definiciones y métodos que permite a dos programas de software comunicarse e intercambiar datos.",
    exampleEn: "The application uses a translation API to automatically convert new words to Spanish.",
    exampleEs: "La aplicación utiliza una API de traducción para convertir automáticamente palabras nuevas al español."
  },
  "Endpoint": {
    category: "🌐 Arquitectura",
    explanation: "Dirección URL específica de un servidor a la que una aplicación envía solicitudes para consultar o guardar recursos.",
    exampleEn: "The API endpoint returns a list of vocabulary flashcards formatted in JSON.",
    exampleEs: "El endpoint de la API devuelve una lista de tarjetas de vocabulario formateadas en JSON."
  },
  "Container": {
    category: "🚀 DevOps",
    explanation: "Paquete de software ligero y portátil que contiene una aplicación junto con todas sus dependencias para correr exactamente igual en cualquier máquina.",
    exampleEn: "Docker containers ensure your application runs reliably on servers, laptops, and the cloud.",
    exampleEs: "Los contenedores de Docker garantizan que tu aplicación corra de forma confiable en servidores, laptops y la nube."
  },
  "Kernel": {
    category: "⚙️ Sistemas Operativos",
    explanation: "El núcleo fundamental del sistema operativo (como Linux o Windows) que controla directamente el procesador, la memoria y el hardware del dispositivo.",
    exampleEn: "The Android operating system runs on top of an optimized Linux kernel.",
    exampleEs: "El sistema operativo Android funciona sobre un núcleo Linux optimizado."
  },
  "Driver": {
    category: "⚙️ Hardware",
    explanation: "Programa controlador que le enseña al sistema operativo cómo comunicarse y controlar un componente de hardware (como tarjeta gráfica o altavoz).",
    exampleEn: "Updating your audio driver fixed sound stuttering issues across all apps.",
    exampleEs: "Actualizar el controlador de audio solucionó los problemas de tartamudeo de sonido en todas las apps."
  },
  "Integer": {
    category: "💻 Programación",
    explanation: "Tipo de dato numérico que representa números enteros sin parte decimal (positivos, negativos o cero), fundamental para contar elementos e índices.",
    exampleEn: "The array index must always be a non-negative integer.",
    exampleEs: "El índice del arreglo siempre debe ser un número entero no negativo."
  },
  "Float": {
    category: "💻 Programación",
    explanation: "Tipo de dato numérico de coma flotante que permite representar valores con números decimales (como 3.14 o 99.95).",
    exampleEn: "Use a float data type to store accurate financial percentages and coordinates.",
    exampleEs: "Usa un tipo de dato float para guardar porcentajes financieros y coordenadas precisas."
  },
  "Inheritance": {
    category: "💻 Programación (POO)",
    explanation: "Principio de orientación a objetos donde una clase derivada hereda atributos y comportamientos de una clase padre, facilitando la reutilización de código.",
    exampleEn: "Class inheritance allows the AdminUser to inherit all base methods from the User class.",
    exampleEs: "La herencia de clases le permite al AdminUser heredar todos los métodos base de la clase User."
  },
  "Polymorphism": {
    category: "💻 Programación (POO)",
    explanation: "Propiedad que permite a objetos de distintas clases responder al mismo método de manera específica y adaptada a su propia naturaleza.",
    exampleEn: "Polymorphism lets different UI components implement their own custom render function.",
    exampleEs: "El polimorfismo permite que distintos componentes de interfaz implementen su propia función de renderizado."
  },
  "Encapsulation": {
    category: "💻 Programación (POO)",
    explanation: "La práctica de proteger y ocultar el estado interno y la lógica privada de un objeto, exponiendo solo una interfaz pública limpia y segura.",
    exampleEn: "Encapsulation prevents direct modification of critical private variables from outside the class.",
    exampleEs: "El encapsulamiento evita la modificación directa de variables privadas críticas desde fuera de la clase."
  },
  "REST": {
    category: "🌐 Arquitectura Web",
    explanation: "Estilo arquitectónico estándar para diseñar APIs web utilizando métodos HTTP (GET, POST, PUT, DELETE) con URLs limpias y comunicación sin estado.",
    exampleEn: "We designed a REST API so client mobile apps can easily communicate with the backend server.",
    exampleEs: "Diseñamos una API REST para que las aplicaciones móviles cliente puedan comunicarse fácilmente con el servidor backend."
  },
  "GraphQL": {
    category: "🌐 Arquitectura Web",
    explanation: "Lenguaje moderno de consultas para APIs creado por Meta que permite al cliente solicitar exactamente los campos necesarios en una única petición.",
    exampleEn: "GraphQL reduced network overhead by fetching only user names and profile pictures in one query.",
    exampleEs: "GraphQL redujo la sobrecarga de red al obtener únicamente los nombres y fotos de perfil en una sola consulta."
  },
  "Microservice": {
    category: "🚀 Arquitectura",
    explanation: "Enfoque de diseño donde una aplicación se estructura como un conjunto de servicios modulares pequeños, independientes y desplegables por separado.",
    exampleEn: "The payment gateway runs as an independent microservice to guarantee fault tolerance.",
    exampleEs: "La pasarela de pagos se ejecuta como un microservicio independiente para garantizar tolerancia a fallos."
  },
  "Monolith": {
    category: "🚀 Arquitectura",
    explanation: "Modelo tradicional donde todo el código, base de datos e interfaz de una aplicación están integrados en una única base de código indivisible.",
    exampleEn: "The startup began with a monolith application because it was fast to build and easy to deploy.",
    exampleEs: "La startup comenzó con una aplicación monolito porque era rápida de construir y fácil de desplegar."
  },
  "Serverless": {
    category: "☁️ Cloud Computing",
    explanation: "Modelo en la nube donde el proveedor gestiona los servidores automáticamente y el desarrollador solo paga por el tiempo exacto en que se ejecuta su código.",
    exampleEn: "Serverless functions automatically scale up when hundreds of users log in simultaneously.",
    exampleEs: "Las funciones serverless escalan automáticamente cuando cientos de usuarios inician sesión simultáneamente."
  },
  "Docker": {
    category: "🚀 DevOps",
    explanation: "Herramienta que empaqueta una aplicación y todo su entorno en contenedores ligeros que funcionan idénticamente en cualquier sistema operativo.",
    exampleEn: "We configured Docker so every developer works in the exact same environment without configuration issues.",
    exampleEs: "Configuramos Docker para que cada programador trabaje en el mismo entorno exacto sin problemas de configuración."
  },
  "Kubernetes": {
    category: "🚀 DevOps",
    explanation: "Sistema de código abierto para automatizar la implementación, escalado y gestión de clústeres de contenedores de aplicaciones.",
    exampleEn: "Kubernetes automatically replaces unhealthy containers to ensure uninterrupted service.",
    exampleEs: "Kubernetes reemplaza automáticamente los contenedores dañados para garantizar servicio ininterrumpido."
  },
  "Cluster": {
    category: "☁️ Infraestructura",
    explanation: "Grupo de múltiples servidores interconectados que colaboran estrechamente para actuar como una sola entidad con alta potencia y redundancia.",
    exampleEn: "The database cluster replicates data across three separate servers for high availability.",
    exampleEs: "El clúster de bases de datos replica información en tres servidores separados para alta disponibilidad."
  },
  "Load Balancer": {
    category: "☁️ Infraestructura",
    explanation: "Dispositivo o software que distribuye el tráfico web entrante entre varios servidores para evitar que alguno se sobrecargue y caiga.",
    exampleEn: "The load balancer evenly distributed incoming traffic to prevent server bottlenecks.",
    exampleEs: "El balanceador de carga distribuyó uniformemente el tráfico entrante para evitar cuellos de botella."
  },
  "Scalability": {
    category: "⚡ Rendimiento",
    explanation: "La capacidad de un software o sistema de manejar volúmenes crecientes de usuarios o carga sin perder velocidad ni estabilidad.",
    exampleEn: "High scalability allows the platform to handle millions of active learners without performance loss.",
    exampleEs: "La alta escalabilidad permite a la plataforma atender a millones de alumnos activos sin perder rendimiento."
  },
  "Backup": {
    category: "🔒 Seguridad",
    explanation: "Copia de seguridad periódica de los datos guardada en un lugar seguro para restaurar el sistema si ocurre una falla o pérdida.",
    exampleEn: "Automated daily backups ensure that user study progress is never permanently lost.",
    exampleEs: "Las copias de seguridad diarias automatizadas garantizan que el progreso de estudio nunca se pierda."
  },
  "Storage": {
    category: "💾 Almacenamiento",
    explanation: "Dispositivo físico o servicio en la nube donde se retiene la información de manera persistente a corto o largo plazo.",
    exampleEn: "Cloud storage provides infinite capacity to save multimedia vocabulary lessons.",
    exampleEs: "El almacenamiento en la nube provee capacidad infinita para guardar lecciones multimedia de vocabulario."
  },
  "RAM": {
    category: "⚙️ Hardware",
    explanation: "Memoria de acceso aleatorio de ultra-alta velocidad que el procesador usa para almacenar y acceder a los datos de las aplicaciones abiertas.",
    exampleEn: "Adding sixteen gigabytes of RAM significantly improved computer multitasking performance.",
    exampleEs: "Agregar 16 gigabytes de RAM mejoró notablemente el rendimiento multitarea de la computadora."
  },
  "CPU": {
    category: "⚙️ Hardware",
    explanation: "Unidad Central de Procesamiento: el circuito principal o cerebro del computador que ejecuta los cálculos e instrucciones de los programas.",
    exampleEn: "The multicore CPU processed background tasks efficiently without slowing down user clicks.",
    exampleEs: "La CPU multinúcleo procesó tareas de fondo de forma eficiente sin ralentizar los clics del usuario."
  },
  "GPU": {
    category: "⚙️ Hardware",
    explanation: "Unidad de Procesamiento Gráfico: chip especializado en procesar gráficos en 3D, animaciones complejas e inteligencia artificial a gran velocidad.",
    exampleEn: "Modern smartphones use dedicated GPU acceleration to render fluid 120Hz interface transitions.",
    exampleEs: "Los teléfonos inteligentes modernos usan aceleración por GPU dedicada para renderizar transiciones fluidas a 120Hz."
  },
  "Motherboard": {
    category: "⚙️ Hardware",
    explanation: "Placa base que conecta físicamente e interconecta eléctricamente el procesador, la memoria, el almacenamiento y todos los componentes del equipo.",
    exampleEn: "The technician mounted the CPU and memory modules onto the new motherboard.",
    exampleEs: "El técnico montó la CPU y los módulos de memoria en la nueva placa base."
  },
  "Peripheral": {
    category: "⚙️ Hardware",
    explanation: "Cualquier dispositivo auxiliar externo que se conecta a la computadora para interactuar con ella (como teclado, mouse, monitor o auriculares).",
    exampleEn: "Wireless peripherals connect via Bluetooth to keep the study desk clean and organized.",
    exampleEs: "Los periféricos inalámbricos se conectan por Bluetooth para mantener el escritorio limpio y organizado."
  },
  "Shell": {
    category: "💻 Sistemas Operativos",
    explanation: "Intérprete o terminal de comandos que permite al usuario interactuar directamente con el sistema operativo escribiendo órdenes directas.",
    exampleEn: "Developers use the bash shell to execute build commands and manage files quickly.",
    exampleEs: "Los programadores usan la terminal shell de bash para ejecutar comandos de compilación y gestionar archivos rápidamente."
  },
  "Goal": {
    category: "🎯 Hábitos / Estudio",
    explanation: "Objetivo o meta que te propones alcanzar con constancia y esfuerzo diario.",
    exampleEn: "Setting a daily study goal helps maintain consistent learning habits over time.",
    exampleEs: "Establecer una meta diaria de estudio ayuda a mantener hábitos constantes a lo largo del tiempo."
  },
  "Streak": {
    category: "🔥 Gamificación",
    explanation: "Racha consecutiva de días realizando una actividad sin interrumpir la constancia.",
    exampleEn: "Practicing everyday keeps your learning streak alive and boosts your motivation.",
    exampleEs: "Practicar todos los días mantiene viva tu racha de aprendizaje y aumenta tu motivación."
  },
  "Consistency": {
    category: "🎯 Hábitos / Estudio",
    explanation: "Constancia y regularidad al realizar una tarea a lo largo del tiempo para dominar una habilidad.",
    exampleEn: "Consistency is much more effective than cramming for hours once a week.",
    exampleEs: "La constancia es mucho más efectiva que estudiar de memoria horas seguidas una vez por semana."
  },
  "Fluency": {
    category: "🗣️ Idiomas",
    explanation: "La capacidad de hablar, leer y comprender un idioma de manera fluida, natural y espontánea.",
    exampleEn: "Daily vocabulary flashcards are the proven foundation to achieve conversational fluency.",
    exampleEs: "Las tarjetas diarias de vocabulario son la base comprobada para alcanzar fluidez conversacional."
  },
  "Will": {
    category: "🔤 Verbos / Gramática",
    explanation: "Verbo auxiliar clave para formar el futuro en inglés ('hará', 'irá a'). Como sustantivo aislado, también significa 'fuerza de voluntad' o 'testamento'.",
    exampleEn: "I will call you tomorrow morning as soon as I arrive.",
    exampleEs: "Te llamaré mañana por la mañana apenas llegue."
  },
  "Would": {
    category: "🔤 Verbos / Gramática",
    explanation: "Verbo auxiliar condicional que añade la terminación '-ría' al verbo que acompaña (ej. 'I would like' = 'Me gustaría', 'It would be' = 'Sería').",
    exampleEn: "Would you like a cup of coffee while we wait?",
    exampleEs: "¿Te gustaría una taza de café mientras esperamos?"
  },
  "Like": {
    category: "🔤 Verbos y Conectores",
    explanation: "Tiene dos usos fundamentales: como verbo significa 'gustar' (I like it), y como conector o preposición significa 'como' o 'parecido a' (He talks like an expert).",
    exampleEn: "I really like learning new vocabulary every single day.",
    exampleEs: "Realmente me gusta aprender nuevo vocabulario todos los días."
  },
  "Who": {
    category: "❓ Preguntas / Pronombres",
    explanation: "Pronombre interrogativo que significa '¿quién?'. También se usa como pronombre relativo en oraciones ('the person who helped me' = 'la persona que me ayudó').",
    exampleEn: "Who is in charge of reviewing the project documentation today?",
    exampleEs: "¿Quién está a cargo de revisar la documentación del proyecto hoy?"
  },
  "Its": {
    category: "🔤 Pronombres Posesivos",
    explanation: "Posesivo neutro para cosas, animales o empresas ('su / sus'). No confundir con 'it's' (con apóstrofe, que es la abreviatura de 'it is').",
    exampleEn: "The company updated its privacy policy to protect customer data.",
    exampleEs: "La empresa actualizó su política de privacidad para proteger los datos de los clientes."
  },
  "It": {
    category: "🔤 Pronombres Personales",
    explanation: "Pronombre neutro fundamental para referirse a objetos, animales, ideas abstractas, el clima o la hora ('eso / ello / este'). En español muchas veces queda implícito en el verbo.",
    exampleEn: "It is important to practice pronunciation aloud every day.",
    exampleEs: "Es importante practicar la pronunciación en voz alta todos los días."
  },
  "Can": {
    category: "🔤 Verbos Modales",
    explanation: "Verbo modal que indica habilidad, posibilidad o permiso ('poder: puedo, puedes, puede'). Como sustantivo común también significa 'lata' (de bebida o comida).",
    exampleEn: "You can improve your English rapidly with ten minutes of daily practice.",
    exampleEs: "Puedes mejorar tu inglés rápidamente con diez minutos de práctica diaria."
  },
  "As": {
    category: "🔤 Conectores",
    explanation: "Conector muy versátil: significa 'como' (en comparaciones o roles), 'mientras' (acciones simultáneas), o 'ya que / dado que' (explicando una razón).",
    exampleEn: "As you practice more, your listening comprehension will become faster.",
    exampleEs: "A medida que practiques más, tu comprensión auditiva se volverá más rápida."
  },
  "So": {
    category: "🔤 Conectores y Adverbios",
    explanation: "Como conector significa 'así que / por lo tanto' (consecuencia). Como adverbio de intensidad significa 'tan' (ej. 'so good' = 'tan bueno').",
    exampleEn: "I finished today's review early, so I have free time to read.",
    exampleEs: "Terminé el repaso de hoy temprano, así que tengo tiempo libre para leer."
  },
  "Just": {
    category: "🔤 Adverbios",
    explanation: "Adverbio versátil: significa 'solo / simplemente', 'justo / exactamente', o indica que una acción acaba de suceder recién ('I just finished').",
    exampleEn: "I just completed my flashcard deck with a perfect score.",
    exampleEs: "Recién completé mi mazo de tarjetas con una puntuación perfecta."
  },
  "Still": {
    category: "🔤 Adverbios y Adjetivos",
    explanation: "Significa 'todavía / aún' cuando una acción continúa en el tiempo. Como adjetivo significa 'quieto, inmóvil o en calma'.",
    exampleEn: "She is still reviewing her vocabulary cards before going to sleep.",
    exampleEs: "Ella todavía está repasando sus tarjetas de vocabulario antes de dormir."
  },
  "Even": {
    category: "🔤 Adverbios y Adjetivos",
    explanation: "Como adverbio significa 'incluso / hasta' para enfatizar algo sorprendente. Como adjetivo matemático significa 'par' (número par) o 'nivelado'.",
    exampleEn: "Even ten minutes a day creates huge language improvement over a year.",
    exampleEs: "Incluso diez minutos al día generan una enorme mejora en el idioma a lo largo de un año."
  },
  // --- FRASES Y MODISMOS FRECUENTES ---
  "Let's call it a day": {
    category: "🗣️ Modismo & Trabajo",
    explanation: "Se usa para proponer dar por finalizada la jornada laboral, de estudio o cualquier actividad grupal por el día de hoy.",
    exampleEn: "We've fixed the main issue and it's getting late, so let's call it a day.",
    exampleEs: "Ya solucionamos el problema principal y se está haciendo tarde, así que terminemos por hoy."
  },
  "Call it a day": {
    category: "🗣️ Modismo & Trabajo",
    explanation: "Expresión común para indicar que se detiene el trabajo o esfuerzo hasta el día siguiente.",
    exampleEn: "After five hours of studying, I decided to call it a day.",
    exampleEs: "Después de cinco horas de estudio, decidí dar el día por terminado."
  },
  "Take your time": {
    category: "☕ Conversación Cotidiana",
    explanation: "Expresión de cortesía para decirle a alguien que no se apresure, que haga las cosas con calma y a su propio ritmo.",
    exampleEn: "Take your time reading the document; there is no rush.",
    exampleEs: "Tómate tu tiempo para leer el documento; no hay ningún apuro."
  },
  "How are you doing?": {
    category: "☕ Saludos Cotidianos",
    explanation: "Saludo informal muy natural en inglés para preguntar cómo está alguien o cómo van sus cosas.",
    exampleEn: "Hey, how are you doing? Long time no see!",
    exampleEs: "¡Hola! ¿Cómo andás? ¡Tanto tiempo sin vernos!"
  },
  "I appreciate it": {
    category: "🤝 Agradecimiento",
    explanation: "Forma cálida y sincera de decir 'te lo agradezco', más expresiva que un simple 'thank you'.",
    exampleEn: "Thanks for helping me with this task, I really appreciate it.",
    exampleEs: "Gracias por ayudarme con esta tarea, de verdad te lo agradezco."
  },
  "Let's catch up soon": {
    category: "☕ Encuentros y Amistad",
    explanation: "'Catch up' significa ponerse al día con alguien contándose novedades personales o profesionales.",
    exampleEn: "It was great running into you, let's catch up soon over coffee.",
    exampleEs: "Fue genial cruzarte, pongámonos al día pronto tomando un café."
  },
  "I'll be right back": {
    category: "☕ Expresión Común",
    explanation: "Indica que la persona se ausenta por unos instantes o minutos y regresará de inmediato.",
    exampleEn: "Wait for me here, I'll be right back with the tickets.",
    exampleEs: "Espérame acá, ya vuelvo con las entradas."
  },
  "Sleep on it": {
    category: "🧠 Toma de Decisiones",
    explanation: "Metáfora para postergar una decisión importante hasta la mañana siguiente para pensarla con la mente descansada.",
    exampleEn: "Don't sign the contract right away; sleep on it tonight.",
    exampleEs: "No firmes el contrato de inmediato; consúltalo con la almohada esta noche."
  },
  "Piece of cake": {
    category: "🍰 Expresión Idiomática",
    explanation: "Indica que una tarea, examen o situación es sumamente fácil o sencilla de realizar.",
    exampleEn: "Don't worry about the quiz, you studied hard so it'll be a piece of cake.",
    exampleEs: "No te preocupes por el cuestionario, estudiaste mucho así que será pan comido."
  }
};

/**
 * Enriches any word or phrase with category, plain-language explanation,
 * grammatical forms (comparative, superlative, past, participle, plural),
 * and high-quality bilingual example sentence.
 */
export const phrasalKnowledge = {
  "Get": {
    "ipa": "/ɡɛt/",
    "cefr": "A1",
    "aloneMeaning": "Obtener / Conseguir / Llegar",
    "contextNote": "Es una de las palabras más polifacéticas del inglés. Su significado cambia por completo según la preposición con la que se combine.",
    "synonyms": [
      "Obtain",
      "Receive",
      "Acquire"
    ],
    "antonyms": [
      "Lose",
      "Give"
    ],
    "phrasalExamples": [
      {
        "phrase": "Get up",
        "meaning": "Levantarse de la cama",
        "example": "I usually get up at 7 AM every weekday."
      },
      {
        "phrase": "Get over",
        "meaning": "Superar una dificultad o ruptura",
        "example": "She will soon get over this difficult situation."
      },
      {
        "phrase": "Get along",
        "meaning": "Llevarse bien con alguien",
        "example": "They get along great with all their coworkers."
      },
      {
        "phrase": "Get in / Get on",
        "meaning": "Subir a un auto / Subir a un bus o tren",
        "example": "Get on the train before the doors close!"
      },
      {
        "phrase": "Get back",
        "meaning": "Regresar o recuperar algo",
        "example": "When do you get back from your vacation?"
      }
    ]
  },
  "Take": {
    "ipa": "/teɪk/",
    "cefr": "A1",
    "aloneMeaning": "Tomar / Llevar / Agarrar",
    "contextNote": "Sola denota acción física de tomar, pero en frases forma expresiones clave de tiempo, transporte y cuidado.",
    "synonyms": [
      "Grab",
      "Seize",
      "Carry"
    ],
    "antonyms": [
      "Give",
      "Leave"
    ],
    "phrasalExamples": [
      {
        "phrase": "Take off",
        "meaning": "Despegar (avión) o quitarse ropa",
        "example": "The plane takes off in fifteen minutes."
      },
      {
        "phrase": "Take care",
        "meaning": "Cuidarse / Estar atento",
        "example": "Take care of yourself on the road trip!"
      },
      {
        "phrase": "Take place",
        "meaning": "Llevarse a cabo / Ocurrir",
        "example": "The conference will take place tomorrow afternoon."
      },
      {
        "phrase": "Take out",
        "meaning": "Sacar la basura o pedir comida para llevar",
        "example": "Can you please take out the trash tonight?"
      },
      {
        "phrase": "Take time",
        "meaning": "Tomarse tiempo / Llevar tiempo",
        "example": "Learning a new language takes time and patience."
      }
    ]
  },
  "Look": {
    "ipa": "/lʊk/",
    "cefr": "A1",
    "aloneMeaning": "Mirar / Aspecto, apariencia física",
    "contextNote": "Sola se refiere a mirar con los ojos o lucir de cierta forma, pero en combinación crea verbos esenciales de búsqueda y cuidado.",
    "synonyms": [
      "Watch",
      "Observe",
      "Gaze"
    ],
    "antonyms": [
      "Ignore",
      "Overlook"
    ],
    "phrasalExamples": [
      {
        "phrase": "Look for",
        "meaning": "Buscar algo o a alguien",
        "example": "I am looking for my car keys everywhere."
      },
      {
        "phrase": "Look after",
        "meaning": "Cuidar de alguien (niño, mascota)",
        "example": "Can you look after my cat this weekend?"
      },
      {
        "phrase": "Look forward to",
        "meaning": "Esperar con ilusión y entusiasmo",
        "example": "I look forward to hearing your good news!"
      },
      {
        "phrase": "Look out",
        "meaning": "¡Cuidado! / Estar alerta",
        "example": "Look out! The floor is very slippery."
      },
      {
        "phrase": "Look like",
        "meaning": "Parecerse físicamente a algo",
        "example": "That cloud looks like a giant turtle."
      }
    ]
  },
  "Turn": {
    "ipa": "/tɜːrn/",
    "cefr": "A1",
    "aloneMeaning": "Girar / Vuelta / Turno de alguien",
    "contextNote": "Sola significa rotar físicamente, pero en frases controla el encendido/apagado de dispositivos y transformaciones.",
    "synonyms": [
      "Rotate",
      "Pivot",
      "Transform"
    ],
    "antonyms": [
      "Stay",
      "Freeze"
    ],
    "phrasalExamples": [
      {
        "phrase": "Turn on / Turn off",
        "meaning": "Encender / Apagar un aparato",
        "example": "Remember to turn off the lights when leaving."
      },
      {
        "phrase": "Turn down",
        "meaning": "Rechazar una propuesta o bajar el volumen",
        "example": "He turned down the job offer for a better one."
      },
      {
        "phrase": "Turn up",
        "meaning": "Aparecer de repente o subir el volumen",
        "example": "She turned up at the party without warning."
      },
      {
        "phrase": "Turn into",
        "meaning": "Transformarse o convertirse en",
        "example": "The caterpillar turns into a colorful butterfly."
      },
      {
        "phrase": "Turn out",
        "meaning": "Resultar ser al final",
        "example": "Everything turned out much better than expected."
      }
    ]
  },
  "Give": {
    "ipa": "/ɡɪv/",
    "cefr": "A1",
    "aloneMeaning": "Dar / Entregar / Regalar",
    "contextNote": "Sola es transferir algo a alguien; en frases describe rendición, devolución o donaciones.",
    "synonyms": [
      "Provide",
      "Donate",
      "Offer"
    ],
    "antonyms": [
      "Take",
      "Receive"
    ],
    "phrasalExamples": [
      {
        "phrase": "Give up",
        "meaning": "Rendirse / Abandonar un intento",
        "example": "Never give up on what you truly believe."
      },
      {
        "phrase": "Give back",
        "meaning": "Devolver algo prestado",
        "example": "I will give back your jacket tomorrow."
      },
      {
        "phrase": "Give away",
        "meaning": "Regalar / Donar o revelar un secreto",
        "example": "They are giving away free coffee samples."
      },
      {
        "phrase": "Give in",
        "meaning": "Ceder ante la insistencia o presión",
        "example": "He finally gave in to their polite requests."
      }
    ]
  },
  "Make": {
    "ipa": "/meɪk/",
    "cefr": "A1",
    "aloneMeaning": "Hacer / Fabricar / Crear",
    "contextNote": "A diferencia de 'do', se usa para crear cosas nuevas o en frases fijas de lógica y decisión.",
    "synonyms": [
      "Create",
      "Build",
      "Produce"
    ],
    "antonyms": [
      "Destroy",
      "Ruined"
    ],
    "phrasalExamples": [
      {
        "phrase": "Make sense",
        "meaning": "Tener sentido / Ser lógico",
        "example": "His explanation makes total sense to me."
      },
      {
        "phrase": "Make sure",
        "meaning": "Asegurarse / Cerciorarse",
        "example": "Make sure the front door is locked."
      },
      {
        "phrase": "Make up",
        "meaning": "Inventar algo o reconciliarse",
        "example": "They argued yesterday but made up this morning."
      },
      {
        "phrase": "Make up one's mind",
        "meaning": "Decidirse finalmente",
        "example": "I cannot make up my mind between these two."
      }
    ]
  },
  "Put": {
    "ipa": "/pʊt/",
    "cefr": "A1",
    "aloneMeaning": "Poner / Colocar",
    "contextNote": "Sola es ubicar un objeto en un lugar; con preposiciones expresa vestirse, posponer o tolerar situaciones.",
    "synonyms": [
      "Place",
      "Position",
      "Set"
    ],
    "antonyms": [
      "Remove",
      "Take"
    ],
    "phrasalExamples": [
      {
        "phrase": "Put on",
        "meaning": "Ponerse ropa o accesorios",
        "example": "Put on your warm coat before going outside."
      },
      {
        "phrase": "Put off",
        "meaning": "Posponer / Postergar una reunión o tarea",
        "example": "Never put off what you can accomplish today."
      },
      {
        "phrase": "Put up with",
        "meaning": "Tolerar / Soportar algo molesto",
        "example": "I cannot put up with that loud noise anymore."
      },
      {
        "phrase": "Put out",
        "meaning": "Extinguir o apagar un fuego",
        "example": "The firefighters put out the fire rapidly."
      }
    ]
  },
  "Break": {
    "ipa": "/breɪk/",
    "cefr": "A2",
    "aloneMeaning": "Romper / Pausa, descanso",
    "contextNote": "Sola describe fractura física o recreo; en frases habla de averías mecánicas y rupturas amorosas.",
    "synonyms": [
      "Shatter",
      "Crack",
      "Pause"
    ],
    "antonyms": [
      "Fix",
      "Repair"
    ],
    "phrasalExamples": [
      {
        "phrase": "Break down",
        "meaning": "Averiarse (auto) o quebrarse en llanto",
        "example": "Our car broke down on the mountain highway."
      },
      {
        "phrase": "Break up",
        "meaning": "Terminar una relación sentimental",
        "example": "They broke up after dating for three years."
      },
      {
        "phrase": "Break in / into",
        "meaning": "Entrar por la fuerza a una casa",
        "example": "Burglars broke into the jewelry store."
      },
      {
        "phrase": "Break out",
        "meaning": "Estallar (incendio, guerra) o escapar",
        "example": "A sudden storm broke out right after sunset."
      }
    ]
  },
  "Keep": {
    "ipa": "/kiːp/",
    "cefr": "A1",
    "aloneMeaning": "Mantener / Guardar / Conservar",
    "contextNote": "Sola es conservar en posesión; en frases describe constancia, continuidad y ritmo.",
    "synonyms": [
      "Retain",
      "Preserve",
      "Hold"
    ],
    "antonyms": [
      "Discard",
      "Lose"
    ],
    "phrasalExamples": [
      {
        "phrase": "Keep going",
        "meaning": "Seguir adelante sin detenerse",
        "example": "Keep going, the finish line is very near!"
      },
      {
        "phrase": "Keep in mind",
        "meaning": "Tener en cuenta / No olvidar",
        "example": "Keep in mind that tomorrow is a holiday."
      },
      {
        "phrase": "Keep up with",
        "meaning": "Mantenerse al mismo ritmo",
        "example": "It takes effort to keep up with top runners."
      },
      {
        "phrase": "Keep on",
        "meaning": "Continuar haciendo una acción",
        "example": "She kept on smiling despite the difficulties."
      }
    ]
  },
  "Run": {
    "ipa": "/rʌn/",
    "cefr": "A1",
    "aloneMeaning": "Correr / Ejecutar / Administrar",
    "contextNote": "Sola es correr a pie o correr un programa; en frases expresa agotamiento de suministros o encuentros casuales.",
    "synonyms": [
      "Sprint",
      "Operate",
      "Manage"
    ],
    "antonyms": [
      "Walk",
      "Stop"
    ],
    "phrasalExamples": [
      {
        "phrase": "Run out of",
        "meaning": "Quedarse sin algo (café, nafta, tiempo)",
        "example": "We ran out of milk, I need to buy some."
      },
      {
        "phrase": "Run into",
        "meaning": "Encontrarse con alguien de sorpresa",
        "example": "I ran into my former teacher at the library."
      },
      {
        "phrase": "Run a business",
        "meaning": "Dirigir o administrar una empresa",
        "example": "She has successfully run a restaurant for years."
      },
      {
        "phrase": "Run away",
        "meaning": "Huir o escaparse",
        "example": "The scared cat ran away under the bed."
      }
    ]
  },
  "Come": {
    "ipa": "/kʌm/",
    "cefr": "A1",
    "aloneMeaning": "Venir / Llegar hacia aquí",
    "contextNote": "Sola es desplazamiento hacia el hablante; en frases crea expresiones de descubrimiento y nuevas ideas.",
    "synonyms": [
      "Arrive",
      "Approach"
    ],
    "antonyms": [
      "Go",
      "Leave"
    ],
    "phrasalExamples": [
      {
        "phrase": "Come across",
        "meaning": "Toparse con algo por casualidad",
        "example": "I came across an ancient coin in the garden."
      },
      {
        "phrase": "Come up with",
        "meaning": "Idear o inventar una solución",
        "example": "Can you come up with a better plan?"
      },
      {
        "phrase": "Come back",
        "meaning": "Regresar al punto de partida",
        "example": "Please come back before the heavy rain begins."
      },
      {
        "phrase": "Come in",
        "meaning": "Entrar / Pasar adelante",
        "example": "Please come in and have a seat!"
      }
    ]
  },
  "Go": {
    "ipa": "/ɡoʊ/",
    "cefr": "A1",
    "aloneMeaning": "Ir / Marcharse",
    "contextNote": "Sola es alejarse; en frases expresa continuidad ('go on'), superación de pruebas ('go through') o permisos.",
    "synonyms": [
      "Depart",
      "Leave",
      "Proceed"
    ],
    "antonyms": [
      "Stay",
      "Come"
    ],
    "phrasalExamples": [
      {
        "phrase": "Go on",
        "meaning": "Continuar / Suceder",
        "example": "Please go on, I am listening carefully."
      },
      {
        "phrase": "Go through",
        "meaning": "Atravesar una etapa difícil",
        "example": "He went through a very tough year."
      },
      {
        "phrase": "Go ahead",
        "meaning": "Avanzar / Proceder con permiso",
        "example": "Go ahead and start without waiting for me."
      },
      {
        "phrase": "Go off",
        "meaning": "Sonar la alarma o explotar",
        "example": "The alarm went off right at 6:00 AM."
      }
    ]
  },
  "Hold": {
    "ipa": "/hoʊld/",
    "cefr": "A2",
    "aloneMeaning": "Sostener / Mantener en las manos",
    "contextNote": "Sola es agarrar con las manos; en frases es la forma más común de pedir una pausa o esperar.",
    "synonyms": [
      "Grasp",
      "Clutch",
      "Support"
    ],
    "antonyms": [
      "Release",
      "Drop"
    ],
    "phrasalExamples": [
      {
        "phrase": "Hold on",
        "meaning": "Esperar un momento / Aguantar",
        "example": "Hold on a minute, I will be right back."
      },
      {
        "phrase": "Hold back",
        "meaning": "Contener una emoción o impulso",
        "example": "She could not hold back her joy."
      },
      {
        "phrase": "Hold up",
        "meaning": "Retrasar algo por imprevistos",
        "example": "A traffic accident held us up for an hour."
      }
    ]
  },
  "Call": {
    "ipa": "/kɔːl/",
    "cefr": "A1",
    "aloneMeaning": "Llamar por teléfono o nombre",
    "contextNote": "Sola es llamar; en frases es fundamental para cancelaciones o devolver llamadas.",
    "synonyms": [
      "Ring",
      "Contact",
      "Name"
    ],
    "antonyms": [
      "Ignore"
    ],
    "phrasalExamples": [
      {
        "phrase": "Call off",
        "meaning": "Cancelar un evento o cita",
        "example": "The match was called off because of thunderstorms."
      },
      {
        "phrase": "Call back",
        "meaning": "Devolver la llamada",
        "example": "I am in a meeting, I will call you back."
      },
      {
        "phrase": "Call for",
        "meaning": "Exigir o ameritar algo",
        "example": "This awesome achievement calls for a celebration!"
      }
    ]
  },
  "Bring": {
    "ipa": "/brɪŋ/",
    "cefr": "A1",
    "aloneMeaning": "Traer consigo hacia el lugar",
    "contextNote": "Sola es portar un objeto; en frases significa sacar a relucir un tema o criar a los hijos.",
    "synonyms": [
      "Carry",
      "Fetch",
      "Deliver"
    ],
    "antonyms": [
      "Take",
      "Send"
    ],
    "phrasalExamples": [
      {
        "phrase": "Bring up",
        "meaning": "Mencionar un asunto o criar niños",
        "example": "He brought up an interesting question during class."
      },
      {
        "phrase": "Bring about",
        "meaning": "Provocar o causar un cambio importante",
        "example": "Renewable energy will bring about a cleaner world."
      },
      {
        "phrase": "Bring back",
        "meaning": "Traer de vuelta o evocar recuerdos",
        "example": "That sweet song brings back childhood memories."
      }
    ]
  },
  "Set": {
    "ipa": "/sɛt/",
    "cefr": "A2",
    "aloneMeaning": "Establecer / Ajustar / Conjunto",
    "contextNote": "Sola es fijar parámetros; en frases domina la informática ('set up') y los viajes.",
    "synonyms": [
      "Establish",
      "Adjust",
      "Fix"
    ],
    "antonyms": [
      "Disorder",
      "Reset"
    ],
    "phrasalExamples": [
      {
        "phrase": "Set up",
        "meaning": "Instalar, configurar o fundar",
        "example": "We set up a new wireless network yesterday."
      },
      {
        "phrase": "Set off",
        "meaning": "Partir de viaje o disparar una alarma",
        "example": "The fireworks set off the car alarms."
      },
      {
        "phrase": "Set back",
        "meaning": "Atrasar los tiempos o costar dinero",
        "example": "The software bug set us back two whole weeks."
      }
    ]
  },
  "Fall": {
    "ipa": "/fɔːl/",
    "cefr": "A1",
    "aloneMeaning": "Caer al suelo / Otoño (estación)",
    "contextNote": "Sola es desplomarse o la estación de otoño; en frases expresa enamorarse o desmoronarse.",
    "synonyms": [
      "Drop",
      "Tumble",
      "Autumn"
    ],
    "antonyms": [
      "Rise",
      "Climb"
    ],
    "phrasalExamples": [
      {
        "phrase": "Fall in love",
        "meaning": "Enamorarse profundamente",
        "example": "They fell in love the instant their eyes met."
      },
      {
        "phrase": "Fall apart",
        "meaning": "Desmoronarse / Caer en pedazos",
        "example": "The cardboard box fell apart under the heavy rain."
      },
      {
        "phrase": "Fall behind",
        "meaning": "Quedarse atrás con los plazos",
        "example": "Work hard so you don't fall behind in class."
      }
    ]
  },
  "Stand": {
    "ipa": "/stænd/",
    "cefr": "A1",
    "aloneMeaning": "Estar de pie / Aguantar o soportar",
    "contextNote": "Sola es postura erguida o tolerar ('I can't stand it'); en frases significa destacarse o respaldar.",
    "synonyms": [
      "Rise",
      "Endure",
      "Tolerate"
    ],
    "antonyms": [
      "Sit",
      "Lie down"
    ],
    "phrasalExamples": [
      {
        "phrase": "Stand out",
        "meaning": "Sobresalir / Destacarse entre todos",
        "example": "Her bright creativity made her stand out."
      },
      {
        "phrase": "Stand by",
        "meaning": "Permanecer a la espera o respaldar a alguien",
        "example": "True friends always stand by you."
      },
      {
        "phrase": "Stand for",
        "meaning": "Representar o simbolizar (siglas)",
        "example": "What does the abbreviation AI stand for?"
      }
    ]
  },
  "Cut": {
    "ipa": "/kʌt/",
    "cefr": "A1",
    "aloneMeaning": "Cortar / Corte o herida",
    "contextNote": "Sola es cortar físicamente; en frases se usa para reducir gastos o interrumpir suministros.",
    "synonyms": [
      "Slice",
      "Trim",
      "Chop"
    ],
    "antonyms": [
      "Attach",
      "Join"
    ],
    "phrasalExamples": [
      {
        "phrase": "Cut down on",
        "meaning": "Reducir el consumo de algo",
        "example": "Try to cut down on sugar to feel healthier."
      },
      {
        "phrase": "Cut off",
        "meaning": "Interrumpir o cortar un servicio",
        "example": "The storm cut off electrical power across town."
      },
      {
        "phrase": "Cut in",
        "meaning": "Interrumpir a alguien que está hablando",
        "example": "Excuse me for cutting in, but your phone is ringing."
      }
    ]
  },
  "Point": {
    "ipa": "/pɔɪnt/",
    "cefr": "A2",
    "aloneMeaning": "Punto / Cuestión central / Apuntar con el dedo",
    "contextNote": "Sola es un punto o señalar; en frases se usa para resaltar argumentos y aclarar ideas.",
    "synonyms": [
      "Dot",
      "Indicate",
      "Core"
    ],
    "antonyms": [
      "Distraction"
    ],
    "phrasalExamples": [
      {
        "phrase": "Point out",
        "meaning": "Señalar o destacar un dato clave",
        "example": "The professor pointed out the main thesis."
      },
      {
        "phrase": "To the point",
        "meaning": "Directo al grano / Sin rodeos",
        "example": "Keep your presentation brief and to the point."
      },
      {
        "phrase": "Miss the point",
        "meaning": "No captar la idea fundamental",
        "example": "You are completely missing the main point."
      }
    ]
  },
  "Check": {
    "ipa": "/tʃɛk/",
    "cefr": "A1",
    "aloneMeaning": "Comprobar / Revisar / Factura o cheque",
    "contextNote": "Sola es verificar; en frases es universal para viajes (check in) y ver recomendaciones (check out).",
    "synonyms": [
      "Verify",
      "Examine",
      "Inspect"
    ],
    "antonyms": [
      "Ignore",
      "Neglect"
    ],
    "phrasalExamples": [
      {
        "phrase": "Check in / Check out",
        "meaning": "Registrarse / Salir de un hotel o vuelo",
        "example": "We need to check in two hours before departure."
      },
      {
        "phrase": "Check out",
        "meaning": "Mirar o probar algo interesante",
        "example": "You should check out this brand new playlist!"
      }
    ]
  },
  "Pick": {
    "ipa": "/pɪk/",
    "cefr": "A1",
    "aloneMeaning": "Elegir / Recoger / Picar",
    "contextNote": "Sola es seleccionar; en frases es la expresión diaria para pasar a buscar a alguien o levantar objetos.",
    "synonyms": [
      "Choose",
      "Select",
      "Gather"
    ],
    "antonyms": [
      "Reject",
      "Drop"
    ],
    "phrasalExamples": [
      {
        "phrase": "Pick up",
        "meaning": "Levantar del suelo o pasar a buscar en auto",
        "example": "I will pick you up at the bus station at five."
      },
      {
        "phrase": "Pick out",
        "meaning": "Elegir cuidadosamente entre varias opciones",
        "example": "Can you help me pick out a gift for mom?"
      }
    ]
  },
  "Catch": {
    "ipa": "/kætʃ/",
    "cefr": "A1",
    "aloneMeaning": "Atrapar / Agarrar al vuelo",
    "contextNote": "Sola es atrapar una pelota; en frases expresa ponerse al día o entender chistes/tendencias.",
    "synonyms": [
      "Capture",
      "Snatch",
      "Grasp"
    ],
    "antonyms": [
      "Miss",
      "Drop"
    ],
    "phrasalExamples": [
      {
        "phrase": "Catch up",
        "meaning": "Ponerse al día con alguien",
        "example": "Let's grab a coffee and catch up on everything!"
      },
      {
        "phrase": "Catch on",
        "meaning": "Hacerse popular o captar una idea",
        "example": "The clever slogan caught on instantly."
      }
    ]
  },
  "Figure": {
    "ipa": "/ˈfɪɡjər/",
    "cefr": "B1",
    "aloneMeaning": "Figura / Cifra / Silueta",
    "contextNote": "Sola es una cifra o forma; con 'out' se convierte en el verbo estándar para resolver o descifrar problemas.",
    "synonyms": [
      "Number",
      "Shape",
      "Digit"
    ],
    "antonyms": [
      "Confusion"
    ],
    "phrasalExamples": [
      {
        "phrase": "Figure out",
        "meaning": "Resolver, descifrar o encontrar la solución",
        "example": "We finally figured out how to fix the error."
      }
    ]
  },
  "Work": {
    "ipa": "/wɜːrk/",
    "cefr": "A1",
    "aloneMeaning": "Trabajo / Trabajar / Funcionar bien",
    "contextNote": "Sola es empleo o funcionar; con 'out' es entrenar en el gimnasio o tener un desenlace favorable.",
    "synonyms": [
      "Labor",
      "Function",
      "Operate"
    ],
    "antonyms": [
      "Idleness",
      "Fail"
    ],
    "phrasalExamples": [
      {
        "phrase": "Work out",
        "meaning": "Hacer ejercicio físico o resolverse bien",
        "example": "I work out four days a week to stay healthy."
      },
      {
        "phrase": "Work on",
        "meaning": "Dedicar tiempo a mejorar algo",
        "example": "She is working on her public speaking skills."
      }
    ]
  },
  "Right": {
    "ipa": "/raɪt/",
    "cefr": "A1",
    "aloneMeaning": "Derecha / Correcto / Derecho legal",
    "contextNote": "Sola es dirección o acierto; en frases forma conectores temporales clave como 'right now' y 'right away'.",
    "synonyms": [
      "Correct",
      "Accurate",
      "Direct"
    ],
    "antonyms": [
      "Wrong",
      "Left"
    ],
    "phrasalExamples": [
      {
        "phrase": "Right now",
        "meaning": "En este preciso instante",
        "example": "I am having dinner with my family right now."
      },
      {
        "phrase": "Right away",
        "meaning": "De inmediato / Enseguida",
        "example": "Please send me the document right away."
      },
      {
        "phrase": "All right",
        "meaning": "De acuerdo / Todo en orden",
        "example": "Do not worry, everything is all right."
      }
    ]
  },
  "Way": {
    "ipa": "/weɪ/",
    "cefr": "A1",
    "aloneMeaning": "Camino / Manera o método",
    "contextNote": "Sola es ruta o modo; en frases forma expresiones indispensables de conversación cotidiana.",
    "synonyms": [
      "Path",
      "Method",
      "Manner"
    ],
    "antonyms": [
      "Detour"
    ],
    "phrasalExamples": [
      {
        "phrase": "By the way",
        "meaning": "Por cierto / A propósito de eso",
        "example": "By the way, did you receive my email?"
      },
      {
        "phrase": "On my way",
        "meaning": "En camino / Yendo hacia allí",
        "example": "I just left the house, I am on my way."
      },
      {
        "phrase": "No way!",
        "meaning": "¡De ninguna manera! / ¡Imposible!",
        "example": "No way! That sounds too good to be true."
      }
    ]
  },
  "Mind": {
    "ipa": "/maɪnd/",
    "cefr": "A2",
    "aloneMeaning": "Mente / Importar, molestar",
    "contextNote": "Sola es la mente; en frases cotidianas expresa descarte ('never mind') o toma de decisiones.",
    "synonyms": [
      "Brain",
      "Intellect",
      "Thought"
    ],
    "antonyms": [
      "Body"
    ],
    "phrasalExamples": [
      {
        "phrase": "Never mind",
        "meaning": "No importa / Olvídalo",
        "example": "Never mind, I managed to find my glasses."
      },
      {
        "phrase": "Make up your mind",
        "meaning": "Decidirse de una vez por todas",
        "example": "Make up your mind before time runs out."
      },
      {
        "phrase": "Change your mind",
        "meaning": "Cambiar de opinión",
        "example": "Feel free to change your mind at any moment."
      }
    ]
  },
  "Matter": {
    "ipa": "/ˈmætər/",
    "cefr": "A2",
    "aloneMeaning": "Materia / Asunto / Importar",
    "contextNote": "Sola es sustancia física; en frases expresa relevancia ('doesn't matter') o preguntas de preocupación.",
    "synonyms": [
      "Issue",
      "Substance",
      "Topic"
    ],
    "antonyms": [
      "Nothing"
    ],
    "phrasalExamples": [
      {
        "phrase": "It doesn't matter",
        "meaning": "No importa / Da lo mismo",
        "example": "It doesn't matter what color you choose."
      },
      {
        "phrase": "What's the matter?",
        "meaning": "¿Qué sucede? / ¿Cuál es el problema?",
        "example": "You look sad, what's the matter?"
      },
      {
        "phrase": "As a matter of fact",
        "meaning": "De hecho / En realidad",
        "example": "As a matter of fact, I was just about to call you."
      }
    ]
  },
  "Even": {
    "ipa": "/ˈiːvən/",
    "cefr": "A2",
    "aloneMeaning": "Incluso / Par (número) / Parejo",
    "contextNote": "Sola es equilibrio numérico; en frases es el conector rey para contrastes y concesiones.",
    "synonyms": [
      "Equal",
      "Uniform",
      "Level"
    ],
    "antonyms": [
      "Odd",
      "Uneven"
    ],
    "phrasalExamples": [
      {
        "phrase": "Even if",
        "meaning": "Incluso si / Aunque pase tal cosa",
        "example": "I will attend the event even if it rains."
      },
      {
        "phrase": "Even though",
        "meaning": "A pesar de que / Aunque",
        "example": "Even though he was tired, he kept smiling."
      },
      {
        "phrase": "Even so",
        "meaning": "Aun así / No obstante",
        "example": "It was a tough game; even so, we won."
      }
    ]
  },
  "As": {
    "ipa": "/æz/",
    "cefr": "A1",
    "aloneMeaning": "Como / Mientras / Ya que",
    "contextNote": "Sola compara o indica simultaneidad; en frases forma conectores esenciales de tiempo y condición.",
    "synonyms": [
      "Since",
      "While",
      "Like"
    ],
    "antonyms": [
      "Unlike"
    ],
    "phrasalExamples": [
      {
        "phrase": "As soon as",
        "meaning": "Tan pronto como / En cuanto",
        "example": "Call me as soon as you land at the airport."
      },
      {
        "phrase": "As well as",
        "meaning": "Así como también / Además de",
        "example": "He loves coffee as well as green tea."
      },
      {
        "phrase": "As long as",
        "meaning": "Siempre y cuando / Mientras que",
        "example": "You can stay here as long as you want."
      }
    ]
  },
  "So": {
    "ipa": "/soʊ/",
    "cefr": "A1",
    "aloneMeaning": "Tan / Así que / Entonces / Tanto",
    "contextNote": "Sola intensifica adjetivos o concluye; en frases forma 'so far' (hasta ahora) y 'so that' (para que).",
    "synonyms": [
      "Therefore",
      "Thus",
      "Very"
    ],
    "antonyms": [
      "Barely"
    ],
    "phrasalExamples": [
      {
        "phrase": "So far",
        "meaning": "Hasta ahora / Hasta el momento",
        "example": "So far, our project has been a huge success."
      },
      {
        "phrase": "So that",
        "meaning": "Para que / Con el fin de que",
        "example": "I study daily so that I can speak fluently."
      }
    ]
  },
  "Like": {
    "ipa": "/laɪk/",
    "cefr": "A1",
    "aloneMeaning": "Gustar / Como (similar a, tal como)",
    "contextNote": "Sola puede ser verbo de agrado o comparación; en frases expresa antojos ('feel like') o pedidos formales.",
    "synonyms": [
      "Enjoy",
      "Similar",
      "Fond"
    ],
    "antonyms": [
      "Dislike",
      "Hate"
    ],
    "phrasalExamples": [
      {
        "phrase": "Feel like",
        "meaning": "Tener ganas o antojo de hacer algo",
        "example": "I feel like taking a walk in the sunny park."
      },
      {
        "phrase": "Would like",
        "meaning": "Me gustaría (pedido cortés)",
        "example": "I would like a glass of water, please."
      },
      {
        "phrase": "Look like",
        "meaning": "Parecerse físicamente a",
        "example": "You look like a movie star in that suit."
      }
    ]
  },
  "Will": {
    "ipa": "/wɪl/",
    "cefr": "A1",
    "aloneMeaning": "Auxiliar de futuro (hará, irá a) / Voluntad, testamento",
    "contextNote": "Sola como sustantivo es determinación mental o herencia; en oraciones es el auxiliar primario para futuro.",
    "synonyms": [
      "Determination",
      "Desire",
      "Intent"
    ],
    "antonyms": [
      "Reluctance"
    ],
    "phrasalExamples": [
      {
        "phrase": "Will be able to",
        "meaning": "Podrá (futuro de 'can')",
        "example": "Next year I will be able to speak English fluently."
      },
      {
        "phrase": "Free will",
        "meaning": "Libre albedrío / Libertad de elección",
        "example": "Humans have the power of free will."
      }
    ]
  },
  "Pass": {
    "ipa": "/pæs/",
    "cefr": "A2",
    "aloneMeaning": "Pasar / Aprobar un examen",
    "contextNote": "Sola es aprobar o pasar; en frases forma eufemismos de fallecimiento y desmayos.",
    "synonyms": [
      "Approve",
      "Transit",
      "Hand"
    ],
    "antonyms": [
      "Fail"
    ],
    "phrasalExamples": [
      {
        "phrase": "Pass out",
        "meaning": "Desmayarse por calor o cansancio",
        "example": "He felt dizzy and almost passed out."
      },
      {
        "phrase": "Pass away",
        "meaning": "Fallecer (eufemismo respetuoso de morir)",
        "example": "Her grandfather passed away peacefully at age 95."
      },
      {
        "phrase": "Pass by",
        "meaning": "Pasar cerca o por delante de un lugar",
        "example": "I pass by the bakery every single morning."
      }
    ]
  }
};

// Pre-indexed lower-case maps for ultra-fast O(1) lookups
const lowerWordKnowledge = new Map();
for (const [k, v] of Object.entries(wordKnowledge)) {
  lowerWordKnowledge.set(k.toLowerCase(), v);
}

const lowerPhrasalKnowledge = new Map();
for (const [k, v] of Object.entries(phrasalKnowledge)) {
  lowerPhrasalKnowledge.set(k.toLowerCase(), v);
}

// In-memory memoization cache for 120 FPS fluid rendering and 0 garbage collection lag
const detailsCache = new Map();

export function getWordDetails(wordObj) {
  if (!wordObj) return { explanation: '', exampleEn: '', exampleEs: '', category: '' };

  const cacheKey = wordObj.id || wordObj.english;
  if (detailsCache.has(cacheKey)) {
    return detailsCache.get(cacheKey);
  }

  const eng = wordObj.english || '';
  const esp = wordObj.spanish || '';
  const cleanEn = eng.trim();
  const lowerEn = cleanEn.toLowerCase();
  const normalizedEn = lowerEn.replace(/[.,!?;:]+$/, '').trim();

  const phrasalEntry = lowerPhrasalKnowledge.get(lowerEn) || lowerPhrasalKnowledge.get(normalizedEn) || null;
  const foundKnowledge = lowerWordKnowledge.get(lowerEn) || lowerWordKnowledge.get(normalizedEn);

  let category = '';
  if (foundKnowledge && foundKnowledge.category) {
    category = foundKnowledge.category;
  } else if (wordObj.category === 'movie') {
    category = "🎬 Cine, Series & Diálogo";
  } else if (wordObj.category === 'adjective' || wordObj.comparative || wordObj.superlative) {
    category = "🌟 Adjetivo";
  } else if (wordObj.category === 'verb' || wordObj.past || wordObj.participle) {
    category = "🏃‍♂️ Verbo";
  } else if (wordObj.category === 'noun' || wordObj.plural) {
    category = "📦 Sustantivo";
  } else if (wordObj.category === 'daily') {
    category = "☕ Cotidiano / Día a Día";
  } else if (wordObj.type === 'phrase' || eng.includes(' ')) {
    category = "🗣️ Expresión / Frase";
  } else if (wordObj.category === 'tech') {
    if (wordObj.subCategory === 'math') category = "📐 Matemáticas & Álgebra";
    else if (wordObj.subCategory === 'physics') category = "🔬 Física & Ciencias";
    else category = "💻 Tecnología & Software";
  } else {
    category = "📖 Vocabulario General";
  }

  const res = {
    ipa: phrasalEntry?.ipa || wordObj.ipa || '',
    cefr: phrasalEntry?.cefr || wordObj.cefr || (wordObj.id < 500 ? 'A1' : wordObj.id < 1200 ? 'A2' : 'B1'),
    aloneMeaning: phrasalEntry?.aloneMeaning || '',
    contextNote: phrasalEntry?.contextNote || '',
    phrasalExamples: phrasalEntry?.phrasalExamples || null,
    synonyms: phrasalEntry?.synonyms || null,
    antonyms: phrasalEntry?.antonyms || null,
    category: category,
    explanation: wordObj.explanation || (foundKnowledge ? foundKnowledge.explanation : ''),
    exampleEn: wordObj.exampleEn || (foundKnowledge ? foundKnowledge.exampleEn : ''),
    exampleEs: wordObj.exampleEs || (foundKnowledge ? foundKnowledge.exampleEs : '')
  };

  detailsCache.set(cacheKey, res);
  return res;
}
