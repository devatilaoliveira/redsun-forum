import {ROUTE_PATHS} from "./route-path.constants";
import {RsSideNavItem} from "../models/side-nav-item";

export const DEFAULT_SIDE_NAV_ITEMS: RsSideNavItem[] = [
  {
    iconAddress: "/assets/svgs/add_tale.svg",
    label: "CREATE_TALE",
    routePath: `/${ROUTE_PATHS.tales}/${ROUTE_PATHS.create}`
  },
  {
    iconAddress: "/assets/svgs/my_tales.svg",
    label: "MY_TALES",
    routePath: `/${ROUTE_PATHS.myTales}`
  },
  {
    iconAddress: "/assets/svgs/find_tale.svg",
    label: "FIND_TALE",
    routePath: `/${ROUTE_PATHS.findTale}`
  },
  {
    iconAddress: "/assets/svgs/contacts.svg",
    label: "FIND_USERS",
    routePath: `/${ROUTE_PATHS.findUsers}`
  },
  {
    iconAddress: "/assets/svgs/contacts.svg",
    label: "CONTACTS",
    routePath: `/${ROUTE_PATHS.contacts}`,
    exact: true
  },
  {
    iconAddress: "/assets/svgs/mail.svg",
    label: "MESSAGES",
    routePath: `/${ROUTE_PATHS.letters}`
  },
  {
    iconAddress: "/assets/svgs/profile.svg",
    label: "PROFILE",
    routePath: `/${ROUTE_PATHS.profileDetails}`
  },
  {
    iconAddress: "/assets/svgs/settings.svg",
    label: "SETTINGS",
    routePath: `/${ROUTE_PATHS.settings}`
  }
];
