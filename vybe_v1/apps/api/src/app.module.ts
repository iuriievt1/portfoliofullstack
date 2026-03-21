import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { PlacesModule } from "./places/places.module";
import { PostsModule } from "./posts/posts.module";
import { UploadModule } from "./upload/upload.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ModerationModule } from "./moderation/moderation.module";
import { TrendingModule } from "./trending/trending.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot: "/uploads"
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PlacesModule,
    PostsModule,
    UploadModule,
    NotificationsModule,
    ModerationModule,
    TrendingModule,
    AdminModule
  ]
})
export class AppModule {}

