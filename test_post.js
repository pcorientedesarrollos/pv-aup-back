const http = require('http');

const data = JSON.stringify({
  nombre: 'Test',
  rfc: 'XAXX010101000'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/pos/proveedores',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
