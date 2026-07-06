export type SelectOption = {
  value: string | number
  label: string
}

/**
 * Mengubah array object dari API menjadi format options React Select
 */
export const mapToOptions = <T extends Record<string, any>>(
  data: T[] | undefined | null,
  labelKey: keyof T = 'name',
  valueKey: keyof T = 'id',
): SelectOption[] => {
  if (!data || !Array.isArray(data)) return []

  return data.map((item) => ({
    value: item[valueKey],
    label: item[labelKey],
  }))
}

/**
 * Mencari object option berdasarkan value (ID) yang tersimpan di form
 */
export const findSelectOption = (
  value: string | number | null | undefined,
  options: SelectOption[],
): SelectOption | null => {
  if (value === null || value === undefined) return null
  return options.find((opt) => opt.value === value) || null
}
