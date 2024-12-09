import { Controller, OnModuleInit } from '@nestjs/common';
import { LoansService } from '../services/services.service';
import { AuthService } from '../../auth/services/services.service';

import * as soap from 'soap';
import * as http from 'http';

@Controller('soap/loans')
export class LoansSoapController implements OnModuleInit {
  private soapServer: any;

  constructor(
    private readonly loansService: LoansService,
    private readonly authService: AuthService,
  ) {}
  private async validateToken(headers: any): Promise<void> {
    // Intenta obtener el token del header HTTP o del header SOAP
    const token = headers?.authorization?.replace('Bearer ', '') || 
                 headers?.Authorization?.replace('Bearer ', '') ||
                 headers?.['tns:Authorization']?.replace('Bearer ', '');
                 
    if (!token) {
      throw new Error('No se ha proporcionado un token');
    }

    try {
      await this.authService.verifyToken(token);
    } catch (error) {
      throw new Error('Token inválido');
    }
}
  async onModuleInit() {
    await this.initializeSoapServer();
  }

  private async initializeSoapServer() {
    const wsdl = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://www.biblioteca.com/loans-service/"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             name="LoansService"
             targetNamespace="http://www.biblioteca.com/loans-service/">

  <types>
    <xsd:schema targetNamespace="http://www.biblioteca.com/loans-service/">
      <!-- CreateLoanRequest -->
      <xsd:element name="CreateLoanRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="bookId" type="xsd:string"/>
            <xsd:element name="userId" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <!-- CreateLoanResponse -->
      <xsd:element name="CreateLoanResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="loanId" type="xsd:string"/>
            <xsd:element name="status" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <!-- ReturnLoanRequest -->
      <xsd:element name="ReturnLoanRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="loanId" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <!-- ReturnLoanResponse -->
      <xsd:element name="ReturnLoanResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="status" type="xsd:string"/>
            <xsd:element name="message" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>

  <message name="CreateLoanRequest">
    <part name="parameters" element="tns:CreateLoanRequest"/>
  </message>
  <message name="CreateLoanResponse">
    <part name="parameters" element="tns:CreateLoanResponse"/>
  </message>
  <message name="ReturnLoanRequest">
    <part name="parameters" element="tns:ReturnLoanRequest"/>
  </message>
  <message name="ReturnLoanResponse">
    <part name="parameters" element="tns:ReturnLoanResponse"/>
  </message>

  <portType name="LoansPort">
    <operation name="CreateLoan">
      <input message="tns:CreateLoanRequest"/>
      <output message="tns:CreateLoanResponse"/>
    </operation>
    <operation name="ReturnLoan">
      <input message="tns:ReturnLoanRequest"/>
      <output message="tns:ReturnLoanResponse"/>
    </operation>
  </portType>

  <binding name="LoansBinding" type="tns:LoansPort">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="CreateLoan">
      <soap:operation soapAction="CreateLoan"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
    </operation>
    <operation name="ReturnLoan">
      <soap:operation soapAction="ReturnLoan"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
    </operation>
  </binding>

  <service name="LoansService">
    <port name="LoansPort" binding="tns:LoansBinding">
      <soap:address location="http://localhost:3002/soap/loans"/>
    </port>
  </service>
</definitions>`;

    const service = {
      LoansService: {
        LoansPort: {
          CreateLoan: async (args: any, callback: any, headers: any) => {
            try {
              // Validar autenticación
              await this.validateToken(headers);

              const loan = await this.loansService.createLoan(args);
              return {
                loanId: loan.id,
                status: 'success',
              };
            } catch (error) {
              return {
                loanId: null,
                status: error.message,
              };
            }
          },
          ReturnLoan: async (args: any, callback: any, headers: any) => {
            try {
              // Validar autenticación
              await this.validateToken(headers);

              await this.loansService.returnLoan(args.loanId);
              return {
                status: 'success',
                message: 'Préstamo devuelto exitosamente',
              };
            } catch (error) {
              return {
                status: 'error',
                message: error.message,
              };
            }
          },
        },
      },
    };

    const server = http.createServer((request, response) => {
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

    server.listen(3002);

    this.soapServer = soap.listen(server, '/soap/loans', service, wsdl);
  }
}
