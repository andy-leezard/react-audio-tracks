export const getFileName = (src: string): string => {
  const file_name_arr = src.split("/")
  const file_name_with_extension = file_name_arr[file_name_arr.length - 1]
  return file_name_with_extension!.split(".")[0]!
}
export const getURLParam = (keyword: string) => {
  const params = new URLSearchParams(window.location.search)
  let query = ""
  if (params.has(keyword)) {
    query = params.get(keyword) as string
  }
  return query
}
export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))
