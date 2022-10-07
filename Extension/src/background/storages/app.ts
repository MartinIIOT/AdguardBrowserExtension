export type AppStorageData = {
    isInit: boolean,
    clientId?: string,
};
export class AppStorage {
    private data: AppStorageData = {
        isInit: false,
    };

    public get<T extends keyof AppStorageData>(key: T): AppStorageData[T] {
        return this.data[key];
    }

    public set<T extends keyof AppStorageData>(key: T, value: AppStorageData[T]): void {
        this.data[key] = value;
    }
}

export const appStorage = new AppStorage();
