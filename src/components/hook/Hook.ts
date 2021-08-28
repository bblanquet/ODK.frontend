import { StateUpdater } from 'preact/hooks';

export abstract class Hook<T> {
	public constructor(public State: T, protected SetState: StateUpdater<T>) {}

	protected Update(setter: (state: T) => void): void {
		setter(this.State);
		this.SetState({ ...this.State });
		this.StateChanged();
	}

	protected abstract StateChanged(): void;

	public abstract Unmount(): void;
}
