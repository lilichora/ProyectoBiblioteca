import { Controller, OnModuleInit } from '@nestjs/common';
import { ReportsService } from '../services/services.service';
import { AuthService } from '../../auth/services/services.service';
import * as soap from 'soap';
import * as http from 'http';

@Controller('soap/reports')
export class ReportsSoapController implements OnModuleInit {
  private soapServer: any;

  constructor(
    private readonly reportsService: ReportsService,
    private readonly authService: AuthService,
  ) {}

  private async validateToken(headers: any): Promise<void> {
    // Acceder al token del header SOAP correctamente
    const token = headers?.AuthHeader?.token ||
                 headers?.['tns:AuthHeader']?.token ||
                 headers?.['AuthHeader']?.token;

    console.log('Headers recibidos:', JSON.stringify(headers, null, 2)); // Para debug

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
      <definitions name="ReportsService"
                  targetNamespace="http://www.biblioteca.com/reports-service/"
                  xmlns:tns="http://www.biblioteca.com/reports-service/"
                  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
                  xmlns:xsd="http://www.w3.org/2001/XMLSchema">
        
        <types>
          <xsd:schema targetNamespace="http://www.biblioteca.com/reports-service/">
            <!-- Definición del AuthHeader -->
            <xsd:element name="AuthHeader">
              <xsd:complexType>
                <xsd:sequence>
                  <xsd:element name="token" type="xsd:string"/>
                </xsd:sequence>
              </xsd:complexType>
            </xsd:element>
            
<!-- ActiveLoansReportRequest -->
<xsd:element name="ActiveLoansReportRequest">
  <xsd:complexType>
    <xsd:sequence>
      <xsd:element name="startDate" type="xsd:date" minOccurs="0"/>
      <xsd:element name="endDate" type="xsd:date" minOccurs="0"/>
      <xsd:element name="userId" type="xsd:string" minOccurs="0"/>
      <xsd:element name="bookCategory" type="xsd:string" minOccurs="0"/>
      <xsd:element name="format" type="xsd:string"/> <!-- Añadir formato -->
    </xsd:sequence>
  </xsd:complexType>
</xsd:element>

<!-- ActiveLoansReportResponse -->
<xsd:element name="ActiveLoansReportResponse">
  <xsd:complexType>
    <xsd:sequence>
      <xsd:element name="file" type="xsd:string"/>
      <xsd:element name="format" type="xsd:string"/>
    </xsd:sequence>
  </xsd:complexType>
</xsd:element>

            <!-- UserHistoryRequest -->
            <xsd:element name="UserHistoryRequest">
              <xsd:complexType>
                <xsd:sequence>
                  <xsd:element name="userId" type="xsd:string"/>
                  <xsd:element name="format" type="xsd:string"/>
                </xsd:sequence>
              </xsd:complexType>
            </xsd:element>

            <!-- UserHistoryResponse -->
            <xsd:element name="UserHistoryResponse">
              <xsd:complexType>
                <xsd:sequence>
                  <xsd:element name="file" type="xsd:string"/>
                  <xsd:element name="format" type="xsd:string"/>
                </xsd:sequence>
              </xsd:complexType>
            </xsd:element>
          </xsd:schema>
        </types>

        <message name="ActiveLoansReportRequest">
          <part name="parameters" element="tns:ActiveLoansReportRequest"/>
        </message>
        <message name="ActiveLoansReportResponse">
          <part name="parameters" element="tns:ActiveLoansReportResponse"/>
        </message>
        <message name="UserHistoryRequest">
          <part name="parameters" element="tns:UserHistoryRequest"/>
        </message>
        <message name="UserHistoryResponse">
          <part name="parameters" element="tns:UserHistoryResponse"/>
        </message>

        <portType name="ReportsPort">
          <operation name="GenerateActiveLoansReport">
            <input message="tns:ActiveLoansReportRequest"/>
            <output message="tns:ActiveLoansReportResponse"/>
          </operation>
          <operation name="GenerateUserHistory">
            <input message="tns:UserHistoryRequest"/>
            <output message="tns:UserHistoryResponse"/>
          </operation>
        </portType>

        <binding name="ReportsBinding" type="tns:ReportsPort">
          <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
          <operation name="GenerateActiveLoansReport">
            <soap:operation soapAction="GenerateActiveLoansReport"/>
            <input>
              <soap:body use="literal"/>
            </input>
            <output>
              <soap:body use="literal"/>
            </output>
          </operation>
          <operation name="GenerateUserHistory">
            <soap:operation soapAction="GenerateUserHistory"/>
            <input>
              <soap:body use="literal"/>
            </input>
            <output>
              <soap:body use="literal"/>
            </output>
          </operation>
        </binding>

        <service name="ReportsService">
          <port name="ReportsPort" binding="tns:ReportsBinding">
            <soap:address location="http://localhost:3003/soap/reports"/>
          </port>
        </service>
      </definitions>`;

    const service = {
      ReportsService: {
        ReportsPort: {
          GenerateActiveLoansReport: async (args: any, callback: any, headers: any) => {
            try {
              await this.validateToken(headers);
              const report = await this.reportsService.generateActiveLoansReport(args);
              
              // Generar PDF o Excel según el formato solicitado
              const fileBuffer = args.format === 'PDF' 
                ? await this.reportsService.generateActiveLoansPDF(report)
                : await this.reportsService.generateActiveLoansExcel(report);
          
              return { 
                file: fileBuffer.toString('base64'),
                format: args.format 
              };
            } catch (error) {
              return { error: error.message };
            }
          },
          GenerateUserHistory: async (args: any, callback: any, headers: any) => {
            try {
              await this.validateToken(headers);
              const fileBuffer = await this.reportsService.generateUserHistory({
                userId: args.userId,
                format: args.format,
              });
              return { 
                file: fileBuffer.toString('base64'),
                format: args.format 
              };
            } catch (error) {
              return { error: error.message };
            }
          }
        }
      }
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

    server.listen(3003);
    this.soapServer = soap.listen(server, '/soap/reports', service, wsdl);
  }
}