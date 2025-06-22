# Workers AI Playground

Welcome to the Workers AI Playground! This project is designed to provide a user-friendly interface for interacting with AI models and exploring their capabilities. The playground allows you to connect to Model Context Protocol (MCP) servers, manage AI tools, and run AI models with ease.

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/ai/tree/main/playground/ai)

## Features

- **Connect to MCP Servers**: Easily connect to MCP servers to access additional AI capabilities.
- **Dynamic UI**: The interface is built using React and Tailwind CSS, providing a responsive and modern user experience.
- **Tool Management**: View and manage available AI tools when connected to an MCP server.
- **Authentication**: Supports authentication for secure access to MCP servers.
- **Interactive Messaging**: Send messages and receive AI-generated responses in real-time.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/cloudflare/ai.git
   pnpm i
   ```

2. Start the development server:

   ```bash
   cd playground/ai && npm start
   ```

3. Open your browser and navigate to `http://localhost:5173` to access the playground.

## Configuration

The project uses Tailwind CSS for styling. You can customize the theme and other configurations in the `tailwind.config.ts` file.

## Usage

- **Connect to a Server**: Enter the MCP server URL and click "Connect" to establish a connection.
- **Manage Tools**: Once connected, view and interact with available AI tools.
- **Send Messages**: Use the input field to send messages and receive AI responses.

## Generate list of models

Running `./scripts/fetch-models.ts` will generate the `src/models.json` file. Populate `scripts/.env` with your Cloudflare API token and account ID before doing so.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Thanks to the contributors and the open-source community for their support and collaboration.

Enjoy exploring the capabilities of AI with the Workers AI Playground!
