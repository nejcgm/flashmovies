import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WebhookController } from './webhook.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [PaymentsService],
  controllers: [PaymentsController, WebhookController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
