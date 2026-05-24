import {HttpErrorResponse} from "@angular/common/http";
import {Component, computed, inject, Signal, signal, WritableSignal} from "@angular/core";
import {Router} from "@angular/router";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {ChangePasswordRequestDTO} from "../../../interface/dtos/user/ChangePasswordRequestDTO";
import {EVariant} from "../../../interface/enums/EVariant";
import {IUserProfileService, UserProfileService} from "../../../services/user-profile.service";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";

@Component({
  selector: "rs-change-email",
  standalone: true,
  imports: [TranslatePipe, RsButton, RsInput],
  templateUrl: "./change-email.view.html",
  styleUrl: "./change-email.view.scss"
})
export class ChangeEmailView {
  private readonly _userProfileService: IUserProfileService = inject(UserProfileService);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _router: Router = inject(Router);

  protected readonly oldPassword: WritableSignal<string> = signal<string>("");
  protected readonly newPassword: WritableSignal<string> = signal<string>("");
  protected readonly confirmNewPassword: WritableSignal<string> = signal<string>("");
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly passwordPattern: RegExp = /^.{8,100}$/;
  protected readonly canSubmit: Signal<boolean> = computed<boolean>(() =>
    this.passwordPattern.test(this.oldPassword())
      && this.passwordPattern.test(this.newPassword())
      && this.passwordPattern.test(this.confirmNewPassword())
      && this.newPassword() === this.confirmNewPassword()
      && !this.inProgress()
  );
  protected readonly EVariant = EVariant;

  protected onOldPasswordChange(value: string): void {
    this.oldPassword.set(value);
    this.errorMessage.set(null);
  }

  protected onNewPasswordChange(value: string): void {
    this.newPassword.set(value);
    this.errorMessage.set(null);
  }

  protected onConfirmNewPasswordChange(value: string): void {
    this.confirmNewPassword.set(value);
    this.errorMessage.set(null);
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.errorMessage.set(this._translateService.instant("CHANGE_PASSWORD_VALIDATION_ERROR"));
      return;
    }

    const payload: ChangePasswordRequestDTO = {
      oldPassword: this.oldPassword(),
      newPassword: this.newPassword()
    };

    this.errorMessage.set(null);
    this.inProgress.set(true);
    this._userProfileService.changePassword(payload).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: () => {
        void this._router.navigate(["/", ROUTE_PATHS.profileDetails], {replaceUrl: true});
      },
      error: (error: unknown) => {
        this.errorMessage.set(this._resolveError(error));
      }
    });
  }

  protected onBack(): void {
    void this._router.navigate(["/", ROUTE_PATHS.profileDetails]);
  }

  private _resolveError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return this._translateService.instant("CHANGE_PASSWORD_FAILED");
    }

    const errorMessage: string = typeof error.error === "string"
      ? error.error
      : (error.error?.message ?? "");
    const normalizedMessage: string = errorMessage.toLowerCase();

    if (error.status === 400 && normalizedMessage.includes("current password is invalid")) {
      return this._translateService.instant("CHANGE_PASSWORD_OLD_INVALID");
    }

    if (error.status === 400 && normalizedMessage.includes("only available for email accounts")) {
      return this._translateService.instant("CHANGE_PASSWORD_NOT_AVAILABLE");
    }

    if (error.status === 400 && normalizedMessage.includes("must be different")) {
      return this._translateService.instant("CHANGE_PASSWORD_SAME_AS_OLD");
    }

    if (error.status === 400) {
      return this._translateService.instant("CHANGE_PASSWORD_VALIDATION_ERROR");
    }

    return this._translateService.instant("CHANGE_PASSWORD_FAILED");
  }

  protected getConfirmPasswordPattern(): RegExp {
    const password: string = this.newPassword();
    if (!this.passwordPattern.test(password)) {
      return this.passwordPattern;
    }

    return this._buildExactMatchPattern(password);
  }

  private _buildExactMatchPattern(value: string): RegExp {
    const escaped: string = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${escaped}$`);
  }
}
