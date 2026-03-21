import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { diskStorage } from "multer";
import { extname } from "path";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

@ApiTags("upload")
@Controller("upload")
export class UploadController {
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("image")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "uploads",
        filename: (_req, file, callback) => {
          const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extname(file.originalname)}`;
          callback(null, name);
        }
      }),
      limits: {
        fileSize: 5 * 1024 * 1024
      },
      fileFilter: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.has(extension)) {
          callback(new BadRequestException("Only JPG, PNG, and WEBP images are allowed."), false);
          return;
        }
        callback(null, true);
      }
    })
  )
  uploadImage(@Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Image file is required.");
    }

    const origin = `${req.protocol}://${req.get("host")}`;
    return {
      url: `${origin}/uploads/${file.filename}`
    };
  }
}
