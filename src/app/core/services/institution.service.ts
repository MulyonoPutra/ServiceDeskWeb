import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { getInstitutionIdentifier, IInstitution } from '../domain/entities/institution';
import { isPresent } from '../utility/operator';
import { createRequestOption } from '../utility/request-util';

@Injectable({
  providedIn: "root",
})
export class InstitutionService {
  protected institutionEndpoint = environment.endpoint + "/institutions";

  constructor(protected http: HttpClient) {}

  create(institution: IInstitution): Observable<EntityResponseType> {
    return this.http.post<IInstitution>(this.institutionEndpoint, institution, {
      observe: "response",
    });
  }

  update(institution: IInstitution): Observable<EntityResponseType> {
    return this.http.put<IInstitution>(
      `${this.institutionEndpoint}/${
        getInstitutionIdentifier(institution) as number
      }`,
      institution,
      {
        observe: "response",
      }
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IInstitution>(`${this.institutionEndpoint}/${id}`, {
      observe: "response",
    });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IInstitution[]>(this.institutionEndpoint, {
      params: options,
      observe: "response",
    });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.institutionEndpoint}/${id}`, {
      observe: "response",
    });
  }

  addInstitutionToCollectionIfMissing(
    institutionCollection: IInstitution[],
    ...institutionsToCheck: (IInstitution | null | undefined)[]
  ): IInstitution[] {
    const institutions: IInstitution[] = institutionsToCheck.filter(isPresent);
    if (institutions.length > 0) {
      const institutionCollectionIdentifiers = institutionCollection.map(
        (institutionItem) => getInstitutionIdentifier(institutionItem)!
      );
      const institutionsToAdd = institutions.filter((institutionItem) => {
        const institutionIdentifier = getInstitutionIdentifier(institutionItem);
        if (
          institutionIdentifier == null ||
          institutionCollectionIdentifiers.includes(institutionIdentifier)
        ) {
          return false;
        }
        institutionCollectionIdentifiers.push(institutionIdentifier);
        return true;
      });
      return [...institutionsToAdd, ...institutionCollection];
    }
    return institutionCollection;
  }
}


export type EntityResponseType = HttpResponse<IInstitution>;
export type EntityArrayResponseType = HttpResponse<IInstitution[]>;