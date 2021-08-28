import { Game } from '../model/Game';
import { Hook } from './Hook';
import { StateUpdater } from 'preact/hooks';
import { Howl } from 'howler';
import { Spot } from '../model/Spot';
import { Gamestatus } from '../model/Gamestatus';

const DURATION = 30;

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
			this.Update((e) => {
				e.points = newState.points;
				e.time = newState.time;
				e.spots = newState.spots;
				e.status = newState.status;
			});
			this.CheckTimers();
		} else {
			this.init();
		}
	}

	private CheckTimers() {
		if (this.State.status === Gamestatus.inprogress) {
			if (!this._clockTimer) {
				this.clock();
			}
			if (!this._molesTimer) {
				this.randomize();
			}
		}
	}

	public init() {
		const newState = HomeHook.DefaultState();
		this.Update((e) => {
			e.points = newState.points;
			e.time = newState.time;
			e.spots = newState.spots;
			e.status = newState.status;
		});
		this.clearTimer();
	}

	protected StateChanged(): void {
		window.localStorage.setItem(this._key, JSON.stringify(this.State));
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
		return this.State.status === Gamestatus.done ? 'bg-success' : 'bg-secondary';
	}

	public getClockColor() {
		if (this.State.status !== Gamestatus.inprogress) {
			return 'bg-secondary';
		} else {
			if (this.State.time < 10) {
				return 'bg-danger';
			} else {
				return 'bg-warning';
			}
		}
	}

	Start() {
		this.Update((e) => {
			e.status = Gamestatus.inprogress;
		});
		this.CheckTimers();
	}

	public Hit(spot: Spot): void {
		if (spot.hasMole) {
			if (!this._howl) {
				this._howl = new Howl({ src: [ './audio/blop.mp3' ], html5: true });
			}
			this._howl.play();
			this.State.spots[spot.id].hasMole = false;
			this.Update((e) => {
				(e.points = this.State.points + 1), (e.spots = this.State.spots);
			});
		}
	}

	private clock(): void {
		const next = this.State.time - 1;
		if (next < 1) {
			this.State.spots.forEach((s) => {
				s.hasMole = false;
			});
			this.Update((e) => {
				e.time = DURATION;
				e.status = Gamestatus.done;
				e.spots = this.State.spots;
			});
			this.clearTimer();
		} else {
			this.Update((e) => {
				e.time = next;
			});
			this._clockTimer = setTimeout(() => this.clock(), 1000);
		}
	}

	private randomize(): void {
		let count = 0;
		this.State.spots.some((s, i) => {
			this.State.spots[i].hasMole = false;
			if (Math.random() < 0.1) {
				this.State.spots[i].hasMole = true;
				count++;
			}
			return 4 < count;
		});
		this.Update((e) => {
			e.spots = this.State.spots;
		});
		const next = 1000 + Math.random() * 2000;

		this._molesTimer = setTimeout(() => {
			if (this.State.status === Gamestatus.inprogress) {
				this.randomize();
			}
		}, next);
	}

	public classified(): Array<Array<Spot>> {
		return [
			this.State.spots.slice(0, 2),
			this.State.spots.slice(2, 6),
			this.State.spots.slice(6, 12),
			this.State.spots.slice(12, 18),
			this.State.spots.slice(18, 22),
			this.State.spots.slice(22, 24)
		];
	}

	static DefaultState(): Game {
		const g = new Game();
		g.spots = this.spots();
		g.points = 0;
		g.time = DURATION;
		g.status = Gamestatus.pending;
		return g;
	}

	public Unmount(): void {}
}
