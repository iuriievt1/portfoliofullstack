import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ListPlacesDto } from "./dto/list-places.dto";
import { PlacesService } from "./places.service";

@ApiTags("places")
@Controller("places")
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  list(@Query() dto: ListPlacesDto) {
    return this.placesService.list(dto);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.placesService.getById(id);
  }
}

