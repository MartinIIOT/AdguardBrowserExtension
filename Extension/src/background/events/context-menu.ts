export const enum ContextMenuAction {
    SiteProtectionDisabled = 'context_site_protection_disabled',
    SiteFilteringDisabled = 'context_site_filtering_disabled',
    SiteException = 'context_site_exception',
    BlockSiteAds = 'context_block_site_ads',
    SecurityReport = 'context_security_report',
    ComplaintWebsite = 'context_complaint_website',
    SiteFilteringOn = 'context_site_filtering_on',
    SiteFilteringOff = 'context_site_filtering_off',
    EnableProtection = 'context_enable_protection',
    DisableProtection = 'context_disable_protection',
    OpenSettings = 'context_open_settings',
    OpenLog = 'context_open_log',
    UpdateAntibannerFilters = 'context_update_antibanner_filters',
}

export type ContextMenuListener = () => unknown | Promise<unknown>;

/**
 * Type-safe mediator for context menu events
 */
export class ContextMenuEvents {
    private listenersMap = new Map();

    public addListener<T extends ContextMenuAction>(type: T, listener: ContextMenuListener): void {
        if (this.listenersMap.has(type)) {
            throw new Error(`${type} listener has already been registered`);
        }
        this.listenersMap.set(type, listener);
    }

    public async publishEvent<T extends ContextMenuAction>(type: T): Promise<void> {
        const listener = this.listenersMap.get(type);
        if (listener) {
            return Promise.resolve(listener());
        }
    }
}

export const contextMenuEvents = new ContextMenuEvents();
