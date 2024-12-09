// src/reports/controllers/reports-proxy.controller.ts
import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import * as soap from 'soap';

@Controller('proxy/soap/reports')
export class ReportsSoapProxyController {
  private soapUrl = 'http://localhost:3003/soap/reports?wsdl';

  private async createSoapClient() {
    return new Promise<any>((resolve, reject) => {
      const options = {
        disableCache: true,
        forceSoap12: false
      };

      soap.createClient(this.soapUrl, options, (err, client) => {
        if (err) {
          console.error('Error creando cliente SOAP:', err);
          reject(new HttpException(
            'Error al conectar con el servicio SOAP',
            HttpStatus.SERVICE_UNAVAILABLE
          ));
          return;
        }
        resolve(client);
      });
    });
  }

  private addAuthHeader(client: any, token: string) {
    const cleanToken = token.replace('Bearer ', '');
    const header = {
      'tns:AuthHeader': {
        'tns:token': cleanToken
      }
    };

    client.clearSoapHeaders();
    client.addSoapHeader(header);
  }

  @Post('user-history')
  async getUserHistory(
    @Body() historyData: { userId: string; format: 'PDF' | 'EXCEL' },
    @Headers('authorization') token: string
  ) {
    try {
      const client = await this.createSoapClient();
      this.addAuthHeader(client, token);

      return new Promise((resolve, reject) => {
        const params = {
          userId: historyData.userId,
          format: historyData.format
        };

        client.GenerateUserHistory(params, (err, result) => {
          if (err) {
            console.error('Error en GenerateUserHistory:', err);
            reject(new HttpException(
              'Error al generar el historial',
              HttpStatus.BAD_REQUEST
            ));
          } else {
            resolve(result);
          }
        });
      });

    } catch (error) {
      console.error('Error en getUserHistory:', error);
      throw new HttpException(
        'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('active-loans')
  async getActiveLoansReport(
    @Body() reportData: {
      startDate?: Date;
      endDate?: Date;
      userId?: string;
      bookCategory?: string;
      format: 'PDF' | 'EXCEL';
    },
    @Headers('authorization') token: string
  ) {
    try {
      const client = await this.createSoapClient();
      this.addAuthHeader(client, token);
  
      return new Promise((resolve, reject) => {
        client.GenerateActiveLoansReport(reportData, (err, result) => {
          if (err) {
            console.error('Error en GenerateActiveLoansReport:', err);
            reject(new HttpException(
              'Error al generar el reporte',
              HttpStatus.BAD_REQUEST
            ));
          } else {
            // Devolver el archivo en base64 y su formato
            resolve({
              file: result.file,
              format: result.format
            });
          }
        });
      });
    } catch (error) {
      console.error('Error en getActiveLoansReport:', error);
      throw new HttpException(
        'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}