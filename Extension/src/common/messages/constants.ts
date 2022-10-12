import { Windows } from 'webextension-polyfill';
import { ForwardFrom } from '../forward';
import { SettingOption, Settings } from '../../background/schema';
import { NotifierType } from '../constants';

/**
 * Message types used for message passing between background page and
 * other pages (popup, filtering log, content scripts)
 */

export const APP_MESSAGE_HANDLER_NAME = 'app';

export type MessageCommonProps = {
  handlerName: typeof APP_MESSAGE_HANDLER_NAME;
};

export enum MessageType {
  CreateEventListener = 'createEventListener',
  RemoveListener = 'removeListener',
  OpenExtensionStore = 'openExtensionStore',
  AddAndEnableFilter = 'addAndEnableFilter',
  ApplySettingsJson = 'applySettingsJson',
  OpenFilteringLog = 'openFilteringLog',
  OpenFullscreenUserRules = 'openFullscreenUserRules',
  ResetBlockedAdsCount = 'resetBlockedAdsCount',
  ResetSettings = 'resetSettings',
  GetUserRules = 'getUserRules',
  SaveUserRules = 'saveUserRules',
  GetAllowlistDomains = 'getAllowlistDomains',
  SaveAllowlistDomains = 'saveAllowlistDomains',
  CheckAntibannerFiltersUpdate = 'checkAntiBannerFiltersUpdate',
  DisableFiltersGroup = 'disableFiltersGroup',
  DisableAntibannerFilter = 'disableAntiBannerFilter',
  LoadCustomFilterInfo = 'loadCustomFilterInfo',
  SubscribeToCustomFilter = 'subscribeToCustomFilter',
  RemoveAntibannerFilter = 'removeAntiBannerFilter',
  GetTabInfoForPopup = 'getTabInfoForPopup',
  ChangeApplicationFilteringDisabled = 'changeApplicationFilteringDisabled',
  OpenSettingsTab = 'openSettingsTab',
  OpenAssistant = 'openAssistant',
  OpenAbuseTab = 'openAbuseTab',
  OpenSiteReportTab = 'openSiteReportTab',
  OpenComparePage = 'openComparePage',
  ResetCustomRulesForPage = 'resetCustomRulesForPage',
  RemoveAllowlistDomain = 'removeAllowlistDomainPopup',
  AddAllowlistDomainPopup = 'addAllowlistDomainPopup',
  GetStatisticsData = 'getStatisticsData',
  OnOpenFilteringLogPage = 'onOpenFilteringLogPage',
  GetFilteringLogData = 'getFilteringLogData',
  InitializeFrameScript = 'initializeFrameScript',
  OnCloseFilteringLogPage = 'onCloseFilteringLogPage',
  GetFilteringInfoByTabId = 'getFilteringInfoByTabId',
  SynchronizeOpenTabs = 'synchronizeOpenTabs',
  ClearEventsByTabId = 'clearEventsByTabId',
  RefreshPage = 'refreshPage',
  OpenTab = 'openTab',
  AddUserRule = 'addUserRule',
  UnAllowlistFrame = 'unAllowlistFrame',
  RemoveUserRule = 'removeUserRule',
  GetTabFrameInfoById = 'getTabFrameInfoById',
  EnableFiltersGroup = 'enableFiltersGroup',
  NotifyListeners = 'notifyListeners',
  AddLongLivedConnection = 'addLongLivedConnection',
  GetOptionsData = 'getOptionsData',
  ChangeUserSettings = 'changeUserSetting',
  CheckRequestFilterReady = 'checkRequestFilterReady',
  OpenThankyouPage = 'openThankYouPage',
  OpenSafebrowsingTrusted = 'openSafebrowsingTrusted',
  GetSelectorsAndScripts = 'getSelectorsAndScripts',
  CheckPageScriptWrapperRequest = 'checkPageScriptWrapperRequest',
  ProcessShouldCollapse = 'processShouldCollapse',
  ProcessShouldCollapseMany = 'processShouldCollapseMany',
  AddFilteringSubscription = 'addFilterSubscription',
  SetNotificationViewed = 'setNotificationViewed',
  SaveCssHitsStats = 'saveCssHitStats',
  GetCookieRules = 'getCookieRules',
  SaveCookieLogEvent = 'saveCookieRuleEvent',
  LoadSettingsJson = 'loadSettingsJson',
  AddUrlToTrusted = 'addUrlToTrusted',
  SetPreserveLogState = 'setPreserveLogState',
  GetUserRulesEditorData = 'getUserRulesEditorData',
  GetEditorStorageContent = 'getEditorStorageContent',
  SetEditorStorageContent = 'setEditorStorageContent',
  ConvertRulesText = 'convertRulesText',
  SetFilteringLogWindowState = 'setFilteringLogWindowState',
  AppInitialized = 'appInitialized',
  UpdateTotalBlocked = 'updateTotalBlocked',
}

