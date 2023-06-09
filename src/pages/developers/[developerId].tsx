import Image from 'next/image';
import { Box, Grid, GridItem, Heading, SimpleGrid } from '@chakra-ui/react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';

import { Developer } from '@/features/developers/developer';
import { Game } from '@/features/games/games';
import client from '@/config/client';
import getImageURL from '@/utils/getImageURL';
import getDescription from '@/utils/getDescription';
import GameCard from '@/features/games/GameCard';
import GameCardLoading from '@/features/games/GameCardLoading';

interface FetchGamesResponse {
	count: number;
	next: string;
	results: Game[];
}

const GameDeveloperDetails = () => {
	const router = useRouter();
	const { developerId } = router.query;

	const { data: developerDetails, isLoading: isFetchingDeveloperDetails } =
		useQuery<Developer, Error>({
			queryKey: ['developers', developerId],
			queryFn: () =>
				client
					.get(`/developers/${developerId}`)
					.then(({ data }) => data)
					.catch((err) => err),
		});

	const { data: developerGames, isLoading: isFetchingGames } = useQuery<
		FetchGamesResponse,
		Error,
		Game[]
	>({
		queryKey: ['developer-games', developerId],
		queryFn: () =>
			client
				.get('/games', { params: { developers: developerId } })
				.then(({ data }) => data)
				.catch((err) => err),
		select: (data) => data.results,
	});

	const handleSelectGame = (game: Game) => router.push(`/games/${game.id}`);

	if (isFetchingDeveloperDetails || isFetchingGames)
		return (
			<SimpleGrid p={5} gap={5} columns={{ base: 1, md: 2, lg: 3, xl: 4 }}>
				{[...Array(10).keys()].map((e) => (
					<GameCardLoading key={e} />
				))}
			</SimpleGrid>
		);

	return (
		<Box p={5} gap={5}>
			<Grid
				gap={{ base: 5, lg: 10 }}
				templateColumns={{ base: '1fr', lg: '300px 1fr' }}
			>
				<GridItem>
					<Box
						minH={300}
						maxH={400}
						pos='relative'
						w='full'
						h='full'
						rounded='lg'
						overflow='hidden'
					>
						<Image
							fill
							sizes='100%'
							style={{ objectFit: 'cover' }}
							src={getImageURL(developerDetails?.image_background)}
							alt='Developer Logo'
						/>
					</Box>
				</GridItem>
				<GridItem>
					<Heading>{developerDetails?.name}</Heading>
					<Grid
						mt={5}
						gap={5}
						textAlign='justify'
						dangerouslySetInnerHTML={{
							__html: getDescription(developerDetails?.description),
						}}
					/>
				</GridItem>
			</Grid>
			<Box mt={10}>
				<Heading mb={10} size='lg'>
					Published Games ({developerDetails?.games_count || 0})
				</Heading>
				<ResponsiveMasonry
					columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1280: 4 }}
				>
					<Masonry gutter='20px'>
						{developerGames?.map((developerGame) => (
							<GameCard
								key={developerGame.id}
								game={developerGame}
								onSelectGame={handleSelectGame}
							/>
						))}
					</Masonry>
				</ResponsiveMasonry>
			</Box>
		</Box>
	);
};

export default GameDeveloperDetails;
