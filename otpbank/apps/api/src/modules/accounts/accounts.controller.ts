import { Controller, Get, Param, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiResponseInterceptor } from "../common/api-response.interceptor";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AccountsService } from "./accounts.service";

@Controller("/api/v1")
@UseInterceptors(ApiResponseInterceptor)
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get("/accounts")
  async listAccounts(@CurrentUser() user: { sub: string }) {
    return this.accounts.listForUser(user.sub);
  }

  @Get("/accounts/:id")
  async getAccount(@CurrentUser() user: { sub: string }, @Param("id") id: string) {
    return this.accounts.getForUser(user.sub, id);
  }

  @Get("/beneficiaries")
  async beneficiaries(@CurrentUser() user: { sub: string }) {
    return this.accounts.listBeneficiaries(user.sub);
  }

  @Get("/cards")
  async cards(@CurrentUser() user: { sub: string }) {
    return this.accounts.cardsForUser(user.sub);
  }

  @Get("/documents")
  async documents(@CurrentUser() user: { sub: string }) {
    return this.accounts.documentsForUser(user.sub);
  }

  @Get("/transactions")
  async transactions(@CurrentUser() user: { sub: string }) {
    return this.accounts.transactionsForUser(user.sub);
  }
}
