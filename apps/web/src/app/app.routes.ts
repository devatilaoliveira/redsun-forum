import {inject, provideEnvironmentInitializer} from "@angular/core";
import {Routes} from "@angular/router";
import {GuestGuard} from "../infra/guard/guest.guard";
import {AuthGuard} from "../infra/guard/auth.guard";
import {TaleOwnerGuard} from "../infra/guard/tale-owner.guard";
import {TaleParticipantGuard} from "../infra/guard/tale-participant.guard";
import {HomeView} from "./features/home/home.view";
import {ROUTE_PATHS} from "../interface/constants/route-path.constants";
import {UTIL_CONSTANTS} from "../interface/constants/util.constants";
import {TalesContextService} from "../stateServices/tales-context.service";

export const routes: Routes = [
  {
    path: ROUTE_PATHS.privacy,
    loadComponent: () => import("./features/legal/privacy-policy/privacy-policy.view").then((module) => module.PrivacyPolicyView),
    title: "LEGAL_PRIVACY_TITLE",
    data: {
      hideTopBar: true
    }
  },
  {
    path: ROUTE_PATHS.terms,
    loadComponent: () => import("./features/legal/terms-of-use/terms-of-use.view").then((module) => module.TermsOfUseView),
    title: "LEGAL_TERMS_TITLE",
    data: {
      hideTopBar: true
    }
  },
  {
    path: ROUTE_PATHS.dataProtection,
    loadComponent: () => import("./features/legal/data-protection-contact/data-protection-contact.view").then((module) => module.DataProtectionContactView),
    title: "LEGAL_DATA_PROTECTION_TITLE",
    data: {
      hideTopBar: true
    }
  },
  {
    path: ROUTE_PATHS.reportContent,
    loadComponent: () => import("./features/legal/report-content/report-content.view").then((module) => module.ReportContentView),
    title: "LEGAL_REPORT_TITLE",
    data: {
      hideTopBar: true
    }
  },
  {
    path: ROUTE_PATHS.cookies,
    loadComponent: () => import("./features/legal/cookies/cookies.view").then((module) => module.CookiesView),
    title: "LEGAL_COOKIES_TITLE",
    data: {
      hideTopBar: true
    }
  },
  {
    path: ROUTE_PATHS.authVerified,
    loadComponent: () => import("./features/auth-verified/auth-verified.view").then((module) => module.AuthVerifiedView),
    title: "VERIFIED",
    data: {
      hideTopBar: true
    }
  },
  {
    path: ROUTE_PATHS.changePassword,
    loadComponent: () => import("./features/change-email/change-email.view").then((module) => module.ChangeEmailView),
    title: "CHANGE_PASSWORD",
    data: {
      hideTopBar: true
    }
  },
  {
    path: UTIL_CONSTANTS.OAUTH_CALLBACK_PATH,
    loadComponent: () => import("./features/auth-callback/auth-callback.view").then((module) => module.AuthCallbackView),
    title: "AUTHENTICATING"
  },
  {
    path: ROUTE_PATHS.home,
    canMatch: [GuestGuard],
    children: [
      {
        path: ROUTE_PATHS.home,
        redirectTo: ROUTE_PATHS.login,
        pathMatch: "full"
      },
      {
        path: ROUTE_PATHS.login,
        loadComponent: () => import("./features/login/login.view").then((module) => module.LoginView),
        title: "LOGIN",
        data: {
          hideTopBar: true
        }
      },
      {
        path: ROUTE_PATHS.forgotPassword,
        loadComponent: () => import("./features/forgot-password/forgot-password.view").then((module) => module.ForgotPasswordView),
        title: "FORGOT_PASSWORD_TITLE",
        data: {
          hideTopBar: true
        }
      },
      {
        path: ROUTE_PATHS.register,
        loadComponent: () => import("./features/register/register.view").then((module) => module.RegisterView),
        title: "REGISTER",
        data: {
          hideTopBar: true
        }
      }
    ]
  },
  {
    path: ROUTE_PATHS.home,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: ROUTE_PATHS.legalAcceptance,
        loadComponent: () => import("./features/legal/legal-acceptance/legal-acceptance.view").then((module) => module.LegalAcceptanceView),
        title: "LEGAL_ACCEPTANCE_TITLE",
        data: {
          hideTopBar: true
        }
      },
      {
        path: ROUTE_PATHS.settings,
        loadComponent: () => import("./features/settings-my/settings-my.view").then((module) => module.SettingsMyView),
        title: "SETTINGS"
      },
      {
        path: ROUTE_PATHS.profileDetails,
        loadComponent: () => import("./features/profile-details/profile-details.view").then((module) => module.ProfileDetailsView),
        title: "PROFILE"
      },
      {
        path: ROUTE_PATHS.support,
        loadComponent: () => import("./features/support/support.view").then((module) => module.SupportView),
        title: "SUPPORT"
      },
      {
        path: ROUTE_PATHS.tales,
        title: "TALE",
        children: [
          {
            path: ROUTE_PATHS.create,
            loadComponent: () => import("./features/tale-creation/tale-creation.view").then((module) => module.TaleCreationView),
            title: "CREATE_TALE"
          },
          {
            path: `:${ROUTE_PATHS.taleId}`,
            providers: [
              TalesContextService,
              provideEnvironmentInitializer(() => {
                inject(TalesContextService);
              })
            ],
            children: [
              {
                path: ROUTE_PATHS.home,
                loadComponent: () => import("./features/tale-details/tale-details.view").then((module) => module.TaleDetailsView),
                title: "TALE"
              },
              {
                path: `${ROUTE_PATHS.manage}/${ROUTE_PATHS.participants}`,
                loadComponent: () => import("./features/manage-participants/manage-participants.view").then((module) => module.ManageParticipantsView),
                canActivate: [TaleOwnerGuard],
                title: "MANAGE_PARTICIPANTS"
              },
              {
                path: ROUTE_PATHS.manage,
                loadComponent: () => import("./features/tale-manager/tale-manager.view").then((module) => module.TaleManagerView),
                canActivate: [TaleOwnerGuard],
                title: "TALE_MANAGER"
              },
              {
                path: ROUTE_PATHS.profile,
                loadComponent: () => import("./features/manage-character/manage-character.view").then((module) => module.ManageCharacterView),
                canActivate: [TaleParticipantGuard],
                title: "MANAGE_PROFILE"
              },
              {
                path: `${ROUTE_PATHS.locations}/${ROUTE_PATHS.creation}`,
                loadComponent: () => import("./features/location-creation/location-creation.view").then((module) => module.LocationCreationView),
                canActivate: [TaleParticipantGuard],
                title: "CREATE_LOCATION"
              },
              {
                path: `${ROUTE_PATHS.locations}/:${ROUTE_PATHS.locationId}`,
                loadComponent: () => import("./features/location-details/location-details.view").then((module) => module.LocationDetailsView),
                title: "LOCATION_NAME"
              },
              {
                path: ROUTE_PATHS.locations,
                loadComponent: () => import("./features/locations-list/locations-list.view").then((module) => module.LocationsListView),
                title: "LOCATIONS"
              }
            ]
          }
        ]
      },
      {
        path: ROUTE_PATHS.myTales,
        loadComponent: () => import("./features/tales-my/tales-my.view").then((module) => module.TalesMyView),
        title: "MY_TALES"
      },
      {
        path: ROUTE_PATHS.findTale,
        loadComponent: () => import("./features/tale-finder/tale-finder.view").then((module) => module.TaleFinderView),
        title: "FIND_TALE"
      },
      {
        path: ROUTE_PATHS.findUsers,
        loadComponent: () => import("./features/user-finder/user-finder.view").then((module) => module.UserFinderView),
        title: "FIND_USERS"
      },
      {
        path: `${ROUTE_PATHS.contacts}/${ROUTE_PATHS.details}/${ROUTE_PATHS.letter}`,
        loadComponent: () => import("./features/letter-creation/letter-creation.view").then((module) => module.LetterCreationView),
        title: "SEND_LETTER"
      },
      {
        path: `${ROUTE_PATHS.contacts}/${ROUTE_PATHS.details}/${ROUTE_PATHS.letter}/:${ROUTE_PATHS.contactId}`,
        loadComponent: () => import("./features/letter-creation/letter-creation.view").then((module) => module.LetterCreationView),
        title: "SEND_LETTER"
      },
      {
        path: `${ROUTE_PATHS.letter}/${ROUTE_PATHS.creation}/:${ROUTE_PATHS.contactId}`,
        loadComponent: () => import("./features/letter-creation/letter-creation.view").then((module) => module.LetterCreationView),
        title: "SEND_LETTER"
      },
      {
        path: `${ROUTE_PATHS.contacts}/${ROUTE_PATHS.details}/:${ROUTE_PATHS.id}`,
        loadComponent: () => import("./features/contact-details/contact-details.view").then((module) => module.ContactDetailsView),
        title: "CONTACTS"
      },
      {
        path: ROUTE_PATHS.letters,
        loadComponent: () => import("./features/letters-list/letters-list.view").then((module) => module.LettersListView),
        title: "LETTERS",
        pathMatch: "full"
      },
      {
        path: `${ROUTE_PATHS.letters}/:${ROUTE_PATHS.letterId}`,
        loadComponent: () => import("./features/letter-read/letter-read.view").then((module) => module.LetterReadView),
        title: "LETTER_READ"
      },
      {
        path: ROUTE_PATHS.contacts,
        loadComponent: () => import("./features/contacts-my/contacts-my.view").then((module) => module.ContactsMyView),
        title: "CONTACTS"
      },
      {
        path: ROUTE_PATHS.home,
        component: HomeView,
        title: "HOME",
        data: {
          hideBackBtn: true
        }
      }
    ]
  },
  {
    path: ROUTE_PATHS.wildcard,
    redirectTo: ROUTE_PATHS.home
  }
];
