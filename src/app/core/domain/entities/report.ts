import * as dayjs from "dayjs";
import { ICategory } from "./category";
import { ReportType } from "../enums/report-type";
import { IInstitution } from "./institution";

export interface IReport {
  id?: number;
  title?: string;
  content?: string;
  date?: dayjs.Dayjs;
  imagesContentType?: string;
  images?: string;
  location?: string;
  type?: ReportType | null;
  category?: ICategory | null;
  institution?: IInstitution | null;
}

export class Report implements IReport {
  constructor(
    public id?: number,
    public title?: string,
    public content?: string,
    public date?: dayjs.Dayjs,
    public imagesContentType?: string,
    public images?: string,
    public location?: string,
    public type?: ReportType | null,
    public category?: ICategory | null,
    public institution?: IInstitution | null
  ) {}
}

export function getReportIdentifier(report: IReport): number | undefined {
  return report.id;
}
