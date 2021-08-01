import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { environment } from 'src/environments/environment';
import { IReport, getReportIdentifier } from '../domain/entities/report';
import { isPresent } from '../utility/operator';
import { createRequestOption } from '../utility/request-util';
import * as dayjs from "dayjs";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  
  protected reportEndpoint = environment.endpoint + "/reports";

  constructor(protected http: HttpClient) {}

  create(report: IReport): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(report);
    return this.http
      .post<IReport>(this.reportEndpoint, copy, { observe: "response" })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(report: IReport): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(report);
    return this.http
      .put<IReport>(
        `${this.reportEndpoint}/${getReportIdentifier(report) as number}`,
        copy,
        { observe: "response" }
      )
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IReport>(`${this.reportEndpoint}/${id}`, { observe: "response" })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IReport[]>(this.reportEndpoint, {
        params: options,
        observe: "response",
      })
      .pipe(
        map((res: EntityArrayResponseType) =>
          this.convertDateArrayFromServer(res)
        )
      );
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.reportEndpoint}/${id}`, {
      observe: "response",
    });
  }

  addReportToCollectionIfMissing(
    reportCollection: IReport[],
    ...reportsToCheck: (IReport | null | undefined)[]
  ): IReport[] {
    const reports: IReport[] = reportsToCheck.filter(isPresent);
    if (reports.length > 0) {
      const reportCollectionIdentifiers = reportCollection.map(
        (reportItem) => getReportIdentifier(reportItem)!
      );
      const reportsToAdd = reports.filter((reportItem) => {
        const reportIdentifier = getReportIdentifier(reportItem);
        if (
          reportIdentifier == null ||
          reportCollectionIdentifiers.includes(reportIdentifier)
        ) {
          return false;
        }
        reportCollectionIdentifiers.push(reportIdentifier);
        return true;
      });
      return [...reportsToAdd, ...reportCollection];
    }
    return reportCollection;
  }

  protected convertDateFromClient(report: IReport): IReport {
    return Object.assign({}, report, {
      date: report.date?.isValid() ? report.date.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.date = res.body.date ? dayjs(res.body.date) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(
    res: EntityArrayResponseType
  ): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((report: IReport) => {
        report.date = report.date ? dayjs(report.date) : undefined;
      });
    }
    return res;
  }
}

export type EntityResponseType = HttpResponse<IReport>;
export type EntityArrayResponseType = HttpResponse<IReport[]>;