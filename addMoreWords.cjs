const fs = require('fs');

const extraWords = [
  // BASICS / FAMILY / HOME
  { english: "Mom", spanish: "Mamá", category: "daily" },
  { english: "Dad", spanish: "Papá", category: "daily" },
  { english: "Mother", spanish: "Madre", category: "daily" },
  { english: "Father", spanish: "Padre", category: "daily" },
  { english: "Brother", spanish: "Hermano", category: "daily" },
  { english: "Sister", spanish: "Hermana", category: "daily" },
  { english: "Bed", spanish: "Cama", category: "daily" },
  { english: "Bedroom", spanish: "Habitación / Dormitorio", category: "daily" },
  { english: "Living room", spanish: "Sala de estar", category: "daily" },
  { english: "Kitchen", spanish: "Cocina", category: "daily" },
  { english: "Bathroom", spanish: "Baño", category: "daily" },
  { english: "Table", spanish: "Mesa", category: "daily" },
  { english: "Chair", spanish: "Silla", category: "daily" },
  { english: "Door", spanish: "Puerta", category: "daily" },
  { english: "Window", spanish: "Ventana", category: "daily" },
  { english: "House", spanish: "Casa", category: "daily" },
  { english: "Home", spanish: "Hogar", category: "daily" },
  { english: "Spoon", spanish: "Cuchara", category: "daily" },
  { english: "Fork", spanish: "Tenedor", category: "daily" },
  { english: "Knife", spanish: "Cuchillo", category: "daily" },
  { english: "Plate", spanish: "Plato", category: "daily" },
  { english: "Cup", spanish: "Taza", category: "daily" },
  { english: "Glass", spanish: "Vaso", category: "daily" },
  { english: "Water", spanish: "Agua", category: "daily" },
  { english: "Food", spanish: "Comida", category: "daily" },
  { english: "Breakfast", spanish: "Desayuno", category: "daily" },
  { english: "Lunch", spanish: "Almuerzo", category: "daily" },
  { english: "Dinner", spanish: "Cena", category: "daily" },

  // MATH / SCIENCE
  { english: "Mathematics", spanish: "Matemáticas", category: "math" },
  { english: "Equation", spanish: "Ecuación", category: "math" },
  { english: "Calculus", spanish: "Cálculo", category: "math" },
  { english: "Algebra", spanish: "Álgebra", category: "math" },
  { english: "Geometry", spanish: "Geometría", category: "math" },
  { english: "Fraction", spanish: "Fracción", category: "math" },
  { english: "Theorem", spanish: "Teorema", category: "math" },
  { english: "Variable", spanish: "Variable", category: "math" },
  { english: "Integral", spanish: "Integral", category: "math" },
  { english: "Derivative", spanish: "Derivada", category: "math" },
  { english: "Probability", spanish: "Probabilidad", category: "math" },
  { english: "Statistics", spanish: "Estadística", category: "math" },
  { english: "Science", spanish: "Ciencia", category: "science" },
  { english: "Physics", spanish: "Física", category: "science" },
  { english: "Chemistry", spanish: "Química", category: "science" },
  { english: "Biology", spanish: "Biología", category: "science" },
  { english: "Atom", spanish: "Átomo", category: "science" },
  { english: "Molecule", spanish: "Molécula", category: "science" },
  { english: "Gravity", spanish: "Gravedad", category: "science" },
  { english: "Velocity", spanish: "Velocidad", category: "science" },
  { english: "Mass", spanish: "Masa", category: "science" },
  { english: "Energy", spanish: "Energía", category: "science" },
  { english: "Evolution", spanish: "Evolución", category: "science" },

  // MORE TECHNOLOGY / IT
  { english: "Cybersecurity", spanish: "Ciberseguridad", category: "tech" },
  { english: "Malware", spanish: "Software malicioso", category: "tech" },
  { english: "Ransomware", spanish: "Secuestro de datos", category: "tech" },
  { english: "Phishing", spanish: "Suplantación de identidad", category: "tech" },
  { english: "Blockchain", spanish: "Cadena de bloques", category: "tech" },
  { english: "Cryptocurrency", spanish: "Criptomoneda", category: "tech" },
  { english: "Artificial Intelligence", spanish: "Inteligencia Artificial", category: "tech" },
  { english: "Machine Learning", spanish: "Aprendizaje Automático", category: "tech" },
  { english: "Deep Learning", spanish: "Aprendizaje Profundo", category: "tech" },
  { english: "Neural Network", spanish: "Red Neuronal", category: "tech" },
  { english: "Data Mining", spanish: "Minería de datos", category: "tech" },
  { english: "Cloud Computing", spanish: "Computación en la nube", category: "tech" },
  { english: "Virtual Reality", spanish: "Realidad Virtual", category: "tech" },
  { english: "Augmented Reality", spanish: "Realidad Aumentada", category: "tech" },
  { english: "Operating System", spanish: "Sistema Operativo", category: "tech" },
  { english: "Source Code", spanish: "Código fuente", category: "tech" },
  { english: "Open Source", spanish: "Código abierto", category: "tech" },
  { english: "API", spanish: "Interfaz de Programación de Aplicaciones", category: "tech" },
  { english: "Repository", spanish: "Repositorio", category: "tech" },
  { english: "Bandwidth", spanish: "Ancho de banda", category: "tech" },
  { english: "Pixel", spanish: "Píxel", category: "tech" },
  { english: "Resolution", spanish: "Resolución", category: "tech" },
  { english: "Server", spanish: "Servidor", category: "tech" },
  { english: "Client", spanish: "Cliente", category: "tech" }
];

let data = fs.readFileSync('src/data.js', 'utf8');

const targetStr = 'export const initialDictionary = [';
const insertPos = data.indexOf(targetStr) + targetStr.length;

if (insertPos >= targetStr.length) {
  let startId = 3000;
  
  let injection = "\n";
  extraWords.forEach(w => {
    injection += `  { "id": ${startId++}, "english": "${w.english}", "spanish": "${w.spanish}", "category": "${w.category}" },\n`;
  });
  
  const newData = data.slice(0, insertPos) + injection + data.slice(insertPos);
  fs.writeFileSync('src/data.js', newData);
  console.log("Successfully added " + extraWords.length + " basic and technical words to data.js!");
} else {
  console.log("Could not find the array to inject words.");
}
