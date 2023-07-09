import Box from './box';
import BPJS from './bpjs';
import Camera from './camera';
import Input from './input';

export default class UI {
	public static instance: UI;

	private app: HTMLElement;
	private ui: HTMLDivElement;
	private contextMenu: HTMLDivElement;
	private addItemMenu: HTMLDivElement;
	private addItemMenuInput: HTMLInputElement;

	constructor() {
		if (UI.instance) throw new Error('UI is a singleton');

		UI.instance = this;

		if (!document.getElementById('app')) {
			throw new Error('No #app element found');
		}

		this.app = document.getElementById('app')!;

		this.ui = document.createElement('div');
		this.ui.id = 'ui';
		this.app.appendChild(this.ui);

		this.contextMenu = document.createElement('div');
		this.contextMenu.id = 'context-menu';
		this.app.appendChild(this.contextMenu);

		// Input.onMouseDown.push([
		// 	-1,
		// 	() => {
		// 		this.closeContextMenu();
		// 		this.closeAddItemMenu();
		// 	},
		// ]);

		const contextMenuItems = [
			{
				text: 'Add Item',
				action: () => {
					console.log('Add Item');
					this.closeContextMenu();
					this.openAddItemMenu();
				},
			},
			{
				text: 'Duplicate',
				action: () => {
					console.log('Duplicate');
					this.closeContextMenu();
				},
			},
			{
				text: 'Delete',
				action: () => {
					console.log('Delete');
					this.closeContextMenu();
				},
			},
		];

		contextMenuItems.forEach((item) => {
			const element = document.createElement('div');
			element.classList.add('item');
			element.innerText = item.text;
			element.addEventListener('click', item.action);
			this.contextMenu.appendChild(element);
		});

		this.addItemMenu = document.createElement('div');
		this.addItemMenu.id = 'add-item-menu';
		this.app.appendChild(this.addItemMenu);

		this.addItemMenuInput = document.createElement('input');
		this.addItemMenuInput.id = 'add-item-menu-input';
		this.addItemMenuInput.type = 'text';
		this.addItemMenuInput.placeholder = 'Search for a node...';
		this.addItemMenu.appendChild(this.addItemMenuInput);

		// items are added from Game.instance.items
		BPJS.instance.items.forEach((item) => {
			const element = document.createElement('div');
			element.classList.add('item');
			element.innerHTML = /*html*/ `<div class='name'>${item.name}</div><div class='description'>${item.description}</div>`;
			element.addEventListener('click', (e) => {
				console.log(
					'Add Item at ' +
						Camera.instance.getX() +
						', ' +
						Camera.instance.getY()
				);
				e.stopPropagation();
				this.closeAddItemMenu();
				BPJS.instance.addBox(
					new Box(
						item,
						Camera.instance.getX() + 150,
						Camera.instance.getY() + 150
					)
				);

				console.log(
					'Add Item at ' +
						Camera.instance.getX() +
						', ' +
						Camera.instance.getY()
				);
			});
			this.addItemMenu.appendChild(element);
		});

		this.initEventListeners();
	}

	private initEventListeners(): void {
		// Add item menu event listeners
		Input.onKeyDown.push(['A', () => this.openAddItemMenu()]);
		this.addItemMenu.addEventListener('click', (e) => {
			e.stopPropagation();
		});

		// Search Event Listeners
		this.addItemMenuInput.addEventListener('input', (e) => {
			const value = (e.target as HTMLInputElement).value.toLowerCase();
			const items = this.addItemMenu.querySelectorAll('.item');
			items.forEach((item) => {
				if ((item as HTMLDivElement).innerText.toLowerCase().includes(value)) {
					item.classList.remove('hidden');
				} else {
					item.classList.add('hidden');
				}
			});
		});

		// Context Menu Event Listeners

		Input.onKeyDown.push([
			'Escape',
			() => {
				this.closeAddItemMenu();
				this.closeContextMenu();
			},
		]);

		this.contextMenu.addEventListener('click', (e) => {
			e.stopPropagation();
		});

		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			this.contextMenu.style.left = `${e.clientX}px`;
			this.contextMenu.style.top = `${e.clientY}px`;
			this.openContextMenu();
		});
	}

	public openContextMenu(): void {
		this.contextMenu.classList.add('open');
	}

	public closeContextMenu(): void {
		this.contextMenu.classList.remove('open');
	}

	public openAddItemMenu(): void {
		this.addItemMenu.classList.add('open');
		setTimeout(() => {
			this.addItemMenuInput.focus();
		}, 50);
	}

	public closeAddItemMenu(): void {
		this.addItemMenu.classList.remove('open');
	}
}