export type CreateEventListenerMessage = {
  type: MessageType.CreateEventListener,
  data: {
    events: NotifierType[]
  }
};

export type RemoveListenerMessage = {
  type: MessageType.RemoveListener,
};

export type GetTabInfoForPopupMessage = {
  type: MessageType.GetTabInfoForPopup;
  data: {
    tabId: number;
  };
};

export type ChangeApplicationFilteringDisabledMessage = {
  type: MessageType.ChangeApplicationFilteringDisabled;
  data: {
    state: boolean;
  };
};

export type OpenSettingsTabMessage = {
  type: MessageType.OpenSettingsTab;
};

export type OpenAssistantMessage = {
  type: MessageType.OpenAssistant;
};

export type OpenFilteringLogMessage = {
  type: MessageType.OpenFilteringLog;
};

export type OpenAbuseTabMessage = {
  type: MessageType.OpenAbuseTab;
  data: {
    url: string;
    from: ForwardFrom;
  };
};

export type OpenSiteReportTabMessage = {
  type: MessageType.OpenSiteReportTab;
  data: {
    url: string;
    from: ForwardFrom;
  };
};

export type GetOptionsDataMessage = {
  type: MessageType.GetOptionsData;
};

export type ChangeUserSettingMessage<T extends SettingOption = SettingOption> = {
  type: MessageType.ChangeUserSettings;
  data: {
    key: T,
    value: Settings[T]
  }
};

export type ResetSettingsMessage = {
  type: MessageType.ResetSettings
};

export type AddAndEnableFilterMessage = {
  type: MessageType.AddAndEnableFilter
  data: {
    filterId: number
  }
};

export type DisableAntiBannerFilterMessage = {
  type: MessageType.DisableAntibannerFilter
  data: {
    filterId: number,
    remove: boolean
  }
};

export type RemoveAntiBannerFilterMessage = {
  type: MessageType.RemoveAntibannerFilter
  data: {
    filterId: number
  }
};

export type SaveAllowlistDomainsMessage = {
  type: MessageType.SaveAllowlistDomains
  data: {
    value: string,
  }
};

export type SaveUserRulesMessage = {
  type: MessageType.SaveUserRules
  data: {
    value: string,
  }
};

export type GetUserRulesMessage = {
  type: MessageType.GetUserRules
};

export type GetUserRulesEditorDataMessage = {
  type: MessageType.GetUserRulesEditorData
};

export type AddUserRuleMessage = {
  type: MessageType.AddUserRule
  data: {
    ruleText: string,
  }
};

export type RemoveUserRuleMessage = {
  type: MessageType.RemoveUserRule
  data: {
    ruleText: string,
  }
};

export type ResetCustomRulesForPageMessage = {
  type: MessageType.ResetCustomRulesForPage
  data: {
    url: string,
    tabId: number,
  }
};

export type GetEditorStorageContentMessage = {
  type: MessageType.GetEditorStorageContent
};

export type SetEditorStorageContentMessage = {
  type: MessageType.SetEditorStorageContent
  data: {
    content: string,
  }
};

