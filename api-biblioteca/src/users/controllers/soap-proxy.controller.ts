// src/users/controllers/soap-proxy.controller.ts
import { Controller, Post, Body, Headers } from '@nestjs/common';
import * as soap from 'soap';

@Controller('proxy/soap/users')
export class SoapProxyController {
  private soapUrl = 'http://localhost:3001/soap/users?wsdl';

  @Post('register')
  async registerUser(@Body() userData: any, @Headers('authorization') token: string) {
    return new Promise((resolve, reject) => {
      soap.createClient(this.soapUrl, (err, client) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          client.addSoapHeader(
            { 'tns:Authorization': token },
            '',
            'http://www.biblioteca.com/users-service/',
            ''
          );

          client.RegisterUser(userData, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  @Post('suspend')
  async suspendUser(
    @Body() suspendData: { userId: string; reason: string },
    @Headers('authorization') token: string
  ) {
    return new Promise((resolve, reject) => {
      soap.createClient(this.soapUrl, (err, client) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          client.addSoapHeader(
            { 'tns:Authorization': token },
            '',
            'http://www.biblioteca.com/users-service/',
            ''
          );

          client.SuspendUser(suspendData, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}