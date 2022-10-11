import { FilterUpdateApi } from '../api';

/**
 * Service for scheduling filter update checks
 *
 * It delays update check on initialization on 5 min
 * 5 min after initialization scheduler checks filter updates every 30 minutes
 */
export class FilterUpdateService {
    // update checking initialization delay
    private static initDelay = 1000 * 60 * 5; // 5 min

    // checking period
    private static checkPeriodMs = 1000 * 60 * 30; // 30 min

    private timerId: number;

    constructor() {
        this.update = this.update.bind(this);
    }

    /**
     * Run update scheduler after {@link initDelay} timeout
     */
    public async init(): Promise<void> {
        setTimeout(async () => {
            await this.update();
        }, FilterUpdateService.initDelay);
    }

    /**
     * {@link } Check filter updates every {@link checkPeriodMs} period
     */
    private async update(): Promise<void> {
        if (this.timerId) {
            window.clearTimeout(this.timerId);
        }

        await FilterUpdateApi.autoUpdateFilters();

        this.timerId = window.setTimeout(async () => {
            await this.update();
        }, FilterUpdateService.checkPeriodMs);
    }
}

export const filterUpdateService = new FilterUpdateService();
