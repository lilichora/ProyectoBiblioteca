import { Controller, OnModuleInit, Inject, forwardRef} from '@nestjs/common';
import { UsersService } from '../services/services.service';
import { AuthService } from '../../auth/services/services.service';
import { UserType } from '../factory/user.factory';
import * as soap from 'soap';
import * as http from 'http';

@Controller('usuarios')
export class UsersSoapController implements OnModuleInit {
  private soapServer: any;

  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  private async validateAdminRole(headers: any): Promise<void> {
    const token = headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No se ha proporcionado un token');
    }

    try {
      const decoded = await this.authService.verifyToken(token);
      if (decoded.userType !== UserType.ADMIN) {
        throw new Error('No tienes permisos para realizar esta acción');
      }
    } catch (error) {
      throw error;
    }
  }

  async onModuleInit() {
    await this.initializeSoapServer();
  }

  private async initializeSoapServer() {
    const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://www.biblioteca.com/users-service/"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             name="UsersService"
             targetNamespace="http://www.biblioteca.com/users-service/">

  <types>
    <xsd:schema targetNamespace="http://www.biblioteca.com/users-service/">
      <!-- RegisterUserRequest -->
      <xsd:element name="RegisterUserRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="name" type="xsd:string"/>
            <xsd:element name="email" type="xsd:string"/>
            <xsd:element name="userType" type="xsd:string"/>
            <xsd:element name="password" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <!-- RegisterUserResponse -->
      <xsd:element name="RegisterUserResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="userId" type="xsd:string"/>
            <xsd:element name="status" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <!-- SuspendUserRequest -->
      <xsd:element name="SuspendUserRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="userId" type="xsd:string"/>
            <xsd:element name="reason" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <!-- SuspendUserResponse -->
      <xsd:element name="SuspendUserResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="status" type="xsd:string"/>
            <xsd:element name="message" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>

  <message name="RegisterUserRequest">
    <part name="parameters" element="tns:RegisterUserRequest"/>
  </message>
  <message name="RegisterUserResponse">
    <part name="parameters" element="tns:RegisterUserResponse"/>
  </message>
  <message name="SuspendUserRequest">
    <part name="parameters" element="tns:SuspendUserRequest"/>
  </message>
  <message name="SuspendUserResponse">
    <part name="parameters" element="tns:SuspendUserResponse"/>
  </message>

  <portType name="UsersPort">
    <operation name="RegisterUser">
      <input message="tns:RegisterUserRequest"/>
      <output message="tns:RegisterUserResponse"/>
    </operation>
    <operation name="SuspendUser">
      <input message="tns:SuspendUserRequest"/>
      <output message="tns:SuspendUserResponse"/>
    </operation>
  </portType>

  <binding name="UsersBinding" type="tns:UsersPort">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="RegisterUser">
      <soap:operation soapAction="RegisterUser"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
    </operation>
    <operation name="SuspendUser">
      <soap:operation soapAction="SuspendUser"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
    </operation>
  </binding>

  <service name="UsersService">
    <port name="UsersPort" binding="tns:UsersBinding">
      <soap:address location="http://localhost:3001/soap/users"/>
    </port>
  </service>
</definitions>`;
    const service = {
      UsersService: {
        UsersPort: {
          RegisterUser: async (args: any, callback: any, headers: any) => {
            try {
              console.log('Headers recibidos:', headers); // Para debug
              // Intentar obtener el token del header SOAP y del header HTTP
              const token = headers?.authorization || 
                          headers?.Authorization || 
                          headers?.['Authorization'] ||
                          headers?.['tns:Authorization'];
              
              if (!token) {
                console.log('No se encontró token en headers:', headers);
                throw new Error('No se ha proporcionado un token');
              }

              await this.validateAdminRole({ authorization: token });

              const user = await this.usersService.registerUser(
                args.name,
                args.email,
                args.userType,
                args.password,
              );

              return {
                userId: user.id,
                status: 'success',
              };
            } catch (error) {
              console.error('Error en RegisterUser:', error);
              return {
                userId: null,
                status: error.message,
              };
            }
          },
          SuspendUser: async (args: any, callback: any, headers: any) => {
            try {
              console.log('Headers recibidos:', headers);
              const token = headers?.authorization || 
                           headers?.Authorization || 
                           headers?.['Authorization'] ||
                           headers?.['tns:Authorization'];
              
              if (!token) {
                console.log('No se encontró token en headers:', headers);
                throw new Error('No se ha proporcionado un token');
              }    
              await this.validateAdminRole({ authorization: token });    
              const user = await this.usersService.suspendUser(
                args.userId,
                args.reason
              );    
              return {
                status: 'success',
                message: `Usuario ${user.id} suspendido exitosamente`
              };
            } catch (error) {
              console.error('Error en SuspendUser:', error);
              return {
                status: 'error',
                message: error.message
              };
            }
          },
        },
      },
    };

    const server = http.createServer((request, response) => {
      // Configurar CORS
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, SOAPAction');

      if (request.method === 'OPTIONS') {
        response.writeHead(200);
        response.end();
        return;
      }
      response.end('404: Not Found: ' + request.url);
    });

    server.listen(3001);
    this.soapServer = soap.listen(server, '/soap/users', service, wsdl);
  }
}
