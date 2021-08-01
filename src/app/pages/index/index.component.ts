import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { Validators, FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import noUiSlider from "nouislider";
import { ICategory } from "src/app/core/domain/entities/category";
import { IInstitution } from "src/app/core/domain/entities/institution";
import { CategoryService } from "src/app/core/services/category.service";
import { DataUtils, FileLoadError } from "src/app/core/services/data-util.service";
import { EventManager, EventWithContent } from "src/app/core/services/event-manager.service";
import { InstitutionService } from "src/app/core/services/institution.service";
import { ReportService } from "src/app/core/services/report.service";
import * as dayjs from "dayjs";
import { AlertError } from "src/app/core/domain/response/alert-error";
import { DATE_TIME_FORMAT } from "src/app/core/constants/format-date.constants";
import { IReport, Report } from "src/app/core/domain/entities/report";
import { finalize, map } from "rxjs/operators";
import { HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";

@Component({
  selector: "app-index",
  templateUrl: "index.component.html",
})
export class IndexComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  date = new Date();

  isSaving = false;

  categoriesSharedCollection: ICategory[] = [];
  institutionsSharedCollection: IInstitution[] = [];

  editForm = this.fb.group({
    id: [],
    title: [null, [Validators.required]],
    content: [null, [Validators.required]],
    date: [null, [Validators.required]],
    images: [null, [Validators.required]],
    imagesContentType: [],
    location: [null, [Validators.required]],
    type: [],
    category: [],
    institution: [],
  });

  constructor(
    protected dataUtils: DataUtils,
    protected eventManager: EventManager,
    protected reportService: ReportService,
    protected categoryService: CategoryService,
    protected institutionService: InstitutionService,
    protected elementRef: ElementRef,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit() {
    this.uiSlider();
    this.activatedRoute.data.subscribe(({ report }) => {
      if (report.id === undefined) {
        const today = dayjs().startOf("day");
        report.date = today;
      }

      this.updateForm(report);

      this.loadRelationshipsOptions();
    });
  }

  ngOnDestroy() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.remove("index-page");
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils
      .loadFileToForm(event, this.editForm, field, isImage)
      .subscribe({
        error: (err: FileLoadError) =>
          this.eventManager.broadcast(
            new EventWithContent<AlertError>("serviceDeskJhipsterApp.error", {
              message: err.message,
            })
          ),
      });
  }

  clearInputImage(
    field: string,
    fieldContentType: string,
    idInput: string
  ): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    if (idInput && this.elementRef.nativeElement.querySelector("#" + idInput)) {
      this.elementRef.nativeElement.querySelector("#" + idInput).value = null;
    }
  }

  trackCategoryById(index: number, item: ICategory): number {
    return item.id!;
  }

  trackInstitutionById(index: number, item: IInstitution): number {
    return item.id!;
  }

  save(): void {
    this.isSaving = true;
    const report = this.createFromForm();
    if (report.id !== undefined) {
      this.subscribeToSaveResponse(this.reportService.update(report));
    } else {
      this.subscribeToSaveResponse(this.reportService.create(report));
    }
  }

  protected subscribeToSaveResponse(
    result: Observable<HttpResponse<IReport>>
  ): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  previousState(): void {
    window.history.back();
  }

  protected updateForm(report: IReport): void {
    this.editForm.patchValue({
      id: report.id,
      title: report.title,
      content: report.content,
      date: report.date ? report.date.format(DATE_TIME_FORMAT) : null,
      images: report.images,
      imagesContentType: report.imagesContentType,
      location: report.location,
      type: report.type,
      category: report.category,
      institution: report.institution,
    });

    this.categoriesSharedCollection =
      this.categoryService.addCategoryToCollectionIfMissing(
        this.categoriesSharedCollection,
        report.category
      );
    this.institutionsSharedCollection =
      this.institutionService.addInstitutionToCollectionIfMissing(
        this.institutionsSharedCollection,
        report.institution
      );
  }

  protected loadRelationshipsOptions(): void {
    this.categoryService
      .query()
      .pipe(map((res: HttpResponse<ICategory[]>) => res.body ?? []))
      .pipe(
        map((categories: ICategory[]) =>
          this.categoryService.addCategoryToCollectionIfMissing(
            categories,
            this.editForm.get("category")!.value
          )
        )
      )
      .subscribe(
        (categories: ICategory[]) =>
          (this.categoriesSharedCollection = categories)
      );

    this.institutionService
      .query()
      .pipe(map((res: HttpResponse<IInstitution[]>) => res.body ?? []))
      .pipe(
        map((institutions: IInstitution[]) =>
          this.institutionService.addInstitutionToCollectionIfMissing(
            institutions,
            this.editForm.get("institution")!.value
          )
        )
      )
      .subscribe(
        (institutions: IInstitution[]) =>
          (this.institutionsSharedCollection = institutions)
      );
  }

  protected createFromForm(): IReport {
    return {
      ...new Report(),
      id: this.editForm.get(["id"])!.value,
      title: this.editForm.get(["title"])!.value,
      content: this.editForm.get(["content"])!.value,
      date: this.editForm.get(["date"])!.value
        ? dayjs(this.editForm.get(["date"])!.value, DATE_TIME_FORMAT)
        : undefined,
      imagesContentType: this.editForm.get(["imagesContentType"])!.value,
      images: this.editForm.get(["images"])!.value,
      location: this.editForm.get(["location"])!.value,
      type: this.editForm.get(["type"])!.value,
      category: this.editForm.get(["category"])!.value,
      institution: this.editForm.get(["institution"])!.value,
    };
  }

  scrollToDownload(element: any) {
    element.scrollIntoView({ behavior: "smooth" });
  }

  uiSlider() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.add("index-page");

    var slider = document.getElementById("sliderRegular");

    noUiSlider.create(slider, {
      start: 40,
      connect: false,
      range: {
        min: 0,
        max: 100,
      },
    });

    var slider2 = document.getElementById("sliderDouble");

    noUiSlider.create(slider2, {
      start: [20, 60],
      connect: true,
      range: {
        min: 0,
        max: 100,
      },
    });
  }
}
