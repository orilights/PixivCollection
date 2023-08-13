export enum SettingType {
  Str = 'str',
  Json = 'json',
  Number = 'number',
  Bool = 'bool',
}

export class Setting {
  abbr: string
  constructor(abbr: string) {
    this.abbr = abbr
  }

  register(settingKey: string, ref: Ref<any>, settingType: SettingType = SettingType.Str) {
    const value = this.get(settingKey, settingType, null)
    if (value === null)
      this.set(settingKey, ref.value)
    else
      ref.value = value
    watch(ref, (value) => {
      this.set(settingKey, value)
    }, { deep: true })
  }

  set(settingKey: string, value: any) {
    let data = value
    if (typeof value === 'object')
      data = JSON.stringify(value)
    localStorage.setItem(`${this.abbr}-setting-${settingKey}`, String(data))
  }

  get(settingKey: string, settingType: SettingType, defaultValue: any): any {
    const value = localStorage.getItem(`${this.abbr}-setting-${settingKey}`)
    if (value === null)
      return defaultValue

    if (settingType === SettingType.Json)
      return JSON.parse(value)

    if (settingType === SettingType.Number)
      return Number(value)

    if (settingType === SettingType.Bool)
      return value === 'true'

    return value
  }
}
