// src/loans/controllers/loans-proxy.controller.ts
import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import * as soap from 'soap';

@Controller('proxy/soap/loans')
export class LoansSoapProxyController {
  private soapUrl = 'http://localhost:3002/soap/loans?wsdl';

  @Post('create')
  async createLoan(
    @Body() loanData: { bookId: string; userId: string }, 
    @Headers('authorization') token: string
  ) {
    try {
      const client = await new Promise<any>((resolve, reject) => {
        soap.createClient(this.soapUrl, (err, client) => {
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

      client.addSoapHeader(
        { 'tns:Authorization': token },
        '',
        'http://www.biblioteca.com/loans-service/',
        ''
      );

      return new Promise((resolve, reject) => {
        client.CreateLoan(loanData, (err, result) => {
          if (err) {
            console.error('Error en CreateLoan:', err);
            reject(new HttpException(
              'Error al crear el préstamo',
              HttpStatus.BAD_REQUEST
            ));
          } else {
            resolve(result);
          }
        });
      });

    } catch (error) {
      console.error('Error en createLoan:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('return')
  async returnLoan(
    @Body() returnData: { loanId: string },
    @Headers('authorization') token: string
  ) {
    try {
      const client = await new Promise<any>((resolve, reject) => {
        soap.createClient(this.soapUrl, (err, client) => {
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

      client.addSoapHeader(
        { 'tns:Authorization': token },
        '',
        'http://www.biblioteca.com/loans-service/',
        ''
      );

      return new Promise((resolve, reject) => {
        client.ReturnLoan(returnData, (err, result) => {
          if (err) {
            console.error('Error en ReturnLoan:', err);
            reject(new HttpException(
              'Error al devolver el préstamo',
              HttpStatus.BAD_REQUEST
            ));
          } else {
            resolve(result);
          }
        });
      });

    } catch (error) {
      console.error('Error en returnLoan:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}