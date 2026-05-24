import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {RegistrationRequestDTO} from "../interface/dtos/auth/RegistrationRequestDTO";
import {ResendVerificationRequestDTO} from "../interface/dtos/auth/ResendVerificationRequestDTO";
import {LoginRequestDTO} from "../interface/dtos/auth/LoginRequestDTO";
import {AuthenticationResponseDTO} from "../interface/dtos/auth/AuthenticationResponseDTO";
import {VerifyEmailCodeRequestDTO} from "../interface/dtos/auth/VerifyEmailCodeRequestDTO";
import {RequestPasswordResetCodeRequestDTO} from "../interface/dtos/auth/RequestPasswordResetCodeRequestDTO";
import {ResetPasswordWithCodeRequestDTO} from "../interface/dtos/auth/ResetPasswordWithCodeRequestDTO";

export interface IEmailAuthService {
  register(request: RegistrationRequestDTO): Observable<string>;

  verifyEmailCode(request: VerifyEmailCodeRequestDTO): Observable<string>;

  resendVerification(request: ResendVerificationRequestDTO): Observable<string>;

  login(request: LoginRequestDTO): Observable<AuthenticationResponseDTO>;

  requestPasswordResetCode(request: RequestPasswordResetCodeRequestDTO): Observable<string>;

  resetPasswordWithCode(request: ResetPasswordWithCodeRequestDTO): Observable<string>;
}

@Injectable({providedIn: "root"})
export class EmailAuthService implements IEmailAuthService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _baseUrl: string = `${environment.apiBaseUrl}/authentication`;

  public register(request: RegistrationRequestDTO): Observable<string> {
    return this._httpClient.post(`${this._baseUrl}/register`, request, {
      responseType: "text"
    });
  }

  public verifyEmailCode(request: VerifyEmailCodeRequestDTO): Observable<string> {
    return this._httpClient.post(`${this._baseUrl}/verify-email-code`, request, {
      responseType: "text"
    });
  }

  public resendVerification(request: ResendVerificationRequestDTO): Observable<string> {
    return this._httpClient.post(`${this._baseUrl}/resend-verification`, request, {
      responseType: "text"
    });
  }

  public login(request: LoginRequestDTO): Observable<AuthenticationResponseDTO> {
    return this._httpClient.post<AuthenticationResponseDTO>(`${this._baseUrl}/login`, request);
  }

  public requestPasswordResetCode(request: RequestPasswordResetCodeRequestDTO): Observable<string> {
    return this._httpClient.post(`${this._baseUrl}/forgot-password/request-code`, request, {
      responseType: "text"
    });
  }

  public resetPasswordWithCode(request: ResetPasswordWithCodeRequestDTO): Observable<string> {
    return this._httpClient.post(`${this._baseUrl}/forgot-password/reset`, request, {
      responseType: "text"
    });
  }
}
