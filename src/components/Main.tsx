import { Component, h } from 'preact';
import Body from './common/Body';
import Btn from './common/Btn';
import Line from './common/Line';
import Column from './common/Column';
import Icon from './common/Icon';
import CircularBtn from './common/CircularBtn';
import { Game } from './Game';
import { Gamestatus } from './Gamestatus';
import { Spot } from './Spot';
import Visible from './common/Visible';
import { Howl } from 'howler';

export default class Main extends Component<{}, Game> {
	private _howl: Howl;
	private _key: string = 'mole_odk';
	private _clockTimer: NodeJS.Timeout;
	private _molesTimer: NodeJS.Timeout;

	componentDidMount() {
		const storage = window.localStorage.getItem(this._key);
		if (storage) {
			this.setState(JSON.parse(storage as string));
		} else {
			this.init();
		}
	}

	private init() {
		this.setState({
			spots: this.spots(),
			points: 0,
			time: 15,
			status: Gamestatus.pending
		});
		this.clearTimer();
	}

	private clearTimer() {
		clearTimeout(this._molesTimer);
		clearTimeout(this._clockTimer);
		this._clockTimer = null;
		this._molesTimer = null;
	}

	componentDidUpdate() {
		window.localStorage.setItem(this._key, JSON.stringify(this.state));
		if (this.state.status === Gamestatus.inprogress) {
			if (!this._clockTimer) {
				this.clock();
			}
			if (!this._molesTimer) {
				this.randomize();
			}
		}
	}

	public spots(): Array<Spot> {
		const holes = new Array<Spot>();
		let i = 0;
		while (i < 24) {
			holes.push(new Spot(i, false));
			i++;
		}
		return holes;
	}

	private Hit(spot: Spot): void {
		if (spot.hasMole) {
			if (!this._howl) {
				this._howl = new Howl({ src: [ './audio/blop.mp3' ], html5: true });
			}
			this._howl.play();
			this.state.spots[spot.id].hasMole = false;
			this.setState({
				points: this.state.points + 1,
				spots: this.state.spots
			});
		}
	}

	private clock(): void {
		const next = this.state.time - 1;
		if (next < 1) {
			this.state.spots.forEach((s) => {
				s.hasMole = false;
			});
			this.setState({
				time: 15,
				status: Gamestatus.done,
				spots: this.state.spots
			});
			this.clearTimer();
		} else {
			this.setState({
				time: next
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
		this.setState({
			spots: this.state.spots
		});
		const next = 1000 + Math.random() * 2000;

		this._molesTimer = setTimeout(() => {
			if (this.state.status === Gamestatus.inprogress) {
				this.randomize();
			}
		}, next);
	}

	private classified(): Array<Array<Spot>> {
		return [
			this.state.spots.slice(0, 2),
			this.state.spots.slice(2, 6),
			this.state.spots.slice(6, 12),
			this.state.spots.slice(12, 18),
			this.state.spots.slice(18, 22),
			this.state.spots.slice(22, 24)
		];
	}

	render() {
		return (
			<Body
				header={
					<div style="background-color:#ededed; padding:10px 10px 10px 10px">
						<Line>
							<span class="badge badge-pill bg-secondary sm-m-l sm-m-r">
								<Icon value={'fas fa-medal'} /> 점수 {this.state.points}
							</span>
							<span class={`badge badge-pill ${this.getColor()} sm-m-l sm-m-r`}>
								<Icon value={'fas fa-stopwatch'} /> 시간: {this.state.time}
							</span>
						</Line>
					</div>
				}
				content={
					<Column>
						{this.state.spots != undefined ? (
							this.classified().map((line) => (
								<Line>
									{line.map((spot) => (
										<CircularBtn hasAnimation={spot.hasMole} onClick={() => this.Hit(spot)}>
											<div class={`fill-parent ${spot.hasMole ? 'icon-mole' : 'icon-hole'}`} />
										</CircularBtn>
									))}
								</Line>
							))
						) : (
							''
						)}
					</Column>
				}
				footer={
					<div style="background-color:#ededed; padding:10px 10px 10px 10px">
						<Line>
							<Visible isVisible={this.state.status === Gamestatus.pending}>
								<Btn
									onClick={() => {
										this.setState({
											status: Gamestatus.inprogress
										});
									}}
								>
									<Icon value="far fa-arrow-alt-circle-right" /> 시작
								</Btn>
							</Visible>
							<Visible isVisible={this.state.status !== Gamestatus.pending}>
								<Btn
									onClick={() => {
										this.init();
									}}
								>
									<Icon value="fas fa-power-off" /> 초기화
								</Btn>
							</Visible>
						</Line>
					</div>
				}
			/>
		);
	}
	getColor() {
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
}
