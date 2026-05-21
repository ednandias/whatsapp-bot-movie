export type Result = {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export type Movie = {
  adult: boolean
  backdrop_path: string
  genre_ids: number[]
  id: number
  title: string
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string
  release_date: string
  softcore: boolean
  video: boolean
  vote_average: number
  vote_count: number
}

export interface WatchProvider {
  id: number
  results: ResultWatchProvider
}

export interface ResultWatchProvider {
  [region: string]: WatchProviderOption
}

export interface WatchProviderOption {
  link: string
  buy?: WatchOption[]
  flatrate?: WatchOption[]
  rent?: WatchOption[]
  ads?: WatchOption[]
}

export interface WatchOption {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
}
