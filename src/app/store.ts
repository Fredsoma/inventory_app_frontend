// types.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RootState as ReduxRootState } from "@reduxjs/toolkit/query"; 

export interface GlobalState {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
}


export interface GlobalRootState {
  global: GlobalState;
}
