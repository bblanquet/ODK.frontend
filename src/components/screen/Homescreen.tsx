import { h } from 'preact';
import Body from '../common/Body';
import Btn from '../common/Btn';
import Line from '../common/Line';
import Column from '../common/Column';
import Icon from '../common/Icon';
import CircularBtn from '../common/CircularBtn';
import { Game } from '../model/Game';
import { Gamestatus } from '../model/Gamestatus';
import Visible from '../common/Visible';
import { HookedComponent } from '../Hook/HookedComponent';
import { HomeHook } from '../Hook/HomeHook';
import { useState, useEffect } from 'preact/hooks';

export default class Home extends HookedComponent<{}, HomeHook, Game> {
	GetDefaultHook() {
		return new HomeHook(useState(HomeHook.DefaultState()));
	}

	Rendering() {
		return (
			<Body
				header={
					<div style="background-color:#ededed; padding:10px 10px 10px 10px">
						<Line>
							<span class={`badge badge-pill ${this.Hook.getMedalColor()} sm-m-l sm-m-r`}>
								<Icon value={'fas fa-medal'} /> 점수 {this.Hook.State.points}
							</span>
							<span class={`badge badge-pill ${this.Hook.getClockColor()} sm-m-l sm-m-r`}>
								<Icon value={'fas fa-stopwatch'} /> 시간: {this.Hook.State.time}
							</span>
						</Line>
					</div>
				}
				content={
					<Column>
						{this.Hook.State.spots != undefined ? (
							this.Hook.classified().map((line) => (
								<Line>
									{line.map((spot) => (
										<CircularBtn hasAnimation={spot.hasMole} onClick={() => this.Hook.Hit(spot)}>
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
							<Visible isVisible={this.Hook.State.status === Gamestatus.pending}>
								<Btn
									onClick={() => {
										this.Hook.Start();
									}}
								>
									<Icon value="far fa-arrow-alt-circle-right" /> 시작
								</Btn>
							</Visible>
							<Visible isVisible={this.Hook.State.status !== Gamestatus.pending}>
								<Btn
									onClick={() => {
										this.Hook.init();
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
}
