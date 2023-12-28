import { useEffect, useState } from "react"
import { IMovie } from "../interfaces/Movie"
import { IGenre } from "../interfaces/Genre"

export const useGetMovies = (MOVIE_URL:string, GENRE_URL:string) => {

	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>("")
	const [listOfMovies, setListOfMovies] = useState<IMovie[]>([])
	const [page, setPage] = useState<number>(1)

	useEffect(() => {

		const getMovies = async():Promise<void> => {

			try {

				setLoading(true)

				const movieRes = await fetch(`${MOVIE_URL}&page=${page}`)
				const movieData = await movieRes.json()

				const genresRes = await fetch(GENRE_URL)
				const genresData = await genresRes.json()

				setLoading(false)

				// Validate maximum amount of pages for "top rated movies"
				if (movieData.page >= 499) {
					throw new Error("Limite alcançado.")
				} 

				// Parsing old object format into a new "IMovie" interface. Changing genres_ids for its names as well.
				const PARSED_movieData:IMovie[] = movieData.results.map((movie:any):IMovie => {
					return {
						id					: movie.id,
						genre_ids			: movie.genre_ids, 

						// Maping all genres_id in array and replacing it by its name in the "genresData" object
						genre_names			: movie.genre_ids.map((genre_id:number):IGenre|undefined => {
												let genre:IGenre|undefined = genresData.genres.find(
													(genre:IGenre) => genre.id === genre_id
												)
												return genre;
											}),

						title				: movie.title,
						original_title		: movie.original_title,
						original_language	: movie.original_language,
						overview			: movie.overview,
						popularity			: movie.popularity,
						poster_path			: movie.poster_path,
						release_date		: movie.release_date,
						vote_average		: movie.vote_average,
						vote_count			: movie.vote_count,
					}
				})
				
				if (listOfMovies.length === 0) {
					setListOfMovies(PARSED_movieData)
				} else {
					setListOfMovies(prev => [...prev, ...PARSED_movieData])
				}

			} catch (error:any) {
				setLoading(false)	
				if (error.message === "Limite alcançado.") {
					setError("Limite alcançado.")
				} else {
					setError("Algo deu errado.")
				}
			}
		}

		getMovies()

	}, [MOVIE_URL, GENRE_URL, page])
	
	return {
		loading, 
		error,
		listOfMovies,
		setPage,
		setListOfMovies,
	}
}