export type AddAllowlistDomainPopupMessage = {
  type: MessageType.AddAllowlistDomainPopup
  data: {
    tabId: number,
  }
};

export type RemoveAllowlistDomainMessage = {
  type: MessageType.RemoveAllowlistDomain
  data: {
    tabId: number,
  }
};

export type LoadCustomFilterInfoMessage = {
  type: MessageType.LoadCustomFilterInfo
  data: {
    url: string,
    title: string,
  }
};

export type SubscribeToCustomFilterMessage = {
  type: MessageType.SubscribeToCustomFilter
  data: {
    filter: {
      customUrl: string,
      name: string,
      trusted: boolean,
    }
  }
};

export type AppInitializedMessage = {
  type: MessageType.AppInitialized
};

export type UpdateTotalBlockedMessage = {
  type: MessageType.UpdateTotalBlocked
  data: {
    totalBlocked: number,
    totalBlockedTab: number,
  }
};

export type CheckRequestFilterReadyMessage = {
  type: MessageType.CheckRequestFilterReady
};

export type GetFilteringLogDataMessage = {
  type: MessageType.GetFilteringLogData,
};

export type SynchronizeOpenTabsMessage = {
  type: MessageType.SynchronizeOpenTabs,
};

export type OpenFilteringLogPageMessage = {
  type: MessageType.OnOpenFilteringLogPage
};

export type CloseFilteringLogPageMessage = {
  type: MessageType.OnCloseFilteringLogPage
};

export type ClearEventsByTabIdMessage = {
  type: MessageType.ClearEventsByTabId
  data: {
    tabId: number,
    ignorePreserveLog: boolean,
  }
};

export type SetPreserveLogStateMessage = {
  type: MessageType.SetPreserveLogState
  data: {
    state: boolean,
  }
};

export type SetFilteringLogWindowStateMessage = {
  type: MessageType.SetFilteringLogWindowState,
  data: {
    windowState: Windows.CreateCreateDataType
  }
};

export type PageRefreshMessage = {
  type: MessageType.RefreshPage,
  data: {
    tabId: number,
  }
};

export type GetFilteringInfoByTabIdMessage = {
  type: MessageType.GetFilteringInfoByTabId,
  data: {
    tabId: number,
  }
};

export type Message = (
  | GetTabInfoForPopupMessage
  | ChangeApplicationFilteringDisabledMessage
  | OpenSettingsTabMessage
  | OpenAssistantMessage
  | OpenFilteringLogMessage
  | OpenAbuseTabMessage
  | OpenSiteReportTabMessage
  | GetOptionsDataMessage
  | ChangeUserSettingMessage
  | ResetSettingsMessage
  | AddAndEnableFilterMessage
  | DisableAntiBannerFilterMessage
  | RemoveAntiBannerFilterMessage
  | SaveAllowlistDomainsMessage
  | SaveUserRulesMessage
  | GetUserRulesMessage
  | GetUserRulesEditorDataMessage
  | AddUserRuleMessage
  | RemoveUserRuleMessage
  | ResetCustomRulesForPageMessage
  | GetEditorStorageContentMessage
  | SetEditorStorageContentMessage
  | AddAllowlistDomainPopupMessage
  | RemoveAllowlistDomainMessage
  | LoadCustomFilterInfoMessage
  | SubscribeToCustomFilterMessage
  | AppInitializedMessage
  | UpdateTotalBlockedMessage
  | GetFilteringLogDataMessage
  | CheckRequestFilterReadyMessage
  | OpenFilteringLogPageMessage
  | CloseFilteringLogPageMessage
  | ClearEventsByTabIdMessage
  | SetPreserveLogStateMessage
  | PageRefreshMessage
  | GetFilteringInfoByTabIdMessage
  | SetFilteringLogWindowStateMessage
) &
  MessageCommonProps;

export type ExtractedMessage<P> = Extract<Message, { type: P }>;
