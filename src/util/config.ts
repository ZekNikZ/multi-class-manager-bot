export interface ConfigKey {
    key: string;
    type: string;
    defaultValue: string | boolean | number;
    currentValue?: string | boolean | number | undefined;
    description: string;
}

export interface ConfigObj {
    version: string;
    configKeys : ConfigKey[];
}

export class Config {
    config: ConfigObj;

    constructor(configObj: ConfigObj) {
        this.config = configObj;
    }

    getVersion(): string {
        return this.config.version;
    }

    getKeys(): string[] {
        return this.config.configKeys.map(k => k.key);
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

    getValue(key: string) {
        const ck = this.config.configKeys.find(k => k.key === key);

        if (ck === undefined) {
            throw new Error('Config key does not exist');
        }

        return ck.currentValue || ck.defaultValue;
    }

    setValue(key: string, value: string | boolean | number | undefined) {
        const index = this.config.configKeys.findIndex(k => k.key === key);
        if (index !== -1) {
            this.config.configKeys[index].currentValue = value;
        } else {
            throw new Error('Config key does not exist');
        }
    }
}

export default new Config({
    version: '1.0',
    configKeys: [
        {
            key: 'prefix',
            type: 'string',
            defaultValue: '!',
            description: 'the command prefix on the server'
        },
        {
            key: 'nickname',
            type: 'string',
            defaultValue: '',
            description: 'the nickname of the bot'
        }
    ]
});