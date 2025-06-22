/** biome-ignore-all lint/nursery/useUniqueElementIds: it's finr */
import { useEffect, useRef, useState } from "react";
import { type UseMcpResult, useMcp } from "use-mcp/react";

// MCP Connection wrapper that only renders when active
function McpConnection({
	serverUrl,
	headerKey,
	bearerToken,
	onConnectionUpdate,
}: {
	serverUrl: string;
	headerKey?: string;
	bearerToken?: string;
	onConnectionUpdate: (data: ConnectionData) => void;
}) {
	// Build custom headers object
	const customHeaders = headerKey && bearerToken ? { [headerKey]: `Bearer ${bearerToken}` } : {};

	// Use the MCP hook with the server URL
	const connection = useMcp({
		autoRetry: false,
		customHeaders,
		debug: true,
		popupFeatures: "width=500,height=600,resizable=yes,scrollbars=yes",
		url: serverUrl,
	});

	// Update parent component with connection data
	useEffect(() => {
		onConnectionUpdate(connection);
	}, [connection, onConnectionUpdate]);

	// Return null as this is just a hook wrapper
	return null;
}

type ConnectionData = Omit<UseMcpResult, "state"> & {
	state: "not-connected" | UseMcpResult["state"];
};

export function McpServers({ onToolsUpdate }: { onToolsUpdate?: (tools: any[]) => void }) {
	const [serverUrl, setServerUrl] = useState(() => {
		return sessionStorage.getItem("mcpServerUrl") || "";
	});
	const [isActive, setIsActive] = useState(false);
	const [showSettings, setShowSettings] = useState(true);
	const [connectionData, setConnectionData] = useState<ConnectionData>({
		authenticate: () => Promise.resolve(undefined),
		authUrl: undefined,
		callTool: (_name: string, _args?: Record<string, unknown>) => Promise.resolve(undefined),
		clearStorage: () => {},
		disconnect: () => {},
		error: undefined,
		log: [],
		retry: () => {},
		state: "not-connected",
		tools: [],
	});
	const logRef = useRef<HTMLDivElement>(null);
	const [showAuth, setShowAuth] = useState<boolean>(false);
	const [headerKey, setHeaderKey] = useState<string>(() => {
		return sessionStorage.getItem("mcpHeaderKey") || "Authorization";
	});
	const [bearerToken, setBearerToken] = useState<string>(() => {
		return sessionStorage.getItem("mcpBearerToken") || "";
	});
	const [showToken, setShowToken] = useState<boolean>(false);

	// Extract connection properties
	const {
		state,
		tools,
		error,
		log,
		authUrl,
		retry: _retry,
		disconnect,
		authenticate,
	} = connectionData;

	// Notify parent component when tools change
	useEffect(() => {
		if (onToolsUpdate && tools.length > 0) {
			onToolsUpdate(
				tools.map((t) => ({
					...t,
					callTool: (args: Record<string, unknown>) =>
						connectionData.callTool(t.name, args),
				})),
			);
		}
	}, [tools, onToolsUpdate, connectionData.callTool]);

	// Handle connection
	const handleConnect = () => {
		setIsActive(true);
	};

	// Handle disconnection
	const handleDisconnect = () => {
		disconnect();
		setIsActive(false);
		setConnectionData({
			authenticate: () => Promise.resolve(undefined),
			authUrl: undefined,
			callTool: (_name: string, _args?: Record<string, unknown>) =>
				Promise.resolve(undefined),
			clearStorage: () => {},
			disconnect: () => {},
			error: undefined,
			log: [],
			retry: () => {},
			state: "not-connected",
			tools: [],
		});
	};

	const handleConnectionUpdate = (data: ConnectionData) => {
		setConnectionData(data);
		if (data.state === "failed") setIsActive(false);
	};

	// Handle authentication if popup was blocked
	const handleManualAuth = async () => {
		try {
			await authenticate();
		} catch (err) {
			console.error("Authentication error:", err);
		}
	};

	// Auto-scroll log to bottom
	useEffect(() => {
		if (logRef.current) {
			logRef.current.scrollTop = logRef.current.scrollHeight;
		}
	}, []);

	// Generate status badge based on connection state
	const getStatusBadge = () => {
		const states = {
			discovering: {
				colors: "bg-blue-100 text-blue-800",
				label: "Discovering",
			},
			authenticating: {
				colors: "bg-purple-100 text-purple-800",
				label: "Authenticating",
			},
			connecting: {
				colors: "bg-yellow-100 text-yellow-800",
				label: "Connecting",
			},
			loading: {
				colors: "bg-orange-100 text-orange-800",
				label: "Loading",
			},
			ready: {
				colors: "bg-green-100 text-green-800",
				label: "Connected",
			},
			failed: {
				colors: "bg-red-100 text-red-800",
				label: "Failed",
			},
			"not-connected": {
				colors: "bg-gray-100 text-gray-800",
				label: "Not Connected",
			},
		};

		const { colors, label } = states[state] ?? states["not-connected"];

		return (
			<span
				data-testid="status"
				className={`px-2 py-1 rounded-full text-xs font-medium ${colors}`}
			>
				{label}
			</span>
		);
	};

	return (
		<section className="rounded-lg bg-white p-4">
			<div className="flex align-middle">
				<span className="text-lg font-semibold">MCP Servers</span>
				<div className="ml-3 mt-1">
					<a
						href="https://developers.cloudflare.com/agents/guides/remote-mcp-server/"
						target="_blank"
						rel="noopener noreferrer"
						title="Learn more about MCP Servers"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>MCP Servers</title>
							<path
								d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5Z"
								fill="url(#paint0_linear_1012_8647)"
							/>
							<path
								d="M8 3.5C7.58579 3.5 7.25 3.83579 7.25 4.25V8.75C7.25 9.16421 7.58579 9.5 8 9.5C8.41421 9.5 8.75 9.16421 8.75 8.75V4.25C8.75 3.83579 8.41421 3.5 8 3.5Z"
								fill="url(#paint1_linear_1012_8647)"
							/>
							<path
								d="M8 12.5C8.41421 12.5 8.75 12.1642 8.75 11.75C8.75 11.3358 8.41421 11 8 11C7.58579 11 7.25 11.3358 7.25 11.75C7.25 12.1642 7.58579 12.5 8 12.5Z"
								fill="url(#paint2_linear_1012_8647)"
							/>
							<defs>
								<linearGradient
									id="paint0_linear_1012_8647"
									x1="0"
									y1="8"
									x2="16"
									y2="8"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#901475" />
									<stop offset="0.505208" stopColor="#CE2F55" />
									<stop offset="1" stopColor="#FF6633" />
								</linearGradient>
								<linearGradient
									id="paint1_linear_1012_8647"
									x1="7.25"
									y1="6.5"
									x2="8.75"
									y2="6.5"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#901475" />
									<stop offset="0.505208" stopColor="#CE2F55" />
									<stop offset="1" stopColor="#FF6633" />
								</linearGradient>
								<linearGradient
									id="paint2_linear_1012_8647"
									x1="7.25"
									y1="11.75"
									x2="8.75"
									y2="11.75"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#901475" />
									<stop offset="0.505208" stopColor="#CE2F55" />
									<stop offset="1" stopColor="#FF6633" />
								</linearGradient>
							</defs>
						</svg>
					</a>
				</div>
				<button
					type="button"
					className="ml-auto rounded-md border border-gray-200 px-2 py-1 -mt-1"
					onClick={() => setShowSettings(!showSettings)}
				>
					<svg
						width="22"
						height="22"
						viewBox="0 0 22 22"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>Settings</title>
						<path
							d="M11.0001 7.5625C10.3202 7.5625 9.65558 7.76411 9.09029 8.14182C8.52499 8.51954 8.0844 9.05641 7.82422 9.68453C7.56405 10.3126 7.49597 11.0038 7.62861 11.6706C7.76125 12.3374 8.08864 12.9499 8.56938 13.4307C9.05012 13.9114 9.66263 14.2388 10.3294 14.3714C10.9962 14.5041 11.6874 14.436 12.3155 14.1758C12.9437 13.9157 13.4805 13.4751 13.8582 12.9098C14.236 12.3445 14.4376 11.6799 14.4376 11C14.4376 10.0883 14.0754 9.21398 13.4307 8.56932C12.7861 7.92466 11.9117 7.5625 11.0001 7.5625ZM11.0001 13.0625C10.5921 13.0625 10.1934 12.9415 9.8542 12.7149C9.51502 12.4883 9.25066 12.1662 9.09456 11.7893C8.93845 11.4124 8.89761 10.9977 8.97719 10.5976C9.05677 10.1975 9.2532 9.83004 9.54165 9.54159C9.8301 9.25315 10.1976 9.05671 10.5977 8.97713C10.9978 8.89755 11.4125 8.93839 11.7893 9.0945C12.1662 9.2506 12.4883 9.51496 12.715 9.85414C12.9416 10.1933 13.0626 10.5921 13.0626 11C13.0626 11.547 12.8453 12.0716 12.4585 12.4584C12.0717 12.8452 11.5471 13.0625 11.0001 13.0625Z"
							fill="#797979"
						/>
						<path
							d="M17.1532 11L19.7107 8.52844L17.4832 4.67156L14.1351 5.63062L13.2379 2.0625H8.76912L7.90631 5.63062L4.53756 4.67156L2.31006 8.53187L4.88131 11.0172L2.31006 13.5059L4.53756 17.3628L7.90631 16.4003L8.78287 19.9375H13.2516L14.1351 16.4106L17.5244 17.38L19.7554 13.5231L17.1532 11ZM16.8438 15.7472L13.8429 14.8844L12.9216 15.5203L12.1654 18.5625H9.85537L9.09912 15.5375L8.20881 14.8844L5.19068 15.7472L4.03568 13.75L6.28381 11.5775V10.4637L4.03568 8.28781L5.19068 6.28719L8.21225 7.15344L9.10256 6.44187L9.85537 3.4375H12.1654L12.9216 6.45563L13.8085 7.16719L16.8438 6.28719L17.9988 8.28781L15.7472 10.4637L15.7816 11.5741L18.0126 13.75L16.8438 15.7472Z"
							fill="#797979"
						/>
					</svg>
				</button>
			</div>

			<p className="text-gray-400 text-sm mt-1 mb-4">
				Connect to Model Context Protocol (MCP) servers to access additional AI
				capabilities.
			</p>

			<div className="my-4">
				<div className="flex items-center mb-2">
					{/* biome-ignore lint/a11y/noLabelWithoutControl: eh */}
					<label className="font-semibold text-sm mr-2">Status:</label>
					{getStatusBadge()}
					{error && (
						<span className="ml-2 text-xs text-red-600 truncate max-w-[230px]">
							{error}
						</span>
					)}
				</div>

				<div className="flex space-x-2 mb-4">
					<input
						type="text"
						className="grow p-2 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-300"
						placeholder="Enter MCP server URL"
						value={serverUrl}
						onChange={(e) => {
							const newValue = e.target.value;
							setServerUrl(newValue);
							sessionStorage.setItem("mcpServerUrl", newValue);
						}}
						disabled={isActive && state !== "failed"}
					/>
					{state === "ready" ||
					(isActive && state !== "not-connected" && state !== "failed") ? (
						<button
							type="button"
							className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-md text-sm font-medium shadow-sm"
							onClick={handleDisconnect}
						>
							Disconnect
						</button>
					) : (
						<button
							type="button"
							className="bg-ai-loop bg-size-[200%_100%] hover:animate-gradient-background text-white rounded-md shadow-sm py-2 px-4 text-sm"
							onClick={handleConnect}
							disabled={isActive}
						>
							Connect
						</button>
					)}
				</div>

				{/* Custom Authentication Section */}
				<div className="border border-gray-200 rounded-md bg-gray-50">
					<button
						className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 rounded-md transition-colors"
						onClick={() => setShowAuth(!showAuth)}
						type="button"
					>
						<div className="flex items-center space-x-2">
							<svg
								className="w-4 h-4 text-gray-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Auth</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
							<span className="text-sm font-medium text-gray-700">
								Authentication (Optional)
							</span>
						</div>
						<svg
							className={`w-4 h-4 text-gray-500 transform transition-transform ${
								showAuth ? "rotate-180" : ""
							}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>expand</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>

					{showAuth && (
						<div className="px-3 pb-3 space-y-3 border-t border-gray-200 bg-white rounded-b-md">
							<div>
								{/* biome-ignore lint/a11y/noLabelWithoutControl: eh */}
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Header Name
								</label>
								<input
									type="text"
									className="w-full p-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-300"
									placeholder="e.g., Authorization, X-API-Key, API-Key"
									value={headerKey}
									onChange={(e) => {
										const newValue = e.target.value;
										setHeaderKey(newValue);
										sessionStorage.setItem("mcpHeaderKey", newValue);
									}}
									disabled={isActive && state !== "failed"}
								/>
							</div>

							<div>
								{/* biome-ignore lint/a11y/noLabelWithoutControl: eh */}
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Bearer Value
								</label>
								<div className="relative">
									<input
										type={showToken ? "text" : "password"}
										className="w-full p-2 pr-10 border border-gray-200 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-300"
										placeholder="Enter header value (API key, token, etc.)"
										value={bearerToken}
										onChange={(e) => {
											const newValue = e.target.value;
											setBearerToken(newValue);
											sessionStorage.setItem("mcpBearerToken", newValue);
										}}
										disabled={isActive && state !== "failed"}
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
										onClick={() => setShowToken(!showToken)}
									>
										<svg
											className="w-4 h-4 text-gray-400 hover:text-gray-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>show token</title>
											{showToken ? (
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
												/>
											) : (
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											)}
										</svg>
									</button>
								</div>
							</div>

							{headerKey && bearerToken && (
								<div className="text-xs text-gray-500 flex items-start space-x-1">
									<svg
										className="w-3 h-3 mt-0.5 flex-shrink-0"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<title>header</title>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
											clipRule="evenodd"
										/>
									</svg>
									<span>
										Header will be sent as "{headerKey}: Bearer REDACTED"
									</span>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Authentication Link if needed */}
				{authUrl && (
					<div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
						<p className="text-sm mb-2">
							Authentication required. Please click the link below:
						</p>
						<a
							href={authUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-orange-700 hover:text-orange-800 underline"
							onClick={handleManualAuth}
						>
							Authenticate in new window
						</a>
					</div>
				)}

				{/* Tools display when connected */}
				{state === "ready" && tools.length > 0 && (
					<div className="mb-4">
						<div className="flex items-center mb-1">
							<h3 className="font-semibold text-sm">
								Available Tools ({tools.length})
							</h3>
						</div>
						<div className="border border-gray-200 rounded-md p-2 bg-gray-50 max-h-32 overflow-y-auto">
							{tools.map((tool, index) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: it's fine
									key={index}
									className="text-sm py-1 border-b border-gray-100 last:border-b-0"
								>
									<span className="font-medium">{tool.name}</span>
									{tool.description && (
										<p className="text-xs text-gray-500 mt-1">
											{tool.description}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Debug Log */}
				<div className={showSettings ? "block" : "hidden"}>
					{/* biome-ignore lint/a11y/noLabelWithoutControl: eh */}
					<label className="font-semibold text-sm block mb-1">Debug Log</label>
					<div
						ref={logRef}
						className="border border-gray-200 rounded-md p-2 bg-gray-50 h-40 overflow-y-auto font-mono text-xs"
					>
						{log.length > 0 ? (
							log.map((entry, index) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: it's fine
									key={index}
									className={`py-0.5 ${
										entry.level === "debug"
											? "text-gray-500"
											: entry.level === "info"
												? "text-blue-600"
												: entry.level === "warn"
													? "text-orange-600"
													: "text-red-600"
									}`}
								>
									[{entry.level}] {entry.message}
								</div>
							))
						) : (
							<div className="text-gray-400">No log entries yet</div>
						)}
					</div>
					{connectionData?.state === "not-connected" ? null : (
						<button
							type="button"
							onClick={() => {
								connectionData?.clearStorage();
								if (isActive) {
									handleDisconnect();
								}
							}}
							className="text-xs text-orange-600 hover:text-orange-800 hover:underline mt-1"
						>
							Clear stored authentication
						</button>
					)}
				</div>
			</div>

			{/* Only render the actual MCP connection when active */}
			{isActive && (
				<McpConnection
					serverUrl={serverUrl}
					headerKey={headerKey}
					bearerToken={bearerToken}
					onConnectionUpdate={handleConnectionUpdate}
				/>
			)}
		</section>
	);
}
