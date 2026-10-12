const fs = require('fs');

const techWords = [
  { english: "Bandwidth", spanish: "Ancho de banda" },
  { english: "Latency", spanish: "Latencia" },
  { english: "Throughput", spanish: "Tasa de transferencia / Rendimiento" },
  { english: "Firewall", spanish: "Cortafuegos" },
  { english: "Gateway", spanish: "Puerta de enlace" },
  { english: "Subnet", spanish: "Subred" },
  { english: "Router", spanish: "Enrutador" },
  { english: "Switch", spanish: "Conmutador" },
  { english: "Cache", spanish: "Caché" },
  { english: "Buffer", spanish: "Búfer / Memoria intermedia" },
  { english: "Query", spanish: "Consulta" },
  { english: "Fetch", spanish: "Obtener / Extraer" },
  { english: "Deployment", spanish: "Despliegue" },
  { english: "Encryption", spanish: "Cifrado" },
  { english: "Decryption", spanish: "Descifrado" },
  { english: "Algorithm", spanish: "Algoritmo" },
  { english: "Protocol", spanish: "Protocolo" },
  { english: "Node", spanish: "Nodo" },
  { english: "Packet", spanish: "Paquete de datos" },
  { english: "Handshake", spanish: "Protocolo de enlace" },
  { english: "Host", spanish: "Servidor / Anfitrión" },
  { english: "Domain", spanish: "Dominio" },
  { english: "Proxy", spanish: "Servidor intermediario" },
  { english: "Middleware", spanish: "Software intermedio" },
  { english: "Framework", spanish: "Entorno de trabajo" },
  { english: "Repository", spanish: "Repositorio" },
  { english: "Commit", spanish: "Confirmación de cambios" },
  { english: "Merge", spanish: "Fusión" },
  { english: "Branch", spanish: "Rama" },
  { english: "Debugging", spanish: "Depuración" },
  { english: "Compilation", spanish: "Compilación" },
  { english: "Syntax", spanish: "Sintaxis" },
  { english: "Variable", spanish: "Variable" },
  { english: "Array", spanish: "Arreglo / Matriz" },
  { english: "String", spanish: "Cadena de caracteres" },
  { english: "Boolean", spanish: "Booleano" },
  { english: "Integer", spanish: "Entero" },
  { english: "Float", spanish: "Número de coma flotante" },
  { english: "Loop", spanish: "Bucle" },
  { english: "Function", spanish: "Función" },
  { english: "Inheritance", spanish: "Herencia" },
  { english: "Polymorphism", spanish: "Polimorfismo" },
  { english: "Encapsulation", spanish: "Encapsulamiento" },
  { english: "Database", spanish: "Base de datos" },
  { english: "Primary Key", spanish: "Clave primaria" },
  { english: "Foreign Key", spanish: "Clave foránea" },
  { english: "Authentication", spanish: "Autenticación" },
  { english: "Authorization", spanish: "Autorización" },
  { english: "Token", spanish: "Testigo / Token" },
  { english: "Cookie", spanish: "Galleta informática" },
  { english: "Load Balancer", spanish: "Balanceador de carga" },
  { english: "Cluster", spanish: "Clúster" },
  { english: "Redundancy", spanish: "Redundancia" },
  { english: "Scalability", spanish: "Escalabilidad" },
  { english: "Virtual Machine", spanish: "Máquina Virtual" },
  { english: "Container", spanish: "Contenedor" },
  { english: "Orchestration", spanish: "Orquestación" },
  { english: "Serverless", spanish: "Sin servidor" },
  { english: "Microservices", spanish: "Microservicios" },
  { english: "Monolith", spanish: "Monolito" },
  { english: "Front-end", spanish: "Interfaz de usuario (Cliente)" },
  { english: "Back-end", spanish: "Lógica de servidor" },
  { english: "Markup", spanish: "Marcado" },
  { english: "Stylesheet", spanish: "Hoja de estilos" },
  { english: "Compiler", spanish: "Compilador" },
  { english: "Interpreter", spanish: "Intérprete" },
  { english: "Version Control", spanish: "Control de versiones" },
  { english: "Agile", spanish: "Metodología Ágil" },
  { english: "Sprint", spanish: "Iteración" },
  { english: "Backlog", spanish: "Trabajo pendiente" },
  { english: "Thread", spanish: "Hilo de ejecución" },
  { english: "Concurrency", spanish: "Concurrencia" },
  { english: "Parallelism", spanish: "Paralelismo" },
  { english: "Asynchronous", spanish: "Asíncrono" },
  { english: "Callback", spanish: "Devolución de llamada" },
  { english: "Promise", spanish: "Promesa" },
  { english: "Socket", spanish: "Conector de red (Socket)" },
  { english: "Firmware", spanish: "Soporte lógico inalterable" },
  { english: "Hardware", spanish: "Soporte físico" },
  { english: "Motherboard", spanish: "Placa base" },
  { english: "Peripheral", spanish: "Periférico" },
  { english: "Driver", spanish: "Controlador" },
  { english: "Kernel", spanish: "Núcleo" },
  { english: "Shell", spanish: "Intérprete de comandos" }
];

let data = fs.readFileSync('src/data.js', 'utf8');

// The initialDictionary is an array. We can inject our tech words inside the array.
// Find "export const initialDictionary = ["
const targetStr = 'export const initialDictionary = [';
const insertPos = data.indexOf(targetStr) + targetStr.length;

if (insertPos > targetStr.length) {
  // Let's figure out a high starting ID. We assume words list is up to 1000. Let's start at 2000.
  let startId = 2000;
  
  let injection = "\\n";
  techWords.forEach(w => {
    injection += \`  { "id": \${startId++}, "english": "\${w.english}", "spanish": "\${w.spanish}" },\\n\`;
  });
  
  const newData = data.slice(0, insertPos) + injection + data.slice(insertPos);
  fs.writeFileSync('src/data.js', newData);
  console.log("Added " + techWords.length + " technical words to data.js!");
} else {
  console.log("Could not find the array to inject words.");
}
