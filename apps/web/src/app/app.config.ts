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

import {InterpolatableTranslation, provideTranslateService, TranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import {TitleI18nHandler} from "../infra/miscellaneous/title-I18n.handler";
import {authInterceptor} from "../infra/interceptor/auth.interceptor";
import {ELanguage} from "../interface/enums/ELanguage";
import {UTIL_CONSTANTS} from "../interface/constants/util.constants";
import {firstValueFrom} from "rxjs";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    provideTranslateService({
      lang: ELanguage.EN,
      fallbackLang: ELanguage.EN,
      loader: provideTranslateHttpLoader({
        prefix: UTIL_CONSTANTS.I18N_PREFIX,
        suffix: UTIL_CONSTANTS.JSON_EXTENSION,
        useHttpBackend: true
      })
    }),
    provideAppInitializer((): Promise<InterpolatableTranslation> => {
      const translate: TranslateService = inject(TranslateService);
      const browserLang: string = translate.getBrowserLang() || ELanguage.EN;
      return firstValueFrom(translate.use(browserLang));
    }),
    {
      provide: TitleStrategy,
      useClass: TitleI18nHandler
    }
  ]
};
