import { listeners } from '../notifier';
import { NotifierType } from '../../common/constants';

/**
 * Module used to keep track of userrules editor opened in the fullscreen mode
 */
class FullscreenUserRulesEditor {
    openPagesCount = 0;

    onOpenPage() {
        this.openPagesCount += 1;
        this.onPagesCountChanged();
    }

    onClosePage() {
        if (this.openPagesCount <= 0) {
            return;
        }
        this.openPagesCount -= 1;
        this.onPagesCountChanged();
    }

    onPagesCountChanged() {
        listeners.notifyListeners(NotifierType.FullscreenUserRulesEditorUpdated, this.isOpen());
    }

    isOpen() {
        return this.openPagesCount > 0;
    }
}

export const fullscreenUserRulesEditor = new FullscreenUserRulesEditor();
