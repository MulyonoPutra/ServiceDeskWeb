import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getCategoryIdentifier, ICategory } from '../domain/entities/category';
import { isPresent } from '../utility/operator';
import { createRequestOption } from '../utility/request-util';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  constructor(protected http: HttpClient) {}

  categoryEndpoint = environment.endpoint + "/categories";

  create(category: ICategory): Observable<EntityResponseType> {
    return this.http.post<ICategory>(this.categoryEndpoint, category, {
      observe: "response",
    });
  }

  update(category: ICategory): Observable<EntityResponseType> {
    return this.http.put<ICategory>(
      `${this.categoryEndpoint}/${getCategoryIdentifier(category) as number}`,
      category,
      { observe: "response" }
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ICategory>(`${this.categoryEndpoint}/${id}`, {
      observe: "response",
    });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ICategory[]>(this.categoryEndpoint, {
      params: options,
      observe: "response",
    });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.categoryEndpoint}/${id}`, {
      observe: "response",
    });
  }

  addCategoryToCollectionIfMissing(
    categoryCollection: ICategory[],
    ...categoriesToCheck: (ICategory | null | undefined)[]
  ): ICategory[] {
    const categories: ICategory[] = categoriesToCheck.filter(isPresent);
    if (categories.length > 0) {
      const categoryCollectionIdentifiers = categoryCollection.map(
        (categoryItem) => getCategoryIdentifier(categoryItem)!
      );
      const categoriesToAdd = categories.filter((categoryItem) => {
        const categoryIdentifier = getCategoryIdentifier(categoryItem);
        if (
          categoryIdentifier == null ||
          categoryCollectionIdentifiers.includes(categoryIdentifier)
        ) {
          return false;
        }
        categoryCollectionIdentifiers.push(categoryIdentifier);
        return true;
      });
      return [...categoriesToAdd, ...categoryCollection];
    }
    return categoryCollection;
  }
}

export type EntityResponseType = HttpResponse<ICategory>;
export type EntityArrayResponseType = HttpResponse<ICategory[]>;