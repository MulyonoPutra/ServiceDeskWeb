import { JwBootstrapSwitchNg2Module } from "jw-bootstrap-switch-ng2";
import { AlertModule } from "ngx-bootstrap/alert";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ModalModule } from "ngx-bootstrap/modal";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { PopoverModule } from "ngx-bootstrap/popover";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { TabsModule } from "ngx-bootstrap/tabs";
import { TooltipModule } from "ngx-bootstrap/tooltip";

export const ThemeModule = [
  BsDropdownModule.forRoot(),
  ProgressbarModule.forRoot(),
  TooltipModule.forRoot(),
  PopoverModule.forRoot(),
  CollapseModule.forRoot(),
  JwBootstrapSwitchNg2Module,
  TabsModule.forRoot(),
  PaginationModule.forRoot(),
  AlertModule.forRoot(),
  BsDatepickerModule.forRoot(),
  CarouselModule.forRoot(),
  ModalModule.forRoot(),
];
