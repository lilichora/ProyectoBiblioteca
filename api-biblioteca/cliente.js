const soap = require('soap');

const url = 'http://localhost:3001/soap/users?wsdl'; // URL de tu servicio SOAP
const args = {
  name: 'lillia111111',
  email: 'lillia1111@espe.edu.ec',
  userType: 'student',
  password: '123a111111'
};

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZHJlQGdtYWlsLmNvbSIsInN1YiI6ImEzNTYyNGQzLWQ3NWQtNGM1Yy04MGUwLWUyMzU2MGUwNTM2MCIsInVzZXJUeXBlIjoiYWRtaW4iLCJpYXQiOjE3MzM3NTY4OTEsImV4cCI6MTczMzg0MzI5MX0.-R6zEYlTEft36InHanr0xeKH_e4t7lLIgK5uy472w6I'; // Reemplaza con tu token completo

soap.createClient(url, function(err, client) {
  if (err) {
    console.error('Error al crear el cliente SOAP:', err);
  } else {
    // Crear el encabezado SOAP con el token
    const soapHeader = {
      'tns:Authorization': token
    };
    
    // Agregar el encabezado SOAP al cliente
    client.addSoapHeader(soapHeader, '', 'http://www.biblioteca.com/users-service/', '');

    client.RegisterUser(args, function(err, result) {
      if (err) {
        console.error('Error al invocar RegisterUser:', err);
      } else {
        console.log('Resultado:', result);
      }
    });
  }
});