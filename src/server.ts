import App from './app';

// Crear y iniciar la aplicación
const app = new App();

app.start().catch((error) => {
  console.error('❌ Error fatal al iniciar la aplicación:', error);
  process.exit(1);
});