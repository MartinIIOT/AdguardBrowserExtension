export const enum ContextMenuAction {
    SITE_PROTECTION_DISABLED = 'context_site_protection_disabled',
    SITE_FILTERING_DISABLED = 'context_site_filtering_disabled',
    SITE_EXCEPTION = 'context_site_exception',
    BLOCK_SITE_ADS = 'context_block_site_ads',
    BLOCK_SITE_ELEMENT = 'context_block_site_element',
    SECURITY_REPORT = 'context_security_report',
    COMPLAINT_WEBSITE = 'context_complaint_website',
    SITE_FILTERING_ON = 'context_site_filtering_on',
    SITE_FILTERING_OFF = 'context_site_filtering_off',
    ENABLE_PROTECTION = 'context_enable_protection',
    DISABLE_PROTECTION = 'context_disable_protection',
    OPEN_SETTINGS = 'context_open_settings',
    OPEN_LOG = 'context_open_log',
    UPDATE_ANTIBANNER_FILTERS = 'context_update_antibanner_filters',
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
