import { Gamestatus } from './GameStatus';
import { Spot } from './Spot';

export class Game {
	points: number;
	time: number;
	spots: Array<Spot> = [];
	status: Gamestatus;
}
