import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from "@angular/core";
import {provideRouter, TitleStrategy} from "@angular/router";
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {routes} from "./app.routes";
import {GlobalErrorHandler} from "../infra/miscellaneous/global-error.handler";

import {InterpolatableTranslation, provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import {TitleI18nHandler} from "../infra/miscellaneous/title-I18n.handler";
import {authInterceptor} from "../infra/interceptor/auth.interceptor";
import {apiErrorInterceptor} from "../infra/interceptor/api-error.interceptor";
import {ELanguage} from "../interface/enums/ELanguage";
import {UTIL_CONSTANTS} from "../interface/constants/util.constants";
import {firstValueFrom} from "rxjs";
import {AppSettingsService, IAppSettingsService} from "../services/app-settings.service";
import {LocalStoreService} from "../services/local-store.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, apiErrorInterceptor])
    ),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    provideTranslateService({
      lang: AppSettingsService.toTranslateLang(ELanguage.PT),
      fallbackLang: AppSettingsService.toTranslateLang(ELanguage.PT),
      loader: provideTranslateHttpLoader({
        prefix: UTIL_CONSTANTS.I18N_PREFIX,
        suffix: UTIL_CONSTANTS.JSON_EXTENSION,
        useHttpBackend: true
      })
    }),
    provideAppInitializer((): Promise<InterpolatableTranslation> => {
      const appSettingsService: IAppSettingsService = inject(AppSettingsService);
      const localStoreService: LocalStoreService = inject(LocalStoreService);
      return firstValueFrom(appSettingsService.initDefaults(localStoreService.user()?.userSettings));
    }),
    {
      provide: TitleStrategy,
      useClass: TitleI18nHandler
    }
  ]
};
