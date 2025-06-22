import { useCombobox } from "downshift";
import { useEffect, useRef, useState } from "react";

import ModelRow from "./ModelRow";
import type { Model } from "./models";

type FilterState = {
	[key: string]: "show" | "hide" | null;
};

const ModelSelector = ({
	models,
	model,
	onModelSelection,
}: {
	models: Model[];
	model: Model | undefined;
	onModelSelection: (model: Model | null) => void;
}) => {
	const [inputItems, setInputItems] = useState(models);
	const [inputValue, setInputValue] = useState("");
	const [selectedItem, setSelectedItem] = useState<Model | null>(model || null);
	const [filterState, setFilterState] = useState<FilterState>(() => {
		// Try to get stored filter state from sessionStorage
		const storedFilters = sessionStorage.getItem("modelFilters");
		if (storedFilters) {
			try {
				return JSON.parse(storedFilters);
			} catch (e) {
				console.error("Failed to parse stored filters", e);
			}
		}
		// Default initial filter state
		return {
			Beta: null,
			LoRA: null,
			MCP: null,
		};
	});

	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setInputItems(models);
		setSelectedItem(model || null);
	}, [models, model]);

	useEffect(() => {
		// Apply filters when filterState changes
		let filteredItems = models;

		if (inputValue) {
			filteredItems = filteredItems.filter((model) => model.name.includes(inputValue));
		}

		// Apply tag filters
		for (const [tag, state] of Object.entries(filterState)) {
			if (state === "show") {
				filteredItems = filteredItems.filter((model) =>
					model.properties.some((prop) => {
						if (tag === "Beta" && prop.property_id === "beta" && prop.value === "true")
							return true;
						if (tag === "LoRA" && prop.property_id === "lora" && prop.value === "true")
							return true;
						if (
							tag === "MCP" &&
							prop.property_id === "function_calling" &&
							prop.value === "true"
						)
							return true;
						return false;
					}),
				);
			} else if (state === "hide") {
				filteredItems = filteredItems.filter(
					(model) =>
						!model.properties.some((prop) => {
							if (
								tag === "Beta" &&
								prop.property_id === "beta" &&
								prop.value === "true"
							)
								return true;
							if (
								tag === "LoRA" &&
								prop.property_id === "lora" &&
								prop.value === "true"
							)
								return true;
							if (
								tag === "MCP" &&
								prop.property_id === "function_calling" &&
								prop.value === "true"
							)
								return true;
							return false;
						}),
				);
			}
		}

		setInputItems(filteredItems);

		// Check if the currently selected model is still in the filtered list
		if (
			selectedItem &&
			filteredItems.length > 0 &&
			!filteredItems.some((item) => item.name === selectedItem.name)
		) {
			// Find the model with the newest created_at date
			const newestModel = filteredItems.reduce((newest, current) => {
				if (!newest.created_at) return current;
				if (!current.created_at) return newest;
				return new Date(current.created_at) > new Date(newest.created_at)
					? current
					: newest;
			}, filteredItems[0]);

			// Update the selected model to the newest one
			onModelSelection(newestModel);
			setSelectedItem(newestModel);
		} else if (filteredItems.length === 0 && selectedItem) {
			// If no models match the filter and something is selected, clear selection
			onModelSelection(null);
			setSelectedItem(null);
		}

		// Save filter state to sessionStorage whenever it changes
		sessionStorage.setItem("modelFilters", JSON.stringify(filterState));
	}, [filterState, inputValue, models, selectedItem, onModelSelection]);

	const toggleFilter = (tag: string, event: React.MouseEvent) => {
		setFilterState((prev) => {
			const currentState = prev[tag];
			let newState = { ...prev };

			// If shift is not pressed, clear other selections when selecting a new filter
			if (!event.shiftKey && currentState === null) {
				// Reset all filters to null
				newState = Object.keys(prev).reduce((acc, key) => {
					acc[key] = null;
					return acc;
				}, {} as FilterState);
			}

			// Toggle the clicked filter
			if (currentState === null) {
				newState[tag] = "show";
			} else if (currentState === "show") {
				newState[tag] = "hide";
			} else {
				newState[tag] = null;
			}

			return newState;
		});
	};

	const {
		isOpen,
		getToggleButtonProps,
		getLabelProps,
		getMenuProps,
		getInputProps,
		highlightedIndex,
		getItemProps,
	} = useCombobox({
		inputValue,
		items: inputItems,
		itemToString: (item) => item?.name || "",
		onInputValueChange: ({ inputValue, type }) => {
			if (type === useCombobox.stateChangeTypes.InputChange) {
				setInputValue(inputValue || "");
			}
		},
		onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
			// Update parent state
			onModelSelection(newSelectedItem);

			// Update local state
			setSelectedItem(newSelectedItem);

			// Blur search to reset filtering
			inputRef.current?.blur();
		},
	});

	return (
		<div className="relative">
			<div className="mb-1">
				<div className="flex justify-between items-center mb-1">
					{/* biome-ignore lint/a11y/noLabelWithoutControl: it's fine */}
					<label {...getLabelProps()} className="font-semibold text-sm">
						Model
					</label>
					<div className="flex space-x-1">
						{Object.keys(filterState).map((tag) => (
							<button
								type="button"
								key={tag}
								onClick={(e) => toggleFilter(tag, e)}
								className={`text-[10px] px-2 py-1 rounded-full border ${
									filterState[tag] === "show"
										? "bg-green-100 border-green-400"
										: filterState[tag] === "hide"
											? "bg-red-100 border-red-400"
											: "bg-transparent border-transparent text-gray-400"
								}`}
							>
								{tag}
								{filterState[tag] === "show" && " ✓"}
								{filterState[tag] === "hide" && " ✗"}
							</button>
						))}
					</div>
				</div>
			</div>
			<div className="bg-white flex justify-between cursor-pointer w-full border border-gray-200 p-3 rounded-md relative">
				<input
					className="absolute left-3 top-3 right-3 bg-transparent outline-none"
					{...getInputProps({ ref: inputRef })}
					onBlur={() => {
						setInputValue("");
					}}
				/>
				{inputValue || !selectedItem ? <span /> : <ModelRow model={selectedItem} />}
				<span className="px-2" {...getToggleButtonProps()}>
					{/** biome-ignore lint/complexity/noUselessFragments: it's fine */}
					{isOpen ? <>&#8593;</> : <>&#8595;</>}
				</span>
			</div>
			<ul
				className={`absolute left-0 right-0 bg-white mt-1 border border-gray-200 px-2 py-2 rounded-md shadow-lg max-h-80 overflow-scroll z-10 ${
					!isOpen && "hidden"
				}`}
				{...getMenuProps()}
			>
				{isOpen && inputItems.length === 0 && (
					<li className={"py-2 px-3 flex flex-col rounded-md"}>No models found</li>
				)}
				{isOpen &&
					inputItems.map((item, index) => (
						<li
							className={`py-2 px-3 flex flex-col rounded-md ${
								selectedItem === item && "font-bold"
							} ${highlightedIndex === index && "bg-gray-100"}`}
							key={item.id}
							{...getItemProps({ index, item })}
						>
							<ModelRow model={item} />
						</li>
					))}
			</ul>
		</div>
	);
};

export default ModelSelector;
