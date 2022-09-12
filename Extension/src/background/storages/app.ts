export class AppStorage {
    private clientId: string | undefined;

    public getClientId(): string | undefined {
        return this.clientId;
    }

    public setClientId(id: string) {
        this.clientId = id;
    }
}

export const appStorage = new AppStorage();
