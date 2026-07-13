import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello from ${os.hostname()}!`;
  }
}
