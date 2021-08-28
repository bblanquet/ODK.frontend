import { Game } from '../model/Game';
import { Hook } from './Hook';
import { StateUpdater } from 'preact/hooks';
import { Howl } from 'howler';
import { Spot } from '../model/Spot';
import { Gamestatus } from '../model/Gamestatus';

const DURATION = 60;

export class HomeHook extends Hook<Game> {
	private _howl: Howl;
	private _key: string = 'mole_odk';
	private _clockTimer: NodeJS.Timeout;
	private _molesTimer: NodeJS.Timeout;

	constructor(d: [Game, StateUpdater<Game>]) {
		super(d[0], d[1]);
		const storage = window.localStorage.getItem(this._key);
		if (storage) {
			const newState = JSON.parse(storage as string) as Game;
			this.update((e) => {
				e.points = newState.points;
				e.time = newState.time;
				e.spots = newState.spots;
				e.status = newState.status;
			});
			this.checkTimers();
		} else {
			this.init();
		}
	}

	private checkTimers() {
		if (this.state.status === Gamestatus.inprogress) {
			if (!this._clockTimer) {
				this.clock();
			}
			if (!this._molesTimer) {
				this.randomize();
			}
		}
	}

	public init() {
		const newState = HomeHook.defaultState();
		this.update((e) => {
			e.points = newState.points;
			e.time = newState.time;
			e.spots = newState.spots;
			e.status = newState.status;
		});
		this.clearTimer();
	}

	protected stateChanged(): void {
		window.localStorage.setItem(this._key, JSON.stringify(this.state));
	}

	private clearTimer() {
		clearTimeout(this._molesTimer);
		clearTimeout(this._clockTimer);
		this._clockTimer = null;
		this._molesTimer = null;
	}

	private static spots(): Array<Spot> {
		const holes = new Array<Spot>();
		let i = 0;
		while (i < 24) {
			holes.push(new Spot(i, false));
			i++;
		}
		return holes;
	}

	public getMedalColor() {
		return this.state.status === Gamestatus.done ? 'bg-success' : 'bg-secondary';
	}

	public getClockColor() {
		if (this.state.status !== Gamestatus.inprogress) {
			return 'bg-secondary';
		} else {
			if (this.state.time < 10) {
				return 'bg-danger';
			} else {
				return 'bg-warning';
			}
		}
	}

	public start() {
		this.update((e) => {
			e.status = Gamestatus.inprogress;
		});
		this.checkTimers();
	}

	public hit(spot: Spot): void {
		if (spot.hasMole) {
			if (!this._howl) {
				this._howl = new Howl({ src: [ './audio/blop.mp3' ], html5: true });
			}
			this._howl.play();
			this.state.spots[spot.id].hasMole = false;
			this.update((e) => {
				(e.points = this.state.points + 1), (e.spots = this.state.spots);
			});
		}
	}

	private clock(): void {
		const next = this.state.time - 1;
		if (next < 1) {
			this.state.spots.forEach((s) => {
				s.hasMole = false;
			});
			this.update((e) => {
				e.time = DURATION;
				e.status = Gamestatus.done;
				e.spots = this.state.spots;
			});
			this.clearTimer();
		} else {
			this.update((e) => {
				e.time = next;
			});
			this._clockTimer = setTimeout(() => this.clock(), 1000);
		}
	}

	private randomize(): void {
		let count = 0;
		this.state.spots.some((s, i) => {
			this.state.spots[i].hasMole = false;
			if (Math.random() < 0.1) {
				this.state.spots[i].hasMole = true;
				count++;
			}
			return 4 < count;
		});
		this.update((e) => {
			e.spots = this.state.spots;
		});
		const next = 1000 + Math.random() * 2000;

		this._molesTimer = setTimeout(() => {
			if (this.state.status === Gamestatus.inprogress) {
				this.randomize();
			}
		}, next);
	}

	public classified(): Array<Array<Spot>> {
		return [
			this.state.spots.slice(0, 2),
			this.state.spots.slice(2, 6),
			this.state.spots.slice(6, 12),
			this.state.spots.slice(12, 18),
			this.state.spots.slice(18, 22),
			this.state.spots.slice(22, 24)
		];
	}

	static defaultState(): Game {
		const g = new Game();
		g.spots = this.spots();
		g.points = 0;
		g.time = DURATION;
		g.status = Gamestatus.pending;
		return g;
	}

	public unmount(): void {}
}
