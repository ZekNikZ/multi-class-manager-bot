export class FirebaseProvider extends SettingProvider {
    public constructor(database: any);

    public readonly client: CommandoClient;
    private db: any;
    private ref: any;
    private listeners: Map<any, any>;
    private settings: Map<any, any>;

    public clear(guild: Guild | string): Promise<void>;
    public destroy(): Promise<void>;
    public get(guild: Guild | string, key: string, defVal?: any): any;
    public init(client: CommandoClient): Promise<void>;
    public remove(guild: Guild | string, key: string): Promise<any>;
    public set(guild: Guild | string, key: string, val: any): Promise<any>;
    private setupGuild(guild: string, settings: {}): void;
    private setupGuildCommand(guild: CommandoGuild, command: Command, settings: {}): void;
    private setupGuildGroup(guild: CommandoGuild, group: CommandGroup, settings: {}): void;
    private updateOtherShards(key: string, val: any): void;
}