/**
 * Module used to persist user rules editor content
 * during switches between common and fullscreen modes
 */
export class EditorStorage {
    private data: string | undefined;

    set(data: string): void {
        this.data = data;
    }

    get(): string | undefined {
        return this.data;
    }
}

export const editorStorage = new EditorStorage();
