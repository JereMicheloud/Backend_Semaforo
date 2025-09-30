// Script de prueba para enviar datos de sensores al API
const testSensorData = async () => {
  const data = {
    sensor1: 25.43,
    sensor2: 30.12,
    sensor3: 15.67,
    sensor4: 42.89,
    timestamp: Math.floor(Date.now() / 1000)
  };

  try {
    const response = await fetch('http://localhost:3000/api/sensors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('✅ Datos enviados correctamente:', result);
    
    // Obtener la última lectura
    const latestResponse = await fetch('http://localhost:3000/api/sensors/latest');
    const latestData = await latestResponse.json();
    console.log('📊 Última lectura:', latestData);

    // Obtener estadísticas
    const analyticsResponse = await fetch('http://localhost:3000/api/sensors/analytics?hours=1');
    const analyticsData = await analyticsResponse.json();
    console.log('📈 Analytics:', analyticsData);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Ejecutar si no es import
if (typeof module !== 'undefined' && require.main === module) {
  testSensorData();
}

export { testSensorData };