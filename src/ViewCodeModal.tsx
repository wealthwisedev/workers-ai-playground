/** biome-ignore-all lint/a11y/noStaticElementInteractions: it's fine */
import type { UIMessage } from "ai";
import type { Params } from "./App";

const createMessageString = (
	messages: UIMessage[],
	params: Params,
) => `const stream = await env.AI.run("${params.model}", {
  stream: true,
  max_tokens: ${params.max_tokens},${params.lora ? `\n  lora: "${params.lora}",` : ""}
  messages: [\n${messages
		.map((message) => `    { role: "${message.role}", content: "${message.content}"}`)
		.join(",\n")}
  ],
});

return new Response(stream, {
  headers: { "content-type": "text/event-stream" },
});`;

const ViewCodeModal = ({
	visible,
	handleHide,
	params,
	messages,
}: {
	visible: boolean;
	handleHide: (e: React.MouseEvent<HTMLDivElement>) => void;
	params: Params;
	messages: UIMessage[];
}) => {
	if (!visible) return null;

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: it's fine
		<div
			onClick={handleHide}
			className="fixed top-0 left-0 bottom-0 right-0 bg-[rgba(255,255,255,0.5)] backdrop-blur-sm z-20 flex md:items-center md:justify-center items-end md:p-16"
		>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: it's fine */}
			<div
				onClick={(e) => {
					e.stopPropagation();
				}}
				className="bg-white shadow-xl rounded-md md:max-w-2xl w-full p-6"
			>
				<h2 className="font-semibold text-xl flex items-center">
					View code {/* biome-ignore lint/a11y/useKeyWithClickEvents: it's fine */}
					<div
						onClick={handleHide}
						className="ml-auto text-4xl text-gray-400 font-thin cursor-pointer"
					>
						×
					</div>
				</h2>
				<p className="mt-2 text-gray-500">
					You can use the following code to{" "}
					<a
						className="text-blue-500 underline"
						href="https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/"
					>
						deploy a Workers AI Worker
					</a>{" "}
					using the current playground messages and settings.
				</p>

				<pre className="text-sm py-4 px-3 bg-gray-100 rounded-sm my-4 overflow-auto max-h-[300px]">
					{createMessageString(messages, params)}
				</pre>
			</div>
		</div>
	);
};

export default ViewCodeModal;
