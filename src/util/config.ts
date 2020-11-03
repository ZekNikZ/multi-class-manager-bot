import { access } from "fs";

export interface ConfigKey {
    key: string;
    type: string;
    defaultValue: string | boolean | number;
    description: string;
}

export interface ConfigObj {
    version: string;
    configKeys : ConfigKey[];
}

export class Config {
    private config: ConfigObj;

    constructor(configObj: ConfigObj) {
        this.config = configObj;
    }

    get version(): string {
        return this.config.version;
    }

    get keys(): string[] {
        return this.config.configKeys.map(k => k.key);
    }

    get default() {
        return this.config.configKeys.reduce((acc, { key, defaultValue }) => ({ ...acc, [key]: defaultValue }), {});
    }

    getDescription(key: string) : string | undefined {
        return this.config.configKeys.find(k => k.key === key)?.description;
    }

    getType(key: string){
        return this.config.configKeys.find(k => k.key === key)?.type;
    }

    getDefaultValue(key: string): string | boolean | number {
        const ck = this.config.configKeys.find(k => k.key === key);

        if (ck === undefined) {
            throw new Error('Config key does not exist');
        }

        return ck.defaultValue;
    }

    getConfigKey(key: string) : ConfigKey | undefined {
        return this.config.configKeys.find(k => k.key === key);
    }
}

export default new Config({
    version: '0.2',
    configKeys: [
        {
            key: 'nickname',
            type: 'string',
            defaultValue: '',
            description: 'the nickname of the bot'
        }
    ]
});