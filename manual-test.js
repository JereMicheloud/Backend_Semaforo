// Test manual completo para el Backend de Semáforos
const testBackend = async () => {
  console.log('🧪 Iniciando tests del Backend de Semáforos...\n');
  
  const baseURL = 'http://localhost:3000';
  let testsPassed = 0;
  let testsTotal = 0;

  // Helper para hacer requests
  const makeRequest = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      return { status: 500, error: error.message };
    }
  };

  // Test 1: Health Check
  testsTotal++;
  console.log('📋 Test 1: Health Check');
  try {
    const result = await makeRequest(`${baseURL}/health`);
    if (result.status === 200 && result.data.status === 'OK') {
      console.log('✅ PASSED: Health check funciona correctamente');
      console.log(`   Status: ${result.data.status}`);
      console.log(`   Uptime: ${result.data.uptime} segundos\n`);
      testsPassed++;
    } else {
      console.log('❌ FAILED: Health check no funciona');
    }
  } catch (error) {
    console.log('❌ FAILED: Error en health check:', error.message);
  }

  // Test 2: Ruta principal
  testsTotal++;
  console.log('📋 Test 2: Ruta Principal (/)');
  try {
    const result = await makeRequest(`${baseURL}/`);
    if (result.status === 200 && result.data.message) {
      console.log('✅ PASSED: Ruta principal funciona');
      console.log(`   Mensaje: ${result.data.message}`);
      console.log(`   Endpoints disponibles: ${Object.keys(result.data.endpoints).length}\n`);
      testsPassed++;
    } else {
      console.log('❌ FAILED: Ruta principal no funciona');
    }
  } catch (error) {
    console.log('❌ FAILED: Error en ruta principal:', error.message);
  }

  // Test 3: Enviar datos de sensores
  testsTotal++;
  console.log('📋 Test 3: POST /api/sensors');
  const sensorData = {
    sensor1: 25.43,
    sensor2: 30.12,
    sensor3: 15.67,
    sensor4: 42.89,
    timestamp: Math.floor(Date.now() / 1000)
  };

  try {
    const result = await makeRequest(`${baseURL}/api/sensors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sensorData)
    });

    if (result.status === 201 && result.data.success) {
      console.log('✅ PASSED: Datos de sensores enviados correctamente');
      console.log(`   ID de lectura: ${result.data.data.id}`);
      console.log(`   Timestamp: ${new Date(result.data.data.createdAt).toLocaleString()}\n`);
      testsPassed++;
    } else {
      console.log('❌ FAILED: Error al enviar datos de sensores');
      console.log(`   Status: ${result.status}`);
      console.log(`   Response: ${JSON.stringify(result.data)}`);
    }
  } catch (error) {
    console.log('❌ FAILED: Error en envío de datos:', error.message);
  }

  // Test 4: Obtener última lectura
  testsTotal++;
  console.log('📋 Test 4: GET /api/sensors/latest');
  try {
    const result = await makeRequest(`${baseURL}/api/sensors/latest`);
    if (result.status === 200 && result.data.success) {
      console.log('✅ PASSED: Última lectura obtenida correctamente');
      console.log(`   Sensor 1: ${result.data.data.sensor1} cm`);
      console.log(`   Sensor 2: ${result.data.data.sensor2} cm`);
      console.log(`   Sensor 3: ${result.data.data.sensor3} cm`);
      console.log(`   Sensor 4: ${result.data.data.sensor4} cm\n`);
      testsPassed++;
    } else {
      console.log('❌ FAILED: Error al obtener última lectura');
    }
  } catch (error) {
    console.log('❌ FAILED: Error en última lectura:', error.message);
  }

  // Test 5: Obtener analytics
  testsTotal++;
  console.log('📋 Test 5: GET /api/sensors/analytics');
  try {
    const result = await makeRequest(`${baseURL}/api/sensors/analytics?hours=1`);
    if (result.status === 200 && result.data.success) {
      console.log('✅ PASSED: Analytics obtenidos correctamente');
      console.log(`   Total de lecturas: ${result.data.data.totalReadings}`);
      console.log(`   Alertas detectadas: ${result.data.data.alertsCount}`);
      console.log(`   Promedio Sensor 1: ${result.data.data.averageValues.sensor1} cm\n`);
      testsPassed++;
    } else {
      console.log('❌ FAILED: Error al obtener analytics');
    }
  } catch (error) {
    console.log('❌ FAILED: Error en analytics:', error.message);
  }

  // Test 6: Obtener datos para gráficos
  testsTotal++;
  console.log('📋 Test 6: GET /api/sensors/chart-data');
  try {
    const result = await makeRequest(`${baseURL}/api/sensors/chart-data?hours=1`);
    if (result.status === 200 && result.data.success) {
      console.log('✅ PASSED: Datos de gráfico obtenidos correctamente');
      console.log(`   Puntos de datos: ${result.data.data.length}`);
      console.log(`   Rango de tiempo: última hora\n`);
      testsPassed++;
    } else {
      console.log('❌ FAILED: Error al obtener datos de gráfico');
    }
  } catch (error) {
    console.log('❌ FAILED: Error en datos de gráfico:', error.message);
  }

  // Test 7: Validación de datos inválidos
  testsTotal++;
  console.log('📋 Test 7: Validación de datos inválidos');
  const invalidData = {
    sensor1: 'invalid',
    sensor2: 30.12,
    sensor3: 15.67,
    sensor4: 42.89,
    timestamp: 'invalid'
  };

  try {
    const result = await makeRequest(`${baseURL}/api/sensors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });

    if (result.status === 400) {
      console.log('✅ PASSED: Validación de datos inválidos funciona');
      console.log('   El sistema rechazó correctamente datos inválidos\n');
      testsPassed++;
    } else {
      console.log('❌ FAILED: Sistema aceptó datos inválidos');
    }
  } catch (error) {
    console.log('❌ FAILED: Error en validación:', error.message);
  }

  // Test 8: Ruta inexistente (404)
  testsTotal++;
  console.log('📋 Test 8: Manejo de ruta inexistente');
  try {
    const result = await makeRequest(`${baseURL}/ruta-inexistente`);
    if (result.status === 404) {
      console.log('✅ PASSED: Manejo de 404 funciona correctamente');
      console.log('   El sistema maneja correctamente rutas inexistentes\n');
      testsPassed++;
    } else {
      console.log('❌ FAILED: Sistema no maneja correctamente rutas inexistentes');
    }
  } catch (error) {
    console.log('❌ FAILED: Error en manejo 404:', error.message);
  }

  // Test de carga: Enviar múltiples datos
  testsTotal++;
  console.log('📋 Test 9: Test de carga (10 requests)');
  try {
    const promises = [];
    for (let i = 0; i < 10; i++) {
      const data = {
        sensor1: 20 + Math.random() * 10,
        sensor2: 25 + Math.random() * 15,
        sensor3: 10 + Math.random() * 20,
        sensor4: 35 + Math.random() * 25,
        timestamp: Math.floor(Date.now() / 1000) + i
      };
      
      promises.push(makeRequest(`${baseURL}/api/sensors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }));
    }

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.status === 201).length;
    
    if (successful === 10) {
      console.log('✅ PASSED: Test de carga completado exitosamente');
      console.log(`   ${successful}/10 requests exitosos\n`);
      testsPassed++;
    } else {
      console.log(`❌ FAILED: Solo ${successful}/10 requests exitosos`);
    }
  } catch (error) {
    console.log('❌ FAILED: Error en test de carga:', error.message);
  }

  // Resultados finales
  console.log('=' * 50);
  console.log('🏁 RESULTADOS FINALES:');
  console.log(`📊 Tests ejecutados: ${testsTotal}`);
  console.log(`✅ Tests exitosos: ${testsPassed}`);
  console.log(`❌ Tests fallidos: ${testsTotal - testsPassed}`);
  console.log(`📈 Éxito: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON! Tu backend está funcionando perfectamente.');
  } else {
    console.log(`\n⚠️  ${testsTotal - testsPassed} tests fallaron. Revisa los errores anteriores.`);
  }
  
  console.log('\n🔗 URLs para probar manualmente:');
  console.log(`   Dashboard: ${baseURL}/dashboard`);
  console.log(`   API Docs: ${baseURL}/`);
  console.log(`   Health: ${baseURL}/health`);
};

// Ejecutar tests
testBackend().catch(error => {
  console.error('💥 Error fatal en tests:', error);
});